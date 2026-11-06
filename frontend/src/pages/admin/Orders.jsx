import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye, ChevronDown } from "lucide-react";
import { Modal } from "./shared";
import { ARTWORKS as ADMIN_ARTWORKS } from "./Artworks";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const ORDERS = [
  {
    id: "ORD-10245",
    buyer: "Priya Sharma",
    piece: "Golden Silence",
    artist: "Aarav Mehta",
    amount: 18500,
    status: "Completed",
    date: "18 Sep 2026",
  },
  {
    id: "ORD-10244",
    buyer: "Rahul Kapoor",
    piece: "Monsoon Reverie",
    artist: "Riya Sharma",
    amount: 32400,
    status: "Processing",
    date: "18 Sep 2026",
  },
  {
    id: "ORD-10243",
    buyer: "Sneha Iyer",
    piece: "Bronze Whisper",
    artist: "Kabir Verma",
    amount: 64200,
    status: "Pending",
    date: "17 Sep 2026",
  },
  {
    id: "ORD-10242",
    buyer: "Vikram Nair",
    piece: "City in Ochre",
    artist: "Ananya Kapoor",
    amount: 21800,
    status: "Completed",
    date: "17 Sep 2026",
  },
  {
    id: "ORD-10241",
    buyer: "Ishaan Joshi",
    piece: "Terracotta Dream",
    artist: "Meera Iyer",
    amount: 15600,
    status: "Cancelled",
    date: "16 Sep 2026",
  },
  {
    id: "ORD-10240",
    buyer: "Ananya Rao",
    piece: "Still Water Study",
    artist: "Aarav Mehta",
    amount: 27900,
    status: "Completed",
    date: "16 Sep 2026",
  },
  {
    id: "ORD-10239",
    buyer: "Kunal Bose",
    piece: "Marble Repose",
    artist: "Kabir Verma",
    amount: 98000,
    status: "Processing",
    date: "15 Sep 2026",
  },
  {
    id: "ORD-10238",
    buyer: "Divya Menon",
    piece: "Ink and Rust",
    artist: "Riya Sharma",
    amount: 12400,
    status: "Completed",
    date: "15 Sep 2026",
  },
];

const STATUSES = [
  "All statuses",
  "Completed",
  "Processing",
  "Pending",
  "Cancelled",
];

const DETAILS = {
  "ORD-10245": {
    phone: "+91 98200 11223",
    payment: "UPI",
    address: "12 MG Road, Bengaluru, Karnataka 560001",
  },
  "ORD-10244": {
    phone: "+91 98110 44556",
    payment: "Card",
    address: "45 Connaught Place, New Delhi 110001",
  },
  "ORD-10243": {
    phone: "+91 97650 77889",
    payment: "Net banking",
    address: "8 Marine Drive, Mumbai, Maharashtra 400020",
  },
  "ORD-10242": {
    phone: "+91 98450 22334",
    payment: "UPI",
    address: "21 Anna Salai, Chennai, Tamil Nadu 600002",
  },
  "ORD-10241": {
    phone: "+91 99300 55667",
    payment: "UPI",
    address: "5 Park Street, Kolkata, West Bengal 700016",
  },
  "ORD-10240": {
    phone: "+91 98765 43210",
    payment: "Card",
    address: "14 Jubilee Hills, Hyderabad, Telangana 500033",
  },
  "ORD-10239": {
    phone: "+91 98300 12345",
    payment: "Net banking",
    address: "22 Salt Lake, Kolkata, West Bengal 700091",
  },
  "ORD-10238": {
    phone: "+91 94470 67890",
    payment: "UPI",
    address: "9 MG Road, Kochi, Kerala 682016",
  },
};
const FALLBACK = { phone: "—", payment: "—", address: "Address not provided" };

const ORDER_ACTIONS = {
  Pending: [["Mark processing", "Processing"]],
  Processing: [],
  Completed: [],
  Cancelled: [],
};

