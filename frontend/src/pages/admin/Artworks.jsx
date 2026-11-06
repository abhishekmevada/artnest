import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  ChevronDown,
  Image as ImageIcon,
  Eye,
  Check,
  X,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ------------------------- Real online images ------------------------- */
export const ARTWORKS = [
  {
    id: "AW-1",
    title: "Golden Silence",
    artist: "Aarav Mehta",
    category: "Painting",
    medium: "Acrylic on Canvas",
    price: 18500,
    stock: "1 of 1",
    status: "Approved",
    image:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "AW-2",
    title: "Monsoon Reverie",
    artist: "Riya Sharma",
    category: "Digital Art",
    medium: "Digital Print",
    price: 32400,
    stock: "3 of 5",
    status: "Approved",
    image:
      "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "AW-3",
    title: "Bronze Whisper",
    artist: "Kabir Verma",
    category: "Sculpture",
    medium: "Cast Bronze",
    price: 64200,
    stock: "1 of 1",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "AW-4",
    title: "City in Ochre",
    artist: "Ananya Kapoor",
    category: "Abstract Art",
    medium: "Oil on Canvas",
    price: 21800,
    stock: "1 of 1",
    status: "Approved",
    image:
      "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "AW-5",
    title: "Still Water Study",
    artist: "Meera Iyer",
    category: "Photography",
    medium: "Archival Print",
    price: 15600,
    stock: "5 of 10",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "AW-6",
    title: "Ink and Rust",
    artist: "Riya Sharma",
    category: "Digital Art",
    medium: "Mixed Media",
    price: 12400,
    stock: "1 of 1",
    status: "Rejected",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "AW-7",
    title: "Terracotta Dream",
    artist: "Meera Iyer",
    category: "Sculpture",
    medium: "Terracotta",
    price: 27500,
    stock: "1 of 1",
    status: "Approved",
    image:
      "https://images.unsplash.com/photo-1561839561-b13bcfe95249?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "AW-8",
    title: "Marble Repose",
    artist: "Kabir Verma",
    category: "Sculpture",
    medium: "White Marble",
    price: 98000,
    stock: "1 of 1",
    status: "Approved",
    image:
      "https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "AW-9",
    title: "Standing Figure III",
    artist: "Farhan Ali",
    category: "Sculpture",
    medium: "Welded Steel",
    price: 112000,
    stock: "1 of 1",
    status: "Approved",
    image: "",
  },
  {
    id: "AW-10",
    title: "Clay Vessel Study",
    artist: "Devika Rao",
    category: "Sculpture",
    medium: "Stoneware",
    price: 18900,
    stock: "1 of 1",
    status: "Pending",
    image: "",
  },
];

const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;
const EXTRA_IMAGES = {
  Painting: [
    "1579783902614-a3fb3927b6a5",
    "1578926288207-a90a5366759d",
    "1549289524-06cf8837ace5",
  ].map(unsplash),
  "Digital Art": [
    "1620121692029-d088224ddc74",
    "1513364776144-60967b0f800f",
    "1547891654-e66ed7ebb968",
  ].map(unsplash),
  Sculpture: [
    "1554188248-986adbb73be4",
    "1544967082-d9d25d867d66",
    "1577083552431-6e5fd01aa342",
  ].map(unsplash),
  "Abstract Art": [
    "1549289524-06cf8837ace5",
    "1541961017774-22349e4a1262",
    "1549490349-8643362247b5",
  ].map(unsplash),
  Photography: [
    "1519681393784-d120267933ba",
    "1500534623283-312aade485b7",
    "1500530855697-b586d89ba3ee",
  ].map(unsplash),
};

function getArtworkImages(a) {
  if (a.images?.length) {
    return a.images.slice(0, 3);
  }

  if (a.image) {
    return [a.image];
  }

  return EXTRA_IMAGES[a.category] || [];
}

