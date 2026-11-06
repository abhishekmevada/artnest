import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Package, Truck, ShieldCheck, BadgeCheck, Check, MessageCircle, Star, Download, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "@/config/api";

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
const STAGES = ["Placed", "Confirmed", "Packed", "Shipped", "Delivered"];

const REVIEWS_KEY = "artnest_reviews";
const STAGE_KEY = "artnest_order_stage";

const STATUS_TO_STAGE = {
  placed: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  delivered: 4,
  cancle: -1,
  cancelled: -1,
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
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
          setOrder(null);
          return;
        }

        const data = await res.json();
        const found = (data.findOrders || []).find(
          (o) => o.orderId === id || o._id === id,
        );

        if (found) {
          const items = (found.orderItems || []).map((item) => {
            const art =
              item.artworkId && typeof item.artworkId === "object"
                ? item.artworkId
                : {};
            return {
              id: art._id || item._id,
              title: art.title || "Original Artwork",
              artist: art.artist_id?.name || art.artist || "Featured Artist",
              img:
                art.image?.[0]?.url ||
                (typeof art.image === "string" ? art.image : art.img) ||
                "/placeholder.png",
              value: Number(art.price ?? found.subtotal ?? 0),
            };
          });

          const baseStage = STATUS_TO_STAGE[found.status?.toLowerCase()] ?? 0;
          let artistStages = {};
          try {
            artistStages = JSON.parse(localStorage.getItem(STAGE_KEY)) || {};
          } catch {}
          const stage = artistStages[found.orderId || found._id] ?? baseStage;

          const payment = found.payment?.[0];
          const paymentLabel = payment
            ? payment.paymentMethod === "upi"
              ? `UPI · ${payment.upiId || "Paid"}`
              : payment.paymentMethod === "card"
              ? `Card ending ${payment.cardLast4 || "••••"}`
              : `Net banking · ${payment.bankingName || "Bank"}`
            : "Paid via UPI";

          setOrder({
            id: found.orderId || found._id,
            _id: found._id,
            date: found.placed_at || found.createdAt,
            items,
            subtotal: Number(found.subtotal || 0),
            shipping: Number(found.shipping_fee || 0),
            tax: Number(found.tax || 0),
            total: Number(found.total || 0),
            shipMethod:
              found.deliverymode === "express"
                ? "Express insured"
                : "Standard insured",
            eta:
              stage === 4
                ? "Delivered"
                : found.deliverymode === "express"
                ? "2–4 business days"
                : "5–9 business days",
            payment: paymentLabel,
            email: found.email || user?.email || "",
            address: {
              name: found.name || user?.name || "",
              phone: String(found.phonenumber || ""),
              line: found.address || "",
              city: found.city || "",
              state: found.state || "",
              pin: String(found.pincode || ""),
            },
            stage: Math.max(0, stage),
            status: found.status || "placed",
          });
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user]);

  const handleCancelOrder = () => {
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    const updated = { ...order, stage: -1, note: "Cancelled by buyer" };
    setOrder(updated);
    try {
      const list = JSON.parse(localStorage.getItem("artnest_orders")) || [];
      const newList = list.map((o) => (o.id === order.id ? updated : o));
      localStorage.setItem("artnest_orders", JSON.stringify(newList));
    } catch {}
    setConfirmCancel(false);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const firstArt = order.items[0];
    const review = {
      id: `REV-${order.id}`,
      orderId: order.id,
      artId: firstArt.id,
      name: user?.name || order.address.name,
      text: reviewText.trim(),
      buyer: user?.name || order.address.name,
      artwork: firstArt.title,
      artist: firstArt.artist,
      rating,
      comment: reviewText.trim(),
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Published",
    };
    try {
      const list = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || [];
      localStorage.setItem(REVIEWS_KEY, JSON.stringify([review, ...list]));
    } catch {}
    setReviewSubmitted(true);
  };

  if (loading) {
    return <div className="od-app"><div className="od-shell">Loading order details…</div></div>;
  }

  if (!order) {
    return (
      <div className="od-app">
        <div className="od-shell" style={{ textAlign: "center", padding: "80px 20px" }}>
          <h2>Order not found</h2>
          <p style={{ color: "var(--ink-soft)", margin: "10px 0 24px" }}>We couldn't find the acquisition details for ID: {id}</p>
          <Link to="/orders" className="od-cta">Back to orders</Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.stage === -1;

  return (
    <div className="od-app">
      <div className="od-shell">
        <div className="od-nav-row">
          <Link to="/orders" className="od-back"><ChevronLeft size={16} /> Back to orders</Link>
          <button type="button" className="od-print-btn" onClick={() => window.print()}>
            <Download size={14} /> Download invoice
          </button>
        </div>

        <header className="od-head">
          <div>
            <p className="od-eyebrow">Order summary &amp; tracking</p>
            <h1 className="od-title">Order {order.id}</h1>
            <p className="od-sub">Placed on {new Date(order.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <span className={`od-status-badge ${isCancelled ? "cancelled" : order.stage === 4 ? "delivered" : "active"}`}>
            {isCancelled ? "Cancelled" : order.stage === 4 ? "Delivered" : STAGES[order.stage] || "In progress"}
          </span>
        </header>

        {!isCancelled && (
          <div className="od-tracker-card">
            <h2>Shipment progress</h2>
            <p className="od-track-sub">{order.eta ? `Estimated delivery: ${order.eta}` : "Insured secure delivery in progress"}</p>
            <ol className="od-steps" aria-label="Order progress">
              {STAGES.map((s, i) => (
                <li key={s} className={`od-step ${i < order.stage ? "done" : i === order.stage ? "now" : ""}`}>
                  <span className="od-step-ico">
                    {i < order.stage ? <Check size={13} /> : i === order.stage ? <Truck size={13} /> : i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="od-layout">
          <div className="od-main">
            <section className="od-section">
              <h2>Acquired works ({order.items.length})</h2>
              <div className="od-items-list">
                {order.items.map((item) => (
                  <div key={item.id} className="od-item">
                    <Link to={`/artwork/${item.id}`} className="od-thumb">
                      <img src={item.img} alt={item.title} loading="lazy" />
                    </Link>
                    <div className="od-item-info">
                      <p className="od-artist">{item.artist}</p>
                      <Link to={`/artwork/${item.id}`} className="od-name">{item.title}</Link>
                      <span className="od-badge"><BadgeCheck size={13} /> Certificate of authenticity included</span>
                    </div>
                    <div className="od-item-price">
                      <span>Value</span>
                      <strong>{inr(item.value)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="od-grid-2">
              <section className="od-section">
                <h2>Delivery address</h2>
                <div className="od-box">
                  <strong>{order.address.name}</strong>
                  <p>{order.address.line}</p>
                  <p>{order.address.city}, {order.address.state} — {order.address.pin}</p>
                  <p className="od-phone">Phone: {order.address.phone}</p>
                </div>
              </section>

              <section className="od-section">
                <h2>Payment &amp; security</h2>
                <div className="od-box">
                  <p><strong>Method:</strong> {order.payment}</p>
                  <p><strong>Confirmation sent to:</strong> {order.email}</p>
                  <div className="od-secure-note">
                    <ShieldCheck size={15} /> Fully insured transaction with curator guarantee.
                  </div>
                </div>
              </section>
            </div>
          </div>

          <aside className="od-summary">
            <h2>Payment breakdown</h2>
            <div className="od-row"><span>Subtotal</span><span>{inr(order.subtotal)}</span></div>
            <div className="od-row muted"><span>Shipping ({order.shipMethod})</span><span>{order.shipping === 0 ? "Free" : inr(order.shipping)}</span></div>
            <div className="od-row muted"><span>Estimated tax</span><span>{inr(order.tax)}</span></div>

            <div className="od-total">
              <span>Total paid</span>
              <strong>{inr(order.total)}</strong>
            </div>

            {order.stage >= 3 && !isCancelled && (
              <button type="button" className="od-action-btn primary" onClick={() => setShowReviewModal(true)}>
                <Star size={15} /> Write review for artist
              </button>
            )}

            {!isCancelled && order.stage < 2 && (
              <div className="od-cancel-wrapper">
                {confirmCancel ? (
                  <div className="od-confirm-box">
                    <p>Are you sure you want to cancel this order?</p>
                    <div className="od-confirm-btns">
                      <button type="button" className="od-btn-danger" onClick={handleCancelOrder}>Yes, cancel</button>
                      <button type="button" className="od-btn-sec" onClick={() => setConfirmCancel(false)}>Keep order</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="od-cancel-link" onClick={handleCancelOrder}>
                    <XCircle size={14} /> Cancel this order
                  </button>
                )}
              </div>
            )}

            <ul className="od-trust">
              <li><ShieldCheck size={16} /> Vetted by ArtNest curators</li>
              <li><Truck size={16} /> Ships in archival packaging</li>
            </ul>
          </aside>
        </div>
      </div>

      {showReviewModal && (
        <div className="od-modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="od-modal" onClick={(e) => e.stopPropagation()}>
            {reviewSubmitted ? (
              <div className="od-modal-success">
                <Check size={32} />
                <h3>Thank you!</h3>
                <p>Your review has been successfully submitted to the artist.</p>
                <button type="button" className="od-cta" onClick={() => setShowReviewModal(false)}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <h3>Review artwork &amp; artist</h3>
                <p className="od-modal-sub">Share your feedback on the piece and delivery experience.</p>
                <div className="od-stars-pick">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)}>
                      <Star size={24} className={star <= rating ? "filled" : ""} />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={4}
                  placeholder="Write your comments here…"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="od-textarea"
                />
                <div className="od-modal-actions">
                  <button type="submit" className="od-cta">Submit review</button>
                  <button type="button" className="od-ghost" onClick={() => setShowReviewModal(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .od-app {
          --ink: #1c1712; --ink-soft: #4a423a; --paper: #f6f1e6; --paper-2: #efe6d3;
          --line: #ddd0b8; --brass-deep: #6f5222; --wine: #5c2b30; --bad: #9b3b2e;
          --serif: "Fraunces", "Iowan Old Style", Georgia, serif;
          --sans: "Work Sans", "Inter", system-ui, sans-serif;
          background: var(--paper); color: var(--ink); font-family: var(--sans); min-height: 80vh;
        }
        .od-app * { box-sizing: border-box; }
        .od-shell { max-width: 1240px; margin: 0 auto; padding: 40px 28px 80px; }

        .od-nav-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .od-back { display: inline-flex; align-items: center; gap: 4px; font-size: 13.5px; color: var(--ink-soft); text-decoration: none; }
        .od-back:hover { color: var(--wine); }
        .od-print-btn {
          display: inline-flex; align-items: center; gap: 6px; background: transparent;
          border: 1px solid var(--line); color: var(--ink-soft); padding: 7px 14px; border-radius: 999px;
          font-size: 13px; cursor: pointer; font-family: var(--sans); transition: all .2s;
        }
        .od-print-btn:hover { border-color: var(--wine); color: var(--wine); }

        .od-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; }
        .od-eyebrow { font-size: 13px; letter-spacing: .04em; color: var(--brass-deep); margin: 0 0 8px; font-weight: 500; }
        .od-title { font-family: var(--serif); font-weight: 500; font-size: clamp(28px, 4vw, 44px); line-height: 1.1; margin: 0 0 6px; }
        .od-sub { margin: 0; color: var(--ink-soft); font-size: 14.5px; }

        .od-status-badge {
          display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 600;
          background: #e2d3b8; color: var(--brass-deep);
        }
        .od-status-badge.delivered { background: #d7e4d0; color: #35522b; }
        .od-status-badge.cancelled { background: #f6dfda; color: var(--bad); }

        .od-tracker-card {
          background: var(--paper-2); border: 1px solid var(--line); border-radius: 18px; padding: 24px; margin-bottom: 28px;
        }
        .od-tracker-card h2 { font-family: var(--serif); font-weight: 500; font-size: 20px; margin: 0 0 4px; }
        .od-track-sub { margin: 0 0 20px; font-size: 13.5px; color: var(--ink-soft); }
        .od-steps { display: flex; list-style: none; padding: 0; margin: 0; gap: 8px; justify-content: space-between; flex-wrap: wrap; }
        .od-step { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-soft); flex: 1; min-width: 120px; }
        .od-step-ico {
          display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%;
          border: 1px solid var(--line); background: var(--paper); font-size: 11px; font-weight: 600;
        }
        .od-step.done .od-step-ico { background: var(--brass-deep); border-color: var(--brass-deep); color: #fff; }
        .od-step.now .od-step-ico { background: var(--wine); border-color: var(--wine); color: #fff; }
        .od-step.now { font-weight: 600; color: var(--ink); }

        .od-layout { display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }
        .od-main { display: grid; gap: 24px; }
        .od-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .od-section { background: var(--paper-2); border: 1px solid var(--line); border-radius: 18px; padding: 22px; }
        .od-section h2 { font-family: var(--serif); font-weight: 500; font-size: 19px; margin: 0 0 16px; }

        .od-items-list { display: grid; gap: 14px; }
        .od-item { display: grid; grid-template-columns: 80px 1fr auto; gap: 16px; align-items: center; background: var(--paper); padding: 12px; border-radius: 12px; border: 1px solid var(--line); }
        .od-thumb { display: block; border-radius: 8px; overflow: hidden; aspect-ratio: 1/1; }
        .od-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .od-item-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .od-artist { font-size: 12px; color: #a3946f; margin: 0; }
        .od-name { font-family: var(--serif); font-size: 17px; color: var(--brass-deep); text-decoration: none; font-weight: 500; }
        .od-name:hover { text-decoration: underline; }
        .od-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--brass-deep); margin-top: 4px; }
        .od-item-price { text-align: right; }
        .od-item-price span { display: block; font-size: 11px; color: #a3946f; }
        .od-item-price strong { font-family: var(--serif); font-size: 18px; font-weight: 500; }

        .od-box { font-size: 14px; color: var(--ink-soft); line-height: 1.5; display: grid; gap: 4px; }
        .od-box strong { color: var(--ink); }
        .od-phone { margin-top: 4px; }
        .od-secure-note { display: flex; align-items: center; gap: 6px; color: var(--brass-deep); font-size: 13px; margin-top: 10px; }

        .od-summary { position: sticky; top: 24px; background: var(--paper-2); border: 1px solid var(--line); border-radius: 18px; padding: 24px; display: grid; gap: 12px; }
        .od-summary h2 { font-family: var(--serif); font-weight: 500; font-size: 20px; margin: 0 0 8px; }
        .od-row { display: flex; justify-content: space-between; font-size: 14px; }
        .od-row.muted { color: var(--ink-soft); font-size: 13px; }
        .od-total { display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid var(--line); padding-top: 14px; margin-top: 6px; margin-bottom: 12px; }
        .od-total strong { font-family: var(--serif); font-size: 26px; font-weight: 500; }

        .od-action-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
          background: var(--ink); color: var(--paper); border: none; padding: 13px; border-radius: 999px;
          font-size: 14px; font-weight: 500; cursor: pointer; transition: background .2s;
        }
        .od-action-btn:hover { background: var(--wine); }

        .od-cancel-wrapper { margin-top: 8px; }
        .od-cancel-link {
          display: inline-flex; align-items: center; gap: 6px; background: none; border: none;
          color: var(--bad); font-size: 13px; cursor: pointer; padding: 0; text-decoration: underline; text-underline-offset: 3px;
        }
        .od-confirm-box { background: var(--paper); border: 1px solid var(--line); padding: 14px; border-radius: 12px; font-size: 13.5px; }
        .od-confirm-btns { display: flex; gap: 8px; margin-top: 10px; }
        .od-btn-danger { background: var(--bad); color: #fff; border: none; padding: 6px 12px; border-radius: 999px; font-size: 12px; cursor: pointer; }
        .od-btn-sec { background: transparent; border: 1px solid var(--line); padding: 6px 12px; border-radius: 999px; font-size: 12px; cursor: pointer; }

        .od-trust { list-style: none; padding: 14px 0 0; margin: 8px 0 0; border-top: 1px solid var(--line); display: grid; gap: 8px; font-size: 12.5px; color: var(--ink-soft); }
        .od-trust li { display: flex; gap: 8px; align-items: center; }
        .od-trust svg { color: var(--brass-deep); flex-shrink: 0; }

        .od-modal-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.5); display: grid; place-items: center; padding: 16px; }
        .od-modal { background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 28px; width: 100%; max-width: 440px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .od-modal h3 { font-family: var(--serif); font-size: 22px; margin: 0 0 6px; }
        .od-modal-sub { font-size: 13.5px; color: var(--ink-soft); margin: 0 0 16px; }
        .od-stars-pick { display: flex; gap: 6px; margin-bottom: 16px; }
        .od-stars-pick button { background: none; border: none; cursor: pointer; padding: 0; color: var(--line); }
        .od-stars-pick button svg.filled { color: var(--brass-deep); fill: var(--brass-deep); }
        .od-textarea { width: 100%; padding: 12px; border: 1px solid var(--line); border-radius: 12px; background: #fff; font: inherit; font-size: 14px; margin-bottom: 16px; outline: none; }
        .od-textarea:focus { border-color: var(--wine); }
        .od-modal-actions { display: flex; gap: 10px; }
        .od-cta { background: var(--ink); color: var(--paper); border: none; padding: 10px 20px; border-radius: 999px; font-size: 14px; cursor: pointer; font-weight: 500; }
        .od-cta:hover { background: var(--wine); }
        .od-ghost { background: transparent; border: 1px solid var(--line); color: var(--ink); padding: 10px 20px; border-radius: 999px; font-size: 14px; cursor: pointer; }
        .od-modal-success { text-align: center; padding: 20px 0; display: grid; gap: 12px; justify-items: center; }

        @media (max-width: 960px) {
          .od-layout { grid-template-columns: 1fr; }
          .od-summary { position: static; }
        }
        @media (max-width: 640px) {
          .od-shell { padding: 24px 16px 60px; }
          .od-grid-2 { grid-template-columns: 1fr; }
          .od-item { grid-template-columns: 64px 1fr; }
          .od-item-price { grid-column: 2; text-align: left; display: flex; gap: 6px; align-items: baseline; }
        }
      `}</style>
    </div>
  );
}