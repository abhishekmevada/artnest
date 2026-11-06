import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import discVideo from "../../assets/disc.mp4";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  Heart,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Eye,
  ArrowUpRight,
  ShoppingBag,
  Check,
  MapPin,
  Ruler,
  Sparkles,
  Star,
  ArrowLeft,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

const ITEMS_PER_PAGE = 6;
const EASE = [0.16, 1, 0.3, 1];
const SORTS = [
  "Curated / Recommended",
  "Price: Low to High",
  "Price: High to Low",
  "Newest Arrivals",
];
const SIZES = ["Small (< 40 cm)", "Medium (40–100 cm)", "Large (> 100 cm)"];

const CATEGORIES = [
  { id: "paintings", label: "Paintings", count: 0 },
  { id: "sculptures", label: "Sculptures", count: 0 },
  { id: "ceramics", label: "Ceramics & Pottery", count: 0 },
  { id: "photography", label: "Photography", count: 0 },
  { id: "digital", label: "Digital & New Media", count: 0 },
  { id: "textile", label: "Textile & Fiber Art", count: 0 },
  { id: "printmaking", label: "Printmaking & Monotype", count: 0 },
];

const QUICK_PICKS = [
  { id: "paintings", label: "Paintings" },
  { id: "sculptures", label: "Sculptures" },
  { id: "ceramics", label: "Ceramics" },
  { id: "photography", label: "Photography" },
];

const MEDIUMS = [
  "Oil",
  "Acrylic",
  "Stoneware",
  "Bronze",
  "Linen",
  "Archival Ink",
  "Marble",
  "Porcelain",
  "Watercolor",
  "Charcoal",
  "Wood",
  "Glass",
];

