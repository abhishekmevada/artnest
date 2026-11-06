import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useAnimationControls, useReducedMotion } from "framer-motion";
import {
  AlertCircle, ArrowRight, ArrowUpRight, Brush, Check, ChevronDown, Clock, Lightbulb, Loader2, LogIn, Package,
  PenLine, Send, ShieldCheck, Sparkles, Stamp, Upload, User, Users, Wallet, X,
} from "lucide-react";
import { ARTWORKS } from "../../data/artworks";
import { ARTISTS as ADMIN_ARTISTS } from "../admin/adminData";
import { useAuth } from "../../context/AuthContext";
import heroVideo from "../../assets/custom.mp4";
import { API_BASE_URL } from "@/config/api";

const EASE = [0.16, 1, 0.3, 1];
const SEAL_MS = 3400;

const TYPES = ["Portrait", "Pet portrait", "Landscape", "Abstract canvas", "Sculpture", "Digital illustration", "Mural", "Other"];
const SIZES = ["Small (up to 30 cm)", "Medium (30 - 60 cm)", "Large (60 - 100 cm)", "Extra large (100 cm+)", "Not sure yet"];
const STYLES = ["Realistic", "Contemporary", "Abstract", "Minimal", "Traditional / Folk", "Surreal", "Not sure yet"];
const BUDGETS = ["Under ₹15,000", "₹15,000 - ₹30,000", "₹30,000 - ₹60,000", "₹60,000 - ₹1,20,000", "₹1,20,000+"];

const HOW_IT_WORKS = [
  { icon: Lightbulb, title: "Share your brief", text: "Tell us the artwork type, size, style, budget and deadline. Reference images help the artist see what you imagine." },
  { icon: Users, title: "Receive a quote", text: "A verified artist reviews your brief and accepts, declines or replies with a quote and timeline." },
  { icon: Wallet, title: "Approve & start", text: "Once you approve the quote and the agreed deposit is received, the commission becomes binding and work begins." },
  { icon: Package, title: "Track & receive", text: "Follow progress from sketching to finishing, then get your piece in archival packaging with a certificate of authenticity." },
];

const FAQS = [
  ["Is submitting this form an order?", "No. The form sends a request, not a binding order. A commission becomes binding only when you approve the artist's quote and the agreed deposit is received."],
  ["How much will it cost?", "The artist replies with a quote based on size, medium and complexity. The budget range you pick helps them propose something that fits."],
  ["How long does it take?", "The artist confirms a timeline in the quote. Add your deadline in the request so they can tell you upfront whether it is possible."],
  ["Can I ask for changes?", "Yes. Review the sketch with your artist and share feedback while the piece is in progress. The scope of revisions is agreed in the quote."],
  ["Can I cancel or get a refund?", "Before the artist begins bespoke work you can cancel for a full refund. Once work has begun, made-to-order commissions and deposits are non-refundable. See our Terms for details."],
  ["Who owns the artwork rights?", "Unless agreed otherwise in writing, a commission does not include commercial or resale rights. Those remain with the artist."],
];

const SAMPLE_IMG = { Paintings: ARTWORKS[0].img, "Digital Art": ARTWORKS[8].img, Sculpture: ARTWORKS[2].img };
const ARTISTS = ADMIN_ARTISTS.filter((a) => a.status === "Active").map((a) => ({ ...a, img: SAMPLE_IMG[a.specialty] || ARTWORKS[0].img }));

const STAGES = [
  { key: "intro", icon: User, label: "Introduce", title: "Introduce yourself", hint: "So the artist knows who to write back to.", need: ["name", "email"] },
  { key: "medium", icon: Brush, label: "Medium", title: "Choose the medium", hint: "What kind of piece do you have in mind?", need: ["type"] },
  { key: "scope", icon: Wallet, label: "Scope", title: "Set the scope", hint: "Budget and deadline shape the quote.", need: ["budget"] },
  { key: "idea", icon: PenLine, label: "Idea", title: "Paint the idea", hint: "Describe it and pin any references.", need: ["description"] },
  { key: "seal", icon: Stamp, label: "Seal", title: "Seal the request", hint: "One last confirmation and it is on its way.", need: ["agree"] },
];

const EMPTY = { name: "", email: "", phone: "", artist: "Any artist", type: "", size: "", style: "", budget: "", deadline: "", description: "", notes: "", agree: false };
const REQUIRED = ["name", "email", "type", "budget", "description", "agree"];

const FILLED = {
  name: (f) => !!f.name.trim(),
  email: (f) => /^\S+@\S+\.\S+$/.test(f.email),
  phone: (f) => f.phone.replace(/\D/g, "").length >= 10,
  artist: (f) => f.artist !== "Any artist",
  type: (f) => !!f.type,
  size: (f) => !!f.size,
  style: (f) => !!f.style,
  budget: (f) => !!f.budget,
  deadline: (f) => !!f.deadline,
  description: (f) => f.description.trim().length >= 20,
  notes: (f) => f.notes.trim().length >= 3,
  agree: (f) => f.agree,
};

const CHOICE = new Set(["artist", "type", "size", "style", "budget"]);

const TOAST = {
  name: "Signature added",
  email: "Reply address locked in",
  phone: "Number saved for the artist",
  artist: "Artist shortlisted",
  type: "Medium chosen",
  size: "Canvas size set",
  style: "Palette picked",
  budget: "Budget range set",
  deadline: "Deadline marked",
  description: "Idea painted in",
  notes: "Margin note added",
  files: "Reference pinned to the board",
  agree: "Wax is warm. Ready to seal",
};

const stageFlags = (f) => STAGES.map((s) => s.need.every((k) => FILLED[k](f)));

const makeEmpty = (user) => ({
  ...EMPTY,
  name: user?.role === "buyer" ? (user.name || "") : "",
  email: user?.role === "buyer" ? (user.email || "") : "",
});
const fmtDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const GOLD = "#c9a35a";
const WINE = "#5c2b30";
const GREEN = "#4c6b3f";
const PALETTE = ["#96702f", "#5c2b30", "#4c6b3f", "#2f4b6e", "#c9a35a"];
const RAYS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  return { x: Math.cos(a), y: Math.sin(a), c: [GOLD, WINE, GREEN][i % 3] };
});
const TICKS = Array.from({ length: 16 }, (_, i) => i);

function Fx({ kind, n }) {
  const reduce = useReducedMotion();
  if (!n || reduce) return null;

  switch (kind) {
    case "ink":
      return (
        <span className="ca-fx" aria-hidden="true">
          <svg className="ca-fx-ink" viewBox="0 0 200 14" preserveAspectRatio="none">
            <motion.path d="M2 8 C 20 1, 30 14, 52 7 S 88 1, 108 8 S 152 14, 198 4" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0] }} transition={{ duration: 1.1, ease: EASE, times: [0, 0.7, 1] }} />
          </svg>
        </span>
      );
    case "plane":
      return (
        <span className="ca-fx" aria-hidden="true">
          <motion.span className="ca-fx-plane" initial={{ left: "3%", opacity: 0, rotate: -12, y: 6 }} animate={{ left: ["3%", "86%", "108%"], opacity: [0, 1, 0], y: [6, -4, -18], rotate: [-12, -6, -22] }} transition={{ duration: 1, ease: "easeInOut", times: [0, 0.6, 1] }}>
            <Send size={17} />
          </motion.span>
        </span>
      );
    case "pulse":
      return (
        <span className="ca-fx" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="ca-fx-ring" initial={{ scale: 0.4, opacity: 0.7 }} animate={{ scale: 4.2, opacity: 0 }} transition={{ duration: 0.9, delay: i * 0.16, ease: "easeOut" }} />
          ))}
        </span>
      );
    case "spotlight":
      return (
        <span className="ca-fx" aria-hidden="true">
          <motion.span className="ca-fx-spot" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: [0, 1, 0], scale: [0.7, 1.05, 1.2] }} transition={{ duration: 1, ease: "easeOut" }} />
        </span>
      );
    case "frame":
      return (
        <span className="ca-fx" aria-hidden="true">
          {["tl", "tr", "bl", "br"].map((c) => (
            <motion.span key={c} className={`ca-fx-corner is-${c}`} initial={{ opacity: 0, scale: 1.8 }} animate={{ opacity: [0, 1, 1, 0], scale: [1.8, 1, 1, 1] }} transition={{ duration: 1.1, times: [0, 0.3, 0.8, 1], ease: EASE }} />
          ))}
        </span>
      );
    case "palette":
      return (
        <span className="ca-fx" aria-hidden="true">
          {PALETTE.map((c, i) => (
            <motion.span key={c} className="ca-fx-dot" style={{ background: c }} initial={{ x: 0, scale: 0, opacity: 0 }} animate={{ x: -(i + 1) * 20, scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }} transition={{ duration: 1, delay: i * 0.06, times: [0, 0.3, 0.75, 1], ease: EASE }} />
          ))}
        </span>
      );
    case "coins":
      return (
        <span className="ca-fx" aria-hidden="true">
          {[-2, -1, 0, 1, 2].map((k, i) => (
            <motion.span key={k} className="ca-fx-coin" initial={{ x: k * 34, y: 10, opacity: 0, rotate: -20 }} animate={{ y: -40 - (i % 2) * 12, opacity: [0, 1, 0], rotate: [-20, 14, 0] }} transition={{ duration: 0.95, delay: i * 0.07, ease: EASE }}>₹</motion.span>
          ))}
        </span>
      );
    case "ticks":
      return (
        <span className="ca-fx" aria-hidden="true">
          <span className="ca-fx-ticks">
            {TICKS.map((i) => (
              <motion.span key={i} className="ca-fx-tick" style={{ originY: 1 }} initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: [0, 1, 0.35], opacity: [0, 1, 0] }} transition={{ duration: 0.7, delay: i * 0.045 }} />
            ))}
          </span>
        </span>
      );
    case "stroke":
      return (
        <span className="ca-fx" aria-hidden="true">
          <motion.span className="ca-fx-stroke" style={{ originX: 0 }} initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }} transition={{ duration: 1.2, times: [0, 0.55, 1], ease: EASE }} />
        </span>
      );
    case "marker":
      return (
        <span className="ca-fx" aria-hidden="true">
          <motion.span className="ca-fx-marker" style={{ originX: 0 }} initial={{ scaleX: 0, opacity: 0.9 }} animate={{ scaleX: [0, 1, 1], opacity: [0.9, 0.9, 0] }} transition={{ duration: 1.2, times: [0, 0.5, 1], ease: EASE }} />
        </span>
      );
    case "burst":
      return (
        <span className="ca-fx" aria-hidden="true">
          {RAYS.map((r, i) => (
            <motion.span key={i} className="ca-fx-spark" style={{ background: r.c }} initial={{ x: 0, y: 0, scale: 1, opacity: 1 }} animate={{ x: r.x * 40, y: r.y * 30, scale: 0, opacity: [1, 1, 0] }} transition={{ duration: 0.75, ease: EASE }} />
          ))}
        </span>
      );
    case "seal":
      return (
        <span className="ca-fx" aria-hidden="true">
          <motion.span className="ca-fx-wax" initial={{ scale: 3, opacity: 0 }} animate={{ scale: [3, 1, 1.9], opacity: [0, 0.85, 0] }} transition={{ duration: 0.8, times: [0, 0.4, 1], ease: EASE }} />
          <motion.span className="ca-fx-ring is-wine" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 3.4, opacity: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }} />
        </span>
      );
    default:
      return null;
  }
}

