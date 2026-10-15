// Run directly with node --test; Vitest does not collect this file.
import assert from "node:assert/strict";
import test from "node:test";
import {
  assertNoExternalDependencies,
  classifySeedState,
  validateLocalTarget,
} from "./seed-local-demo.mjs";

const container = {
  Name: "/supabase_db_NodusAPI",
  State: { Running: true },
  NetworkSettings: { Ports: { "5432/tcp": [{ HostPort: "54322" }] } },
};

function containerAtPort(port) {
  return {
    ...container,
    NetworkSettings: { Ports: { "5432/tcp": [{ HostPort: String(port) }] } },
  };
}

test("accepts the default or machine-local Nodus Supabase port only when published", () => {
  assert.doesNotThrow(() =>
    validateLocalTarget(
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      container,
    ),
  );
  assert.doesNotThrow(() =>
    validateLocalTarget(
      "postgresql://postgres:postgres@127.0.0.1:55322/postgres",
      containerAtPort(55322),
    ),
  );
  assert.throws(() =>
    validateLocalTarget(
      "postgresql://postgres:postgres@127.0.0.1:55322/postgres",
      container,
    ),
  );
  for (const url of [
    "postgresql://postgres:postgres@db.example.com:54322/postgres",
    "postgresql://postgres:postgres@127.0.0.1:54323/postgres",
    "postgresql://postgres:postgres@127.0.0.1:55323/postgres",
    "postgresql://postgres:postgres@127.0.0.1:54322/production",
  ]) {
    assert.throws(() => validateLocalTarget(url, container));
  }
  assert.throws(() =>
    validateLocalTarget("postgresql://postgres:postgres@localhost:54322/postgres", {
      ...container,
      State: { Running: false },
    }),
  );
});

test("recognizes only empty or complete demo state", () => {
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
  assert.equal(
    classifySeedState(
      Object.fromEntries(Object.keys(expected).map((key) => [key, 0])),
      expected,
    ),
    "new",
  );
  assert.equal(classifySeedState(expected, expected), "complete");
  assert.throws(() => classifySeedState({ ...expected, users: 3 }, expected), /parcial/);
});

test("refuses rollback if other records depend on demo identities", () => {
  assert.doesNotThrow(() =>
    assertNoExternalDependencies({ invites: 0, operations: 0, students: 0 }),
  );
  assert.throws(
    () => assertNoExternalDependencies({ invites: 1, operations: 0, students: 0 }),
    /dependencias/,
  );
});
