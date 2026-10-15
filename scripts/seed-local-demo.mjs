import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import pg from "pg";

const { Client } = pg;
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
const personalId = "d0000000-0000-4000-8000-000000000001";
const userIds = [
  "nodus-demo-personal-v1",
  "nodus-demo-aluno-1-v1",
  "nodus-demo-aluno-2-v1",
  "nodus-demo-aluno-3-v1",
];
const accountIds = userIds.map((_, index) => `nodus-demo-account-${index + 1}-v1`);
const studentIds = [11, 12, 13].map(
  (value) => `d0000000-0000-4000-8000-${String(value).padStart(12, "0")}`,
);
const equipmentIds = [21, 22, 23].map(
  (value) => `d0000000-0000-4000-8000-${String(value).padStart(12, "0")}`,
);
const muscleIds = [31, 32, 33].map(
  (value) => `d0000000-0000-4000-8000-${String(value).padStart(12, "0")}`,
);
const exerciseIds = [41, 42, 43, 44, 45, 46].map(
  (value) => `d0000000-0000-4000-8000-${String(value).padStart(12, "0")}`,
);
const people = [
  {
    id: userIds[0],
    name: "Personal Demonstração Nodus",
    email: "demo.personal@nodus.test",
    role: "PERSONAL",
  },
  {
    id: userIds[1],
    name: "Aluno Demo Ana",
    email: "demo.aluno1@nodus.test",
    role: "ALUNO",
  },
  {
    id: userIds[2],
    name: "Aluno Demo Bruno",
    email: "demo.aluno2@nodus.test",
    role: "ALUNO",
  },
  {
    id: userIds[3],
    name: "Aluno Demo Carla",
    email: "demo.aluno3@nodus.test",
    role: "ALUNO",
  },
];
const equipment = [
  { id: equipmentIds[0], code: "DEMO_HALTER", name: "Halter demonstrativo" },
  { id: equipmentIds[1], code: "DEMO_ELASTICO", name: "Elástico demonstrativo" },
  { id: equipmentIds[2], code: "DEMO_COLCHONETE", name: "Colchonete demonstrativo" },
];
const muscles = [
  { id: muscleIds[0], code: "DEMO_MEMBROS_INFERIORES", name: "Membros inferiores" },
  { id: muscleIds[1], code: "DEMO_MEMBROS_SUPERIORES", name: "Membros superiores" },
  { id: muscleIds[2], code: "DEMO_CORE", name: "Região central" },
];
const exercises = [
  {
    id: exerciseIds[0],
    name: "Agachamento demonstrativo",
    modality: "STRENGTH",
    instructions:
      "Flexione quadris e joelhos de forma controlada e retorne à posição inicial.",
    equipment: equipmentIds[0],
    muscle: muscleIds[0],
  },
  {
    id: exerciseIds[1],
    name: "Remada com elástico demo",
    modality: "STRENGTH",
    instructions: "Puxe o elástico em direção ao tronco, mantendo os ombros estáveis.",
    equipment: equipmentIds[1],
    muscle: muscleIds[1],
  },
  {
    id: exerciseIds[2],
    name: "Prancha curta demo",
    modality: "STRENGTH",
    instructions:
      "Sustente o tronco alinhado por um intervalo confortável, sem prender a respiração.",
    equipment: equipmentIds[2],
    muscle: muscleIds[2],
  },
  {
    id: exerciseIds[3],
    name: "Caminhada estacionária demo",
    modality: "CARDIO",
    instructions: "Alterne passos no mesmo lugar em ritmo confortável.",
    equipment: null,
    muscle: muscleIds[0],
  },
  {
    id: exerciseIds[4],
    name: "Mobilidade de quadril demo",
    modality: "MOBILITY",
    instructions: "Mova o quadril lentamente dentro de uma amplitude confortável.",
    equipment: equipmentIds[2],
    muscle: muscleIds[0],
  },
  {
    id: exerciseIds[5],
    name: "Elevação de braços demo",
    modality: "STRENGTH",
    instructions: "Eleve os braços com carga leve e controle o retorno.",
    equipment: equipmentIds[0],
    muscle: muscleIds[1],
  },
];
const expected = {
  users: 4,
  accounts: 4,
  personal: 1,
  students: 3,
  equipment: 3,
  muscles: 3,
  exercises: 6,
  translations: 6,
  exerciseEquipment: 5,
  exerciseMuscles: 6,
};
const allowedLocalDatabasePorts = new Set(["54322", "55322"]);

