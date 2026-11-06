import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, ChevronDown, Eye } from "lucide-react";
import { Modal } from "./shared";
import { API_BASE_URL } from "@/config/api";

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const CUSTOM_REQUESTS = [
  {
    id: "CR-501",
    customer: "Priya Sharma",
    type: "Portrait Commission",
    artist: "Aarav Mehta",
    budget: 45000,
    deadline: "05 Oct 2026",
    requested: "18 Sep 2026",
    status: "Not started",
  },
  {
    id: "CR-500",
    customer: "Rahul Kapoor",
    type: "Custom Sculpture",
    artist: "Kabir Verma",
    budget: 120000,
    deadline: "20 Oct 2026",
    requested: "17 Sep 2026",
    status: "Sketching",
  },
  {
    id: "CR-499",
    customer: "Sneha Iyer",
    type: "Digital Illustration",
    artist: "Riya Sharma",
    budget: 22000,
    deadline: "28 Sep 2026",
    requested: "16 Sep 2026",
    status: "Sketching",
  },
  {
    id: "CR-498",
    customer: "Vikram Nair",
    type: "Abstract Canvas",
    artist: "Ananya Kapoor",
    budget: 38000,
    deadline: "12 Oct 2026",
    requested: "14 Sep 2026",
    status: "In progress",
  },
  {
    id: "CR-497",
    customer: "Ishaan Joshi",
    type: "Family Portrait",
    artist: "Aarav Mehta",
    budget: 52000,
    deadline: "01 Oct 2026",
    requested: "10 Sep 2026",
    status: "Finishing",
  },
  {
    id: "CR-496",
    customer: "Divya Menon",
    type: "Pet Portrait",
    artist: "Devika Rao",
    budget: 15000,
    deadline: "22 Sep 2026",
    requested: "08 Sep 2026",
    status: "Not started",
  },
];

const STATUSES = [
  "All statuses",
  "Not started",
  "Sketching",
  "In progress",
  "Finishing",
  "Completed",
];

function mapRequestStatus(status) {
  const statusMap = {
    placed: "Not started",
    pending: "Not started",
    not_started: "Not started",
    sketching: "Sketching",
    in_progress: "In progress",
    processing: "In progress",
    finishing: "Finishing",
    delivered: "Completed",
    completed: "Completed",
  };

  return statusMap[status?.toLowerCase()] || "Not started";
}