const CATEGORIES = [
  "All categories",
  "Painting",
  "Digital Art",
  "Sculpture",
  "Ceramics",
  "Photography",
  "Textile",
  "Printmaking",
  "Abstract Art",
];
const PRICE_BANDS = [
  "Any price",
  "Under ₹20,000",
  "₹20,000 – ₹60,000",
  "Above ₹60,000",
];
const STATUSES = ["All statuses", "Approved", "Pending", "Rejected"];

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] placeholder:text-[#A28F7D] focus:outline-none focus:border-[#9F5639] transition-colors";
const selectCls =
  "appearance-none w-full h-10 pl-3.5 pr-9 rounded-xl border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] focus:outline-none focus:border-[#9F5639] cursor-pointer transition-colors";

function inBand(price, band) {
  if (band === PRICE_BANDS[1]) return price < 20000;
  if (band === PRICE_BANDS[2]) return price >= 20000 && price <= 60000;
  if (band === PRICE_BANDS[3]) return price > 60000;
  return true;
}

/* ------------------------------- UI bits ------------------------------- */

function StatusBadge({ status }) {
  const map = {
    Approved: "bg-[#E7EEDD] text-[#4C6B3F]",
    Pending: "bg-[#F6E7D0] text-[#8A5A22]",
    Rejected: "bg-[#F6DFDA] text-[#9B3B2E]",
  };
  const cls = map[status] || "bg-[#EFE9E1] text-[#736153]";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap ${cls}`}
    >
      {status}
    </span>
  );
}

/* Image with neutral placeholder fallback */
function ArtworkImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#F7F3EE] ${className}`}>
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={24} className="text-[#C4B7A8]" />
        </div>
      )}
    </div>
  );
}

