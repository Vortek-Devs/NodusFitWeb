// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudentDetailClient } from "./student-detail-client";

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));
const id = "11111111-1111-4111-8111-111111111111";
const student = {
  id,
  name: "Ana Ribeiro",
  email: "ana@example.test",
  status: "ACTIVE",
  linkedAt: "2026-09-08T12:00:00Z",
  telefone: null,
  birthDate: "0099-01-01",
};
const fetchMock = vi.fn<typeof fetch>();
const clients: QueryClient[] = [];
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <StudentDetailClient studentId={id} />
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  navigation.replace.mockReset();
});
afterEach(() => {
  cleanup();
  for (const client of clients.splice(0)) client.clear();
  vi.unstubAllGlobals();
});
describe("student detail", () => {
  it("announces loading and aborts requests on unmount", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    const view = mount();
    expect(screen.getByRole("status", { name: "Carregando aluno" })).toBeInTheDocument();
    const signal = fetchMock.mock.calls[0][1]?.signal;
    view.unmount();
    expect(signal?.aborted).toBe(true);
  });
  it("shows canonical fields, strict date and missing optional data", async () => {
    fetchMock.mockResolvedValue(Response.json(student));
    mount();
    expect(
      await screen.findByRole("heading", { name: student.name }),
    ).toBeInTheDocument();
    expect(screen.getByText("01/01/0099")).toBeInTheDocument();
    expect(screen.getByText("Não informado")).toBeInTheDocument();
    expect(screen.getByText(student.email)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para alunos" })).toHaveAttribute(
      "href",
      "/alunos",
    );
  });
  it.each([401, 403, 404, 500])("handles %s safely", async (status) => {
    fetchMock
      .mockResolvedValueOnce(
        Response.json(
          {
            status,
            title: "Falha",
            code: "STUDENT_UNAVAILABLE",
            traceId: "trace-detail",
            detail: "Solicitação indisponível.",
          },
          { status },
        ),
      )
      .mockResolvedValueOnce(Response.json(student));
    mount();
    if (status === 401) {
      await waitFor(() =>
        expect(navigation.replace).toHaveBeenCalledWith("/acesso?perfil=personal", {
          scroll: false,
        }),
      );
      return;
    }
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      status === 403
        ? "Acesso indisponível"
        : status === 404
          ? "Aluno não encontrado"
          : "Não foi possível carregar o aluno",
    );
    expect(alert).toHaveTextContent("trace-detail");
    if (status === 500) {
      fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
      expect(
        await screen.findByRole("heading", { name: student.name }),
      ).toBeInTheDocument();
    } else
      expect(
        screen.queryByRole("button", { name: "Tentar novamente" }),
      ).not.toBeInTheDocument();
  });
  it("does not display a response after unmount", async () => {
    let resolve!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const view = mount();
    view.unmount();
    await act(async () => {
      resolve(Response.json(student));
    });
    expect(screen.queryByText(student.name)).not.toBeInTheDocument();
  });
});
