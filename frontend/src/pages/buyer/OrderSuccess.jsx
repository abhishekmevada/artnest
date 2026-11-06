import { Link, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, MapPin, Package, Truck } from "lucide-react";

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

function lastOrder() {
  try {
    const list = JSON.parse(localStorage.getItem("artnest_orders")) || [];
    return list[0] || null;
  } catch {
    return null;
  }
}

const NEXT = [
  { icon: Package, title: "The artist prepares your piece", text: "They'll pack it in archival packaging." },
  { icon: Truck, title: "It ships with a tracking ID", text: "You'll see the courier details in your dashboard." },
  { icon: Check, title: "You confirm it arrived", text: "Tap “Mark as received”, then leave a review." },
];

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order || lastOrder();
  if (!order) return <Navigate to="/" replace />;

  const a = order.address;
  const placedOn = new Date(order.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="os">
      <div className="os-wrap">
        <motion.div
          className="os-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            className="os-tick"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
          >
            <Check size={30} strokeWidth={2} />
          </motion.span>
          <h1>Thank you, your order is placed</h1>
          <p>
            Order <strong>{order.id}</strong> · {placedOn}. A confirmation is on its way to {order.email}.
          </p>
        </motion.div>

        <div className="os-grid">
          <section className="os-card">
            <h2>Your pieces</h2>
            <ul className="os-items">
              {order.items.map((i) => (
                <li key={i.id}>
                  <img src={i.img} alt={i.title} />
                  <span>
                    <strong>{i.title}</strong>
                    <small>{i.artist}</small>
                  </span>
                  <b>{inr(i.value)}</b>
                </li>
              ))}
            </ul>
            <div className="os-row"><span>Subtotal</span><span>{inr(order.subtotal)}</span></div>
            <div className="os-row"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : inr(order.shipping)}</span></div>
            <div className="os-row"><span>Estimated tax</span><span>{inr(order.tax)}</span></div>
            <div className="os-total"><span>Total paid</span><strong>{inr(order.total)}</strong></div>
            <p className="os-pay">{order.payment}</p>
          </section>

          <div className="os-side">
            <section className="os-card">
              <h2><MapPin size={16} /> Delivering to</h2>
              <p className="os-addr">
                {a.name}<br />
                {a.line}<br />
                {a.city}, {a.state} {a.pin}<br />
                +91 {a.phone}
              </p>
              <p className="os-eta">{order.shipMethod} · {order.eta}</p>
            </section>

            <section className="os-card">
              <h2>What happens next</h2>
              <ol className="os-next">
                {NEXT.map(({ icon: Icon, title, text }) => (
                  <li key={title}>
                    <span><Icon size={15} /></span>
                    <div>
                      <strong>{title}</strong>
                      <small>{text}</small>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>

        <div className="os-actions">
          <Link to="/dashboard" className="os-primary">Go to my dashboard</Link>
          <Link to="/discover" className="os-ghost">Continue browsing</Link>
        </div>
      </div>

      <style>{`
        .os {
          --ink: #1c1712; --ink-soft: #4a423a; --paper: #f6f1e6; --card: #fbf8f1; --line: #ddd0b8;
          --brass-deep: #6f5222; --wine: #5c2b30;
          --serif: "Fraunces", "Iowan Old Style", Georgia, serif;
          --sans: "Work Sans", "Inter", system-ui, sans-serif;
          background: var(--paper); color: var(--ink); font-family: var(--sans); min-height: 80vh;
        }
        .os-wrap { max-width: 1040px; margin: 0 auto; padding: 48px 24px 72px; }
        .os-hero { text-align: center; margin-bottom: 36px; }
        .os-tick { display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: var(--wine); color: #fff; margin-bottom: 18px; }
        .os-hero h1 { font-family: var(--serif); font-weight: 500; font-size: clamp(30px, 4.6vw, 46px); line-height: 1.1; margin: 0 0 10px; letter-spacing: -0.01em; }
        .os-hero p { margin: 0; color: var(--ink-soft); font-size: 15px; }
        .os-hero strong { color: var(--ink); }

        .os-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 20px; align-items: start; }
        .os-side { display: grid; gap: 20px; }
        .os-card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 24px; }
        .os-card h2 { display: flex; align-items: center; gap: 8px; font-family: var(--serif); font-weight: 500; font-size: 20px; margin: 0 0 16px; }

        .os-items { list-style: none; margin: 0 0 16px; padding: 0 0 16px; border-bottom: 1px solid var(--line); display: grid; gap: 14px; }
        .os-items li { display: flex; align-items: center; gap: 12px; }
        .os-items img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; flex: none; }
        .os-items span { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .os-items strong { font-size: 14.5px; font-weight: 500; }
        .os-items small { font-size: 12px; color: var(--ink-soft); }
        .os-items b { font-weight: 500; font-size: 14.5px; }
        .os-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--ink-soft); margin-bottom: 10px; }
        .os-total { display: flex; justify-content: space-between; align-items: baseline; padding-top: 14px; border-top: 1px solid var(--line); margin-top: 14px; }
        .os-total strong { font-family: var(--serif); font-weight: 500; font-size: 26px; }
        .os-pay { margin: 10px 0 0; font-size: 12.5px; color: var(--ink-soft); }

        .os-addr { margin: 0; font-size: 14.5px; line-height: 1.6; }
        .os-eta { margin: 14px 0 0; padding-top: 14px; border-top: 1px solid var(--line); font-size: 13px; color: var(--brass-deep); }

        .os-next { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
        .os-next li { display: flex; gap: 12px; align-items: flex-start; }
        .os-next li > span { display: grid; place-items: center; flex: none; width: 30px; height: 30px; border-radius: 50%; background: #efe6d3; color: var(--wine); }
        .os-next strong { display: block; font-size: 14px; font-weight: 600; }
        .os-next small { display: block; font-size: 12.5px; color: var(--ink-soft); margin-top: 2px; }

        .os-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 32px; }
        .os-primary, .os-ghost { display: inline-flex; align-items: center; height: 48px; padding: 0 28px; border-radius: 999px; font-size: 14.5px; text-decoration: none; transition: background .2s; }
        .os-primary { background: var(--wine); color: #fff; }
        .os-primary:hover { background: #46202a; }
        .os-ghost { border: 1px solid var(--line); color: var(--ink); background: var(--card); }
        .os-ghost:hover { background: #efe6d3; }

        @media (max-width: 820px) { .os-grid { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .os-wrap { padding: 32px 16px 56px; } .os-card { padding: 18px; } }
      `}</style>
    </div>
  );
}