function StatusBadge({ status }) {
  const map = {
    Completed: "bg-[#E7EEDD] text-[#4C6B3F]",
    Processing: "bg-[#F6E7D0] text-[#8A5A22]",
    Pending: "bg-[#F6E7D0] text-[#8A5A22]",
    Cancelled: "bg-[#F6DFDA] text-[#9B3B2E]",
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

const CAT = {
  paintings: "Paintings",
  sculptures: "Sculptures",
  ceramics: "Ceramics & Pottery",
  photography: "Photography",
  digital: "Digital & New Media",
  textile: "Textile & Fiber Art",
  printmaking: "Printmaking & Monotype",
};

function loadPlacedOrders() {
  try {
    const list = JSON.parse(localStorage.getItem("artnest_orders")) || [];
    let stages = {};
    try {
      stages = JSON.parse(localStorage.getItem("artnest_order_stage")) || {};
    } catch {}
    return list
      .filter((o) => o?.items?.length)
      .map((o) => {
        const first = o.items[0];
        const extra = o.items.length - 1;
        const stage = stages[o.id] ?? o.stage ?? 0;
        return {
          id: o.id,
          buyer: o.address?.name || o.email || "Buyer",
          piece: extra > 0 ? `${first.title} + ${extra} more` : first.title,
          artist: first.artist,
          amount: o.total,
          status:
            stage >= 4 ? "Completed" : stage >= 1 ? "Processing" : "Pending",
          date: new Date(o.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          items: o.items,
          details: {
            phone: o.address?.phone || "—",
            payment: o.payment || "—",
            address: o.address
              ? [o.address.line, o.address.city, o.address.state, o.address.pin]
                  .filter(Boolean)
                  .join(", ")
              : "Address not provided",
          },
        };
      });
  } catch {
    return [];
  }
}

function findArtwork(title) {
  let stored = [];
  try {
    stored = JSON.parse(localStorage.getItem("artnest_artist_artworks")) || [];
  } catch {}
  const s = stored.find((a) => a.title === title);
  if (s) {
    return {
      images: (s.images?.length ? s.images : [s.img])
        .filter(Boolean)
        .slice(0, 3),
      rows: [
        ["Category", CAT[s.category] || s.category],
        ["Medium", s.medium],
        ["Dimensions", s.dims],
        ["Location", s.location],
        ["Tag", s.tag],
      ],
      description: s.description,
    };
  }
  const a = ADMIN_ARTWORKS.find((x) => x.title === title);
  if (a) {
    return {
      images: a.image ? [a.image] : [],
      rows: [
        ["Category", a.category],
        ["Medium", a.medium],
        ["Edition", a.stock],
      ],
      description: "",
    };
  }
  return null;
}

function OrderArtwork({ title, artist, fallbackImg, artworkImages = [] }) {
  const info = findArtwork(title);

  // Prefer images received from the backend API
  const images = artworkImages.length
    ? artworkImages
    : info?.images?.length
      ? info.images
      : [fallbackImg].filter(Boolean);

  const [active, setActive] = useState(images[0] || "");

  // Update active image if API data changes
  useEffect(() => {
    setActive(images[0] || "");
  }, [images.join(",")]);

  const rows = (info?.rows || []).filter(([, v]) => v);

  return (
    <div className="rounded-xl border border-[#E8E1DB] p-3">
      {active ? (
        <img
          src={active}
          alt={title}
          className="h-56 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="grid h-40 place-items-center rounded-lg bg-[#F9F8F6] text-[13px] text-[#A28F7D]">
          No photo uploaded
        </div>
      )}

      {images.length > 1 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(src)}
              className={`overflow-hidden rounded-md border-2 ${
                active === src ? "border-[#9F5639]" : "border-transparent"
              }`}
            >
              <img
                src={src}
                alt={`${title} view ${i + 1}`}
                className="h-16 w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-[15px] font-medium text-[#362F26]">{title}</p>

      <p className="text-[12.5px] text-[#A28F7D]">by {artist}</p>

      {rows.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11.5px] text-[#A28F7D]">{k}</dt>
              <dd className="text-[#362F26]">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {info?.description && (
        <p className="mt-3 text-[13px] leading-relaxed text-[#4A4037]">
          {info.description}
        </p>
      )}
    </div>
  );
}

function mapOrderStatus(status) {
  const statusMap = {
    placed: "Pending",
    pending: "Pending",
    processing: "Processing",
    shipped: "Processing",
    delivered: "Completed",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  return statusMap[status?.toLowerCase()] || "Pending";
}

function mapOrder(order) {
  const items = (order.orderItems || []).map((item) => {
    const artwork = item.artworkId;

    return {
      id: artwork?._id || null,
      title: artwork?.title || "Artwork unavailable",
      artist: artwork?.artist_id?.name || "Unknown Artist",

      // Get all artwork image URLs from Cloudinary
      img: artwork?.image?.[0]?.url || "",
      images: artwork?.image?.map((image) => image.url) || [],
    };
  });

  const firstItem = items[0];
  const extraItems = items.length - 1;

  const address = [
    order.address,
    order.city,
    order.state,
    order.pincode,
    order.country,
  ]
    .filter(Boolean)
    .join(", ");

  const placedDate = order.placed_at ? new Date(order.placed_at) : null;

  return {
    id: order.orderId || order._id,
    dbId: order._id,
    buyer: order.name || "Unknown Buyer",

    piece: !firstItem
      ? "No artwork"
      : extraItems > 0
        ? `${firstItem.title} + ${extraItems} more`
        : firstItem.title,

    artist: firstItem?.artist || "Unknown Artist",
    amount: Number(order.total || 0),
    status: mapOrderStatus(order.status),

    date:
      placedDate && !Number.isNaN(placedDate.getTime())
        ? placedDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—",

    items,

    details: {
      phone: order.phonenumber ? String(order.phonenumber) : "—",
      payment: order.payment || "—",
      address: address || "Address not provided",
    },
  };
}

export default function Orders() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(STATUSES[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewId, setViewId] = useState(null);

  const filtered = useMemo(() => {
    return rows.filter((o) => {
      if (status !== STATUSES[0] && o.status !== status) return false;
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.buyer.toLowerCase().includes(q) ||
        o.piece.toLowerCase().includes(q)
      );
    });
  }, [search, status, rows]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/admin/get-orders`,
          {
            headers: {
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
          },
        );

        const orderList = response.data.listOrders || [];

        setRows(orderList.map(mapOrder));
      } catch (err) {
        console.error("Error fetching orders:", err);

        setError(err.response?.data?.message || "Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const current = rows.find((o) => o.id === viewId);
  const d = current ? current.details || DETAILS[current.id] || FALLBACK : null;
  const actions = current ? ORDER_ACTIONS[current.status] || [] : [];

  const changeStatus = (o, next) => {
    if (next === "Cancelled" && !window.confirm(`Cancel ${o.id}?`)) return;
    setRows((rs) =>
      rs.map((r) => (r.id === o.id ? { ...r, status: next } : r)),
    );
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 font-['Plus_Jakarta_Sans']">
      {loading && (
        <div className="py-16 text-center text-[#A28F7D]">
          Loading orders...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-[#F6DFDA] px-4 py-3 text-sm text-[#9B3B2E]">
          {error}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[280px] max-w-[600px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A28F7D]"
          />
          <input
            type="text"
            placeholder="Search order ID, buyer, artwork..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-full border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] placeholder:text-[#A28F7D] focus:outline-none focus:border-[#9F5639] transition-colors"
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
      </div>
      {!loading && !error && (
        <div className="bg-white border border-[#E8E1DB] rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-left min-w-[1000px] border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.08em] text-[#A28F7D] border-b border-[#E8E1DB]">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Artwork</th>
                <th className="px-6 py-4 font-medium">Artist</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-[#E8E1DB] last:border-b-0 hover:bg-[#F9F8F6] transition-colors"
                >
                  <td className="px-6 py-5 text-[14px] text-[#A28F7D]">
                    {o.id}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-[#362F26]">
                    {o.buyer}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-[#362F26]">
                    {o.piece}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-[#A28F7D]">
                    {o.artist}
                  </td>
                  <td className="px-6 py-5 text-[14px] font-medium text-[#362F26]">
                    {formatINR(o.amount)}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-[#A28F7D] whitespace-nowrap">
                    {o.date}
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-5">
                    <button
                      type="button"
                      onClick={() => setViewId(o.id)}
                      aria-label={`View ${o.id}`}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9F5639] hover:text-[#8A4930] transition-colors"
                    >
                      <Eye size={16} /> View
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
                    No orders match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {current && (
        <Modal
          title={current.id}
          onClose={() => setViewId(null)}
          footer={
            actions.length
              ? actions.map(([label, next, danger]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => changeStatus(current, next)}
                    className={
                      danger
                        ? "rounded-lg border border-[#F0CFC8] bg-white px-4 py-2 text-[13px] font-medium text-[#9B3B2E] hover:bg-[#F6DFDA]"
                        : "rounded-lg bg-[#9F5639] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#8A4A30]"
                    }
                  >
                    {label}
                  </button>
                ))
              : null
          }
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={current.status} />
              <span className="text-[13px] text-[#A28F7D]">{current.date}</span>
            </div>

            {(
              current.items || [
                { title: current.piece, artist: current.artist },
              ]
            ).map((it) => (
              <OrderArtwork
                key={it.id ?? it.title}
                title={it.title}
                artist={it.artist}
                fallbackImg={it.img}
                artworkImages={it.images || []}
              />
            ))}

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
              {[
                ["Customer", current.buyer],
                ["Phone", d.phone],
                ["Artwork", current.piece],
                ["Artist", current.artist],
                ["Amount", formatINR(current.amount)],
                ["Payment", d.payment],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] text-[#A28F7D]">{k}</dt>
                  <dd className="mt-0.5 text-[#362F26]">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="rounded-xl bg-[#F9F8F6] p-4">
              <p className="text-[12px] text-[#A28F7D]">Shipping address</p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#362F26]">
                {d.address}
              </p>
            </div>

            {(current.status === "Pending" ||
              current.status === "Processing") && (
              <p className="text-[12.5px] text-[#A28F7D]">
                Delivery is confirmed by the buyer, so an order can't be marked
                completed from here.
              </p>
            )}
            {current.status === "Cancelled" && (
              <p className="text-[12.5px] text-[#9B3B2E]">
                This order was cancelled.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
