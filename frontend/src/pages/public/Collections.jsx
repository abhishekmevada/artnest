import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Layers,
  Sparkles,
  Flame,
  Gem,
  Palette,
  MapPin,
  Cpu,
  Scissors,
  Heart,
  Eye,
  ArrowUp,
  Filter,
} from "lucide-react";
import { ARTWORKS, CATEGORY_LABELS } from "../../data/artworks";

const THEMES = {
  "earth-fire": {
    color: "#c2603a",
    soft: "#fbeee7",
    grad: "linear-gradient(135deg, #c2603a, #e08a4d)",
    icon: Flame,
  },
  "under-1000": {
    color: "#3f8a68",
    soft: "#e9f4ee",
    grad: "linear-gradient(135deg, #3f8a68, #5fb98d)",
    icon: Gem,
  },
  "wall-statements": {
    color: "#4a5fc0",
    soft: "#ebeefc",
    grad: "linear-gradient(135deg, #4a5fc0, #7d8fe0)",
    icon: Palette,
  },
  "made-in-india": {
    color: "#d99b2b",
    soft: "#fdf3de",
    grad: "linear-gradient(135deg, #d99b2b, #f0bb56)",
    icon: MapPin,
  },
  "new-media": {
    color: "#6d5bd0",
    soft: "#efedfc",
    grad: "linear-gradient(135deg, #6d5bd0, #9a8be8)",
    icon: Cpu,
  },
  texture: {
    color: "#a06a3f",
    soft: "#f4ece2",
    grad: "linear-gradient(135deg, #a06a3f, #c39165)",
    icon: Scissors,
  },
};
const themeOf = (id) =>
  THEMES[id] || { color: "#a65335", soft: "#fbeee7", grad: "linear-gradient(135deg,#a65335,#c2603a)", icon: Layers };

const COLLECTIONS = [
  {
    id: "earth-fire",
    title: "Earth & Fire",
    tagline: "Clay, glass and bronze shaped by heat",
    story:
      "Wood-fired stoneware, raku, hand-blown glass and cast bronze. Pieces where fire does half the work, so no two ever come out the same.",
    pick: (a) => ["ceramics"].includes(a.category) || /bronze|glass/i.test(a.medium),
  },
  {
    id: "under-1000",
    title: "Start Collecting",
    tagline: "Original works under ₹1,000",
    story:
      "Real originals and limited prints at entry-level prices. A friendly first step into owning art you love.",
    pick: (a) => a.value <= 1000,
  },
  {
    id: "wall-statements",
    title: "Wall Statements",
    tagline: "Large works that anchor a room",
    story:
      "Big canvases, tapestries and prints that give a space a focal point. Scale first, then colour.",
    pick: (a) => {
      const nums = (a.dims.match(/\d+/g) || []).map(Number);
      return nums.length ? Math.max(...nums) >= 100 : false;
    },
  },
  {
    id: "made-in-india",
    title: "Made in India",
    tagline: "Voices from Kochi, Jaipur and beyond",
    story:
      "Watercolour, charcoal, monotype and bronze from Indian studios, rooted in local light, landscape and tradition.",
    pick: (a) => /india/i.test(a.location),
  },
  {
    id: "new-media",
    title: "Light & Code",
    tagline: "Digital and photographic works",
    story:
      "Generative prints and fine-art photography. Work made with algorithms, lenses and a patient eye.",
    pick: (a) => ["digital", "photography"].includes(a.category),
  },
  {
    id: "texture",
    title: "Texture & Thread",
    tagline: "Woven, stitched and carved surfaces",
    story:
      "Tapestries, embroidery and carved wood. Work you want to move closer to, and almost touch.",
    pick: (a) => a.category === "textile" || /wood/i.test(a.medium),
  },
].map((c) => ({ ...c, items: ARTWORKS.filter(c.pick) }));

const EASE = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
};

