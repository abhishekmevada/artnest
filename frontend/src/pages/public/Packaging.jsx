import { useState, useEffect, useRef, useMemo } from "react";
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
  Camera,
  Package,
  Shield,
  Box,
  Truck,
  Sparkles,
  ArrowRight,
  ArrowUp,
  AlertTriangle,
  Check,
  Layers,
  Wind,
  Droplets,
  Sun,
  Hand,
  Palette,
  CircleDot,
  Ruler,
  Recycle,
  Award,
  ShieldCheck,
  Leaf,
} from "lucide-react";

const MEDIUM_META = {
  Paintings:   { color: "#c2603a", soft: "#fbeee7", icon: Palette },
  Sculptures:  { color: "#a06a3f", soft: "#f4ece2", icon: CircleDot },
};
const metaOf = (k) =>
  MEDIUM_META[k] || { color: "#a65335", soft: "#fbeee7", icon: Palette };

const STEPS = [
  {
    t: "Inspect and photograph",
    d: "The artist photographs the work before packing, so its condition is on record.",
    icon: Camera,
    color: "#c2603a",
  },
  {
    t: "Wrap the surface",
    d: "Acid-free tissue or glassine goes directly on the artwork. Nothing sticky ever touches it.",
    icon: Layers,
    color: "#d99b2b",
  },
  {
    t: "Cushion the corners",
    d: "Edges and corners get foam or corrugated protectors, the places most damage starts.",
    icon: Shield,
    color: "#4a5fc0",
  },
  {
    t: "Box it with space to spare",
    d: "A rigid box or wooden crate with at least 5 cm of padding on every side.",
    icon: Box,
    color: "#6d5bd0",
  },
  {
    t: "Ship insured and tracked",
    d: "Every order is insured for its full value and you get a tracking link.",
    icon: Truck,
    color: "#3f8a68",
  },
];

const CARE = {
  Paintings: {
    tips: [
      { icon: Sun,      t: "Hang away from direct sunlight and heaters." },
      { icon: Hand,     t: "Dust gently with a dry, soft brush. Never use water or cleaners." },
      { icon: Droplets, t: "Keep humidity steady, ideally 40 to 55%." },
    ],
  },
  Sculptures: {
    tips: [
      { icon: Hand,     t: "Lift from the base, never from arms or thin parts." },
      { icon: Sparkles, t: "Dust marble and bronze with a soft cloth. Avoid oils and polish." },
      { icon: Wind,     t: "Keep wood pieces away from damp walls and radiators." },
    ],
  },
};

const PROMISES = [
  { icon: ShieldCheck, label: "Fully insured",     sub: "Every order, every value" },
  { icon: Leaf,        label: "Eco materials",     sub: "Recycled, acid-free" },
  { icon: Truck,       label: "Tracked shipping",  sub: "Door-to-door visibility" },
  { icon: Award,       label: "Certificate",       sub: "Signed by the artist" },
];

const MATERIALS = [
  { icon: Layers,   name: "Acid-free tissue",   desc: "Direct contact layer that won't yellow or bleed onto the surface.", color: "#c2603a" },
  { icon: Shield,   name: "Foam corner guards", desc: "Absorbs impact exactly where transit damage begins.",              color: "#4a5fc0" },
  { icon: Box,      name: "Rigid double-wall",  desc: "Corrugated or wooden crate with 5 cm of padding on every side.",  color: "#6d5bd0" },
  { icon: Recycle,  name: "Recycled fill",      desc: "Biodegradable void fill keeps the piece from shifting in transit.", color: "#3f8a68" },
  { icon: Ruler,    name: "Custom crating",     desc: "For sculptures and oversize works, built to millimetre.",          color: "#d99b2b" },
  { icon: Droplets, name: "Moisture barrier",   desc: "Water-resistant liner for long-haul and international routes.",    color: "#a06a3f" },
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
      .marquee-track { animation: marquee 55s linear infinite; }
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

function TrustMarquee({ items }) {
  const Row = ({ hidden }) => (
    <div aria-hidden={hidden} className="marquee-track flex shrink-0 items-center gap-10 pr-10">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <span
            key={it.label + i}
            className="flex items-center gap-2.5 whitespace-nowrap text-[12.5px] font-medium uppercase tracking-[0.18em] text-stone-500"
          >
            <Icon size={13} style={{ color: it.color }} />
            {it.label}
          </span>
        );
      })}
    </div>
  );
  return (
    <div className="marquee-wrap mask-fade-x relative flex overflow-hidden border-y border-stone-200/70 bg-white/50 py-3.5 backdrop-blur-sm">
      <Row />
      <Row hidden />
    </div>
  );
}

