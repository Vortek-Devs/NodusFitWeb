// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudentsRosterClient } from "./students-roster-client";

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  replace: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/alunos",
  useRouter: () => ({ replace: navigation.replace }),
}));
const id = "11111111-1111-4111-8111-111111111111";
const student = {
  id,
  name: "Ana Ribeiro",
  email: "ana@example.test",
  status: "ACTIVE",
  linkedAt: "2026-09-08T12:00:00Z",
};
const fetchMock = vi.fn<typeof fetch>();
const clients: QueryClient[] = [];
function page(items = [student], totalCount = items.length, pageNumber = 1) {
  return Response.json({ items, totalCount, page: pageNumber, pageSize: 20 });
}
function problem(status: number, code = "ROSTER_UNAVAILABLE") {
  return Response.json(
    {
      title: "Falha segura",
      detail: "Solicitação indisponível.",
      code,
      traceId: "trace-roster",
      status,
    },
    { status },
  );
}
function deferred() {
  let resolve!: (value: Response) => void;
  const promise = new Promise<Response>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function renderRoster(url = "") {
  navigation.params = new URLSearchParams(url);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  clients.push(client);
  const tree = () => (
    <QueryClientProvider client={client}>
      <StudentsRosterClient />
    </QueryClientProvider>
  );
  const view = render(tree());
  navigation.replace.mockImplementation((path: string) => {
    const destination = new URL(path, "http://localhost");
    if (destination.pathname !== "/alunos") return;
    navigation.params = destination.searchParams;
    view.rerender(tree());
  });
  return {
    ...view,
    navigate: (url: string) => {
      navigation.params = new URLSearchParams(url);
      view.rerender(tree());
    },
  };
}
beforeEach(() => {
  navigation.replace.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  for (const client of clients.splice(0)) client.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("students roster", () => {
  it.each([
    "status",
    "sort",
  ])("pending search preserves the latest acknowledged %s filter", async (control) => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(page());
    const view = renderRoster("status=ACTIVE");
    let pending = "";
    navigation.replace.mockImplementationOnce((path: string) => {
      pending = path;
    });
    fireEvent.change(
      screen.getByRole("combobox", {
        name: control === "status" ? "Filtrar por status" : "Ordenar alunos",
      }),
      { target: { value: control === "status" ? "INACTIVE" : "linkedAt:desc" } },
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Aluno" } });
    view.navigate(new URL(pending, "http://localhost").search);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(navigation.params.get("search")).toBe("Aluno");
    expect(navigation.params.get(control === "status" ? "status" : "sortBy")).toBe(
      control === "status" ? "INACTIVE" : "linkedAt",
    );
    if (control === "sort") expect(navigation.params.get("sortDirection")).toBe("desc");
  });
  it("does not steal newly moved focus when an internal URL update commits later", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(page());
    const view = renderRoster();
    let pending = "";
    navigation.replace.mockImplementationOnce((path: string) => {
      pending = path;
    });
    const input = screen.getByRole("textbox");
    input.focus();
    fireEvent.change(input, { target: { value: "Al" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    const status = screen.getByRole("combobox", { name: "Filtrar por status" });
    status.focus();
    view.navigate(new URL(pending, "http://localhost").search);
    expect(status).toHaveFocus();
  });
  it("keeps newer typing and debounce when an older internal update commits", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(page());
    const view = renderRoster();
    let pending = "";
    navigation.replace.mockImplementationOnce((path: string) => {
      pending = path;
    });
    const input = screen.getByRole("textbox");
    input.focus();
    fireEvent.change(input, { target: { value: "Al" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    fireEvent.change(input, { target: { value: "Aluno" } });
    view.navigate(new URL(pending, "http://localhost").search);
    expect(screen.getByRole("textbox")).toHaveValue("Aluno");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(navigation.params.get("search")).toBe("Aluno");
  });
  it.each([
    "status",
    "sort",
  ])("preserves focused %s after changing filters", async (control) => {
    fetchMock.mockResolvedValue(page());
    renderRoster();
    const label = control === "status" ? "Filtrar por status" : "Ordenar alunos";
    const select = screen.getByRole("combobox", { name: label });
    select.focus();
    fireEvent.change(select, {
      target: { value: control === "status" ? "INACTIVE" : "linkedAt:desc" },
    });
    expect(screen.getByRole("combobox", { name: label })).toHaveFocus();
  });
  it("does not focus search after the user leaves the field", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(page());
    renderRoster();
    const input = screen.getByRole("textbox");
    input.focus();
    fireEvent.change(input, { target: { value: "Aluno" } });
    input.blur();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.getByRole("textbox")).not.toHaveFocus();
  });
  it("preserves focused search selection after debounce and accepts continued typing", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(page());
    renderRoster();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "Aluno" } });
    input.setSelectionRange(2, 4);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    const updated = screen.getByRole("textbox") as HTMLInputElement;
    expect(updated).toHaveFocus();
    expect(updated.selectionStart).toBe(2);
    expect(updated.selectionEnd).toBe(4);
    if (!(document.activeElement instanceof HTMLInputElement))
      throw new Error("Search must remain focused");
    fireEvent.change(document.activeElement, { target: { value: "Aluna" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.getByRole("textbox")).toHaveFocus();
    expect(navigation.params.get("search")).toBe("Aluna");
  });
  it("ignores the obsolete response after URL navigation", async () => {
    const obsolete = deferred();
    fetchMock
      .mockReturnValueOnce(obsolete.promise)
      .mockResolvedValueOnce(page([{ ...student, name: "Bruno Lima" }]));
    const view = renderRoster("search=ana");
    const signal = fetchMock.mock.calls[0][1]?.signal;
    view.navigate("search=bruno");
    expect(await screen.findAllByText("Bruno Lima")).toHaveLength(2);
    await act(async () => {
      obsolete.resolve(page());
    });
    expect(signal?.aborted).toBe(true);
    expect(screen.queryByText("Ana Ribeiro")).not.toBeInTheDocument();
  });
  it("announces loading without claiming an unknown total is zero", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    renderRoster();
    expect(screen.getByRole("status", { name: "Carregando alunos" })).toBeInTheDocument();
    expect(screen.queryByText(/0 vínculos/)).not.toBeInTheDocument();
  });
  it("renders semantic desktop columns and equivalent mobile fields with real detail links", async () => {
    fetchMock.mockResolvedValue(page());
    renderRoster();
    const table = await screen.findByRole("table", { name: "Alunos vinculados" });
    for (const name of ["Aluno", "E-mail", "Status", "Vínculo"])
      expect(within(table).getByRole("columnheader", { name })).toBeInTheDocument();
    expect(within(table).getByRole("link", { name: /Ver aluno/ })).toHaveAttribute(
      "href",
      `/alunos/${id}`,
    );
    const cards = screen.getByRole("list", { name: "Alunos vinculados" });
    for (const text of ["Ana Ribeiro", "ana@example.test", "Ativo", /08\/09\/2026/])
      expect(within(cards).getByText(text)).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });
  it.each([false, true])("distinguishes empty state (filtered=%s)", async (filtered) => {
    fetchMock.mockResolvedValue(page([]));
    renderRoster(filtered ? "search=ana" : "");
    expect(
      await screen.findByText(
        filtered ? "Nenhum aluno corresponde aos filtros" : "Nenhum aluno vinculado",
      ),
    ).toBeInTheDocument();
    if (filtered) {
      fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
      expect(navigation.params.has("search")).toBe(false);
    } else
      expect(
        screen.queryByRole("button", { name: "Limpar filtros" }),
      ).not.toBeInTheDocument();
  });
  it("retries safe errors with code and correlation", async () => {
    fetchMock.mockResolvedValueOnce(problem(500)).mockResolvedValueOnce(page());
    renderRoster();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("ROSTER_UNAVAILABLE");
    expect(alert).toHaveTextContent("trace-roster");
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });
  it("returns expired sessions only to fixed access route", async () => {
    fetchMock.mockResolvedValue(problem(401));
    renderRoster("search=private");
    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith("/acesso?perfil=personal", {
        scroll: false,
      }),
    );
  });
  it("explains 403 without showing roster data", async () => {
    fetchMock.mockResolvedValue(problem(403));
    renderRoster();
    expect(await screen.findByRole("alert")).toHaveTextContent("Acesso indisponível");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
  it("sends onboarding conflicts to the existing completion route", async () => {
    fetchMock.mockResolvedValue(problem(409, "ONBOARDING_REQUIRED"));
    renderRoster();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Complete seu perfil profissional");
    expect(screen.getByRole("link", { name: "Completar perfil" })).toHaveAttribute(
      "href",
      "/onboarding",
    );
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).toBeNull();
  });
  it.each([
    ["EMAIL_NOT_VERIFIED", "E-mail ainda não confirmado"],
    ["ACCOUNT_INACTIVE", "Conta inativa"],
    ["ACCOUNT_BANNED", "Conta bloqueada"],
    ["PERSONAL_ROLE_REQUIRED", "Área exclusiva do personal"],
  ])("explains authorization code %s", async (code, title) => {
    fetchMock.mockResolvedValue(problem(403, code));
    renderRoster();
    expect(await screen.findByRole("alert")).toHaveTextContent(title);
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).toBeNull();
  });
  it("retains previous rows during server pagination", async () => {
    const second = deferred();
    fetchMock
      .mockResolvedValueOnce(page([student], 21))
      .mockReturnValueOnce(second.promise);
    renderRoster();
    await screen.findByRole("table");
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(screen.getAllByText("Ana Ribeiro")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
    await act(async () => {
      second.resolve(page([{ ...student, name: "Bruno Lima" }], 21, 2));
    });
    expect(await screen.findAllByText("Bruno Lima")).toHaveLength(2);
    expect(screen.queryByText("Ana Ribeiro")).not.toBeInTheDocument();
    expect(navigation.params.get("page")).toBe("2");
  });
  it("keeps an empty out-of-range page navigable", async () => {
    fetchMock.mockResolvedValue(page([], 21, 9));
    renderRoster("page=9");
    expect(await screen.findByText("Nenhum aluno nesta página")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Primeira página" }));
    expect(navigation.params.get("page")).toBe("1");
  });
  it("does not reset direct page-2 entry on mount", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(page([student], 21, 2));
    renderRoster("page=2&search=ana");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][0]).toContain("page=2");
  });
  it("debounces only the latest draft at 300ms and resets page", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(page());
    renderRoster("page=2");
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar por nome ou e-mail" }), {
      target: { value: "an" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar por nome ou e-mail" }), {
      target: { value: "ana" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });
    expect(navigation.replace).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(navigation.params.get("search")).toBe("ana");
    expect(navigation.params.get("page")).toBe("1");
    expect(navigation.replace).toHaveBeenCalledTimes(1);
  });
  it.each([
    "status",
    "sort",
  ])("%s cancels pending debounce but includes current draft", async (control) => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(page());
    renderRoster("page=2");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Beatriz" } });
    fireEvent.change(
      screen.getByRole("combobox", {
        name: control === "status" ? "Filtrar por status" : "Ordenar alunos",
      }),
      { target: { value: control === "status" ? "INACTIVE" : "linkedAt:desc" } },
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(navigation.replace).toHaveBeenCalledTimes(1);
    expect(navigation.params.get("search")).toBe("Beatriz");
    expect(navigation.params.get("page")).toBe("1");
    expect(navigation.params.get(control === "status" ? "status" : "sortBy")).toBe(
      control === "status" ? "INACTIVE" : "linkedAt",
    );
  });
  it("back/forward restores draft and cancels obsolete timers", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(page());
    const view = renderRoster("search=ana");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "stale" } });
    view.navigate("search=bruno&page=2");
    expect(screen.getByRole("textbox")).toHaveValue("bruno");
    view.navigate("search=ana");
    expect(screen.getByRole("textbox")).toHaveValue("ana");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(navigation.replace).not.toHaveBeenCalled();
  });
  it("unmount cancels debounce and aborts request without persisting personal data", async () => {
    vi.useFakeTimers();
    const storage = vi.spyOn(Storage.prototype, "setItem");
    const log = vi.spyOn(console, "log");
    fetchMock.mockReturnValue(new Promise(() => {}));
    const view = renderRoster();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "ana@example.test" },
    });
    const signal = fetchMock.mock.calls[0][1]?.signal;
    view.unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(signal?.aborted).toBe(true);
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(storage).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});
