// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProgramImage from "./ProgramImage";
import PublicSections from "./PublicSections";
import TransparencyDashboard from "./TransparencyDashboard";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const program = {
  id: 7,
  judul: "Bantuan Pangan",
  deskripsi: "Paket pangan untuk keluarga yang membutuhkan.",
  targetDana: 1_000_000,
  terkumpul: 0,
  imageUrl: "https://res.cloudinary.com/test-cloud/image/upload/v1/yayasan/programs/pangan.webp",
  donasi: [],
  penyaluranBantuan: [],
};

test("gambar program memakai URL API dan beralih ke logo saat gagal dimuat", () => {
  const { rerender } = render(<ProgramImage imageUrl={program.imageUrl} title={program.judul} />);
  const image = screen.getByAltText(`Gambar program ${program.judul}`);
  expect(image.getAttribute("src")).toBe(program.imageUrl);
  fireEvent.error(image);
  expect(screen.getByAltText(/pengganti gambar program Bantuan Pangan/)).toBeTruthy();

  const updatedUrl = "https://res.cloudinary.com/test-cloud/image/upload/v2/yayasan/programs/pangan-baru.webp";
  rerender(<ProgramImage imageUrl={updatedUrl} title={program.judul} />);
  expect(screen.getByAltText(`Gambar program ${program.judul}`).getAttribute("src")).toBe(updatedUrl);
});

test("program lama tanpa gambar menampilkan fallback", () => {
  render(<ProgramImage imageUrl={null} title={program.judul} />);
  expect(screen.getByAltText(/pengganti gambar program Bantuan Pangan/)).toBeTruthy();
});

test("gambar yang sama muncul pada kartu dan detail program", () => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.open = true; };
  HTMLDialogElement.prototype.close = function close() { this.open = false; };
  render(<MemoryRouter><PublicSections programs={[program]} loading={false} programError="" onRetryPrograms={() => {}} transparansi={null} loadingTransparansi={false} transparencyError="" onRetryTransparency={() => {}} onDonate={() => {}} /></MemoryRouter>);
  expect(screen.getByAltText(`Gambar program ${program.judul}`).getAttribute("src")).toBe(program.imageUrl);
  fireEvent.click(screen.getByRole("button", { name: `Lihat detail ${program.judul}` }));
  expect(screen.getAllByAltText(`Gambar program ${program.judul}`)).toHaveLength(2);
});

test("realisasi Transparansi menampilkan program dan progres dari data", () => {
  const data = {
    totalTerhimpun: 0,
    totalTersalurkan: 0,
    sisaSaldo: 0,
    programRealisasi: [{ ...program, terkumpul: 0, tersalurkan: 0, jumlahPenyaluran: 0 }],
    penyaluranTerbaru: [],
    trenDonasi: [],
  };
  render(<TransparencyDashboard data={data} loading={false} error="" onRetry={() => {}} />);
  expect(screen.getByRole("heading", { name: program.judul })).toBeTruthy();
  expect(screen.getByRole("progressbar", { name: `Progres donasi ${program.judul}` })).toBeTruthy();
});

test("nominal transparansi mulai menghitung saat bagian masuk viewport", async () => {
  let notifyIntersection;
  class IntersectionObserverMock {
    constructor(callback) { notifyIntersection = callback; }
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));

  const data = {
    totalTerhimpun: 1_000_000,
    totalTersalurkan: 250_000,
    sisaSaldo: 750_000,
    totalTransaksiBerhasil: 4,
    totalPenyaluranCount: 1,
    programRealisasi: [],
    penyaluranTerbaru: [],
    trenDonasi: [],
  };
  render(<TransparencyDashboard data={data} loading={false} error="" onRetry={() => {}} />);

  const receivedAmount = screen.getByLabelText("Rp 1.000.000");
  expect(within(receivedAmount).getByText("Rp 0")).toBeTruthy();

  act(() => notifyIntersection([{ isIntersecting: true }]));
  await waitFor(() => expect(within(receivedAmount).getByText("Rp 1.000.000")).toBeTruthy());
});
