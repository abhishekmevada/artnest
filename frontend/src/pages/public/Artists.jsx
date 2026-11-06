import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import artistVideo from "../../assets/artist.mp4";
import { API_BASE_URL } from "@/config/api";

const ARTIST_LOGIN_PATH = "/artist/login";
const DISCOVER_PATH = "/discover";
// Height of your site navbar. Adjust if your navbar differs per breakpoint.
const NAV_MOBILE = 64;   // below lg (1024px)
const NAV_DESKTOP = 80;  // lg and up
const HEADING = "font-serif";
const SPOTLIGHT_ID = "elora-vance";

const slug = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
   .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const unsplash = (id, w) =>
  id.startsWith("/") || id.startsWith("http")
    ? id
    : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

const RAW = [
  { name: "Elora Vance", craft: "Pottery", medium: "Sculptural stoneware & terracotta", location: "Provence, FR", since: 2009, bio: "Elora throws and hand-builds vessels from local Provençal clay, then finishes each one with ash glazes she mixes herself.", quote: "A pot should feel like it has been in your hands for years before you ever hold it.", portrait: "1544005313-94ddf0286df2", works: ["1610701596007-11502861dcfa", "1565193566173-7a0ee3dbe261", "1578749556568-bc2c40e68b61"] },
  { name: "Mateo Rossi", craft: "Painting", medium: "Abstract expressionist oils", location: "Florence, IT", since: 2005, bio: "Trained in Florence, Mateo builds thick layers of oil with palette knives, chasing the moment a canvas stops being a plan and becomes a place.", quote: "I stop when the painting starts arguing back.", portrait: "1507003211169-0a1dd7228f2d", works: ["1541701494587-cb58502866ab", "1561214115-f2f134cc4912", "1578926375605-eaf7559b1458"] },
  { name: "Sylvan Zhou", craft: "Sculpture", medium: "Architectural wood & bronze", location: "Kyoto, JP", since: 2012, bio: "Sylvan joins Japanese woodworking with cast bronze, making forms that fit together without a single screw.", quote: "Wood remembers how it grew. I only listen.", portrait: "1500648767791-00dcc994a43e", works: ["1549490349-8643362247b5", "1513519245088-0e12902e5a38", "1582561424760-0321d75e81fa"] },
  { name: "Clara Miró", craft: "Painting", medium: "Oil painting", location: "Barcelona, Spain", since: 2010, bio: "Clara paints Mediterranean light in warm, glazed layers that take weeks to dry and a moment to fall in love with.", quote: "Light is the one subject I have never finished.", portrait: "1438761681033-6461ffad8d80", works: ["1561214115-f2f134cc4912", "1578926375605-eaf7559b1458", "1541701494587-cb58502866ab"] },
  { name: "Alejandro Cruz", craft: "Pottery", medium: "Ceramics", location: "Oaxaca, Mexico", since: 2007, bio: "Working with Oaxacan black clay, Alejandro keeps a centuries-old burnishing technique alive in modern forms.", quote: "My grandmother taught my hands. The clay does the rest.", portrait: "1519085360753-af0119f7cbe7", works: ["1610701596007-11502861dcfa", "1578749556568-bc2c40e68b61", "1513519245088-0e12902e5a38"] },
  { name: "Hannah Berg", craft: "Sculpture", medium: "Marble & bronze", location: "Portland, USA", since: 2011, bio: "Hannah carves marble and casts bronze, balancing weight and lightness in figures that seem about to move.", quote: "Stone is patient. I try to be.", portrait: "1573496359142-b8d87734a5a2", works: ["1515569067071-ec3b4a3c3a4d", "1549490349-8643362247b5", "1577083552431-6e5fd01aa342"] },
  { name: "Linus Aaberg", craft: "Printmaking", medium: "Fine art prints", location: "Copenhagen, DK", since: 2014, bio: "Linus pulls every print by hand on a century-old press, so each edition carries small, honest differences.", quote: "No two impressions are the same, and that is the point.", portrait: "1506794778202-cad84cf45f1d", works: ["1460661419201-fd4cecdf8a8b", "1501004318641-b39e6451bec6", "1549887534-1541e9326642"] },
  { name: "Amina Diallo", craft: "Weaving", medium: "Textile & fiber", location: "Dakar, Senegal", since: 2008, bio: "Amina weaves hand-dyed cotton and indigo on a wooden loom, carrying Senegalese patterns into contemporary wall pieces.", quote: "Every thread is a sentence. The cloth is the story.", portrait: "1534528741775-53994a69daeb", works: ["1600585154340-be6161a56a0c", "1544816155-12df9643f363", "1584551246679-0daf3d275d0f"] },
  { name: "Julien Moreau", craft: "Painting", medium: "Oil painting", location: "Normandy, France", since: 2006, bio: "Julien paints the Normandy coast outdoors in all weather, finishing in the studio only while the sea air is still in the canvas.", quote: "I paint what the weather lets me keep.", portrait: "1560250097-0b93528c311a", works: ["1577083552431-6e5fd01aa342", "1541701494587-cb58502866ab", "1561214115-f2f134cc4912"] },
  { name: "Mei-Ling Tan", craft: "Pottery", medium: "Ceramics", location: "Hsinchu, Taiwan", since: 2013, bio: "Mei-Ling fires porcelain with celadon glazes, aiming for the quiet green of rain on leaves.", quote: "The kiln always has the final say.", portrait: "1580489944761-15a19d654956", works: ["1565193566173-7a0ee3dbe261", "1610701596007-11502861dcfa", "1578749556568-bc2c40e68b61"] },
  { name: "Rowan Campbell", craft: "Carving", medium: "Woodcraft", location: "Edinburgh, UK", since: 2010, bio: "Rowan carves Scottish oak and ash with hand tools only, leaving the chisel marks as part of the finished piece.", quote: "I leave the marks. They show a person was here.", portrait: "1472099645785-5658abf4ff4e", works: ["1513519245088-0e12902e5a38", "1582561424760-0321d75e81fa", "1579783900882-c0d3dad7b119"] },
  // ---- Painting ----
  { name: "Isabela Ferreira", craft: "Painting", medium: "Watercolour & gouache", location: "Lisbon, Portugal", since: 2012, bio: "Isabela paints the tiled facades and tidal light of Lisbon in loose watercolour washes, then sharpens the edges with opaque gouache.", quote: "Water does half the painting. I just decide when to stop it.", portrait: "1494790108377-be9c29b29330", works: ["1578926375605-eaf7559b1458", "1577083552431-6e5fd01aa342", "1561214115-f2f134cc4912"] },
  // ---- Sculpture ----
  { name: "Tomasz Nowak", craft: "Sculpture", medium: "Welded steel", location: "Kraków, Poland", since: 2009, bio: "Tomasz cuts and welds salvaged steel into tall, balanced forms that look heavy and feel almost weightless.", quote: "Steel has a memory of fire. I give it a new one.", portrait: "1535713875002-d1d0cf377fde", works: ["1515569067071-ec3b4a3c3a4d", "1582561424760-0321d75e81fa", "1549490349-8643362247b5"] },
  { name: "Noor Al-Rashid", craft: "Sculpture", medium: "Kiln-cast glass", location: "Amman, Jordan", since: 2015, bio: "Noor casts glass in sand and plaster moulds, trapping bubbles and colour inside pieces that change with the light in the room.", quote: "Glass is the only material that lets you hold light.", portrait: "1531746020798-e6953c6e8e04", works: ["1577083552431-6e5fd01aa342", "1515569067071-ec3b4a3c3a4d", "1513519245088-0e12902e5a38"] },
  // ---- Pottery ----
  { name: "Kaito Mori", craft: "Pottery", medium: "Wood-fired stoneware", location: "Bizen, Japan", since: 2008, bio: "Kaito fires unglazed stoneware in a wood kiln for ten days, letting ash and flame decide the colour of every piece.", quote: "I build the pot. The fire signs it.", portrait: "1527980965255-d3b416303d12", works: ["1578749556568-bc2c40e68b61", "1493106641515-6b5631de4bb9", "1565193566173-7a0ee3dbe261"] },
  // ---- Carving ----
  { name: "Ingrid Solheim", craft: "Carving", medium: "Birch & spruce relief carving", location: "Bergen, Norway", since: 2011, bio: "Ingrid carves flowing relief panels in Norwegian birch, drawing on the old stave-church tradition of vines and animals.", quote: "A good carving looks like the wood was always going to say this.", portrait: "1489424731084-a5d8b219a5bb", works: ["1579783900882-c0d3dad7b119", "1513519245088-0e12902e5a38", "1582561424760-0321d75e81fa"] },
  { name: "Tomás Herrera", craft: "Carving", medium: "Olive wood bowls & utensils", location: "Granada, Spain", since: 2013, bio: "Tomás turns and carves fallen olive wood from nearby groves into bowls and spoons, keeping the twisting grain visible.", quote: "Every branch already knows its shape. I clear the way.", portrait: "1568602471122-7832951cc4c5", works: ["1582561424760-0321d75e81fa", "1549490349-8643362247b5", "1579783900882-c0d3dad7b119"] },
  { name: "Kofi Mensah", craft: "Carving", medium: "Ebony & iroko figures", location: "Kumasi, Ghana", since: 2006, bio: "Kofi carves ebony and iroko figures in the Ashanti tradition, polishing each one by hand until the wood glows.", quote: "My father carved stools. I carve the people who sit on them.", portrait: "1599566150163-29194dcaad36", works: ["1549490349-8643362247b5", "1513519245088-0e12902e5a38", "1579783900882-c0d3dad7b119"] },
  // ---- Weaving ----
  { name: "Priya Nair", craft: "Weaving", medium: "Handloom silk & cotton", location: "Varanasi, India", since: 2010, bio: "Priya weaves silk and cotton on a pit loom, reworking classic Banarasi motifs into scarves and wall hangings.", quote: "One saree can hold a month of someone's patience.", portrait: "1508214751196-bcfd4ca60f91", works: ["1544816155-12df9643f363", "1600585154340-be6161a56a0c", "1584551246679-0daf3d275d0f"] },
  { name: "Lucía Quispe", craft: "Weaving", medium: "Alpaca wool tapestry", location: "Cusco, Peru", since: 2007, bio: "Lucía spins and dyes alpaca wool with plants from the Andean valleys, weaving tapestries that follow patterns her family has used for generations.", quote: "The mountains give the colours. My hands give the order.", portrait: "1517841905240-472988babdf9", works: ["1584551246679-0daf3d275d0f", "1544816155-12df9643f363", "1600585154340-be6161a56a0c"] },
  { name: "Ebba Lindqvist", craft: "Weaving", medium: "Linen rugs & runners", location: "Dalarna, Sweden", since: 2012, bio: "Ebba weaves rugs and runners from linen and recycled fabric, using a Swedish rag-rug technique with a modern, quiet palette.", quote: "Old cloth deserves a second life underfoot.", portrait: "1522529599102-193c0d76b5b6", works: ["1600585154340-be6161a56a0c", "1584551246679-0daf3d275d0f", "1544816155-12df9643f363"] },
  // ---- Printmaking ----
  { name: "Hiro Tanabe", craft: "Printmaking", medium: "Woodblock prints", location: "Tokyo, Japan", since: 2009, bio: "Hiro carves each colour into a separate cherry block and prints by hand, building city scenes layer by layer.", quote: "Every colour is another block, another chance to be wrong.", portrait: "1463453091185-61582044d556", works: ["1501004318641-b39e6451bec6", "1549887534-1541e9326642", "1460661419201-fd4cecdf8a8b"] },
  { name: "Camille Laurent", craft: "Printmaking", medium: "Etching & aquatint", location: "Paris, France", since: 2011, bio: "Camille bites fine lines into copper plates with acid, then adds soft aquatint tones for quiet, grainy interiors.", quote: "The acid works while I wait. Waiting is the craft.", portrait: "1494790108377-be9c29b29330", works: ["1549887534-1541e9326642", "1460661419201-fd4cecdf8a8b", "1501004318641-b39e6451bec6"] },
  { name: "Marisol Vega", craft: "Printmaking", medium: "Linocut & screen print", location: "Mexico City, Mexico", since: 2016, bio: "Marisol combines bold linocut shapes with screen-printed colour fields, making posters and editions inspired by Mexican street life.", quote: "A print should be loud enough to be seen across the street.", portrait: "1531746020798-e6953c6e8e04", works: ["1460661419201-fd4cecdf8a8b", "1501004318641-b39e6451bec6", "1549887534-1541e9326642"] },
];

