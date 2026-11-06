import { useMemo, useState, useEffect, useRef } from "react";
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
  Search,
  Clock,
  ArrowRight,
  X,
  Mail,
  CheckCircle2,
  Sparkles,
  Bookmark,
  Share2,
  ArrowUp,
  Command,
  TrendingUp,
  Copy,
  Check,
  Quote,
} from "lucide-react";

const IMG = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const CATEGORY_META = {
  Collecting: { color: "#c2603a", soft: "#fbeee7" },
  Techniques: { color: "#6d5bd0", soft: "#efedfc" },
  "Care & Framing": { color: "#3f8a68", soft: "#e9f4ee" },
  "Artist Stories": { color: "#b07d1a", soft: "#fbf2df" },
};
const metaFor = (c) =>
  CATEGORY_META[c] || { color: "#a65335", soft: "#fbeee7" };

const POSTS = [
  {
    id: "collecting-101",
    category: "Collecting",
    title: "How to Start Your Art Collection on Any Budget",
    excerpt:
      "You don't need a gallery budget to own original work. Here's how new collectors begin with confidence.",
    author: "Meera Kulkarni",
    date: "Sep 28, 2026",
    read: 6,
    image: IMG("photo-1541961017774-22349e4a1262", 1200),
    body: [
      "Collecting starts with looking. Spend time with work you love before you spend money: visit studios, follow artists, and notice which pieces you keep coming back to.",
      "Original prints, small paintings and ceramics are great entry points. Many independent artists offer originals at accessible prices, and buying directly means your money supports the maker.",
      "Always ask for a certificate of authenticity, check the medium and dimensions, and think about where the piece will hang. Buy what moves you, not what you think will appreciate.",
      "Start small, stay curious, and let your taste develop. A collection is simply a record of what mattered to you over time.",
    ],
  },
  {
    id: "oil-vs-acrylic",
    category: "Techniques",
    title: "Oil vs Acrylic: What Actually Changes on the Canvas",
    excerpt:
      "Drying time, colour depth and texture: understanding the medium helps you appreciate (and choose) a painting.",
    author: "Rohan Desai",
    date: "Sep 19, 2026",
    read: 5,
    image: IMG("photo-1547826039-bfc35e0f1ea8", 1000),
    body: [
      "Oil paint dries slowly, sometimes over days, which lets artists blend and rework passages. That's why oils often show soft transitions and rich, luminous colour.",
      "Acrylics dry fast and can be layered quickly, making them popular for bold shapes, crisp edges and mixed-media work. They're also more flexible and less prone to yellowing.",
      "Neither is better. Oil rewards patience; acrylic rewards decisiveness. When you view a piece, look at the edges and the blending to guess which one the artist chose.",
    ],
  },
  {
    id: "care-guide",
    category: "Care & Framing",
    title: "Caring for Your Artwork: Light, Humidity and Dust",
    excerpt:
      "Simple habits that keep an original piece looking its best for decades.",
    author: "Ananya Rao",
    date: "Sep 10, 2026",
    read: 4,
    image: IMG("photo-1460661419201-fd4cecdf8a8b", 1000),
    body: [
      "Direct sunlight is the biggest enemy of art. Hang works away from windows, or use UV-protective glazing for paper and watercolour pieces.",
      "Avoid bathrooms and kitchens where humidity swings can warp canvas and cause mould. Dust gently with a soft dry brush, never a damp cloth.",
      "Use acid-free mats and quality framing for works on paper. Good framing is not decoration only; it is protection.",
    ],
  },
  {
    id: "artist-spotlight",
    category: "Artist Stories",
    title: "Inside the Studio: A Day with a Hand-Thrown Ceramicist",
    excerpt:
      "From wedging clay to the kiln opening, the slow craft behind every one-of-a-kind vessel.",
    author: "Artnest Editorial",
    date: "Aug 30, 2026",
    read: 7,
    image: IMG("photo-1493106641515-6b5631de4bb9", 1000),
    body: [
      "The day begins before the wheel: wedging clay to remove air pockets, weighing portions, and setting out tools in the same order, every time.",
      "Throwing a piece takes minutes; drying, trimming, bisque firing, glazing and a final firing can take weeks. Kiln opening is the moment of truth, since glazes can surprise even experienced hands.",
      "That unpredictability is why no two pieces match. Small variations are not flaws; they're the signature of handmade work.",
    ],
  },
  {
    id: "custom-commission",
    category: "Collecting",
    title: "Commissioning Custom Art: A Step-by-Step Guide",
    excerpt:
      "How to brief an artist, set a fair budget and get a piece that feels truly yours.",
    author: "Meera Kulkarni",
    date: "Aug 18, 2026",
    read: 5,
    image: IMG("photo-1518998053901-5348d3961a04", 1000),
    body: [
      "Start with references: colours, moods, spaces, other works you admire. A clear brief saves time and avoids misunderstandings.",
      "Agree on size, medium, timeline and price up front. Most artists ask for a deposit and share progress sketches so you can give feedback early.",
      "Trust the artist's process. The best commissions combine your story with their voice.",
    ],
  },
  {
    id: "colour-theory",
    category: "Techniques",
    title: "Colour Theory for Buyers: Choosing Art That Fits Your Room",
    excerpt:
      "Warm, cool, complementary: a quick visual vocabulary to match art with your space.",
    author: "Rohan Desai",
    date: "Aug 05, 2026",
    read: 4,
    image: IMG("photo-1536924940846-227afb31e2a5", 1000),
    body: [
      "Warm colours (reds, oranges, yellows) advance and energise a room; cool colours (blues, greens) recede and calm it.",
      "Pick one accent from your art and echo it in a cushion or vase for a cohesive look, or choose a contrasting piece for a bold focal point.",
      "Scale matters as much as colour. A large piece over a sofa should be about two-thirds the width of the furniture.",
    ],
  },
];

