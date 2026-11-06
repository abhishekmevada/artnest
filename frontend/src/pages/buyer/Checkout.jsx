import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, BadgeCheck, Check, ChevronLeft, CreditCard, Landmark, Lock, ShieldCheck, Smartphone, Truck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { API_BASE_URL } from "@/config/api";

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

const loadSettings = () => {
  try { return JSON.parse(localStorage.getItem("artnest_settings")) || {}; } catch { return {}; }
};
const METHOD_SETS = {
  "UPI, Cards, Bank transfer": ["upi", "card", "netbanking"],
  "UPI only": ["upi"],
  "Cards only": ["card"],
};
const FREE_STANDARD_ABOVE = 5000;
const SHIPPING = [
  { id: "standard", label: "Standard insured", eta: "5–9 business days", price: 499 },
  { id: "express", label: "Express insured", eta: "2–4 business days", price: 999 },
];
const METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "netbanking", label: "Net banking", icon: Landmark },
];
const BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank"];
const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Other",
];

const digits = (v, max) => v.replace(/\D/g, "").slice(0, max);
const fmtCard = (v) => digits(v, 16).replace(/(.{4})/g, "$1 ").trim();
const fmtExpiry = (v) => {
  const d = digits(v, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function validate(f, method) {
  const e = {};
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = "Enter a valid 10-digit mobile number.";
  if (f.name.trim().length < 2) e.name = "Enter the recipient's full name.";
  else if (f.name.trim().length > 25) e.name = "Name must not exceed 25 characters.";
  if (f.address.trim().length < 6) e.address = "Enter the street address.";
  if (f.city.trim().length < 2) e.city = "Enter your city.";
  if (!f.state) e.state = "Select your state.";
  if (!/^\d{6}$/.test(f.pin)) e.pin = "Enter a 6-digit PIN code.";

  if (method === "upi" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(f.upi.trim())) e.upi = "Enter a valid UPI ID, e.g. name@bank.";
  if (method === "card") {
    if (!/^\d{15,16}$/.test(f.card.replace(/\s/g, ""))) e.card = "Enter a valid card number.";
    if (f.cardName.trim().length < 2) e.cardName = "Enter the name on the card.";
    const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(f.expiry);
    const now = new Date();
    const expired = m && (2000 + Number(m[2]) < now.getFullYear() || (2000 + Number(m[2]) === now.getFullYear() && Number(m[1]) < now.getMonth() + 1));
    if (!m || expired) e.expiry = "Enter a valid expiry (MM/YY).";
    if (!/^\d{3,4}$/.test(f.cvv)) e.cvv = "Enter the CVV.";
  }
  if (method === "netbanking" && !f.bank) e.bank = "Choose your bank.";
  if (!f.agree) e.agree = "Please accept the terms to continue.";
  return e;
}

function Field({ label, error, className = "", children }) {
  return (
    <label className={`ck-field ${className}`}>
      <span>{label}</span>
      {children}
      {error && <em role="alert">{error}</em>}
    </label>
  );
}

function Section({ n, title, note, children }) {
  return (
    <section className="ck-card">
      <header className="ck-card-head">
        <span className="ck-num">{n}</span>
        <div>
          <h2>{title}</h2>
          {note && <p>{note}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    email: user?.email || "",
    phone: user?.phone ? String(user.phone) : user?.phonenumber ? String(user.phonenumber) : "",
    name: user?.name || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    pin: user?.pin ? String(user.pin) : user?.pincode ? String(user.pincode) : "",
    upi: "",
    card: "",
    cardName: "",
    expiry: "",
    cvv: "",
    bank: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [shipId, setShipId] = useState("standard");
  const settings = loadSettings();
  const allowed = METHOD_SETS[settings.methods] || ["upi", "card", "netbanking"];
  const methodList = METHODS.filter((m) => allowed.includes(m.id));
  const [method, setMethod] = useState(allowed[0]);
  const [placing, setPlacing] = useState(false);

  if (!user || user.role !== "buyer") return <Navigate to="/buyer/login" replace />;
  if (items.length === 0 && !placing) return <Navigate to="/cart" replace />;

  const subtotal = items.reduce((s, i) => s + i.value, 0);
  const ship = SHIPPING.find((s) => s.id === shipId);
  const shipping = shipId === "standard" && subtotal >= FREE_STANDARD_ABOVE ? 0 : ship.price;
  const taxRate = (Number(settings.tax ?? 5) || 0) / 100;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + shipping + tax;

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
    if (serverError) setServerError("");
  };
  const bind = (name, fmt) => ({
    name,
    value: form[name],
    onChange: (e) => set(name, fmt ? fmt(e.target.value) : e.target.value),
    "aria-invalid": errors[name] ? "true" : undefined,
    className: "ck-input",
  });

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = validate(form, method);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setTimeout(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus(), 0);
      return;
    }

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!token) {
      navigate("/buyer/login", { state: { from: "/checkout" } });
      return;
    }

    setPlacing(true);

    const paymentLabel =
      method === "upi"
        ? `UPI · ${form.upi.trim()}`
        : method === "card"
        ? `Card ending ${form.card.replace(/\s/g, "").slice(-4)}`
        : `Net banking · ${form.bank}`;

    const payload = {
      email: form.email.trim(),
      phonenumber: Number(form.phone),
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state,
      pincode: Number(form.pin),
      country: "India",
      deliverymode: shipId,
      subtotal: Number(subtotal),
      shipping_fee: Number(shipping),
      tax: Number(tax),
      total: Number(total),
      orderItems: items.map((i) => ({
        artworkId: i.artworkDbId || i._id || i.id,
      })),
      paymentMethod: method === "netbanking" ? "net banking" : method,
      upiId: method === "upi" ? form.upi.trim() : undefined,
      cardName: method === "card" ? form.cardName.trim() : undefined,
      cardLast4:
        method === "card"
          ? form.card.replace(/\s/g, "").slice(-4)
          : undefined,
      bankingName: method === "netbanking" ? form.bank : undefined,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/buyer/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      const createdOrder = data.order || {};
      const order = {
        id: createdOrder.orderId || `ART-${Math.floor(10000 + Math.random() * 90000)}`,
        _id: createdOrder._id,
        date: createdOrder.placed_at || new Date().toISOString(),
        items: items.map(({ id, _id, artworkDbId, title, artist, img, value }) => ({
          id: id || _id || artworkDbId,
          title,
          artist,
          img,
          value,
        })),
        subtotal,
        shipping,
        tax,
        total,
        shipMethod: ship.label,
        eta: ship.eta,
        payment: paymentLabel,
        email: form.email.trim(),
        address: {
          name: form.name.trim(),
          phone: form.phone,
          line: form.address.trim(),
          city: form.city.trim(),
          state: form.state,
          pin: form.pin,
        },
        stage: 0,
      };

      try {
        const list = JSON.parse(localStorage.getItem("artnest_orders")) || [];
        localStorage.setItem("artnest_orders", JSON.stringify([order, ...list]));
      } catch (e) {
        console.error("Failed to save local order:", e);
      }

      // Clear server-side cart
      try {
        await fetch(`${API_BASE_URL}/buyer/remove-all-cart`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (clearErr) {
        console.error("Failed to clear server cart:", clearErr);
      }

      clearCart();
      navigate("/order-success", { state: { order }, replace: true });
    } catch (err) {
      console.error("Order creation error:", err);
      setServerError(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="ck">
      <div className="ck-wrap">
        <Link to="/cart" className="ck-back"><ChevronLeft size={16} /> Back to cart</Link>
        <h1 className="ck-title">Checkout</h1>

        <ol className="ck-steps" aria-label="Checkout progress">
          <li className="done"><span><Check size={13} /></span> Cart</li>
          <li className="now" aria-current="step"><span>2</span> Details &amp; payment</li>
          <li><span>3</span> Confirmation</li>
        </ol>

        <form className="ck-grid" onSubmit={submit} noValidate ref={formRef}>
          <div className="ck-main">
            <Section n="1" title="Contact" note="We'll send your order confirmation and shipping updates here.">
              <div className="ck-fields">
                <Field label="Email" error={errors.email}>
                  <input {...bind("email")} type="email" autoComplete="email" placeholder="you@example.com" />
                </Field>
                <Field label="Mobile number" error={errors.phone}>
                  <input {...bind("phone", (v) => digits(v, 10))} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit number" />
                </Field>
              </div>
            </Section>

            <Section n="2" title="Shipping address">
              <div className="ck-fields">
                <Field label="Full name" error={errors.name} className="full">
                  <input {...bind("name")} autoComplete="name" />
                </Field>
                <Field label="Street address" error={errors.address} className="full">
                  <input {...bind("address")} autoComplete="street-address" placeholder="House no., street, area" />
                </Field>
                <Field label="City" error={errors.city}>
                  <input {...bind("city")} autoComplete="address-level2" />
                </Field>
                <Field label="State" error={errors.state}>
                  <select {...bind("state")} autoComplete="address-level1">
                    <option value="">Select state</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="PIN code" error={errors.pin}>
                  <input {...bind("pin", (v) => digits(v, 6))} inputMode="numeric" autoComplete="postal-code" placeholder="6 digits" />
                </Field>
                <Field label="Country">
                  <input className="ck-input" value="India" disabled readOnly />
                </Field>
              </div>
            </Section>

            <Section n="3" title="Delivery method" note="Every piece ships in archival packaging, fully insured.">
              <div className="ck-options" role="radiogroup" aria-label="Delivery method">
                {SHIPPING.map((s) => {
                  const price = s.id === "standard" && subtotal >= FREE_STANDARD_ABOVE ? 0 : s.price;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={shipId === s.id}
                      className={`ck-option ${shipId === s.id ? "on" : ""}`}
                      onClick={() => setShipId(s.id)}
                    >
                      <span className="ck-radio" />
                      <span className="ck-option-text">
                        <strong>{s.label}</strong>
                        <small>{s.eta}</small>
                      </span>
                      <span className="ck-option-price">{price === 0 ? "Free" : inr(price)}</span>
                    </button>
                  );
                })}
              </div>
              {subtotal < FREE_STANDARD_ABOVE && (
                <p className="ck-hint">Standard shipping is free on orders above {inr(FREE_STANDARD_ABOVE)}.</p>
              )}
            </Section>

            <Section n="4" title="Payment" note="Demo checkout: no real payment is taken.">
              <div className="ck-methods" role="radiogroup" aria-label="Payment method">
                {methodList.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={method === id}
                    className={`ck-method ${method === id ? "on" : ""}`}
                    onClick={() => setMethod(id)}
                  >
                    <Icon size={18} strokeWidth={1.6} /> {label}
                  </button>
                ))}
              </div>

              <div className="ck-fields ck-pay">
                {method === "upi" && (
                  <Field label="UPI ID" error={errors.upi} className="full">
                    <input {...bind("upi")} placeholder="name@bank" autoComplete="off" />
                  </Field>
                )}
                {method === "card" && (
                  <>
                    <Field label="Card number" error={errors.card} className="full">
                      <input {...bind("card", fmtCard)} inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" />
                    </Field>
                    <Field label="Name on card" error={errors.cardName} className="full">
                      <input {...bind("cardName")} autoComplete="cc-name" />
                    </Field>
                    <Field label="Expiry" error={errors.expiry}>
                      <input {...bind("expiry", fmtExpiry)} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" />
                    </Field>
                    <Field label="CVV" error={errors.cvv}>
                      <input {...bind("cvv", (v) => digits(v, 4))} type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="•••" />
                    </Field>
                  </>
                )}
                {method === "netbanking" && (
                  <Field label="Choose your bank" error={errors.bank} className="full">
                    <select {...bind("bank")}>
                      <option value="">Select bank</option>
                      {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </Field>
                )}
              </div>
            </Section>
          </div>

          <aside className="ck-summary">
            <h2>Order summary</h2>
            <ul className="ck-items">
              {items.map((i) => (
                <li key={i.id}>
                  <img src={i.img} alt={i.title} loading="lazy" />
                  <span>
                    <strong>{i.title}</strong>
                    <small>{i.artist}</small>
                  </span>
                  <b>{inr(i.value)}</b>
                </li>
              ))}
            </ul>

            <div className="ck-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="ck-row"><span>Shipping · {ship.label}</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
            <div className="ck-row"><span>Tax ({settings.tax ?? 5}%)</span><span>{inr(tax)}</span></div>
            <div className="ck-total"><span>Total</span><strong>{inr(total)}</strong></div>

            <label className={`ck-agree ${errors.agree ? "bad" : ""}`}>
              <input
                type="checkbox"
                checked={form.agree}
                aria-invalid={errors.agree ? "true" : undefined}
                onChange={(e) => set("agree", e.target.checked)}
              />
              <span>
                I agree to the <Link to="/terms" target="_blank">Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>.
              </span>
            </label>
            {errors.agree && <em className="ck-err" role="alert">{errors.agree}</em>}

            {serverError && (
              <div className="ck-server-err" role="alert">
                <AlertCircle size={16} />
                <span>{serverError}</span>
              </div>
            )}

            <button type="submit" className="ck-pay-btn" disabled={placing}>
              {placing ? <><span className="ck-spin" /> Placing order…</> : <><Lock size={15} /> Place order · {inr(total)}</>}
            </button>

            <ul className="ck-trust">
              <li><ShieldCheck size={16} strokeWidth={1.6} /> Every work is inspected and vetted by our curators</li>
              <li><Truck size={16} strokeWidth={1.6} /> Archival packaging, fully insured delivery</li>
              <li><BadgeCheck size={16} strokeWidth={1.6} /> Certificate of authenticity included</li>
            </ul>
          </aside>
        </form>
      </div>

      <style>{`
        .ck {
          --ink: #1c1712; --ink-soft: #4a423a; --paper: #f6f1e6; --paper-2: #efe6d3; --card: #fbf8f1;
          --line: #ddd0b8; --brass-deep: #6f5222; --wine: #5c2b30; --bad: #9b3b2e;
          --serif: "Fraunces", "Iowan Old Style", Georgia, serif;
          --sans: "Work Sans", "Inter", system-ui, sans-serif;
          background: var(--paper); color: var(--ink); font-family: var(--sans); min-height: 80vh;
        }
        .ck-wrap { max-width: 1180px; margin: 0 auto; padding: 36px 24px 72px; }
        .ck-back { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: var(--ink-soft); text-decoration: none; }
        .ck-back:hover { color: var(--wine); }
        .ck-title { font-family: var(--serif); font-weight: 500; font-size: clamp(34px, 5vw, 50px); line-height: 1.05; margin: 10px 0 18px; letter-spacing: -0.01em; }

        .ck-steps { display: flex; flex-wrap: wrap; gap: 8px 28px; list-style: none; margin: 0 0 28px; padding: 0; font-size: 13px; color: var(--ink-soft); }
        .ck-steps li { display: flex; align-items: center; gap: 8px; }
        .ck-steps li span { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--line); font-size: 11px; background: var(--card); }
        .ck-steps .done span { background: var(--wine); border-color: var(--wine); color: #fff; }
        .ck-steps .now { color: var(--ink); font-weight: 600; }
        .ck-steps .now span { border-color: var(--wine); color: var(--wine); }

        .ck-grid { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 28px; align-items: start; }
        .ck-main { display: grid; gap: 18px; }

        .ck-card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 24px; }
        .ck-card-head { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 18px; }
        .ck-card-head h2 { font-family: var(--serif); font-weight: 500; font-size: 21px; margin: 0; }
        .ck-card-head p { margin: 3px 0 0; font-size: 13px; color: var(--ink-soft); }
        .ck-num { display: grid; place-items: center; flex: none; width: 28px; height: 28px; border-radius: 50%; background: var(--wine); color: #fff; font-size: 13px; }

        .ck-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ck-field { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--ink-soft); }
        .ck-field.full { grid-column: 1 / -1; }
        .ck-field em, .ck-err { font-style: normal; font-size: 12px; color: var(--bad); }
        .ck-input {
          width: 100%; height: 44px; padding: 0 14px; border: 1px solid var(--line); border-radius: 10px;
          background: #fff; font: inherit; font-size: 14.5px; color: var(--ink); outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .ck-input:focus { border-color: var(--wine); box-shadow: 0 0 0 3px rgba(92, 43, 48, .12); }
        .ck-input[aria-invalid="true"] { border-color: var(--bad); }
        .ck-input:disabled { background: var(--paper-2); color: var(--ink-soft); }
        .ck-input::placeholder { color: #a99c86; }

        .ck-options { display: grid; gap: 10px; }
        .ck-option {
          display: flex; align-items: center; gap: 14px; width: 100%; text-align: left; cursor: pointer;
          padding: 14px 16px; background: #fff; border: 1px solid var(--line); border-radius: 12px; font: inherit; color: var(--ink);
          transition: border-color .15s, background .15s;
        }
        .ck-option:hover { border-color: var(--brass-deep); }
        .ck-option.on { border-color: var(--wine); background: #fdf7f3; box-shadow: 0 0 0 1px var(--wine) inset; }
        .ck-radio { flex: none; width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--line); position: relative; }
        .ck-option.on .ck-radio { border-color: var(--wine); }
        .ck-option.on .ck-radio::after { content: ""; position: absolute; inset: 3px; border-radius: 50%; background: var(--wine); }
        .ck-option-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .ck-option-text strong { font-size: 14.5px; font-weight: 600; }
        .ck-option-text small { font-size: 12.5px; color: var(--ink-soft); }
        .ck-option-price { font-weight: 600; font-size: 14.5px; }
        .ck-hint { margin: 12px 0 0; font-size: 12.5px; color: var(--ink-soft); }

        .ck-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
        .ck-method {
          display: flex; align-items: center; justify-content: center; gap: 8px; height: 46px; cursor: pointer;
          background: #fff; border: 1px solid var(--line); border-radius: 12px; font: inherit; font-size: 14px; color: var(--ink);
          transition: border-color .15s, background .15s;
        }
        .ck-method:hover { border-color: var(--brass-deep); }
        .ck-method.on { border-color: var(--wine); background: #fdf7f3; color: var(--wine); box-shadow: 0 0 0 1px var(--wine) inset; }

        .ck-summary { position: sticky; top: 96px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 24px; }
        .ck-summary h2 { font-family: var(--serif); font-weight: 500; font-size: 21px; margin: 0 0 16px; }
        .ck-items { list-style: none; margin: 0 0 16px; padding: 0 0 16px; border-bottom: 1px solid var(--line); display: grid; gap: 14px; max-height: 280px; overflow-y: auto; }
        .ck-items li { display: flex; align-items: center; gap: 12px; }
        .ck-items img { width: 52px; height: 52px; border-radius: 10px; object-fit: cover; flex: none; }
        .ck-items span { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .ck-items strong { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ck-items small { font-size: 12px; color: var(--ink-soft); }
        .ck-items b { font-size: 14px; font-weight: 500; }
        .ck-row { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; margin-bottom: 10px; color: var(--ink-soft); }
        .ck-total { display: flex; justify-content: space-between; align-items: baseline; margin: 14px 0 18px; padding-top: 14px; border-top: 1px solid var(--line); font-size: 15px; }
        .ck-total strong { font-family: var(--serif); font-weight: 500; font-size: 28px; }

        .ck-agree { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; color: var(--ink-soft); cursor: pointer; margin-bottom: 8px; }
        .ck-agree input { margin-top: 3px; width: 16px; height: 16px; accent-color: var(--wine); }
        .ck-agree a { color: var(--wine); }
        .ck-agree.bad { color: var(--bad); }
        .ck-err { display: block; margin-bottom: 8px; }
        .ck-server-err {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          background: #fdf2f2;
          border: 1px solid var(--bad);
          color: var(--bad);
          font-size: 13px;
          line-height: 1.4;
        }
        .ck-server-err svg { flex: none; }

        .ck-pay-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 50px; margin-top: 8px;
          border: 0; border-radius: 999px; background: var(--wine); color: #fff; font: inherit; font-size: 15px; font-weight: 500; cursor: pointer;
          transition: background .2s, transform .1s;
        }
        .ck-pay-btn:hover:not(:disabled) { background: #46202a; }
        .ck-pay-btn:active:not(:disabled) { transform: scale(.99); }
        .ck-pay-btn:disabled { opacity: .75; cursor: progress; }
        .ck-spin { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; animation: ck-rot .8s linear infinite; }
        @keyframes ck-rot { to { transform: rotate(360deg); } }

        .ck-trust { list-style: none; margin: 18px 0 0; padding: 16px 0 0; border-top: 1px solid var(--line); display: grid; gap: 10px; font-size: 12.5px; color: var(--ink-soft); }
        .ck-trust li { display: flex; gap: 8px; align-items: flex-start; }
        .ck-trust svg { flex: none; color: var(--brass-deep); margin-top: 1px; }

        @media (max-width: 960px) {
          .ck-grid { grid-template-columns: 1fr; }
          .ck-summary { position: static; }
        }
        @media (max-width: 560px) {
          .ck-wrap { padding: 24px 16px 56px; }
          .ck-card, .ck-summary { padding: 18px; }
          .ck-fields { grid-template-columns: 1fr; }
          .ck-methods { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ck-spin { animation-duration: 2s; }
          .ck-input, .ck-option, .ck-method, .ck-pay-btn { transition: none; }
        }
      `}</style>
    </div>
  );
}