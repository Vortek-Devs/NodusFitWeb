import type { ProblemDetails } from "@/lib/contracts/problem-details";

const PROBLEMS = {
  SESSION_REQUIRED: ["Autenticação necessária.", "Entre novamente para continuar."],
  AUTH_BRIDGE_UNAVAILABLE: ["Ponte de autenticação indisponível.", "Tente novamente."],
  NODUS_API_NOT_CONFIGURED: ["Serviço indisponível.", "A API não está configurada."],
  BACKEND_UNAVAILABLE: [
    "Serviço indisponível.",
    "Não foi possível conectar à API. Tente novamente.",
  ],
  INVALID_BACKEND_PATH: ["Requisição inválida.", "O caminho solicitado não é válido."],
  INVITE_TOKEN_REQUIRED: ["Convite necessário.", "Informe um token de convite válido."],
  INVALID_REQUEST: ["Requisição inválida.", "Envie um corpo JSON válido."],
} as const;

export function problemResponse(
  request: Request,
  status: number,
  code: keyof typeof PROBLEMS,
) {
  const traceId = crypto.randomUUID().replaceAll("-", "");
  const [title, detail] = PROBLEMS[code];
  // Invitation URLs contain a credential, never reflect it in an error.
  const instance = new URL(request.url).pathname.replace(
    /^(\/api\/(?:mobile\/public\/invites|(?:mobile\/)?backend\/v1\/invites))\/.*$/,
    "$1/[token]",
  );
  return Response.json(
    {
      type: "about:blank",
      title,
      status,
      detail,
      instance,
      code,
      traceId,
    } satisfies ProblemDetails,
    {
      status,
      headers: {
        "content-type": "application/problem+json",
        "x-correlation-id": traceId,
      },
    },
  );
}
