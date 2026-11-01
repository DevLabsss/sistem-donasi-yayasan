// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import API from "../services/api";
import ProgramFormModal from "./ProgramFormModal";

vi.mock("../services/api", () => ({ default: { post: vi.fn(), put: vi.fn() } }));

afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

const existing = {
  id: 7,
  judul: "Bantuan Pangan",
  deskripsi: "Paket pangan untuk keluarga yang membutuhkan.",
  targetDana: 1_000_000,
  imageUrl: "https://res.cloudinary.com/test-cloud/image/upload/v1/yayasan/programs/pangan.webp",
};

test("admin membuat program dengan file gambar melalui FormData", async () => {
  vi.stubGlobal("URL", { ...URL, createObjectURL: vi.fn(() => "blob:preview"), revokeObjectURL: vi.fn() });
  API.post.mockResolvedValue({ data: { message: "Tersimpan" } });
  const onSaved = vi.fn();
  render(<ProgramFormModal program={null} onClose={() => {}} onSaved={onSaved} />);
  fireEvent.change(screen.getByLabelText("Judul Program"), { target: { value: existing.judul } });
  fireEvent.change(screen.getByLabelText("Target Dana (Rp)"), { target: { value: "1000000" } });
  fireEvent.change(screen.getByLabelText("Deskripsi Lengkap"), { target: { value: existing.deskripsi } });
  const file = new File(["image"], "pangan.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText("Pilih gambar utama program"), { target: { files: [file] } });
  fireEvent.click(screen.getByRole("button", { name: "Simpan Program" }));
  await waitFor(() => expect(API.post).toHaveBeenCalledOnce());
  const [url, body] = API.post.mock.calls[0];
  expect(url).toBe("/program");
  expect(body.get("image")).toBe(file);
  expect(body.get("judul")).toBe(existing.judul);
  expect(onSaved).toHaveBeenCalledOnce();
});

test("admin dapat menghapus gambar lama tanpa menghapus program", async () => {
  API.put.mockResolvedValue({ data: { message: "Diperbarui" } });
  render(<ProgramFormModal program={existing} onClose={() => {}} onSaved={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "Hapus Gambar" }));
  expect(screen.getByAltText(/pengganti gambar program Bantuan Pangan/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
  await waitFor(() => expect(API.put).toHaveBeenCalledOnce());
  const [url, body] = API.put.mock.calls[0];
  expect(url).toBe("/program/7");
  expect(body.get("removeImage")).toBe("true");
  expect(body.get("image")).toBeNull();
});
