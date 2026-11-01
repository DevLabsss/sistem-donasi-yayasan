// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import API from "../services/api";
import { compressImage } from "../utils/imageCompressor";
import ModalDonasi from "./ModalDonasi";

vi.mock("../services/api", () => ({ default: { post: vi.fn(), put: vi.fn() } }));
vi.mock("../utils/imageCompressor", () => ({ compressImage: vi.fn() }));
vi.mock("./PublicUI", () => ({ Dialog: ({ children }) => <div>{children}</div> }));

afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); });

const program = { id: 3, judul: "Santunan Yatim" };

test("nominal di bawah batas tidak mencatat transaksi", () => {
  render(<ModalDonasi program={program} onClose={() => {}} />);
  fireEvent.change(screen.getByLabelText("Pilih Nominal Donasi"), { target: { value: "5000" } });
  fireEvent.click(screen.getByRole("button", { name: /Lanjut ke Barcode QRIS/i }));
  expect(screen.getByRole("alert").textContent).toMatch(/Minimal nominal/);
  expect(API.post).not.toHaveBeenCalled();
});

test("klik ganda membuat satu transaksi dan bukti diunggah sekali", async () => {
  vi.stubGlobal("crypto", { randomUUID: () => "123e4567-e89b-42d3-a456-426614174000" });
  let completePost;
  API.post.mockReturnValue(new Promise((resolve) => { completePost = resolve; }));
  API.put.mockResolvedValue({ data: { message: "Tersimpan" } });
  compressImage.mockResolvedValue("data:image/jpeg;base64,Zm9v");
  const { container } = render(<ModalDonasi program={program} onClose={() => {}} />);
  fireEvent.change(screen.getByLabelText("Pilih Nominal Donasi"), { target: { value: "20000" } });
  const submit = screen.getByRole("button", { name: /Lanjut ke Barcode QRIS/i });
  fireEvent.click(submit);
  fireEvent.click(submit);
  expect(API.post).toHaveBeenCalledOnce();
  expect(API.post.mock.calls[0][1]).toMatchObject({ programId: 3, jumlah: 20000, requestId: "123e4567-e89b-42d3-a456-426614174000" });
  completePost({ data: { data: { id: 9, jumlah: 20000, status: "PENDING" }, proofToken: "scoped-token" } });
  await screen.findByText(/Bukti Transfer \/ Struk QRIS/i);
  const file = new File(["receipt"], "receipt.jpg", { type: "image/jpeg" });
  fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } });
  await waitFor(() => expect(API.put).toHaveBeenCalledOnce());
  expect(API.put.mock.calls[0][0]).toBe("/donasi/9/bukti");
  expect(API.put.mock.calls[0][2].headers["X-Donation-Proof-Token"]).toBe("scoped-token");
  expect(await screen.findByText("Bukti tersimpan di server")).toBeTruthy();
});

test("gagal unggah bukti tidak ditampilkan sebagai tersimpan", async () => {
  vi.stubGlobal("crypto", { randomUUID: () => "123e4567-e89b-42d3-a456-426614174000" });
  API.post.mockResolvedValue({ data: { data: { id: 9, jumlah: 20000, status: "PENDING" }, proofToken: "scoped-token" } });
  API.put.mockRejectedValue({ response: { data: { message: "Unggahan ditolak" } } });
  compressImage.mockResolvedValue("data:image/jpeg;base64,Zm9v");
  const { container } = render(<ModalDonasi program={program} onClose={() => {}} initialNominal={20000} />);
  fireEvent.click(screen.getByRole("button", { name: /Lanjut ke Barcode QRIS/i }));
  await screen.findByText(/Bukti Transfer \/ Struk QRIS/i);
  fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [new File(["x"], "receipt.jpg", { type: "image/jpeg" })] } });
  expect((await screen.findByRole("alert")).textContent).toBe("Unggahan ditolak");
  expect(screen.queryByText("Bukti tersimpan di server")).toBeNull();
});