const BASE_SECTIONS = [
  { craft: "Painting", image: "1541701494587-cb58502866ab", chip: "Paintings", eyebrow: "Painters", title: "Brush, pigment and gold leaf", link: "View all paintings" },
  { craft: "Sculpture", image: "1515569067071-ec3b4a3c3a4d", chip: "Sculptures", eyebrow: "Sculptors", title: "Hands that cast and carve", link: "View all sculptures" },
  { craft: "Pottery", image: "1493106641515-6b5631de4bb9", chip: "Pottery", eyebrow: "Potters", title: "Clay, fire and glaze", link: "View all pottery" },
  { craft: "Carving", image: "1549490349-8643362247b5", chip: "Carvings", eyebrow: "Carvers", title: "Wood shaped by hand", link: "View all carvings" },
  { craft: "Weaving", image: "1600585154340-be6161a56a0c", chip: "Textiles", eyebrow: "Weavers", title: "Thread, loom and fibre", link: "View all textiles" },
  { craft: "Printmaking", image: "1460661419201-fd4cecdf8a8b", chip: "Prints", eyebrow: "Printmakers", title: "Ink, press and paper", link: "View all prints" },
  { craft: "Photography", image: "1541701494587-cb58502866ab", chip: "Photography", eyebrow: "Photographers", title: "Light, lens and moments captured", link: "View all photography" },
  { craft: "Digital Art", image: "1561214115-f2f134cc4912", chip: "Digital Art", eyebrow: "Digital Artists", title: "Pixels, light and contemporary media", link: "View all digital art" },
];