export function validateLocalTarget(databaseUrl, container) {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL local inválida.");
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    !allowedLocalDatabasePorts.has(url.port) ||
    url.pathname !== "/postgres" ||
    url.username !== "postgres" ||
    !url.password ||
    url.search ||
    url.hash ||
    container?.Name !== "/supabase_db_NodusAPI" ||
    !container?.State?.Running ||
    !container?.NetworkSettings?.Ports?.["5432/tcp"]?.some(
      (port) => port.HostPort === url.port,
    )
  ) {
    throw new Error(
      "Seed recusado: destino não é o Supabase local NodusAPI em localhost:54322 ou localhost:55322/postgres.",
    );
  }
}

export function classifySeedState(counts, target = expected) {
  if (Object.keys(target).every((key) => counts[key] === 0)) return "new";
  if (Object.keys(target).every((key) => counts[key] === target[key])) return "complete";
  throw new Error("Seed parcial ou colisão de identificadores: nenhuma alteração feita.");
}

export function assertNoExternalDependencies(counts) {
  if (Object.values(counts).some((count) => count !== 0)) {
    throw new Error("Rollback recusado: existem dependencias externas dos dados demo.");
  }
}

function inspectContainer() {
  const output = execFileSync("docker", ["inspect", "supabase_db_NodusAPI"], {
    encoding: "utf8",
  });
  return JSON.parse(output)[0];
}

function backup() {
  const result = spawnSync(
    "docker",
    [
      "exec",
      "supabase_db_NodusAPI",
      "pg_dump",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-Fc",
    ],
    { maxBuffer: 100 * 1024 * 1024 },
  );
  if (result.status !== 0 || !result.stdout?.length)
    throw new Error("Backup local falhou; seed interrompido.");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = resolve(localRoot, `LOCAL_DEMO_BACKUP-${timestamp}.dump`);
  writeFileSync(path, result.stdout, { flag: "wx", mode: 0o600 });
  return path;
}

function readPassword() {
  if (!existsSync(credentialsPath)) return null;
  const match = readFileSync(credentialsPath, "utf8").match(/^Senha: `([^`]+)`$/m);
  if (!match) throw new Error("Arquivo de credenciais local existe, mas está inválido.");
  return match[1];
}

function writeCredentials(password) {
  const content = `# Credenciais de demonstração local Nodus\n\nSomente para o Supabase local. Não use estas contas em produção.\n\nAcesso: http://localhost:3000/acesso\n\nPersonal: \`demo.personal@nodus.test\`\nAluno: \`demo.aluno1@nodus.test\`\nSenha: \`${password}\`\n\nO personal vê 3 alunos e 6 exercícios fictícios. Treinos ainda não fazem parte deste seed.\n\nScript: \`.codex-cut/2026-09-23/web/scripts/seed-local-demo.mjs\`.\nRollback: execute o script com argumento \`rollback\` e as mesmas variáveis locais. O arquivo de credenciais permanece, mas o login deixa de funcionar até novo seed.\n`;
  writeFileSync(credentialsPath, content, { flag: "wx", mode: 0o600 });
}

async function countState(client) {
  const checks = {
    users: [
      "select count(*)::int as count from public.users where id = any($1::text[]) or lower(email) = any($2::text[])",
      [userIds, people.map((person) => person.email)],
    ],
    accounts: [
      "select count(*)::int as count from public.accounts where id = any($1::text[]) or user_id = any($2::text[])",
      [accountIds, userIds],
    ],
    personal: [
      "select count(*)::int as count from public.personal_profiles where id = $1 or user_id = $2 or cpf = '00000000000' or cref = 'DEMO-0001'",
      [personalId, userIds[0]],
    ],
    students: [
      "select count(*)::int as count from public.student_profiles where id = any($1::uuid[]) or user_id = any($2::text[])",
      [studentIds, userIds.slice(1)],
    ],
    equipment: [
      "select count(*)::int as count from public.equipment where id = any($1::uuid[]) or code = any($2::text[])",
      [equipmentIds, equipment.map((item) => item.code)],
    ],
    muscles: [
      "select count(*)::int as count from public.muscle_groups where id = any($1::uuid[]) or code = any($2::text[])",
      [muscleIds, muscles.map((item) => item.code)],
    ],
    exercises: [
      "select count(*)::int as count from public.exercises where id = any($1::uuid[])",
      [exerciseIds],
    ],
    translations: [
      "select count(*)::int as count from public.exercise_translations where exercise_id = any($1::uuid[])",
      [exerciseIds],
    ],
    exerciseEquipment: [
      "select count(*)::int as count from public.exercise_equipment where exercise_id = any($1::uuid[])",
      [exerciseIds],
    ],
    exerciseMuscles: [
      "select count(*)::int as count from public.exercise_muscle_groups where exercise_id = any($1::uuid[])",
      [exerciseIds],
    ],
  };
  const counts = {};
  for (const [key, [sql, params]] of Object.entries(checks)) {
    counts[key] = (await client.query(sql, params)).rows[0].count;
  }
  return counts;
}

