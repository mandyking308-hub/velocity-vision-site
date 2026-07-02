
# Email OAuth Discovery — Google / Microsoft Connect Flow

Discovery only. No code changes, no schema changes, no removal of the current SMTP flow.

---

## 1. Current flow (confirmed)

- Provider selector in `AppEmailConnections.tsx` offers Gmail / Outlook / Custom SMTP, all going through SMTP + app password.
- Credentials saved by `supabase/functions/email-connection-save/index.ts`:
  - `email_connections` row (non-secret metadata: provider, from_email, smtp_host/port/username, status, workspace_id, is_default, verification fields).
  - Password encrypted with AES-GCM (`EMAIL_ENC_KEY`) via `_shared/email-crypto.ts` and stored in `email_connection_secrets.encrypted_password`.
- Connection status set by SMTP verify (`smtpVerify`) on save. `status = connected|error|pending|reconnect_required`.
- Domain verification is separate: `verify-sender-domain` resolves MX/SPF/DKIM (with strict provider selector / user-configured selector rules) / DMARC, writes `verification_status`, `mx_status`, `spf_status`, `dkim_status`, `dmarc_status`, `dns_checked_at`, and sets `sending_enabled = true` only when all four are valid.
- Send gating:
  - `email-send` and `email-process-queue` load the connection and decrypt the SMTP password — no explicit `sending_enabled` gate in the send functions themselves.
  - `sendSafety.ts` and `AppActivation.tsx` treat sender as authenticated only when `verification_status = 'verified'` AND `sending_enabled = true`. Campaign activation UI blocks send unless this is true.
  - Rate limit enforced in `email-send` (`rate_limit_per_hour`, default 60).

Gap worth flagging (not to fix now): `email-send`/`email-process-queue` don't hard-check `sending_enabled` on the connection row before dispatch. Activation UI is the current gate. Any OAuth work should close this gap server-side.

---

## 2. Google OAuth feasibility

- **Send method:** Gmail API `users.messages.send` (raw RFC 822). Simpler than SMTP-XOAUTH2, no host/port config, works uniformly for Gmail and Workspace.
- **Scope:** `https://www.googleapis.com/auth/gmail.send` (send-only; no inbox read).
- **Verification:** `gmail.send` is a **restricted scope**. Broad public self-serve requires Google OAuth app verification + CASA security assessment (annual). Until verified: capped at ~100 test users. This is a real gating step for public launch.
- **Google Cloud setup:** GCP project → enable Gmail API → OAuth consent screen (External, brand info, scope justification, homepage / privacy / terms URLs — already published) → OAuth Client ID (Web).
- **Redirect URIs (all environments):**
  - `https://velocity-outreach.com/app/settings/email/oauth/google/callback`
  - `https://www.velocity-outreach.com/app/settings/email/oauth/google/callback`
  - `https://velocity-vision-site.lovable.app/app/settings/email/oauth/google/callback`
  - Any preview `*.lovable.app` domain used for QA (Google requires exact match — preview URLs are unstable, so use a stable staging domain or route callback through an Edge Function).
- **Preferred pattern:** callback handled by a Supabase Edge Function (`email-oauth-google-callback`) at a fixed backend URL, then redirect to app. Keeps redirect URI list small.
- **Env vars:** `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`.
- **Token storage:** extend `email_connection_secrets` (or add columns) — `encrypted_refresh_token`, `encrypted_access_token`, `token_expires_at`. Encrypted with existing `EMAIL_ENC_KEY` (AES-GCM already proven).
- **Refresh:** server-side, on demand, before each send if `token_expires_at < now + 60s`. Refresh failure → mark `status = 'reconnect_required'`, block send.
- **Disconnect / revoke:** call `https://oauth2.googleapis.com/revoke` with refresh token, then delete secrets row + set connection status.
- **workspace_id:** attached the same way SMTP connections attach today (from active workspace, passed through OAuth `state` param, validated on callback).

---

## 3. Microsoft OAuth feasibility

- **Send method:** Microsoft Graph `POST /me/sendMail`. SMTP-OAUTH2 exists but many tenants disable SMTP AUTH — Graph is more reliable.
- **App registration:** Entra ID → App registration (multi-tenant + personal Microsoft accounts) → Web platform with redirect URI → certificates & secrets → API permissions.
- **Permissions/scopes:** delegated `Mail.Send` + `offline_access` (+ `openid profile email` for identity). Send-only, no inbox access.
- **Admin consent:** `Mail.Send` is normally user-consentable, but some corporate tenants lock consent to admins. UI needs a clear "ask your admin to approve" error state.
- **Redirect URIs:** same set as Google. Entra supports multiple redirect URIs cleanly; one callback URL per environment via Edge Function is still cleanest.
- **Env vars:** `MS_OAUTH_CLIENT_ID`, `MS_OAUTH_CLIENT_SECRET`, `MS_OAUTH_TENANT` (= `common`), `MS_OAUTH_REDIRECT_URI`.
- **Token storage / encryption / refresh / disconnect / workspace_id:** identical model to Google. Refresh via `https://login.microsoftonline.com/common/oauth2/v2.0/token`. Disconnect = delete stored tokens (Microsoft has no standard revoke endpoint; user can revoke in myapps.microsoft.com).

