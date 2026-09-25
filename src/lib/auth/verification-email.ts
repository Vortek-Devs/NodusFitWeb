import { createHash } from "node:crypto";

export class VerificationEmailError extends Error {
  constructor(readonly code: "EMAIL_DELIVERY_NOT_CONFIGURED" | "EMAIL_DELIVERY_FAILED") {
    super(code);
    this.name = "VerificationEmailError";
  }
}

export async function sendNodusVerificationEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  const authBaseUrl = process.env.BETTER_AUTH_URL;
  if (!apiKey || !from || !authBaseUrl) {
    throw new VerificationEmailError("EMAIL_DELIVERY_NOT_CONFIGURED");
  }

  try {
    const verificationUrl = new URL(url);
    const baseUrl = new URL(authBaseUrl);
    if (
      ![verificationUrl, baseUrl].every(
        (value) =>
          ["http:", "https:"].includes(value.protocol) &&
          !value.username &&
          !value.password,
      ) ||
      verificationUrl.origin !== baseUrl.origin
    ) {
      throw new VerificationEmailError("EMAIL_DELIVERY_FAILED");
    }

    const digest = createHash("sha256").update(url, "utf8").digest("hex");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "idempotency-key": `nodus-email-verification-${digest}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Confirme seu e-mail no Nodus Fit",
        text: `Confirme seu e-mail no Nodus Fit: ${url}`,
        html: renderVerificationEmail(url),
      }),
    });
    if (!response.ok) throw new VerificationEmailError("EMAIL_DELIVERY_FAILED");
  } catch {
    throw new VerificationEmailError("EMAIL_DELIVERY_FAILED");
  }
}

function renderVerificationEmail(url: string) {
  const safeUrl = url
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#F0FBF8;color:#04342C;font-family:Arial,sans-serif">
    <main style="max-width:560px;margin:0 auto;padding:32px 20px">
      <section style="background:#FFFFFF;border-radius:12px;padding:24px">
        <h1 style="margin:0 0 12px;font-size:24px">Confirme seu e-mail</h1>
        <p style="line-height:1.5">Use o botão para concluir seu acesso ao Nodus Fit.</p>
        <p style="margin:24px 0">
          <a href="${safeUrl}" style="display:inline-block;border-radius:8px;background:#3DD9A4;color:#04342C;padding:12px 18px;line-height:20px;font-weight:700;text-decoration:none">Confirmar e-mail</a>
        </p>
        <p style="font-size:13px;line-height:1.5;word-break:break-all">${safeUrl}</p>
      </section>
    </main>
  </body>
</html>`;
}
