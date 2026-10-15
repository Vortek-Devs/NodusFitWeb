import type { ProblemDetails } from "@/lib/contracts/problem-details";
import { isRecord } from "@/lib/contracts/students";

export class NodusApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly traceId?: string;
  constructor(readonly problem: ProblemDetails) {
    super(problem.detail || problem.title);
    this.name = "NodusApiError";
    this.status = problem.status;
    this.code = problem.code;
    this.traceId = problem.traceId;
  }
}

function readFieldErrors(value: unknown): Record<string, string[]> | undefined {
  if (!isRecord(value)) return undefined;
  const entries = Object.entries(value).filter(
    (entry): entry is [string, string[]] =>
      entry[0].length > 0 &&
      Array.isArray(entry[1]) &&
      entry[1].length > 0 &&
      entry[1].every((message) => typeof message === "string"),
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function readTraceId(value: unknown): string | undefined {
  return typeof value === "string" && /^[A-Za-z0-9._-]{1,128}$/.test(value)
    ? value
    : undefined;
}

export function readProblemDetails(
  value: unknown,
  status: number,
  correlationId?: string | null,
): ProblemDetails {
  const item = isRecord(value) ? value : {};
  return {
    type: typeof item.type === "string" ? item.type : "about:blank",
    title: typeof item.title === "string" ? item.title : "Falha na solicitação.",
    status,
    detail:
      typeof item.detail === "string"
        ? item.detail
        : "Não foi possível concluir a solicitação.",
    instance: typeof item.instance === "string" ? item.instance : "",
    code: typeof item.code === "string" ? item.code : "UPSTREAM_REQUEST_FAILED",
    traceId: readTraceId(item.traceId) ?? readTraceId(correlationId),
    errors: readFieldErrors(item.errors),
  };
}

export async function nodusApiRequest<T>(
  path: string,
  guard: (value: unknown) => value is T,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  const response = await fetch(`/api/backend/${path.replace(/^\//, "")}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    init.signal?.throwIfAborted();
    if (error instanceof Error && error.name === "AbortError") throw error;
    payload = null;
  }
  init.signal?.throwIfAborted();
  if (!response.ok)
    throw new NodusApiError(
      readProblemDetails(
        payload,
        response.status,
        response.headers.get("x-correlation-id"),
      ),
    );
  if (!guard(payload))
    throw new NodusApiError({
      type: "about:blank",
      title: "Resposta inválida da API.",
      status: 502,
      detail: "O serviço retornou um contrato inesperado.",
      instance: path,
      code: "INVALID_API_RESPONSE",
      traceId: readTraceId(response.headers.get("x-correlation-id")),
    });
  return payload;
}
