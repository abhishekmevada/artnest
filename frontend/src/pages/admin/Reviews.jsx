import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Star,
  CheckCircle2,
  X,
  Search,
  Trash2,
  MessageSquare,
  Reply,
  ChevronDown,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

const SEED_REVIEWS = [
  {
    id: "REV-1",
    customer: "Priya Sharma",
    piece: "Golden Silence",
    artist: "Aarav Mehta",
    rating: 5,
    review: "Beautifully packed and even better in person.",
    date: "18 Sep 2026",
    status: "Published",
  },
  {
    id: "REV-2",
    customer: "Rahul Kapoor",
    piece: "Monsoon Reverie",
    artist: "Riya Sharma",
    rating: 4,
    review: "Great print quality, shipping took a little long.",
    date: "17 Sep 2026",
    status: "Published",
    reply:
      "Thank you Rahul! Sorry about the delay, I will ship faster next time.",
  },
  {
    id: "REV-3",
    customer: "Sneha Iyer",
    piece: "Bronze Whisper",
    artist: "Kabir Verma",
    rating: 5,
    review: "Stunning craftsmanship, worth every rupee.",
    date: "16 Sep 2026",
    status: "Pending",
  },
  {
    id: "REV-4",
    customer: "Kunal Bose",
    piece: "Marble Repose",
    artist: "Kabir Verma",
    rating: 2,
    review: "Piece arrived with a small chip on the base.",
    date: "15 Sep 2026",
    status: "Hidden",
  },
];

const STORAGE_KEY = "artnest_reviews";
const STATUSES = ["Published", "Pending", "Hidden"];
const FILTERS = ["All", "5 Star", "4 Star", "3 & Below"];

function normalize(raw) {
  return {
    id: raw._id,

    customer: raw.buyer_id?.name || "Anonymous",

    piece: raw.artwork_id?.title || "Untitled",

    artist: raw.artwork_id?.artist_id?.name || "Unknown artist",

    rating: Math.max(0, Math.min(5, Number(raw.rating) || 0)),

    review: raw.comment || "",

    date: raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",

    status: raw.status || "Published",

    reply: raw.reply?.text || "",
  };
}

function loadReviews() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(parsed) && parsed.length) {
      const isLegacy = parsed.some(
        (r) => r && ("buyer" in r || "artwork" in r || "comment" in r),
      );
      const list = parsed.map(normalize);
      if (isLegacy) {
        const ids = new Set(list.map((r) => r.id));
        list.push(...SEED_REVIEWS.map(normalize).filter((r) => !ids.has(r.id)));
      }
      return list;
    }
  } catch {}
  return SEED_REVIEWS.map(normalize);
}

function persist(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const STATUS_STYLES = {
  Published: "bg-[#EDF3E6] text-[#4F6B3A] border-[#DCE7CE]",
  Pending: "bg-[#FBF2E1] text-[#9A6B1F] border-[#F2E2C4]",
  Hidden: "bg-[#F1EDE8] text-[#8A7A6A] border-[#E4DCD2]",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-semibold ${
        STATUS_STYLES[status] ?? STATUS_STYLES.Hidden
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

function Stars({ rating }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= rating
              ? "fill-[#9F5639] text-[#9F5639]"
              : "fill-transparent text-[#DCD2C8]"
          }
        />
      ))}
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-[#E8E1DB] bg-white px-4 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A28F7D]">
        {label}
      </p>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[22px] font-semibold leading-none tabular-nums text-[#362F26]">
          {value}
        </span>
        {hint && <span className="text-[12px] text-[#A28F7D]">{hint}</span>}
      </div>
    </div>
  );
}

const ACTION_TONES = {
  neutral:
    "border-[#E8E1DB] text-[#6B5B4C] hover:bg-[#F7F3EE] hover:text-[#362F26]",
  positive:
    "border-[#E8E1DB] text-[#4F6B3A] hover:bg-[#F1F6EA] hover:border-[#D8E2CB]",
  danger:
    "border-transparent text-[#A28F7D] hover:bg-[#FBEAE7] hover:text-[#9B3B2E]",
};

