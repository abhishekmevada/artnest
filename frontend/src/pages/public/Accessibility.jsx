import { useEffect, useState, useRef, useMemo } from "react";
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
  Keyboard,
  Volume2,
  Eye,
  Waves,
  Smartphone,
  ArrowRight,
  ArrowUp,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Award,
  Gauge,
  Heart,
} from "lucide-react";

const FEATURES = [
  {
    t: "Keyboard friendly",
    d: "Menus, filters, the cart and the gallery viewer can be used with Tab, Enter, Space, Esc and the arrow keys.",
    icon: Keyboard,
    color: "#4a5fc0",
    soft: "#ebeefc",
    stat: "100%",
    statLabel: "interactive elements",
  },
  {
    t: "Screen reader support",
    d: "Artworks have descriptive alt text, buttons and links have clear names, and pages use proper headings.",
    icon: Volume2,
    color: "#6d5bd0",
    soft: "#efedfc",
    stat: "AA",
    statLabel: "WCAG target",
  },
  {
    t: "Readable text and colour",
    d: "We aim for text contrast of at least 4.5:1 and never use colour alone to show status.",
    icon: Eye,
    color: "#d99b2b",
    soft: "#fdf3de",
    stat: "4.5:1",
    statLabel: "min contrast",
  },
  {
    t: "Reduced motion",
    d: "Animations and autoplay videos should respect your device's reduced-motion setting.",
    icon: Waves,
    color: "#3f8a68",
    soft: "#e9f4ee",
    stat: "Auto",
    statLabel: "motion respect",
  },
  {
    t: "Works at any size",
    d: "Pages reflow on phones and stay usable when you zoom to 200%.",
    icon: Smartphone,
    color: "#c2603a",
    soft: "#fbeee7",
    stat: "200%",
    statLabel: "zoom tested",
  },
];

const LIMITS = [
  {
    t: "Missing image descriptions",
    d: "Some artist-uploaded images may not have a full description yet. Tell us and we will add one.",
  },
  {
    t: "Uncaptioned background video",
    d: "Background videos on the Home and About pages do not have captions or audio descriptions.",
  },
  {
    t: "Third-party checkout",
    d: "Third-party payment screens at checkout are outside our control.",
  },
];

const TESTED_WITH = [
  { name: "NVDA + Firefox", category: "Screen reader", color: "#6d5bd0" },
  { name: "VoiceOver + Safari", category: "Screen reader", color: "#6d5bd0" },
  { name: "TalkBack + Chrome", category: "Screen reader", color: "#6d5bd0" },
  { name: "Keyboard only", category: "Navigation", color: "#4a5fc0" },
  { name: "200% zoom", category: "Reflow", color: "#c2603a" },
  { name: "High contrast", category: "Vision", color: "#d99b2b" },
  { name: "Reduced motion", category: "Motion", color: "#3f8a68" },
  { name: "Colour-blind filters", category: "Vision", color: "#d99b2b" },
];

const COMMITMENT_STATS = [
  { value: "AA", label: "WCAG 2.1 level", icon: Award, color: "#c2603a", soft: "#fbeee7" },
  { value: "100%", label: "Keyboard reachable", icon: Keyboard, color: "#4a5fc0", soft: "#ebeefc" },
  { value: "5 days", label: "Feedback response", icon: MessageCircle, color: "#3f8a68", soft: "#e9f4ee" },
];

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E";

