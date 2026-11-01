export function findRelatedDisbursement(application, disbursements = []) {
  if (!application?.id) return null;
  const reference = new RegExp(`(?:^|\\s)Pengajuan\\s+#${Number(application.id)}(?=:|\\s|$)`, "i");
  return disbursements.find((item) => reference.test(item.keterangan || "")) || null;
}
