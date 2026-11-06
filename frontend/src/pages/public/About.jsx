import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, HandHeart, ShieldCheck, Globe2, Quote, ArrowUpRight } from "lucide-react";

import aboutVideo from "../../assets/about1.mp4";
import storyVideo from "../../assets/artist.mp4";

const IMG = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const hideBroken = (e) => {
  e.currentTarget.style.display = "none";
};

const STORY_POSTER = IMG("photo-1460661419201-fd4cecdf8a8b", 1000);

const MEDIUMS = [
  "Oil painting", "Watercolour", "Sculpture", "Ceramics", "Printmaking",
  "Charcoal & ink", "Mixed media", "Digital art", "Textile art", "Photography",
];

const STATS = [
  { value: "350+", label: "Independent artists" },
  { value: "2,800+", label: "Original artworks sold" },
  { value: "40+", label: "Countries shipped to" },
  { value: "4.8/5", label: "Average buyer rating" },
];

const ART_FORMS = [
  {
    title: "Paintings",
    body: "Oil, acrylic and watercolour works where you can still see the brushstroke, the layering and the artist's hand.",
    image: IMG("photo-1547826039-bfc35e0f1ea8", 700),
    accent: "from-amber-500/90 to-rose-500/80",
  },
  {
    title: "Ceramics & sculpture",
    body: "Thrown, carved and cast pieces. Each one is shaped by hand, so no two are ever identical.",
    image: IMG("photo-1493106641515-6b5631de4bb9", 700),
    accent: "from-emerald-600/90 to-teal-500/80",
  },
  {
    title: "Abstract & mixed media",
    body: "Texture, collage and colour experiments from artists who ignore the rulebook.",
    image: IMG("photo-1541961017774-22349e4a1262", 700),
    accent: "from-fuchsia-600/90 to-amber-500/80",
  },
  {
    title: "Prints & drawings",
    body: "Hand-pulled prints, ink and charcoal studies. Original art at a price that invites you to start collecting.",
    image: IMG("photo-1518998053901-5348d3961a04", 700),
    accent: "from-indigo-600/90 to-cyan-500/80",
  },
];

const JOURNEY = [
  { step: "Apply", body: "Artists share their portfolio, their process and the story behind their work." },
  { step: "Get reviewed", body: "Our curators check originality, craft and consistency before anyone is approved." },
  { step: "List your work", body: "Artists upload each piece with their own price, size, medium and story." },
  { step: "Ship worldwide", body: "Archival packaging, insured shipping and a signed certificate of authenticity." },
];

const VALUES = [
  { icon: HandHeart, title: "Fair to artists", body: "Artists set their own prices and keep the majority of every sale. No race to the bottom, no anonymous bulk listings." },
  { icon: ShieldCheck, title: "Verified, every time", body: "Every artist is reviewed before they can list, and every original piece ships with a signed certificate of authenticity." },
  { icon: Sparkles, title: "Curated, not crowded", body: "Our team hand-reviews new listings, so browsing Artnest feels like a gallery, not an endless feed." },
  { icon: Globe2, title: "Made to travel", body: "Archival packaging and insured shipping mean every piece arrives exactly as the artist intended." },
];