function Field({ id, label, error, tick, optional, ok, fx, n, children }) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (error && tick) controls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.38 } });
  }, [error, tick, controls]);

  return (
    <motion.div className={`ca-field ${error ? "has-error" : ""}`} animate={controls}>
      {label && (
        <label htmlFor={id} className="ca-label">
          <span className="ca-label-text">
            {label} {optional && <em>optional</em>}
          </span>
          <AnimatePresence initial={false}>
            {ok && (
              <motion.span className="ca-ok" initial={{ scale: 0, rotate: -90, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 18 }}>
                <Check size={10} strokeWidth={3.4} />
              </motion.span>
            )}
          </AnimatePresence>
        </label>
      )}
      <div className="ca-ctl">
        {children}
        {fx && <Fx key={n || 0} kind={fx} n={n} />}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.span className="ca-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SelectBox({ id, value, onChange, options, placeholder }) {
  return (
    <div className="ca-select">
      <select id={id} value={value} onChange={onChange} className="ca-input">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={16} />
    </div>
  );
}

function StageRail({ flags, activeIdx, toast }) {
  const doneCount = flags.filter(Boolean).length;
  const fill = (Math.min(doneCount, STAGES.length - 1) / (STAGES.length - 1)) * 100;
  return (
    <div className="ca-rail-wrap">
      <ol className="ca-rail">
        <li className="ca-rail-line" aria-hidden="true">
          <motion.span animate={{ width: `${fill}%` }} transition={{ duration: 0.6, ease: EASE }} />
        </li>
        {STAGES.map((s, i) => {
          const done = flags[i];
          const Icon = s.icon;
          return (
            <li key={s.key} className={`ca-node ${done ? "is-done" : ""} ${i === activeIdx && !done ? "is-active" : ""}`}>
              <span className="ca-node-dot">
                {done && <motion.span className="ca-node-ring" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 0.8 }} />}
                <AnimatePresence mode="wait" initial={false}>
                  {done ? (
                    <motion.span key="c" initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 380, damping: 16 }}>
                      <Check size={15} strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <motion.span key="i" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
                      <Icon size={15} strokeWidth={1.8} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <em>{s.label}</em>
            </li>
          );
        })}
      </ol>
      <div className="ca-toast" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={toast.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <Sparkles size={13} /> {toast.text || "Fill in the form and watch your commission take shape."}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Section({ i, flags, activeIdx, children }) {
  const stage = STAGES[i];
  const done = flags[i];
  return (
    <div className={`ca-sec ${i > activeIdx ? "is-later" : ""} ${i === activeIdx && !done ? "is-active" : ""} ${done ? "is-done" : ""}`}>
      <div className="ca-stage">
        <span className="ca-stage-n">
          {done ? (
            <motion.span key="d" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <Check size={13} strokeWidth={3} />
            </motion.span>
          ) : (
            i + 1
          )}
        </span>
        <div className="ca-stage-txt">
          <h3>{stage.title}</h3>
          <p>{stage.hint}</p>
        </div>
      </div>
      <div className="ca-sec-body">{children}</div>
    </div>
  );
}

const SKETCH = {
  Portrait: ["M94 100 a26 28 0 1 0 52 0 a26 28 0 1 0 -52 0", "M66 208 C 72 160, 100 150, 120 150 C 140 150, 168 160, 174 208"],
  "Pet portrait": ["M92 112 a28 26 0 1 0 56 0 a28 26 0 1 0 -56 0", "M94 96 L84 66 L110 84", "M146 96 L156 66 L130 84", "M112 122 L120 130 L128 122"],
  Landscape: ["M40 190 C 70 140, 100 150, 130 175 S 180 150, 200 170", "M40 215 C 80 195, 150 225, 200 205", "M168 88 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0"],
  "Abstract canvas": ["M60 80 h70 v70 h-70 z", "M105 120 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0", "M60 210 L180 120"],
  Sculpture: ["M80 205 h80 v-18 h-80 z", "M92 187 C 86 150, 100 118, 120 100 C 140 118, 154 150, 148 187", "M106 96 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0"],
  "Digital illustration": ["M60 90 h120", "M60 130 h120", "M60 170 h120", "M90 70 v140", "M130 70 v140", "M170 70 v140", "M120 100 l30 30 l-30 30 l-30 -30 z"],
  Mural: ["M50 80 h140", "M50 110 h140", "M50 140 h140", "M50 170 h140", "M50 200 h140", "M95 80 v30", "M145 80 v30", "M70 110 v30", "M120 110 v30", "M170 110 v30", "M95 140 v30", "M145 140 v30", "M70 170 v30", "M120 170 v30", "M170 170 v30"],
  Other: ["M120 70 L132 108 L172 108 L140 131 L152 170 L120 146 L88 170 L100 131 L68 108 L108 108 Z"],
};
const BLOBS = [
  { cx: 80, cy: 90, r: 46, c: GOLD },
  { cx: 165, cy: 120, r: 40, c: "#96702f" },
  { cx: 100, cy: 190, r: 48, c: WINE },
  { cx: 170, cy: 200, r: 36, c: GREEN },
  { cx: 120, cy: 140, r: 34, c: "#2f4b6e" },
];
const STROKES = [
  { d: "M48 105 C 90 80, 140 130, 196 96", c: GOLD },
  { d: "M46 160 C 100 140, 130 190, 200 150", c: WINE },
  { d: "M52 215 C 100 195, 150 235, 198 208", c: GREEN },
];

function Canvas({ form, flags, activeIdx, allDone }) {
  const [intro, medium, scope, idea, seal] = flags;
  const first = form.name.trim().split(" ")[0];
  const washes = scope ? Math.max(1, BUDGETS.indexOf(form.budget) + 1) : 0;
  const sketch = SKETCH[form.type] || SKETCH.Other;
  const plaque = seal ? `Sealed for ${first || "you"}` : first ? `For ${first}` : "Untitled commission";

  return (
    <div className="ca-panel ca-canvas-panel">
      <h3>Your commission takes shape</h3>
      <div className="ca-canvas-stage">
        <svg viewBox="0 0 240 320" role="img" aria-label="A canvas that fills in as you complete each stage of the form">
          <defs>
            <clipPath id="ca-clip"><rect x="28" y="28" width="184" height="224" rx="3" /></clipPath>
          </defs>
          <path d="M62 262 L42 314 M178 262 L198 314 M120 262 L120 304" stroke="#cdbb97" strokeWidth="3" strokeLinecap="round" fill="none" />
          <motion.rect x="12" y="12" width="216" height="256" rx="12" fill="none" stroke={GOLD} strokeWidth="2" initial={false} animate={{ opacity: seal ? [0.2, 1, 0.55] : 0 }} transition={{ duration: 1.4, repeat: seal ? Infinity : 0, repeatType: "reverse" }} />
          <rect x="20" y="20" width="200" height="240" rx="6" fill="#fffdf8" stroke="#cdbb97" strokeWidth="1.5" strokeDasharray="5 5" />
          <motion.rect x="20" y="20" width="200" height="240" rx="6" fill="none" stroke="#6f5222" strokeWidth="3" initial={false} animate={{ pathLength: intro ? 1 : 0, opacity: intro ? 1 : 0 }} transition={{ duration: 0.9, ease: EASE }} />

          <g clipPath="url(#ca-clip)">
            {BLOBS.map((b, i) => (
              <motion.circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.c} style={{ mixBlendMode: "multiply" }} initial={false} animate={{ scale: i < washes ? 1 : 0, opacity: i < washes ? 0.32 : 0 }} transition={{ duration: 0.8, delay: i * 0.07, ease: EASE }} />
            ))}
            {medium && (
              <g key={form.type} fill="none" stroke="#1c1712" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {sketch.map((d, i) => (
                  <motion.path key={d} d={d} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: i * 0.14, ease: EASE }} />
                ))}
              </g>
            )}
            {STROKES.map((s, i) => (
              <motion.path key={s.d} d={s.d} fill="none" stroke={s.c} strokeWidth="9" strokeLinecap="round" initial={false} animate={{ pathLength: idea ? 1 : 0, opacity: idea ? 0.55 : 0 }} transition={{ duration: 0.8, delay: i * 0.18, ease: EASE }} />
            ))}
          </g>

          <motion.path d="M150 236 q8 -18 14 -2 t14 -2 t14 -6" fill="none" stroke={WINE} strokeWidth="2" strokeLinecap="round" initial={false} animate={{ pathLength: seal ? 1 : 0, opacity: seal ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.2 }} />
          <motion.g initial={false} animate={{ scale: seal ? 1 : 0, opacity: seal ? 1 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.5 }}>
            <circle cx="48" cy="236" r="11" fill={WINE} />
            <circle cx="48" cy="236" r="7" fill="none" stroke="#e9cf9a" strokeWidth="1" />
          </motion.g>

          <rect x="50" y="274" width="140" height="24" rx="4" fill="#f3ead6" stroke="#cdbb97" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.text key={plaque} x="120" y="286" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#4a423a" style={{ fontFamily: "var(--serif)" }} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}>
              {plaque}
            </motion.text>
          </AnimatePresence>
        </svg>
      </div>
      <p className="ca-canvas-cap">{allDone ? "All five stages complete" : `Stage ${activeIdx + 1} of ${STAGES.length} · ${STAGES[activeIdx].title}`}</p>
    </div>
  );
}

const DUST = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2;
  const d = 70 + (i % 3) * 26;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8, s: 2 + (i % 3), c: [GOLD, "#e0bb74", WINE, "#fbf8f1"][i % 4] };
});