async function assertCompleteIdentity(client, password) {
  const users = (
    await client.query(
      "select id, email, role, email_verified, is_active, is_banned from public.users where id = any($1::text[])",
      [userIds],
    )
  ).rows;
  if (
    users.length !== people.length ||
    people.some(
      (person) =>
        !users.some(
          (user) =>
            user.id === person.id &&
            user.email === person.email &&
            user.role === person.role &&
            user.email_verified &&
            user.is_active &&
            !user.is_banned,
        ),
    )
  ) {
    throw new Error("Identidades demo divergentes; seed não será alterado.");
  }
  const accounts = (
    await client.query(
      "select id, user_id, account_id, provider_id, password from public.accounts where id = any($1::text[])",
      [accountIds],
    )
  ).rows;
  if (
    accounts.length !== accountIds.length ||
    accounts.some((account) => {
      const index = accountIds.indexOf(account.id);
      return (
        index < 0 ||
        account.provider_id !== "credential" ||
        account.user_id !== userIds[index] ||
        account.account_id !== userIds[index]
      );
    })
  ) {
    throw new Error("Contas demo divergentes; seed não será alterado.");
  }
  for (const account of accounts.slice(0, 2)) {
    if (!(await verifyPassword({ hash: account.password, password })))
      throw new Error("Senha local não corresponde às contas demo existentes.");
  }
  const source = (
    await client.query(
      "select count(*)::int as count from public.exercises where id = any($1::uuid[]) and owner_personal_id = $2 and source = 'NODUS_LOCAL_DEMO'",
      [exerciseIds, personalId],
    )
  ).rows[0].count;
  if (source !== exercises.length)
    throw new Error("Catálogo demo divergente; seed não será alterado.");
}

async function insertSeed(client, password) {
  const hash = await hashPassword(password);
  for (const [index, person] of people.entries()) {
    await client.query(
      "insert into public.users (id, name, email, email_verified, role, is_active, is_banned) values ($1,$2,$3,true,$4,true,false)",
      [person.id, person.name, person.email, person.role],
    );
    await client.query(
      "insert into public.accounts (id, user_id, account_id, provider_id, password) values ($1,$2,$2,'credential',$3)",
      [accountIds[index], person.id, hash],
    );
  }
  await client.query(
    "insert into public.personal_profiles (id, user_id, cpf, cref, telefone, especialidade) values ($1,$2,'00000000000','DEMO-0001','00000000000','Demonstração local')",
    [personalId, userIds[0]],
  );
  for (const [index, id] of studentIds.entries()) {
    await client.query(
      "insert into public.student_profiles (id, user_id, personal_id, telefone, birth_date, status) values ($1,$2,$3,'00000000000',$4,$5)",
      [
        id,
        userIds[index + 1],
        personalId,
        `200${index}-01-01`,
        index === 2 ? "INACTIVE" : "ACTIVE",
      ],
    );
  }
  for (const item of equipment)
    await client.query(
      "insert into public.equipment (id, code, name_pt_br) values ($1,$2,$3)",
      [item.id, item.code, item.name],
    );
  for (const item of muscles)
    await client.query(
      "insert into public.muscle_groups (id, code, name_pt_br) values ($1,$2,$3)",
      [item.id, item.code, item.name],
    );
  for (const item of exercises) {
    await client.query(
      "insert into public.exercises (id, owner_personal_id, modality, name_normalized, source, content_version) values ($1,$2,$3,$4,'NODUS_LOCAL_DEMO','demo-v1')",
      [item.id, personalId, item.modality, item.name.toLocaleLowerCase("pt-BR")],
    );
    await client.query(
      "insert into public.exercise_translations (exercise_id, locale, name, instructions) values ($1,'pt-BR',$2,$3)",
      [item.id, item.name, item.instructions],
    );
    if (item.equipment)
      await client.query(
        "insert into public.exercise_equipment (exercise_id, equipment_id) values ($1,$2)",
        [item.id, item.equipment],
      );
    await client.query(
      "insert into public.exercise_muscle_groups (exercise_id, muscle_group_id, role) values ($1,$2,'PRIMARY')",
      [item.id, item.muscle],
    );
  }
}