/* ---------- Scroll-reveal hook ---------- */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("artnest-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    el.querySelectorAll(".artnest-reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

function StoryMedia() {
  const [failed, setFailed] = useState(false);
  const vidRef = useRef(null);

  const playVid = () => {
    const p = vidRef.current?.play();
    if (p && p.catch) p.catch(() => {});
  };
  const pauseVid = () => vidRef.current?.pause();

  return (
    <div className="relative group">
      {/* decorative gradient frame */}
      <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-amber-300/60 via-rose-300/40 to-emerald-300/50 opacity-60 blur-xl group-hover:opacity-90 transition-opacity duration-700" aria-hidden="true" />
      <div
        className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-300 shadow-2xl ring-1 ring-black/10"
        onMouseEnter={playVid}
        onMouseLeave={pauseVid}
        onTouchStart={playVid}
        onTouchEnd={pauseVid}
      >
        {!failed ? (
          <video
            className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden transition-transform duration-700 group-hover:scale-105"
            ref={vidRef}
            src={storyVideo}
            muted
            loop
            playsInline
            preload="auto"
            aria-label="An artist at work in the studio"
            onError={() => setFailed(true)}
          />
        ) : null}

        <img
          src={STORY_POSTER}
          alt="A hand-pulled print being lifted from the plate"
          onError={hideBroken}
          className={`absolute inset-0 w-full h-full object-cover artnest-drift ${failed ? "" : "hidden motion-reduce:block"}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* corner accent */}
        <div className="absolute bottom-4 right-4 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white ring-1 ring-white/30">
          In the studio
        </div>
      </div>
    </div>
  );
}

function HeroVideo() {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }, []);

  if (failed) return null;

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden"
      src={aboutVideo}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      onError={() => setFailed(true)}
    />
  );
}

export default function About() {
  const pageRef = useReveal();

  return (
    <div
      ref={pageRef}
      className="bg-[var(--color-canvas,#fcfbf9)] text-[var(--color-neutral,#1a1a1a)] font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Work+Sans:wght@400;500;600&display=swap');

        /* ---------- Hero ---------- */
        @keyframes artnest-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .artnest-hero-glow { position: absolute; inset: -25%; pointer-events: none; background: radial-gradient(circle at 28% 32%, rgba(201,163,90,.24), transparent 46%), radial-gradient(circle at 72% 66%, rgba(92,43,48,.3), transparent 50%); animation: artnest-glow 20s ease-in-out infinite alternate; }
        @keyframes artnest-glow { from { transform: translate3d(-2%,-1%,0) scale(1.02); } to { transform: translate3d(2%,2%,0) scale(1.1); } }
        .artnest-hero-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse 62% 58% at 50% 48%, rgba(30,17,10,.62) 0%, rgba(30,17,10,.34) 55%, transparent 100%), linear-gradient(180deg, rgba(40,24,14,.52) 0%, rgba(40,24,14,.08) 38%, rgba(40,24,14,.44) 100%), radial-gradient(ellipse at center, transparent 52%, rgba(20,10,5,.55) 100%); }
        .artnest-hero-accent { font-style: italic; font-weight: 400; background: linear-gradient(100deg, #f8e6b8 0%, #e0bb74 45%, #c9a35a 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; padding-right: .08em; background-size: 200% auto; animation: artnest-shine 6s linear infinite; }
        @keyframes artnest-shine { to { background-position: 200% center; } }
        @media (prefers-reduced-motion: reduce) { .artnest-hero-glow, .artnest-hero-accent { animation: none; } }

        /* ---------- Marquee ---------- */
        .artnest-marquee { animation: artnest-marquee 40s linear infinite; }
        .artnest-marquee:hover { animation-play-state: paused; }
        .artnest-marquee span { background: linear-gradient(120deg, #78716c, #b45309 50%, #78716c); -webkit-background-clip: text; background-clip: text; color: transparent; transition: opacity .3s; }
        .artnest-marquee span:hover { opacity: .6; }

        /* ---------- Drift ---------- */
        @keyframes artnest-drift { from { transform: scale(1) translate(0, 0); } to { transform: scale(1.12) translate(-2%, -2%); } }
        .artnest-drift { animation: artnest-drift 18s ease-in-out infinite alternate; }

        /* ---------- Scroll reveal ---------- */
        .artnest-reveal { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1); }
        .artnest-reveal.artnest-in { opacity: 1; transform: translateY(0); }
        .artnest-reveal.d1 { transition-delay: .08s; }
        .artnest-reveal.d2 { transition-delay: .16s; }
        .artnest-reveal.d3 { transition-delay: .24s; }
        .artnest-reveal.d4 { transition-delay: .32s; }

        /* ---------- Gradient section titles ---------- */
        .artnest-grad-title {
          font-family: 'Playfair Display', serif;
          background: linear-gradient(110deg, #1c1917 0%, #78350f 45%, #b45309 70%, #1c1917 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: artnest-title-shift 9s ease-in-out infinite alternate;
        }
        @keyframes artnest-title-shift { from { background-position: 0% center; } to { background-position: 100% center; } }

        .artnest-grad-title-light {
          font-family: 'Playfair Display', serif;
          background: linear-gradient(110deg, #fef3c7 0%, #f0d9a3 40%, #e0bb74 65%, #fef3c7 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: artnest-title-shift 9s ease-in-out infinite alternate;
        }

        /* ---------- Story copy ---------- */
        .artnest-story-title { font-family: 'Playfair Display', serif; letter-spacing: -0.02em; }

        /* Animated gradient + glow on "comes first" */
        .artnest-story-title em {
          font-style: italic;
          background: linear-gradient(
            110deg,
            #b45309 0%,
            #d97706 25%,
            #f59e0b 45%,
            #92400e 65%,
            #b45309 100%
          );
          background-size: 250% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: artnest-em-flow 5s ease-in-out infinite alternate;
          filter: drop-shadow(0 2px 12px rgba(217, 119, 6, 0.35));
          padding-right: 0.06em; /* prevents italic clipping */
        }
        @keyframes artnest-em-flow {
          0%   { background-position: 0% center; }
          100% { background-position: 100% center; }
        }

        .artnest-story-copy p {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 21px; line-height: 1.7; font-weight: 500;
          color: #44403c; letter-spacing: 0.005em; text-wrap: pretty; hyphens: auto;
        }
        .artnest-story-copy p.artnest-lead { font-size: 25px; line-height: 1.55; color: #1c1917; }
        .artnest-story-copy p.artnest-lead::first-letter {
          font-family: 'Playfair Display', serif; float: left;
          font-size: 4.4rem; line-height: 0.82;
          padding: 0.35rem 0.7rem 0 0; color: #b45309; font-weight: 500;
        }
        .artnest-story-copy p strong { font-weight: 600; color: #1c1917; }
        .artnest-story-copy p em { font-style: italic; color: #92400e; }
        @media (max-width: 640px) {
          .artnest-story-copy p { font-size: 19px; }
          .artnest-story-copy p.artnest-lead { font-size: 22px; }
        }

        /* ---------- Stat cards ---------- */
        .artnest-stat {
          position: relative;
          border-radius: 16px;
          padding: 20px 12px;
          transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s;
        }
        .artnest-stat::before {
          content: "";
          position: absolute; inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(201,163,90,.6), rgba(255,255,255,0), rgba(201,163,90,.4));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity .4s;
        }
        .artnest-stat:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -18px rgba(180,120,40,.55); }
        .artnest-stat:hover::before { opacity: 1; }
        .artnest-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 500;
          background: linear-gradient(120deg, #6f5222, #b45309 60%, #6f5222);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          transition: background-position .6s;
        }
        .artnest-stat:hover .artnest-stat-value { background-position: 100% center; }
        @media (min-width: 640px) { .artnest-stat-value { font-size: 36px; } }

        /* ---------- Art form cards ---------- */
        .artnest-artcard { position: relative; isolation: isolate; }
        .artnest-artcard img { transition: transform .7s cubic-bezier(.22,1,.36,1), filter .5s; }
        .artnest-artcard:hover img { transform: scale(1.08); filter: saturate(1.1); }
        .artnest-artcard .artnest-artcard-body { transition: transform .5s cubic-bezier(.22,1,.36,1); }
        .artnest-artcard:hover .artnest-artcard-body { transform: translateY(-4px); }
        .artnest-artcard-arrow { opacity: 0; transform: translate(-4px, 4px); transition: all .4s; }
        .artnest-artcard:hover .artnest-artcard-arrow { opacity: 1; transform: translate(0, 0); }
        .artnest-artcard-ring {
          position: absolute; inset: 0; border-radius: 1rem;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.15);
          transition: box-shadow .4s; pointer-events: none;
        }
        .artnest-artcard:hover .artnest-artcard-ring { box-shadow: inset 0 0 0 1px rgba(240,217,163,.7); }

        /* ---------- Journey steps ---------- */
        .artnest-step { position: relative; transition: transform .4s; }
        .artnest-step:hover { transform: translateY(-4px); }
        .artnest-step-num {
          display: inline-block;
          background: linear-gradient(135deg, #f0d9a3, #e0bb74 50%, #c9a35a);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          filter: drop-shadow(0 4px 14px rgba(224,187,116,.35));
        }
        .artnest-step::after {
          content: ""; position: absolute; left: 0; top: 0;
          height: 2px; width: 0;
          background: linear-gradient(90deg, #e0bb74, transparent);
          transition: width .6s cubic-bezier(.22,1,.36,1);
        }
        .artnest-step:hover::after { width: 100%; }

        /* ---------- Value cards ---------- */
        .artnest-value { transition: transform .4s, background .4s; border-radius: 16px; padding: 18px; }
        .artnest-value:hover { transform: translateY(-3px); background: rgba(255,255,255,.7); }
        .artnest-value-icon {
          background: linear-gradient(135deg, #fef3c7, #fde68a 60%, #fcd34d);
          transition: transform .4s, box-shadow .4s;
        }
        .artnest-value:hover .artnest-value-icon {
          transform: rotate(-6deg) scale(1.08);
          box-shadow: 0 10px 24px -8px rgba(201,163,90,.6);
        }

        @media (prefers-reduced-motion: reduce) {
          .artnest-marquee, .artnest-drift, .artnest-grad-title,
          .artnest-grad-title-light, .artnest-hero-accent { animation: none; }
          .artnest-story-title em { animation: none; }
          .artnest-reveal { opacity: 1; transform: none; }
        }
      `}</style>

      {/* ================= HERO ================= */}
      <section className="relative flex items-center overflow-hidden bg-[#2a1a10] min-h-[100svh] font-['Work_Sans',sans-serif]">
        <HeroVideo />
        <div className="artnest-hero-glow" aria-hidden="true" />
        <div className="artnest-hero-overlay" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 pt-[clamp(104px,16vh,140px)] pb-[clamp(96px,14vh,128px)] text-center text-white">
          <p className="artnest-reveal artnest-in inline-flex items-center gap-2 rounded-full border border-[#f0d9a3]/40 bg-white/10 px-4 py-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[#f1d9a3] backdrop-blur-md shadow-[0_0_30px_-8px_rgba(224,187,116,.5)]">
            <Sparkles size={13} className="text-[#e0bb74]" /> About Artnest
          </p>
          <h1 className="artnest-reveal artnest-in d1 mt-3 mx-auto max-w-[800px] font-['Fraunces',serif] text-[34px] sm:text-[48px] lg:text-[60px] leading-[1.08] font-medium tracking-tight [text-shadow:0_4px_40px_rgba(0,0,0,.45)]">
            Every artwork starts with someone who{" "}
            <em className="artnest-hero-accent">couldn't stop making it.</em>
          </h1>
          <p className="artnest-reveal artnest-in d2 mt-5 mx-auto max-w-[580px] text-[15px] sm:text-[17px] leading-relaxed text-[#fbf1da] [text-shadow:0_1px_18px_rgba(0,0,0,.55)]">
            Artnest is a gallery built for independent painters, sculptors and makers, and for collectors who want to know the hands behind the work.
          </p>
          <div className="artnest-reveal artnest-in d3 mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/discover"
              className="h-12 px-8 rounded-full text-white text-[14px] font-medium bg-gradient-to-br from-[#b88a3e] via-[#96702f] to-[#7a5a22] border border-white/20 shadow-[0_12px_30px_-8px_rgba(150,112,47,.85),inset_0_1px_0_rgba(255,255,255,.28)] hover:-translate-y-0.5 hover:from-[#c9984a] hover:via-[#a67b36] hover:to-[#86632a] transition-all inline-flex items-center justify-center active:scale-95"
            >
              Explore the gallery
            </Link>
            <Link
              to="/artists"
              className="h-12 px-8 rounded-full border border-white/55 bg-white/10 text-white text-[14px] font-medium backdrop-blur-md hover:bg-white hover:text-[#5c2b30] transition-colors inline-flex items-center justify-center active:scale-95"
            >
              Meet the artists
            </Link>
          </div>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <section className="overflow-hidden border-b border-[var(--color-outline,#e5e5e5)] bg-[var(--color-section,#f5f4f0)] py-4" aria-label="Art mediums on Artnest">
        <div className="artnest-marquee flex w-max gap-10 whitespace-nowrap font-['Playfair_Display',serif] italic text-[20px]">
          {[...MEDIUMS, ...MEDIUMS].map((m, i) => (
            <span key={i} className="hover:opacity-60 transition-opacity">{m}</span>
          ))}
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section id="mission" className="scroll-mt-20 max-w-[1100px] mx-auto px-6 py-16 sm:py-24 grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">
        <div className="artnest-reveal">
          <StoryMedia />
        </div>

        <div className="artnest-story-copy">
          <p className="artnest-reveal text-[12px] font-semibold uppercase tracking-[0.28em] text-amber-700 !font-['Plus_Jakarta_Sans',sans-serif] !text-[12px] !leading-none">
            <span className="inline-block w-8 h-px bg-gradient-to-r from-amber-500 to-transparent align-middle mr-2" />
            Our story
          </p>
          <h2 className="artnest-reveal d1 artnest-story-title mt-4 mb-8 text-[38px] sm:text-[52px] leading-[1.05]">
            Craft <em>comes first</em>
          </h2>
          <div className="space-y-5">
            <p className="artnest-reveal d1 artnest-lead">
              <strong>Artnest</strong> started with a frustration: gifted artists were spending more hours posting online than making art, and buyers had no reliable way to find original work from a real maker.
            </p>
            <p className="artnest-reveal d2">
              Every piece carries months of practice: sketches discarded, pigments remixed, plates re-inked, kilns fired twice. That effort deserves to be seen, so each listing tells you <em>who</em> made the piece, <em>how</em>, and <em>why</em>.
            </p>
            <p className="artnest-reveal d3">
              Today, painters, sculptors, ceramicists, printmakers and digital artists from around the world sell here, and every one of them is reviewed before their first piece goes live.
            </p>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="relative border-y border-[#e0d4bc] bg-[#efe6d3] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgba(201,163,90,.28),transparent_70%)]" aria-hidden="true" />
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-amber-300/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-rose-300/25 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-[1000px] mx-auto px-6 py-14 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {STATS.map((s, i) => (
            <div key={s.label} className={`artnest-reveal d${i + 1} artnest-stat`}>
              <p className="artnest-stat-value">{s.value}</p>
              <p className="mt-1 text-[12.5px] text-[#8c7f68] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHAT YOU'LL FIND ================= */}
      <section className="max-w-[1100px] mx-auto px-6 py-16 sm:py-24">
        <div className="max-w-[620px] mb-12">
          <p className="artnest-reveal text-[12px] font-semibold uppercase tracking-[0.28em] text-amber-700">
            <span className="inline-block w-8 h-px bg-gradient-to-r from-amber-500 to-transparent align-middle mr-2" />
            Mediums
          </p>
          <h2 className="artnest-reveal d1 artnest-grad-title mt-3 text-[30px] sm:text-[42px] leading-tight">
            What you'll find here
          </h2>
          <p className="artnest-reveal d2 mt-3 text-[15px] leading-relaxed text-[var(--color-secondary,#666666)]">
            Art is more than paint on canvas. Browse by the way a piece was made and see how each medium carries its own kind of skill.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ART_FORMS.map((f, i) => (
            <Link
              to="/discover"
              key={f.title}
              className={`artnest-reveal d${i + 1} artnest-artcard group relative rounded-2xl overflow-hidden aspect-[3/4] bg-stone-800 block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}
            >
              <img
                src={f.image}
                alt={f.title}
                onError={hideBroken}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* colour tint on hover */}
              <div className={`absolute inset-0 bg-gradient-to-t ${f.accent} opacity-0 group-hover:opacity-40 transition-opacity duration-500 mix-blend-multiply`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="artnest-artcard-body absolute bottom-0 p-5 text-white">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-['Playfair_Display',serif] text-[20px]">{f.title}</h3>
                  <ArrowUpRight size={18} className="artnest-artcard-arrow text-[#f0d9a3]" />
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone-200">{f.body}</p>
              </div>
              <div className="artnest-artcard-ring" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      {/* ================= JOURNEY ================= */}
      <section className="relative bg-[#2a1a10] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,163,90,.22),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(92,43,48,.45),transparent_50%)]" aria-hidden="true" />
        <div className="relative max-w-[1100px] mx-auto px-6 py-16 sm:py-24">
          <p className="artnest-reveal text-[12px] font-semibold uppercase tracking-[0.28em] text-[#e0bb74]">
            <span className="inline-block w-8 h-px bg-gradient-to-r from-[#e0bb74] to-transparent align-middle mr-2" />
            For artists
          </p>
          <h2 className="artnest-reveal d1 artnest-grad-title-light mt-3 text-[30px] sm:text-[42px] leading-tight max-w-[560px]">
            How an artist joins Artnest
          </h2>
          <p className="artnest-reveal d2 mt-3 max-w-[560px] text-[15px] text-stone-300 leading-relaxed">
            We keep the door open to new talent, and the standard high.
          </p>
          <ol className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            {JOURNEY.map((j, i) => (
              <li
                key={j.step}
                className={`artnest-reveal d${i + 1} artnest-step border-t border-white/20 pt-5`}
              >
                <span className="artnest-step-num font-['Playfair_Display',serif] text-[40px] leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[16px] font-semibold">{j.step}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-stone-300">{j.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= QUOTE ================= */}
      <section className="relative max-w-[820px] mx-auto px-6 py-16 sm:py-24 text-center">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-40 bg-[radial-gradient(ellipse_60%_100%_at_50%_50%,rgba(201,163,90,.18),transparent_70%)] pointer-events-none" aria-hidden="true" />
        <Quote size={28} strokeWidth={1.5} className="artnest-reveal relative mx-auto text-amber-700" />
        <blockquote className="artnest-reveal d1 relative mt-5 font-['Playfair_Display',serif] text-[24px] sm:text-[32px] leading-snug">
          <span className="artnest-grad-title">I used to price my work</span> by what I thought people would pay. Here, I price it by what it took to make.
        </blockquote>
        <p className="artnest-reveal d2 relative mt-5 text-[13.5px] text-[var(--color-secondary,#666666)]">
          A sample of what our artists tell us. Replace with a real artist's words.
        </p>
      </section>

      {/* ================= VALUES ================= */}
      <section className="border-t border-[var(--color-outline,#e5e5e5)] bg-[var(--color-section,#f5f4f0)]">
        <div className="max-w-[1100px] mx-auto px-6 py-16 sm:py-20">
          <h2 className="artnest-reveal artnest-grad-title text-[30px] sm:text-[42px] leading-tight">What we believe</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className={`artnest-reveal d${(i % 4) + 1} artnest-value flex gap-4`}>
                  <span className="artnest-value-icon shrink-0 w-12 h-12 rounded-full border border-amber-200 flex items-center justify-center text-amber-900">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold text-stone-900">{v.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-secondary,#555555)]">{v.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative border-t border-[#e0d4bc] bg-[#f6f1e6] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(201,163,90,.3),transparent_70%)]" aria-hidden="true" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-amber-200/40 blur-3xl -translate-y-1/2" aria-hidden="true" />
        <div className="relative max-w-[640px] mx-auto px-6 py-16 sm:py-20 text-center">
          <h2 className="artnest-reveal artnest-grad-title text-[28px] sm:text-[36px] leading-tight">
            Find the piece that stays with you
          </h2>
          <p className="artnest-reveal d1 mt-3 text-[14.5px] text-[var(--color-secondary,#666666)] leading-relaxed">
            Browse original, verified artworks from independent artists around the world, or share your own.
          </p>
          <div className="artnest-reveal d2 mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/discover"
              className="h-11 px-8 rounded-full bg-gradient-to-br from-[#2a1a10] to-[#5c2b30] text-white text-[13.5px] font-medium hover:from-[#5c2b30] hover:to-[#2a1a10] transition-all inline-flex items-center justify-center shadow-lg shadow-amber-900/20 active:scale-95"
            >
              Discover artworks
            </Link>
            <Link
              to="/artists"
              className="h-11 px-8 rounded-full border border-[#cdbb97] text-[#1c1712] text-[13.5px] font-medium hover:bg-[#efe6d3] hover:border-amber-500 transition-colors inline-flex items-center justify-center active:scale-95"
            >
              See all artists
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}