const hideBroken = (e) => {
  e.currentTarget.style.display = "none";
};
const inr = (n) => `₹${n.toLocaleString("en-IN")}`;

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E";

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');

      @keyframes marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-100%); }
      }
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
      @keyframes slowSpin {
        to { transform: rotate(360deg); }
      }
      @keyframes gradientShift {
        0%,100% { background-position: 0% 50%; }
        50%     { background-position: 100% 50%; }
      }

      .marquee-track { animation: marquee 42s linear infinite; }
      .marquee-wrap:hover .marquee-track { animation-play-state: paused; }

      .floaty { animation: floaty 6s ease-in-out infinite; }
      .slow-spin { animation: slowSpin 26s linear infinite; }

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

      .mask-fade-x {
        mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
      }

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

function Aurora({ tint = "#c2603a" }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full blur-[110px]"
        style={{ background: `radial-gradient(circle at 35% 35%, ${tint}55, transparent 70%)` }}
        animate={{ x: [0, 80, -30, 0], y: [0, 50, -30, 0], scale: [1, 1.15, 0.92, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-28 top-4 h-[30rem] w-[30rem] rounded-full blur-[115px]"
        style={{ background: "radial-gradient(circle at 60% 40%, rgba(217,164,65,.42), transparent 70%)" }}
        animate={{ x: [0, -70, 40, 0], y: [0, 60, -40, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-44 h-[28rem] w-[28rem] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(109,91,208,.32), transparent 70%)" }}
        animate={{ x: [0, 50, -50, 0], y: [0, -50, 40, 0], scale: [1, 1.1, 1.05, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Marquee({ items }) {
  const Row = ({ hidden }) => (
    <div
      aria-hidden={hidden}
      className="marquee-track flex shrink-0 items-center gap-10 pr-10"
    >
      {items.map((t) => {
        const Icon = t.icon;
        return (
          <span
            key={t.label}
            className="flex items-center gap-2.5 whitespace-nowrap text-[12.5px] font-medium uppercase tracking-[0.22em]"
            style={{ color: t.color }}
          >
            <Icon size={13} />
            {t.label}
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

function CollectionCard({ collection, onOpen, index }) {
  const ref = useRef(null);
  const theme = themeOf(collection.id);
  const Icon = theme.icon;

  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${mx}px ${my}px, ${theme.color}33, transparent 70%)`;

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 260, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 260, damping: 22 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
    rotateY.set((px - 0.5) * 10);
    rotateX.set((0.5 - py) * 10);
  };

  const handleLeave = () => {
    mx.set(-400);
    my.set(-400);
    rotateX.set(0);
    rotateY.set(0);
  };

  const previews = collection.items.slice(0, 3);

  return (
    <motion.div
      variants={item}
      style={{ perspective: 1200 }}
      className="[&:nth-child(3n+2)]:lg:translate-y-6 [&:nth-child(3n)]:lg:translate-y-3"
    >
      <motion.button
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={() => onOpen(collection.id)}
        style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
        whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 22 } }}
        whileTap={{ scale: 0.985 }}
        className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-stone-900 text-left shadow-[0_20px_60px_-30px_rgba(28,25,23,.65)] transition-shadow duration-500 hover:shadow-[0_40px_90px_-30px_rgba(28,25,23,.85)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {previews[0] && (
          <motion.img
            src={previews[0].img}
            alt=""
            loading="lazy"
            onError={hideBroken}
            style={{ y: imgY }}
            className="absolute inset-0 h-[116%] w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.09]"
          />
        )}

        {previews.slice(1).map((p, i) => (
          <motion.img
            key={p.id}
            src={p.img}
            alt=""
            loading="lazy"
            onError={hideBroken}
            initial={false}
            className="absolute right-4 rounded-xl object-cover shadow-2xl ring-2 ring-white/25 transition-all duration-500"
            style={{
              width: 58,
              height: 74,
              bottom: 108 + i * 60,
              transform: `rotate(${i % 2 === 0 ? 6 : -5}deg)`,
              zIndex: 3 - i,
              opacity: 0,
            }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent" />

        <div
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: theme.grad }}
        />

        <motion.div
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div
          className="absolute left-5 right-5 top-5 flex items-center justify-between"
          style={{ transform: "translateZ(30px)" }}
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-full backdrop-blur-md"
            style={{ background: `${theme.soft}dd`, color: theme.color }}
          >
            <Icon size={15} />
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/12 px-3 py-1 text-[11.5px] font-medium text-white backdrop-blur-md">
            <Layers size={12} />
            {collection.items.length} works
          </span>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 p-6 text-white"
          style={{ transform: "translateZ(45px)" }}
        >
          <h2 className="font-['Playfair_Display',serif] text-[25px] leading-tight drop-shadow-lg">
            {collection.title}
          </h2>
          <p className="mt-1.5 text-[13.5px] leading-snug text-stone-200/90">
            {collection.tagline}
          </p>

          <span
            className="mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold backdrop-blur-md transition-all duration-300"
            style={{
              background: `${theme.color}dd`,
              color: "#fff",
              boxShadow: `0 10px 24px -12px ${theme.color}`,
            }}
          >
            Explore
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>

        <span
          className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px ${theme.color}66` }}
        />
      </motion.button>
    </motion.div>
  );
}

function ArtworkCard({ artwork, theme, index }) {
  const ref = useRef(null);
  const [saved, setSaved] = useState(false);
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, ${theme.color}26, transparent 72%)`;

  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const handleLeave = () => {
    mx.set(-300);
    my.set(-300);
  };

  return (
    <motion.div
      ref={ref}
      layout
      variants={item}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group relative"
    >
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <Link
          to={`/artwork/${artwork.id}`}
          className="relative block overflow-hidden rounded-[24px] border border-stone-200/80 bg-white/85 backdrop-blur-sm shadow-[0_1px_2px_rgba(28,25,23,.05)] transition-shadow duration-500 hover:shadow-[0_30px_70px_-30px_rgba(28,25,23,.5)]"
        >
          <span
            className="absolute inset-x-0 top-0 z-20 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
            style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}00)` }}
          />

          <motion.div
            style={{ background: spotlight }}
            className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          <div className="relative aspect-[4/5] overflow-hidden bg-stone-200">
            <img
              src={artwork.img}
              alt={artwork.title}
              loading="lazy"
              onError={hideBroken}
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

            <span
              className="absolute left-3.5 top-3.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md"
              style={{ background: `${theme.soft}e6`, color: theme.color }}
            >
              {CATEGORY_LABELS[artwork.category] || artwork.category}
            </span>

            <button
              type="button"
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSaved((s) => !s);
              }}
              className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-stone-600 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:text-rose-500"
            >
              <Heart
                size={14}
                fill={saved ? "#f43f5e" : "none"}
                color={saved ? "#f43f5e" : "currentColor"}
                strokeWidth={2}
              />
            </button>

            <span className="absolute bottom-3.5 right-3.5 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Eye size={11} /> View
            </span>
          </div>

          <div className="relative z-10 p-5">
            <h3 className="font-['Playfair_Display',serif] text-[18.5px] leading-snug text-stone-900 transition-colors duration-300 group-hover:text-[#a65335]">
              {artwork.title}
            </h3>
            <p className="mt-1 text-[13px] text-stone-600">
              {artwork.artist} · {artwork.location}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[12.5px] text-stone-500">
              {artwork.medium} · {artwork.dims}
            </p>

            <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-stone-200 pt-3.5">
              <span className="font-['Playfair_Display',serif] text-[17px] font-semibold text-stone-900">
                {inr(artwork.value)}
              </span>
              <span
                className="inline-flex items-center gap-1 text-[12px] font-medium opacity-0 transition-all duration-300 group-hover:opacity-100"
                style={{ color: theme.color }}
              >
                Details
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function CollectionDetail({ collection, onBack }) {
  const theme = themeOf(collection.id);
  const Icon = theme.icon;
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(null);

  const prices = useMemo(() => collection.items.map((a) => a.value), [collection]);
  const priceCeiling = Math.max(0, ...prices);
  const priceFloor = Math.min(0, ...prices);

  const visible = useMemo(() => {
    let list = [...collection.items];
    if (maxPrice != null) list = list.filter((a) => a.value <= maxPrice);
    if (sort === "low") list.sort((a, b) => a.value - b.value);
    else if (sort === "high") list.sort((a, b) => b.value - a.value);
    return list;
  }, [collection, sort, maxPrice]);

  return (
    <motion.div
      key={collection.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div
        ref={heroRef}
        className="relative mb-10 overflow-hidden rounded-[32px] bg-stone-900 text-white"
      >
        {collection.items[0] && (
          <motion.div
            style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
            className="absolute inset-0"
          >
            <img
              src={collection.items[0].img}
              alt=""
              onError={hideBroken}
              className="h-full w-full object-cover"
            />
          </motion.div>
        )}

        <div
          className="absolute inset-0 opacity-70 mix-blend-multiply animated-gradient"
          style={{ background: theme.grad }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-20">
          <motion.button
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={onBack}
            className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-md transition-all hover:bg-white/20"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            All collections
          </motion.button>

          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
            className="mt-8 grid h-14 w-14 place-items-center rounded-2xl border border-white/25 bg-white/12 backdrop-blur-md"
          >
            <Icon size={24} className="text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.6, ease: EASE }}
            className="mt-5 max-w-2xl font-['Playfair_Display',serif] text-[34px] leading-[1.08] sm:text-[52px]"
          >
            {collection.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.6 }}
            className="mt-3 text-[15.5px] font-medium text-amber-300"
          >
            {collection.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46, duration: 0.6 }}
            className="mt-5 max-w-2xl text-[15px] leading-relaxed text-stone-200"
          >
            {collection.story}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.58, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-[12.5px]"
          >
            <span className="flex items-baseline gap-2">
              <span className="font-['Playfair_Display',serif] text-[22px] font-semibold">
                {collection.items.length}
              </span>
              <span className="uppercase tracking-[0.14em] text-stone-300">Works</span>
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-['Playfair_Display',serif] text-[22px] font-semibold">
                {inr(priceFloor)} – {inr(priceCeiling)}
              </span>
              <span className="uppercase tracking-[0.14em] text-stone-300">Range</span>
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-['Playfair_Display',serif] text-[22px] font-semibold">
                {new Set(collection.items.map((a) => a.artist)).size}
              </span>
              <span className="uppercase tracking-[0.14em] text-stone-300">Artists</span>
            </span>
          </motion.div>
        </div>
      </div>

      {collection.items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-[12.5px] text-stone-500">
            <Filter size={14} />
            <span>Showing {visible.length} of {collection.items.length}</span>
          </div>

          <div className="no-bar flex items-center gap-2 overflow-x-auto">
            {[
              { k: "featured", l: "Featured" },
              { k: "low", l: "Price ↑" },
              { k: "high", l: "Price ↓" },
            ].map((s) => (
              <button
                key={s.k}
                onClick={() => setSort(s.k)}
                className="relative rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
              >
                {sort === s.k && (
                  <motion.span
                    layoutId="sort-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: theme.color }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className={sort === s.k ? "relative text-white" : "relative text-stone-700 hover:text-[#a65335]"}>
                  {s.l}
                </span>
              </button>
            ))}

            <span className="mx-1 h-5 w-px bg-stone-200" />

            <button
              onClick={() =>
                setMaxPrice((p) =>
                  p == null ? Math.round(priceCeiling / 2) : null
                )
              }
              className="rounded-full border border-stone-300 px-3.5 py-1.5 text-[12.5px] font-medium text-stone-700 transition-colors hover:border-[#c2603a] hover:text-[#a65335]"
            >
              {maxPrice == null ? "Budget" : `≤ ${inr(maxPrice)}`}
            </button>
          </div>
        </motion.div>
      )}

      {visible.length ? (
        <motion.div
          key={`${collection.id}-${sort}-${maxPrice}`}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((a, i) => (
            <ArtworkCard key={a.id} artwork={a} theme={theme} index={i} />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative grid h-16 w-16 place-items-center rounded-full bg-white shadow-lg">
            <span
              className="absolute inset-0 rounded-full"
              style={{ border: `1px solid ${theme.color}55`, animation: "ringPulse 2.4s ease-out infinite" }}
            />
            <Layers size={22} style={{ color: theme.color }} />
          </div>
          <p className="mt-5 font-['Playfair_Display',serif] text-[20px] text-stone-800">
            No works match these filters
          </p>
          <button
            onClick={() => {
              setMaxPrice(null);
              setSort("featured");
            }}
            className="mt-4 rounded-full bg-[#a65335] px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#8d452c]"
          >
            Reset filters
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function Collections() {
  const [openId, setOpenId] = useState(null);
  const open = COLLECTIONS.find((c) => c.id === openId);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openCollection = (id) => {
    setOpenId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeCollection = () => {
    setOpenId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const marqueeItems = COLLECTIONS.map((c) => {
    const t = themeOf(c.id);
    return { label: c.title, color: t.color, icon: t.icon };
  });

  const totalWorks = COLLECTIONS.reduce((n, c) => n + c.items.length, 0);

  const TITLE_WORDS = "Art, gathered around an idea".split(" ");

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

      <AnimatePresence mode="wait">
        {!open && (
          <motion.section
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden px-6 pb-14 pt-24"
          >
            <Aurora tint={open ? themeOf(open.id).color : "#c2603a"} />

            <div className="relative mx-auto max-w-3xl text-center">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c2603a]/25 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a65335] backdrop-blur-sm"
              >
                <motion.span
                  animate={{ rotate: [0, 18, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles size={13} />
                </motion.span>
                Curated Collections
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
                      className={`mr-[0.28em] inline-block ${isTail ? "text-gradient italic" : ""}`}
                      initial={{ opacity: 0, y: 30, rotateX: -55 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.65, ease: EASE }}
                    >
                      {w}
                    </motion.span>
                  );
                })}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-stone-600"
              >
                Our curators group original works by theme, material and mood,
                so you can browse by feeling instead of scrolling endlessly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mt-9 flex flex-wrap items-center justify-center gap-x-9 gap-y-3 text-[12px] text-stone-500"
              >
                {[
                  { n: COLLECTIONS.length, l: "Collections" },
                  { n: totalWorks, l: "Works" },
                  {
                    n: new Set(COLLECTIONS.flatMap((c) => c.items.map((a) => a.artist)))
                      .size,
                    l: "Artists",
                  },
                ].map((s) => (
                  <span key={s.l} className="flex items-baseline gap-1.5">
                    <span className="font-['Playfair_Display',serif] text-[22px] font-semibold text-stone-800">
                      {s.n}
                    </span>
                    <span className="uppercase tracking-[0.14em]">{s.l}</span>
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!open && <Marquee items={marqueeItems} />}

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 py-14">
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div
              key="list"
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
            >
              {COLLECTIONS.map((c, i) => (
                <CollectionCard
                  key={c.id}
                  collection={c}
                  onOpen={openCollection}
                  index={i}
                />
              ))}
            </motion.div>
          ) : (
            <CollectionDetail
              key={open.id}
              collection={open}
              onBack={closeCollection}
            />
          )}
        </AnimatePresence>
      </div>

      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -left-20 top-0 h-80 w-80 rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle, rgba(194,96,58,.55), transparent 70%)" }}
            animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-20 bottom-0 h-80 w-80 rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle, rgba(109,91,208,.45), transparent 70%)" }}
            animate={{ x: [0, -50, 0], y: [0, -35, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative mx-auto max-w-[640px] px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="floaty mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-400/30"
          >
            <Sparkles className="text-amber-400" size={26} />
          </motion.div>

          <h2 className="mt-6 font-['Playfair_Display',serif] text-[30px] leading-tight sm:text-[38px]">
            Can't find what you imagine?
          </h2>
          <p className="mt-3 text-[14.5px] text-stone-300">
            Commission an artist to create a piece made just for you.
          </p>

          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="mt-8 inline-block"
          >
            <Link
              to="/custom-art"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#c2603a] to-[#a65335] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_16px_36px_-16px_rgba(194,96,58,1)] transition-shadow hover:shadow-[0_22px_46px_-16px_rgba(194,96,58,1)]"
            >
              <span className="relative">Request custom art</span>
              <ArrowRight size={16} className="relative transition-transform group-hover:translate-x-1" />

              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
                style={{
                  background:
                    "linear-gradient(110deg, transparent 30%, rgba(255,255,255,.35), transparent 70%)",
                }}
              />
            </Link>
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