const STUDIO = [
  { title: "Clay and fire", image: "1493106641515-6b5631de4bb9", body: "A potter centres the clay on the wheel, shapes it, lets it dry slowly, then fires it twice: once to harden it, once to set the glaze. A crack at any step can mean starting over.", note: "Often 2 to 4 weeks from lump to finished piece", icon: "🏺" },
  { title: "Layers of oil paint", image: "1561214115-f2f134cc4912", body: "Oil paint dries slowly, so a painter builds a canvas in thin layers, waiting between each one. The depth you see in a finished painting is time made visible.", note: "A single canvas can take weeks or months", icon: "🎨" },
  { title: "Wood and stone", image: "1513519245088-0e12902e5a38", body: "Carvers work from the outside in, removing material they can never put back. Every cut is a decision, and the grain or the vein of the stone shapes the final form.", note: "Every mark is permanent", icon: "🪵" },
];

const CRAFT_EMOJI = {
  Painting: "🎨",
  Sculpture: "🗿",
  Pottery: "🏺",
  Carving: "🪵",
  Weaving: "🧵",
  Printmaking: "🖼️",
  Photography: "📷",
  "Digital Art": "💻",
};

const DEFAULT_ARTISTS = RAW.map((a) => {
  const works = a.works.map((id) => ({ image: unsplash(id, 1400), thumb: unsplash(id, 900) }));
  return {
    ...a,
    id: slug(a.name),
    initials: a.name.split(" ").map((w) => w[0]).slice(0, 2).join(""),
    emoji: CRAFT_EMOJI[a.craft] || "🎨",
    portrait: unsplash(a.portrait, 400),
    works,
    image: works[0].thumb,
  };
});

const DEFAULT_COLLAGE = [
  ...new Set(DEFAULT_ARTISTS.flatMap((a) => a.works.map((w) => w.thumb))),
].slice(0, 12);

const mapBackendArtist = (a) => {
  const profile = a.artistProfile || {};
  const specialties = Array.isArray(profile.specialty) ? profile.specialty : [];

  let primaryCraft = "Painting";
  if (specialties.length > 0) {
    const raw = String(specialties[0]).toLowerCase().trim();
    if (raw.includes("paint") || raw.includes("abstract")) primaryCraft = "Painting";
    else if (raw.includes("sculpt")) primaryCraft = "Sculpture";
    else if (raw.includes("potter") || raw.includes("ceramic")) primaryCraft = "Pottery";
    else if (raw.includes("carv") || raw.includes("wood")) primaryCraft = "Carving";
    else if (raw.includes("weav") || raw.includes("textil") || raw.includes("fiber")) primaryCraft = "Weaving";
    else if (raw.includes("print")) primaryCraft = "Printmaking";
    else if (raw.includes("photo")) primaryCraft = "Photography";
    else if (raw.includes("digit")) primaryCraft = "Digital Art";
    else {
      primaryCraft = raw.charAt(0).toUpperCase() + raw.slice(1);
    }
  }

  const mediumStr =
    specialties.length > 0
      ? specialties.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" & ")
      : "Original Artworks";

  const rawArtworks = Array.isArray(a.topArtworks)
    ? a.topArtworks.filter((w) => w && w.image && w.image.length > 0)
    : [];

  const works =
    rawArtworks.length > 0
      ? rawArtworks.map((w) => {
          const url = w.image?.[0]?.url || FALLBACK_ART_IMAGE;
          return {
            image: url,
            thumb: url,
            title: w.title || "Untitled Artwork",
            artworkId: w.artworkId,
          };
        })
      : [
          {
            image: FALLBACK_ART_IMAGE,
            thumb: FALLBACK_ART_IMAGE,
            title: "Studio Collection",
          },
        ];

  const initials = (a.name || "Artist")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "A";

  const portrait =
    a.avatar ||
    a.portrait ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name || "Artist")}&background=A9462A&color=fff&size=256`;

  const sinceYear = profile.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : a.createdAt
    ? new Date(a.createdAt).getFullYear()
    : 2021;

  return {
    _id: a._id,
    id: a._id || slug(a.name || "artist"),
    name: a.name || "Unknown Artist",
    craft: primaryCraft,
    medium: mediumStr,
    location: profile.location || "Location not specified",
    since: sinceYear,
    bio:
      profile.bio ||
      "Dedicated independent artist creating original works available on ArtNest.",
    quote:
      profile.quote ||
      "A work of art that contains theories is like an object on which the price tag has been left.",
    initials,
    emoji: CRAFT_EMOJI[primaryCraft] || "🎨",
    portrait,
    works,
    image: works[0]?.thumb || works[0]?.image || FALLBACK_ART_IMAGE,
  };
};

const WELCOME = ["Painters","Sculptors","Potters","Weavers","Carvers","Photographers","Printmakers","Jewellery makers","Digital artists","Self-taught artists"];

const FALLBACK_ART_IMAGE = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=85&w=1200";

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ath-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    el.querySelectorAll(".ath-reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

function AnimatedNumber({ value, suffix = "", duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(value * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display}{suffix}</span>;
}

function Photo({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (failed) {
    return (
      <div className={`${className} relative overflow-hidden bg-[#F1E4DC]`} role="img" aria-label={alt}>
        <img src={FALLBACK_ART_IMAGE} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E0A]/30 to-transparent" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
}