function StepCard({ step, index, total }) {
  const ref = useRef(null);
  const Icon = step.icon;

  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, ${step.color}26, transparent 72%)`;

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

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: EASE }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative"
    >
      {index < total - 1 && (
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + index * 0.12, duration: 0.7, ease: EASE }}
          className="absolute left-[calc(50%+2rem)] right-[-2rem] top-7 hidden h-px origin-left lg:block"
          style={{
            background: `linear-gradient(90deg, ${step.color}66, ${step.color}00)`,
          }}
        />
      )}

      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white/70 p-5 backdrop-blur-sm shadow-[0_1px_2px_rgba(28,25,23,.05)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(28,25,23,.5)]"
      >
        <span
          className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
          style={{ background: `linear-gradient(90deg, ${step.color}, ${step.color}00)` }}
        />

        <motion.div
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="relative flex items-center justify-between">
          <motion.span
            whileHover={{ scale: 1.08, rotate: -6 }}
            transition={{ type: "spring", stiffness: 340, damping: 18 }}
            className="grid h-11 w-11 place-items-center rounded-xl"
            style={{ background: `${step.color}15`, color: step.color }}
          >
            <Icon size={18} />
          </motion.span>

          <span
            className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold tabular-nums"
            style={{ background: `${step.color}12`, color: step.color }}
          >
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <h3 className="relative mt-4 font-['Playfair_Display',serif] text-[16.5px] leading-snug text-stone-900">
          {step.t}
        </h3>
        <p className="relative mt-2 text-[13.5px] leading-relaxed text-stone-600">
          {step.d}
        </p>
      </motion.div>
    </motion.li>
  );
}

function MaterialCard({ item, index }) {
  const ref = useRef(null);
  const Icon = item.icon;

  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${mx}px ${my}px, ${item.color}22, transparent 72%)`;

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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: EASE }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white/70 p-5 backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_26px_55px_-30px_rgba(28,25,23,.5)]"
    >
      <motion.div
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <span
        className="relative inline-grid h-10 w-10 place-items-center rounded-xl"
        style={{ background: `${item.color}14`, color: item.color }}
      >
        <Icon size={16} />
      </span>

      <h3 className="relative mt-4 text-[14.5px] font-semibold text-stone-900">
        {item.name}
      </h3>
      <p className="relative mt-1.5 text-[13px] leading-relaxed text-stone-600">
        {item.desc}
      </p>

      <span
        className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: `radial-gradient(circle, ${item.color}, transparent 70%)` }}
      />
    </motion.div>
  );
}

