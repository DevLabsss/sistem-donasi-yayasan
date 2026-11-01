// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import API from "../services/api";
import DashboardPenerima from "./DashboardPenerima";

vi.mock("../services/api", () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));
vi.mock("../components/PublicUI", () => ({ Dialog: ({ children, title }) => <div role="dialog" aria-label={title}>{children}</div> }));
vi.mock("../components/ProfilSaya", () => ({ default: () => <div>Profil</div> }));

const older = { id: 1, judul: "[Pendidikan] Biaya SPP", status: "DIBATALKAN", jumlahDiajukan: 100000, createdAt: "2026-10-20T08:00:00Z" };
const latest = { id: 2, judul: "[Kesehatan] Biaya obat", status: "MENUNGGU", jumlahDiajukan: 200000, createdAt: "2026-10-29T08:00:00Z" };

function mockRead(applications = [latest, older]) {
  API.get.mockImplementation((path) => Promise.resolve({ data: path === "/pengajuan/saya"
    ? { data: applications }
    : path === "/penyaluran/saya" ? { data: [] } : { data: { penerimaBantuan: { status: "DISETUJUI" } } } }));
}

afterEach(() => { cleanup(); vi.clearAllMocks(); localStorage.clear(); });

test("bagian atas hanya menampilkan alur terbaru dan riwayat lama tetap dapat dibuka", async () => {
  mockRead();
  render(<DashboardPenerima />);
  await screen.findByText("Pengajuan terbaru");
  expect(screen.getByRole("region", { name: "Alur pengajuan Biaya obat" })).toBeTruthy();
  fireEvent.click(screen.getAllByRole("button", { name: "Detail" })[1]);
  expect(screen.getByRole("region", { name: "Alur pengajuan Biaya SPP" })).toBeTruthy();
});

test("pembatalan memperbarui alur dan notifikasi dapat ditutup", async () => {
  mockRead();
  API.patch.mockResolvedValue({ data: { data: { ...latest, status: "DIBATALKAN" } } });
  render(<DashboardPenerima />);
  await screen.findByText("Pengajuan terbaru");
  fireEvent.click(screen.getByRole("button", { name: "Batalkan pengajuan" }));
  fireEvent.click(screen.getByRole("button", { name: "Ya, batalkan pengajuan" }));
  await waitFor(() => expect(API.patch).toHaveBeenCalledWith("/pengajuan/2/batalkan"));
  expect(await screen.findByText(/Pengajuan dibatalkan oleh pemohon sebelum keputusan/)).toBeTruthy();
  expect(screen.getByText("Pengajuan berhasil dibatalkan. Riwayatnya tetap tersimpan.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Tutup notifikasi" }));
  expect(screen.queryByText("Pengajuan berhasil dibatalkan. Riwayatnya tetap tersimpan.")).toBeNull();
});

test("notifikasi setelah mengirim pengajuan dapat ditutup", async () => {
  mockRead([{ ...latest, status: "DIBATALKAN" }, older]);
  API.post.mockResolvedValue({ data: { message: "Pengajuan bantuan berhasil dikirim! Menunggu verifikasi admin.", data: { id: 3 } } });
  render(<DashboardPenerima />);
  await screen.findByText("Pengajuan terbaru");
  fireEvent.click(screen.getByRole("button", { name: "Ajukan Bantuan" }));
  fireEvent.change(screen.getByLabelText("Jenis Bantuan"), { target: { value: "Pendidikan" } });
  fireEvent.change(screen.getByLabelText("Judul Pengajuan"), { target: { value: "Biaya sekolah anak" } });
  fireEvent.change(screen.getByLabelText("Alasan Pengajuan"), { target: { value: "Membutuhkan bantuan untuk biaya sekolah semester ini." } });
  fireEvent.change(screen.getByLabelText("Nominal Kebutuhan (Rp)"), { target: { value: "100000" } });
  fireEvent.click(screen.getByRole("button", { name: "Kirim Pengajuan" }));
  expect(await screen.findByText("Pengajuan bantuan berhasil dikirim! Menunggu verifikasi admin.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Tutup notifikasi" }));
  expect(screen.queryByText("Pengajuan bantuan berhasil dikirim! Menunggu verifikasi admin.")).toBeNull();
});

test("riwayat panjang tetap tersedia di area gulir", async () => {
  const applications = Array.from({ length: 6 }, (_, index) => ({ ...older, id: 6 - index, judul: `[Pendidikan] Pengajuan ${6 - index}` }));
  mockRead(applications);
  render(<DashboardPenerima />);
  await screen.findByText("Pengajuan terbaru");
  expect(screen.getByRole("region", { name: "Daftar riwayat pengajuan" })).toBeTruthy();
  expect(screen.getAllByRole("row")).toHaveLength(7);
});
