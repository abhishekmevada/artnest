import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye, Ban, CheckCircle2, X, AlertCircle } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] placeholder:text-[#A28F7D] focus:outline-none focus:border-[#9F5639] transition-colors";

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mapBuyer(buyer) {
  return {
    id: buyer.id,
    name: buyer.name || "Unknown Buyer",
    email: buyer.email || "—",
    status: buyer.status?.toLowerCase() === "active" ? "Active" : "Blocked",
    role: buyer.role || "buyer",
    joined: buyer.createdAt
      ? new Date(buyer.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
  };
}

function StatusBadge({ status }) {
  const map = {
    Active: "bg-[#E7EEDD] text-[#4C6B3F]",
    Blocked: "bg-[#F6DFDA] text-[#9B3B2E]",
  };
  const cls = map[status] || "bg-[#EFE9E1] text-[#736153]";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap ${cls}`}
    >
      {status}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-[#736153] mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[11.5px] uppercase tracking-wide text-[#A28F7D]">
        {label}
      </p>
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
      <div
        className="absolute inset-0 bg-[#362F26]/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-[#E8E1DB] shadow-xl">
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-6 py-4 border-b border-[#E8E1DB]">
          <h2 className="text-[16px] font-semibold text-[#362F26]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#A28F7D] hover:text-[#362F26] transition-colors"
            aria-label="Close"
          >
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
            name: initial.name,
            email: initial.email,
            status: initial.status,
          }
        : null,
    );
  }, [open, initial]);

  if (!open || !form) return null;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.email.trim() || !form.email.includes("@"))
      return setError("Enter a valid email address.");

    setError("");
    onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      status: form.status,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit user"
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
            form="user-form"
            className="h-10 px-5 rounded-full bg-[#9F5639] text-white text-[14px] font-medium hover:bg-[#8A4930] transition-colors"
          >
            Save changes
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-[#F6DFDA] text-[#9B3B2E] px-3 py-2.5 text-[13px]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="appearance-none w-full h-10 px-3.5 rounded-xl border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] focus:outline-none focus:border-[#9F5639] cursor-pointer"
          >
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>
        </Field>
      </form>
    </Modal>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // { mode: "view" | "edit", id }
  const [toast, setToast] = useState(null);

  const activeUser = modal?.id ? users.find((u) => u.id === modal.id) : null;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/admin/get-buyer`,
          {
            headers: {
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
          },
        );

        const buyerList = response.data.buyers || [];

        setUsers(buyerList.map(mapBuyer));
      } catch (err) {
        console.error("Error fetching buyers:", err);

        setError(err.response?.data?.message || "Failed to fetch buyers.");
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, []);

  function toggleBlock(id) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === "Blocked" ? "Active" : "Blocked";
          setToast({ msg: `User marked as ${nextStatus}.` });
          return { ...u, status: nextStatus };
        }
        return u;
      }),
    );
  }

  function handleSave(data) {
    if (modal?.mode === "edit" && modal.id) {
      setUsers((prev) =>
        prev.map((u) => (u.id === modal.id ? { ...u, ...data } : u)),
      );
      setToast({ msg: "User details updated." });
    }
    setModal(null);
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 font-['Plus_Jakarta_Sans']">
      <div className="relative w-full max-w-[320px]">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A28F7D]"
        />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-full border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] placeholder:text-[#A28F7D] focus:outline-none focus:border-[#9F5639] transition-colors"
        />
      </div>

      <div className="bg-white border border-[#E8E1DB] rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left min-w-[1000px] border-collapse">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.08em] text-[#A28F7D] border-b border-[#E8E1DB]">
              <th className="px-6 py-4 font-medium">Buyer</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-[#A28F7D]"
                >
                  Loading buyers...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-[#9B3B2E]"
                >
                  {error}
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-b border-[#E8E1DB] last:border-b-0 hover:bg-[#F9F8F6] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d6c4ae] to-[#b99a78] flex items-center justify-center text-white text-[12px] font-semibold shrink-0">
                      {getInitials(u.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-[#362F26] truncate">
                        {u.name}
                      </p>
                      <p className="text-[13px] text-[#A28F7D] truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-[14px] text-[#362F26] capitalize">
                  {u.role}
                </td>

                <td className="px-6 py-4 text-[14px] text-[#A28F7D] whitespace-nowrap">
                  {u.joined}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={u.status} />
                </td>

                <td className="px-6 py-4">
                  <button
                    title="View"
                    onClick={() => setModal({ mode: "view", id: u.id })}
                    className="text-[#A28F7D] hover:text-[#362F26] transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-[14px] text-[#A28F7D]"
                >
                  No users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Modal
        open={modal?.mode === "view"}
        onClose={() => setModal(null)}
        title="User details"
        footer={
          <>
            <button
              onClick={() => setModal(null)}
              className="h-10 px-5 rounded-full border border-[#E8E1DB] text-[14px] text-[#362F26] hover:bg-[#F7F3EE] transition-colors"
            >
              Close
            </button>
          </>
        }
      >
        {activeUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#d6c4ae] to-[#b99a78] flex items-center justify-center text-white text-[18px] font-semibold shrink-0">
                {getInitials(activeUser.name)}
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-[#362F26]">
                  {activeUser.name}
                </h3>
                <p className="text-[13.5px] text-[#A28F7D] mt-0.5">
                  {activeUser.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Detail label="Buyer ID" value={activeUser.id} />
              <Detail
                label="Status"
                value={<StatusBadge status={activeUser.status} />}
              />
              <Detail label="Role" value={activeUser.role} />
              <Detail label="Joined" value={activeUser.joined} />
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <EditForm
        open={modal?.mode === "edit"}
        initial={activeUser}
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