function Avatar({ artist, className = "h-14 w-14" }) {
  return (
    <div className="relative shrink-0">
      <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#A9462A] via-[#fbbf24] to-[#A9462A] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <Photo
        src={artist.portrait}
        alt={`Portrait of ${artist.name}`}
        className={`${className} relative shrink-0 rounded-full object-cover shadow-md ring-2 ring-white`}
      />
    </div>
  );
}

const Icon = ({ d, className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);
const SEARCH = "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z";
const CLOSE = "M6 18L18 6M6 6l12 12";
const LEFT = "M15 19l-7-7 7-7";
const RIGHT = "M9 5l7 7-7 7";
const USER = "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0";
const PIN = "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z";
const DOWN = "M19 9l-7 7-7-7";

const ring = "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#A9462A]";
const primaryBtn = `bg-gradient-to-b from-[#B54D2C] to-[#8F3A22] hover:from-[#A9462A] hover:to-[#7E321D] text-white font-semibold shadow-md hover:shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 ${ring}`;
const heroTile = `group relative block w-full cursor-pointer rounded-xl border border-white/20 bg-white/10 px-2 py-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#fbbf24]/50 hover:bg-white/20 active:scale-95 sm:rounded-2xl sm:px-3 sm:py-4 ${ring}`;

function ArtistCard({ artist, onOpen }) {
  return (
    <article className="ath-card group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(120,60,40,0.08)] ring-1 ring-[#EBD9CF]/50 hover:ring-[#A9462A]/30">
      <button
        type="button"
        onClick={() => onOpen(artist.id)}
        aria-label={`View ${artist.name}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-[#F1E4DC] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#A9462A]"
      >
        <Photo
          src={artist.image}
          alt={`Artwork by ${artist.name}`}
          className="ath-card-img h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-medium text-[#5C453B] backdrop-blur shadow-sm">
          Since {artist.since}
        </span>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#A9462A] via-[#fbbf24] to-[#A9462A] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
      </button>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-center gap-2.5">
          <Avatar artist={artist} className="h-10 w-10" />
          <div className="min-w-0">
            <h3 className={`${HEADING} truncate text-lg leading-snug text-[#1F1410]`}>{artist.name}</h3>
            <p className="truncate text-xs text-[#7A6258]">{artist.location}</p>
          </div>
        </div>
        <p className="mt-2 text-xs font-medium bg-gradient-to-r from-[#A9462A] to-[#d97706] bg-clip-text text-transparent">
          {artist.medium}
        </p>
        <p className="line-clamp-2 text-xs leading-relaxed text-[#5C453B]">{artist.bio}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="text-xs text-[#7A6258]">
            <span className="font-semibold text-[#A9462A]">{artist.works.length}</span> artworks
          </p>
          <button type="button" onClick={() => onOpen(artist.id)} className={`rounded-lg px-3.5 py-2 text-xs ${primaryBtn}`}>
            View artist
          </button>
        </div>
      </div>
    </article>
  );
}

function QuickView({ artist, position, total, onPrev, onNext, onClose }) {
  const closeRef = useRef(null);
  const [active, setActive] = useState(0);
  const works = artist.works?.length
    ? artist.works
    : [{ image: FALLBACK_ART_IMAGE, thumb: FALLBACK_ART_IMAGE, title: "Artwork" }];
  const work = works[active] || works[0];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-6 animate-[fadeIn_.25s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${artist.name} quick view`}
    >
      <div
        className="relative max-h-[94dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-[#FFF9F5] shadow-2xl ring-1 ring-[#EBD9CF] md:max-w-5xl md:rounded-3xl animate-[slideUp_.4s_cubic-bezier(.22,1,.36,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-20 h-0">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`absolute right-3 top-3 rounded-full bg-white/90 p-2.5 text-[#5C453B] shadow-md backdrop-blur hover:bg-white hover:text-[#A9462A] transition-colors cursor-pointer ${ring}`}
          >
            <Icon d={CLOSE} className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2">
          <div className="relative overflow-hidden">
            <Photo
              key={work.image}
              src={work.image}
              alt={`Artwork ${active + 1} by ${artist.name}`}
              className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full md:min-h-[440px] transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="flex min-w-0 flex-col gap-3 p-5 sm:p-8">
            <div className="flex items-center gap-3 sm:gap-4 md:pr-10">
              <Avatar artist={artist} className="h-12 w-12 sm:h-14 sm:w-14" />
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold tracking-[0.14em] bg-gradient-to-r from-[#A9462A] to-[#d97706] bg-clip-text text-transparent">
                  {artist.craft.toUpperCase()}
                </p>
                <h2 className={`${HEADING} text-2xl leading-tight text-[#1F1410] sm:text-3xl`}>{artist.name}</h2>
              </div>
            </div>

            <span className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm text-[#7A6258]">
              <Icon d={PIN} className="w-3.5 h-3.5 shrink-0" /> {artist.location} · Making art since {artist.since}
            </span>

            <p className="mt-1 text-base leading-relaxed text-[#3A2A22]">{artist.bio}</p>

            <blockquote className={`${HEADING} border-l-4 border-[#A9462A] pl-4 text-base italic leading-snug text-[#5C453B] sm:text-lg bg-gradient-to-r from-[#FBEFE9]/60 to-transparent py-2`}>
              "{artist.quote}"
            </blockquote>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-[#EBD9CF]">
              <p className="text-xs text-[#7A6258]">Artwork {active + 1} of {works.length}</p>
              <p className={`${HEADING} text-lg text-[#1F1410]`}>{work.title || artist.medium}</p>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Link to={work.artworkId ? `/artwork/${work.artworkId}` : DISCOVER_PATH} className={`w-full rounded-lg px-5 py-3 text-center text-sm sm:w-auto sm:py-2.5 ${primaryBtn}`}>
                Browse artworks
              </Link>
            </div>
          </div>
        </div>

        {works.length > 1 && (
          <div className="border-t border-[#EBD9CF] px-5 py-5 sm:px-8">
            <h3 className={`${HEADING} text-lg text-[#1F1410] sm:text-xl`}>Artworks by {artist.name}</h3>
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:gap-4">
              {works.map((w, i) => (
                <li key={i}>
                  <button type="button" onClick={() => setActive(i)} aria-pressed={i === active} aria-label={`Show artwork ${i + 1}`} className={`block w-full cursor-pointer text-left ${ring} rounded-xl`}>
                    <div className={`overflow-hidden rounded-xl bg-[#F1E4DC] transition-all duration-300 ${i === active ? "ring-2 ring-[#A9462A] ring-offset-2 ring-offset-[#FFF9F5] scale-[1.02]" : "opacity-70 hover:opacity-100 hover:scale-[1.02]"}`}>
                      <Photo src={w.thumb} alt={`Artwork ${i + 1} by ${artist.name}`} className="aspect-[16/10] w-full object-cover" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          className="flex items-center justify-between gap-2 border-t border-[#EBD9CF] px-3 py-3 text-sm text-[#7A6258] sm:px-8"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button type="button" onClick={onPrev} aria-label="Previous artist" className={`inline-flex items-center gap-1 rounded-lg px-3 py-2.5 hover:bg-white hover:text-[#A9462A] cursor-pointer transition-colors ${ring}`}>
            <Icon d={LEFT} /> Previous<span className="hidden sm:inline">&nbsp;artist</span>
          </button>
          <span className="font-medium text-[#A9462A]">{position} of {total}</span>
          <button type="button" onClick={onNext} aria-label="Next artist" className={`inline-flex items-center gap-1 rounded-lg px-3 py-2.5 hover:bg-white hover:text-[#A9462A] cursor-pointer transition-colors ${ring}`}>
            Next<span className="hidden sm:inline">&nbsp;artist</span> <Icon d={RIGHT} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Spotlight({ artist, onOpen }) {
  if (!artist) return null;
  const works = artist.works?.length
    ? artist.works
    : [{ image: FALLBACK_ART_IMAGE, thumb: FALLBACK_ART_IMAGE }];
  const work0 = works[0];
  const work1 = works[1] || work0;
  const work2 = works[2] || work0;

  return (
    <section className="ath-reveal relative mb-12 grid items-center gap-6 sm:mb-16 sm:gap-8 lg:grid-cols-5 lg:gap-12" aria-label={`Artist spotlight: ${artist.name}`}>
      <div className="absolute -inset-4 bg-[radial-gradient(ellipse_50%_70%_at_30%_50%,rgba(251,191,36,.18),transparent_70%)] pointer-events-none rounded-3xl" aria-hidden="true" />

      <div className="relative lg:col-span-3">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="col-span-2 group min-h-[200px] overflow-hidden rounded-2xl bg-[#F1E4DC] shadow-[0_20px_50px_rgba(120,60,40,0.18)] ring-1 ring-[#EBD9CF] sm:min-h-[260px] sm:rounded-3xl">
            <Photo src={work1.image} alt={`Featured artwork by ${artist.name}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="flex flex-col gap-2.5 sm:gap-4">
            <div className="group overflow-hidden rounded-xl bg-[#F1E4DC] shadow-md sm:rounded-2xl">
              <Photo src={work0.thumb} alt={`Artwork by ${artist.name}`} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="group overflow-hidden rounded-xl bg-[#F1E4DC] shadow-md sm:rounded-2xl">
              <Photo src={work2.thumb} alt={`Artwork by ${artist.name}`} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="mt-auto self-end ath-float">
              <Avatar artist={artist} className="h-14 w-14 sm:h-20 sm:w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative lg:col-span-2">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-[#A9462A]">
          <span className="inline-block h-px w-8 bg-gradient-to-r from-[#A9462A] to-transparent" />
          ARTIST SPOTLIGHT
        </p>
        <h2 className={`${HEADING} ath-grad-text text-3xl leading-tight sm:text-4xl lg:text-5xl`}>{artist.name}</h2>
        <p className="mt-2 text-sm text-[#7A6258]">{artist.medium} · {artist.location}</p>
        <p className="mt-4 text-base leading-relaxed text-[#3A2A22]">{artist.bio}</p>
        <blockquote className={`${HEADING} relative mt-5 border-l-4 border-[#A9462A] pl-4 text-xl italic leading-snug text-[#5C453B] sm:pl-5 sm:text-2xl`}>
          <span className="absolute -left-2 -top-3 text-5xl text-[#A9462A]/30 font-serif leading-none" aria-hidden="true">"</span>
          {artist.quote}
        </blockquote>
        <button type="button" onClick={() => onOpen(artist.id)} className={`mt-6 w-full rounded-xl px-7 py-3.5 text-sm sm:w-auto ${primaryBtn}`}>
          See {artist.name.split(" ")[0]}'s work
        </button>
      </div>
    </section>
  );
}

function Studio() {
  return (
    <section className="ath-reveal mb-12 sm:mb-16" aria-label="Inside the studio">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-[#A9462A]">
          <span className="inline-block h-px w-8 bg-gradient-to-r from-[#A9462A] to-transparent" />
          THE PROCESS
        </p>
        <h2 className={`${HEADING} ath-grad-text text-3xl leading-tight sm:text-4xl lg:text-5xl`}>
          What goes into a piece
        </h2>
        <p className="mt-3 text-base leading-relaxed text-[#5C453B] sm:text-lg">
          Original art is slow on purpose. Behind each work on Athenura are weeks of drying, firing, layering and carving, and an artist who decided when it was done.
        </p>
      </div>

      <div className="relative grid gap-5 sm:gap-6 lg:grid-cols-3">
        <div className="hidden lg:block absolute top-16 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-[#A9462A]/40 to-transparent pointer-events-none" aria-hidden="true" />

        {STUDIO.map((s, i) => (
          <article
            key={s.title}
            className={`ath-reveal ath-d${i + 1} group relative overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(120,60,40,0.08)] ring-1 ring-[#EBD9CF]/60 hover:ring-[#A9462A]/30 transition-all hover:-translate-y-1 md:flex lg:block`}
          >
            <div className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-[#A9462A]/20 text-xl sm:h-12 sm:w-12">
              {s.icon}
            </div>
            <div className="overflow-hidden md:w-5/12 md:shrink-0 lg:w-full">
              <Photo src={unsplash(s.image, 900)} alt={s.title} className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:aspect-auto md:h-full md:min-h-[220px] lg:aspect-[16/9] lg:h-auto lg:min-h-0" />
            </div>
            <div className="p-5 sm:p-6 md:flex md:flex-1 md:flex-col md:justify-center lg:block">
              <p className="text-[11px] font-bold tracking-[0.2em] text-[#A9462A]/70">STEP {String(i + 1).padStart(2, "0")}</p>
              <h3 className={`${HEADING} mt-1 text-xl text-[#1F1410] sm:text-2xl`}>{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5C453B]">{s.body}</p>
              <p className="mt-3 inline-block self-start rounded-full bg-[#FBEFE9] px-3 py-1 text-xs font-medium text-[#A9462A]">
                {s.note}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Artists() {
  const pageRef = useReveal();
  const [query, setQuery] = useState("");
  const [craft, setCraft] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef(null);

  const [backendArtists, setBackendArtists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchArtists = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/guest/get-all-artist`);
        if (!res.ok) {
          throw new Error("Failed to fetch artists");
        }
        const data = await res.json();
        if (
          active &&
          data.success &&
          Array.isArray(data.artists) &&
          data.artists.length > 0
        ) {
          setBackendArtists(data.artists.map(mapBackendArtist));
        }
      } catch (err) {
        console.error("Error loading artists from backend:", err);
        if (active) setError(err.message || "Failed to load artists");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchArtists();
    return () => {
      active = false;
    };
  }, []);

  const allArtists = useMemo(() => {
    if (backendArtists && backendArtists.length > 0) {
      return backendArtists;
    }
    return DEFAULT_ARTISTS;
  }, [backendArtists]);

  const sections = useMemo(() => {
    const known = new Set(BASE_SECTIONS.map((s) => s.craft));
    const dynamic = [];
    allArtists.forEach((a) => {
      if (a.craft && !known.has(a.craft)) {
        known.add(a.craft);
        dynamic.push({
          craft: a.craft,
          image: "1541701494587-cb58502866ab",
          chip: a.craft,
          eyebrow: `${a.craft} Artists`,
          title: `Original ${a.craft.toLowerCase()} creations`,
          link: `View all ${a.craft.toLowerCase()}`,
        });
      }
    });
    return [...BASE_SECTIONS, ...dynamic];
  }, [allArtists]);

  const chipLabel = useMemo(() => {
    return Object.fromEntries(
      sections.map((s) => [s.craft, s.chip || s.craft]),
    );
  }, [sections]);

  const crafts = useMemo(() => {
    const set = new Set();
    allArtists.forEach((a) => {
      if (a.craft) set.add(a.craft);
    });
    return ["All", ...Array.from(set)];
  }, [allArtists]);

  const totalWorks = useMemo(
    () => allArtists.reduce((n, a) => n + a.works.length, 0),
    [allArtists],
  );

  const collage = useMemo(() => {
    const thumbs = [
      ...new Set(
        allArtists.flatMap((a) => a.works.map((w) => w.thumb || w.image)),
      ),
    ].filter(Boolean);
    return thumbs.length >= 6 ? thumbs.slice(0, 12) : DEFAULT_COLLAGE;
  }, [allArtists]);

  const countOf = (c) =>
    c === "All"
      ? allArtists.length
      : allArtists.filter((a) => a.craft === c).length;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }, [videoFailed]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allArtists
      .filter((a) => {
        const text = `${a.name} ${a.medium} ${a.location} ${a.craft} ${
          chipLabel[a.craft] || a.craft
        }`.toLowerCase();
        return (craft === "All" || a.craft === craft) && text.includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allArtists, query, craft, chipLabel]);

  const { groups, ordered } = useMemo(() => {
    const grouped = sections
      .map((sec) => ({
        ...sec,
        items: results.filter((a) => a.craft === sec.craft),
      }))
      .filter((g) => g.items.length);

    return { groups: grouped, ordered: grouped.flatMap((g) => g.items) };
  }, [sections, results]);

  const isFiltering = query.trim() !== "" || craft !== "All";
  const spotlight =
    allArtists.find((a) => a.id === SPOTLIGHT_ID) || allArtists[0] || null;

  const selectedIndex = ordered.findIndex((a) => a.id === selectedId);
  const selected = selectedIndex >= 0 ? ordered[selectedIndex] : null;
  const step = (dir) => () => {
    if (!ordered.length) return;
    setSelectedId(ordered[(selectedIndex + dir + ordered.length) % ordered.length].id);
  };

  const openFromSpotlight = (id) => { setQuery(""); setCraft("All"); setSelectedId(id); };
  const reset = () => { setQuery(""); setCraft("All"); };

  const scrollToFilters = () => {
    const el = document.getElementById("artist-filters");
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  };
  const goToArtists = () => { reset(); scrollToFilters(); };
  const goToCrafts = () => scrollToFilters();

  return (
    <div ref={pageRef} className="ath-root min-h-screen bg-gradient-to-b from-[#FFFBF8] via-[#FBEFE9] to-[#F3DDD3] text-[#1F1410] antialiased overflow-x-clip">
      <style>{`
        .ath-root { --ath-nav: ${NAV_MOBILE}px; }
        @media (min-width: 1024px) { .ath-root { --ath-nav: ${NAV_DESKTOP}px; } }
        .ath-hero { min-height: calc(100vh - var(--ath-nav)); min-height: calc(100svh - var(--ath-nav)); }
        .ath-sticky { top: var(--ath-nav); scroll-margin-top: var(--ath-nav); }
        .ath-noscroll { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
        .ath-noscroll::-webkit-scrollbar { display: none; }

        @keyframes ath-gradient-shift { 0% { background-position: 0% center; } 100% { background-position: 100% center; } }
        @keyframes ath-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes ath-orb { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-30px) scale(1.1); } 66% { transform: translate(-20px,20px) scale(0.95); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

        .ath-reveal { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1); }
        .ath-reveal.ath-in { opacity: 1; transform: translateY(0); }
        .ath-reveal.ath-d1 { transition-delay: .08s; }
        .ath-reveal.ath-d2 { transition-delay: .16s; }
        .ath-reveal.ath-d3 { transition-delay: .24s; }

        .ath-grad-text {
          background: linear-gradient(110deg, #1F1410 0%, #A9462A 45%, #d97706 60%, #1F1410 100%);
          background-size: 220% auto;
          -webkit-background-clip: text; background-clip: text;
          color: transparent; -webkit-text-fill-color: transparent;
          animation: ath-gradient-shift 9s ease-in-out infinite alternate;
        }
        .ath-grad-text-light {
          background: linear-gradient(110deg, #fef3c7 0%, #f0d9a3 35%, #fbbf24 55%, #fef3c7 100%);
          background-size: 220% auto;
          -webkit-background-clip: text; background-clip: text;
          color: transparent; -webkit-text-fill-color: transparent;
          animation: ath-gradient-shift 9s ease-in-out infinite alternate;
        }

        .ath-float { animation: ath-float 6s ease-in-out infinite; }
        .ath-orb { animation: ath-orb 22s ease-in-out infinite; }

        .ath-card { transition: transform .5s cubic-bezier(.22,1,.36,1), box-shadow .5s, ring-color .3s; }
        .ath-card .ath-card-img { transition: transform .7s cubic-bezier(.22,1,.36,1), filter .5s; }
        @media (hover: hover) {
          .ath-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px -12px rgba(120,60,40,0.25); }
          .ath-card:hover .ath-card-img { transform: scale(1.08); filter: saturate(1.15); }
        }

        .ath-chip { transition: all .3s; position: relative; overflow: hidden; }
        .ath-chip::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(169,70,42,.15), rgba(217,119,6,.15));
          opacity: 0; transition: opacity .3s; pointer-events: none;
        }
        @media (hover: hover) { .ath-chip:hover::before { opacity: 1; } }

        .ath-group-band { position: relative; overflow: hidden; }
        .ath-group-band::before {
          content: ""; position: absolute; inset: 0;
          background-image: radial-gradient(circle at 20% 30%, rgba(251,191,36,.25), transparent 40%),
                            radial-gradient(circle at 80% 70%, rgba(169,70,42,.3), transparent 50%);
          opacity: 0; transition: opacity .6s;
        }
        @media (hover: hover) { .ath-group-band:hover::before { opacity: 1; } }

        @media (prefers-reduced-motion: reduce) {
          .ath-reveal { opacity: 1; transform: none; }
          .ath-grad-text, .ath-grad-text-light, .ath-float, .ath-orb { animation: none; }
          .ath-card:hover { transform: none; }
        }
      `}</style>

      <section className="ath-hero relative flex items-center overflow-hidden bg-gradient-to-br from-[#3B1C12] to-[#170D09]">
        {!videoFailed && (
          <video
            ref={videoRef}
            src={artistVideo}
            autoPlay loop muted playsInline preload="auto"
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden opacity-90"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#160B08]/80 via-[#1A0E0A]/60 to-[#1A0E0A]/70 sm:bg-gradient-to-r sm:from-[#160B08]/80 sm:via-[#1A0E0A]/55 sm:to-[#1A0E0A]/35" />
        <div className="ath-orb absolute top-[15%] left-[5%] h-40 w-40 rounded-full bg-[#A9462A]/30 blur-3xl sm:left-[10%] sm:h-64 sm:w-64" aria-hidden="true" />
        <div className="ath-orb absolute bottom-[10%] right-[5%] h-48 w-48 rounded-full bg-[#fbbf24]/20 blur-3xl sm:right-[15%] sm:h-80 sm:w-80" style={{ animationDelay: "-8s" }} aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-5xl px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-24 sm:pt-16 lg:pt-20">
          <p className="ath-reveal ath-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F1C9B8] backdrop-blur-md sm:mb-5 sm:px-4 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
            The makers
          </p>
          <h1 className={`${HEADING} ath-reveal ath-in ath-d1 ath-grad-text-light text-4xl leading-[1.1] min-[400px]:text-5xl sm:text-6xl sm:leading-[1.05] lg:text-7xl`}>
            Meet the artists
          </h1>
          <p className="ath-reveal ath-in ath-d2 mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#F1E4DC] sm:mt-5 sm:max-w-2xl sm:text-lg md:text-xl">
            Every piece on Athenura was made by a person with a story. Meet the painters, potters, sculptors and weavers behind the work, and see how they make it.
          </p>

          <div className="ath-reveal ath-in ath-d3 mx-auto mt-7 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            <button type="button" onClick={goToArtists} className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm ${primaryBtn}`}>
              Browse artists <Icon d={DOWN} />
            </button>
            <Link
              to={ARTIST_LOGIN_PATH}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#fbbf24]/60 hover:bg-white/20 active:scale-95 ${ring}`}
            >
              <Icon d={USER} /> Join as an artist
            </Link>
          </div>

          <ul className="ath-reveal ath-in ath-d3 mx-auto mt-8 grid max-w-xl grid-cols-3 gap-2 text-white sm:mt-10 sm:gap-4">
            {[
              { n: allArtists.length, label: "Independent artists", onClick: goToArtists },
              { n: sections.length, label: "Crafts", onClick: goToCrafts },
              { n: totalWorks, label: "Original works", to: DISCOVER_PATH },
            ].map(({ n, label, onClick, to }) => {
              const inner = (
                <>
                  <span className={`${HEADING} block text-2xl sm:text-4xl bg-gradient-to-br from-white via-[#F1E4DC] to-[#fbbf24] bg-clip-text text-transparent`}>
                    <AnimatedNumber value={n} />
                  </span>
                  <span className="mt-1 block text-[11px] leading-tight text-[#F1E4DC] sm:text-sm">{label}</span>
                </>
              );
              return (
                <li key={label}>
                  {to ? (
                    <Link to={to} aria-label={`${n} ${label}. Browse artworks`} className={heroTile}>{inner}</Link>
                  ) : (
                    <button type="button" onClick={onClick} aria-label={`${n} ${label}. View artists`} className={heroTile}>{inner}</button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          onClick={goToArtists}
          aria-label="Scroll to the artists"
          className={`absolute bottom-5 left-1/2 hidden h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 motion-safe:animate-bounce sm:flex ${ring}`}
        >
          <Icon d={DOWN} className="h-5 w-5" />
        </button>
      </section>

      <div id="artist-filters" className="ath-sticky sticky z-30 border-b border-[#EBD9CF]/80 bg-[#FFFBF8]/85 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-4 lg:px-12">
          <label className="group relative block w-full lg:w-80 lg:shrink-0">
            <span className="sr-only">Search artists</span>
            <Icon d={SEARCH} className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8938A] group-focus-within:text-[#A9462A] transition-colors" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by artist, material or place"
              className="w-full rounded-xl border border-[#E4D2C8] bg-white/90 py-2.5 pl-10 pr-4 text-base transition-all focus:border-[#A9462A] focus:outline-none focus:ring-2 focus:ring-[#A9462A]/25 focus:bg-white sm:py-2 sm:text-sm"
            />
          </label>

          <div className="ath-noscroll -mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label="Filter by art form">
            {crafts.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCraft(c)}
                aria-pressed={craft === c}
                className={`ath-chip shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all sm:py-1.5 ${ring} ${
                  craft === c
                    ? "bg-gradient-to-r from-[#1F1410] to-[#3B1C12] text-white shadow-md"
                    : "border border-[#E4D2C8] bg-white text-[#5C453B] hover:bg-[#F7E9E1] hover:border-[#A9462A]/40"
                }`}
              >
                {c === "All" ? "All artists" : (chipLabel[c] || c)}{" "}
                <span className={`${craft === c ? "opacity-80" : "opacity-60"}`}>{countOf(c)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-12">
        {!isFiltering && spotlight && <Spotlight artist={spotlight} onOpen={openFromSpotlight} />}

        {isFiltering && (
          <div className="ath-reveal mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-white/70 px-4 py-3 text-sm text-[#7A6258] ring-1 ring-[#EBD9CF]" aria-live="polite">
            <p>
              <span className="font-semibold text-[#A9462A]">{results.length}</span>{" "}
              {results.length === 1 ? "artist" : "artists"} found
            </p>
            <button type="button" onClick={reset} className="cursor-pointer py-1 font-semibold text-[#A9462A] underline underline-offset-4 hover:text-[#8F3A22] transition-colors">
              Clear filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-[#7A6258]">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#A9462A] border-t-transparent" />
            <p className="text-sm">Loading artists from studio...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="ath-reveal py-12 text-center sm:py-16">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#FBEFE9] text-4xl">🔍</div>
            <h2 className={`${HEADING} ath-grad-text text-2xl sm:text-3xl`}>No artists found</h2>
            <p className="mt-2 text-[#7A6258]">Try a different name, material or place.</p>
            <button type="button" onClick={reset} className={`mt-6 rounded-xl px-6 py-3 text-sm ${primaryBtn}`}>
              Show all artists
            </button>
          </div>
        ) : (
          groups.map((g, gi) => (
            <section key={g.craft} className="mb-10 sm:mb-12">
              <div className={`ath-reveal ath-group-band relative mb-5 overflow-hidden rounded-2xl bg-[#2A1510] transition-all duration-500 ${"ath-d" + ((gi % 3) + 1)}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(251,191,36,.15),transparent_50%)]" />
                <div className="relative flex min-h-[5rem] flex-col justify-center gap-1.5 px-5 py-3 sm:min-h-[6rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-7 sm:py-4">
                  <div>
                    <p className="mb-0.5 inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#F1C9B8]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
                      {g.eyebrow.toUpperCase()}
                    </p>
                    <h2 className={`${HEADING} text-lg leading-tight text-white sm:text-xl lg:text-2xl`}>{g.title}</h2>
                  </div>
                  <Link to={DISCOVER_PATH} className="group inline-flex shrink-0 items-center gap-1 self-start text-xs font-medium text-white underline underline-offset-4 decoration-[#fbbf24]/50 hover:decoration-[#fbbf24] transition-colors sm:self-auto sm:text-sm">
                    {g.link}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {g.items.map((a, ai) => (
                  <div key={a.id} className={`ath-reveal ath-d${(ai % 3) + 1}`}>
                    <ArtistCard artist={a} onOpen={setSelectedId} />
                  </div>
                ))}
              </div>
            </section>
          ))
        )}

        {!isFiltering && <Studio />}

        <section className="ath-reveal relative overflow-hidden rounded-3xl bg-[#2A1510] ring-1 ring-[#3B1C12]">
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 sm:grid-cols-6 sm:grid-rows-2" aria-hidden="true">
            {collage.map((src) => (
              <img key={src} src={src} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = "hidden")} className="h-full w-full object-cover" />
            ))}
          </div>
          <div className="absolute inset-0 bg-[#1A0E0A]/80" />
          <div className="ath-orb absolute top-[20%] left-[10%] h-40 w-40 rounded-full bg-[#A9462A]/40 blur-3xl sm:h-64 sm:w-64" aria-hidden="true" />
          <div className="ath-orb absolute bottom-[15%] right-[10%] h-44 w-44 rounded-full bg-[#fbbf24]/25 blur-3xl sm:h-72 sm:w-72" style={{ animationDelay: "-10s" }} aria-hidden="true" />

          <div className="relative mx-auto flex min-h-[420px] max-w-3xl flex-col items-center justify-center px-5 py-12 text-center sm:min-h-[480px] sm:px-12 sm:py-20">
            <p className="ath-reveal mb-4 inline-flex items-center gap-2 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#fbbf24] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
              Join us
            </p>
            <h2 className={`${HEADING} ath-reveal ath-d1 ath-grad-text-light text-3xl leading-tight sm:text-5xl lg:text-6xl`}>
              Every artist is welcome
            </h2>
            <p className="ath-reveal ath-d2 mt-4 text-base leading-relaxed text-[#F1E4DC] sm:text-lg">
              Athenura is open to artists of every craft and background. Whether you are trained or self-taught, working full-time or just starting out, you can share your work here and reach buyers across the country.
            </p>

            <ul className="ath-reveal ath-d3 mt-6 flex flex-wrap justify-center gap-2" aria-label="Kinds of artists on Athenura">
              {WELCOME.map((w) => (
                <li key={w} className="ath-chip rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs text-white hover:border-[#fbbf24]/60 hover:bg-white/15 transition-all cursor-default sm:px-4 sm:text-sm">
                  {w}
                </li>
              ))}
            </ul>

            <div className="ath-reveal ath-d3 mt-8 flex w-full flex-col items-center">
              <Link
                to={ARTIST_LOGIN_PATH}
                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-[#8F3A22] hover:bg-[#FBEFE9] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#A9462A]/30 hover:shadow-xl hover:shadow-[#A9462A]/40 sm:w-auto"
              >
                <Icon d={USER} /> Artist login
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <p className="mt-3 text-sm text-[#E7D3C8]">
                New to Athenura? You can create your account from the login page.
              </p>
            </div>
          </div>
        </section>
      </main>

      {selected && (
        <QuickView
          key={selected.id}
          artist={selected}
          position={selectedIndex + 1}
          total={ordered.length}
          onPrev={step(-1)}
          onNext={step(1)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}