function SealSequence({ reduce }) {
  if (reduce) {
    return (
      <motion.div className="ca-seal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Loader2 size={28} className="ca-spin" />
        <p className="ca-seal-cap is-static">Sending your request…</p>
      </motion.div>
    );
  }
  const D = SEAL_MS / 1000;
  return (
    <motion.div className="ca-seal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
      <svg viewBox="0 0 360 300" className="ca-seal-svg" aria-hidden="true">
        <motion.ellipse cx="180" cy="276" rx="92" ry="8" fill="rgba(60,40,10,.16)" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0], scaleX: [0.6, 1, 1, 0.4] }} transition={{ duration: D, times: [0, 0.14, 0.78, 1] }} />
        <motion.g
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: [0, 1, 1, 1, 1, 1, 0], y: [30, 0, 0, 5, 0, 0, -210], x: [0, 0, 0, 0, 0, 0, 170], scale: [0.92, 1, 1, 0.965, 1, 1, 0.6], rotate: [0, 0, 0, 0, 0, 0, -10] }}
          transition={{ duration: D, times: [0, 0.136, 0.591, 0.606, 0.667, 0.803, 1], ease: "easeInOut" }}
        >
          <rect x="50" y="90" width="260" height="160" rx="10" fill="#efe6d3" stroke="#cdbb97" strokeWidth="1.5" />
          <motion.polygon points="50,90 310,90 180,2" fill="#e5d9bf" stroke="#cdbb97" strokeWidth="1.5" strokeLinejoin="round" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.15, duration: 0.01 }} />

          <motion.g initial={{ y: -120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.75, ease: EASE }}>
            <rect x="95" y="58" width="170" height="150" rx="4" fill="#fffdf8" stroke="#e0d4bc" />
            <rect x="113" y="80" width="90" height="5" rx="2.5" fill="#cdbb97" />
            <rect x="113" y="98" width="134" height="4" rx="2" fill="#e0d4bc" />
            <rect x="113" y="112" width="120" height="4" rx="2" fill="#e0d4bc" />
            <rect x="113" y="126" width="128" height="4" rx="2" fill="#e0d4bc" />
            <path d="M232 76 q6 -10 12 0 t12 0" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
          </motion.g>

          <path d="M50 90 L180 178 L310 90 L310 240 Q310 250 300 250 L60 250 Q50 250 50 240 Z" fill="#fbf8f1" stroke="#cdbb97" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M54 246 L165 158 M306 246 L195 158" stroke="#e0d4bc" strokeWidth="1.2" fill="none" />

          <motion.polygon points="50,90 310,90 180,178" fill="#f3ead6" stroke="#cdbb97" strokeWidth="1.5" strokeLinejoin="round" style={{ originX: 0.5, originY: 0 }} initial={{ scaleY: -1, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ scaleY: { delay: 1.15, duration: 0.5, ease: EASE }, opacity: { delay: 1.15, duration: 0.01 } }} />

          {[0, 1].map((i) => (
            <motion.circle key={i} cx="180" cy="178" r="20" fill="none" stroke={GOLD} strokeWidth="2" initial={{ opacity: 0, scale: 1 }} animate={{ opacity: [0, 0.8, 0], scale: [1, 4.6] }} transition={{ delay: 2.0 + i * 0.12, duration: 0.75, ease: "easeOut" }} />
          ))}
          {DUST.map((p, i) => (
            <motion.circle key={i} cx="180" cy="178" r={p.s} fill={p.c} initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: [0, 1, 0], x: p.x, y: p.y, scale: [1, 1, 0.2] }} transition={{ delay: 2.0, duration: 0.95, ease: EASE }} />
          ))}

          <g transform="translate(180 178)">
            <motion.g initial={{ opacity: 0, scale: 2.6, y: -46 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.75, duration: 0.27, ease: [0.55, 0, 1, 0.45] }}>
              <circle r="28" fill={WINE} />
              <circle r="28" fill="none" stroke="#7d3b41" strokeWidth="4" strokeDasharray="4 2.5" />
              <circle r="17" fill="none" stroke="#e9cf9a" strokeWidth="1.5" />
              <text textAnchor="middle" dominantBaseline="central" fontSize="20" fill="#e9cf9a" style={{ fontFamily: "var(--serif)" }}>A</text>
            </motion.g>
          </g>
        </motion.g>
      </svg>

      <div className="ca-seal-caps">
        {[["Folding your brief…", 0.2, 1.3], ["Pressing the wax seal…", 1.5, 1.1], ["On its way to the artists", 2.55, 0.85]].map(([t, delay, dur]) => (
          <motion.p key={t} className="ca-seal-cap" initial={{ opacity: 0, y: 6 }} animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -6] }} transition={{ delay, duration: dur, times: [0, 0.2, 0.8, 1] }}>
            {t}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

const FLAP_POOL = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

