import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
  Search,
  X,
  Heart,
  ArrowRight,
  ArrowUp,
  Sparkles,
  Grid3x3,
  LayoutGrid,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Maximize2,
  Copy,
  Check,
  Palette,
  Command,
} from "lucide-react";
import { ARTWORKS, CATEGORY_LABELS } from "../../data/artworks";

const ALLOWED = ["painting", "sculpture"];

const CAT_META = {
  painting:  { color: "#c2603a", soft: "#fbeee7" },
  sculpture: { color: "#b07d1a", soft: "#fdf3de" },
};

const metaOf = (cat) => {
  const key = String(cat || "").toLowerCase();
  const found = Object.keys(CAT_META).find((k) => key.startsWith(k));
  return found ? CAT_META[found] : { color: "#a65335", soft: "#fbeee7" };
};

const ALLOWED_ARTWORKS = ARTWORKS.filter((a) =>
  ALLOWED.some((k) => String(a.category || "").toLowerCase().startsWith(k))
);

const ALLOWED_LABELS = Object.fromEntries(
  Object.entries(CATEGORY_LABELS).filter(([k]) =>
    ALLOWED.some((a) => String(k).toLowerCase().startsWith(a))
  )
);

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
      .marquee-track { animation: marquee 60s linear infinite; }
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

      .columns-gallery { column-gap: 1.25rem; }
      .columns-gallery > * { break-inside: avoid; }

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

