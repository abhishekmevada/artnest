import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

export const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

const GREEN = ["Completed", "Approved", "Active", "Paid", "Published"];
const RED = ["Cancelled", "Rejected", "Blocked", "Failed"];
const GRAY = ["Read", "Draft"];

export function Badge({ status }) {
  const tone = GREEN.includes(status)
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : RED.includes(status)
    ? "bg-red-50 text-red-700 border-red-200"
    : GRAY.includes(status)
    ? "bg-stone-100 text-stone-600 border-stone-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${tone}`}>
      {status}
    </span>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div>
      <h1 className="font-serif text-[28px] leading-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-[14px] text-[#736153]">{subtitle}</p>}
    </div>
  );
}

export function Card({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-[#e6ded8] bg-white p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[18px]">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, note, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#e6ded8] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#736153]">{label}</p>
        {Icon && <Icon size={18} className="text-[#9f5639]" />}
      </div>
      <p className="mt-2 font-serif text-[28px] leading-none">{value}</p>
      {note && <p className="mt-2 text-[12px] text-[#736153]">{note}</p>}
    </div>
  );
}

export function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12.5px] text-[#736153]">{label}</span>
      <input
        {...props}
        className="h-10 w-full rounded-lg border border-[#e6ded8] bg-white px-3 text-[14px] outline-none focus:border-[#9f5639]"
      />
    </label>
  );
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-[520px] flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e6ded8] px-5 py-4">
          <h3 className="font-serif text-[18px]">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[#e6ded8] px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Ek hi component se poora list page:
 * columns: [{ label, key, fmt? }]  (key "status" apne aap badge banta hai)
 * statusActions: [["Approve", "Approved"], ["Reject", "Rejected"]]
 */
export function ListPage({ title, subtitle, data, columns, searchKeys, filterKey, statusActions = [] }) {
  const [rows, setRows] = useState(data);
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const [openId, setOpenId] = useState(null);

  const options = useMemo(
    () => (filterKey ? ["All", ...new Set(data.map((r) => r[filterKey]))] : []),
    [data, filterKey]
  );

  const shown = rows.filter(
    (r) =>
      (f === "All" || r[filterKey] === f) &&
      searchKeys.some((k) => String(r[k]).toLowerCase().includes(q.toLowerCase()))
  );

  const current = rows.find((r) => r.id === openId);
  const setStatus = (id, status) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));

  const cell = (r, c) =>
    c.key === "status" ? <Badge status={r.status} /> : c.fmt ? c.fmt(r[c.key]) : r[c.key];

  return (
    <div className="space-y-5">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="flex flex-wrap gap-3">
        <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#e6ded8] bg-white px-3 sm:max-w-[340px]">
          <Search size={16} className="text-[#736153]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}…`}
            className="w-full bg-transparent text-[14px] outline-none"
          />
        </label>
        {filterKey && (
          <select
            value={f}
            onChange={(e) => setF(e.target.value)}
            className="h-10 rounded-lg border border-[#e6ded8] bg-white px-3 text-[13.5px] outline-none"
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {o === "All" ? "All statuses" : o}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e6ded8] bg-white">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-[#e6ded8] text-[12px] text-[#736153]">
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-5 py-3 font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr
                key={r.id}
                onClick={() => setOpenId(r.id)}
                className="cursor-pointer border-b border-[#efe7de] last:border-0 hover:bg-[#faf6f1]"
              >
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-5 py-3">
                    {cell(r, c)}
                  </td>
                ))}
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-[#736153]">
                  Nothing matches these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {current && (
        <Modal
          title={current.id}
          onClose={() => setOpenId(null)}
          footer={statusActions.map(([label, status]) => (
            <button
              key={label}
              type="button"
              onClick={() => setStatus(current.id, status)}
              className="rounded-lg bg-[#9f5639] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#8a4a30]"
            >
              {label}
            </button>
          ))}
        >
          <dl className="space-y-3">
            {Object.entries(current).map(([k, v]) => {
              const col = columns.find((c) => c.key === k);
              return (
                <div key={k} className="flex justify-between gap-4 text-[13.5px]">
                  <dt className="capitalize text-[#736153]">{col?.label || k}</dt>
                  <dd className="text-right">
                    {k === "status" ? <Badge status={v} /> : col?.fmt ? col.fmt(v) : String(v)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Modal>
      )}
    </div>
  );
}