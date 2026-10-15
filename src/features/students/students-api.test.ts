import { afterEach, describe, expect, it, vi } from "vitest";
import { isCreatedInvite, isMeResponse } from "@/lib/contracts/nodus-api";
import { isPagedStudents, isStudentDetail } from "@/lib/contracts/students";
import {
  DEFAULT_STUDENT_FILTERS,
  hasActiveStudentFilters,
  normalizeStudentListFilter,
  studentFiltersToSearchParams,
  studentQueryKeys,
} from "./student-query-keys";
import { createStudentInvite, getStudent, listStudents } from "./students-api";

const id = "16a7ab81-68dd-47ee-9600-d7c860121093";
const item = {
  id,
  name: "Ana",
  email: "ana@example.test",
  status: "ACTIVE",
  linkedAt: "2026-09-07T12:34:56.1234567+00:00",
};
const page = { items: [item], page: 1, pageSize: 20, totalCount: 1 };
const createdInvite = {
  id: "21111111-1111-4111-8111-111111111111",
  link: "https://app.example.test/cadastro?token=opaque-invite-token",
  expiresAt: "2026-10-20T12:00:00Z",
};
const me = {
  user: {
    userId: "better-auth-user",
    name: "Ana",
    email: "ana@example.test",
    role: "PERSONAL",
    emailVerified: true,
    isActive: true,
    isBanned: false,
    personalProfileId: id,
    studentProfileId: null,
  },
  personalProfile: { id, cpf: "123", cref: "123", telefone: "123", especialidade: null },
  studentProfile: null,
  onboarding: { required: false, missingFields: [] },
};
afterEach(() => vi.unstubAllGlobals());

describe("student requests", () => {
  it("serializes the exact normalized filter and forwards cancellation", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json(page));
    vi.stubGlobal("fetch", fetcher);
    const signal = new AbortController().signal;
    const filter = normalizeStudentListFilter(
      new URLSearchParams(
        "page=2&search=+ana+&status=ACTIVE&sortBy=linkedAt&sortDirection=desc",
      ),
    );
    expect(await listStudents(filter, signal)).toEqual(page);
    expect(fetcher.mock.calls[0][0]).toBe(
      "/api/backend/v1/students?page=2&pageSize=20&search=ana&status=ACTIVE&sortBy=linkedAt&sortDirection=desc",
    );
    expect(fetcher.mock.calls[0][1].signal).toBe(signal);
  });
  it("omits absent optional filters", () => {
    expect(studentFiltersToSearchParams(DEFAULT_STUDENT_FILTERS).toString()).toBe(
      "page=1&pageSize=20&sortBy=name&sortDirection=asc",
    );
    expect(hasActiveStudentFilters(DEFAULT_STUDENT_FILTERS)).toBe(false);
    expect(
      hasActiveStudentFilters({ ...DEFAULT_STUDENT_FILTERS, status: "INACTIVE" }),
    ).toBe(true);
  });
  it("fetches detail with the same signal", async () => {
    const detail = { ...item, telefone: null, birthDate: "2000-02-29" };
    const fetcher = vi.fn().mockResolvedValue(Response.json(detail));
    vi.stubGlobal("fetch", fetcher);
    const signal = new AbortController().signal;
    expect(await getStudent(id, signal)).toEqual(detail);
    expect(fetcher.mock.calls[0][0]).toBe(`/api/backend/v1/students/${id}`);
    expect(fetcher.mock.calls[0][1].signal).toBe(signal);
  });
  it("rejects invalid detail identifiers before fetch", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(getStudent("../me")).rejects.toThrow("STUDENT_ID_INVALID");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects malformed roster responses through the real fetcher", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ ...page, items: [{ ...item, status: "UNKNOWN" }] }),
        ),
    );
    await expect(listStudents(DEFAULT_STUDENT_FILTERS)).rejects.toMatchObject({
      code: "INVALID_API_RESPONSE",
    });
  });

  it("creates an invite through the authenticated BFF with the idempotency key", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(Response.json(createdInvite, { status: 201 }));
    vi.stubGlobal("fetch", fetcher);
    const input = {
      email: "aluno@example.test",
      operationId: "31111111-1111-4111-8111-111111111111",
    };

    await expect(createStudentInvite(input)).resolves.toEqual(createdInvite);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][0]).toBe("/api/backend/v1/invites");
    const request = fetcher.mock.calls[0][1];
    expect(request).toMatchObject({ method: "POST", credentials: "include" });
    expect(new Headers(request.headers).get("content-type")).toBe("application/json");
    expect(new Headers(request.headers).get("accept")).toBe("application/json");
    expect(JSON.parse(request.body)).toEqual(input);
  });

  it("rejects invite responses that do not point to the registration route", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        Response.json({ ...createdInvite, link: "javascript:alert(1)" }, { status: 201 }),
      );
    vi.stubGlobal("fetch", fetcher);

    await expect(
      createStudentInvite({ email: "aluno@example.test", operationId: id }),
    ).rejects.toMatchObject({ code: "INVALID_API_RESPONSE" });
  });
});

