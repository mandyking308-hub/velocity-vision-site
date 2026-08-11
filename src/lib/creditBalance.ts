export interface CreditLedgerLike {
  delta: number;
  reason: string;
  created_at: string;
}

export interface CreditBalanceSnapshot {
  included: number;
  used: number;
  topupBalance: number;
  remaining: number;
}

/**
 * Mirrors the DB credit snapshot logic. Paid plan grants are cycle-bound;
 * top-ups carry forward and are consumed only after plan credits in each cycle.
 */
export function computeCreditBalance(
  ledger: CreditLedgerLike[],
  opts: { plan: string; periodStart: Date | null; freePreviewExpired: boolean },
): CreditBalanceSnapshot {
  const rows = [...ledger].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const isFree = opts.plan === "free_preview";

  let topupGrants = 0;
  let explicitTopupSpend = 0;
  let freeInc = 0;
  let freeSpend = 0;
  for (const row of rows) {
    if (["topup", "stripe_topup", "qa_manual_grant", "manual_grant"].includes(row.reason)) topupGrants += Math.max(0, row.delta);
    else if (row.reason === "paid_topup_spend") explicitTopupSpend += Math.max(0, -row.delta);
    else if (["free_welcome_grant", "free_daily_grant"].includes(row.reason)) freeInc += Math.max(0, row.delta);
    else if (row.reason === "free_preview_spend") freeSpend += Math.max(0, -row.delta);
  }

  if (isFree) {
    const freeNet = opts.freePreviewExpired ? 0 : Math.max(0, freeInc - freeSpend);
    const topupNet = Math.max(0, topupGrants - explicitTopupSpend);
    return {
      included: opts.freePreviewExpired ? 0 : freeInc,
      used: opts.freePreviewExpired ? 0 : freeSpend,
      topupBalance: topupNet,
      remaining: freeNet + topupNet,
    };
  }

  const grants = rows.filter((r) => r.reason === "plan_grant" && r.delta > 0);
  let topupConsumedByPlanOverage = 0;
  for (let i = 0; i < grants.length; i++) {
    const start = new Date(grants[i].created_at).getTime();
    const end = i + 1 < grants.length ? new Date(grants[i + 1].created_at).getTime() : Infinity;
    const grant = grants[i].delta;
    const spend = rows
      .filter((r) => r.reason.startsWith("spend_") && new Date(r.created_at).getTime() >= start && new Date(r.created_at).getTime() < end)
      .reduce((sum, r) => sum + Math.max(0, -r.delta), 0);
    topupConsumedByPlanOverage += Math.max(0, spend - grant);
  }

  const startMs = opts.periodStart?.getTime() ?? Infinity;
  const currentIncluded = rows
    .filter((r) => r.reason === "plan_grant" && new Date(r.created_at).getTime() >= startMs)
    .reduce((sum, r) => sum + Math.max(0, r.delta), 0);
  const currentSpend = rows
    .filter((r) => r.reason.startsWith("spend_") && new Date(r.created_at).getTime() >= startMs)
    .reduce((sum, r) => sum + Math.max(0, -r.delta), 0);
  const currentPlanNet = Math.max(0, currentIncluded - currentSpend);
  const topupNet = Math.max(0, topupGrants - explicitTopupSpend - topupConsumedByPlanOverage);

  return {
    included: currentIncluded,
    used: currentSpend,
    topupBalance: topupNet,
    remaining: currentPlanNet + topupNet,
  };
}