function ActionButton({ icon: Icon, tone = "neutral", children, ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors ${ACTION_TONES[tone]}`}
    >
      <Icon size={14} />
      {children}
    </button>
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-[#362F26]/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#E8E1DB] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E8E1DB] px-6 py-4">
          <h2 className="text-[16px] font-semibold text-[#362F26]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#A28F7D] transition-colors hover:text-[#362F26]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-[#E8E1DB] bg-[#F9F8F6] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [openReplies, setOpenReplies] = useState(() => new Set());

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/admin/get-admin-reviews`,
          {
            headers: {
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
          },
        );

        const reviewList = response.data.reviews || [];

        setReviews(reviewList.map(normalize));
      } catch (err) {
        console.error("Error fetching reviews:", err);

        setError(err.response?.data?.message || "Failed to fetch reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  function toggleReply(id) {
    setOpenReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => {
    const base = {
      All: reviews.length,
      "5 Star": 0,
      "4 Star": 0,
      "3 & Below": 0,
    };
    reviews.forEach((r) => {
      base[r.rating >= 5 ? "5 Star" : r.rating >= 4 ? "4 Star" : "3 & Below"] +=
        1;
    });
    return base;
  }, [reviews]);

  const average = useMemo(() => {
    if (!reviews.length) return "—";
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      if (
        filter !== "All" &&
        (r.rating >= 5 ? "5 Star" : r.rating >= 4 ? "4 Star" : "3 & Below") !==
          filter
      )
        return false;
      if (!q) return true;
      return [r.customer, r.piece, r.artist, r.review].some((v) =>
        String(v).toLowerCase().includes(q),
      );
    });
  }, [reviews, filter, query]);

  function setStatus(id, status) {
    const target = reviews.find((r) => r.id === id);
    if (!target || target.status === status) return;

    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setToast({ msg: `Review marked as ${status.toLowerCase()}.` });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
    setToast({ msg: "Review deleted successfully." });
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-['Plus_Jakarta_Sans']">
      <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-6 sm:py-10">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A28F7D]">
            ArtNest Admin
          </p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-tight text-[#362F26]">
            Reviews
          </h1>
          <p className="mt-1 text-[13.5px] text-[#8B7A6A]">
            Moderate customer feedback and keep your gallery's reputation
            glowing.
          </p>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total reviews" value={counts.All} />
          <Stat label="Average rating" value={average} hint="/ 5" />
          <Stat label="5-star reviews" value={counts["5 Star"]} />
          <Stat label="3 stars & below" value={counts["3 & Below"]} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-fit flex-wrap items-center gap-1 rounded-full border border-[#E8E1DB] bg-white p-1">
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-medium transition-colors ${
                    active
                      ? "bg-[#362F26] text-white shadow-sm"
                      : "text-[#8B7A6A] hover:bg-[#F7F3EE] hover:text-[#362F26]"
                  }`}
                >
                  {f}
                  <span
                    className={`text-[11px] tabular-nums ${
                      active ? "text-white/55" : "text-[#BCAD9D]"
                    }`}
                  >
                    {counts[f] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative sm:w-64 lg:w-72">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A28F7D]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reviews…"
              className="h-10 w-full rounded-full border border-[#E8E1DB] bg-white pl-9 pr-9 text-[13.5px] text-[#362F26] outline-none transition placeholder:text-[#B8A898] focus:border-[#C7B5A4] focus:ring-4 focus:ring-[#362F26]/5"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A28F7D] transition-colors hover:text-[#362F26]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-3.5">
          {loading && (
            <div className="rounded-2xl border border-[#E8E1DB] bg-white px-6 py-10 text-center text-[14px] text-[#A28F7D]">
              Loading reviews...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-[#F6DFDA] bg-white px-6 py-10 text-center text-[14px] text-[#9B3B2E]">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            visible.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-[#E8E1DB] bg-white p-5 shadow-[0_1px_2px_rgba(54,47,38,0.04)] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1EAE3] text-[13px] font-semibold text-[#9F5639]">
                    {initials(r.customer)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold text-[#362F26]">
                      {r.customer}
                    </p>

                    <p className="mt-0.5 text-[13px] text-[#A28F7D]">
                      on{" "}
                      <span className="font-medium text-[#6B5B4C]">
                        {r.piece}
                      </span>{" "}
                      by {r.artist}
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <Stars rating={r.rating} />
                      <span className="text-[12.5px] font-medium text-[#8B7A6A]">
                        {r.rating.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-3 text-[14px] leading-relaxed text-[#4A3F33]">
                      {r.review}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0EBE6] pt-3.5">
                      <span className="text-[12.5px] text-[#A28F7D]">
                        {r.date}
                      </span>

                      {r.reply && (
                        <button
                          onClick={() => toggleReply(r.id)}
                          aria-expanded={openReplies.has(r.id)}
                          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9F5639]"
                        >
                          <Reply size={14} />
                          {openReplies.has(r.id)
                            ? "Hide artist reply"
                            : "View artist reply"}
                          <ChevronDown
                            size={14}
                            className={
                              openReplies.has(r.id) ? "rotate-180" : ""
                            }
                          />
                        </button>
                      )}
                    </div>

                    {openReplies.has(r.id) && r.reply && (
                      <div className="mt-3 rounded-xl border border-[#F0EBE6] bg-[#FAF6F2] px-4 py-3.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A28F7D]">
                          Reply from {r.artist}
                        </p>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#4A3F33]">
                          {r.reply}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}

          {!loading && !error && visible.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E0D8D0] bg-white/60 px-6 py-14 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1EAE3] text-[#9F5639]">
                <MessageSquare size={18} />
              </div>

              <p className="mt-3 text-[14.5px] font-semibold text-[#362F26]">
                No reviews found
              </p>

              <p className="mt-1 max-w-xs text-[13px] text-[#A28F7D]">
                {reviews.length === 0
                  ? "Reviews will appear here once customers share their feedback."
                  : "Try a different filter or search term."}
              </p>
            </div>
          )}
        </div>

        {visible.length === 0 && (
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E0D8D0] bg-white/60 px-6 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1EAE3] text-[#9F5639]">
              <MessageSquare size={18} />
            </div>
            <p className="mt-3 text-[14.5px] font-semibold text-[#362F26]">
              No reviews found
            </p>
            <p className="mt-1 max-w-xs text-[13px] text-[#A28F7D]">
              {reviews.length === 0
                ? "Reviews will appear here once customers share their feedback."
                : "Try a different filter or search term."}
            </p>
          </div>
        )}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete review"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="h-10 rounded-full border border-[#E8E1DB] px-5 text-[14px] text-[#362F26] transition-colors hover:bg-[#F7F3EE]"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="h-10 rounded-full bg-[#9B3B2E] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#7a2e23]"
            >
              Delete
            </button>
          </>
        }
      >
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FBEAE7] text-[#9B3B2E]">
            <Trash2 size={16} />
          </div>
          <p className="text-[13.5px] leading-relaxed text-[#736153]">
            Are you sure you want to delete the review by{" "}
            <span className="font-semibold text-[#362F26]">
              {deleteTarget?.customer}
            </span>{" "}
            for{" "}
            <span className="font-semibold text-[#362F26]">
              {deleteTarget?.piece}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
      </Modal>

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 rounded-xl bg-[#362F26] px-4 py-3 text-[13.5px] text-white shadow-lg"
          style={{ animation: "toastIn .18s ease-out" }}
          role="status"
        >
          <CheckCircle2 size={16} className="text-[#B9D3A6]" />
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