async function externalDependencies(client) {
  const result = await client.query(
    `select
    (select count(*)::int from public.registration_invites where created_by_user_id = any($1::text[]) or used_by_user_id = any($1::text[]) or personal_id = $2) as invites,
    (select count(*)::int from public.idempotent_operations where actor_user_id = any($1::text[])) as operations,
    (select count(*)::int from public.student_profiles where personal_id = $2 and not (id = any($3::uuid[]))) as students,
    (select count(*)::int from public.exercises where owner_personal_id = $2 and not (id = any($4::uuid[]))) as exercises`,
    [userIds, personalId, studentIds, exerciseIds],
  );
  return result.rows[0];
}

async function rollbackSeed(client) {
  await client.query(
    "delete from public.exercise_muscle_groups where exercise_id = any($1::uuid[])",
    [exerciseIds],
  );
  await client.query(
    "delete from public.exercise_equipment where exercise_id = any($1::uuid[])",
    [exerciseIds],
  );
  await client.query(
    "delete from public.exercise_translations where exercise_id = any($1::uuid[])",
    [exerciseIds],
  );
  await client.query("delete from public.exercises where id = any($1::uuid[])", [
    exerciseIds,
  ]);
  await client.query("delete from public.equipment where id = any($1::uuid[])", [
    equipmentIds,
  ]);
  await client.query("delete from public.muscle_groups where id = any($1::uuid[])", [
    muscleIds,
  ]);
  await client.query("delete from public.student_profiles where id = any($1::uuid[])", [
    studentIds,
  ]);
  await client.query("delete from public.personal_profiles where id = $1", [personalId]);
  await client.query("delete from public.accounts where id = any($1::text[])", [
    accountIds,
  ]);
  await client.query("delete from public.users where id = any($1::text[])", [userIds]);
}

async function main() {
  const command = process.argv[2];
  if (!["seed", "rollback", "rollback-check"].includes(command))
    throw new Error("Use: node scripts/seed-local-demo.mjs seed|rollback-check|rollback");
  if (process.env.NODUS_LOCAL_DEMO_SEED !== "1")
    throw new Error("Defina NODUS_LOCAL_DEMO_SEED=1 para confirmar o alvo local.");
  const databaseUrl = process.env.DATABASE_URL;
  validateLocalTarget(databaseUrl, inspectContainer());
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const state = classifySeedState(await countState(client));
    const existingPassword = readPassword();
    if (command === "seed" && state === "complete") {
      if (!existingPassword)
        throw new Error("Seed existe, mas credenciais locais não foram encontradas.");
      await assertCompleteIdentity(client, existingPassword);
      process.stdout.write(`Seed já presente. Credenciais: ${credentialsPath}\n`);
      return;
    }
    if (command !== "seed" && state === "new") {
      process.stdout.write("Nenhum dado demo para remover.\n");
      return;
    }
    if (command !== "seed") {
      if (!existingPassword)
        throw new Error("Rollback recusado: arquivo local de credenciais ausente.");
      await assertCompleteIdentity(client, existingPassword);
      assertNoExternalDependencies(await externalDependencies(client));
    }
    if (command === "rollback-check") {
      await client.query("begin");
      try {
        await rollbackSeed(client);
        if (classifySeedState(await countState(client)) !== "new")
          throw new Error("Contagens do rollback não conferem.");
      } finally {
        await client.query("rollback");
      }
      process.stdout.write(
        "Rollback validado em transação revertida; seed preservado.\n",
      );
      return;
    }
    const backupPath = backup();
    process.stdout.write(`Backup local: ${backupPath}\n`);
    const password = existingPassword ?? `${randomBytes(24).toString("base64url")}Aa1!`;
    let createdCredentials = false;
    if (command === "seed" && !existingPassword) {
      writeCredentials(password);
      createdCredentials = true;
    }
    try {
      await client.query("begin");
      if (command === "seed") await insertSeed(client, password);
      else await rollbackSeed(client);
      const after = classifySeedState(await countState(client));
      if (after !== (command === "seed" ? "complete" : "new"))
        throw new Error("Contagens do seed não conferem após a operação.");
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      if (createdCredentials) unlinkSync(credentialsPath);
      throw error;
    }
    process.stdout.write(
      command === "seed"
        ? `Seed criado. Credenciais: ${credentialsPath}\n`
        : "Rollback demo concluído; credenciais locais preservadas para novo seed.\n",
    );
  } finally {
    await client.end();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