function ArtistMarquee({ artists }) {
  const Row = ({ hidden }) => (
    <div aria-hidden={hidden} className="marquee-track flex shrink-0 items-center gap-10 pr-10">
      {artists.map((a, i) => (
        <span
          key={a + i}
          className="flex items-center gap-2.5 whitespace-nowrap font-['Playfair_Display',serif] text-[13px] italic text-stone-500"
        >
          <Sparkles size={11} className="text-[#c2603a]" />
          {a}
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee-wrap mask-fade-x relative flex overflow-hidden border-y border-stone-200/70 bg-white/50 py-3 backdrop-blur-sm">
      <Row />
      <Row hidden />
    </div>
  );
}

function ArtworkCard({ art, index, view, onOpen, isSaved, onToggleSave }) {
  const ref = useRef(null);
  const meta = metaOf(art.category);

  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, ${meta.color}26, transparent 72%)`;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 20 });
  const sry = useSpring(ry, { stiffness: 220, damping: 20 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
    if (view === "grid") {
      ry.set((px - 0.5) * 8);
      rx.set((0.5 - py) * 8);
    }
  };
  const onLeave = () => {
    mx.set(-300);
    my.set(-300);
    rx.set(0);
    ry.set(0);
  };

  const aspect = useMemo(() => {
    const opts = ["3/4", "4/5", "1/1", "3/4", "4/5"];
    return opts[index % opts.length];
  }, [index]);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96, transition: { duration: 0.25 } }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.04, 0.5),
        ease: EASE,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        view === "grid"
          ? { perspective: 1200, transformStyle: "preserve-3d" }
          : undefined
      }
      className={view === "masonry" ? "mb-5" : ""}
    >
      <motion.button
        type="button"
        onClick={() => onOpen(index)}
        style={
          view === "grid"
            ? { rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }
            : undefined
        }
        whileHover={{ y: -6, transition: { type: "spring", stiffness: 320, damping: 22 } }}
        whileTap={{ scale: 0.99 }}
        className="group relative block w-full overflow-hidden rounded-2xl bg-stone-900 text-left shadow-[0_20px_40px_-25px_rgba(28,25,23,.5)] transition-shadow duration-500 hover:shadow-[0_40px_80px_-30px_rgba(28,25,23,.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c2603a]"
      >
        <div
          className="relative overflow-hidden bg-stone-200"
          style={{ aspectRatio: view === "grid" ? "4/5" : aspect }}
        >
          <img
            src={art.img}
            alt={`${art.title} by ${art.artist}`}
            loading="lazy"
            decoding="async"
            onError={(e) => (e.currentTarget.style.display = "none")}
            className="h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.08]"
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.35) 40%, transparent 70%)`,
            }}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />

          <motion.div
            style={{ background: spotlight }}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md"
            style={{ background: `${meta.soft}e6`, color: meta.color }}
          >
            {CATEGORY_LABELS[art.category] || art.category}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(art.id);
            }}
            aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-stone-600 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:text-rose-500"
          >
            <Heart
              size={14}
              fill={isSaved ? "#f43f5e" : "none"}
              color={isSaved ? "#f43f5e" : "currentColor"}
              strokeWidth={2}
            />
          </button>

          <span
            className={`absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] font-medium text-white backdrop-blur-md transition-all duration-300 ${
              view === "masonry"
                ? "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                : ""
            }`}
          >
            ₹{art.value.toLocaleString("en-IN")}
          </span>

          <span className="absolute bottom-3 left-3 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Maximize2 size={11} /> View
          </span>
        </div>

        {view === "grid" && (
          <div className="relative z-10 bg-white p-4">
            <h3 className="truncate font-['Playfair_Display',serif] text-[16.5px] leading-snug text-stone-900">
              {art.title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 truncate text-[12.5px] text-stone-500">
              <MapPin size={11} className="shrink-0" />
              {art.artist} · {art.location}
            </p>
          </div>
        )}

        {view === "masonry" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <h3 className="truncate font-['Playfair_Display',serif] text-[18px] leading-snug text-white drop-shadow">
              {art.title}
            </h3>
            <p className="mt-0.5 truncate text-[12.5px] text-white/80">{art.artist}</p>
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}

function Lightbox({ items, index, onClose, onPrev, onNext, isSaved, onToggleSave }) {
  const art = items[index];
  const meta = metaOf(art.category);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setCopied(false);
  }, [index]);

  const share = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}#${art.id}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={art.title}
      className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-xl"
    >
      <div className="absolute left-0 right-0 top-0 z-20 h-[3px] bg-white/10">
        <motion.div
          className="h-full origin-left"
          style={{ background: `linear-gradient(90deg, ${meta.color}, #d9a441)` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: (index + 1) / items.length }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </div>

      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <span className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-md">
          <span style={{ color: meta.color }}>
            <Sparkles size={12} />
          </span>
          {index + 1} / {items.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(art.id);
            }}
            aria-label="Save"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20"
          >
            <Heart
              size={15}
              fill={isSaved ? "#f43f5e" : "none"}
              color={isSaved ? "#f43f5e" : "currentColor"}
            />
          </button>

          <button
            onClick={share}
            aria-label="Copy link"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="ok"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                >
                  <Check size={15} className="text-emerald-400" />
                </motion.span>
              ) : (
                <motion.span
                  key="c"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                >
                  <Copy size={15} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous"
        className="group absolute left-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/25 sm:left-6"
      >
        <ChevronLeft size={22} className="transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next"
        className="group absolute right-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/25 sm:right-6"
      >
        <ChevronRight size={22} className="transition-transform group-hover:translate-x-0.5" />
      </button>

      <div className="absolute inset-0 flex items-center justify-center px-4 py-16 sm:px-16">
        <motion.div
          key={art.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
          className="relative grid max-h-full w-full max-w-[1100px] overflow-hidden rounded-3xl bg-stone-900 shadow-[0_50px_120px_-30px_rgba(0,0,0,.9)] md:grid-cols-[1.5fr_1fr]"
        >
          <div className="relative flex items-center justify-center bg-stone-950 p-2 sm:p-6">
            <div className="relative max-h-[75vh] w-full">
              {!loaded && (
                <div className="grid h-[420px] w-full place-items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/80"
                  />
                </div>
              )}
              <motion.img
                key={art.img}
                src={art.img}
                alt={art.title}
                onLoad={() => setLoaded(true)}
                onError={(e) => (e.currentTarget.style.display = "none")}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: loaded ? 1 : 0, scale: 1 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="mx-auto max-h-[75vh] w-full rounded-xl object-contain"
              />
            </div>
          </div>

          <div className="artnest-scroll max-h-[85vh] overflow-y-auto bg-white p-6 sm:p-8">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em]"
              style={{ background: meta.soft, color: meta.color }}
            >
              {CATEGORY_LABELS[art.category] || art.category}
            </span>

            <h2 className="mt-4 font-['Playfair_Display',serif] text-[26px] leading-tight text-stone-900 sm:text-[32px]">
              {art.title}
            </h2>

            <p className="mt-2 text-[13.5px] text-stone-600">
              <span className="font-medium text-stone-800">{art.artist}</span>
              {" · "}
              {art.location}
            </p>

            <div
              className="my-6 h-px w-full"
              style={{ background: `linear-gradient(90deg, ${meta.color}, transparent)` }}
            />

            <dl className="grid grid-cols-2 gap-4 text-[12.5px]">
              <div>
                <dt className="font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Medium
                </dt>
                <dd className="mt-1 text-stone-800">{art.medium}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Dimensions
                </dt>
                <dd className="mt-1 text-stone-800">{art.dims}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Category
                </dt>
                <dd className="mt-1 text-stone-800">
                  {CATEGORY_LABELS[art.category] || art.category}
                </dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Location
                </dt>
                <dd className="mt-1 text-stone-800">{art.location}</dd>
              </div>
            </dl>

            <div className="mt-7 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Price
              </p>
              <p className="mt-1 font-['Playfair_Display',serif] text-[26px] font-semibold text-stone-900">
                ₹{art.value.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-[12px] text-stone-500">
                Inclusive of GST. Shipping calculated at checkout.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/artwork/${art.id}`}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c2603a] to-[#a65335] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_16px_36px_-16px_rgba(194,96,58,1)]"
                >
                  View full listing
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(art.id);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-[13.5px] font-medium text-stone-700 transition-colors hover:border-rose-300 hover:text-rose-500"
              >
                <Heart
                  size={14}
                  fill={isSaved ? "#f43f5e" : "none"}
                  color={isSaved ? "#f43f5e" : "currentColor"}
                />
                {isSaved ? "Saved to wishlist" : "Add to wishlist"}
              </button>
            </div>

            {items.length > 1 && (
              <div className="mt-8 border-t border-stone-200 pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Nearby works
                </p>
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1 no-bar">
                  {items
                    .filter((_, i) => i !== index)
                    .slice(0, 5)
                    .map((r) => {
                      const rm = metaOf(r.category);
                      return (
                        <button
                          key={r.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onNext();
                          }}
                          className="group shrink-0"
                          aria-label={`Go to ${r.title}`}
                        >
                          <span
                            className="block h-16 w-16 overflow-hidden rounded-xl border bg-stone-200 transition-transform duration-300 group-hover:scale-105"
                            style={{ borderColor: `${rm.color}33` }}
                          >
                            <img
                              src={r.img}
                              alt=""
                              loading="lazy"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                              className="h-full w-full object-cover"
                            />
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-4 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur-md sm:flex">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-white/25 px-1.5 py-0.5 text-[10px]">←</kbd>
          <kbd className="rounded border border-white/25 px-1.5 py-0.5 text-[10px]">→</kbd>
          navigate
        </span>
        <span className="h-3 w-px bg-white/20" />
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-white/25 px-1.5 py-0.5 text-[10px]">Esc</kbd>
          close
        </span>
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState("masonry");
  const [active, setActive] = useState(null);
  const [saved, setSaved] = useState([]);
  const [showTop, setShowTop] = useState(false);
  const searchRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = ALLOWED_ARTWORKS.filter((a) => {
      const catOk =
        category === "all" ||
        String(a.category || "").toLowerCase().startsWith(category.toLowerCase());
      const qOk =
        !q ||
        String(a.title || "").toLowerCase().includes(q) ||
        String(a.artist || "").toLowerCase().includes(q) ||
        String(a.location || "").toLowerCase().includes(q) ||
        String(a.medium || "").toLowerCase().includes(q);
      return catOk && qOk;
    });

    if (sort === "low") list = [...list].sort((a, b) => a.value - b.value);
    else if (sort === "high") list = [...list].sort((a, b) => b.value - a.value);
    else if (sort === "recent") list = [...list].reverse();

    return list;
  }, [category, query, sort]);

  const art = active === null ? null : items[active];

  const counts = useMemo(() => {
    const c = { all: ALLOWED_ARTWORKS.length };
    Object.keys(ALLOWED_LABELS).forEach((k) => {
      c[k] = ALLOWED_ARTWORKS.filter((a) =>
        String(a.category || "").toLowerCase().startsWith(k.toLowerCase())
      ).length;
    });
    return c;
  }, []);

  const allArtists = useMemo(
    () => [...new Set(ALLOWED_ARTWORKS.map((a) => a.artist))].slice(0, 18),
    []
  );

  const stats = useMemo(() => {
    const artists = new Set(ALLOWED_ARTWORKS.map((a) => a.artist)).size;
    const places = new Set(ALLOWED_ARTWORKS.map((a) => a.location)).size;
    return { works: ALLOWED_ARTWORKS.length, artists, places };
  }, []);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight")
        setActive((i) => (i === null ? 0 : (i + 1) % items.length));
      if (e.key === "ArrowLeft")
        setActive((i) => (i === null ? 0 : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, items.length]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleSave = useCallback((id) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const openAt = (i) => setActive(i);
  const closeLightbox = () => setActive(null);
  const prevArt = () => setActive((i) => (i === null ? 0 : (i - 1 + items.length) % items.length));
  const nextArt = () => setActive((i) => (i === null ? 0 : (i + 1) % items.length));

  const TITLE_WORDS = "The Gallery".split(" ");

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
              <Palette size={13} />
            </motion.span>
            Original works · {stats.works} pieces
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
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-stone-600"
          >
            Browse {stats.works} original works from {stats.artists} independent artists
            across {stats.places} cities. Select any piece to see it up close.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6, ease: EASE }}
            className="relative mx-auto mt-9 max-w-md"
          >
            <div className="group flex items-center gap-2.5 rounded-full border border-stone-300/90 bg-white/90 px-5 py-3 shadow-[0_10px_30px_-18px_rgba(28,25,23,.35)] backdrop-blur transition-all duration-300 focus-within:border-[#c2603a] focus-within:shadow-[0_16px_40px_-18px_rgba(194,96,58,.55)]">
              <Search
                size={16}
                className="shrink-0 text-stone-400 transition-colors group-focus-within:text-[#c2603a]"
              />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, artist, city…"
                aria-label="Search artworks"
                className="w-full bg-transparent text-[14px] text-stone-800 outline-none placeholder:text-stone-400"
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-stone-200 text-stone-600 transition-colors hover:bg-stone-300"
                  >
                    <X size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
              <span className="hidden shrink-0 items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10.5px] font-medium text-stone-400 sm:flex">
                <Command size={10} />K
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] text-stone-500"
          >
            {[
              { n: stats.works, l: "Works" },
              { n: stats.artists, l: "Artists" },
              { n: stats.places, l: "Cities" },
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
      </section>

      <ArtistMarquee artists={allArtists} />

      <div className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#faf7f2]/85 backdrop-blur-md">
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-bar flex flex-1 flex-wrap items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setCategory("all")}
                className="relative rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
              >
                {category === "all" && (
                  <motion.span
                    layoutId="gallery-cat"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#c2603a] to-[#a65335] shadow-[0_8px_20px_-10px_rgba(194,96,58,.9)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={`relative flex items-center gap-1.5 ${
                    category === "all" ? "text-white" : "text-stone-700 hover:text-[#a65335]"
                  }`}
                >
                  All
                  <span
                    className={`rounded-full px-1.5 py-[1px] text-[10px] font-semibold ${
                      category === "all"
                        ? "bg-white/25 text-white"
                        : "bg-stone-200/80 text-stone-500"
                    }`}
                  >
                    {counts.all}
                  </span>
                </span>
              </button>

              {Object.entries(ALLOWED_LABELS).map(([id, label]) => {
                const meta = metaOf(id);
                const isActive =
                  category !== "all" &&
                  category.toLowerCase() === id.toLowerCase();
                return (
                  <button
                    key={id}
                    onClick={() => setCategory(id)}
                    className="relative rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="gallery-cat"
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
                      {label}
                      <span
                        className={`rounded-full px-1.5 py-[1px] text-[10px] font-semibold ${
                          isActive
                            ? "bg-white/25 text-white"
                            : "bg-stone-200/80 text-stone-500"
                        }`}
                      >
                        {counts[id] ?? 0}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort artworks"
                  className="cursor-pointer appearance-none rounded-full border border-stone-300 bg-white/90 py-1.5 pl-3.5 pr-9 text-[12.5px] font-medium text-stone-700 outline-none transition-colors hover:border-[#c2603a] focus:border-[#c2603a]"
                >
                  <option value="featured">Featured</option>
                  <option value="recent">Newest</option>
                  <option value="low">Price ↑</option>
                  <option value="high">Price ↓</option>
                </select>
                <SlidersHorizontal
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
              </div>

              <div className="flex items-center gap-0.5 rounded-full border border-stone-300 bg-white/90 p-0.5">
                {[
                  { k: "masonry", Icon: LayoutGrid, label: "Masonry" },
                  { k: "grid", Icon: Grid3x3, label: "Grid" },
                ].map(({ k, Icon, label }) => {
                  const isActive = view === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setView(k)}
                      aria-label={label}
                      aria-pressed={isActive}
                      className="relative grid h-7 w-7 place-items-center rounded-full transition-colors"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="view-pill"
                          className="absolute inset-0 rounded-full bg-stone-900"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <Icon
                        size={13}
                        className={`relative ${isActive ? "text-white" : "text-stone-500"}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[12px] text-stone-500">
            <span>
              <span className="font-medium text-stone-800">{items.length}</span>{" "}
              {items.length === 1 ? "work" : "works"}
              {category !== "all" && (
                <> in <span className="font-medium text-stone-800">{ALLOWED_LABELS[category]}</span></>
              )}
              {query && (
                <> matching <span className="font-medium text-stone-800">“{query}”</span></>
              )}
            </span>
            {saved.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Heart size={12} fill="#f43f5e" color="#f43f5e" />
                {saved.length} saved
              </span>
            )}
          </div>
        </div>
      </div>

      <section className="relative z-10 mx-auto max-w-[1400px] px-6 py-10">
        <AnimatePresence mode="wait">
          {items.length ? (
            <motion.div
              key={`${category}-${query}-${sort}-${view}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className={
                view === "masonry"
                  ? "columns-gallery columns-1 sm:columns-2 lg:columns-3 xl:columns-4"
                  : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }
            >
              {items.map((a, i) => (
                <ArtworkCard
                  key={a.id}
                  art={a}
                  index={i}
                  view={view}
                  onOpen={openAt}
                  isSaved={saved.includes(a.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative grid h-20 w-20 place-items-center rounded-full bg-white shadow-[0_18px_40px_-20px_rgba(28,25,23,.4)]"
              >
                <span
                  className="absolute inset-0 rounded-full border border-[#c2603a]/30"
                  style={{ animation: "ringPulse 2.4s ease-out infinite" }}
                />
                <Search size={26} className="text-[#c2603a]" />
              </motion.div>
              <h3 className="mt-6 font-['Playfair_Display',serif] text-[22px] text-stone-800">
                Nothing matches
              </h3>
              <p className="mt-2 max-w-sm text-[14px] text-stone-500">
                Try a different keyword, or clear filters to see everything.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setSort("featured");
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#a65335] px-5 py-2.5 text-[13.5px] font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#8d452c]"
              >
                Reset filters
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

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
            Not what you had in mind?
          </h2>
          <p className="mt-3 text-[14.5px] text-stone-300">
            Commission a piece that's made only for you, from a brief to your walls.
          </p>

          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 inline-block"
          >
            <Link
              to="/custom-art"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#c2603a] to-[#a65335] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_16px_36px_-16px_rgba(194,96,58,1)]"
            >
              Request custom art
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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

      <AnimatePresence>
        {art && (
          <Lightbox
            key={art.id}
            items={items}
            index={active}
            onClose={closeLightbox}
            onPrev={prevArt}
            onNext={nextArt}
            isSaved={saved.includes(art.id)}
            onToggleSave={toggleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}