const U = (id) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=900&auto=format&fit=crop`;
const loadArtistArtworks = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("artnest_artist_artworks")) || []
    ).filter((a) => a.status === "Published" && a.img);
  } catch {
    return [];
  }
};

const longestSide = (dims = "") =>
  Math.max(0, ...(dims.match(/\d+(\.\d+)?/g) || []).map(Number));
const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label;
const scrollToToolbar = () =>
  document
    .querySelector(".disc-toolbar")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

function Chip({ active, onClick, children }) {
  return (
    <button
      className={`disc-chip ${active ? "is-active" : ""}`}
      onClick={onClick}
      type="button"
      aria-pressed={active}
    >
      {active && <Check size={12} strokeWidth={2.4} />}
      {children}
    </button>
  );
}

function Checkbox({ checked, onChange, label, count }) {
  return (
    <label className="disc-checkrow">
      <input
        type="checkbox"
        className="disc-sr"
        checked={checked}
        onChange={onChange}
      />
      <span className={`disc-checkbox ${checked ? "is-checked" : ""}`}>
        <motion.svg
          viewBox="0 0 12 10"
          initial={false}
          animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.6 }}
          transition={{ duration: 0.15 }}
        >
          <path
            d="M1 5L4.2 8.2L11 1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </span>
      <span className="disc-checklabel">{label}</span>
      {typeof count === "number" && (
        <span className="disc-checkcount">{count}</span>
      )}
    </label>
  );
}

function Hero({ query, setQuery, onPick }) {
  const reduce = useReducedMotion();
  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });
  const slide = (delay) => ({
    initial: reduce ? false : { y: "115%" },
    animate: { y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <section className="disc-hero">
      <video
        className="disc-hero-bg"
        src={discVideo}
        poster="https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=1920&auto=format&fit=crop"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="disc-hero-scrim" aria-hidden="true" />

      <div className="disc-hero-inner">
        <motion.p className="disc-hero-eyebrow" {...rise(0)}>
          <Sparkles size={13} /> The Foundry Collection
        </motion.p>

        <h1 className="disc-hero-title">
          <span className="disc-line">
            <motion.span {...slide(0.1)}>Original works, chosen</motion.span>
          </span>
          <span className="disc-line">
            <motion.span className="disc-title-accent" {...slide(0.25)}>
              by hand, held in trust.
            </motion.span>
          </span>
        </h1>

        <motion.p className="disc-hero-sub" {...rise(0.4)}>
          Browse a living archive of paintings, sculpture, ceramics and print,
          each piece vetted by a curator before it reaches you.
        </motion.p>

        <motion.form
          className="disc-hero-search"
          {...rise(0.52)}
          onSubmit={(e) => {
            e.preventDefault();
            scrollToToolbar();
          }}
        >
          <Search size={18} strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or artist…"
            aria-label="Search artworks"
          />
          {query && (
            <button
              type="button"
              className="disc-hero-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <button type="submit" className="disc-hero-go">
            Explore
          </button>
        </motion.form>

        <motion.div className="disc-hero-quick" {...rise(0.64)}>
          <span>Popular</span>
          {QUICK_PICKS.map((p) => (
            <button key={p.id} type="button" onClick={() => onPick(p.id)}>
              {p.label}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="disc-hero-fade" aria-hidden="true" />
      <button
        type="button"
        className="disc-hero-scroll"
        onClick={scrollToToolbar}
        aria-label="Scroll to artworks"
      >
        <ChevronDown size={18} />
      </button>
    </section>
  );
}

function Sidebar({
  categories = CATEGORIES,
  activeCategories,
  toggleCategory,
  price,
  setPrice,
  mediums,
  toggleMedium,
  size,
  setSize,
  onClear,
  mobileOpen,
  setMobileOpen,
}) {
  const reduce = useReducedMotion();
  const pct = ((price[1] - 100) / (100000 - 100)) * 100;
  const content = (
    <>
      <div className="disc-sidebar-head">
        <h3>Filters</h3>
        <button className="disc-clear" onClick={onClear} type="button">
          Clear all
        </button>
      </div>

      <div className="disc-filter-group">
        <h4>Category</h4>
        {categories.map((c) => (
          <Checkbox
            key={c.id}
            checked={activeCategories.includes(c.id)}
            onChange={() => toggleCategory(c.id)}
            label={c.label}
            count={c.count}
          />
        ))}
      </div>

      <div className="disc-filter-group">
        <h4>Maximum price</h4>
        <div className="disc-price-labels">
          <span>₹{price[0].toLocaleString()}</span>
          <strong>
            ₹{price[1].toLocaleString()}
            {price[1] >= 9500 ? "+" : ""}
          </strong>
        </div>
        <input
          className="disc-range"
          type="range"
          min={100}
          max={100000}
          step={500}
          value={price[1]}
          style={{ "--pct": `${pct}%` }}
          onChange={(e) => setPrice([price[0], Number(e.target.value)])}
          aria-label="Maximum price"
        />
      </div>

      <div className="disc-filter-group">
        <h4>Medium & material</h4>
        <div className="disc-pillwrap">
          {MEDIUMS.map((m) => (
            <Chip
              key={m}
              active={mediums.includes(m)}
              onClick={() => toggleMedium(m)}
            >
              {m}
            </Chip>
          ))}
        </div>
      </div>

      <div className="disc-filter-group">
        <h4>Size</h4>
        {SIZES.map((s) => (
          <label key={s} className="disc-radiorow">
            <input
              type="radio"
              name="disc-size"
              className="disc-sr"
              checked={size === s}
              onChange={() => setSize(s)}
            />
            <span className={`disc-radio ${size === s ? "is-checked" : ""}`}>
              <span className="disc-radio-dot" />
            </span>
            <span>{s}</span>
          </label>
        ))}
      </div>
    </>
  );

  return (
    <>
      <motion.aside
        className="disc-sidebar"
        initial={reduce ? false : { opacity: 0, x: -36 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "0px 0px -60px 0px" }}
        transition={{ duration: 0.85, ease: EASE }}
      >
        {content}
      </motion.aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="disc-drawer-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="disc-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              <button
                className="disc-drawer-close"
                onClick={() => setMobileOpen(false)}
                type="button"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
              {content}
              <button
                className="disc-acquire disc-drawer-apply"
                type="button"
                onClick={() => setMobileOpen(false)}
              >
                Show results
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ArtworkCard({
  art,
  index,
  view,
  favorite,
  toggleFavorite,
  onOpen,
  onPreview,
}) {
  const reduce = useReducedMotion();
  const delay = view === "list" ? 0 : (index % 3) * 0.1;
  return (
    <motion.article
      className={`disc-card ${view === "list" ? "is-list" : ""}`}
      initial={reduce ? false : { opacity: 0, y: 36, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      <div className="disc-card-media" onClick={() => onOpen(art)}>
        <img src={art.img} alt={art.title} loading="lazy" />
        <span className="disc-card-tag">{art.tag}</span>
        <button
          className="disc-card-peek"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(art);
          }}
        >
          <Eye size={14} /> Quick view
        </button>
      </div>
      <button
        className={`disc-fav ${favorite ? "is-fav" : ""}`}
        onClick={() => toggleFavorite(art.id)}
        type="button"
        aria-label={favorite ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={favorite}
      >
        <motion.span whileTap={{ scale: 0.75 }} style={{ display: "flex" }}>
          <Heart
            size={16}
            strokeWidth={1.8}
            fill={favorite ? "currentColor" : "none"}
          />
        </motion.span>
      </button>

      <div className="disc-card-body">
        <p className="disc-card-artist">{art.artist}</p>
        <h3 className="disc-card-title">{art.title}</h3>
        <p className="disc-card-meta">
          <MapPin size={12} /> {art.location}
        </p>
        <p className="disc-card-medium">
          <Ruler size={12} /> {art.medium} · {art.dims}
        </p>

        <div className="disc-card-footer">
          <div>
            <span className="disc-card-value-label">Current value</span>
            <span className="disc-card-value">
              ₹{art.value.toLocaleString()}
            </span>
          </div>
          <button
            className="disc-acquire"
            type="button"
            onClick={() => onOpen(art)}
          >
            View <ArrowUpRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function ArtReviewsPanel({ art, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const artworkId = art?._id || art?.id;

  useEffect(() => {
    const fetchReviews = async () => {
      if (!artworkId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/reviews/${artworkId}`);
        if (!res.ok) {
          throw new Error("Failed to load reviews");
        }
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [artworkId]);

  const avg = reviews.length
    ? (
        reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) /
        reviews.length
      ).toFixed(1)
    : 0;

  const stars = (n, size = 15) => (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          color={i <= n ? "#D8A53A" : "#D5D9D2"}
          fill={i <= n ? "#D8A53A" : "none"}
        />
      ))}
    </span>
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        background: "#F5F0E6",
        display: "flex",
        flexDirection: "column",
        borderRadius: "inherit",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid rgba(0,0,0,.1)",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                width: 24,
                height: 24,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color: "inherit",
                opacity: 0.7,
              }}
            >
              <ArrowLeft size={18} />
            </button>
            Reviews
          </h3>
          <p style={{ margin: "2px 0 0 34px", fontSize: 13, opacity: 0.65 }}>
            {art.title}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reviews"
          style={{
            border: "none",
            background: "rgba(0,0,0,.06)",
            width: 36,
            height: 36,
            borderRadius: "50%",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {loading ? (
          <p
            style={{
              textAlign: "center",
              marginTop: 40,
              fontSize: 14,
              opacity: 0.65,
            }}
          >
            Loading reviews...
          </p>
        ) : error ? (
          <p
            style={{
              textAlign: "center",
              marginTop: 40,
              fontSize: 14,
              color: "#c0392b",
            }}
          >
            {error}
          </p>
        ) : reviews.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              marginTop: 40,
              fontSize: 14,
              opacity: 0.65,
            }}
          >
            No reviews yet for this artwork.
          </p>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 700 }}>{avg}</span>
              {stars(Math.round(avg), 18)}
              <span style={{ fontSize: 13, opacity: 0.65 }}>
                ({reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gap: 14,
              }}
            >
              {reviews.map((r, i) => {
                const reviewerName =
                  r.buyer_id?.name || r.name || "Verified buyer";
                const reviewText = r.comment || r.text || r.review || "";
                const reviewDate = r.createdAt || r.date;
                const replyText =
                  r.reply?.text ||
                  r.reply?.reply ||
                  (typeof r.reply === "string" ? r.reply : "");
                const artistName =
                  r.reply?.artist_id?.name || art.artist || "Artist";

                return (
                  <li
                    key={r._id || i}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: 14,
                      border: "1px solid rgba(0,0,0,.08)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <strong style={{ fontSize: 14 }}>{reviewerName}</strong>
                      {reviewDate && (
                        <span style={{ fontSize: 12, opacity: 0.6 }}>
                          {new Date(reviewDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <div style={{ margin: "6px 0" }}>
                      {stars(Number(r.rating) || 5)}
                    </div>
                    {reviewText && (
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                        {reviewText}
                      </p>
                    )}
                    {replyText && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: "#F5F0E6",
                          borderLeft: "3px solid #96702f",
                        }}
                      >
                        <strong style={{ fontSize: 12, color: "#6f5222" }}>
                          Reply from {artistName}
                        </strong>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 13.5,
                            lineHeight: 1.5,
                          }}
                        >
                          {replyText}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function ArtworkDetailModal({ art, onClose, favorite, toggleFavorite }) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [toast, setToast] = useState("");
  const [showReviews, setShowReviews] = useState(false);
  const gallery = (art?.images?.length ? art.images : [art?.img])
    .filter(Boolean)
    .slice(0, 3);
  const [activeImg, setActiveImg] = useState(gallery[0]);
  const { inCart, toggleCart } = useCart();
  const { blockIfArtist } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showFullImage) setShowFullImage(false);
      else if (showReviews) setShowReviews(false);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [showFullImage, showReviews, onClose]);

  if (!art) return null;

  const carted = inCart.has(art.id);
  const handleWishlist = () => {
    toggleFavorite(art.id);
    setToast(favorite ? "Removed from wishlist" : "Added to wishlist");
  };
  const handleCart = () => {
    if (blockIfArtist()) return;
    if (carted) return navigate("/cart");
    toggleCart(art);
    setToast("Added to cart");
  };

  return (
    <>
      <motion.div
        className="disc-modal-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="disc-modal-wrap">
        <motion.div
          className="disc-modal"
          role="dialog"
          aria-modal="true"
          aria-label={art.title}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <button
            className="disc-modal-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          {showReviews && (
            <ArtReviewsPanel art={art} onClose={() => setShowReviews(false)} />
          )}

          <div className="disc-modal-media">
            <img src={activeImg} alt={art.title} />
            <div
              style={{
                position: "absolute",
                left: 14,
                right: 14,
                bottom: 14,
                zIndex: 2,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              {gallery.map((image, i) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImg(image)}
                  aria-label={`View image ${i + 1}`}
                  style={{
                    padding: 0,
                    height: 62,
                    overflow: "hidden",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: "#fff",
                    border:
                      activeImg === image
                        ? "2px solid #96702f"
                        : "2px solid rgba(255,255,255,.85)",
                    boxShadow: "0 4px 12px rgba(0,0,0,.25)",
                    opacity: activeImg === image ? 1 : 0.85,
                  }}
                >
                  <img
                    src={image}
                    alt={`${art.title} view ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </button>
              ))}
            </div>
            <button
              className="disc-modal-preview"
              type="button"
              onClick={() => setShowFullImage(true)}
              aria-label="View full image"
            >
              <Eye size={22} strokeWidth={1.6} />
            </button>
          </div>

          <div className="disc-modal-body">
            <span className="disc-modal-tag">{art.tag}</span>
            <h2 className="disc-modal-title">{art.title}</h2>
            <p className="disc-modal-artist">
              {art.artist} <span>· {art.location}</span>
            </p>

            <div className="disc-modal-specs">
              <div>
                <span>Medium</span>
                <p>{art.medium}</p>
              </div>
              <div>
                <span>Dimensions</span>
                <p>{art.dims}</p>
              </div>
              <div>
                <span>Category</span>
                <p>{catLabel(art.category)}</p>
              </div>
            </div>

            <div className="disc-modal-desc">
              <h4>About this piece</h4>
              {art.description && <p>{art.description}</p>}
              <p>
                "{art.title}" is an original work by {art.artist}, created in{" "}
                {art.location}. Rendered in {art.medium.toLowerCase()}, it
                measures {art.dims} and belongs to our{" "}
                {catLabel(art.category)?.toLowerCase()} collection. Each work is
                inspected and catalogued by our curators before listing, so
                condition, provenance and authenticity meet gallery standard.
              </p>
            </div>

            <div className="disc-modal-provenance">
              <div>
                <span className="disc-modal-provenance-label">Provenance</span>
                <p>
                  Acquired directly from the artist's studio in {art.location}.
                  Certificate of authenticity included.
                </p>
              </div>
              <div>
                <span className="disc-modal-provenance-label">
                  Shipping & framing
                </span>
                <p>
                  Ships in protective archival packaging within 5–9 business
                  days. Custom framing available on request.
                </p>
              </div>
            </div>

            <div className="disc-modal-footer">
              <div>
                <span className="disc-card-value-label">Current value</span>
                <span className="disc-modal-value">
                  ₹{art.value.toLocaleString()}
                </span>
              </div>
              <div className="disc-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowReviews(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 44,
                    padding: "0 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,.15)",
                    background: "transparent",
                    fontSize: 12.5,
                    cursor: "pointer",
                    color: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Star size={15} /> View reviews
                </button>
                <AnimatePresence>
                  {toast && (
                    <motion.span
                      key={toast}
                      className="disc-modal-toast"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check size={12} strokeWidth={2.4} /> {toast}
                    </motion.span>
                  )}
                </AnimatePresence>
                <button
                  className={`disc-wish-btn ${favorite ? "is-fav" : ""}`}
                  type="button"
                  onClick={handleWishlist}
                  data-tip={
                    favorite ? "Remove from wishlist" : "Add to wishlist"
                  }
                  aria-label={
                    favorite ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <motion.span
                    whileTap={{ scale: 0.8 }}
                    style={{ display: "flex" }}
                  >
                    <Heart
                      size={18}
                      strokeWidth={1.8}
                      fill={favorite ? "currentColor" : "none"}
                    />
                  </motion.span>
                </button>
                <button
                  className="disc-acquire is-lg"
                  type="button"
                  onClick={handleCart}
                >
                  <ShoppingBag size={16} strokeWidth={1.9} />
                  {carted ? "View cart" : "Add to cart"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showFullImage && (
          <motion.div
            className="disc-fullimage-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullImage(false)}
          >
            <img src={activeImg} alt={art.title} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  const { user, blockIfArtist } = useAuth();
  const [searchParams] = useSearchParams();
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState([]);
  const [price, setPrice] = useState([100, 100000]);
  const [mediums, setMediums] = useState([]);
  const [size, setSize] = useState("");
  const [sort, setSort] = useState(SORTS[0]);
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState("grid");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedArt, setSelectedArt] = useState(null);
  const [previewArt, setPreviewArt] = useState(null);
  const { favorites, toggle } = useWishlist();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlist, setWishlist] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("artnest-wishlist")) ||
        JSON.parse(localStorage.getItem("artnest_wishlist")) ||
        []
      );
    } catch {
      return [];
    }
  });

  // Fetch user's wishlist from backend when authenticated
  useEffect(() => {
    const fetchUserWishlist = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token || !user || user?.role !== "buyer") {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/buyer/get-wishlist-item`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch wishlist");
        }

        const data = await response.json();
        const serverWishlist = (data.wishlistArtwork || [])
          .filter((item) => item.artwork_id)
          .map((item) => {
            const art = item.artwork_id;
            return {
              _id: art._id || art,
              id: art._id || art,
              wishlistId: item._id,
              artworkId: art.artworkId || art._id,
              title: art.title,
              artist: art.artist_id?.name || art.artist || "Unknown Artist",
              medium: art.medium,
              price:
                typeof art.price === "number"
                  ? `₹${art.price.toLocaleString("en-IN")}`
                  : art.price,
              img: art.image?.[0]?.url || art.img || "/placeholder.png",
            };
          });

        setWishlist(serverWishlist);
        localStorage.setItem(
          "artnest-wishlist",
          JSON.stringify(serverWishlist),
        );
      } catch (err) {
        console.error("Error fetching user wishlist:", err);
      }
    };

    fetchUserWishlist();
  }, [user]);

  const isWishlisted = (artId) => {
    return (
      wishlist.some(
        (item) =>
          item._id === artId || item.artworkId === artId || item.id === artId,
      ) || favorites.has(artId)
    );
  };

  useEffect(() => {
    if (!previewArt) return;
    const onKey = (e) => e.key === "Escape" && setPreviewArt(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [previewArt]);
  const ARTWORKS = artworks;

  // Dynamic category counts calculated from published artworks
  const categoryCounts = useMemo(() => {
    const counts = {};
    artworks.forEach((art) => {
      const cat = (art.category || "").toLowerCase().trim();
      CATEGORIES.forEach((base) => {
        const baseId = base.id.toLowerCase();
        const baseSingular = baseId.replace(/s$/, "");
        if (
          cat === baseId ||
          cat === baseSingular ||
          base.label.toLowerCase().includes(cat) ||
          cat.includes(baseSingular)
        ) {
          counts[base.id] = (counts[base.id] || 0) + 1;
        }
      });
    });
    return counts;
  }, [artworks]);

  const dynamicCategories = useMemo(() => {
    return CATEGORIES.map((c) => ({
      ...c,
      count: categoryCounts[c.id] || 0,
    }));
  }, [categoryCounts]);

  useEffect(() => {
    const c = searchParams.get("category");
    if (c && CATEGORIES.some((x) => x.id === c)) setActiveCategories([c]);
  }, [searchParams]);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setQuery(s);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [activeCategories, price, query, mediums, size, sort]);

  const toggleCategory = (id) =>
    setActiveCategories((p) =>
      p.includes(id) ? p.filter((c) => c !== id) : [...p, id],
    );
  const toggleMedium = (m) =>
    setMediums((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]));

  const toggleFavorite = async (artOrId) => {
    const art =
      typeof artOrId === "object"
        ? artOrId
        : ARTWORKS.find((a) => a.id === artOrId);
    const targetId = art?.id || art?._id || artOrId;
    if (!targetId) return;

    if (blockIfArtist && blockIfArtist()) return;

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!user || !token) {
      navigate("/buyer/login");
      return;
    }

    if (user.role !== "buyer") {
      alert("Only buyers can add artworks to their wishlist.");
      return;
    }

    const alreadyExists = wishlist.some(
      (item) =>
        item._id === targetId ||
        item.artworkId === targetId ||
        item.id === targetId,
    );

    if (alreadyExists) {
      const existingItem = wishlist.find(
        (item) =>
          item._id === targetId ||
          item.artworkId === targetId ||
          item.id === targetId,
      );
      const removeId = existingItem?.wishlistId || targetId;

      const previousWishlist = [...wishlist];
      const updatedWishlist = wishlist.filter(
        (item) =>
          item._id !== targetId &&
          item.artworkId !== targetId &&
          item.id !== targetId,
      );
      setWishlist(updatedWishlist);
      localStorage.setItem(
        "artnest-wishlist",
        JSON.stringify(updatedWishlist),
      );
      if (art) toggle(art);

      try {
        const response = await fetch(
          `${API_BASE_URL}/buyer/remove-wishlist-item/${removeId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to remove from wishlist");
        }
      } catch (err) {
        console.error("Error removing from wishlist:", err);
        setWishlist(previousWishlist);
        localStorage.setItem(
          "artnest-wishlist",
          JSON.stringify(previousWishlist),
        );
      }
    } else {
      const previousWishlist = [...wishlist];
      const optimisticItem = {
        _id: targetId,
        id: targetId,
        artworkId: art?.artworkId || targetId,
        title: art?.title || "Artwork",
        artist: art?.artist || "Artist",
        medium: art?.medium || "",
        price: art?.value
          ? `₹${art.value.toLocaleString("en-IN")}`
          : art?.price || "",
        img: art?.img || "/placeholder.png",
      };
      const updatedWishlist = [...wishlist, optimisticItem];
      setWishlist(updatedWishlist);
      localStorage.setItem(
        "artnest-wishlist",
        JSON.stringify(updatedWishlist),
      );
      if (art) toggle(art);

      try {
        const response = await fetch(
          `${API_BASE_URL}/buyer/wishlist-item/${targetId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          if (data?.message !== "Artwork Already In Wishlist") {
            throw new Error(data?.message || "Failed to add to wishlist");
          }
        }

        if (data?.item?._id) {
          setWishlist((prev) =>
            prev.map((item) =>
              item._id === targetId || item.id === targetId
                ? { ...item, wishlistId: data.item._id }
                : item,
            ),
          );
        }
      } catch (err) {
        console.error("Error adding to wishlist:", err);
        setWishlist(previousWishlist);
        localStorage.setItem(
          "artnest-wishlist",
          JSON.stringify(previousWishlist),
        );
      }
    }
  };
  const clearAll = () => {
    setActiveCategories([]);
    setPrice([100, 100000]);
    setMediums([]);
    setSize("");
    setQuery("");
  };
  const pickCategory = (id) => {
    setActiveCategories([id]);
    scrollToToolbar();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = ARTWORKS.filter((a) => {
      if (activeCategories.length && !activeCategories.includes(a.category))
        return false;
      if (price[1] < 100000 && a.value > price[1]) return false;
      if (q && !`${a.title} ${a.artist} ${a.medium}`.toLowerCase().includes(q))
        return false;
      if (
        mediums.length &&
        !mediums.some((m) => a.medium.toLowerCase().includes(m.toLowerCase()))
      )
        return false;
      if (size) {
        const s = longestSide(a.dims);
        if (size.startsWith("Small") && !(s < 40)) return false;
        if (size.startsWith("Medium") && !(s >= 40 && s <= 100)) return false;
        if (size.startsWith("Large") && !(s > 100)) return false;
      }
      return true;
    });
    if (sort === "Price: Low to High") list.sort((a, b) => a.value - b.value);
    if (sort === "Price: High to Low") list.sort((a, b) => b.value - a.value);
    if (sort === "Newest Arrivals") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [ARTWORKS, activeCategories, price, query, mediums, size, sort]);

  const goToPage = (n) => {
    setPage(n);
    scrollToToolbar();
  };
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const activeChips = [
    ...activeCategories.map((id) => ({
      key: `c-${id}`,
      label: catLabel(id),
      remove: () => toggleCategory(id),
    })),
    ...mediums.map((m) => ({
      key: `m-${m}`,
      label: m,
      remove: () => toggleMedium(m),
    })),
    ...(size ? [{ key: "size", label: size, remove: () => setSize("") }] : []),
    ...(price[1] < 100000
      ? [
          {
            key: "price",
            label: `Up to ₹${price[1].toLocaleString("en-IN")}`,
            remove: () => setPrice([100, 100000]),
          },
        ]
      : []),
  ];

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/guest/get-all-artwork`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch artworks");
        }

        const data = await response.json();

        // Only display artworks with published status
        const publishedArtworks = (data.getAllArtwork || []).filter(
          (artwork) => artwork.status === "published",
        );

        // Convert backend data into the frontend structure
        const formattedArtworks = publishedArtworks.map((artwork) => {
          let cat = (artwork.category || "").toLowerCase().trim();
          if (cat === "painting") cat = "paintings";
          else if (cat === "sculpture") cat = "sculptures";
          else if (cat === "ceramic") cat = "ceramics";
          else if (cat === "photo") cat = "photography";
          else if (cat === "print") cat = "printmaking";

          return {
            id: artwork._id,
            _id: artwork._id,
            artworkId: artwork.artworkId,

            title: artwork.title || "Untitled Artwork",
            artist: artwork.artist_id?.name || "Unknown Artist",
            artistId: artwork.artist_id?._id || "",

            category: cat,
            description: artwork.description || "",

            medium: artwork.medium || "Not specified",
            dims: artwork.dimensions || "Not specified",
            location: artwork.location || "Not specified",

            value: Number(artwork.price) || 0,

            tag:
              artwork.tag ||
              artwork.stock_label ||
              artwork.category ||
              "Original Artwork",

            // Keep all Cloudinary images for the detail modal
            images: (artwork.image || [])
              .map((image) => image.url)
              .filter(Boolean),

            // First image for the artwork card
            img: artwork.image?.[0]?.url || "/placeholder.png",

            status: artwork.status,
            moderation_status: artwork.moderation_status,
            stock_label: artwork.stock_label || "",

            createdAt: artwork.createdAt,
          };
        });

        setArtworks(formattedArtworks);
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setError(err.message || "Unable to load artworks.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  return (
    <div className="disc-app">
      <Hero query={query} setQuery={setQuery} onPick={pickCategory} />

      <div className="disc-shell">
        <Sidebar
          categories={dynamicCategories}
          activeCategories={activeCategories}
          toggleCategory={toggleCategory}
          price={price}
          setPrice={setPrice}
          mediums={mediums}
          toggleMedium={toggleMedium}
          size={size}
          setSize={setSize}
          onClear={clearAll}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="disc-main">
          <motion.div
            className="disc-toolbar"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          >
            <button
              className="disc-filter-toggle"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <SlidersHorizontal size={16} strokeWidth={1.8} /> Filters
              {activeChips.length > 0 && <b>{activeChips.length}</b>}
            </button>

            <p className="disc-count">
              <strong>{filtered.length.toLocaleString()}</strong> original
              artworks <span>· {sort}</span>
            </p>

            <div className="disc-toolbar-right">
              <div className="disc-sort">
                <button
                  onClick={() => setSortOpen((s) => !s)}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                >
                  {sort}
                  <ChevronDown
                    size={14}
                    style={{
                      transform: sortOpen ? "rotate(180deg)" : "none",
                      transition: "transform .2s",
                    }}
                  />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.ul
                      role="listbox"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {SORTS.map((s) => (
                        <li
                          key={s}
                          role="option"
                          aria-selected={s === sort}
                          className={s === sort ? "is-active" : ""}
                          onClick={() => {
                            setSort(s);
                            setSortOpen(false);
                          }}
                        >
                          {s}
                          {s === sort && <Check size={14} strokeWidth={2.2} />}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <div className="disc-viewtoggle">
                <button
                  className={view === "grid" ? "is-active" : ""}
                  onClick={() => setView("grid")}
                  type="button"
                  aria-label="Grid view"
                >
                  <LayoutGrid size={16} strokeWidth={1.8} />
                </button>
                <button
                  className={view === "list" ? "is-active" : ""}
                  onClick={() => setView("list")}
                  type="button"
                  aria-label="List view"
                >
                  <List size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </motion.div>

          {activeChips.length > 0 && (
            <div className="disc-active">
              {activeChips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="disc-active-chip"
                  onClick={c.remove}
                >
                  {c.label} <X size={12} strokeWidth={2.2} />
                </button>
              ))}
              <button type="button" className="disc-clear" onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <div className="disc-empty">
              <p>Loading artworks...</p>
              <span>Please wait while we load the collection.</span>
            </div>
          ) : error ? (
            <div className="disc-empty">
              <p>Unable to load artworks.</p>
              <span>{error}</span>
              <button
                type="button"
                className="disc-acquire"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div
                key={`${currentPage}-${view}`}
                className={`disc-grid ${view === "list" ? "is-list" : ""}`}
              >
                {paginated.map((art, i) => (
                  <ArtworkCard
                    key={art.id}
                    art={art}
                    index={i}
                    view={view}
                    favorite={isWishlisted(art.id)}
                    toggleFavorite={toggleFavorite}
                    onOpen={setSelectedArt}
                    onPreview={setPreviewArt}
                  />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="disc-empty">
                  <Search size={28} strokeWidth={1.4} />
                  <p>No artworks match these filters.</p>
                  <span>Try removing a filter or raising the price limit.</span>
                  <button
                    onClick={clearAll}
                    type="button"
                    className="disc-acquire"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}

          {filtered.length === 0 && (
            <div className="disc-empty">
              <Search size={28} strokeWidth={1.4} />
              <p>No artworks match these filters.</p>
              <span>Try removing a filter or raising the price limit.</span>
              <button onClick={clearAll} type="button" className="disc-acquire">
                Clear filters
              </button>
            </div>
          )}

          {filtered.length > 0 && (
            <nav className="disc-pagination" aria-label="Pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                type="button"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={currentPage === n ? "is-active" : ""}
                  onClick={() => goToPage(n)}
                  type="button"
                  aria-current={currentPage === n ? "page" : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                type="button"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </main>
      </div>

      <AnimatePresence>
        {selectedArt && (
          <ArtworkDetailModal
            art={selectedArt}
            onClose={() => setSelectedArt(null)}
            favorite={isWishlisted(selectedArt.id)}
            toggleFavorite={toggleFavorite}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {previewArt && (
          <motion.div
            className="disc-fullimage-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewArt(null)}
          >
            <img src={previewArt.img} alt={previewArt.title} />
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Work+Sans:wght@400;500;600&display=swap');

        .disc-app {
          --ink: #1c1712; --ink-soft: #4a423a; --muted: #8c7f68;
          --paper: #f6f1e6; --paper-2: #efe6d3; --card: #fbf8f1; --line: #e0d4bc;
          --brass: #96702f; --brass-deep: #6f5222; --wine: #5c2b30;
          --serif: "Fraunces", "Iowan Old Style", Georgia, serif;
          --sans: "Work Sans", "Inter", system-ui, sans-serif;
          --shadow-sm: 0 1px 2px rgba(60,40,10,.06), 0 2px 8px rgba(60,40,10,.05);
          --shadow-md: 0 2px 4px rgba(60,40,10,.06), 0 18px 40px -12px rgba(60,40,10,.22);
          background: var(--paper); color: var(--ink); font-family: var(--sans); min-height: 100vh;
        }
        .disc-app * { box-sizing: border-box; }
        .disc-app button { font-family: var(--sans); }
        .disc-app :focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; }
        .disc-sr { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }

        .disc-hero { position: relative; isolation: isolate; min-height: 100vh; min-height: 100svh; display: flex; align-items: center; justify-content: center; overflow: hidden; color: #f6f1e6; padding: 120px 0 120px; background: #2a1a10; }
        .disc-hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 40%; z-index: 0; transform: scale(1.04); filter: saturate(1.05) contrast(1.03); }
        .disc-hero-scrim {
          position: absolute; inset: 0; z-index: 1;
          background:
            radial-gradient(ellipse 60% 55% at 50% 48%, rgba(20,15,10,.7) 0%, rgba(20,15,10,.4) 55%, transparent 100%),
            linear-gradient(180deg, rgba(20,15,10,.55) 0%, rgba(20,15,10,.15) 40%, rgba(20,15,10,.6) 100%),
            radial-gradient(ellipse at center, transparent 55%, rgba(12,8,4,.5) 100%);
        }
        .disc-hero-fade { position: absolute; left: 0; right: 0; bottom: 0; height: 140px; z-index: 2; background: linear-gradient(180deg, transparent, var(--paper)); pointer-events: none; }
        .disc-hero-inner { position: relative; z-index: 3; width: 100%; max-width: 860px; margin: 0 auto; padding: 0 28px; display: flex; flex-direction: column; align-items: center; text-align: center; }

        .disc-hero-eyebrow { display: inline-flex; align-items: center; gap: 9px; margin: 0 0 26px; padding: 8px 16px 8px 14px; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; font-weight: 500; color: #f1d9a3; background: rgba(255,255,255,.1); border: 1px solid rgba(240,217,163,.4); border-radius: 999px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .disc-hero-eyebrow svg { color: #e0bb74; }

        .disc-hero-title { font-family: var(--serif); font-weight: 500; font-size: clamp(40px, 6.4vw, 84px); line-height: 1.04; letter-spacing: -0.025em; color: #fff; margin: 0 0 26px; text-shadow: 0 4px 40px rgba(0,0,0,.45); }
        .disc-line { display: block; overflow: hidden; padding: .06em .12em .16em; margin: -.06em -.12em -.16em; }
        .disc-line > span { display: inline-block; }
        .disc-title-accent { font-style: italic; font-weight: 400; background: linear-gradient(100deg, #f8e6b8 0%, #e0bb74 45%, #c9a35a 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; text-shadow: none; filter: drop-shadow(0 4px 24px rgba(0,0,0,.35)); padding-right: .08em; }

        .disc-hero-sub { font-size: 17px; line-height: 1.75; color: #fbf1da; max-width: 580px; margin: 0 auto 38px; text-shadow: 0 1px 18px rgba(0,0,0,.55); }

        .disc-hero-search {
          display: flex; align-items: center; gap: 10px; width: 100%; max-width: 600px; margin: 0 auto;
          background: rgba(251,248,241,.97); color: var(--ink); border-radius: 999px;
          padding: 7px 7px 7px 22px; box-shadow: 0 24px 50px -10px rgba(0,0,0,.5), 0 0 0 6px rgba(255,255,255,.12);
          transition: box-shadow .25s ease;
        }
        .disc-hero-search:focus-within { box-shadow: 0 24px 50px -10px rgba(0,0,0,.5), 0 0 0 6px rgba(224,187,116,.5); }
        .disc-hero-search > svg { color: var(--brass-deep); flex-shrink: 0; }
        .disc-hero-search input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font-family: var(--sans); font-size: 14.5px; color: var(--ink); padding: 11px 0; }
        .disc-hero-search input::placeholder { color: #8a7f6d; }
        .disc-hero-clear { border: none; background: var(--paper-2); color: var(--ink-soft); width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; }
        .disc-hero-go { position: relative; overflow: hidden; color: #fff; background: linear-gradient(135deg, #b88a3e, #96702f 55%, #7a5a22); border: none; border-radius: 999px; padding: 12px 26px; font-size: 13.5px; font-weight: 500; cursor: pointer; box-shadow: inset 0 1px 0 rgba(255,255,255,.28); transition: filter .2s, transform .15s; }
        .disc-hero-go::after { content: ""; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.4) 50%, transparent 70%); transform: translateX(-120%); animation: disc-sheen 3.8s ease-in-out infinite 1.8s; pointer-events: none; }
        .disc-hero-go:hover { filter: brightness(1.1); }
        .disc-hero-go:active { transform: scale(.97); }
        @keyframes disc-sheen { 0% { transform: translateX(-120%); } 40%, 100% { transform: translateX(120%); } }

        .disc-hero-quick { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; margin-top: 26px; }
        .disc-hero-quick span { font-size: 12.5px; color: #e9d9b4; margin-right: 4px; }
        .disc-hero-quick button { padding: 8px 16px; font-size: 13px; color: #fff; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.35); border-radius: 999px; cursor: pointer; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); transition: background .2s, color .2s, border-color .2s, transform .15s; }
        .disc-hero-quick button:hover { background: #fff; border-color: #fff; color: var(--wine); transform: translateY(-2px); }

        .disc-hero-scroll { position: absolute; left: 50%; bottom: 28px; z-index: 4; width: 40px; height: 40px; margin-left: -20px; border-radius: 50%; display: grid; place-items: center; color: #f1d9a3; border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.08); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); cursor: pointer; animation: disc-bob 2.2s ease-in-out infinite; transition: background .2s, color .2s; }
        .disc-hero-scroll:hover { background: #fff; color: var(--wine); }
        @keyframes disc-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

        .disc-shell { display: grid; grid-template-columns: 280px 1fr; gap: 40px; max-width: 1360px; margin: 0 auto; padding: 40px 28px 90px; align-items: start; }

        .disc-sidebar { position: sticky; top: 84px; max-height: calc(100vh - 104px); overflow-y: auto; background: var(--card); border: 1px solid var(--line); border-radius: 20px; padding: 22px 22px 8px; box-shadow: var(--shadow-sm); scrollbar-width: none; -ms-overflow-style: none; }
        .disc-sidebar::-webkit-scrollbar { display: none; }
        .disc-drawer-scrim { position: fixed; inset: 0; background: rgba(20,15,10,.5); backdrop-filter: blur(2px); z-index: 40; }
        .disc-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 320px; background: var(--paper); z-index: 41; padding: 20px 22px 24px; overflow-y: auto; box-shadow: 20px 0 50px rgba(0,0,0,.25); }
        .disc-drawer-close { background: var(--paper-2); border: none; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; margin-bottom: 14px; cursor: pointer; color: var(--ink); }
        .disc-drawer-apply { width: 100%; justify-content: center; margin-top: 20px; padding: 13px; }
        .disc-sidebar-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
        .disc-sidebar-head h3 { font-family: var(--serif); font-size: 21px; font-weight: 500; margin: 0; }
        .disc-clear { background: none; border: none; color: var(--brass-deep); font-size: 12.5px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; padding: 4px; }
        .disc-clear:hover { color: var(--wine); }
        .disc-filter-group { padding: 18px 0; border-bottom: 1px solid var(--line); }
        .disc-filter-group:last-child { border-bottom: none; }
        .disc-filter-group h4 { font-size: 13px; font-weight: 600; margin: 0 0 12px; color: var(--ink); }

        .disc-checkrow, .disc-radiorow { position: relative; display: flex; align-items: center; gap: 11px; padding: 7px 8px; margin: 0 -8px; border-radius: 8px; cursor: pointer; font-size: 13.5px; transition: background .15s; }
        .disc-checkrow:hover, .disc-radiorow:hover { background: var(--paper-2); }
        .disc-checkrow:has(:focus-visible), .disc-radiorow:has(:focus-visible) { outline: 2px solid var(--brass); }
        .disc-checkbox { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #b7a682; display: grid; place-items: center; color: #fff; flex-shrink: 0; background: var(--card); transition: background .15s, border-color .15s; }
        .disc-checkbox.is-checked { background: var(--brass-deep); border-color: var(--brass-deep); }
        .disc-checkbox svg { width: 10px; height: 8px; }
        .disc-checklabel { flex: 1; }
        .disc-checkcount { color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }
        .disc-radio { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #b7a682; display: grid; place-items: center; flex-shrink: 0; background: var(--card); transition: border-color .15s; }
        .disc-radio.is-checked { border-color: var(--brass-deep); }
        .disc-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: transparent; transition: background .15s, transform .15s; transform: scale(.4); }
        .disc-radio.is-checked .disc-radio-dot { background: var(--brass-deep); transform: scale(1); }

        .disc-price-labels { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px; color: var(--ink-soft); }
        .disc-price-labels strong { color: var(--brass-deep); font-weight: 600; }
        .disc-range { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 99px; background: linear-gradient(90deg, var(--brass-deep) var(--pct, 100%), var(--line) var(--pct, 100%)); outline-offset: 6px; }
        .disc-range::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--card); border: 2px solid var(--brass-deep); box-shadow: 0 2px 6px rgba(60,40,10,.3); cursor: grab; transition: transform .15s; }
        .disc-range::-webkit-slider-thumb:hover { transform: scale(1.12); }
        .disc-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--card); border: 2px solid var(--brass-deep); box-shadow: 0 2px 6px rgba(60,40,10,.3); cursor: grab; }

        .disc-pillwrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .disc-chip { display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--line); background: var(--card); padding: 6px 12px; border-radius: 999px; font-size: 12.5px; cursor: pointer; color: var(--ink-soft); transition: all .15s ease; }
        .disc-chip:hover { border-color: var(--brass); color: var(--ink); }
        .disc-chip.is-active { background: var(--ink); color: var(--paper); border-color: var(--ink); }

        .disc-toolbar { display: flex; align-items: center; gap: 18px; margin-bottom: 18px; flex-wrap: wrap; scroll-margin-top: 90px; }
        .disc-filter-toggle { display: none; align-items: center; gap: 8px; border: 1px solid var(--line); background: var(--card); padding: 9px 16px; border-radius: 999px; font-size: 13px; cursor: pointer; color: var(--ink); box-shadow: var(--shadow-sm); }
        .disc-filter-toggle b { background: var(--brass-deep); color: #fff; font-size: 11px; font-weight: 600; min-width: 18px; height: 18px; border-radius: 99px; display: grid; place-items: center; padding: 0 5px; }
        .disc-count { font-size: 14px; color: var(--ink-soft); margin: 0; flex: 1; }
        .disc-count strong { color: var(--ink); font-family: var(--serif); font-size: 18px; font-weight: 500; margin-right: 2px; }
        .disc-count span { color: var(--muted); }
        .disc-toolbar-right { display: flex; align-items: center; gap: 12px; }
        .disc-sort { position: relative; }
        .disc-sort > button { display: flex; align-items: center; gap: 10px; background: var(--card); border: 1px solid var(--line); padding: 9px 16px; border-radius: 999px; font-size: 13px; cursor: pointer; color: var(--ink); box-shadow: var(--shadow-sm); transition: border-color .15s; }
        .disc-sort > button:hover { border-color: var(--brass); }
        .disc-sort ul { position: absolute; right: 0; top: calc(100% + 8px); background: var(--card); border: 1px solid var(--line); border-radius: 14px; list-style: none; padding: 6px; margin: 0; width: 220px; box-shadow: var(--shadow-md); z-index: 10; }
        .disc-sort li { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; font-size: 13px; border-radius: 9px; cursor: pointer; }
        .disc-sort li:hover { background: var(--paper-2); }
        .disc-sort li.is-active { color: var(--brass-deep); font-weight: 500; }
        .disc-viewtoggle { display: flex; padding: 3px; gap: 2px; background: var(--card); border: 1px solid var(--line); border-radius: 999px; box-shadow: var(--shadow-sm); }
        .disc-viewtoggle button { background: transparent; border: none; width: 34px; height: 32px; border-radius: 999px; display: grid; place-items: center; cursor: pointer; color: var(--ink-soft); transition: background .15s, color .15s; }
        .disc-viewtoggle button.is-active { background: var(--ink); color: var(--paper); }

        .disc-active { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 20px; }
        .disc-active-chip { display: inline-flex; align-items: center; gap: 6px; background: var(--paper-2); border: 1px solid var(--line); color: var(--ink); padding: 5px 8px 5px 12px; border-radius: 999px; font-size: 12.5px; cursor: pointer; transition: border-color .15s, background .15s; }
        .disc-active-chip:hover { border-color: var(--wine); background: #f1e2dc; }

        .disc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .disc-grid.is-list { grid-template-columns: 1fr; }
        .disc-card { position: relative; background: var(--card); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--shadow-sm); transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s ease, border-color .25s; }
        .disc-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); border-color: #cdbb97; }
        .disc-card.is-list { flex-direction: row; align-items: stretch; }
        .disc-card.is-list .disc-card-media { width: 280px; flex-shrink: 0; aspect-ratio: auto; min-height: 240px; }
        .disc-card.is-list .disc-card-body { flex: 1; padding: 22px 24px; }
        .disc-card.is-list .disc-card-title { font-size: 21px; -webkit-line-clamp: 1; min-height: 0; }
        .disc-card-media { position: relative; aspect-ratio: 4/4.2; overflow: hidden; cursor: pointer; background: var(--paper-2); }
        .disc-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .7s cubic-bezier(.16,1,.3,1); }
        .disc-card:hover .disc-card-media img { transform: scale(1.06); }
        .disc-card-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,15,10,0) 55%, rgba(20,15,10,.5) 100%); opacity: 0; transition: opacity .3s; pointer-events: none; }
        .disc-card:hover .disc-card-media::after { opacity: 1; }
        .disc-card-tag { position: absolute; top: 12px; left: 12px; z-index: 1; background: rgba(251,248,241,.9); backdrop-filter: blur(8px); color: var(--ink); font-size: 11.5px; font-weight: 500; padding: 5px 11px; border-radius: 999px; max-width: calc(100% - 70px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .disc-card-peek { position: absolute; left: 50%; bottom: 14px; z-index: 1; display: inline-flex; align-items: center; gap: 6px; background: var(--paper); color: var(--ink); font-size: 12px; font-weight: 500; padding: 7px 14px; border-radius: 999px; transform: translate(-50%, 10px); opacity: 0; transition: opacity .3s, transform .3s cubic-bezier(.16,1,.3,1); border: none; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,.25); }
        .disc-card-peek:hover { background: #fff; }
        .disc-card-peek:focus-visible { opacity: 1; transform: translate(-50%, 0); }
        .disc-card:hover .disc-card-peek { opacity: 1; transform: translate(-50%, 0); }
        .disc-fav { position: absolute; top: 10px; right: 10px; z-index: 2; width: 36px; height: 36px; border-radius: 50%; background: rgba(251,248,241,.92); backdrop-filter: blur(8px); border: none; display: grid; place-items: center; color: var(--ink-soft); cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.15); transition: color .2s, transform .2s; }
        .disc-fav:hover { color: var(--wine); transform: scale(1.08); }
        .disc-fav.is-fav { color: var(--wine); }

        .disc-card-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 3px; flex: 1; }
        .disc-card-artist { font-size: 12.5px; font-weight: 500; color: var(--brass-deep); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .disc-card-title { font-family: var(--serif); font-weight: 500; font-size: 19px; margin: 2px 0 6px; color: var(--ink); line-height: 1.28; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: calc(1.28em * 2); }
        .disc-card-meta, .disc-card-medium { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--ink-soft); margin: 0; }
        .disc-card-meta svg, .disc-card-medium svg { color: var(--muted); flex-shrink: 0; }
        .disc-card-medium { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .disc-card-footer { margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; padding-top: 16px; border-top: 1px dashed var(--line); margin-top: 14px; }
        .disc-card-value-label { display: block; font-size: 11px; color: var(--muted); margin-bottom: 1px; }
        .disc-card-value { font-family: var(--serif); font-size: 20px; font-weight: 500; font-variant-numeric: lining-nums; }

        .disc-acquire { display: inline-flex; align-items: center; gap: 6px; background: var(--ink); color: var(--paper); border: none; padding: 10px 18px; border-radius: 999px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background .2s, transform .15s, box-shadow .2s; box-shadow: 0 4px 12px -4px rgba(28,23,18,.5); }
        .disc-acquire:hover { background: var(--wine); box-shadow: 0 8px 18px -6px rgba(92,43,48,.6); }
        .disc-acquire:active { transform: scale(.97); }
        .disc-acquire svg { transition: transform .2s; }
        .disc-acquire:hover svg { transform: translate(2px, -2px); }
        .disc-acquire.is-lg { padding: 12px 22px; font-size: 13.5px; }
        .disc-acquire.is-lg:hover svg { transform: none; }

        .disc-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; padding: 70px 20px; color: var(--ink-soft); border: 1px dashed var(--line); border-radius: 20px; background: var(--card); }
        .disc-empty svg { color: var(--muted); margin-bottom: 6px; }
        .disc-empty p { margin: 0; font-family: var(--serif); font-size: 20px; color: var(--ink); }
        .disc-empty span { font-size: 13.5px; margin-bottom: 14px; }

        .disc-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 46px; }
        .disc-pagination button { min-width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--line); background: var(--card); cursor: pointer; color: var(--ink); font-size: 13px; display: grid; place-items: center; transition: all .15s; }
        .disc-pagination button:hover:not(:disabled):not(.is-active) { border-color: var(--brass); background: var(--paper-2); }
        .disc-pagination button.is-active { background: var(--ink); color: var(--paper); border-color: var(--ink); }
        .disc-pagination button:disabled { opacity: .35; cursor: default; }

        .disc-modal-scrim { position: fixed; inset: 0; background: rgba(20,15,10,.6); backdrop-filter: blur(4px); z-index: 60; }
        .disc-modal-wrap { position: fixed; inset: 0; z-index: 61; display: flex; align-items: center; justify-content: center; padding: 24px; pointer-events: none; }
        .disc-modal-wrap > * { pointer-events: auto; }
        .disc-modal { position: relative; background: var(--paper); border-radius: 22px; width: min(920px, 94vw); height: min(620px, 88vh); overflow: hidden; display: grid; grid-template-columns: 1fr 1fr; box-shadow: 0 40px 90px rgba(0,0,0,.4); }
        .disc-modal-close { position: absolute; top: 14px; right: 14px; z-index: 2; width: 36px; height: 36px; border-radius: 50%; background: rgba(251,248,241,.94); border: none; cursor: pointer; display: grid; place-items: center; color: var(--ink); box-shadow: 0 2px 8px rgba(0,0,0,.18); transition: transform .2s; }
        .disc-modal-close:hover { transform: rotate(90deg); }
        .disc-modal-media { position: relative; height: 100%; overflow: hidden; }
        .disc-modal-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .disc-modal-preview { position: absolute; inset: 0; margin: auto; width: 54px; height: 54px; border-radius: 50%; background: rgba(20,15,10,.4); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,.3); cursor: pointer; display: grid; place-items: center; color: #f6f1e6; opacity: 0; transition: opacity .2s, background .2s; }
        .disc-modal-media:hover .disc-modal-preview, .disc-modal-preview:focus-visible { opacity: 1; }
        .disc-modal-preview:hover { background: rgba(20,15,10,.6); }
        .disc-fullimage-scrim { position: fixed; inset: 0; z-index: 80; background: rgba(10,8,6,.92); display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
        .disc-fullimage-scrim img { max-width: 92vw; max-height: 92vh; object-fit: contain; border-radius: 8px; box-shadow: 0 30px 80px rgba(0,0,0,.5); }

        .disc-modal-body { padding: 32px 32px 26px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; height: 100%; }
        .disc-modal-tag { align-self: flex-start; background: var(--paper-2); border: 1px solid var(--line); color: var(--brass-deep); font-size: 11.5px; font-weight: 500; padding: 5px 11px; border-radius: 999px; }
        .disc-modal-title { font-family: var(--serif); font-size: 28px; font-weight: 500; margin: 8px 0 2px; color: var(--ink); line-height: 1.2; text-wrap: balance; }
        .disc-modal-artist { font-size: 14px; color: var(--brass-deep); font-weight: 500; margin: 0 0 6px; }
        .disc-modal-artist span { color: var(--muted); font-weight: 400; }
        .disc-modal-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 16px 18px; background: var(--card); border: 1px solid var(--line); border-radius: 14px; margin: 8px 0; }
        .disc-modal-specs > div:last-child { grid-column: 1 / -1; }
        .disc-modal-specs span { display: block; font-size: 11px; color: var(--muted); margin-bottom: 3px; }
        .disc-modal-specs p { margin: 0; font-size: 13.5px; color: var(--ink); }
        .disc-modal-desc h4 { font-family: var(--serif); font-weight: 500; font-size: 15.5px; margin: 6px 0 8px; }
        .disc-modal-desc p { font-size: 13.5px; line-height: 1.7; color: var(--ink-soft); margin: 0 0 8px; }
        .disc-modal-provenance { display: flex; flex-direction: column; gap: 14px; padding: 16px 0; border-top: 1px solid var(--line); }
        .disc-modal-provenance-label { display: block; font-size: 11px; color: var(--muted); margin-bottom: 3px; }
        .disc-modal-provenance p { margin: 0; font-size: 13px; line-height: 1.6; color: var(--ink); }
        .disc-modal-footer { margin-top: auto; position: sticky; bottom: -26px; background: linear-gradient(180deg, rgba(246,241,230,0), var(--paper) 22%); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 0 26px; margin-bottom: -26px; border-top: 1px solid var(--line); }
        .disc-modal-value { font-family: var(--serif); font-size: 26px; font-weight: 500; display: block; }
        .disc-modal-actions { position: relative; display: flex; align-items: center; gap: 10px; }
        .disc-wish-btn { position: relative; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); background: var(--card); display: grid; place-items: center; color: var(--ink-soft); cursor: pointer; transition: color .2s, border-color .2s, background .2s; }
        .disc-wish-btn:hover { border-color: var(--wine); color: var(--wine); }
        .disc-wish-btn.is-fav { color: var(--wine); border-color: var(--wine); background: #f5e8e4; }
        .disc-wish-btn::after { content: attr(data-tip); position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(4px); background: var(--ink); color: var(--paper); font-size: 11.5px; white-space: nowrap; padding: 5px 9px; border-radius: 6px; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; }
        .disc-wish-btn:hover::after { opacity: 1; transform: translateX(-50%) translateY(0); }
        .disc-modal-toast { position: absolute; right: 0; bottom: calc(100% + 52px); display: inline-flex; align-items: center; gap: 6px; background: var(--brass-deep); color: var(--paper); font-size: 12px; padding: 7px 13px; border-radius: 999px; white-space: nowrap; box-shadow: 0 8px 20px rgba(0,0,0,.2); }

        @media (max-width: 1180px) { .disc-grid:not(.is-list) { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 980px) {
          .disc-shell { grid-template-columns: 1fr; }
          .disc-sidebar { display: none; }
          .disc-filter-toggle { display: inline-flex; }
          .disc-hero { padding: 104px 0 100px; }
        }
        @media (max-width: 900px) {
          .disc-modal { grid-template-columns: 1fr; grid-template-rows: 240px 1fr; height: min(92vh, 720px); }
          .disc-modal-media { height: 240px; }
          .disc-modal-body { height: auto; padding: 22px 22px 20px; }
          .disc-modal-footer { bottom: -20px; padding-bottom: 20px; margin-bottom: -20px; }
        }
        @media (max-width: 620px) {
          .disc-grid:not(.is-list) { grid-template-columns: 1fr; }
          .disc-card.is-list { flex-direction: column; }
          .disc-card.is-list .disc-card-media { width: 100%; aspect-ratio: 4/3.4; min-height: 0; }
          .disc-card-peek { display: none; }
        }
        @media (max-width: 480px) {
          .disc-hero-inner { padding: 0 18px; }
          .disc-hero-sub { font-size: 16px; }
          .disc-hero-search { flex-wrap: wrap; padding: 10px; border-radius: 24px; }
          .disc-hero-search input { width: 100%; order: 3; padding: 6px 4px 4px; }
          .disc-hero-go { margin-left: auto; }
          .disc-hero-scroll { display: none; }
          .disc-shell { padding: 28px 16px 60px; gap: 24px; }
          .disc-toolbar { gap: 10px; }
          .disc-count { flex-basis: 100%; order: 3; font-size: 13px; }
          .disc-toolbar-right { flex-basis: 100%; justify-content: space-between; }
          .disc-sort ul { width: 200px; right: auto; left: 0; }
          .disc-grid { gap: 16px; }
          .disc-drawer { width: 88vw; }
          .disc-modal-actions .disc-acquire { padding: 12px 16px; }
        }
        @media (hover: none) { .disc-card-peek { display: none; } .disc-modal-preview { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .disc-app * { transition: none !important; animation: none !important; } }
      `}</style>
    </div>
  );
}
