import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let localRoot = dirname(dirname(fileURLToPath(import.meta.url)));
while (
  !existsSync(resolve(localRoot, "NodusAPI")) ||
  !existsSync(resolve(localRoot, "nodusfit"))
) {
  const parent = dirname(localRoot);
  if (parent === localRoot) throw new Error("Workspace Nodus não encontrado.");
  localRoot = parent;
}
const credentialsPath = resolve(localRoot, "LOCAL_DEMO_CREDENTIALS.md");
const password = readFileSync(credentialsPath, "utf8").match(/^Senha: `([^`]+)`$/m)?.[1];
if (!password) throw new Error("Credenciais locais ausentes ou inválidas.");

const origin = "http://localhost:3000";

async function login(email) {
  const response = await fetch(`${origin}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Login ${email}: HTTP ${response.status}`);
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  if (!cookie) throw new Error(`Login ${email}: sessão ausente.`);
  return cookie;
}

async function get(path, cookie) {
  const response = await fetch(`${origin}${path}`, { headers: { cookie } });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(`${path}: HTTP ${response.status} ${body?.code ?? ""}`);
  }
  return response.json();
}

const personalCookie = await login("demo.personal@nodus.test");
const session = await get("/api/auth/get-session", personalCookie);
if (session.user?.email !== "demo.personal@nodus.test") {
  throw new Error("Sessão BetterAuth demo ausente.");
}
const personal = await get("/api/backend/me", personalCookie);
if (personal.user?.role !== "PERSONAL" || personal.onboarding?.required !== false) {
  throw new Error("Perfil personal demo incompleto.");
}
const students = await get("/api/backend/v1/students", personalCookie);
const exercises = await get("/api/backend/v1/exercises", personalCookie);
if (students.totalCount !== 3 || exercises.totalCount !== 6) {
  throw new Error("Listas demo não retornaram 3 alunos e 6 exercícios.");
}
const studentCookie = await login("demo.aluno1@nodus.test");
const student = await get("/api/backend/me", studentCookie);
if (student.user?.role !== "ALUNO" || student.onboarding?.required !== false) {
  throw new Error("Perfil aluno demo incompleto.");
}
process.stdout.write(
  "Smoke local OK: login personal, 3 alunos, 6 exercícios e login aluno.\n",
);
