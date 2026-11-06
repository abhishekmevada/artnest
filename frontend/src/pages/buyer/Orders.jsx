import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/config/api";

// Standalone orders page: needs only react + react-router-dom. Demo data below; swap for your API.
const C = { ink: "#362F26", mute: "#A28F7D", line: "#E8E1DB", bg: "#F9F8F6", brand: "#9F5639", brandDark: "#8A4A30" };
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
const STAGES = ["Placed", "Packed", "Shipped", "Delivered"];
const img = (id) => `https://images.unsplash.com/${id}?q=80&w=600&auto=format&fit=crop`;

const STATUS_TO_STAGE = {
  placed: 0,
  confirmed: 0,
  packed: 1,
  shipped: 2,
  delivered: 3,
  cancle: -1,
  cancelled: -1,
};

const ADDRESS = "Flat 12, Shanti Apartments, Dharampeth, Nagpur, Maharashtra 440010";
const FILTERS = ["All", "In progress", "Delivered", "Cancelled"];

const card = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 24 };
const btn = { background: "#fff", color: C.ink, border: `1px solid ${C.line}`, borderRadius: 999, padding: "8px 16px", fontSize: 13, cursor: "pointer", textDecoration: "none" };
const btnPrimary = { ...btn, background: C.brand, color: "#fff", border: `1px solid ${C.brand}` };

const statusOf = (o) => (o.stage < 0 ? "Cancelled" : o.stage === 3 ? "Delivered" : "In progress");
const badge = (o) => {
  const s = statusOf(o);
  const t = s === "Delivered" ? ["#E7EEDD", "#4C6B3F"] : s === "Cancelled" ? ["#F6DFDA", "#9B3B2E"] : ["#F6E7D0", "#8A5A22"];
  return <span style={{ background: t[0], color: t[1], borderRadius: 999, padding: "4px 12px", fontSize: 12, whiteSpace: "nowrap" }}>{o.stage < 0 ? "Cancelled" : STAGES[o.stage]}</span>;
};

