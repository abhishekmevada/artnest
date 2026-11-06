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
  Search,
  X,
  Plus,
  Sparkles,
  ShoppingBag,
  Palette,
  Truck,
  RotateCcw,
  Store,
  CreditCard,
  MessageCircle,
  ArrowRight,
  ArrowUp,
  HelpCircle,
  TrendingUp,
  Command,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  LifeBuoy,
} from "lucide-react";
const CATEGORIES = [
  { id: "all",       label: "All topics",   icon: Sparkles,    color: "#a65335", soft: "#fbeee7" },
  { id: "buying",    label: "Buying",       icon: ShoppingBag, color: "#c2603a", soft: "#fbeee7" },
  { id: "custom",    label: "Custom Art",   icon: Palette,     color: "#d99b2b", soft: "#fdf3de" },
  { id: "shipping",  label: "Shipping",     icon: Truck,       color: "#4a5fc0", soft: "#ebeefc" },
  { id: "returns",   label: "Returns",      icon: RotateCcw,   color: "#3f8a68", soft: "#e9f4ee" },
  { id: "selling",   label: "Selling",      icon: Store,       color: "#6d5bd0", soft: "#efedfc" },
  { id: "account",   label: "Account",      icon: CreditCard,  color: "#a06a3f", soft: "#f4ece2" },
];

const FAQS = [
  {
    id: "buy-1",
    cat: "buying",
    q: "How do I buy an artwork?",
    a: "Open any artwork, add it to your cart and check out. You'll need a buyer account to place an order. Payment is captured at checkout and you'll receive an order confirmation email instantly.",
    popular: true,
  },
  {
    id: "buy-2",
    cat: "buying",
    q: "Are the artworks original or prints?",
    a: "Every listing clearly states whether it's an original, a limited-edition print, or an open-edition reproduction. Originals are one-of-one and ship with a certificate of authenticity signed by the artist.",
    popular: true,
  },
  {
    id: "buy-3",
    cat: "buying",
    q: "Can I reserve an artwork before buying?",
    a: "Yes. If you need 24–48 hours to decide, message the artist from the artwork page and request a short hold. Many artists will happily reserve a piece for a serious buyer.",
  },
  {
    id: "buy-4",
    cat: "buying",
    q: "Do you ship internationally?",
    a: "We ship to over 40 countries. International shipping costs and duties are calculated at checkout based on destination, size and weight. Some large sculptures are India-only.",
  },
  {
    id: "custom-1",
    cat: "custom",
    q: "Can I request a custom piece?",
    a: "Yes. Use the Custom Art page to describe your idea, size and budget. An artist will reply with a quote and a proposed timeline, usually within 2 working days.",
    popular: true,
  },
  {
    id: "custom-2",
    cat: "custom",
    q: "How much does a commission cost?",
    a: "Commissions typically start around ₹5,000 for small works and scale up based on size, medium and complexity. You'll see an exact quote before you pay anything.",
  },
  {
    id: "custom-3",
    cat: "custom",
    q: "Can I see progress during a commission?",
    a: "Most artists share 2–3 progress photos at key stages — sketch, mid-way and near-final. You can request small changes before the final varnish or firing stage.",
  },
  {
    id: "custom-4",
    cat: "custom",
    q: "What if I don't like the final piece?",
    a: "Commission deposits are non-refundable once work begins, but every artist shares previews so you can course-correct early. If something is genuinely wrong, we'll help mediate a fair outcome.",
  },
  {
    id: "ship-1",
    cat: "shipping",
    q: "How long does delivery take?",
    a: "Most orders ship within 5–7 working days. Large sculptures and framed works can take 2–3 weeks because of custom crating. You'll receive tracking as soon as it dispatches.",
    popular: true,
  },
  {
    id: "ship-2",
    cat: "shipping",
    q: "How are artworks packaged?",
    a: "Originals are wrapped in archival glassine or foam, then placed in a rigid custom box with corner protection. Sculptures ship in a wooden crate with foam inserts.",
  },
  {
    id: "ship-3",
    cat: "shipping",
    q: "Can I track my order?",
    a: "Yes. Every shipment comes with a tracking link sent to your email and available in your order dashboard. You'll get updates at dispatch, transit and out-for-delivery stages.",
  },
  {
    id: "ship-4",
    cat: "shipping",
    q: "Do you charge for shipping?",
    a: "Shipping is calculated per order based on weight, size and destination. Orders above ₹25,000 ship free within India.",
  },
  {
    id: "ret-1",
    cat: "returns",
    q: "Can I return an artwork?",
    a: "Ready-made works can be returned within 7 days if they arrive damaged or materially differ from the listing. Commissions and personalised pieces are non-returnable.",
    popular: true,
  },
  {
    id: "ret-2",
    cat: "returns",
    q: "What if my artwork arrives damaged?",
    a: "Photograph the damage and the packaging, then write to us within 48 hours with your order number. We'll arrange a replacement or a full refund — no arguments, no fuss.",
  },
  {
    id: "ret-3",
    cat: "returns",
    q: "Who pays for return shipping?",
    a: "If the piece arrived damaged or was misrepresented, we cover return shipping. For change-of-mind returns, the buyer arranges and pays for insured return shipping.",
  },
  {
    id: "sell-1",
    cat: "selling",
    q: "How do I sell my art on Artnest?",
    a: "Register as an artist, complete your profile, then upload your first artwork from your dashboard. Our curators review every new artist within a few days.",
    popular: true,
  },
  {
    id: "sell-2",
    cat: "selling",
    q: "What commission does Artnest take?",
    a: "We charge a flat 15% platform fee on each sale. There are no listing fees and no monthly charges — you only pay when you sell.",
  },
  {
    id: "sell-3",
    cat: "selling",
    q: "When do artists get paid?",
    a: "Payouts are released 7 days after confirmed delivery, once the buyer's return window closes. Funds land in your linked bank account within 2–3 working days.",
  },
  {
    id: "acc-1",
    cat: "account",
    q: "Do I need an account to browse?",
    a: "No. You can browse every artwork, collection and artist profile without signing in. An account is only required to buy, sell, or message an artist.",
  },
  {
    id: "acc-2",
    cat: "account",
    q: "How do I reset my password?",
    a: "Click 'Forgot password' on the sign-in screen and we'll email you a secure reset link. The link expires in 30 minutes for your safety.",
  },
];