---

## 4. Database impact

Existing `email_connections` can support OAuth **with additive columns only** — no destructive change, no risk to existing SMTP rows.

Proposed additions (all nullable, backfilled `smtp` for existing rows):

- `auth_type` text — `'smtp' | 'oauth'`
- `oauth_provider` text — `'google' | 'microsoft' | null`
- `oauth_account_id` text — provider `sub`/`oid` for uniqueness
- `oauth_scopes` text[]
- `token_status` text — `active | expired | revoked | reconnect_required`
- `token_expires_at` timestamptz
- `connected_via` text — `smtp | oauth_google | oauth_microsoft`

`email_connection_secrets` — additive columns:

- `encrypted_refresh_token` text
- `encrypted_access_token` text
- `token_expires_at` timestamptz

Existing `encrypted_password` remains for SMTP rows. No breakage.

Migration is required but low risk (nullable adds + one backfill). RLS policies unchanged; scoping already by `user_id` + `workspace_id`.

---

## 5. UI impact (`/app/settings/email`)

- Primary panel: two buttons — **Connect with Google** and **Connect with Microsoft**.
- Secondary link: **Advanced: use SMTP / app password** — opens the current dialog unchanged.
- Existing SMTP connections continue to render exactly as today (badges, DNS pills, DKIM selector prompt).
- OAuth-connected senders show:
  - `Inbox connected` badge (from `status`).
  - Domain verification badge (unchanged — still driven by `verify-sender-domain`).
  - `Sending enabled` / `Sending disabled` (unchanged).
  - Extra pill for `Google` / `Microsoft` provider identity.
- Error surfaces: consent denied, admin approval required (Microsoft), token expired / revoked → "Reconnect" CTA re-runs OAuth.

---

## 6. Sender / domain verification (unchanged)

- DNS verification (MX/SPF/DKIM/DMARC) remains mandatory after OAuth connection.
- OAuth connection alone does **not** enable sending — same `sending_enabled` truth model.
- `sending_enabled = true` only when `verification_status = 'verified'` AND all four DNS checks valid — same rule for both SMTP and OAuth senders.
- Google note: sending via `gmail.send` from a Workspace domain still requires that domain's SPF/DKIM/DMARC to pass. Gmail auto-DKIM-signs `@gmail.com`, but our verify function already handles the `smtp.gmail.com` provider selector case.

---

## 7. Activation / send safety audit

Send-capable surfaces:

- `supabase/functions/email-send/index.ts`
- `supabase/functions/email-process-queue/index.ts`
- Callers: `EmailSequenceSender.tsx`, `LeadActionPanel`, follow-up flows, campaign activation via `AppActivation.tsx`.

Every caller currently checks: connected sender, verified domain (via `sendSafety.ts`), legal acceptance (`LegalComplianceGate`), contact safety, credits, workspace isolation.

**Bypass risk to close during OAuth work (not now):** neither `email-send` nor `email-process-queue` re-checks `sending_enabled` server-side before dispatch. Frontend gates it, but a direct edge invocation would send. OAuth phase should add a server-side `sending_enabled === true && status === 'connected'` guard.

---

## 8. Phased implementation plan

### Phase 1 — Google OAuth (recommended first)

- **Files:** `AppEmailConnections.tsx` (add Connect buttons + provider display), `LeadActionPanel` (unchanged, reads through connection).
- **New edge functions:**
  - `email-oauth-google-start` — builds auth URL, `state` = signed `{user_id, workspace_id, nonce}`.
  - `email-oauth-google-callback` — exchanges code, stores encrypted tokens, upserts `email_connections` row (auth_type=oauth), redirects back to `/app/settings/email`.
  - `email-oauth-refresh` (shared) — refreshes access token, updates secrets.
  - Update `email-send` + `email-process-queue` — branch on `auth_type`: if `oauth`, refresh token if needed, then call Gmail API `users.messages.send`; otherwise SMTP path unchanged. Add server-side `sending_enabled` guard.
