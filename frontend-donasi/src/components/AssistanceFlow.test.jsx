// @vitest-environment jsdom
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import AssistanceFlow from "./AssistanceFlow";
import { findRelatedDisbursement } from "../utils/assistanceFlow";

afterEach(cleanup);

const application = { id: 1, judul: "[Pendidikan] Biaya SPP", createdAt: "2026-10-29T08:00:00.000Z" };

test("pengajuan menunggu menampilkan tahap verifikasi sebagai tahap saat ini", () => {
  render(<AssistanceFlow application={{ ...application, status: "MENUNGGU" }} />);
  expect(screen.getByText("Menunggu pengurus")).toBeTruthy();
  expect(screen.getByText("Belum diputuskan")).toBeTruthy();
  expect(screen.getByText("Setelah disetujui")).toBeTruthy();
  expect(screen.getByText("Verifikasi").closest("li").className).toContain("is-current");
});

test("penyaluran ditandai selesai hanya untuk nomor pengajuan yang tepat", () => {
  const unrelated = { id: 10, keterangan: "Pengajuan #10: SPP", tanggalSalur: "2026-10-30T08:00:00.000Z" };
  const related = { id: 11, keterangan: "Pengajuan #1: SPP", tanggalSalur: "2026-10-31T08:00:00.000Z" };
  expect(findRelatedDisbursement(application, [unrelated])).toBeNull();
  expect(findRelatedDisbursement(application, [unrelated, related])).toBe(related);
  render(<AssistanceFlow application={{ ...application, status: "DISETUJUI" }} disbursements={[unrelated, related]} />);
  expect(screen.getByText("Penyaluran").closest("li").className).toContain("is-done");
  expect(screen.getByText(/Bantuan untuk pengajuan ini tercatat/)).toBeTruthy();
});

test("pengajuan ditolak berhenti pada keputusan tanpa mengklaim penyaluran", () => {
  render(<AssistanceFlow application={{ ...application, status: "DITOLAK" }} />);
  expect(screen.getByText("Ditolak").closest("li").className).toContain("is-rejected");
  expect(screen.queryByText("Penyaluran")).toBeNull();
});

test("pengajuan dibatalkan berhenti sebelum keputusan pengurus", () => {
  render(<AssistanceFlow application={{ ...application, status: "DIBATALKAN" }} />);
  expect(screen.getByText("Dihentikan pemohon").closest("li").className).toContain("is-canceled");
  expect(screen.queryByText("Keputusan")).toBeNull();
  expect(screen.queryByText("Penyaluran")).toBeNull();
});