const EASE = [0.22, 1, 0.36, 1];

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
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

function FaqItem({ faq, isOpen, onToggle, index }) {
  const ref = useRef(null);
  const cat = CATEGORIES.find((c) => c.id === faq.cat) || CATEGORIES[1];
  const CatIcon = cat.icon;

  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spotlight = useMotionTemplate`radial-gradient(280px circle at ${mx}px ${my}px, ${cat.color}18, transparent 72%)`;

  const [feedback, setFeedback] = useState(null);

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
      variants={itemVariants}
      layout
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative"
    >
      <motion.span
        initial={false}
        animate={{
          scaleY: isOpen ? 1 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: EASE }}
        className="absolute left-0 top-3 bottom-3 w-[3px] origin-top rounded-full"
        style={{ background: cat.color }}
      />

      <motion.div
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="relative flex w-full items-start justify-between gap-4 px-5 py-5 text-left focus:outline-none sm:px-7"
      >
        <span className="flex flex-1 items-start gap-4">
          <motion.span
            animate={{
              scale: isOpen ? 1.05 : 1,
              rotate: isOpen ? -6 : 0,
            }}
            transition={{ type: "spring", stiffness: 340, damping: 20 }}
            className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl"
            style={{ background: cat.soft, color: cat.color }}
          >
            <CatIcon size={15} />
          </motion.span>

          <span className="flex-1">
            <span
              className={`block text-[15.5px] font-medium leading-snug transition-colors duration-300 ${
                isOpen ? "" : "text-stone-800 group-hover:text-stone-900"
              }`}
              style={isOpen ? { color: cat.color } : {}}
            >
              {faq.q}
            </span>
            {faq.popular && !isOpen && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-amber-600">
                <TrendingUp size={10} />
                Popular
              </span>
            )}
          </span>
        </span>

        <motion.span
          animate={{
            rotate: isOpen ? 135 : 0,
            backgroundColor: isOpen ? cat.color : "rgba(0,0,0,0)",
            color: isOpen ? "#fff" : "#78716c",
            borderColor: isOpen ? cat.color : "#d6d3d1",
          }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border"
        >
          <Plus size={15} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="px-5 pb-6 sm:px-7"
            >
              <div className="ml-13 pl-13 sm:pl-13" style={{ paddingLeft: "3.25rem" }}>
                <p className="text-[14.5px] leading-[1.75] text-stone-600">
                  {faq.a}
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-dashed border-stone-200 pt-4">
                  <AnimatePresence mode="wait" initial={false}>
                    {feedback ? (
                      <motion.p
                        key="thanks"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2 text-[12.5px] font-medium"
                        style={{ color: cat.color }}
                      >
                        <Sparkles size={13} />
                        Thanks for the feedback!
                      </motion.p>
                    ) : (
                      <motion.div
                        key="ask"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[12.5px] text-stone-500">
                          Was this helpful?
                        </span>
                        <button
                          type="button"
                          onClick={() => setFeedback("yes")}
                          className="grid h-7 w-7 place-items-center rounded-full border border-stone-200 text-stone-500 transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-600"
                          aria-label="Yes, helpful"
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeedback("no")}
                          className="grid h-7 w-7 place-items-center rounded-full border border-stone-200 text-stone-500 transition-all hover:-translate-y-0.5 hover:border-rose-400 hover:text-rose-500"
                          aria-label="No, not helpful"
                        >
                          <ThumbsDown size={12} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
function PopularCard({ faq, onOpen, index }) {
  const cat = CATEGORIES.find((c) => c.id === faq.cat) || CATEGORIES[1];
  const Icon = cat.icon;

  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      onClick={onOpen}
      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white/70 p-5 text-left backdrop-blur-sm transition-shadow hover:shadow-[0_25px_50px_-30px_rgba(28,25,23,.5)]"
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${cat.color}, ${cat.color}00)` }}
      />

      <span
        className="inline-grid h-9 w-9 place-items-center rounded-xl"
        style={{ background: cat.soft, color: cat.color }}
      >
        <Icon size={15} />
      </span>

      <h3 className="mt-4 font-['Playfair_Display',serif] text-[16.5px] leading-snug text-stone-800">
        {faq.q}
      </h3>

      <span
        className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ color: cat.color }}
      >
        Read answer
        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </motion.button>
  );
}

export default function FAQ() {
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(FAQS[0].id);
  const [showTop, setShowTop] = useState(false);
  const searchRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const catOk = activeCat === "all" || f.cat === activeCat;
      const qOk = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [activeCat, query]);

  const popular = FAQS.filter((f) => f.popular).slice(0, 3);

  const counts = useMemo(() => {
    const c = { all: FAQS.length };
    CATEGORIES.slice(1).forEach((cat) => {
      c[cat.id] = FAQS.filter((f) => f.cat === cat.id).length;
    });
    return c;
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const openFaq = (id) => {
    const target = FAQS.find((f) => f.id === id);
    if (!target) return;
    setActiveCat("all");
    setQuery("");
    setOpenId(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(`faq-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const TITLE_WORDS = "Questions, answered".split(" ");

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
              <HelpCircle size={13} />
            </motion.span>
            Help Center
          </motion.p>

          <h1
            className="relative font-['Playfair_Display',serif] text-[40px] leading-[1.1] text-stone-900 sm:text-[56px] md:text-[64px]"
            style={{ perspective: 900 }}
          >
            {TITLE_WORDS.map((w, i) => {
              const isTail = i === TITLE_WORDS.length - 1;
              return (
                <motion.span
                  key={i}
                  className={`mr-[0.24em] inline-block ${isTail ? "text-gradient italic" : ""}`}
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
            Buying, commissioning or selling on Artnest? {FAQS.length} answers to the
            questions we hear most.
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
                placeholder="Search FAQs…"
                aria-label="Search FAQs"
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
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-[900px] px-6 pb-8">
        <div className="no-bar flex flex-wrap justify-center gap-2 overflow-x-auto">
          {CATEGORIES.map((c) => {
            const isActive = activeCat === c.id;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCat(c.id);
                  setOpenId(null);
                }}
                className="relative rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors duration-200"
              >
                {isActive && (
                  <motion.span
                    layoutId="faq-cat-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(120deg, ${c.color}, ${c.color}c9)`,
                      boxShadow: `0 8px 22px -10px ${c.color}cc`,
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
                  {c.label}
                  <span
                    className={`rounded-full px-1.5 py-[1px] text-[10px] font-semibold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-stone-200/80 text-stone-500"
                    }`}
                  >
                    {counts[c.id] ?? 0}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {activeCat === "all" && !query.trim() && (
          <motion.section
            key="popular"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative z-10 mx-auto max-w-[1100px] px-6 pb-10"
          >
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-600" />
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                Most asked
              </p>
            </div>

            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {popular.map((f, i) => (
                <PopularCard key={f.id} faq={f} index={i} onOpen={() => openFaq(f.id)} />
              ))}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
      <section className="relative z-10 mx-auto max-w-[900px] px-6 pb-16">
        <motion.div
          layout
          className="overflow-hidden rounded-3xl border border-stone-200 bg-white/70 shadow-[0_25px_60px_-40px_rgba(28,25,23,.35)] backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {filtered.length ? (
              <motion.div
                key={`${activeCat}-${query}`}
                variants={listVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                className="divide-y divide-stone-200/80"
              >
                {filtered.map((f, i) => (
                  <div key={f.id} id={`faq-${f.id}`}>
                    <FaqItem
                      faq={f}
                      index={i}
                      isOpen={openId === f.id}
                      onToggle={() => setOpenId(openId === f.id ? null : f.id)}
                    />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-20 text-center"
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
                  No matches
                </h3>
                <p className="mt-2 max-w-sm text-[14px] text-stone-500">
                  We couldn't find anything for{" "}
                  {query ? <span className="font-medium">“{query}”</span> : "that filter"}.
                  Try a different keyword or reset.
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveCat("all");
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#a65335] px-5 py-2.5 text-[13.5px] font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#8d452c]"
                >
                  Reset filters
                  <ArrowRight size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative mt-10 overflow-hidden rounded-3xl bg-stone-900 p-8 text-white shadow-[0_30px_60px_-30px_rgba(28,25,23,.7)] sm:p-10"
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

          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-400/30"
              >
                <LifeBuoy size={22} className="text-amber-400" />
              </motion.span>
              <div>
                <h3 className="font-['Playfair_Display',serif] text-[24px] leading-tight sm:text-[28px]">
                  Still stuck? We're here.
                </h3>
                <p className="mt-1.5 text-[14px] text-stone-300">
                  Send us a message and a real human will reply within one working day.
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
                Contact us
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { icon: BookOpen,  label: "Journal",  to: "/blog" },
            { icon: Palette,   label: "Custom",   to: "/custom-art" },
            { icon: ShoppingBag, label: "Gallery", to: "/gallery" },
            { icon: MessageCircle, label: "Contact", to: "/contact" },
          ].map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.label}
                to={l.to}
                className="group flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-white/60 px-4 py-3 text-[13px] font-medium text-stone-700 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c2603a]/40 hover:bg-white hover:text-[#a65335] hover:shadow-[0_18px_30px_-20px_rgba(194,96,58,.6)]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-stone-100 text-stone-500 transition-colors group-hover:bg-[#c2603a]/10 group-hover:text-[#c2603a]">
                  <Icon size={14} />
                </span>
                {l.label}
                <ArrowRight
                  size={12}
                  className="ml-auto opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </Link>
            );
          })}
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