function Tracker({ stage }) {
  return (
    <ol style={{ display: "flex", listStyle: "none", padding: 0, margin: "16px 0 4px" }} aria-label="Order progress">
      {STAGES.map((s, i) => (
        <li key={s} style={{ display: "flex", flex: i < 3 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: i <= stage ? C.brand : C.line, color: "#fff", fontSize: 11, display: "grid", placeItems: "center" }}>{i < stage ? "✓" : ""}</span>
            <span style={{ fontSize: 12, color: i <= stage ? C.ink : C.mute }}>{s}</span>
          </div>
          {i < 3 && <span style={{ flex: 1, height: 2, margin: "10px 8px 0", background: i < stage ? C.brand : C.line }} />}
        </li>
      ))}
    </ol>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/buyer/get-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setOrders([]);
          return;
        }

        const data = await res.json();
        const serverList = (data.findOrders || []).map((o) => {
          const firstItem = o.orderItems?.[0];
          const artObj =
            firstItem?.artworkId && typeof firstItem.artworkId === "object"
              ? firstItem.artworkId
              : {};
          const extra = (o.orderItems?.length || 1) - 1;
          const rawTitle = artObj.title || "Original Artwork";
          const title = extra > 0 ? `${rawTitle} + ${extra} more` : rawTitle;
          const artist =
            artObj.artist_id?.name || artObj.artist || "Featured Artist";
          const imgUrl =
            artObj.image?.[0]?.url ||
            (typeof artObj.image === "string" ? artObj.image : artObj.img) ||
            "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=600&auto=format&fit=crop";

          const stage = STATUS_TO_STAGE[o.status?.toLowerCase()] ?? 0;

          const payment = o.payment?.[0];
          const pay = payment
            ? payment.paymentMethod === "upi"
              ? `UPI · ${payment.upiId || "Paid"}`
              : payment.paymentMethod === "card"
              ? `Card ending ${payment.cardLast4 || "••••"}`
              : `Net banking · ${payment.bankingName || "Bank"}`
            : "UPI";

          return {
            id: o.orderId || o._id,
            title,
            artist,
            price: Number(o.total ?? o.subtotal ?? 0),
            date: new Date(o.placed_at || o.createdAt || Date.now()).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            stage,
            note:
              stage === 3
                ? "Delivered"
                : stage === 2
                ? "Shipped, on the way"
                : stage === 1
                ? "Packed & ready to dispatch"
                : "Artist is preparing your piece",
            pay,
            img: imgUrl,
            address: o.address
              ? `${o.address}, ${o.city}, ${o.state} ${o.pincode}`
              : ADDRESS,
          };
        });

        setOrders(serverList);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f, f === "All" ? orders.length : orders.filter((o) => statusOf(o) === f).length])), [orders]);
  const visible = orders.filter((o) => (filter === "All" || statusOf(o) === filter) && (o.title + o.id + o.artist).toLowerCase().includes(q.trim().toLowerCase()));

  const cancel = (id) => {
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, stage: -1, note: "Cancelled by you", pay: "Refund in 5-7 days" } : o)));
    setConfirm(null);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 24px", color: C.ink }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 500 }}>My orders</h1>
        <p style={{ margin: "6px 0 24px", color: C.mute, fontSize: 15 }}>Track, review and manage everything you have bought.</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <div role="tablist" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {FILTERS.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} style={{ ...btn, ...(filter === f ? { background: C.ink, color: "#fff", borderColor: C.ink } : {}) }}>
                {f} ({counts[f]})
              </button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by artwork, artist or order ID" aria-label="Search orders" style={{ flex: 1, minWidth: 220, height: 40, border: `1px solid ${C.line}`, borderRadius: 999, padding: "0 16px", fontSize: 14, outline: "none", background: "#fff" }} />
        </div>

        {loading ? (
          <div style={{ ...card, textAlign: "center", padding: 48 }}>
            <p style={{ margin: 0, fontSize: 17, color: C.mute }}>Loading your orders…</p>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ ...card, textAlign: "center", padding: 48 }}>
            <p style={{ margin: 0, fontSize: 17 }}>{orders.length ? "No orders match this filter." : "You have not placed any orders yet."}</p>
            <Link to="/discover" style={{ ...btnPrimary, display: "inline-block", marginTop: 16 }}>Discover artworks</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {visible.map((o) => {
              const isOpen = open === o.id;
              const ship = o.price >= 2000 ? 0 : 150;
              return (
                <article key={o.id} style={card}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <img src={o.img} alt={o.title} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 17 }}>{o.title}</div>
                      <div style={{ fontSize: 13, color: C.mute }}>{o.artist} · Order {o.id} · {o.date}</div>
                      <div style={{ fontSize: 13, color: "#736153", marginTop: 4 }}>{o.note}</div>
                    </div>
                    <div style={{ textAlign: "right", display: "grid", gap: 6, justifyItems: "end" }}>
                      <span style={{ fontSize: 16 }}>{inr(o.price)}</span>
                      {badge(o)}
                    </div>
                  </div>

                  {o.stage >= 0 && o.stage < 3 && <Tracker stage={o.stage} />}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                    <button style={btn} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : o.id)}>{isOpen ? "Hide details" : "View details"}</button>
                    {o.stage === 3 && <Link to="/discover" style={btn}>Write a review</Link>}
                    {(o.stage === 3 || o.stage < 0) && <Link to="/discover" style={btn}>Buy something similar</Link>}
                    {o.stage >= 0 && <button style={btn} onClick={() => window.print()}>Download invoice</button>}
                    {o.stage >= 0 && o.stage < 2 && (
                      confirm === o.id ? (
                        <>
                          <button style={{ ...btnPrimary, background: "#9B3B2E", borderColor: "#9B3B2E" }} onClick={() => cancel(o.id)}>Yes, cancel order</button>
                          <button style={btn} onClick={() => setConfirm(null)}>Keep it</button>
                        </>
                      ) : (
                        <button style={{ ...btn, color: "#9B3B2E" }} onClick={() => setConfirm(o.id)}>Cancel order</button>
                      )
                    )}
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.line}`, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", fontSize: 14 }}>
                      <div>
                        <div style={{ color: C.mute, fontSize: 12, marginBottom: 4 }}>Delivery address</div>
                        <div style={{ lineHeight: 1.5 }}>{ADDRESS}</div>
                      </div>
                      <div>
                        <div style={{ color: C.mute, fontSize: 12, marginBottom: 4 }}>Payment</div>
                        <div>{o.pay}</div>
                      </div>
                      <div>
                        <div style={{ color: C.mute, fontSize: 12, marginBottom: 4 }}>Price</div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Artwork</span><span>{inr(o.price)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Insured shipping</span><span>{ship ? inr(ship) : "Free"}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.line}` }}><span>Total</span><span>{inr(o.price + ship)}</span></div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}