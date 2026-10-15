// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import { Skeleton } from "./skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

it("defaults buttons to non-submit and preserves explicit submit", () => {
  const submit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <Button>Cancelar</Button>
      <Button type="submit">Salvar</Button>
    </form>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(submit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(submit).toHaveBeenCalledOnce();
});
it("composes a link without leaking the button type", () => {
  render(
    <Button asChild>
      <a href="/alunos">Alunos</a>
    </Button>,
  );
  expect(screen.getByRole("link")).toHaveAttribute("href", "/alunos");
  expect(screen.getByRole("link")).not.toHaveAttribute("type");
});
it("forwards input ref and accessible native attributes", () => {
  const ref = createRef<HTMLInputElement>();
  render(<Input ref={ref} aria-label="Nome" disabled aria-invalid="true" />);
  expect(ref.current).toBe(screen.getByRole("textbox", { name: "Nome" }));
  expect(ref.current).toBeDisabled();
  expect(ref.current).toHaveAttribute("aria-invalid", "true");
});
it("preserves table semantics and renders badge and decorative skeleton", () => {
  render(
    <>
      <Table>
        <TableCaption>Alunos</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ana</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Badge>Ativo</Badge>
      <Skeleton data-testid="loading" />
    </>,
  );
  expect(screen.getByRole("table", { name: "Alunos" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Nome" })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: "Ana" })).toBeInTheDocument();
  expect(screen.getByText("Ativo")).toBeInTheDocument();
  expect(screen.getByTestId("loading")).toHaveAttribute("aria-hidden", "true");
});
it("merges conditional classes and lets callers override conflicting utilities", () => {
  expect(cn("px-2", false && "hidden", ["px-4"], { "text-ink-primary": true })).toBe(
    "px-4 text-ink-primary",
  );
});
