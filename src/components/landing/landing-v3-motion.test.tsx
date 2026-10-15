// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LandingV3Motion } from "./landing-v3-motion";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

it("keeps landing content visible when IntersectionObserver is unavailable", () => {
  const root = document.createElement("main");
  root.className = "landing-v3";
  root.innerHTML = '<section data-r="up">LP content</section>';
  document.body.append(root);
  vi.stubGlobal("IntersectionObserver", undefined);

  render(<LandingV3Motion />);

  expect(root).toHaveClass("motion-ready");
  expect(root.querySelector("[data-r]")).toHaveClass("in");
});
