import React from "react";

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const PAYMENTS = [
  { id: "PAY-901", artist: "Aarav Mehta", order: "ORD-10245", amount: 18500, method: "Bank transfer", date: "18 Sep 2026", status: "Paid" },
  { id: "PAY-900", artist: "Kabir Verma", order: "ORD-10239", amount: 98000, method: "Bank transfer", date: "17 Sep 2026", status: "Processing" },
  { id: "PAY-899", artist: "Riya Sharma", order: "ORD-10244", amount: 32400, method: "UPI", date: "17 Sep 2026", status: "Paid" },
  { id: "PAY-898", artist: "Ananya Kapoor", order: "ORD-10242", amount: 21800, method: "UPI", date: "16 Sep 2026", status: "Paid" },
  { id: "PAY-897", artist: "Meera Iyer", order: "ORD-10241", amount: 15600, method: "Bank transfer", date: "16 Sep 2026", status: "On hold" },
];

function StatusBadge({ status }) {
  const map = {
    Paid: "bg-[#E7EEDD] text-[#4C6B3F]",
    Processing: "bg-[#F6E7D0] text-[#8A5A22]",
    "On hold": "bg-[#EFE9E1] text-[#736153]",
  };
  const cls = map[status] || "bg-[#EFE9E1] text-[#736153]";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

export default function Payments() {
  const totalPaid = PAYMENTS.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = PAYMENTS.filter((p) => p.status !== "Paid").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 font-['Plus_Jakarta_Sans']">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E8E1DB] rounded-2xl px-6 py-5 shadow-sm flex flex-col justify-center">
          <p className="text-[14px] text-[#A28F7D] mb-1">Paid out this month</p>
          <p className="font-['Playfair_Display'] text-[32px] text-[#362F26]">{formatINR(totalPaid)}</p>
        </div>
        
        <div className="bg-white border border-[#E8E1DB] rounded-2xl px-6 py-5 shadow-sm flex flex-col justify-center">
          <p className="text-[14px] text-[#A28F7D] mb-1">Pending payout</p>
          <p className="font-['Playfair_Display'] text-[32px] text-[#362F26]">{formatINR(totalPending)}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E8E1DB] rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left min-w-[1000px] border-collapse">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.08em] text-[#A28F7D] border-b border-[#E8E1DB]">
              <th className="px-6 py-4 font-medium">Payment</th>
              <th className="px-6 py-4 font-medium">Artist</th>
              <th className="px-6 py-4 font-medium">Order</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Method</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p) => (
              <tr key={p.id} className="border-b border-[#E8E1DB] last:border-b-0 hover:bg-[#F9F8F6] transition-colors">
                <td className="px-6 py-5 text-[14px] text-[#A28F7D]">{p.id}</td>
                <td className="px-6 py-5 text-[14px] text-[#362F26]">{p.artist}</td>
                <td className="px-6 py-5 text-[14px] text-[#A28F7D]">{p.order}</td>
                <td className="px-6 py-5 text-[14px] font-medium text-[#362F26]">{formatINR(p.amount)}</td>
                <td className="px-6 py-5 text-[14px] text-[#362F26]">{p.method}</td>
                <td className="px-6 py-5 text-[14px] text-[#A28F7D] whitespace-nowrap">{p.date}</td>
                <td className="px-6 py-5"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}