function ArtworkGallery({ artwork }) {
  const images = getArtworkImages(artwork);
  const [active, setActive] = useState(0);
  return (
    <div>
      <ArtworkImage
        src={images[active]}
        alt={artwork.title}
        className="h-56 w-full rounded-xl"
      />
      {images.length > 1 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-lg border-2 transition-colors ${active === i ? "border-[#9F5639]" : "border-transparent"}`}
            >
              <ArtworkImage
                src={src}
                alt={`${artwork.title} view ${i + 1}`}
                className="h-16 w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
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
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-[#E8E1DB] shadow-xl">
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

/* ---------------------------- Edit form --------------------------- */

function ArtworkFormModal({ open, mode, initial, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (mode === "edit" && initial) {
      setForm({
        title: initial.title,
        artist: initial.artist,
        category: initial.category,
        medium: initial.medium,
        price: String(initial.price),
        stock: initial.stock,
        status: initial.status,
        image: initial.image || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, initial]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.artist.trim()) return setError("Artist name is required.");
    if (!form.medium.trim()) return setError("Medium is required.");
    const price = Number(form.price);
    if (!form.price || !Number.isFinite(price) || price <= 0)
      return setError("Enter a valid price greater than 0.");

    setError("");
    onSave({
      title: form.title.trim(),
      artist: form.artist.trim(),
      category: form.category,
      medium: form.medium.trim(),
      price,
      stock: form.stock.trim() || "1 of 1",
      status: form.status,
      image: form.image.trim(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit artwork"
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
            form="artwork-form"
            className="h-10 px-5 rounded-full bg-[#9F5639] text-white text-[14px] font-medium hover:bg-[#8A4930] transition-colors"
          >
            Save changes
          </button>
        </>
      }
    >
      <form id="artwork-form" onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-[#F6DFDA] text-[#9B3B2E] px-3 py-2.5 text-[13px]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Field label="Title">
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Golden Silence"
            className={inputCls}
          />
        </Field>

        <Field label="Artist">
          <input
            type="text"
            value={form.artist}
            onChange={(e) => set("artist", e.target.value)}
            placeholder="e.g. Aarav Mehta"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={selectCls}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A28F7D] pointer-events-none"
              />
            </div>
          </Field>

          <Field label="Status">
            <div className="relative">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={selectCls}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A28F7D] pointer-events-none"
              />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Medium">
            <input
              type="text"
              value={form.medium}
              onChange={(e) => set("medium", e.target.value)}
              placeholder="e.g. Oil on Canvas"
              className={inputCls}
            />
          </Field>

          <Field label="Stock">
            <input
              type="text"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
              placeholder="e.g. 1 of 1"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Price (₹)">
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="e.g. 25000"
            className={inputCls}
          />
        </Field>

        <Field label="Image URL (optional)">
          <input
            type="url"
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className={inputCls}
          />
        </Field>
      </form>
    </Modal>
  );
}

/* ------------------------------- Main page ------------------------------ */
const mapArtwork = (artwork) => {
  const categoryMap = {
    paintings: "Painting",
    sculptures: "Sculpture",
    ceramics: "Ceramics",
    photography: "Photography",
    digital: "Digital Art",
    textile: "Textile",
    printmaking: "Printmaking",
  };

  const statusMap = {
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
    published: "Published",
    sold: "Sold",
    draft: "Draft",
  };

  const images = Array.isArray(artwork.image)
    ? artwork.image.map((img) => img.url).filter(Boolean)
    : [];

  return {
    id: artwork._id,
    artworkId: artwork.artworkId,

    artistId: artwork.artist_id?._id || null,
    artist: artwork.artist_id?.name || "Unknown Artist",

    title: artwork.title || "Untitled Artwork",
    category:
      categoryMap[artwork.category?.toLowerCase()] ||
      artwork.category ||
      "Other",

    medium: artwork.medium || "Not specified",
    description: artwork.description || "",
    dimensions: artwork.dimensions || "Not specified",
    location: artwork.location || "Not specified",
    tag: artwork.tag || "",
    price: Number(artwork.price || 0),
    stock: artwork.stock_label || "1 of 1",
    status:
      statusMap[(artwork.moderation_status || "pending").toLowerCase()] ||
      "Pending",
    availability: artwork.status || "draft",
    images,
    image: images[0] || "",
  };
};

export default function Artworks() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priceBand, setPriceBand] = useState(PRICE_BANDS[0]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [artistFilter, setArtistFilter] = useState("All artists");

  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const [modal, setModal] = useState(null); // { mode: "view" | "edit", id?: string }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const artistOptions = useMemo(
    () => ["All artists", ...new Set(artworks.map((a) => a.artist))],
    [artworks],
  );

  const activeArtwork = modal?.id
    ? artworks.find((a) => a.id === modal.id)
    : null;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/admin/get-artwork`,
          {
            headers: {
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
          },
        );

        const artworkList = response.data.getAllArtwork || [];

        setArtworks(artworkList.map(mapArtwork));
      } catch (err) {
        console.error("Error fetching artworks:", err);

        setError(err.response?.data?.message || "Failed to fetch artworks.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const filtered = useMemo(() => {
    return artworks.filter((a) => {
      if (!a.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== CATEGORIES[0] && a.category !== category) return false;
      if (status !== STATUSES[0] && a.status !== status) return false;
      if (artistFilter !== "All artists" && a.artist !== artistFilter)
        return false;
      if (!inBand(a.price, priceBand)) return false;
      return true;
    });
  }, [artworks, search, category, priceBand, status, artistFilter]);

  /* ------------------------------ actions ------------------------------ */

  async function approveArtwork(id) {
    try {
      setApprovingId(id);

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const response = await axios.patch(
        `${API_BASE_URL}/admin/approve-artwork/${id}`,
        {},
        {
          headers: {
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
        },
      );

      // Update the artwork status after successful API response
      setArtworks((prev) =>
        prev.map((artwork) =>
          artwork.id === id ? { ...artwork, status: "Approved" } : artwork,
        ),
      );

      setToast({
        msg: response.data?.message || "Artwork approved successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Error approving artwork:", err);

      setToast({
        msg: err.response?.data?.message || "Failed to approve artwork.",
        type: "error",
      });
    } finally {
      setApprovingId(null);
    }
  }
  async function rejectArtwork(id) {
    try {
      setRejectingId(id);

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const response = await axios.patch(
        `${API_BASE_URL}/admin/rejected-artwork/${id}`,
        {},
        {
          headers: {
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
        },
      );

      // Update the UI after successful backend response
      setArtworks((prev) =>
        prev.map((artwork) =>
          artwork.id === id ? { ...artwork, status: "Rejected" } : artwork,
        ),
      );

      setToast({
        msg: response.data?.message || "Artwork rejected successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Error rejecting artwork:", err);

      setToast({
        msg: err.response?.data?.message || "Failed to reject artwork.",
        type: "error",
      });
    } finally {
      setRejectingId(null);
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setArtworks((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setToast({ msg: "Artwork deleted." });
    if (modal?.id === deleteTarget.id) setModal(null);
    setDeleteTarget(null);
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 font-['Plus_Jakarta_Sans']">
      {loading && (
        <div className="py-16 text-center text-[#A28F7D]">
          Loading artworks...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-[#F6DFDA] px-4 py-3 text-sm text-[#9B3B2E]">
          {error}
        </div>
      )}
      {/* ------------------------------ Toolbar ----------------------------- */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-[400px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A28F7D]"
          />
          <input
            type="text"
            placeholder="Search artworks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-full border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] placeholder:text-[#A28F7D] focus:outline-none focus:border-[#9F5639] transition-colors"
          />
        </div>

        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none h-11 pl-4 pr-10 rounded-full border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] focus:outline-none focus:border-[#9F5639] cursor-pointer"
          >
            {CATEGORIES.map((o) => (
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

        <div className="relative">
          <select
            value={priceBand}
            onChange={(e) => setPriceBand(e.target.value)}
            className="appearance-none h-11 pl-4 pr-10 rounded-full border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] focus:outline-none focus:border-[#9F5639] cursor-pointer"
          >
            {PRICE_BANDS.map((o) => (
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

        <div className="relative">
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

        <div className="relative">
          <select
            value={artistFilter}
            onChange={(e) => setArtistFilter(e.target.value)}
            className="appearance-none h-11 pl-4 pr-10 rounded-full border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] focus:outline-none focus:border-[#9F5639] cursor-pointer"
          >
            {artistOptions.map((o) => (
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

      {/* ------------------------------- Grid ------------------------------ */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-[#E8E1DB] rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <ArtworkImage
                src={a.image}
                alt={a.title}
                className="h-28 w-full"
              />

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold text-[#362F26] truncate">
                      {a.title}
                    </p>
                    <p className="text-[13px] text-[#A28F7D] truncate mt-0.5">
                      {a.artist} · {a.medium}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div className="mt-4 flex items-center justify-between text-[13px] text-[#A28F7D]">
                  <span className="font-semibold text-[#362F26] text-[15px]">
                    {formatINR(a.price)}
                  </span>
                  <span>{a.stock}</span>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E8E1DB] flex items-center gap-3">
                  <button
                    title="View"
                    onClick={() => setModal({ mode: "view", id: a.id })}
                    className="text-[#A28F7D] hover:text-[#362F26] transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    title="Approve"
                    onClick={() => approveArtwork(a.id)}
                    disabled={approvingId === a.id || a.status === "Approved"}
                    className="text-[#4C6B3F] hover:text-[#3a5230] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {approvingId === a.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <Check size={18} />
                    )}
                  </button>
                  <button
                    title="Reject"
                    onClick={() => rejectArtwork(a.id)}
                    disabled={rejectingId === a.id || a.status === "Rejected"}
                    className="text-[#9B3B2E] hover:text-[#7a2e23] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {rejectingId === a.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <X size={18} />
                    )}
                  </button>
                  <button
                    title="Delete"
                    onClick={() => setDeleteTarget(a)}
                    className="ml-auto text-[#A28F7D] hover:text-[#9B3B2E] transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-[14px] text-[#A28F7D]">
              No artworks match these filters.
            </div>
          )}
        </div>
      )}

      {/* ---------------------------- View modal --------------------------- */}
      <Modal
        open={modal?.mode === "view"}
        onClose={() => setModal(null)}
        title="Artwork details"
        footer={
          <button
            type="button"
            onClick={() => setModal(null)}
            className="h-10 px-5 rounded-full border border-[#E8E1DB] text-[14px] text-[#362F26] hover:bg-[#F7F3EE] transition-colors"
          >
            Close
          </button>
        }
      >
        {activeArtwork && (
          <div className="space-y-5">
            <ArtworkGallery key={activeArtwork.id} artwork={activeArtwork} />

            <div>
              <h3 className="text-[18px] font-semibold text-[#362F26]">
                {activeArtwork.title}
              </h3>
              <p className="text-[13.5px] text-[#A28F7D] mt-0.5">
                {activeArtwork.artist} · {activeArtwork.medium}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Detail label="Artwork ID" value={activeArtwork.artworkId} />
              <Detail label="Category" value={activeArtwork.category} />
              <Detail label="Price" value={formatINR(activeArtwork.price)} />
              <Detail
                label="Status"
                value={<StatusBadge status={activeArtwork.status} />}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* -------------------------- Delete confirm ------------------------- */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete artwork"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="h-10 px-5 rounded-full border border-[#E8E1DB] text-[14px] text-[#362F26] hover:bg-[#F7F3EE] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="h-10 px-5 rounded-full bg-[#9B3B2E] text-white text-[14px] font-medium hover:bg-[#7a2e23] transition-colors"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed text-[#736153]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#362F26]">
            {deleteTarget?.title}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>

      {/* ------------------------------- Toast ----------------------------- */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 rounded-xl text-white px-4 py-3 text-[13.5px] shadow-lg ${
            toast.type === "error" ? "bg-[#9B3B2E]" : "bg-[#362F26]"
          }`}
        >
          {toast.type === "error" ? (
            <X size={16} />
          ) : (
            <CheckCircle2 size={16} className="text-[#B9D3A6]" />
          )}

          {toast.msg}
        </div>
      )}
    </div>
  );
}