- **Migrations:** additive columns on `email_connections` + `email_connection_secrets` as in §4.
- **Env vars:** `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`.
- **External setup by Mandy:** GCP project, enable Gmail API, OAuth consent screen (External, publish justification for restricted `gmail.send`), OAuth Web client, submit for verification (CASA assessment) before public launch.
- **Risks:** Google verification is the blocker for broad self-serve. Until verified, capped at 100 test users. Preview URLs need a single stable callback.
- **Complexity:** medium.
- **Safe for controlled release now:** yes for beta (100-user cap) once Mandy delivers GCP client + verification submitted. Not yet for open self-serve.

### Phase 2 — Microsoft OAuth

- **Files:** `AppEmailConnections.tsx` (add Microsoft button, error states for admin consent).
- **New edge functions:** mirror Google (`email-oauth-microsoft-start`, `email-oauth-microsoft-callback`). Extend send branch to call Graph `sendMail`.
- **Migrations:** none beyond Phase 1.
- **Env vars:** `MS_OAUTH_CLIENT_ID`, `MS_OAUTH_CLIENT_SECRET`, `MS_OAUTH_TENANT=common`, `MS_OAUTH_REDIRECT_URI`.
- **External setup by Mandy:** Entra multi-tenant app registration, redirect URIs, client secret, `Mail.Send` + `offline_access` permissions, publisher verification (recommended, not strictly required for user consent).
- **Risks:** tenant admin-consent lockouts (UX-only), Microsoft publisher verification advisable for trust.
- **Complexity:** medium.
- **Safe for controlled release now:** yes once creds delivered.

### Phase 3 — Keep Advanced SMTP fallback

- **Files:** move current SMTP dialog behind an "Advanced" disclosure in `AppEmailConnections.tsx`. Zero changes to `email-connection-save`, `verify-sender-domain`, encryption, RLS.
- **Complexity:** low.
- **Safe:** yes — additive UI only.

### Phase 4 — QA / hardening

- Server-side `sending_enabled` gate in `email-send` and `email-process-queue`.
- Token refresh failure → `reconnect_required` + UI banner.
- Disconnect flow: revoke (Google) + delete secrets + null token columns.
- Playwright: OAuth start → mock callback → verify DB rows encrypted, no tokens in logs, send blocked until DNS verified.
- Cost/rate: keep existing `rate_limit_per_hour`; Gmail API quota is generous (1 billion units/day, `send` = 100 units), Graph `sendMail` is 30/minute per mailbox — matches our default cap.
- **Complexity:** low–medium.
- **Safe for controlled release:** required before broad launch.

---

## 9. Final answer

- **Can we add OAuth safely without rebuilding the whole email system?** Yes. Additive columns, additive edge functions, existing SMTP path untouched.
- **Recommended first provider:** Google. Larger customer base, most requested, and forces us to complete OAuth verification early (long lead time).
- **Recommended send method:** Gmail API `users.messages.send` for Google; Microsoft Graph `POST /me/sendMail` for Microsoft. Avoid SMTP-XOAUTH2 for both.
- **Current blockers:**
  - No GCP project or Entra app registration exists yet.
  - Google restricted-scope verification lead time (weeks) for open self-serve.
  - Stable non-preview callback URL required for exact-match redirect URIs.
  - `email-send` / `email-process-queue` lack a server-side `sending_enabled` guard — should be closed during Phase 1.
- **Product decisions needed from Mandy:**
  1. Confirm Google-first, Microsoft second.
  2. Confirm send-only scopes (no inbox read, no reply threading) for launch.
  3. Confirm beta launch behind Google's 100-user cap while verification is in flight.
  4. Confirm callback lives at `/app/settings/email/oauth/{provider}/callback` handled by an edge function.
- **External accounts/setup needed from Mandy:**
  - GCP project + Gmail API enabled + OAuth consent screen configured + Web OAuth client + submission for restricted-scope verification (CASA).
  - Entra ID app registration (multi-tenant + personal accounts) + client secret + Mail.Send/offline_access permissions.
  - Client IDs and secrets delivered to Lovable via `add_secret`.
- **Exact implementation prompts needed next:**
  1. "PHASE 1 — Google OAuth email connection (schema + start/callback edge functions + UI button + send branch + sending_enabled server gate)."
  2. "PHASE 2 — Microsoft OAuth email connection (mirror Phase 1 with Graph sendMail)."
  3. "PHASE 3 — Move SMTP behind Advanced in /app/settings/email."
  4. "PHASE 4 — OAuth QA hardening (refresh failure, disconnect/revoke, Playwright OAuth flow, log-safety check)."
- **Final recommendation: PLAN FIRST.** Do not start Phase 1 until Mandy has (a) provisioned the GCP project and delivered the OAuth client ID/secret, and (b) confirmed the beta-cap approach for the Google verification window. Everything else is ready to build safely.