const CATEGORIES = ["All", ...new Set(POSTS.map((p) => p.category))];

const TOPICS = [
  "Collecting",
  "Oil Painting",
  "Framing",
  "Ceramics",
  "Colour Theory",
  "Commissions",
  "Studio Visits",
  "Conservation",
];

const EASE = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
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
        0%   { transform: scale(.8); opacity: .7; }
        100% { transform: scale(2.1); opacity: 0; }
      }

      .marquee-track {
        animation: marquee 38s linear infinite;
      }
      .marquee-wrap:hover .marquee-track {
        animation-play-state: paused;
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

      .grain-overlay {
        background-image: url("${GRAIN}");
        background-repeat: repeat;
      }

      .artnest-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
      .artnest-scroll::-webkit-scrollbar-track { background: transparent; }
      .artnest-scroll::-webkit-scrollbar-thumb {
        background: rgba(166,83,53,.30);
        border-radius: 999px;
        border: 3px solid transparent;
        background-clip: content-box;
      }
      .artnest-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(166,83,53,.6);
        background-clip: content-box;
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
        className="absolute -left-32 -top-40 h-[32rem] w-[32rem] rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(194,96,58,.45), transparent 68%)",
        }}
        animate={{ x: [0, 70, -30, 0], y: [0, 45, -25, 0], scale: [1, 1.12, 0.94, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-28 top-4 h-[28rem] w-[28rem] rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(217,164,65,.44), transparent 70%)",
        }}
        animate={{ x: [0, -60, 35, 0], y: [0, 55, -35, 0], scale: [1, 1.18, 0.9, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-44 h-[26rem] w-[26rem] rounded-full blur-[120px]"
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

function TopicMarquee() {
  const Row = ({ hidden }) => (
    <div
      aria-hidden={hidden}
      className="marquee-track flex shrink-0 items-center gap-10 pr-10"
    >
      {TOPICS.map((t) => (
        <span
          key={t}
          className="flex items-center gap-3 whitespace-nowrap text-[12.5px] font-medium uppercase tracking-[0.22em] text-stone-400"
        >
          <Sparkles size={12} className="text-[#c2603a]" />
          {t}
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee-wrap relative flex overflow-hidden border-y border-stone-200/70 bg-white/50 py-3.5 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#faf7f2] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#faf7f2] to-transparent" />
      <Row />
      <Row hidden />
    </div>
  );
}

function PostCard({ post, onOpen, isSaved, onToggleSave }) {
  const meta = metaFor(post.category);
  const ref = useRef(null);

  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, ${meta.color}24, transparent 72%)`;

  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <motion.article
      ref={ref}
      layout
      variants={item}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        mx.set(-300);
        my.set(-300);
      }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      onClick={() => onOpen(post)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[26px] border border-stone-200/80 bg-white/85 backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_30px_65px_-30px_rgba(28,25,23,.45)]"
      style={{ boxShadow: "0 1px 2px rgba(28,25,23,.05)" }}
    >
      <span
        className="absolute inset-x-0 top-0 z-20 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
        style={{
          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}00)`,
        }}
      />

      <motion.div
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          decoding="async"
          onError={hideBroken}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.09]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />

        <span
          className="absolute left-3.5 top-3.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md"
          style={{ background: `${meta.soft}e6`, color: meta.color }}
        >
          {post.category}
        </span>

        <button
          aria-label={isSaved ? "Remove bookmark" : "Bookmark article"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(post.id);
          }}
          className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-stone-600 opacity-0 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:text-[#c2603a] group-hover:opacity-100 focus:opacity-100"
        >
          <Bookmark size={14} fill={isSaved ? meta.color : "none"} color={isSaved ? meta.color : "currentColor"} />
        </button>

        <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          <Clock size={11} />
          {post.read} min
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <h3 className="font-['Playfair_Display',serif] text-[19.5px] leading-snug text-stone-900 transition-colors duration-300 group-hover:text-[#a65335]">
          {post.title}
        </h3>
        <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-stone-600">
          {post.excerpt}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-dashed border-stone-200 pt-3.5 text-[11.5px] text-stone-500">
          <span className="truncate">{post.author}</span>
          <span>{post.date}</span>
        </div>

        <span
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium opacity-0 transition-all duration-300 group-hover:opacity-100"
          style={{ color: meta.color }}
        >
          Read article
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </motion.article>
  );
}

function FeaturedCard({ post, onOpen }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1.02]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE }}
      onClick={() => onOpen(post)}
      className="group relative mb-14 grid cursor-pointer overflow-hidden rounded-[32px] bg-stone-900 text-white shadow-[0_40px_80px_-40px_rgba(28,25,23,.7)] md:grid-cols-2"
    >
      <span className="pointer-events-none absolute inset-0 z-30 rounded-[32px] opacity-0 ring-1 ring-inset ring-white/25 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative aspect-[4/3] overflow-hidden bg-stone-800 md:aspect-auto md:min-h-[420px]">
        <motion.img
          src={post.image}
          alt={post.title}
          onError={hideBroken}
          style={{ y, scale }}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-stone-900/10 md:to-stone-900" />
      </div>

      <div className="relative z-10 flex flex-col justify-center p-8 sm:p-11">
        <motion.span
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300"
        >
          <TrendingUp size={12} />
          Featured · {post.category}
        </motion.span>

        <h2 className="mt-4 font-['Playfair_Display',serif] text-[28px] leading-tight sm:text-[36px]">
          {post.title}
        </h2>

        <p className="mt-4 text-[14.5px] leading-relaxed text-stone-300">
          {post.excerpt}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-stone-400">
          <span className="font-medium text-stone-300">{post.author}</span>
          <span className="h-1 w-1 rounded-full bg-stone-600" />
          <span>{post.date}</span>
          <span className="h-1 w-1 rounded-full bg-stone-600" />
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {post.read} min read
          </span>
        </div>

        <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-[13.5px] font-medium text-amber-300 backdrop-blur-sm transition-all duration-300 group-hover:bg-amber-400 group-hover:text-stone-900">
          Read article
          <ArrowRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-1.5"
          />
        </span>
      </div>
    </motion.article>
  );
}

