import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ArrowUp,
  MessageCircle,
  Palette,
  HelpCircle,
  Loader2,
  User,
  AtSign,
  Tag,
} from "lucide-react";

const INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@artnest.com",
    href: "mailto:hello@artnest.com",
    color: "#c2603a",
    soft: "#fbeee7",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    color: "#3f8a68",
    soft: "#e9f4ee",
  },
  {
    icon: MapPin,
    label: "Studio",
    value: "Pune, Maharashtra, India",
    color: "#4a5fc0",
    soft: "#ebeefc",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Sat, 10:00 – 18:00 IST",
    color: "#d99b2b",
    soft: "#fdf3de",
  },
];

const TOPICS = [
  { value: "General question", icon: MessageCircle },
  { value: "Order or shipping", icon: Tag },
  { value: "Selling as an artist", icon: Palette },
  { value: "Custom art request", icon: Sparkles },
  { value: "Report a problem", icon: HelpCircle },
];

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Most originals are packed in archival material and dispatched within 3–5 working days. Delivery time depends on your location.",
  },
  {
    q: "Can I commission a custom piece?",
    a: "Yes. Use the Custom Art page to describe what you want and the artist will reply with a quote and timeline.",
  },
  {
    q: "How do I become a seller?",
    a: "Register as an artist, share your portfolio, and our team reviews it. You'll hear back within a few days.",
  },
  {
    q: "What if my artwork arrives damaged?",
    a: "Write to us within 48 hours with photos of the damage and your order number, and we'll sort it out.",
  },
];

const EMPTY = { name: "", email: "", topic: TOPICS[0].value, message: "" };