describe("filters and query keys", () => {
  it.each([
    0,
    -1,
    1.5,
    2147483648,
    Number.MAX_SAFE_INTEGER,
    Infinity,
    "bad",
    true,
    {},
    [],
  ])("rejects page %j", (value) => {
    expect(normalizeStudentListFilter({ page: value }).page).toBe(1);
  });
  it("bounds and normalizes all filters without mutating input", () => {
    const input = {
      page: "2147483647",
      pageSize: 100,
      search: `  ${"a".repeat(110)}  `,
      status: "invalid",
      sortBy: "sql",
      sortDirection: "bad",
    };
    expect(normalizeStudentListFilter(input)).toEqual({
      ...DEFAULT_STUDENT_FILTERS,
      page: 2147483647,
      search: "a".repeat(100),
    });
    expect(input.pageSize).toBe(100);
    expect(normalizeStudentListFilter({ search: {} }).search).toBeUndefined();
  });
  it("builds stable hierarchical keys", () => {
    expect(studentQueryKeys.all).toEqual(["students"]);
    expect(
      studentQueryKeys.list(normalizeStudentListFilter({ search: " ana " })),
    ).toEqual(
      studentQueryKeys.list(
        normalizeStudentListFilter(new URLSearchParams("search=ana")),
      ),
    );
    expect(studentQueryKeys.detail(id)).toEqual(["students", "detail", id]);
  });
});

describe("runtime contracts", () => {
  it("accepts valid roster, profile and empty page contracts", () => {
    expect(isPagedStudents(page)).toBe(true);
    expect(isPagedStudents({ ...page, items: [], totalCount: 0 })).toBe(true);
    expect(isMeResponse(me)).toBe(true);
    expect(
      isMeResponse({
        ...me,
        studentProfile: {
          id,
          personalProfileId: id,
          status: "INACTIVE",
          telefone: null,
          birthDate: "2000-02-29",
        },
      }),
    ).toBe(true);
  });
  it("accepts only well-formed student invitation responses", () => {
    expect(isCreatedInvite(createdInvite)).toBe(true);
    expect(
      isCreatedInvite({ ...createdInvite, link: "https://app.example.test/cadastro" }),
    ).toBe(false);
  });
  it.each([
    { page: 2147483648 },
    { page: 1.5 },
    { page: 0 },
    { pageSize: 101 },
    { pageSize: 0 },
    { pageSize: 1.5 },
    { totalCount: -1 },
    { totalCount: Number.MAX_SAFE_INTEGER + 1 },
    { totalCount: 1.5 },
    { items: [null] },
  ])("rejects invalid envelope %j", (invalid) =>
    expect(isPagedStudents({ ...page, ...invalid })).toBe(false));
  it.each([
    "2026-02-30T12:00:00Z",
    "2026-13-01T12:00:00Z",
    "2026-09-07",
    "yesterday",
    "2026-09-07T24:00:00Z",
    "2026-09-07T12:00:00",
    "2026-09-07T12:00:00+25:00",
  ])("rejects invalid timestamp %s", (linkedAt) =>
    expect(isPagedStudents({ ...page, items: [{ ...item, linkedAt }] })).toBe(false));
  it.each([
    "2001-02-29",
    "2000-02-30",
    "2026-04-31",
    "0000-01-01",
    "2000-01-01T00:00:00Z",
    "1/2/2000",
  ])("rejects invalid birth date %s", (birthDate) => {
    expect(isStudentDetail({ ...item, telefone: null, birthDate })).toBe(false);
    expect(
      isMeResponse({
        ...me,
        studentProfile: {
          id,
          personalProfileId: id,
          status: "ACTIVE",
          telefone: null,
          birthDate,
        },
      }),
    ).toBe(false);
  });
  it.each([
    null,
    [],
    {},
    { ...me, user: { ...me.user, emailVerified: "true" } },
    { ...me, user: { ...me.user, role: "ROOT" } },
    { ...me, user: { ...me.user, personalProfileId: "invalid" } },
    { ...me, personalProfile: {} },
    { ...me, studentProfile: {} },
    { ...me, onboarding: { required: false, missingFields: [1] } },
  ])("rejects incomplete canonical me %j", (invalid) =>
    expect(isMeResponse(invalid)).toBe(false));
});