function Reader({ post, onClose, isSaved, onToggleSave, related, onOpenPost }) {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const bar = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  const [copied, setCopied] = useState(false);
  const meta = metaFor(post.category);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [post.id]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const share = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}#${post.id}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
    >
      <motion.div
        style={{ scaleX: bar }}
        className="absolute left-0 right-0 top-0 z-20 h-[3px] origin-left bg-gradient-to-r from-[#c2603a] via-[#d9a441] to-[#6d5bd0]"
      />

      <div
        ref={scrollRef}
        className="artnest-scroll absolute inset-0 overflow-y-auto overscroll-contain px-4 py-10 sm:py-14"
      >
        <div className="flex min-h-full items-start justify-center">
          <motion.article
            initial={{ y: 70, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 250, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[740px] overflow-hidden rounded-[28px] bg-white shadow-[0_50px_100px_-40px_rgba(0,0,0,.8)]"
          >
            <div className="relative aspect-[16/8] overflow-hidden bg-stone-200">
              <motion.img
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: EASE }}
                src={post.image}
                alt={post.title}
                onError={hideBroken}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />

              <span
                className="absolute bottom-4 left-5 rounded-full px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md"
                style={{ background: `${meta.soft}e6`, color: meta.color }}
              >
                {post.category}
              </span>
            </div>

            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(post.id);
                }}
                aria-label="Bookmark"
                className="grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black"
              >
                <Bookmark
                  size={15}
                  fill={isSaved ? "#fbbf24" : "none"}
                  color={isSaved ? "#fbbf24" : "currentColor"}
                />
              </button>

              <button
                onClick={share}
                aria-label="Copy link"
                className="grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black"
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
                      key="copy"
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
                aria-label="Close article"
                className="grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-6 sm:p-11">
              <h2 className="font-['Playfair_Display',serif] text-[30px] leading-[1.15] text-stone-900 sm:text-[40px]">
                {post.title}
              </h2>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-stone-500">
                <span className="font-medium text-stone-700">{post.author}</span>
                <span className="h-1 w-1 rounded-full bg-stone-300" />
                <span>{post.date}</span>
                <span className="h-1 w-1 rounded-full bg-stone-300" />
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} /> {post.read} min read
                </span>
              </div>

              <div
                className="mt-7 h-px w-full"
                style={{
                  background: `linear-gradient(90deg, ${meta.color}, transparent)`,
                }}
              />

              <div className="relative mt-7 space-y-5">
                <Quote
                  size={64}
                  className="pointer-events-none absolute -left-3 -top-6 opacity-[0.05]"
                  style={{ color: meta.color }}
                />
                {post.body.map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + i * 0.09, duration: 0.5, ease: EASE }}
                    className="relative text-[16px] leading-[1.85] text-stone-700"
                  >
                    {i === 0 ? (
                      <>
                        <span
                          className="float-left mr-3 mt-1 font-['Playfair_Display',serif] text-[52px] leading-[0.78]"
                          style={{ color: meta.color }}
                        >
                          {para.charAt(0)}
                        </span>
                        {para.slice(1)}
                      </>
                    ) : (
                      para
                    )}
                  </motion.p>
                ))}
              </div>

              {related.length > 0 && (
                <div className="mt-12 border-t border-stone-200 pt-7">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                    Keep reading
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {related.map((r) => {
                      const rm = metaFor(r.category);
                      return (
                        <button
                          key={r.id}
                          onClick={() => onOpenPost(r)}
                          className="group flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50/60 p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lg"
                          style={{ ["--c"]: rm.color }}
                        >
                          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-200">
                            <img
                              src={r.image}
                              alt=""
                              loading="lazy"
                              onError={hideBroken}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </span>
                          <span className="min-w-0">
                            <span
                              className="block text-[10.5px] font-semibold uppercase tracking-[0.12em]"
                              style={{ color: rm.color }}
                            >
                              {r.category}
                            </span>
                            <span className="mt-0.5 line-clamp-2 block font-['Playfair_Display',serif] text-[14px] leading-snug text-stone-800">
                              {r.title}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.article>
        </div>
      </div>
    </motion.div>
  );
}

export default function Blog() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [saved, setSaved] = useState([]);
  const [showTop, setShowTop] = useState(false);

  const searchRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTS.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q ||
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q))
    );
  }, [category, query]);

  const featured = POSTS[0];
  const showFeatured = category === "All" && !query.trim();
  const grid = showFeatured
    ? filtered.filter((p) => p.id !== featured.id)
    : filtered;

  const toggleSave = (id) =>
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

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

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr("Enter a valid email address.");
      return;
    }
    setEmailErr("");
    setSubscribed(true);
  };

  const relatedFor = (post) => {
    const same = POSTS.filter(
      (p) => p.id !== post.id && p.category === post.category
    );
    const others = POSTS.filter(
      (p) => p.id !== post.id && p.category !== post.category
    );
    return [...same, ...others].slice(0, 2);
  };

  const TITLE_WORDS =
    "Stories, guides and ideas from the world of original art".split(" ");

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
              <Sparkles size={13} />
            </motion.span>
            The Artnest Journal
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
                  transition={{
                    delay: 0.12 + i * 0.055,
                    duration: 0.65,
                    ease: EASE,
                  }}
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
            Collecting tips, technique explainers and artist stories, written to
            help you see and buy art with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: EASE }}
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
                placeholder="Search articles, authors, topics…"
                aria-label="Search articles"
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
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] text-stone-500"
          >
            {[
              { n: `${POSTS.length}`, l: "Articles" },
              { n: "4", l: "Categories" },
              { n: "12k+", l: "Readers" },
            ].map((s) => (
              <span key={s.l} className="flex items-baseline gap-1.5">
                <span className="font-['Playfair_Display',serif] text-[20px] font-semibold text-stone-800">
                  {s.n}
                </span>
                <span className="uppercase tracking-[0.14em]">{s.l}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <TopicMarquee />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 pt-10">
        <div className="no-bar flex flex-wrap justify-center gap-2 overflow-x-auto">
          {CATEGORIES.map((c) => {
            const isActive = category === c;
            const meta = c === "All" ? { color: "#a65335" } : metaFor(c);
            const count =
              c === "All"
                ? POSTS.length
                : POSTS.filter((p) => p.category === c).length;

            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200"
              >
                {isActive && (
                  <motion.span
                    layoutId="cat-pill"
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
                    isActive
                      ? "text-white"
                      : "text-stone-700 hover:text-[#a65335]"
                  }`}
                >
                  {c}
                  <span
                    className={`rounded-full px-1.5 py-[1px] text-[10px] font-semibold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-stone-200/80 text-stone-500"
                    }`}
                  >
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 py-12">
        {showFeatured && (
          <FeaturedCard post={featured} onOpen={setActive} />
        )}

        <AnimatePresence mode="wait">
          {grid.length ? (
            <motion.div
              key={category + query}
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
              className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3"
            >
              {grid.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onOpen={setActive}
                  isSaved={saved.includes(p.id)}
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
              className="flex flex-col items-center justify-center py-20 text-center"
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
                Nothing here yet
              </h3>
              <p className="mt-2 max-w-sm text-[14px] text-stone-500">
                No articles match{" "}
                {query ? <span className="font-medium">“{query}”</span> : "these filters"}.
                Try a different keyword or category.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#a65335] px-5 py-2.5 text-[13.5px] font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#8d452c] hover:shadow-lg"
              >
                Reset filters
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -left-20 top-0 h-80 w-80 rounded-full blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, rgba(194,96,58,.55), transparent 70%)",
            }}
            animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-20 bottom-0 h-80 w-80 rounded-full blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, rgba(109,91,208,.45), transparent 70%)",
            }}
            animate={{ x: [0, -50, 0], y: [0, -35, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative mx-auto max-w-[640px] px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="floaty mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-400/30"
          >
            <Mail className="text-amber-400" size={26} />
          </motion.div>

          <h2 className="mt-6 font-['Playfair_Display',serif] text-[30px] leading-tight sm:text-[38px]">
            Get new stories in your inbox
          </h2>
          <p className="mt-3 text-[14.5px] text-stone-300">
            One thoughtful email a month. No spam, unsubscribe anytime.
          </p>

          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mt-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-emerald-300"
                role="status"
              >
                <span
                  className="absolute inset-0 rounded-full border border-emerald-400/40"
                  style={{ animation: "ringPulse 2.2s ease-out infinite" }}
                />
                <CheckCircle2 size={20} />
                <span className="text-[14.5px] font-medium">
                  You're subscribed. Thank you!
                </span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={subscribe}
                noValidate
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8"
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailErr("");
                    }}
                    placeholder="you@example.com"
                    aria-label="Email address"
                    className={`w-full rounded-xl border bg-white/10 px-4 py-3.5 text-[14px] text-white outline-none backdrop-blur transition-all placeholder:text-stone-400 focus:bg-white/15 ${
                      emailErr
                        ? "border-red-400/70 focus:border-red-400"
                        : "border-white/20 focus:border-amber-400 focus:shadow-[0_0_0_4px_rgba(251,191,36,.12)]"
                    }`}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="shrink-0 rounded-xl bg-gradient-to-r from-[#c2603a] to-[#a65335] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(194,96,58,.9)] transition-shadow hover:shadow-[0_20px_40px_-14px_rgba(194,96,58,1)]"
                  >
                    Subscribe
                  </motion.button>
                </div>
                {emailErr && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-left text-[12.5px] text-red-400"
                  >
                    {emailErr}
                  </motion.p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
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
        {active && (
          <Reader
            key={active.id}
            post={active}
            onClose={() => setActive(null)}
            isSaved={saved.includes(active.id)}
            onToggleSave={toggleSave}
            related={relatedFor(active)}
            onOpenPost={setActive}
          />
        )}
      </AnimatePresence>
    </div>
  );
}