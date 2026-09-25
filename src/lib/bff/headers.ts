const FORWARDED_REQUEST_HEADERS = new Set(["accept", "content-type", "if-none-match"]);

export function buildBackendHeaders(incoming: Headers, jwt: string): Headers {
  const outgoing = new Headers();

  for (const [name, value] of incoming.entries()) {
    if (FORWARDED_REQUEST_HEADERS.has(name.toLowerCase())) {
      outgoing.set(name, value);
    }
  }

  outgoing.set("authorization", `Bearer ${jwt}`);
  return outgoing;
}