function FlapText({ text, reduced }) {
  const [out, setOut] = useState(reduced ? text : text.replace(/[^-]/g, "0"));
  useEffect(() => {
    if (reduced) return undefined;
    const start = performance.now();
    const id = setInterval(() => {
      const t = performance.now() - start;
      setOut(text.split("").map((c, i) => (c === "-" || t > 600 + i * 220 ? c : FLAP_POOL[Math.floor(Math.random() * FLAP_POOL.length)])).join(""));
      if (t > 600 + text.length * 220) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [text, reduced]);

  return (
    <div className="ca-flap" aria-label={`Reference ${text}`}>
      {out.split("").map((ch, i) => (
        <motion.span key={`${i}${ch}`} className={ch === "-" ? "is-dash" : ""} initial={{ rotateX: -90 }} animate={{ rotateX: 0 }} transition={{ duration: 0.12 }}>
          {ch}
        </motion.span>
      ))}
    </div>
  );
}

function DoneView({ form, refId, onReset, reduce }) {
  const first = form.name.trim().split(" ")[0];
  const rows = [
    ["Artwork", form.type],
    ["Style", form.style || "Open to suggestions"],
    ["Budget", form.budget],
    ["Artist", form.artist],
    ["Needed by", form.deadline ? fmtDate(form.deadline) : "Flexible"],
  ];
  const track = [
    ["done", "Request received", "Status: New"],
    ["now", "Artist review", "An artist reviews your brief"],
    ["next", "Quote & deposit", "Binding only after you approve the quote"],
  ];
  return (
    <motion.div className="ca-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <motion.span className="ca-done-badge" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
        <Check size={20} strokeWidth={3} />
      </motion.span>
      <h2>Request received</h2>
      <p>
        Thanks {first}! Your brief is with our artists. We will write to <strong>{form.email}</strong> as soon as an artist responds, usually with a quote and timeline.
      </p>

      <motion.div className="ca-ticket" initial={{ opacity: 0, y: -46, rotate: -4, scale: 0.94 }} animate={{ opacity: 1, y: 0, rotate: -1.2, scale: 1 }} transition={{ type: "spring", stiffness: 140, damping: 14 }}>
        <div className="ca-ticket-top">
          <span>Custom request</span>
          <span className="ca-pill"><i /> New</span>
        </div>
        <FlapText text={refId} reduced={reduce} />
        <div className="ca-ticket-div" />
        <dl>
          {rows.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <motion.div className="ca-stamp" initial={{ opacity: 0, scale: 2.4, rotate: -30 }} animate={{ opacity: 0.92, scale: 1, rotate: -12 }} transition={{ delay: reduce ? 0 : 1.5, duration: 0.35, ease: [0.55, 0, 1, 0.45] }}>
          Received
        </motion.div>
      </motion.div>

      <ol className="ca-track">
        {track.map(([st, t, s], i) => (
          <motion.li key={t} className={`is-${st}`} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduce ? 0 : 1.1 + i * 0.25, duration: 0.4, ease: EASE }}>
            <span className="ca-track-dot">{st === "done" && <Check size={12} strokeWidth={3.2} />}</span>
            <div><strong>{t}</strong><small>{s}</small></div>
          </motion.li>
        ))}
      </ol>

      <div className="ca-done-actions">
        <button type="button" onClick={onReset} className="ca-btn is-ghost">Submit another request</button>
        <Link to="/discover" className="ca-btn is-ghost">Browse artworks <ArrowUpRight size={14} strokeWidth={2} /></Link>
      </div>
    </motion.div>
  );
}

function Reveal({ children, delay = 0, y = 40, className }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -90px 0px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Head({ title, sub, shine }) {
  return (
    <Reveal>
      <div className="ca-head">
        <h2 className={`ca-h2 ${shine ? "ca-shine" : ""}`}>{title}</h2>
        <span className="ca-orn" aria-hidden="true">
          <i />
          <Sparkles size={12} strokeWidth={1.8} />
          <i />
        </span>
        {sub && <p className="ca-sub">{sub}</p>}
      </div>
    </Reveal>
  );
}

export default function CustomArt() {
  const { user, blockIfArtist } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [form, setForm] = useState(() => makeEmpty(user));
  const [artistsList, setArtistsList] = useState(ARTISTS);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tick, setTick] = useState(0);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState("form");
  const [refId, setRefId] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [fx, setFx] = useState({});
  const [toast, setToast] = useState({ id: 0, text: "" });
  const filesRef = useRef(files);
  const videoRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    if (user?.role === "buyer") {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const fetchArtists = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/guest/get-all-artist`);
        if (!response.ok) return;
        const data = await response.json();
        if (isMounted && Array.isArray(data.artists) && data.artists.length > 0) {
          const mapped = data.artists.map((a, idx) => {
            const rawSp = a.artistProfile?.specialty || a.specialty;
            const specialty = Array.isArray(rawSp)
              ? (rawSp.length > 0
                  ? rawSp.map((s) => String(s).charAt(0).toUpperCase() + String(s).slice(1)).join(", ")
                  : "Paintings")
              : (typeof rawSp === "string" && rawSp.trim() ? rawSp : "Paintings");
            const sampleKey = Array.isArray(rawSp) ? rawSp[0] : rawSp;

            return {
              _id: a._id,
              id: a._id,
              name: a.name || "Artist",
              city: a.artistProfile?.location || a.artistProfile?.city || a.city || "India",
              specialty,
              works: a.topArtworks?.length ?? a.works ?? 12,
              img:
                a.topArtworks?.[0]?.image ||
                a.img ||
                SAMPLE_IMG[sampleKey] ||
                ARTWORKS[idx % ARTWORKS.length].img,
            };
          });
          setArtistsList(mapped);
        }
      } catch (err) {
        console.log("Using default artist list fallback:", err);
      }
    };
    fetchArtists();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    const slow = () => { v.playbackRate = 0.5; };
    slow();
    v.addEventListener("loadedmetadata", slow);
    v.addEventListener("play", slow);
    return () => {
      v.removeEventListener("loadedmetadata", slow);
      v.removeEventListener("play", slow);
    };
  }, []);

  useEffect(() => () => {
    clearTimeout(timer.current);
    filesRef.current.forEach((f) => URL.revokeObjectURL(f.url));
  }, []);

  const flags = stageFlags(form);
  const firstOpen = flags.indexOf(false);
  const allDone = firstOpen === -1;
  const activeIdx = allDone ? STAGES.length - 1 : firstOpen;
  const done = REQUIRED.filter((k) => FILLED[k](form)).length;
  const pct = Math.round((done / REQUIRED.length) * 100);

  const say = (text) => setToast((s) => ({ id: s.id + 1, text }));
  const fire = (key, text) => {
    setFx((p) => ({ ...p, [key]: (p[key] || 0) + 1 }));
    say(text || TOAST[key]);
  };

  const setField = (key, value) => {
    const next = { ...form, [key]: value };
    const was = FILLED[key](form);
    const now = FILLED[key](next);
    const before = stageFlags(form);
    const after = stageFlags(next);
    const finished = after.findIndex((v, i) => v && !before[i]);
    if (now && (!was || (CHOICE.has(key) && form[key] !== value))) {
      fire(key, finished > -1 ? `Stage ${finished + 1} complete · ${STAGES[finished].label}` : undefined);
    }
    setForm(next);
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (apiError) setApiError("");
  };

  const scrollToForm = () => document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const requestFrom = (name) => {
    setField("artist", name);
    scrollToForm();
  };

  const addFiles = (list) => {
    const picked = Array.from(list || []).filter((f) => f.type.startsWith("image/"));
    const added = picked.slice(0, 4 - files.length).map((f) => ({
      file: f,
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    if (!added.length) return;
    setFiles((prev) => [...prev, ...added]);
    say(TOAST.files);
  };

  const removeFile = (i) => {
    URL.revokeObjectURL(files[i].url);
    setFiles((prev) => prev.filter((_, x) => x !== i));
  };

  const validate = () => {
    const e = {};
    if (!FILLED.name(form)) e.name = "Please enter your name";
    if (!FILLED.email(form)) e.email = "Enter a valid email address";
    if (!FILLED.type(form)) e.type = "Choose the type of artwork";
    if (!FILLED.budget(form)) e.budget = "Select a budget range";
    if (!FILLED.description(form)) e.description = "Tell us a little more (at least 20 characters)";
    if (!FILLED.agree(form)) e.agree = "Please accept to continue";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (phase !== "form" || isSubmitting) return;
    if (blockIfArtist()) return;

    if (!user) {
      setApiError("Please log in as a buyer to submit your commission request.");
      say("Please log in as a buyer");
      return;
    }
    if (user.role !== "buyer") {
      setApiError("Only buyers can submit custom artwork requests.");
      say("Buyer account required");
      return;
    }

    const errs = validate();
    setErrors(errs);
    const first = REQUIRED.find((k) => errs[k]);
    if (first) {
      setTick((t) => t + 1);
      document.getElementById(`ca-${first}`)?.focus();
      return;
    }

    setApiError("");
    setIsSubmitting(true);
    setPhase("sealing");
    scrollToForm();

    const minDelay = new Promise((resolve) =>
      setTimeout(resolve, reduce ? 700 : SEAL_MS)
    );

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim());

      const digits = form.phone ? form.phone.replace(/\D/g, "") : "";
      if (digits) {
        formData.append("phonenumber", digits);
      }

      const matchedArtist = artistsList.find(
        (a) => a.name === form.artist || a._id === form.artist
      );
      if (matchedArtist && matchedArtist._id) {
        formData.append("preferedArtist", matchedArtist._id);
      } else if (form.artist && form.artist !== "Any artist") {
        formData.append("preferedArtist", form.artist);
      } else {
        const anyArtist = artistsList.find((a) => a._id);
        formData.append("preferedArtist", anyArtist?._id || "Any artist");
      }

      formData.append("typeofArtwork", form.type);
      formData.append("size", form.size || "Not sure yet");
      formData.append("style", form.style || "Not sure yet");
      formData.append("budge", form.budget); // backend expects 'budge'
      if (form.deadline) {
        formData.append("neededDate", form.deadline);
      }
      formData.append("description", form.description.trim());
      if (form.notes) {
        formData.append("note", form.notes.trim());
      }

      files.forEach((f) => {
        if (f.file) {
          formData.append("image", f.file);
        }
      });

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/buyer/create-custom-artwork`,
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        }
      );

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          resData.message || `Submission failed with status ${response.status}`
        );
      }

      // Wait for seal animation to complete smoothly
      await minDelay;

      const newId =
        resData?.data?.customArtworkId ||
        resData?.customArtworkId ||
        `CR-${502 + Math.floor(Math.random() * 400)}`;

      try {
        const all =
          JSON.parse(localStorage.getItem("artnest_custom_requests")) || [];
        localStorage.setItem(
          "artnest_custom_requests",
          JSON.stringify([
            {
              ...form,
              id: newId,
              owner: user?.name || form.name || "",
              status: "Not started",
              requested: new Date().toISOString(),
              images: files.map((f) => f.name),
            },
            ...all,
          ])
        );
      } catch (storageErr) {
        console.error("Local storage sync error:", storageErr);
      }

      setRefId(newId);
      setPhase("done");
      scrollToForm();
    } catch (err) {
      console.error("Custom artwork creation error:", err);
      setPhase("form");
      setApiError(err.message || "Failed to submit custom artwork request.");
      say(err.message || "Request failed");
      scrollToForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    clearTimeout(timer.current);
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    setForm(makeEmpty(user));
    setErrors({});
    setApiError("");
    setFx({});
    setToast({ id: 0, text: "" });
    setRefId(null);
    setPhase("form");
  };

  const today = new Date().toISOString().split("T")[0];
  const rise = (delay) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: EASE } });
  const descLen = form.description.trim().length;

  return (
    <div className="ca-app">
      <section className="ca-hero">
        <video ref={videoRef} className="ca-hero-video" src={heroVideo} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
        <div className="ca-hero-glow" aria-hidden="true" />
        <div className="ca-hero-grain" aria-hidden="true" />
        <div className="ca-hero-overlay" aria-hidden="true" />

        <div className="ca-wrap ca-hero-grid">
          <motion.p className="ca-eyebrow" {...rise(0)}>
            <Sparkles size={13} /> Custom artworks
          </motion.p>

          <h1 className="ca-title">
            <span className="ca-line">
              <motion.span initial={reduce ? false : { y: "115%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: EASE }}>
                Art made just
              </motion.span>
            </span>
            <span className="ca-line">
              <motion.span className="ca-title-accent" initial={reduce ? false : { y: "115%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: EASE }}>
                for you.
              </motion.span>
            </span>
          </h1>

          <motion.p className="ca-lead" {...rise(0.4)}>
            Describe the piece you imagine. A verified ArtNest artist reviews your brief and replies with a quote, then takes it from the first sketch to final delivery.
          </motion.p>

          <motion.div className="ca-actions" {...rise(0.5)}>
            <button type="button" onClick={scrollToForm} className="ca-btn">
              Start your request <ArrowUpRight size={15} strokeWidth={2} />
            </button>
            <a href="#how-it-works" className="ca-btn is-ghost">How it works</a>
          </motion.div>

          <motion.div className="ca-trust" {...rise(0.62)}>
            {[[ShieldCheck, "Verified artists"], [Clock, "Quote before you commit"], [Check, "Deposit only after you approve"]].map(([Icon, text]) => (
              <span key={text}><Icon size={16} /> {text}</span>
            ))}
          </motion.div>
        </div>

        <a href="#how-it-works" className="ca-scroll" aria-label="Scroll to how it works">
          <ChevronDown size={18} />
        </a>
      </section>

      <section id="how-it-works" className="ca-section is-white">
        <div className="ca-wrap">
          <Head title="How custom art works" sub="Four simple steps from idea to artwork on your wall." shine />
          <div className="ca-steps">
            {HOW_IT_WORKS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.12} className="ca-rv">
                <div className="ca-step">
                  <div className="ca-step-top">
                    <span className="ca-step-icon"><Icon size={20} strokeWidth={1.7} /></span>
                    <span className="ca-step-num">0{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <span className="ca-step-arrow" aria-hidden="true">
                      <span className="ca-step-chip"><ArrowRight size={13} strokeWidth={2.3} /></span>
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="request" className="ca-section">
        <div className="ca-wrap ca-form-grid">
          <motion.div className="ca-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: EASE }}>
            <div className="ca-card-glow" aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              {phase === "done" ? (
                <DoneView key="done" form={form} refId={refId} onReset={reset} reduce={reduce} />
              ) : phase === "sealing" ? (
                <SealSequence key="sealing" reduce={reduce} />
              ) : (
                <motion.form key="form" onSubmit={submit} noValidate className="ca-form" exit={{ opacity: 0, scale: 0.97, y: -8 }} transition={{ duration: 0.25 }}>
                  <div className="ca-form-head">
                    <div>
                      <h2>Tell us about your artwork</h2>
                      <p>Five short stages. The more detail you share, the better the match.</p>
                    </div>
                    <div className="ca-progress" aria-label={`${done} of ${REQUIRED.length} required fields complete`}>
                      <svg viewBox="0 0 44 44" aria-hidden="true">
                        <circle className="ca-progress-bg" cx="22" cy="22" r="18" />
                        <motion.circle
                          className="ca-progress-fg"
                          cx="22" cy="22" r="18"
                          initial={false}
                          animate={{ pathLength: done / REQUIRED.length }}
                          transition={{ duration: 0.6, ease: EASE }}
                        />
                      </svg>
                      <span className="ca-progress-txt">
                        <strong>{pct}%</strong>
                        <small>{done}/{REQUIRED.length}</small>
                      </span>
                    </div>
                  </div>

                  {!user && (
                    <div className="ca-auth-banner">
                      <LogIn size={15} />
                      <span>
                        You are browsing as a guest. Please{" "}
                        <Link to="/buyer/login">sign in as a buyer</Link> to submit your request.
                      </span>
                    </div>
                  )}

                  {apiError && (
                    <div className="ca-api-error">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <AlertCircle size={16} />
                        <span>{apiError}</span>
                      </div>
                      <button type="button" onClick={() => setApiError("")} aria-label="Dismiss error">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <StageRail flags={flags} activeIdx={activeIdx} toast={toast} />

                  <Section i={0} flags={flags} activeIdx={activeIdx}>
                    <div className="ca-row two">
                      <Field id="ca-name" label="Full name" error={errors.name} tick={tick} ok={FILLED.name(form)} fx="ink" n={fx.name}>
                        <input id="ca-name" className="ca-input" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Your name" autoComplete="name" />
                      </Field>
                      <Field id="ca-email" label="Email" error={errors.email} tick={tick} ok={FILLED.email(form)} fx="plane" n={fx.email}>
                        <input id="ca-email" type="email" className="ca-input" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="you@email.com" autoComplete="email" />
                      </Field>
                      <Field id="ca-phone" label="Phone" optional ok={FILLED.phone(form)} fx="pulse" n={fx.phone}>
                        <input id="ca-phone" className="ca-input" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" inputMode="tel" />
                      </Field>
                      <Field id="ca-artist" label="Preferred artist" optional ok={FILLED.artist(form)} fx="spotlight" n={fx.artist}>
                        <SelectBox id="ca-artist" value={form.artist} onChange={(e) => setField("artist", e.target.value)} options={["Any artist", ...artistsList.map((a) => a.name)]} />
                      </Field>
                    </div>
                  </Section>

                  <Section i={1} flags={flags} activeIdx={activeIdx}>
                    <Field id="ca-type" label="Type of artwork" error={errors.type} tick={tick} ok={FILLED.type(form)}>
                      <div className="ca-chips" id="ca-type" tabIndex={-1}>
                        {TYPES.map((t) => {
                          const active = form.type === t;
                          return (
                            <motion.button key={t} type="button" whileTap={{ scale: 0.95 }} aria-pressed={active} onClick={() => setField("type", t)} className={`ca-chip ${active ? "is-active" : ""}`}>
                              {active && <Fx key={fx.type} kind="burst" n={fx.type} />}
                              <AnimatePresence initial={false}>
                                {active && (
                                  <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: 14, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ display: "flex", overflow: "hidden" }}>
                                    <Check size={13} strokeWidth={2.6} />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                              {t}
                            </motion.button>
                          );
                        })}
                      </div>
                    </Field>
                    <div className="ca-row two">
                      <Field id="ca-size" label="Size" optional ok={FILLED.size(form)} fx="frame" n={fx.size}>
                        <SelectBox id="ca-size" value={form.size} onChange={(e) => setField("size", e.target.value)} options={SIZES} placeholder="Select size" />
                      </Field>
                      <Field id="ca-style" label="Preferred style" optional ok={FILLED.style(form)} fx="palette" n={fx.style}>
                        <SelectBox id="ca-style" value={form.style} onChange={(e) => setField("style", e.target.value)} options={STYLES} placeholder="Select style" />
                      </Field>
                    </div>
                  </Section>

                  <Section i={2} flags={flags} activeIdx={activeIdx}>
                    <div className="ca-row two">
                      <Field id="ca-budget" label="Budget" error={errors.budget} tick={tick} ok={FILLED.budget(form)} fx="coins" n={fx.budget}>
                        <SelectBox id="ca-budget" value={form.budget} onChange={(e) => setField("budget", e.target.value)} options={BUDGETS} placeholder="Select budget" />
                      </Field>
                      <Field id="ca-deadline" label="Needed by" optional ok={FILLED.deadline(form)} fx="ticks" n={fx.deadline}>
                        <input id="ca-deadline" type="date" min={today} className="ca-input" value={form.deadline} onChange={(e) => setField("deadline", e.target.value)} />
                      </Field>
                    </div>
                  </Section>

                  <Section i={3} flags={flags} activeIdx={activeIdx}>
                    <Field id="ca-description" label="Describe your idea" error={errors.description} tick={tick} ok={FILLED.description(form)} fx="stroke" n={fx.description}>
                      <textarea id="ca-description" rows={5} className="ca-input ca-textarea" value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Subject, colours, mood, where it will hang, anything that inspires you..." />
                      <span className={`ca-count ${descLen >= 20 ? "is-ok" : ""}`}>
                        {descLen >= 20 ? <><Check size={12} strokeWidth={2.6} /> Looks good</> : `${20 - descLen} more characters`}
                      </span>
                    </Field>

                    <Field id="ca-notes" label="Additional notes" optional ok={FILLED.notes(form)} fx="marker" n={fx.notes}>
                      <textarea id="ca-notes" rows={2} className="ca-input ca-textarea is-short" value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Anything else the artist should know: framing, gifting, materials to avoid..." />
                    </Field>

                    <div className="ca-field">
                      <span className="ca-label"><span className="ca-label-text">Reference images <em>optional, up to 4</em></span></span>
                      <div className="ca-uploads">
                        <AnimatePresence mode="popLayout" initial={false}>
                          {files.map((f, i) => (
                            <motion.div key={f.url} layout className="ca-thumb" initial={{ opacity: 0, y: -60, rotate: i % 2 ? 14 : -14, scale: 1.15 }} animate={{ opacity: 1, y: 0, rotate: i % 2 ? 2.5 : -2.5, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 220, damping: 16 }}>
                              <img src={f.url} alt={f.name} />
                              <motion.span className="ca-flash" initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.55 }} />
                              <button type="button" onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}><X size={12} /></button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {files.length < 4 && (
                          <label
                            className={`ca-drop ${dragging ? "is-drag" : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                          >
                            <Upload size={18} strokeWidth={1.7} />
                            <span>{dragging ? "Drop here" : "Add images"}</span>
                            <input type="file" accept="image/*" multiple className="ca-sr" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                          </label>
                        )}
                      </div>
                    </div>
                  </Section>

                  <Section i={4} flags={flags} activeIdx={activeIdx}>
                    <Field id="ca-agree" error={errors.agree} tick={tick}>
                      <label className="ca-agree">
                        <input id="ca-agree" type="checkbox" className="ca-sr" checked={form.agree} onChange={(e) => setField("agree", e.target.checked)} />
                        <span className={`ca-checkbox ${form.agree ? "is-checked" : ""}`}>
                          <motion.svg viewBox="0 0 12 10" initial={false} animate={{ opacity: form.agree ? 1 : 0, scale: form.agree ? 1 : 0.5 }} transition={{ duration: 0.15 }}>
                            <motion.path d="M1 5L4.2 8.2L11 1" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: form.agree ? 1 : 0 }} transition={{ duration: 0.3, delay: 0.1 }} />
                          </motion.svg>
                          {form.agree && <Fx key={fx.agree} kind="seal" n={fx.agree} />}
                        </span>
                        <span className={`ca-agree-text ${form.agree ? "is-on" : ""}`}>
                          I agree to be contacted about this request and I confirm I have the right to share any reference images. I accept the ArtNest{" "}
                          <Link to="/terms" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Terms</Link> and{" "}
                          <Link to="/privacy" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
                        </span>
                      </label>
                    </Field>
                    <p className="ca-fine">This is a request, not a binding order. A commission starts only after you approve the artist&apos;s quote and the agreed deposit is received.</p>
                    <button type="submit" disabled={isSubmitting} className={`ca-btn is-lg ${allDone ? "is-ready" : ""}`}>
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="ca-spin" /> Sending request...
                        </>
                      ) : (
                        <>
                          Send request <Send size={15} strokeWidth={2} />
                        </>
                      )}
                    </button>
                  </Section>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.aside className="ca-aside" initial={reduce ? false : { opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "0px 0px -90px 0px" }} transition={{ duration: 0.85, delay: 0.15, ease: EASE }}>
            <Canvas form={form} flags={flags} activeIdx={activeIdx} allDone={allDone} />
            <div className="ca-panel">
              <h3>What happens next</h3>
              <ol>
                {["An artist reviews your brief. Your request shows as New, then Reviewing.", "The artist accepts, declines or replies with a quote and timeline.", "Approve the quote and pay the agreed deposit. Work begins and you can follow it from sketching to finishing."].map((t, i) => (
                  <li key={t}><span>{i + 1}</span>{t}</li>
                ))}
              </ol>
            </div>
            <div className="ca-panel is-tint">
              <ShieldCheck size={22} strokeWidth={1.7} />
              <strong>No commitment upfront</strong>
              <p>Nothing is binding until you approve a quote. Originals ship in archival packaging with a certificate of authenticity.</p>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="ca-section is-white">
        <div className="ca-wrap">
          <Head title="Artists open to commissions" sub="Pick a favourite and we will pre-fill your request." />
          <div className="ca-artists">
            {artistsList.map((a, i) => (
              <Reveal key={a.id || a._id || a.name} delay={(i % 3) * 0.12} className="ca-rv">
                <article className="ca-artist">
                  <div className="ca-artist-media">
                    <img src={a.img} alt={`Sample ${String(a.specialty || "artwork").toLowerCase()} artwork`} loading="lazy" />
                    <span className="ca-artist-tag">{a.specialty}</span>
                  </div>
                  <div className="ca-artist-body">
                    <h3>{a.name}</h3>
                    <p>{a.city} · {a.specialty}</p>
                    <span>{a.works} artworks listed</span>
                    <button type="button" onClick={() => requestFrom(a.name)} className="ca-btn is-ghost is-block">
                      Request from {(a.name || "Artist").split(" ")[0]} <ArrowUpRight size={14} strokeWidth={2} />
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ca-section">
        <div className="ca-wrap ca-narrow">
          <Head title="Common questions" />
          <Reveal delay={0.1}>
            <div className="ca-faq">
              {FAQS.map(([q, a], i) => {
                const open = openFaq === i;
                return (
                  <div key={q} className={`ca-faq-item ${open ? "is-open" : ""}`}>
                    <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)}>
                      <span className="ca-faq-q">
                        <em>{String(i + 1).padStart(2, "0")}</em>
                        {q}
                      </span>
                      <ChevronDown size={18} />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} style={{ overflow: "hidden" }}>
                          <p>{a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>
          <p className="ca-faq-foot">
            Still unsure? Read our <Link to="/terms">Terms</Link> or <Link to="/contact">contact us</Link>.
          </p>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Work+Sans:wght@400;500;600&display=swap');

        .ca-app {
          --ink: #1c1712; --ink-soft: #4a423a; --muted: #8c7f68;
          --paper: #f6f1e6; --paper-2: #efe6d3; --card: #fbf8f1; --line: #e0d4bc;
          --brass: #96702f; --brass-deep: #6f5222; --wine: #5c2b30; --danger: #a63a2b; --ok: #4c6b3f;
          --serif: "Fraunces", "Iowan Old Style", Georgia, serif;
          --sans: "Work Sans", "Inter", system-ui, -apple-system, sans-serif;
          --shadow-sm: 0 1px 2px rgba(60,40,10,.06), 0 2px 8px rgba(60,40,10,.05);
          --shadow-md: 0 2px 4px rgba(60,40,10,.06), 0 18px 40px -12px rgba(60,40,10,.22);
          --shadow-lg: 0 4px 8px rgba(60,40,10,.06), 0 30px 60px -20px rgba(60,40,10,.3);
          --h: 46px;              
          --pad: clamp(18px, 3.4vw, 36px);
          --gutter: clamp(14px, 3vw, 28px);
          --sec-y: clamp(56px, 8vw, 88px);

          background: var(--paper); color: var(--ink-soft); font-family: var(--sans);
          min-height: 100vh; overflow-x: clip;
          -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
        }
        .ca-app * { box-sizing: border-box; }
        .ca-app button, .ca-app input, .ca-app select, .ca-app textarea { font-family: var(--sans); }
        .ca-app :focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; border-radius: 6px; }
        .ca-sr { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
        .ca-wrap { width: 100%; max-width: 1360px; margin: 0 auto; padding-inline: var(--gutter); }
        .ca-narrow { max-width: 880px; }

        .ca-hero { position: relative; isolation: isolate; overflow: hidden; min-height: 100vh; min-height: 100svh; display: flex; align-items: center; justify-content: center; padding: clamp(104px, 16vh, 140px) 0 clamp(96px, 14vh, 128px); background: #2a1a10; }
        .ca-hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; transform: scale(1.04); filter: saturate(1.05) contrast(1.03); }
        .ca-hero-glow { position: absolute; inset: -25%; z-index: 1; pointer-events: none; background:
          radial-gradient(circle at 28% 32%, rgba(201,163,90,.24), transparent 46%),
          radial-gradient(circle at 72% 66%, rgba(92,43,48,.3), transparent 50%);
          animation: ca-drift 20s ease-in-out infinite alternate; }
        @keyframes ca-drift { from { transform: translate3d(-2%, -1%, 0) scale(1.02); } to { transform: translate3d(2%, 2%, 0) scale(1.1); } }
        .ca-hero-grain { position: absolute; inset: -60px; z-index: 1; pointer-events: none; opacity: .07; mix-blend-mode: overlay; background-repeat: repeat; background-size: 160px 160px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          animation: ca-grain 1.4s steps(3) infinite; }
        @keyframes ca-grain { 0% { transform: translate(0,0); } 33% { transform: translate(-3%,2%); } 66% { transform: translate(2%,-3%); } 100% { transform: translate(0,0); } }
        .ca-hero-overlay { position: absolute; inset: 0; z-index: 2; background:
          radial-gradient(ellipse 62% 58% at 50% 48%, rgba(30,17,10,.62) 0%, rgba(30,17,10,.34) 55%, transparent 100%),
          linear-gradient(180deg, rgba(40,24,14,.52) 0%, rgba(40,24,14,.08) 38%, rgba(40,24,14,.44) 100%),
          radial-gradient(ellipse at center, transparent 52%, rgba(20,10,5,.55) 100%); }
        .ca-hero-grid { position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; text-align: center; }

        .ca-eyebrow { display: inline-flex; align-items: center; gap: 9px; margin: 0 0 clamp(18px, 3vw, 26px); padding: 8px 16px 8px 14px; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; font-weight: 500; color: #f1d9a3; background: rgba(255,255,255,.1); border: 1px solid rgba(240,217,163,.4); border-radius: 999px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .ca-eyebrow svg { color: #e0bb74; }

        .ca-title { font-family: var(--serif); font-weight: 500; font-size: clamp(38px, 8vw, 104px); line-height: 1.03; letter-spacing: -0.025em; color: #fff; margin: 0 0 clamp(18px, 3vw, 26px); text-shadow: 0 4px 40px rgba(0,0,0,.45); text-wrap: balance; }
        .ca-line { display: block; overflow: hidden; padding: .06em .12em .18em; margin: -.06em -.12em -.18em; }
        .ca-line > span { display: inline-block; }
        .ca-title-accent { font-style: italic; font-weight: 400; background: linear-gradient(100deg, #f8e6b8 0%, #e0bb74 45%, #c9a35a 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; text-shadow: none; filter: drop-shadow(0 4px 24px rgba(0,0,0,.35)); padding-right: .08em; }

        .ca-lead { font-size: clamp(15.5px, 1.4vw, 17.5px); line-height: 1.75; max-width: 620px; margin: 0 auto; color: #fbf1da; text-shadow: 0 1px 18px rgba(0,0,0,.55); text-wrap: pretty; }
        .ca-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; margin-top: clamp(24px, 4vw, 34px); width: 100%; max-width: 480px; }
        .ca-actions .ca-btn { flex: 1 1 180px; }

        .ca-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; background: var(--ink); color: var(--paper); border: 1px solid var(--ink); padding: 12px 22px; border-radius: 999px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; transition: background .2s, border-color .2s, transform .15s, box-shadow .2s, color .2s; box-shadow: 0 4px 12px -4px rgba(28,23,18,.5); white-space: nowrap; }
        .ca-btn:hover:not(:disabled) { background: var(--wine); border-color: var(--wine); box-shadow: 0 8px 18px -6px rgba(92,43,48,.6); }
        .ca-btn:active:not(:disabled) { transform: scale(.97); }
        .ca-btn svg { transition: transform .2s; flex-shrink: 0; }
        .ca-btn:hover:not(:disabled) svg { transform: translate(2px, -2px); }
        .ca-btn.is-ghost { background: transparent; color: var(--ink); border-color: var(--line); box-shadow: none; }
        .ca-btn.is-ghost:hover:not(:disabled) { background: var(--paper-2); border-color: var(--brass); color: var(--ink); box-shadow: none; }
        .ca-btn.is-block { width: 100%; margin-top: 16px; padding: 10px 14px; font-size: 13px; }
        .ca-btn.is-lg { padding: 14px 32px; font-size: 14.5px; align-self: flex-start; min-width: 180px; }
        .ca-btn.is-ready { animation: ca-ready 1.8s ease-in-out infinite; }
        @keyframes ca-ready { 0%, 100% { box-shadow: 0 4px 12px -4px rgba(28,23,18,.5), 0 0 0 0 rgba(150,112,47,.5); } 50% { box-shadow: 0 4px 12px -4px rgba(28,23,18,.5), 0 0 0 9px rgba(150,112,47,0); } }
        .ca-btn:disabled { opacity: .75; cursor: progress; }
        .ca-spin { animation: ca-spin .8s linear infinite; }
        @keyframes ca-spin { to { transform: rotate(360deg); } }

        .ca-hero .ca-btn { position: relative; overflow: hidden; padding: 15px 30px; font-size: 14.5px; color: #fff; background: linear-gradient(135deg, #b88a3e, #96702f 55%, #7a5a22); border-color: rgba(255,255,255,.2); box-shadow: 0 12px 30px -8px rgba(150,112,47,.85), inset 0 1px 0 rgba(255,255,255,.28); }
        .ca-hero .ca-btn:hover:not(:disabled) { background: linear-gradient(135deg, #c9984a, #a67b36 55%, #86632a); border-color: rgba(255,255,255,.35); transform: translateY(-2px); }
        .ca-hero .ca-btn:not(.is-ghost)::after { content: ""; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.38) 50%, transparent 70%); transform: translateX(-120%); animation: ca-sheen 3.8s ease-in-out infinite 1.6s; pointer-events: none; }
        @keyframes ca-sheen { 0% { transform: translateX(-120%); } 40%, 100% { transform: translateX(120%); } }
        .ca-hero .ca-btn.is-ghost { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.55); color: #fff; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: none; }
        .ca-hero .ca-btn.is-ghost:hover:not(:disabled) { background: #fff; border-color: #fff; color: var(--wine); }

        .ca-trust { display: inline-flex; flex-wrap: wrap; justify-content: center; margin-top: clamp(28px, 5vw, 44px); padding: 6px; font-size: 13px; border-radius: 999px; background: rgba(20,12,6,.38); border: 1px solid rgba(255,255,255,.15); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .ca-trust span { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; color: #f6ead0; }
        .ca-trust span + span { border-left: 1px solid rgba(255,255,255,.16); }
        .ca-trust svg { color: #e0bb74; flex-shrink: 0; }

        .ca-scroll { position: absolute; left: 50%; bottom: 26px; z-index: 4; width: 40px; height: 40px; margin-left: -20px; border-radius: 50%; display: grid; place-items: center; color: #f1d9a3; border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.08); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); animation: ca-bob 2.2s ease-in-out infinite; transition: background .2s, color .2s; }
        .ca-scroll:hover { background: #fff; color: var(--wine); }
        @keyframes ca-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

        .ca-section { padding: var(--sec-y) 0; scroll-margin-top: 70px; }
        .ca-section.is-white { background: var(--card); border-block: 1px solid var(--line); background-image: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,163,90,.07), transparent 70%); }

        .ca-head { text-align: center; display: flex; flex-direction: column; align-items: center; }
        .ca-h2 { font-family: var(--serif); font-weight: 500; font-size: clamp(26px, 4.4vw, 40px); color: var(--ink); margin: 0; letter-spacing: -0.01em; line-height: 1.16; text-wrap: balance; }
        .ca-shine { background: linear-gradient(110deg, var(--brass-deep) 0%, var(--brass-deep) 42%, #e0bb74 50%, var(--brass-deep) 58%, var(--brass-deep) 100%); background-size: 250% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; animation: ca-shine 4s ease-in-out infinite; }
        @keyframes ca-shine { 0% { background-position: 100% 0; } 60%, 100% { background-position: 0% 0; } }
        .ca-orn { display: inline-flex; align-items: center; gap: 10px; margin: 16px 0 0; color: var(--brass); }
        .ca-orn i { display: block; width: clamp(30px, 6vw, 52px); height: 1px; background: linear-gradient(90deg, transparent, var(--brass)); }
        .ca-orn i:last-child { background: linear-gradient(270deg, transparent, var(--brass)); }
        .ca-sub { text-align: center; font-size: clamp(14px, 1.3vw, 15.5px); max-width: 540px; margin: 12px auto 0; line-height: 1.65; }

        .ca-rv { height: 100%; }
        .ca-rv > .ca-step, .ca-rv > .ca-artist { height: 100%; }

        .ca-steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px 44px; margin-top: clamp(30px, 5vw, 48px); }
        .ca-step-arrow { position: absolute; top: 47px; right: -44px; width: 44px; height: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .ca-step-arrow::before { content: ""; position: absolute; left: 0; right: 0; top: 0; border-top: 1.5px dashed #cdbb97; }
        .ca-step-chip { position: relative; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--card); border: 1px solid var(--line); color: var(--brass-deep); box-shadow: var(--shadow-sm); transition: background .25s, color .25s, border-color .25s, transform .3s cubic-bezier(.16,1,.3,1); }
        .ca-step:hover .ca-step-chip { background: var(--brass-deep); border-color: var(--brass-deep); color: #fff; transform: translateX(3px); }
        .ca-step { position: relative; background: var(--paper); border: 1px solid var(--line); border-radius: 18px; padding: clamp(20px, 2.4vw, 24px); box-shadow: var(--shadow-sm); transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s, border-color .25s; display: flex; flex-direction: column; }
        .ca-step:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); border-color: #cdbb97; }
        .ca-step-top { display: flex; align-items: center; justify-content: space-between; }
        .ca-step-icon { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: var(--paper-2); color: var(--brass-deep); border: 1px solid var(--line); flex-shrink: 0; }
        .ca-step-num { font-family: var(--serif); font-size: 30px; color: #d6c8a8; line-height: 1; }
        .ca-step h3 { font-family: var(--serif); font-weight: 500; font-size: 20px; color: var(--ink); margin: 18px 0 6px; }
        .ca-step p { font-size: 14px; line-height: 1.65; margin: 0; text-wrap: pretty; }

        .ca-form-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 340px); gap: clamp(20px, 3vw, 32px); align-items: start; }
        .ca-card { position: relative; background: var(--card); border: 1px solid var(--line); border-radius: 22px; padding: var(--pad); box-shadow: var(--shadow-sm); }
        .ca-card-glow { position: absolute; inset: -1px; border-radius: 23px; padding: 1px; pointer-events: none; opacity: 0; transition: opacity .5s;
          background: linear-gradient(135deg, rgba(201,163,90,.55), transparent 45%, transparent 60%, rgba(92,43,48,.4));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
        .ca-card:focus-within .ca-card-glow { opacity: 1; }
        .ca-form { display: flex; flex-direction: column; gap: clamp(20px, 2.6vw, 26px); }
        .ca-form-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; flex-wrap: wrap; }
        .ca-form-head h2, .ca-done h2 { font-family: var(--serif); font-weight: 500; font-size: clamp(23px, 3.2vw, 29px); color: var(--ink); margin: 0; line-height: 1.2; }
        .ca-form-head p { margin: 6px 0 0; font-size: 14px; line-height: 1.55; max-width: 46ch; }

        .ca-auth-banner { display: flex; align-items: center; gap: 10px; padding: 11px 16px; border-radius: 12px; background: #fffbf0; border: 1px solid #ebd9b5; color: var(--brass-deep); font-size: 13.5px; }
        .ca-auth-banner a { font-weight: 600; text-decoration: underline; color: var(--wine); }
        .ca-api-error { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 16px; border-radius: 12px; background: #fdf2f0; border: 1px solid #f3c2bc; color: var(--danger); font-size: 13.5px; }
        .ca-api-error button { background: none; border: none; cursor: pointer; color: var(--danger); padding: 2px; display: grid; place-items: center; }

        .ca-progress { position: relative; width: 56px; height: 56px; flex-shrink: 0; display: grid; place-items: center; }
        .ca-progress svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
        .ca-progress circle { fill: none; stroke-width: 3.2; stroke-linecap: round; }
        .ca-progress-bg { stroke: var(--line); }
        .ca-progress-fg { stroke: var(--brass-deep); }
        .ca-progress-txt { display: flex; flex-direction: column; align-items: center; line-height: 1; }
        .ca-progress-txt strong { font-size: 12.5px; color: var(--ink); font-weight: 600; }
        .ca-progress-txt small { font-size: 9.5px; color: var(--muted); margin-top: 2px; letter-spacing: .04em; }

        .ca-rail-wrap { margin-top: 2px; }
        .ca-rail { position: relative; display: flex; list-style: none; margin: 0; padding: 0; }
        .ca-rail-line { position: absolute; top: 17px; left: 10%; right: 10%; height: 2px; background: var(--line); border-radius: 2px; overflow: hidden; }
        .ca-rail-line span { display: block; height: 100%; background: linear-gradient(90deg, var(--brass), var(--brass-deep)); box-shadow: 0 0 10px rgba(150,112,47,.6); }
        .ca-node { position: relative; z-index: 1; flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .ca-node em { font-style: normal; font-size: 11.5px; color: var(--muted); font-weight: 500; transition: color .2s; white-space: nowrap; }
        .ca-node-dot { position: relative; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--card); border: 1.5px solid var(--line); color: var(--muted); transition: background .3s, border-color .3s, color .3s, box-shadow .3s; }
        .ca-node-ring { position: absolute; inset: -1px; border-radius: 50%; border: 2px solid var(--brass); pointer-events: none; }
        .ca-node.is-active .ca-node-dot { border-color: var(--brass); color: var(--brass-deep); animation: ca-node 2s ease-in-out infinite; }
        .ca-node.is-active em { color: var(--brass-deep); }
        .ca-node.is-done .ca-node-dot { background: var(--ink); border-color: var(--ink); color: var(--paper); }
        .ca-node.is-done em { color: var(--ink); }
        @keyframes ca-node { 0%, 100% { box-shadow: 0 0 0 3px rgba(150,112,47,.12); } 50% { box-shadow: 0 0 0 7px rgba(150,112,47,.2); } }
        .ca-toast { margin-top: 14px; min-height: 30px; display: flex; justify-content: center; }
        .ca-toast span { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 500; color: var(--brass-deep); background: var(--paper-2); border: 1px solid var(--line); padding: 6px 14px; border-radius: 999px; text-align: center; }
        .ca-toast svg { color: var(--brass); flex-shrink: 0; }

        .ca-sec { display: flex; flex-direction: column; gap: 18px; transition: opacity .45s; }
        .ca-sec + .ca-sec { border-top: 1px dashed var(--line); padding-top: 24px; }
        .ca-sec.is-later { opacity: .6; }
        .ca-sec.is-later:hover, .ca-sec:focus-within { opacity: 1; }
        .ca-stage { display: flex; align-items: flex-start; gap: 12px; }
        .ca-stage-txt { min-width: 0; }
        .ca-stage h3 { font-family: var(--serif); font-weight: 500; font-size: 18px; color: var(--ink); margin: 0; line-height: 1.3; }
        .ca-stage p { margin: 2px 0 0; font-size: 12.5px; color: var(--muted); line-height: 1.5; }
        .ca-stage-n { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; font-size: 12.5px; font-weight: 600; background: var(--paper-2); border: 1px solid var(--line); color: var(--brass-deep); transition: background .3s, color .3s, border-color .3s; margin-top: 1px; }
        .ca-sec.is-active .ca-stage-n { background: var(--brass-deep); border-color: var(--brass-deep); color: #fff; }
        .ca-sec.is-done .ca-stage-n { background: var(--ok); border-color: var(--ok); color: #fff; }
        .ca-sec-body { display: flex; flex-direction: column; gap: 18px; }

        .ca-row { display: grid; gap: 18px; }
        .ca-row.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .ca-field { display: flex; flex-direction: column; min-width: 0; }
        .ca-ctl { position: relative; display: flex; flex-direction: column; }
        .ca-label { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: var(--ink-soft); margin-bottom: 7px; transition: color .2s; }
        .ca-label-text { display: inline-flex; align-items: baseline; gap: 4px; }
        .ca-label em { font-style: normal; font-weight: 400; color: var(--muted); }
        .ca-ok { display: inline-grid; place-items: center; width: 15px; height: 15px; border-radius: 50%; background: var(--ok); color: #fff; flex-shrink: 0; }
        .ca-field:focus-within > .ca-label { color: var(--brass-deep); }
        .ca-input { width: 100%; height: var(--h); border-radius: 12px; border: 1px solid var(--line); background: #fff; padding: 0 14px; font-size: 14.5px; color: var(--ink); outline: none; transition: border-color .2s, box-shadow .25s, background .2s; }
        .ca-input::placeholder { color: #a99d86; }
        .ca-input:hover { border-color: #cdbb97; }
        .ca-input:focus { border-color: var(--brass); box-shadow: 0 0 0 4px rgba(150,112,47,.14); }
        .ca-field.has-error .ca-input, .ca-field.has-error .ca-chips { border-color: var(--danger); }
        .ca-field.has-error .ca-input:focus { box-shadow: 0 0 0 4px rgba(166,58,43,.14); }
        .ca-textarea { height: auto; padding: 13px 14px; line-height: 1.6; resize: none; min-height: 132px; }
        .ca-textarea.is-short { min-height: 74px; }
        .ca-error { font-size: 12.5px; color: var(--danger); overflow: hidden; padding-top: 6px; }
        .ca-count { align-self: flex-end; display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--muted); margin-top: 6px; transition: color .2s; }
        .ca-count.is-ok { color: var(--ok); }
        .ca-select { position: relative; }
        .ca-select select { appearance: none; -webkit-appearance: none; padding-right: 38px; cursor: pointer; }
        .ca-select svg { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }

        .ca-fx { position: absolute; inset: 0; pointer-events: none; z-index: 3; overflow: visible; }
        .ca-fx-ink { position: absolute; left: 10px; bottom: -7px; width: calc(100% - 20px); height: 12px; overflow: visible; }
        .ca-fx-plane { position: absolute; top: 50%; margin-top: -9px; color: var(--brass-deep); }
        .ca-fx-ring { position: absolute; right: 16px; top: 50%; margin-top: -5px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--brass); }
        .ca-fx-ring.is-wine { right: auto; left: 50%; top: 50%; margin: -5px 0 0 -5px; border-color: var(--wine); }
        .ca-fx-spot { position: absolute; inset: -8px; border-radius: 18px; background: radial-gradient(circle, rgba(224,187,116,.6), transparent 68%); }
        .ca-fx-corner { position: absolute; width: 14px; height: 14px; border: 0 solid var(--brass); }
        .ca-fx-corner.is-tl { top: -5px; left: -5px; border-top-width: 2.5px; border-left-width: 2.5px; }
        .ca-fx-corner.is-tr { top: -5px; right: -5px; border-top-width: 2.5px; border-right-width: 2.5px; }
        .ca-fx-corner.is-bl { bottom: -5px; left: -5px; border-bottom-width: 2.5px; border-left-width: 2.5px; }
        .ca-fx-corner.is-br { bottom: -5px; right: -5px; border-bottom-width: 2.5px; border-right-width: 2.5px; }
        .ca-fx-dot { position: absolute; right: 42px; top: calc(var(--h) / 2 - 6px); width: 12px; height: 12px; border-radius: 50%; }
        .ca-fx-coin { position: absolute; left: 50%; top: 2px; font-family: var(--serif); font-size: 21px; font-weight: 600; color: var(--brass); }
        .ca-fx-ticks { position: absolute; left: 14px; right: 14px; top: calc(var(--h) - 9px); height: 7px; display: flex; justify-content: space-between; align-items: flex-end; }
        .ca-fx-tick { width: 3px; height: 7px; border-radius: 2px; background: var(--brass); }
        .ca-fx-stroke { position: absolute; left: 10px; right: 10px; bottom: 34px; height: 8px; border-radius: 99px; background: linear-gradient(90deg, transparent, #e0bb74 12%, var(--brass) 60%, var(--wine)); }
        .ca-fx-marker { position: absolute; left: 12px; top: 12px; height: 22px; width: 62%; border-radius: 3px; background: rgba(224,187,116,.55); mix-blend-mode: multiply; }
        .ca-fx-spark { position: absolute; left: 50%; top: 50%; width: 6px; height: 6px; margin: -3px; border-radius: 50%; }
        .ca-fx-wax { position: absolute; inset: -2px; border-radius: 50%; background: var(--wine); }

        .ca-chips { display: flex; flex-wrap: wrap; gap: 8px; outline: none; border-radius: 12px; }
        .ca-chip { position: relative; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line); background: #fff; padding: 9px 16px; border-radius: 999px; font-size: 13px; cursor: pointer; color: var(--ink-soft); transition: background .2s, color .2s, border-color .2s, box-shadow .2s, transform .2s; }
        .ca-chip:hover { border-color: var(--brass); color: var(--ink); transform: translateY(-1px); }
        .ca-chip.is-active { background: linear-gradient(135deg, #2a231c, var(--ink) 60%); color: var(--paper); border-color: var(--ink); box-shadow: 0 6px 16px -6px rgba(28,23,18,.6); }
        .ca-chip.is-active:hover { color: var(--paper); }

        .ca-uploads { display: flex; flex-wrap: wrap; gap: 12px; }
        .ca-thumb { position: relative; width: clamp(72px, 18vw, 84px); aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 4px solid #fff; outline: 1px solid var(--line); box-shadow: var(--shadow-md); }
        .ca-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ca-flash { position: absolute; inset: 0; background: #fff; pointer-events: none; }
        .ca-thumb button { position: absolute; top: 3px; right: 3px; width: 22px; height: 22px; border-radius: 50%; border: none; background: rgba(28,23,18,.7); color: #fff; display: grid; place-items: center; cursor: pointer; transition: background .15s; }
        .ca-thumb button:hover { background: var(--wine); }
        .ca-drop { width: clamp(72px, 18vw, 84px); aspect-ratio: 1; border-radius: 14px; border: 1.5px dashed #cdbb97; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; font-size: 11px; color: var(--muted); cursor: pointer; text-align: center; transition: border-color .2s, color .2s, background .2s, transform .2s; }
        .ca-drop:hover, .ca-drop:focus-within { border-color: var(--brass); color: var(--brass-deep); background: var(--paper-2); }
        .ca-drop.is-drag { border-color: var(--brass-deep); background: var(--paper-2); color: var(--brass-deep); transform: scale(1.05); }

        .ca-agree { position: relative; display: flex; align-items: flex-start; gap: 11px; font-size: 13.5px; line-height: 1.55; cursor: pointer; }
        .ca-agree a { color: var(--brass-deep); text-decoration: underline; text-underline-offset: 2px; }
        .ca-agree-text { background: linear-gradient(transparent 64%, rgba(201,163,90,.32) 64%) no-repeat; background-size: 0% 100%; transition: background-size .8s cubic-bezier(.16,1,.3,1); }
        .ca-agree-text.is-on { background-size: 100% 100%; }
        .ca-checkbox { position: relative; width: 19px; height: 19px; border-radius: 6px; border: 1.5px solid #b7a682; background: #fff; display: grid; place-items: center; flex-shrink: 0; margin-top: 1px; color: #fff; transition: background .15s, border-color .15s, box-shadow .2s; }
        .ca-checkbox.is-checked { background: var(--brass-deep); border-color: var(--brass-deep); }
        .ca-checkbox svg { width: 11px; height: 9px; }
        .ca-agree:has(:focus-visible) .ca-checkbox { box-shadow: 0 0 0 3px rgba(150,112,47,.3); }
        .ca-field.has-error .ca-checkbox { border-color: var(--danger); }
        .ca-fine { margin: 0; font-size: 12.5px; color: var(--muted); line-height: 1.6; }

        .ca-seal { position: relative; min-height: clamp(340px, 58vh, 480px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding-bottom: 60px; }
        .ca-seal-svg { width: min(100%, 400px); height: auto; overflow: visible; }
        .ca-seal-caps { position: absolute; left: 0; right: 0; bottom: 22px; height: 28px; display: grid; place-items: center; }
        .ca-seal-cap { position: absolute; margin: 0; text-align: center; font-family: var(--serif); font-size: clamp(16px, 3vw, 19px); color: var(--ink); white-space: nowrap; }
        .ca-seal-cap.is-static { position: static; margin-top: 12px; font-size: 16px; }

        .ca-done { text-align: center; padding: 4px 0; }
        .ca-done-badge { display: inline-grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: var(--ok); color: #fff; margin-bottom: 16px; box-shadow: 0 10px 24px -10px rgba(76,107,63,.8); }
        .ca-done p { max-width: 460px; margin: 10px auto 0; font-size: 14.5px; line-height: 1.65; text-wrap: pretty; }
        .ca-done strong { color: var(--ink); word-break: break-word; }
        .ca-ticket { position: relative; width: 100%; max-width: 390px; margin: 26px auto 0; text-align: left; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 18px 22px 22px; box-shadow: var(--shadow-md); }
        .ca-ticket-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 11.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
        .ca-pill { display: inline-flex; align-items: center; gap: 6px; background: #F6E7D0; color: #8A5A22; letter-spacing: 0; text-transform: none; font-size: 12px; padding: 3px 10px; border-radius: 999px; }
        .ca-pill i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: ca-blink 1.4s ease-in-out infinite; }
        @keyframes ca-blink { 50% { opacity: .25; } }
        .ca-flap { display: flex; justify-content: center; gap: clamp(3px, 1vw, 5px); margin: 16px 0 0; perspective: 400px; }
        .ca-flap span { display: grid; place-items: center; width: clamp(26px, 8vw, 34px); height: clamp(36px, 11vw, 46px); border-radius: 6px; background: linear-gradient(#2a231c 49.5%, #14100c 50%); color: #f3e8cf; font-family: var(--serif); font-size: clamp(19px, 6vw, 26px); font-weight: 600; }
        .ca-flap span.is-dash { width: clamp(10px, 3vw, 16px); background: none; color: var(--muted); }
        .ca-ticket-div { position: relative; height: 0; border-top: 1.5px dashed #cdbb97; margin: 18px -22px; }
        .ca-ticket-div::before, .ca-ticket-div::after { content: ""; position: absolute; top: -10px; width: 18px; height: 18px; border-radius: 50%; background: var(--card); border: 1px solid var(--line); }
        .ca-ticket-div::before { left: -10px; }
        .ca-ticket-div::after { right: -10px; }
        .ca-ticket dl { margin: 0; display: grid; gap: 9px; }
        .ca-ticket dl div { display: flex; justify-content: space-between; gap: 16px; font-size: 13px; }
        .ca-ticket dt { color: var(--muted); flex-shrink: 0; }
        .ca-ticket dd { margin: 0; color: var(--ink); font-weight: 500; text-align: right; min-width: 0; overflow-wrap: anywhere; }
        .ca-stamp { position: absolute; right: 14px; bottom: 52px; border: 2.5px solid var(--ok); color: var(--ok); padding: 3px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; background: rgba(251,248,241,.7); }
        .ca-track { list-style: none; margin: 28px auto 0; padding: 0; max-width: 390px; text-align: left; display: flex; flex-direction: column; gap: 14px; }
        .ca-track li { display: flex; gap: 12px; align-items: flex-start; }
        .ca-track-dot { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; border: 1.5px solid var(--line); background: #fff; color: #fff; margin-top: 1px; }
        .ca-track li.is-done .ca-track-dot { background: var(--ok); border-color: var(--ok); }
        .ca-track li.is-now .ca-track-dot { border-color: var(--brass); animation: ca-node 2s ease-in-out infinite; }
        .ca-track strong { display: block; font-size: 14px; color: var(--ink); }
        .ca-track small { display: block; font-size: 12.5px; color: var(--muted); margin-top: 1px; }
        .ca-track li.is-next strong { color: var(--muted); font-weight: 500; }
        .ca-done-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 28px; }
        .ca-done-actions .ca-btn { flex: 0 1 auto; }

        .ca-aside { position: sticky; top: 90px; display: flex; flex-direction: column; gap: 16px; }
        .ca-panel { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: clamp(18px, 2.2vw, 24px); box-shadow: var(--shadow-sm); transition: box-shadow .3s, border-color .3s; }
        .ca-panel:hover { box-shadow: var(--shadow-md); border-color: #d6c8a8; }
        .ca-panel h3 { font-family: var(--serif); font-weight: 500; font-size: 20px; color: var(--ink); margin: 0 0 16px; }
        .ca-panel ol { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; font-size: 14px; line-height: 1.55; }
        .ca-panel li { display: flex; gap: 12px; }
        .ca-panel li span { width: 26px; height: 26px; border-radius: 50%; background: var(--paper-2); border: 1px solid var(--line); color: var(--brass-deep); font-size: 12px; font-weight: 600; display: grid; place-items: center; flex-shrink: 0; }
        .ca-panel.is-tint { background: var(--paper-2); }
        .ca-panel.is-tint svg { color: var(--brass-deep); }
        .ca-panel.is-tint strong { display: block; margin-top: 8px; color: var(--ink); font-size: 14.5px; }
        .ca-panel.is-tint p { margin: 4px 0 0; font-size: 13px; line-height: 1.6; }

        .ca-canvas-panel { padding: 18px 18px 16px; text-align: center; }
        .ca-canvas-panel h3 { margin-bottom: 8px; font-size: 18px; }
        .ca-canvas-stage { display: grid; place-items: center; }
        .ca-canvas-panel svg { width: 100%; max-height: 300px; display: block; }
        .ca-canvas-cap { margin: 4px 0 0; font-size: 12.5px; color: var(--brass-deep); font-weight: 500; }

        .ca-artists { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: clamp(16px, 2.4vw, 22px); margin: clamp(30px, 5vw, 48px) auto 0; max-width: 1040px; }
        .ca-artist { background: var(--paper); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow-sm); transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s, border-color .25s; display: flex; flex-direction: column; }
        .ca-artist:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); border-color: #cdbb97; }
        .ca-artist-media { position: relative; height: clamp(180px, 26vw, 210px); overflow: hidden; }
        .ca-artist-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(28,23,18,.55)); opacity: .75; transition: opacity .35s; }
        .ca-artist:hover .ca-artist-media::after { opacity: .95; }
        .ca-artist-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .7s cubic-bezier(.16,1,.3,1); }
        .ca-artist:hover .ca-artist-media img { transform: scale(1.06); }
        .ca-artist-tag { position: absolute; left: 12px; bottom: 12px; z-index: 1; font-size: 11px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: #f6ead0; background: rgba(28,23,18,.5); border: 1px solid rgba(255,255,255,.22); border-radius: 999px; padding: 4px 10px; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
        .ca-artist-body { padding: 18px 20px 20px; display: flex; flex-direction: column; flex: 1; }
        .ca-artist-body h3 { font-family: var(--serif); font-weight: 500; font-size: 19px; color: var(--ink); margin: 0; }
        .ca-artist-body p { font-size: 12.5px; margin: 3px 0 0; }
        .ca-artist-body > span { display: block; margin-top: 10px; font-size: 13px; font-weight: 500; color: var(--brass-deep); }
        .ca-artist-body .ca-btn { margin-top: auto; }

        .ca-faq { margin-top: clamp(28px, 4vw, 40px); background: var(--card); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow-sm); }
        .ca-faq-item + .ca-faq-item { border-top: 1px solid var(--line); }
        .ca-faq-item button { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: clamp(16px, 2.4vw, 20px) clamp(18px, 2.6vw, 24px); background: none; border: none; text-align: left; font-size: clamp(14.5px, 1.5vw, 15.5px); font-weight: 500; color: var(--ink); cursor: pointer; transition: background .2s, color .2s; }
        .ca-faq-item button:hover { background: var(--paper); }
        .ca-faq-q { display: inline-flex; align-items: baseline; gap: 12px; min-width: 0; }
        .ca-faq-q em { font-style: normal; font-family: var(--serif); font-size: 12.5px; color: var(--brass); flex-shrink: 0; }
        .ca-faq-item button svg { color: var(--brass); flex-shrink: 0; transition: transform .3s cubic-bezier(.16,1,.3,1); }
        .ca-faq-item.is-open button { color: var(--brass-deep); }
        .ca-faq-item.is-open button svg { transform: rotate(180deg); }
        .ca-faq-item p { margin: 0; padding: 0 clamp(18px, 2.6vw, 24px) 22px; font-size: 14.5px; line-height: 1.7; max-width: 72ch; }
        .ca-faq-foot { text-align: center; margin: 22px 0 0; font-size: 14px; }
        .ca-faq-foot a { color: var(--brass-deep); text-decoration: underline; text-underline-offset: 2px; }

        @media (max-width: 1180px) {
          .ca-form-grid { grid-template-columns: minmax(0, 1fr) minmax(260px, 300px); }
        }
        @media (max-width: 1024px) {
          .ca-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .ca-rv:nth-child(even) .ca-step-arrow { display: none; }
        }
        @media (max-width: 980px) {
          .ca-form-grid { grid-template-columns: minmax(0, 1fr); }
          .ca-aside { position: static; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: start; }
          .ca-canvas-panel { grid-column: 1 / -1; }
          .ca-canvas-panel svg { max-height: 340px; }
        }
        @media (max-width: 720px) {
          .ca-title { letter-spacing: -0.02em; }
          .ca-actions { max-width: 100%; }
          .ca-trust { flex-direction: column; border-radius: 22px; padding: 4px 6px; width: 100%; max-width: 340px; }
          .ca-trust span { padding: 10px 14px; justify-content: center; }
          .ca-trust span + span { border-left: none; border-top: 1px solid rgba(255,255,255,.14); }
          .ca-scroll { display: none; }
          .ca-progress { width: 48px; height: 48px; }
          .ca-progress-txt strong { font-size: 11.5px; }
          .ca-progress-txt small { font-size: 9px; }
        }
        @media (max-width: 640px) {
          .ca-steps { grid-template-columns: minmax(0, 1fr); gap: 44px; }
          .ca-rv:nth-child(even) .ca-step-arrow { display: flex; }
          .ca-step-arrow { top: auto; bottom: -44px; right: auto; left: 50%; width: 0; height: 44px; flex-direction: column; margin-left: -14px; }
          .ca-step-arrow::before { left: 50%; right: auto; top: 0; bottom: 0; border-top: none; border-left: 1.5px dashed #cdbb97; }
          .ca-step-chip svg { transform: rotate(90deg); }
          .ca-step:hover .ca-step-chip { transform: translateY(3px); }
          .ca-rv:last-child .ca-step-arrow { display: none; }

          .ca-row.two { grid-template-columns: minmax(0, 1fr); }
          .ca-aside { grid-template-columns: minmax(0, 1fr); }
          .ca-canvas-panel { display: none; }
          .ca-btn.is-lg { width: 100%; align-self: stretch; }
          .ca-done-actions .ca-btn { flex: 1 1 100%; }
          .ca-node em { display: none; }
          .ca-node.is-active em { display: block; position: absolute; top: 42px; white-space: nowrap; }
          .ca-rail { margin-bottom: 20px; }
          .ca-stamp { bottom: 46px; font-size: 11px; padding: 2px 9px; letter-spacing: .15em; }
          .ca-ticket { padding: 16px 16px 20px; }
          .ca-ticket-div { margin: 16px -16px; }
          .ca-faq-q em { display: none; }
        }
        @media (max-width: 400px) {
          .ca-eyebrow { font-size: 10.5px; letter-spacing: .14em; padding: 7px 12px; }
          .ca-chip { padding: 8px 12px; font-size: 12.5px; }
          .ca-stage p { display: none; }
          .ca-rail-line { top: 15px; }
          .ca-node-dot { width: 32px; height: 32px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ca-app * { transition: none !important; animation: none !important; }
          .ca-hero-glow, .ca-hero-grain { display: none; }
        }
      `}</style>
    </div>
  );
}