function CarePanel({ medium }) {
  const meta = metaOf(medium);
  const Icon = meta.icon;
  const tips = CARE[medium].tips;

  return (
    <motion.div
      key={medium}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white/70 p-6 backdrop-blur-sm shadow-[0_25px_60px_-40px_rgba(28,25,23,.35)] sm:p-8"
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}00)` }}
      />

      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 place-items-center rounded-xl"
          style={{ background: meta.soft, color: meta.color }}
        >
          <Icon size={18} />
        </span>
        <div>
          <h3 className="font-['Playfair_Display',serif] text-[20px] leading-tight text-stone-900">
            {medium}
          </h3>
          <p className="text-[12.5px] text-stone-500">
            {tips.length} care tips for this medium
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {tips.map((tip, i) => {
          const TIcon = tip.icon;
          return (
            <motion.li
              key={tip.t}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.09, duration: 0.45, ease: EASE }}
              className="group flex items-start gap-3.5 rounded-2xl border border-stone-100 bg-white/70 p-4 transition-colors hover:border-stone-200"
            >
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                style={{ background: meta.soft, color: meta.color }}
              >
                <TIcon size={14} />
              </span>
              <p className="text-[14px] leading-relaxed text-stone-700">{tip.t}</p>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}

export default function Packaging() {
  const [tab, setTab] = useState("Paintings");
  const [showTop, setShowTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const careRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "/" && !typing) {
        e.preventDefault();
        careRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const marqueeItems = useMemo(
    () =>
      PROMISES.map((p, i) => {
        const colors = ["#c2603a", "#3f8a68", "#4a5fc0", "#d99b2b"];
        return { ...p, color: colors[i % colors.length] };
      }),
    []
  );

  const TITLE_WORDS = "Safe packaging and care".split(" ");

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
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c2603a]/25 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a65335] backdrop-blur-sm"
          >
            <motion.span
              animate={{ rotate: [0, 15, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Package size={13} />
            </motion.span>
            From studio to wall
          </motion.p>

          <h1
            className="relative font-['Playfair_Display',serif] text-[38px] leading-[1.12] text-stone-900 sm:text-[52px] md:text-[58px]"
            style={{ perspective: 900 }}
          >
            {TITLE_WORDS.map((w, i) => {
              const isTail = i >= TITLE_WORDS.length - 2;
              return (
                <motion.span
                  key={i}
                  className={`mr-[0.26em] inline-block ${isTail ? "text-gradient italic" : ""}`}
                  initial={{ opacity: 0, y: 30, rotateX: -55 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, duration: 0.65, ease: EASE }}
                >
                  {w}
                </motion.span>
              );
            })}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-stone-600"
          >
            How your artwork is packed before it leaves the studio, and how to look
            after it once it's home.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            <a
              href="#packing"
              className="rounded-full border border-stone-300 bg-white/70 px-4 py-1.5 text-[12.5px] font-medium text-stone-700 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#c2603a] hover:text-[#a65335]"
            >
              Packing process
            </a>
            <a
              href="#materials"
              className="rounded-full border border-stone-300 bg-white/70 px-4 py-1.5 text-[12.5px] font-medium text-stone-700 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#c2603a] hover:text-[#a65335]"
            >
              Materials
            </a>
            <a
              href="#care"
              className="rounded-full border border-stone-300 bg-white/70 px-4 py-1.5 text-[12.5px] font-medium text-stone-700 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#c2603a] hover:text-[#a65335]"
            >
              Care guide
            </a>
          </motion.div>
        </div>
      </section>

      <TrustMarquee items={marqueeItems} />

      <section className="relative z-10 mx-auto max-w-[1100px] px-6 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {PROMISES.map((p, i) => {
            const Icon = p.icon;
            const colors = ["#c2603a", "#3f8a68", "#4a5fc0", "#d99b2b"];
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white/70 p-4 backdrop-blur-sm transition-shadow hover:shadow-[0_22px_45px_-25px_rgba(28,25,23,.4)]"
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{ background: `${color}14`, color }}
                >
                  <Icon size={15} />
                </span>
                <p className="mt-3 text-[13.5px] font-semibold text-stone-900">
                  {p.label}
                </p>
                <p className="mt-0.5 text-[11.5px] text-stone-500">{p.sub}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section id="packing" className="relative z-10 mx-auto max-w-[1200px] px-6 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c2603a]/25 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a65335] backdrop-blur-sm">
            <Package size={12} />
            Step by step
          </span>
          <h2 className="mt-4 font-['Playfair_Display',serif] text-[30px] leading-tight text-stone-900 sm:text-[38px]">
            How we pack every order
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[14.5px] text-stone-600">
            Five deliberate steps between the studio and your wall — each one
            designed to survive a journey.
          </p>
        </motion.div>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <StepCard key={s.t} step={s} index={i} total={STEPS.length} />
          ))}
        </ol>
      </section>

      <section id="materials" className="relative z-10 mx-auto max-w-[1100px] px-6 pt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c2603a]/25 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a65335] backdrop-blur-sm">
              <Leaf size={12} />
              What goes in the box
            </span>
            <h2 className="mt-4 font-['Playfair_Display',serif] text-[28px] leading-tight text-stone-900 sm:text-[34px]">
              Materials we trust
            </h2>
          </div>
          <p className="max-w-md text-[14px] text-stone-600">
            Archival, recycled, and tested. Nothing that could ever react with the
            artwork itself.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MATERIALS.map((m, i) => (
            <MaterialCard key={m.name} item={m} index={i} />
          ))}
        </div>
      </section>

      <section
        id="care"
        ref={careRef}
        className="relative z-10 mx-auto max-w-[1100px] px-6 pt-16 pb-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-8 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border-[#c2603a]/25 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a65335] backdrop-blur-sm border">
            <Sparkles size={12} />
            Living with your piece
          </span>
          <h2 className="mt-4 font-['Playfair_Display',serif] text-[30px] leading-tight text-stone-900 sm:text-[38px]">
            Care guide by medium
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[14.5px] text-stone-600">
            Every material ages differently. Here's how to keep yours looking its
            best for decades.
          </p>
        </motion.div>

        <div className="no-bar mb-6 flex flex-wrap justify-center gap-2 overflow-x-auto">
          {Object.keys(CARE).map((k) => {
            const meta = metaOf(k);
            const isActive = tab === k;
            const Icon = meta.icon;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(k)}
                className="relative rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors duration-200"
              >
                {isActive && (
                  <motion.span
                    layoutId="care-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(120deg, ${meta.color}, ${meta.color}c9)`,
                      boxShadow: `0 8px 22px -10px ${meta.color}cc`,
                    }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={`relative flex items-center gap-1.5 ${
                    isActive ? "text-white" : "text-stone-700 hover:text-[#a65335]"
                  }`}
                >
                  <Icon size={13} />
                  {k}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mx-auto max-w-[760px]">
          <AnimatePresence mode="wait">
            <CarePanel key={tab} medium={tab} />
          </AnimatePresence>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1100px] px-6 pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative overflow-hidden rounded-3xl bg-stone-900 p-8 text-white shadow-[0_30px_60px_-30px_rgba(28,25,23,.7)] sm:p-10"
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
                animate={{ y: [0, -4, 0], rotate: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-400/30"
              >
                <AlertTriangle size={22} className="text-amber-400" />
              </motion.span>
              <div>
                <h3 className="font-['Playfair_Display',serif] text-[24px] leading-tight sm:text-[28px]">
                  Arrived damaged?
                </h3>
                <p className="mt-1.5 max-w-md text-[14px] text-stone-300">
                  Keep the box and all packing material, take photos within 48
                  hours of delivery, and send them to us. We'll arrange a
                  replacement, repair or refund.
                </p>
              </div>
            </div>

            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="shrink-0"
            >
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c2603a] to-[#a65335] px-6 py-3 text-[13.5px] font-semibold text-white shadow-[0_16px_36px_-16px_rgba(194,96,58,1)]"
              >
                Report damage
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.1, duration: 0.55, ease: EASE }}
          className="mt-8 grid gap-3 sm:grid-cols-3"
        >
          {[
            "Keep the original box and packing",
            "Photograph damage within 48 hours",
            "Have your order number ready",
          ].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: EASE }}
              className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white/70 p-4 backdrop-blur-sm"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={13} />
              </span>
              <p className="text-[13.5px] leading-relaxed text-stone-700">{t}</p>
            </motion.div>
          ))}
        </motion.div>
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