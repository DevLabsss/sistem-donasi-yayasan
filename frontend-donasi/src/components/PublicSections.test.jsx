// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PublicSections from "./PublicSections";

vi.mock("./TransparencyDashboard", () => ({ default: () => null }));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("galeri berpindah otomatis tanpa tombol putar", () => {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => {});
  render(<MemoryRouter><PublicSections programs={[]} loading={false} programError={null} transparansi={null} loadingTransparansi={false} transparencyError={null} onRetryPrograms={() => {}} onRetryTransparency={() => {}} onDonate={() => {}} /></MemoryRouter>);

  expect(screen.getByRole("heading", { name: "Bimbingan Tahfidz & Wisuda Santri" })).toBeTruthy();
  act(() => vi.advanceTimersByTime(4500));
  expect(screen.getByRole("heading", { name: "Santunan Anak Yatim & Dhuafa" })).toBeTruthy();

  act(() => vi.advanceTimersByTime(4500));
  expect(screen.getByRole("heading", { name: "Pelatihan Usaha untuk Masyarakat" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Putar otomatis|Jeda otomatis/ })).toBeNull();
});