const EASE = [0.22, 1, 0.36, 1];

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');

      @keyframes floaty { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
      @keyframes shimmer { 0%{background-position:-200% 50%;} 100%{background-position:200% 50%;} }
      @keyframes ringPulse { 0%{transform:scale(.85);opacity:.8;} 100%{transform:scale(2.2);opacity:0;} }
      @keyframes gradientShift { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
      @keyframes marquee { 0%{transform:translateX(0);} 100%{transform:translateX(-100%);} }

      .floaty { animation: floaty 6s ease-in-out infinite; }
      .marquee-track { animation: marquee 44s linear infinite; }
      .marquee-wrap:hover .marquee-track { animation-play-state: paused; }

      .text-gradient {
        background: linear-gradient(100deg, #c2603a 0%, #d9a441 45%, #6d5bd0 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: shimmer 8s linear infinite;
      }

      .animated-gradient { background-size: 200% 200%; animation: gradientShift 12s ease infinite; }
      .grain-overlay { background-image: url("${GRAIN}"); background-repeat: repeat; }

      .no-bar::-webkit-scrollbar { display: none; }
      .no-bar { -ms-overflow-style: none; scrollbar-width: none; }

      .mask-fade-x {
        mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
      }

      .sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        *,*::before,*::after {
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
        style={{ background: "radial-gradient(circle at 35% 35%, rgba(194,96,58,.45), transparent 68%)" }}
        animate={{ x: [0, 70, -30, 0], y: [0, 45, -25, 0], scale: [1, 1.12, 0.94, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-28 top-4 h-[30rem] w-[30rem] rounded-full blur-[115px]"
        style={{ background: "radial-gradient(circle at 60% 40%, rgba(217,164,65,.42), transparent 70%)" }}
        animate={{ x: [0, -70, 40, 0], y: [0, 55, -35, 0], scale: [1, 1.18, 0.9, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-44 h-[28rem] w-[28rem] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(109,91,208,.32), transparent 70%)" }}
        animate={{ x: [0, 45, -45, 0], y: [0, -45, 35, 0], scale: [1, 1.1, 1.05, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function PrincipleMarquee() {
  const items = [
    "Perceivable",
    "Operable",
    "Understandable",
    "Robust",
    "Keyboard first",
    "Screen reader tested",
    "Colour never alone",
    "Reduced motion",
    "Zoom to 200%",
    "WCAG 2.1 AA",
  ];
  const Row = ({ hidden }) => (
    <div aria-hidden={hidden} className="marquee-track flex shrink-0 items-center gap-10 pr-10">
      {items.map((t) => (
        <span
          key={t}
          className="flex items-center gap-2.5 whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.22em] text-stone-400"
        >
          <Sparkles size={11} className="text-[#c2603a]" />
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee-wrap mask-fade-x relative flex overflow-hidden border-y border-stone-200/70 bg-white/50 py-3.5 backdrop-blur-sm">
      <Row />
      <Row hidden />
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, ${feature.color}1f, transparent 72%)`;

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

  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: EASE }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-[24px] border border-stone-200/80 bg-white/85 p-6 backdrop-blur-sm shadow-[0_1px_2px_rgba(28,25,23,.05)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(28,25,23,.45)]"
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${feature.color}, ${feature.color}00)` }}
      />

      <motion.div
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-4">
        <motion.span
          whileHover={{ scale: 1.08, rotate: -6 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
          style={{ background: feature.soft, color: feature.color }}
        >
          <Icon size={20} />
        </motion.span>

        <div className="text-right">
          <p
            className="font-['Playfair_Display',serif] text-[22px] font-semibold leading-none"
            style={{ color: feature.color }}
          >
            {feature.stat}
          </p>
          <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-stone-400">
            {feature.statLabel}
          </p>
        </div>
      </div>

      <h3 className="mt-5 font-['Playfair_Display',serif] text-[19px] leading-snug text-stone-900">
        {feature.t}
      </h3>
      <p className="mt-2.5 text-[14px] leading-relaxed text-stone-600">{feature.d}</p>

      <div className="mt-5 flex items-center gap-2 border-t border-dashed border-stone-200 pt-4">
        <CheckCircle2 size={14} style={{ color: feature.color }} />
        <span className="text-[12px] font-medium text-stone-500">
          Committed
        </span>
      </div>
    </motion.div>
  );
}

function StatCard({ stat, index }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: EASE }}
      className="group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white/70 p-5 backdrop-blur-sm"
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}00)` }}
      />
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ background: stat.soft, color: stat.color }}
        >
          <Icon size={17} />
        </span>
        <div>
          <p className="font-['Playfair_Display',serif] text-[24px] font-semibold leading-none text-stone-900">
            {stat.value}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
            {stat.label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TestedChip({ item, index }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: EASE }}
      whileHover={{ y: -3 }}
      className="group inline-flex cursor-default items-center gap-2 rounded-full border border-stone-200 bg-white/80 py-1.5 pl-2.5 pr-3.5 text-[12px] font-medium text-stone-700 backdrop-blur-sm transition-shadow hover:shadow-[0_14px_30px_-18px_rgba(28,25,23,.4)]"
    >
      <span
        className="grid h-5 w-5 place-items-center rounded-full"
        style={{ background: `${item.color}22`, color: item.color }}
      >
        <CheckCircle2 size={11} />
      </span>
      {item.name}
      <span className="ml-0.5 rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">
        {item.category}
      </span>
    </motion.span>
  );
}

function LimitCard({ limit, index }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: EASE }}
      className="group relative flex items-start gap-4 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 transition-all duration-300 hover:border-amber-300 hover:bg-amber-50"
    >
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
        <AlertTriangle size={15} />
      </span>
      <div>
        <p className="text-[14px] font-semibold text-stone-800">{limit.t}</p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-stone-600">{limit.d}</p>
      </div>
    </motion.li>
  );
}

export default function Accessibility() {
  const [showTop, setShowTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const TITLE_WORDS = "Art for everyone".split(" ");

  return (
    <div className="relative min-h-screen bg-[#faf7f2] font-['Inter',system-ui,sans-serif] text-[var(--color-ink,#1c1917)] antialiased selection:bg-[#c2603a]/25">
      <GlobalStyles />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <div
        aria-hidden
        className="grain-overlay pointer-events-none fixed inset-0 z-[1] opacity-[0.035] mix-blend-multiply"
      />

      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed left-0 right-0 top-0 z-40 h-[3px] origin-left bg-gradient-to-r from-[#c2603a] via-[#d9a441] to-[#6d5bd0]"
      />

      <section className="relative overflow-hidden px-6 pb-14 pt-24">
        <Aurora />

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c2603a]/25 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a65335] backdrop-blur-sm"
          >
            <motion.span
              animate={{ rotate: [0, 15, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            >
              <Shield size={13} />
            </motion.span>
            Accessibility Statement
          </motion.p>

          <h1
            className="relative font-['Playfair_Display',serif] text-[40px] leading-[1.1] text-stone-900 sm:text-[56px] md:text-[64px]"
            style={{ perspective: 900 }}
          >
            {TITLE_WORDS.map((w, i) => {
              const isLast = i === TITLE_WORDS.length - 1;
              return (
                <motion.span
                  key={i}
                  className={`mr-[0.24em] inline-block ${isLast ? "text-gradient italic" : ""}`}
                  initial={{ opacity: 0, y: 30, rotateX: -55 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.12 + i * 0.08, duration: 0.65, ease: EASE }}
                >
                  {w}
                </motion.span>
              );
            })}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-stone-600"
          >
            Art should be open to everyone. Artnest is designed to meet{" "}
            <span className="font-semibold text-stone-800">WCAG 2.1 level AA</span>, and we
            keep testing and improving as the site grows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {COMMITMENT_STATS.map((s, i) => (
              <StatCard key={s.label} stat={s} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      <PrincipleMarquee />

      <main id="main" className="relative z-10 mx-auto max-w-[1100px] px-6 py-16">

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c2603a]/25 bg-white/70 px-3.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#a65335] backdrop-blur-sm">
            <Sparkles size={11} aria-hidden />
            Our commitments
          </span>
          <h2
            id="features"
            className="mt-4 font-['Playfair_Display',serif] text-[32px] leading-tight text-stone-900 sm:text-[40px]"
          >
            What we do
          </h2>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-stone-600">
            Five commitments that shape how every page, button and image on Artnest is built
            and tested.
          </p>
        </motion.header>

        <div
          role="list"
          aria-labelledby="features"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.t} feature={f} index={i} />
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-16"
          aria-labelledby="tested"
        >
          <div className="mb-5 flex items-center gap-2">
            <Gauge size={14} className="text-[#3f8a68]" aria-hidden />
            <h2
              id="tested"
              className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-stone-500"
            >
              Tested with
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {TESTED_WITH.map((t, i) => (
              <TestedChip key={t.name} item={t} index={i} />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-16"
          aria-labelledby="limits"
        >
          <div className="mb-5 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600" aria-hidden />
            <h2
              id="limits"
              className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-stone-500"
            >
              Known gaps
            </h2>
          </div>

          <p className="mb-5 max-w-2xl text-[14.5px] leading-relaxed text-stone-600">
            Transparency matters. Here's where we know we still have work to do — and
            we're working on each one.
          </p>

          <ul role="list" className="grid grid-cols-1 gap-3">
            {LIMITS.map((l, i) => (
              <LimitCard key={l.t} limit={l} index={i} />
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative mt-16 overflow-hidden rounded-3xl bg-stone-900 p-8 text-white shadow-[0_30px_60px_-30px_rgba(28,25,23,.7)] sm:p-10"
          aria-labelledby="feedback"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <motion.div
              className="absolute -left-16 -top-16 h-52 w-52 rounded-full blur-[80px]"
              style={{ background: "radial-gradient(circle, rgba(194,96,58,.6), transparent 70%)" }}
              animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-16 -right-16 h-52 w-52 rounded-full blur-[80px]"
              style={{ background: "radial-gradient(circle, rgba(109,91,208,.5), transparent 70%)" }}
              animate={{ x: [0, -35, 0], y: [0, -25, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-400/30"
                aria-hidden
              >
                <Heart size={22} className="text-amber-400" />
              </motion.span>
              <div>
                <h2
                  id="feedback"
                  className="font-['Playfair_Display',serif] text-[24px] leading-tight sm:text-[28px]"
                >
                  Having trouble?
                </h2>
                <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-stone-300">
                  Tell us which page and device you were using and what got in the way. We
                  aim to reply within 5 working days.
                </p>
              </div>
            </div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="shrink-0">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c2603a] to-[#a65335] px-6 py-3 text-[13.5px] font-semibold text-white shadow-[0_16px_36px_-16px_rgba(194,96,58,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
              >
                Send feedback
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-6 text-[12.5px] text-stone-500 sm:flex-row"
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#3f8a68]" aria-hidden />
            Last reviewed: <span className="font-medium text-stone-700">October 2026</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Award size={14} className="text-[#c2603a]" aria-hidden />
            Target: <span className="font-medium text-stone-700">WCAG 2.1 AA</span>
          </span>
        </motion.div>
      </main>

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
            className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-stone-900 text-white shadow-[0_18px_40px_-16px_rgba(28,25,23,.8)] transition-colors hover:bg-[#a65335] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            <ArrowUp size={18} aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}