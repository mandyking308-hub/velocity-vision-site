// Thin nodemailer wrapper for Deno edge runtime.
import nodemailer from "npm:nodemailer@6.9.16";

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface SendArgs {
  fromEmail: string;
  fromName?: string | null;
  to: string;
  subject: string;
  body: string;
}

export async function smtpSend(cfg: SmtpConfig, args: SendArgs) {
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.username, pass: cfg.password },
  });
  const from = args.fromName ? `"${args.fromName}" <${args.fromEmail}>` : args.fromEmail;
  const info = await transporter.sendMail({
    from,
    to: args.to,
    subject: args.subject,
    text: args.body,
    html: args.body.replace(/\n/g, "<br/>"),
  });
  return info;
}

export async function smtpVerify(cfg: SmtpConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    const t = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.username, pass: cfg.password },
    });
    await t.verify();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
