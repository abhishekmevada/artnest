import React, { useEffect, useState } from "react";
import { Gem, Eye, Check, X, Pencil, AlertCircle, CheckCircle2 } from "lucide-react";

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const SCULPTURES = [
  { id: "SC-1", title: "Bronze Whisper", artist: "Kabir Verma", material: "Cast Bronze", height: "42 cm", price: 64200, status: "Pending", color: "#A28F7D" },
  { id: "SC-2", title: "Marble Repose", artist: "Kabir Verma", material: "White Marble", height: "58 cm", price: 98000, status: "Approved", color: "#9F5639" },
  { id: "SC-3", title: "Terracotta Dream", artist: "Meera Iyer", material: "Terracotta", height: "30 cm", price: 27500, status: "Approved", color: "#C98A68" },
  { id: "SC-4", title: "Standing Figure III", artist: "Farhan Ali", material: "Welded Steel", height: "76 cm", price: 112000, status: "Approved", color: "#736153" },
  { id: "SC-5", title: "Clay Vessel Study", artist: "Devika Rao", material: "Stoneware", height: "22 cm", price: 18900, status: "In review", color: "#D9C7B2" },
];

const STATUS_OPTIONS = ["Approved", "Pending", "In review"];

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] placeholder:text-[#A28F7D] focus:outline-none focus:border-[#9F5639] transition-colors";

function StatusBadge({ status }) {
  const map = {
    Approved: "bg-[#E7EEDD] text-[#4C6B3F]",
    Pending: "bg-[#F6E7D0] text-[#8A5A22]",
    "In review": "bg-[#F6E7D0] text-[#8A5A22]",
  };
  const cls = map[status] || "bg-[#EFE9E1] text-[#736153]";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-[#736153] mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[11.5px] uppercase tracking-wide text-[#A28F7D]">{label}</p>
      <div className="mt-1 text-[14px] text-[#362F26] font-medium">{value}</div>
    </div>
  );
}

function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#362F26]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-[#E8E1DB] shadow-xl">
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-6 py-4 border-b border-[#E8E1DB]">
          <h2 className="text-[16px] font-semibold text-[#362F26]">{title}</h2>
          <button onClick={onClose} className="text-[#A28F7D] hover:text-[#362F26] transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-[#E8E1DB] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function EditForm({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      initial
        ? {
            title: initial.title,
            artist: initial.artist,
            material: initial.material,
            height: initial.height,
            price: String(initial.price),
            status: initial.status,
          }
        : null
    );
  }, [open, initial]);

  if (!open || !form) return null;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.artist.trim()) return setError("Artist name is required.");
    if (!form.material.trim()) return setError("Material is required.");
    if (!form.height.trim()) return setError("Height is required.");
    const price = Number(form.price);
    if (!form.price || !Number.isFinite(price) || price <= 0)
      return setError("Enter a valid price greater than 0.");

    setError("");
    onSave({
      title: form.title.trim(),
      artist: form.artist.trim(),
      material: form.material.trim(),
      height: form.height.trim(),
      price,
      status: form.status,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit sculpture"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-full border border-[#E8E1DB] text-[14px] text-[#362F26] hover:bg-[#F7F3EE] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="sculpture-form"
            className="h-10 px-5 rounded-full bg-[#9F5639] text-white text-[14px] font-medium hover:bg-[#8A4930] transition-colors"
          >
            Save changes
          </button>
        </>
      }
    >
      <form id="sculpture-form" onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-[#F6DFDA] text-[#9B3B2E] px-3 py-2.5 text-[13px]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Field label="Title">
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Artist">
          <input type="text" value={form.artist} onChange={(e) => set("artist", e.target.value)} className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Material">
            <input type="text" value={form.material} onChange={(e) => set("material", e.target.value)} className={inputCls} />
          </Field>

          <Field label="Height">
            <input type="text" value={form.height} onChange={(e) => set("height", e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Price (₹)">
          <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="appearance-none w-full h-10 px-3.5 rounded-xl border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] focus:outline-none focus:border-[#9F5639] cursor-pointer"
          >
            {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      </form>
    </Modal>
  );
}

export default function Sculptures() {
  const [items, setItems] = useState(SCULPTURES);
  const [modal, setModal] = useState(null); // { mode: "view" | "edit", id }
  const [toast, setToast] = useState(null);

  const active = modal?.id ? items.find((s) => s.id === modal.id) : null;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function setStatus(id, status) {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    setToast({ msg: `Marked as ${status}.` });
  }

  function handleSave(data) {
    if (modal?.mode === "edit" && modal.id) {
      setItems((prev) => prev.map((s) => (s.id === modal.id ? { ...s, ...data } : s)));
      setToast({ msg: "Sculpture updated." });
    }
    setModal(null);
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto font-['Plus_Jakarta_Sans']">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((s) => (
          <div key={s.id} className="bg-white border border-[#E8E1DB] rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="h-32 flex items-center justify-center" style={{ backgroundColor: s.color }}>
              <Gem size={32} className="text-white/80" />
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold text-[#362F26] truncate">{s.title}</p>
                  <p className="text-[13px] text-[#A28F7D] truncate mt-0.5">{s.artist}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>

              <div className="mt-3 text-[13px] text-[#A28F7D]">
                {s.material} · {s.height}
              </div>

              <div className="mt-3 text-[15px] font-semibold text-[#362F26]">
                {formatINR(s.price)}
              </div>

              <div className="mt-5 pt-4 border-t border-[#E8E1DB] flex items-center gap-4">
                <button
                  title="View"
                  onClick={() => setModal({ mode: "view", id: s.id })}
                  className="text-[#A28F7D] hover:text-[#362F26] transition-colors"
                >
                  <Eye size={18} />
                </button>
                <button
                  title="Edit"
                  onClick={() => setModal({ mode: "edit", id: s.id })}
                  className="text-[#A28F7D] hover:text-[#362F26] transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button
                  title="Approve"
                  onClick={() => setStatus(s.id, "Approved")}
                  className="text-[#4C6B3F] hover:text-[#3a5230] transition-colors"
                >
                  <Check size={18} />
                </button>
                <button
                  title="Reject"
                  onClick={() => setStatus(s.id, "In review")}
                  className="text-[#9B3B2E] hover:text-[#7a2e23] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View modal */}
      <Modal
        open={modal?.mode === "view"}
        onClose={() => setModal(null)}
        title="Sculpture details"
        footer={
          <>
            <button
              onClick={() => setModal(null)}
              className="h-10 px-5 rounded-full border border-[#E8E1DB] text-[14px] text-[#362F26] hover:bg-[#F7F3EE] transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setModal({ mode: "edit", id: modal.id })}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#9F5639] text-white text-[14px] font-medium hover:bg-[#8A4930] transition-colors"
            >
              <Pencil size={15} /> Edit
            </button>
          </>
        }
      >
        {active && (
          <div className="space-y-5">
            <div
              className="h-36 w-full rounded-xl flex items-center justify-center"
              style={{ backgroundColor: active.color }}
            >
              <Gem size={32} className="text-white/80" />
            </div>

            <div>
              <h3 className="text-[18px] font-semibold text-[#362F26]">{active.title}</h3>
              <p className="text-[13.5px] text-[#A28F7D] mt-0.5">{active.artist}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Detail label="Sculpture ID" value={active.id} />
              <Detail label="Material" value={active.material} />
              <Detail label="Height" value={active.height} />
              <Detail label="Price" value={formatINR(active.price)} />
              <Detail label="Status" value={<StatusBadge status={active.status} />} />
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <EditForm
        open={modal?.mode === "edit"}
        initial={active}
        onClose={() => setModal(null)}
        onSave={handleSave}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 rounded-xl bg-[#362F26] text-white px-4 py-3 text-[13.5px] shadow-lg">
          <CheckCircle2 size={16} className="text-[#B9D3A6]" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}