const validate = (v) => {
  const e = {};
  if (!v.name.trim()) e.name = "Please enter your name.";
  if (!v.email.trim()) e.email = "Please enter your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    e.email = "Enter a valid email address.";
  if (v.message.trim().length < 10)
    e.message = "Message should be at least 10 characters.";
  return e;
};

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E";

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');

      @keyframes floaty {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-10px); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% 50%; }
        100% { background-position: 200% 50%; }
      }
      @keyframes ringPulse {
        0%   { transform: scale(.85); opacity: .8; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      @keyframes gradientShift {
        0%,100% { background-position: 0% 50%; }
        50%     { background-position: 100% 50%; }
      }

      .floaty { animation: floaty 6s ease-in-out infinite; }

      .text-gradient {
        background: linear-gradient(100deg, #c2603a 0%, #d9a441 45%, #6d5bd0 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: shimmer 8s linear infinite;
      }

      .animated-gradient {
        background-size: 200% 200%;
        animation: gradientShift 12s ease infinite;
      }

      .grain-overlay {
        background-image: url("${GRAIN}");
        background-repeat: repeat;
      }

      .no-bar::-webkit-scrollbar { display: none; }
      .no-bar { -ms-overflow-style: none; scrollbar-width: none; }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: .001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .001ms !important;
        }
      }
    `}</style>
  );
}

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(194,96,58,.45), transparent 68%)",
        }}
        animate={{ x: [0, 70, -30, 0], y: [0, 45, -25, 0], scale: [1, 1.12, 0.94, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-28 top-4 h-[30rem] w-[30rem] rounded-full blur-[115px]"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(217,164,65,.42), transparent 70%)",
        }}
        animate={{ x: [0, -70, 40, 0], y: [0, 55, -35, 0], scale: [1, 1.18, 0.9, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-44 h-[28rem] w-[28rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(109,91,208,.32), transparent 70%)",
        }}
        animate={{ x: [0, 45, -45, 0], y: [0, -45, 35, 0], scale: [1, 1.1, 1.05, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Field({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  error,
  icon: Icon,
  autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const floating = focused || hasValue;

  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: error ? [1, 1.015, 1] : 1,
        }}
        transition={{ duration: 0.35 }}
        className={`relative rounded-2xl border bg-white/80 backdrop-blur transition-all duration-300 ${
          error
            ? "border-red-400 shadow-[0_0_0_4px_rgba(248,113,113,.12)]"
            : focused
            ? "border-[#c2603a] shadow-[0_0_0_4px_rgba(194,96,58,.12)]"
            : "border-stone-300"
        }`}
      >
        {Icon && (
          <span
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
              focused ? "text-[#c2603a]" : error ? "text-red-400" : "text-stone-400"
            }`}
          >
            <Icon size={16} />
          </span>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          placeholder=" "
          className={`peer w-full bg-transparent px-4 pb-2.5 pt-6 text-[14.5px] text-stone-800 outline-none ${
            Icon ? "pl-11" : ""
          }`}
        />

        <label
          htmlFor={id}
          className={`pointer-events-none absolute origin-left transition-all duration-300 ${
            Icon ? "left-11" : "left-4"
          } ${
            floating
              ? "top-2 text-[11px] font-semibold uppercase tracking-[0.1em]"
              : "top-1/2 -translate-y-1/2 text-[14px]"
          } ${
            error
              ? "text-red-500"
              : focused
              ? "text-[#c2603a]"
              : "text-stone-500"
          }`}
        >
          {label}
        </label>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="mt-1.5 ml-1 text-[12px] font-medium text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextArea({ id, name, label, value, onChange, error, maxLength = 500 }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const floating = focused || hasValue;
  const remaining = maxLength - value.length;

  return (
    <div className="relative">
      <div
        className={`relative rounded-2xl border bg-white/80 backdrop-blur transition-all duration-300 ${
          error
            ? "border-red-400 shadow-[0_0_0_4px_rgba(248,113,113,.12)]"
            : focused
            ? "border-[#c2603a] shadow-[0_0_0_4px_rgba(194,96,58,.12)]"
            : "border-stone-300"
        }`}
      >
        <textarea
          id={id}
          name={name}
          rows={6}
          value={value}
          maxLength={maxLength}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "
          className="w-full resize-none bg-transparent px-4 pb-3 pt-6 text-[14.5px] leading-relaxed text-stone-800 outline-none"
        />

        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-4 origin-left transition-all duration-300 ${
            floating
              ? "top-2 text-[11px] font-semibold uppercase tracking-[0.1em]"
              : "top-5 text-[14px]"
          } ${
            error
              ? "text-red-500"
              : focused
              ? "text-[#c2603a]"
              : "text-stone-500"
          }`}
        >
          {label}
        </label>

        <span
          className={`absolute bottom-2.5 right-4 text-[11px] tabular-nums transition-colors ${
            remaining < 50 ? "text-amber-600" : "text-stone-400"
          }`}
        >
          {remaining}
        </span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="mt-1.5 ml-1 text-[12px] font-medium text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopicPicker({ value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
        Topic
      </p>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t) => {
          const active = value === t.value;
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className="relative rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="topic-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#c2603a] to-[#a65335] shadow-[0_8px_20px_-10px_rgba(194,96,58,1)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span
                className={`relative flex items-center gap-1.5 ${
                  active ? "text-white" : "text-stone-700 hover:text-[#a65335]"
                }`}
              >
                <Icon size={13} />
                {t.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InfoCard({ item, index }) {
  const { icon: Icon, label, value, href, color, soft } = item;
  const ref = useRef(null);

  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spotlight = useMotionTemplate`radial-gradient(180px circle at ${mx}px ${my}px, ${color}22, transparent 72%)`;

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const onLeave = () => {
    mx.set(-300);
    my.set(-300);
  };

  const Wrap = href ? "a" : "div";
  const wrapProps = href ? { href } : {};

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Wrap
        {...wrapProps}
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group relative flex items-start gap-4 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-stone-200 hover:bg-white/70 hover:shadow-[0_18px_40px_-24px_rgba(28,25,23,.35)]"
      >
        <motion.div
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <motion.span
          whileHover={{ scale: 1.08, rotate: -6 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{ background: soft, color }}
        >
          <Icon size={18} />
        </motion.span>

        <div className="relative min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {label}
          </p>
          <p
            className="truncate text-[14.5px] font-medium text-stone-800 transition-colors duration-300"
            style={{ ["--c"]: color }}
          >
            {value}
          </p>
        </div>
      </Wrap>
    </motion.li>
  );
}

function FaqItem({ faq, isOpen, onToggle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="relative flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium text-stone-800 transition-colors hover:text-[#a65335]"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.span
              layoutId={`faq-bg-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "linear-gradient(90deg, rgba(194,96,58,.08), transparent)",
              }}
            />
          )}
        </AnimatePresence>

        <span className="flex items-start gap-3">
          <motion.span
            animate={{
              rotate: isOpen ? 90 : 0,
              color: isOpen ? "#c2603a" : "#a8a29e",
            }}
            transition={{ duration: 0.3 }}
            className="mt-0.5 shrink-0"
          >
            <Sparkles size={14} />
          </motion.span>
          <span className="flex-1">{faq.q}</span>
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0, color: isOpen ? "#c2603a" : "#78716c" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="px-5 pb-5 pl-12 text-[14px] leading-relaxed text-stone-600"
            >
              {faq.a}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-5 h-px bg-gradient-to-r from-stone-200 via-stone-200 to-transparent" />
    </motion.div>
  );
}