function StatusBadge({ status }) {
  const map = {
    "Not started": "bg-[#EFE9E1] text-[#736153]",
    Sketching: "bg-[#F6E7D0] text-[#8A5A22]",
    "In progress": "bg-[#F6E7D0] text-[#8A5A22]",
    Finishing: "bg-[#E7EEDD] text-[#4C6B3F]",
    Completed: "bg-[#E7EEDD] text-[#4C6B3F]",
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

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00` : d);
  return isNaN(dt)
    ? d
    : dt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};
function mapCustomRequest(request) {
  return {
    id: request.customArtworkId || request._id,

    dbId: request._id,

    customer: request.name || "Unknown Customer",

    artist: request.preferedArtist?.name || "Not assigned",

    type: request.typeofArtwork || "Not specified",

    // Backend field is spelled "budge"
    budget: request.budge || "—",

    deadline: fmtDate(request.neededDate),

    requested: fmtDate(request.createdAt),

    status: mapRequestStatus(request.status),

    email: request.email || "—",
    phone: request.phonenumber ? `+91 ${request.phonenumber}` : "—",

    size: request.size || "—",
    style: request.style || "—",
    description: request.description || "—",
    notes: request.notes || "—",

    images: request.images || [],
  };
}

function loadBuyerRequests() {
  try {
    const list =
      JSON.parse(localStorage.getItem("artnest_custom_requests")) || [];
    return list.map((r) => ({
      ...r,
      customer: r.name || "Buyer",
      deadline: fmtDate(r.deadline),
      requested: fmtDate(r.requested),
      status: ["Not started", "Sketching", "In progress", "Finishing"].includes(
        r.status,
      )
        ? r.status
        : "Not started",
    }));
  } catch {
    return [];
  }
}

export default function CustomArtRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(STATUSES[0]);

  useEffect(() => {
    const fetchCustomRequests = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/admin/get-custom-artwork`,
          {
            headers: {
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
          },
        );

        const requestList = response.data.getCustomArtwork || [];

        setRequests(requestList.map(mapCustomRequest));
      } catch (err) {
        console.error("Error fetching custom artwork:", err);

        setError(
          err.response?.data?.message ||
            "Failed to fetch custom artwork requests.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomRequests();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (status !== STATUSES[0] && r.status !== status) return false;
      const q = search.toLowerCase();
      return (
        r.customer.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
      );
    });
  }, [requests, search, status]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 font-['Plus_Jakarta_Sans']">
      {loading && (
        <div className="py-16 text-center text-[#A28F7D]">
          Loading custom artwork requests...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-[#F6DFDA] px-4 py-3 text-sm text-[#9B3B2E]">
          {error}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[280px] max-w-[800px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A28F7D]"
          />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-full border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] placeholder:text-[#A28F7D] focus:outline-none focus:border-[#9F5639] transition-colors"
          />
        </div>

        <div className="relative ml-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none h-11 pl-4 pr-10 rounded-full border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] focus:outline-none focus:border-[#9F5639] cursor-pointer"
          >
            {STATUSES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A28F7D] pointer-events-none"
          />
        </div>
      </div>

      {viewing && (
        <Modal title={`Request ${viewing.id}`} onClose={() => setViewing(null)}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
            {[
              ["Customer", viewing.customer],
              ["Email", viewing.email],
              ["Phone", viewing.phone],
              ["Preferred artist", viewing.artist],
              ["Artwork type", viewing.type],
              ["Size", viewing.size],
              ["Style", viewing.style],
              [
                "Budget",
                typeof viewing.budget === "number"
                  ? formatINR(viewing.budget)
                  : viewing.budget,
              ],
              ["Deadline", viewing.deadline],
              ["Requested on", viewing.requested],
              ["Status", viewing.status],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11.5px] uppercase tracking-[0.08em] text-[#A28F7D]">
                  {k}
                </dt>
                <dd className="mt-0.5 break-words text-[#362F26]">
                  {v || "—"}
                </dd>
              </div>
            ))}
          </dl>
          {[
            ["Project description", viewing.description],
            ["Additional notes", viewing.notes],
          ].map(([k, v]) => (
            <div key={k} className="mt-5">
              <p className="text-[11.5px] uppercase tracking-[0.08em] text-[#A28F7D]">
                {k}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-[#4A4037]">
                {v || "—"}
              </p>
            </div>
          ))}
          {viewing.images?.length > 0 && (
            <div className="mt-5">
              <p className="text-[11.5px] uppercase tracking-[0.08em] text-[#A28F7D]">
                Reference images
              </p>
              <ul className="mt-1 list-disc pl-5 text-[14px] text-[#4A4037]">
                {viewing.images.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </Modal>
      )}

      {!loading && !error && (
        <div className="bg-white border border-[#E8E1DB] rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-left min-w-[1000px] border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.08em] text-[#A28F7D] border-b border-[#E8E1DB]">
                <th className="px-6 py-4 font-medium">Request</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Assigned Artist</th>
                <th className="px-6 py-4 font-medium">Budget</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#E8E1DB] last:border-b-0 hover:bg-[#F9F8F6] transition-colors"
                >
                  <td className="px-6 py-5 text-[14px] text-[#A28F7D]">
                    {r.id}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-[#362F26]">
                    {r.customer}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-[#362F26]">
                    {r.type}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-[#362F26]">
                    {r.artist}
                  </td>
                  <td className="px-6 py-5 text-[14px] font-medium text-[#362F26]">
                    {typeof r.budget === "number"
                      ? formatINR(r.budget)
                      : r.budget}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-[#A28F7D] whitespace-nowrap">
                    {r.deadline}
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-5">
                    <button
                      type="button"
                      onClick={() => setViewing(r)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#E8E1DB] px-3 text-[12.5px] font-medium text-[#6B5B4C] transition-colors hover:bg-[#F7F3EE] hover:text-[#362F26]"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-[14px] text-[#A28F7D]"
                  >
                    No requests match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
