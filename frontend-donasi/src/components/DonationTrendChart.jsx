import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatRupiah } from "../utils/format";

export default function DonationTrendChart({ data }) {
  return <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 10, right: 6, left: -24, bottom: 0 }} barGap={4}>
      <CartesianGrid stroke="#e4eee8" strokeDasharray="4 5" vertical={false} />
      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71877b", fontSize: 12 }} />
      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71877b", fontSize: 11 }} tickFormatter={(value) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(0)} jt` : value >= 1_000 ? `${(value / 1_000).toFixed(0)} rb` : String(value)} />
      <Tooltip formatter={(value, name) => [formatRupiah(value), name]} contentStyle={{ borderRadius: 14, border: "1px solid #dfe8e2", boxShadow: "0 12px 35px #073f3315" }} />
      <Bar dataKey="jumlah" name="Dana terhimpun" fill="#065642" radius={[4, 4, 0, 0]} maxBarSize={36} />
      <Bar dataKey="tersalurkan" name="Dana tersalurkan" fill="#b6d5c8" radius={[4, 4, 0, 0]} maxBarSize={36} />
    </BarChart>
  </ResponsiveContainer>;
}