function SuccessState({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center py-12 text-center"
      role="status"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_20px_45px_-15px_rgba(16,185,129,.7)]"
        >
          <CheckCircle2 size={36} />
        </motion.div>

        {[0, 0.4, 0.8].map((d) => (
          <motion.span
            key={d}
            className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: d, ease: "easeOut" }}
          />
        ))}

        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-amber-400"
            style={{
              left: "50%",
              top: "50%",
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos((i / 6) * Math.PI * 2) * 70,
              y: Math.sin((i / 6) * Math.PI * 2) * 70,
              scale: [0, 1.4, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1.4, delay: 0.3 + i * 0.05, ease: "easeOut" }}
          />
        ))}
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mt-6 font-['Playfair_Display',serif] text-[28px] leading-tight text-stone-900 sm:text-[32px]"
      >
        Message sent
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-stone-600"
      >
        Thanks for reaching out. We'll get back to you at your email within one working day.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onReset}
        className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#a65335] bg-white px-5 py-2.5 text-[13.5px] font-medium text-[#a65335] transition-all hover:bg-[#a65335] hover:text-white"
      >
        <ArrowRight size={15} className="rotate-180" />
        Send another message
      </motion.button>
    </motion.div>
  );
}

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [openFaq, setOpenFaq] = useState(0);
  const [showTop, setShowTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const setTopic = (topic) => {
    setValues((v) => ({ ...v, topic }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      return;
    }

    setStatus("sending");
    try {
      await new Promise((r) => setTimeout(r, 1100));
      setStatus("sent");
      setValues(EMPTY);
    } catch {
      setStatus("idle");
      setErrors({ form: "Something went wrong. Please try again." });
    }
  };

  const TITLE_WORDS = "We'd love to hear from you".split(" ");

  return (
    <div className="relative min-h-screen bg-[#faf7f2] font-['Inter',system-ui,sans-serif] text-[var(--color-ink,#1c1917)] antialiased selection:bg-[#c2603a]/25">
      <GlobalStyles />

      <div
        aria-hidden
        className="grain-overlay pointer-events-none fixed inset-0 z-[1] opacity-[0.035] mix-blend-multiply"
      />

      <motion.div
        style={{ scaleX: progress }}
        className="fixed left-0 right-0 top-0 z-40 h-[3px] origin-left bg-gradient-to-r from-[#c2603a] via-[#d9a441] to-[#6d5bd0]"
      />

      <section className="relative overflow-hidden px-6 pb-14 pt-24">
        <Aurora />

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c2603a]/25 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a65335] backdrop-blur-sm"
          >
            <motion.span
              animate={{ rotate: [0, 15, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={13} />
            </motion.span>
            Contact
          </motion.p>

          <h1
            className="relative font-['Playfair_Display',serif] text-[38px] leading-[1.12] text-stone-900 sm:text-[52px] md:text-[58px]"
            style={{ perspective: 900 }}
          >
            {TITLE_WORDS.map((w, i) => {
              const isTail = i >= TITLE_WORDS.length - 3;
              return (
                <motion.span
                  key={i}
                  className={`mr-[0.28em] inline-block ${isTail ? "text-gradient italic" : ""}`}
                  initial={{ opacity: 0, y: 30, rotateX: -55 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.12 + i * 0.055, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              );
            })}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-stone-600"
          >
            Questions about an artwork, an order, or selling on Artnest? Send us a message and
            we'll reply within one working day.
          </motion.p>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-6 pb-20 lg:grid-cols-5">
        <aside className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="mb-5 font-['Playfair_Display',serif] text-[20px] text-stone-800">
              Reach us directly
            </h2>
            <ul className="space-y-1.5">
              {INFO.map((item, i) => (
                <InfoCard key={item.label} item={item} index={i} />
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="absolute inset-0 rounded-full bg-emerald-400/70"
                  style={{ animation: "ringPulse 2s ease-out infinite" }}
                />
                <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <p className="text-[13px] font-medium text-stone-700">
                Usually replies within a few hours
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="relative mt-6 overflow-hidden rounded-3xl bg-stone-900 p-6 text-white shadow-[0_30px_60px_-30px_rgba(28,25,23,.7)]"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <motion.div
                className="absolute -left-16 -top-16 h-52 w-52 rounded-full blur-[80px]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(194,96,58,.6), transparent 70%)",
                }}
                animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -bottom-16 -right-16 h-52 w-52 rounded-full blur-[80px]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(109,91,208,.5), transparent 70%)",
                }}
                animate={{ x: [0, -35, 0], y: [0, -25, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="relative">
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-grid h-10 w-10 place-items-center rounded-xl bg-amber-400/15 ring-1 ring-amber-400/30"
              >
                <Palette size={18} className="text-amber-400" />
              </motion.span>

              <h3 className="mt-4 font-['Playfair_Display',serif] text-[20px] leading-tight">
                Looking for something unique?
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-stone-300">
                Commission an artist directly for a piece made just for you.
              </p>

              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="mt-5 inline-block"
              >
                <Link
                  to="/custom-art"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c2603a] to-[#a65335] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(194,96,58,1)]"
                >
                  Request custom art
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </aside>

        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white/70 p-6 shadow-[0_25px_60px_-40px_rgba(28,25,23,.4)] backdrop-blur-sm sm:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-[80px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(217,164,65,.35), transparent 70%)",
              }}
            />

            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <SuccessState key="sent" onReset={() => setStatus("idle")} />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c2603a]/10 text-[#c2603a]">
                      <MessageCircle size={18} />
                    </span>
                    <div>
                      <h2 className="font-['Playfair_Display',serif] text-[20px] leading-tight text-stone-900">
                        Send us a message
                      </h2>
                      <p className="text-[12.5px] text-stone-500">
                        All fields are required
                      </p>
                    </div>
                  </div>

                  <form onSubmit={onSubmit} noValidate className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field
                        id="name"
                        name="name"
                        label="Your name"
                        value={values.name}
                        onChange={onChange}
                        error={errors.name}
                        icon={User}
                        autoComplete="name"
                      />
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        label="Email"
                        value={values.email}
                        onChange={onChange}
                        error={errors.email}
                        icon={AtSign}
                        autoComplete="email"
                      />
                    </div>

                    <TopicPicker value={values.topic} onChange={setTopic} />

                    <TextArea
                      id="message"
                      name="message"
                      label="Message"
                      value={values.message}
                      onChange={onChange}
                      error={errors.message}
                    />

                    <AnimatePresence>
                      {errors.form && (
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600"
                        >
                          {errors.form}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between gap-4 pt-2">
                      <motion.button
                        type="submit"
                        disabled={status === "sending"}
                        whileHover={status !== "sending" ? { y: -2 } : {}}
                        whileTap={status !== "sending" ? { scale: 0.97 } : {}}
                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#c2603a] to-[#a65335] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_16px_36px_-16px_rgba(194,96,58,1)] transition-shadow hover:shadow-[0_22px_46px_-16px_rgba(194,96,58,1)] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {status === "sending" ? (
                            <motion.span
                              key="sending"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="flex items-center gap-2"
                            >
                              <Loader2 size={16} className="animate-spin" />
                              Sending…
                            </motion.span>
                          ) : (
                            <motion.span
                              key="idle"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="flex items-center gap-2"
                            >
                              <Send size={16} />
                              Send message
                            </motion.span>
                          )}
                        </AnimatePresence>

                        <motion.span
                          aria-hidden
                          className="pointer-events-none absolute inset-0"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.9, ease: "easeInOut" }}
                          style={{
                            background:
                              "linear-gradient(110deg, transparent 30%, rgba(255,255,255,.4), transparent 70%)",
                          }}
                        />
                      </motion.button>

                      <p className="hidden text-[12px] text-stone-500 sm:block">
                        We typically reply within a day.
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <section className="relative border-t border-stone-200 bg-gradient-to-b from-[#f5f4f0] to-[#faf7f2]">
        <div className="mx-auto max-w-[760px] px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c2603a]/25 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a65335]">
              <HelpCircle size={12} />
              FAQ
            </span>
            <h2 className="mt-4 font-['Playfair_Display',serif] text-[30px] leading-tight text-stone-900 sm:text-[36px]">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] text-stone-600">
              Quick answers to the things people ask us most. Still stuck? Drop us a message above.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_25px_60px_-40px_rgba(28,25,23,.35)]"
          >
            {FAQS.map((f, i) => (
              <FaqItem
                key={f.q}
                faq={f}
                index={i}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-stone-900 text-white shadow-[0_18px_40px_-16px_rgba(28,25,23,.8)] transition-colors hover:bg-[#a65335]"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}