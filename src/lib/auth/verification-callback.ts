const INVITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export function buildStudentLoginCallback(token?: string) {
  if (!token || !INVITE_TOKEN_PATTERN.test(token)) {
    return "/acesso?perfil=aluno&emailVerificado=1";
  }

  return buildVerificationCallback("aluno", token);
}

export function buildVerificationCallback(role: "personal" | "aluno", token?: string) {
  const params = new URLSearchParams({ perfil: role });
  if (role === "aluno") {
    if (!token || !INVITE_TOKEN_PATTERN.test(token))
      throw new Error("INVITE_TOKEN_INVALID");
    params.set("token", token);
  }
  params.set("emailVerificado", "1");
  return `/acesso?${params.toString()}`;
}
