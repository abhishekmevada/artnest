import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  MessageCircle,
  Share2,
  X,
  Check,
  Send,
  Link2,
  Mail,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "@/config/api";

const loadOffers = () => {
  try {
    return (JSON.parse(localStorage.getItem("artnest_offers")) || []).filter(
      (o) => o.img && (!o.offerEnds || new Date(`${o.offerEnds}T23:59:59`) >= new Date())
    );
  } catch {
    return [];
  }
};

const formatServerOffer = (offer) => {
  const art = offer.artwork_id || {};
  const artistName =
    art.artist_id?.name ||
    (typeof art.artist === "string" ? art.artist : null) ||
    "Featured Artist";
  const artistLocation = art.location || art.artist_id?.location || "Studio";
  const img =
    art.image?.[0]?.url ||
    (typeof art.image === "string" ? art.image : null) ||
    art.img ||
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=900&auto=format&fit=crop&q=80";

  return {
    id: art._id || offer._id,
    _id: art._id || offer._id,
    artworkDbId: art._id,
    offerId: offer._id,
    title: art.title || "Untitled Artwork",
    artist: artistName,
    artistId: art.artist_id?._id || art.artist_id,
    location: artistLocation,
    medium: art.medium || "Original Work",
    dims: art.dimensions || art.dims || "",
    value: Number(offer.offer_price ?? art.price ?? 0),
    price: Number(offer.offer_price ?? art.price ?? 0),
    originalValue: Number(offer.original_price ?? art.price ?? 0),
    offerPct: Math.round(offer.discount_pct || 0),
    offerEnds: offer.ends_on || null,
    offerNote: offer.note || art.tag || "Special Offer",
    tag: art.tag || "Special Offer",
    img,
  };
};

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const artworkUrl = (art) => `${window.location.origin}/artwork/${art.id}`;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function Reel({ art, index, isActive, favorite, inCart, onLike, onCart, onMessage, onShare }) {
  const [hearts, setHearts] = useState([]);
  const lastTap = useRef(0);
  const cardRef = useRef(null);

  const handlePointerUp = (e) => {
    if (e.target.closest("a, button")) return;
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const rect = cardRef.current.getBoundingClientRect();
      const id = now + Math.random();
      setHearts((h) => [...h, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 850);
      if (!favorite) onLike(art, true);
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  return (
    <section className={`fd-reel ${isActive ? "is-active" : ""}`} data-index={index}>
      <div className="fd-reel-bg" style={{ backgroundImage: `url(${art.img})` }} />

      <div className="fd-stage">
        <div className="fd-card" ref={cardRef} onPointerUp={handlePointerUp}>
          <img
            src={art.img}
            alt={art.title}
            draggable={false}
            loading={index < 2 ? "eager" : "lazy"}
          />
          <div className="fd-card-shade" />
          <span className="fd-tag">{art.offerNote || art.tag}</span>

          {hearts.map((h) => (
            <motion.div
              key={h.id}
              className="fd-burst"
              style={{ left: h.x, top: h.y }}
              initial={{ scale: 0.3, opacity: 0, rotate: -12 }}
              animate={{ scale: [0.3, 1.2, 1, 1.5], opacity: [0, 1, 1, 0], rotate: [-12, 8, 0, 0] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Heart size={90} fill="currentColor" strokeWidth={0} />
            </motion.div>
          ))}

          <div className="fd-info">
            <div className="fd-artist">
              <span className="fd-avatar">{initials(art.artist)}</span>
              <div className="fd-artist-text">
                <p>{art.artist}</p>
                <span>{art.location}</span>
              </div>
            </div>
            <Link to={`/artwork/${art.id}`} className="fd-title">
              {art.title}
            </Link>
            <p className="fd-medium">
              {art.medium} · {art.dims}
              {art.offerEnds &&
                ` · Offer ends ${new Date(art.offerEnds).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
            </p>
            <div className="fd-price-row">
              <strong>
                ₹{art.value.toLocaleString()}
                {art.originalValue && (
                  <>
                    <s className="fd-old">₹{art.originalValue.toLocaleString()}</s>
                    <span className="fd-off">{art.offerPct}% OFF</span>
                  </>
                )}
              </strong>
              <Link to={`/artwork/${art.id}`} className="fd-view">
                View details
              </Link>
            </div>
          </div>
        </div>

        <div className="fd-rail">
          <button
            type="button"
            className={`fd-act ${favorite ? "is-on" : ""}`}
            onClick={() => onLike(art)}
            aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span className="fd-act-btn">
              <motion.span
                key={favorite ? "on" : "off"}
                initial={favorite ? { scale: 0.5 } : false}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 14 }}
                style={{ display: "flex" }}
              >
                <Heart size={24} strokeWidth={1.8} fill={favorite ? "currentColor" : "none"} />
              </motion.span>
            </span>
            <em>{favorite ? "Saved" : "Wishlist"}</em>
          </button>

          <button
            type="button"
            className={`fd-act ${inCart ? "is-cart" : ""}`}
            onClick={() => onCart(art)}
            aria-label={inCart ? "Remove from cart" : "Add to cart"}
          >
            <span className="fd-act-btn">
              <ShoppingBag size={23} strokeWidth={1.8} fill={inCart ? "currentColor" : "none"} />
            </span>
            <em>{inCart ? "In cart" : "Cart"}</em>
          </button>

          <button type="button" className="fd-act" onClick={() => onMessage(art)} aria-label={`Message ${art.artist}`}>
            <span className="fd-act-btn">
              <MessageCircle size={23} strokeWidth={1.8} />
            </span>
            <em>Message</em>
          </button>

          <button type="button" className="fd-act" onClick={() => onShare(art)} aria-label="Share">
            <span className="fd-act-btn">
              <Share2 size={22} strokeWidth={1.8} />
            </span>
            <em>Share</em>
          </button>

          <span className="fd-disc" style={{ backgroundImage: `url(${art.img})` }} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

const QUICK_MESSAGES = [
  "Is this piece still available?",
  "Can you ship to my city?",
  "Can I commission a custom size?",
  "Is the price negotiable?",
];

function MessageModal({ art, onClose, onSend }) {
  const [text, setText] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    const msg = text.trim();
    if (msg) onSend(art, msg);
  };

  return (
    <div className="fd-modal-wrap" onClick={onClose}>
      <motion.div
        className="fd-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="fd-modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="fd-modal-head">
          <span className="fd-avatar lg">{initials(art.artist)}</span>
          <div>
            <h3>Message {art.artist}</h3>
            <p>{art.location} · usually replies within a day</p>
          </div>
        </div>

        <div className="fd-modal-art">
          <img src={art.img} alt={art.title} />
          <div>
            <strong>{art.title}</strong>
            <span>₹{art.value.toLocaleString()}</span>
          </div>
        </div>

        <div className="fd-quick">
          {QUICK_MESSAGES.map((q) => (
            <button key={q} type="button" onClick={() => setText(q)}>
              {q}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Write to ${art.artist} about "${art.title}"…`}
          rows={4}
          maxLength={500}
          autoFocus
        />

        <button className="fd-send" type="button" onClick={submit} disabled={!text.trim()}>
          <Send size={16} strokeWidth={1.8} /> Send message
        </button>
      </motion.div>
    </div>
  );
}

function ShareModal({ art, onClose, onCopied }) {
  const url = artworkUrl(art);
  const text = `${art.title} by ${art.artist} on ArtNest`;
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    const ok = await copyText(url);
    onCopied(ok ? "Link copied" : "Could not copy link");
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: art.title, text, url });
      onClose();
    } catch {
    }
  };

  const e = encodeURIComponent;
  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${e(`${text} ${url}`)}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${e(url)}&text=${e(text)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(text)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
  ];

  return (
    <div className="fd-modal-wrap" onClick={onClose}>
      <motion.div
        className="fd-modal"
        onClick={(ev) => ev.stopPropagation()}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="fd-modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="fd-modal-head">
          <div>
            <h3>Share this artwork</h3>
            <p>Anyone with the link lands straight on this piece.</p>
          </div>
        </div>

        <div className="fd-modal-art">
          <img src={art.img} alt={art.title} />
          <div>
            <strong>{art.title}</strong>
            <span>{art.artist}</span>
          </div>
        </div>

        <div className="fd-linkbox">
          <Link2 size={16} />
          <input readOnly value={url} onFocus={(ev) => ev.target.select()} />
          <button type="button" onClick={copy}>
            Copy
          </button>
        </div>

        <div className="fd-share-grid">
          {targets.map((t) => (
            <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer">
              {t.label}
            </a>
          ))}
          <a href={`mailto:?subject=${e(text)}&body=${e(url)}`}>
            <Mail size={14} /> Email
          </a>
          {canNativeShare && (
            <button type="button" onClick={nativeShare}>
              More…
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Feed() {
  const [searchParams] = useSearchParams();
  const { favorites, toggle } = useWishlist();
  const { inCart, toggleCart } = useCart();
  const { user, blockIfArtist } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);
  const [messageArt, setMessageArt] = useState(null);
  const [shareArt, setShareArt] = useState(null);
  const [toast, setToast] = useState("");
  const [hintGone, setHintGone] = useState(false);

  const anyModal = !!messageArt || !!shareArt;

  useEffect(() => {
    let isMounted = true;
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/guest/offers`);
        if (!res.ok) throw new Error("Failed to fetch offers");
        const data = await res.json();
        const rawOffers = Array.isArray(data.listOffer) ? data.listOffer : [];
        const formatted = rawOffers.map(formatServerOffer);
        if (isMounted) {
          if (formatted.length > 0) {
            setArtworks(formatted);
          } else {
            setArtworks(loadOffers());
          }
        }
      } catch (err) {
        console.warn("Could not fetch server offers, falling back to local offers:", err);
        if (isMounted) {
          setArtworks(loadOffers());
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchOffers();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const prev = {
      htmlOverflow: root.style.overflow,
      gutter: root.style.scrollbarGutter,
      overflow: document.body.style.overflow,
      bg: root.style.backgroundColor,
      scrollbarColor: root.style.scrollbarColor,
      colorScheme: root.style.colorScheme,
    };
    document.body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    root.style.scrollbarGutter = "auto";
    root.style.backgroundColor = "#000";
    root.style.scrollbarColor = "#000 #000";
    root.style.colorScheme = "dark";
    return () => {
      document.body.style.overflow = prev.overflow;
      root.style.overflow = prev.htmlOverflow;
      root.style.scrollbarGutter = prev.gutter;
      root.style.backgroundColor = prev.bg;
      root.style.scrollbarColor = prev.scrollbarColor;
      root.style.colorScheme = prev.colorScheme;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1900);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (active > 0) setHintGone(true);
  }, [active]);

  const scrollToIndex = useCallback(
    (i, smooth = true) => {
      const el = scrollerRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(artworks.length - 1, i));
      el.scrollTo({ top: clamped * el.clientHeight, behavior: smooth ? "smooth" : "auto" });
    },
    [artworks]
  );

  useEffect(() => {
    const id = searchParams.get("art");
    if (!id) return;
    const i = artworks.findIndex((a) => String(a.id) === id);
    if (i > 0) scrollToIndex(i, false);
  }, [searchParams, scrollToIndex, artworks]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(Number(en.target.dataset.index));
        });
      },
      { root, threshold: 0.6 }
    );
    root.querySelectorAll(".fd-reel").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [artworks]);

  useEffect(() => {
    const onKey = (e) => {
      if (anyModal) return;
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollToIndex(active + 1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollToIndex(active - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, anyModal, scrollToIndex]);

  const handleLike = (art, fromDoubleTap = false) => {
    const saved = favorites.has(art.id);
    if (fromDoubleTap && saved) return;
    toggle(art);
    setToast(saved ? "Removed from wishlist" : "Added to wishlist");
  };

const handleCart = (art) => {
if (blockIfArtist()) return;
const has = inCart.has(art.id);
    toggleCart(art);
    setToast(has ? "Removed from cart" : "Added to cart");
  };

  const handleSend = (art, message) => {
    try {
      const tid = `enq-${art.id}`;
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const list = JSON.parse(localStorage.getItem("artnest_messages")) || [];
      const prev = list.find((t) => t.id === tid)?.msgs || [];
      const rest = list.filter((t) => t.id !== tid);
      localStorage.setItem(
        "artnest_messages",
        JSON.stringify([
          {
            id: tid,
            artist: art.artist,
            buyer: user?.name || "Guest buyer",
            subject: `Offer · ${art.title}`,
            msgs: [...prev, { from: "buyer", text: message, time }],
          },
          ...rest,
        ])
      );
    } catch {
    }
    setMessageArt(null);
    setToast(`Message sent to ${art.artist}`);
  };

  return (
    <div className="fd-app">
      <Navbar />

      <div className="fd-body">
        <div className="fd-scroll" ref={scrollerRef}>
          {loading && (
            <div style={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center", color: "#EAD9C6", padding: 24 }}>
              <div>
                <p style={{ fontSize: 18, opacity: 0.8 }}>Loading live offers...</p>
              </div>
            </div>
          )}
          {!loading && !artworks.length && (
            <div style={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center", color: "#EAD9C6", padding: 24 }}>
              <div>
                <p style={{ fontSize: 22, marginBottom: 8 }}>No offers right now</p>
                <p style={{ opacity: 0.7 }}>Live offers from artists will appear here.</p>
              </div>
            </div>
          )}
          {artworks.map((art, i) => (
            <Reel
              key={art.id}
              art={art}
              index={i}
              isActive={i === active}
              favorite={favorites.has(art.id)}
              inCart={inCart.has(art.id)}
              onLike={handleLike}
              onCart={handleCart}
              onMessage={setMessageArt}
              onShare={setShareArt}
            />
          ))}
        </div>

        {artworks.length > 1 && (
          <div className="fd-dots" aria-hidden="true">
            {artworks.slice(Math.max(0, active - 3), active + 4).map((a) => (
              <span key={a.id} className={a.id === artworks[active]?.id ? "on" : ""} />
            ))}
          </div>
        )}

        <AnimatePresence>
          {!hintGone && artworks.length > 1 && (
            <motion.div
              className="fd-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <ChevronUp size={20} />
              <span>Swipe up</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fd-nav">
          <button type="button" onClick={() => scrollToIndex(active - 1)} disabled={active === 0} aria-label="Previous">
            <ChevronUp size={20} />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(active + 1)}
            disabled={artworks.length === 0 || active === artworks.length - 1}
            aria-label="Next"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {messageArt && <MessageModal key="msg" art={messageArt} onClose={() => setMessageArt(null)} onSend={handleSend} />}
        {shareArt && (
          <ShareModal key="share" art={shareArt} onClose={() => setShareArt(null)} onCopied={(m) => setToast(m)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fd-toast"
            key={toast}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.2 }}
          >
            <Check size={14} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');

        .fd-app {
          --ink: #1c1712; --paper: #f6f1e6; --paper-2: #efe6d3; --line: #ddd0b8;
          --brass-deep: #6f5222; --wine: #5c2b30;
          --serif: "Fraunces", "Iowan Old Style", Georgia, serif;
          --sans: "Work Sans", "Inter", system-ui, sans-serif;
          height: 100vh; height: 100dvh;
          display: flex; flex-direction: column;
          background: #000; color: #fff;
          font-family: var(--sans); overflow: hidden;
        }
        .fd-app * { box-sizing: border-box; }

        .fd-body { position: relative; flex: 1; min-height: 0; }
        .fd-scroll {
          height: 100%; overflow-y: scroll;
          scroll-snap-type: y mandatory; overscroll-behavior: contain;
          scroll-behavior: smooth; -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .fd-scroll::-webkit-scrollbar { display: none; }

        .fd-reel {
          position: relative; height: 100%; overflow: hidden;
          scroll-snap-align: start; scroll-snap-stop: always;
        }
        .fd-reel-bg {
          position: absolute; inset: -40px; background-size: cover; background-position: center;
          filter: blur(46px) brightness(.3) saturate(1.3); transform: scale(1.1);
          opacity: .7; transition: opacity .5s ease;
        }
        .fd-reel.is-active .fd-reel-bg { opacity: 1; }

        .fd-stage {
          position: relative; z-index: 1; height: 100%;
          display: grid; grid-template-columns: 1fr auto 1fr;
          align-items: end; padding: 12px 0;
        }

        .fd-card {
          grid-column: 2;
          position: relative; height: 100%; aspect-ratio: 9 / 16;
          max-width: min(460px, 100vw); border-radius: 18px; overflow: hidden;
          background: #000; box-shadow: 0 30px 70px rgba(0,0,0,.55);
          user-select: none; -webkit-user-select: none; touch-action: manipulation;
          transform: scale(.93); opacity: .55;
          transition: transform .55s cubic-bezier(.2,.8,.2,1), opacity .45s ease;
        }
        .fd-reel.is-active .fd-card { transform: scale(1); opacity: 1; }

        .fd-card img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transform: scale(1); transform-origin: 50% 55%;
        }
        .fd-reel.is-active .fd-card img { animation: fd-kenburns 10s ease-out forwards; }
        @keyframes fd-kenburns { from { transform: scale(1); } to { transform: scale(1.1); } }

        .fd-card-shade {
          position: absolute; inset: 0; pointer-events: none;
          background:
            linear-gradient(180deg, rgba(0,0,0,.4) 0%, transparent 18%),
            linear-gradient(0deg, rgba(0,0,0,.88) 0%, rgba(0,0,0,.45) 28%, transparent 55%);
        }
        .fd-tag {
          position: absolute; top: 14px; left: 14px;
          background: rgba(0,0,0,.45); backdrop-filter: blur(8px);
          font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 999px; color: #fff;
        }
        .fd-burst {
          position: absolute; width: 90px; height: 90px; margin: -45px 0 0 -45px;
          color: #fff; pointer-events: none; opacity: 0;
          filter: drop-shadow(0 6px 22px rgba(0,0,0,.45));
        }

        .fd-info { position: absolute; left: 0; right: 0; bottom: 0; padding: 26px 18px 22px; }
        .fd-info > * { opacity: 0; transform: translateY(18px); }
        .fd-reel.is-active .fd-info > * { animation: fd-up .5s cubic-bezier(.2,.8,.2,1) forwards; }
        .fd-reel.is-active .fd-info > :nth-child(1) { animation-delay: .12s; }
        .fd-reel.is-active .fd-info > :nth-child(2) { animation-delay: .2s; }
        .fd-reel.is-active .fd-info > :nth-child(3) { animation-delay: .27s; }
        .fd-reel.is-active .fd-info > :nth-child(4) { animation-delay: .34s; }
        @keyframes fd-up { to { opacity: 1; transform: none; } }

        .fd-artist { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .fd-artist-text { min-width: 0; }
        .fd-artist p { margin: 0; font-size: 14px; font-weight: 600; text-shadow: 0 1px 6px rgba(0,0,0,.5); }
        .fd-artist span { font-size: 12px; color: rgba(255,255,255,.75); }
        .fd-avatar {
          width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #d6c4ae, #b99a78);
          color: #fff; font-size: 12px; font-weight: 600;
          box-shadow: 0 0 0 2px #fff;
        }
        .fd-avatar.lg { width: 46px; height: 46px; font-size: 14px; box-shadow: none; }

        .fd-title {
          display: block; font-family: var(--serif); font-weight: 500;
          font-size: 24px; line-height: 1.2; color: #fff; text-decoration: none; margin-bottom: 6px;
          text-shadow: 0 2px 12px rgba(0,0,0,.4);
        }
        .fd-medium { margin: 0 0 14px; font-size: 13px; color: rgba(255,255,255,.8); }
        .fd-price-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .fd-price-row strong {
          font-family: var(--serif); font-weight: 500; font-size: 22px;
          display: flex; align-items: center; flex-wrap: wrap; gap: 4px 10px; white-space: nowrap;
        }
        .fd-old { font-family: var(--sans); font-weight: 400; font-size: 14px; opacity: .65; }
        .fd-off {
          font-family: var(--sans); font-size: 11.5px; font-weight: 600; letter-spacing: .02em;
          background: #9F5639; color: #fff; border-radius: 999px; padding: 3px 9px; white-space: nowrap;
        }
        .fd-view {
          background: #fff; color: #111; text-decoration: none;
          font-size: 13px; font-weight: 600; padding: 0 18px; min-height: 38px; border-radius: 8px;
          display: inline-flex; align-items: center; justify-content: center; white-space: nowrap;
          transition: background .2s ease, transform .15s ease;
        }
        .fd-view:hover { background: #ececec; }
        .fd-view:active { transform: scale(.97); }

        .fd-rail {
          grid-column: 3; justify-self: start; margin-left: 16px;
          display: flex; flex-direction: column; align-items: center; gap: 18px; padding-bottom: 6px;
        }
        .fd-act {
          background: none; border: none; color: #fff; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0;
          opacity: 0; transform: scale(.6);
        }
        .fd-reel.is-active .fd-act { animation: fd-pop .45s cubic-bezier(.2,1.4,.4,1) forwards; }
        .fd-reel.is-active .fd-act:nth-child(1) { animation-delay: .15s; }
        .fd-reel.is-active .fd-act:nth-child(2) { animation-delay: .22s; }
        .fd-reel.is-active .fd-act:nth-child(3) { animation-delay: .29s; }
        .fd-reel.is-active .fd-act:nth-child(4) { animation-delay: .36s; }
        @keyframes fd-pop { to { opacity: 1; transform: none; } }

        .fd-act-btn {
          width: 48px; height: 48px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,.12); backdrop-filter: blur(10px);
          transition: background .2s ease, transform .2s ease, color .2s ease;
        }
        .fd-act:hover .fd-act-btn { background: rgba(255,255,255,.22); }
        .fd-act:active .fd-act-btn { transform: scale(.88); }
        .fd-act em { font-style: normal; font-size: 11.5px; font-weight: 500; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,.5); }
        .fd-act.is-on .fd-act-btn { color: #ff3b57; }
        .fd-act.is-cart .fd-act-btn { color: #f2c26b; }

        .fd-disc {
          width: 34px; height: 34px; border-radius: 9px; margin-top: 4px;
          background-size: cover; background-position: center;
          border: 2px solid #fff; opacity: 0;
        }
        .fd-reel.is-active .fd-disc { opacity: 1; animation: fd-wobble 5s linear infinite; transition: opacity .4s ease .5s; }
        @keyframes fd-wobble { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }

        .fd-act:focus-visible .fd-act-btn,
        .fd-nav button:focus-visible,
        .fd-view:focus-visible,
        .fd-send:focus-visible,
        .fd-quick button:focus-visible,
        .fd-linkbox button:focus-visible,
        .fd-share-grid a:focus-visible,
        .fd-share-grid button:focus-visible,
        .fd-modal-close:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

        .fd-nav {
          position: absolute; right: 22px; top: 50%; transform: translateY(-50%);
          z-index: 5; display: flex; flex-direction: column; gap: 10px;
        }
        .fd-nav button {
          width: 42px; height: 42px; border-radius: 50%; cursor: pointer; color: #fff;
          background: rgba(255,255,255,.12); border: none;
          display: flex; align-items: center; justify-content: center; transition: background .2s ease;
        }
        .fd-nav button:hover:not(:disabled) { background: rgba(255,255,255,.26); }
        .fd-nav button:disabled { opacity: .3; cursor: default; }

        .fd-dots {
          position: absolute; left: 22px; top: 50%; transform: translateY(-50%); z-index: 5;
          display: flex; flex-direction: column; gap: 8px; pointer-events: none;
        }
        .fd-dots span { width: 4px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.35); transition: height .3s ease, background .3s ease; }
        .fd-dots span.on { height: 22px; background: #fff; }

        .fd-hint {
          position: absolute; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 6;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          font-size: 12px; font-weight: 500; color: #fff; pointer-events: none;
          background: rgba(0,0,0,.45); backdrop-filter: blur(8px); padding: 10px 16px; border-radius: 999px;
        }
        .fd-hint svg { animation: fd-bob 1.1s ease-in-out infinite; }
        @keyframes fd-bob { 0%, 100% { transform: translateY(3px); } 50% { transform: translateY(-4px); } }

        .fd-modal-wrap {
          position: fixed; inset: 0; z-index: 100; padding: 20px;
          background: rgba(0,0,0,.6); backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center;
        }
        .fd-modal {
          position: relative; width: min(440px, 100%); max-height: 92vh; overflow-y: auto;
          background: var(--paper); color: var(--ink); border-radius: 20px; padding: 24px;
          box-shadow: 0 30px 80px rgba(0,0,0,.45);
        }
        .fd-modal-close {
          position: absolute; top: 12px; right: 12px; width: 40px; height: 40px; border-radius: 50%;
          background: var(--paper-2); border: none; cursor: pointer; color: var(--ink);
          display: flex; align-items: center; justify-content: center;
        }
        .fd-modal-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-right: 30px; }
        .fd-modal-head h3 { margin: 0 0 2px; font-family: var(--serif); font-weight: 500; font-size: 20px; }
        .fd-modal-head p { margin: 0; font-size: 12.5px; color: #7a6d58; }
        .fd-modal-art {
          display: flex; align-items: center; gap: 12px; padding: 10px;
          background: var(--paper-2); border: 1px solid var(--line); border-radius: 14px; margin-bottom: 16px;
        }
        .fd-modal-art img { width: 54px; height: 54px; border-radius: 10px; object-fit: cover; }
        .fd-modal-art strong { display: block; font-family: var(--serif); font-weight: 500; font-size: 15px; color: var(--brass-deep); }
        .fd-modal-art span { font-size: 12.5px; color: #7a6d58; }

        .fd-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .fd-quick button {
          border: 1px solid var(--line); background: var(--paper-2); color: #4a423a;
          padding: 8px 14px; min-height: 36px; border-radius: 999px; font-size: 12.5px; cursor: pointer;
          font-family: var(--sans); transition: all .15s ease;
        }
        .fd-quick button:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); }

        .fd-modal textarea {
          width: 100%; resize: none; border: 1px solid var(--line); background: #fff;
          border-radius: 12px; padding: 12px 14px; font-family: var(--sans); font-size: 14px;
          color: var(--ink); outline: none; margin-bottom: 14px;
        }
        .fd-modal textarea:focus { border-color: var(--brass-deep); }
        .fd-send {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--ink); color: var(--paper); border: none; border-radius: 999px;
          padding: 0 12px; min-height: 46px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: var(--sans);
          transition: background .2s ease, transform .15s ease;
        }
        .fd-send:active:not(:disabled) { transform: scale(.98); }
        .fd-send:hover:not(:disabled) { background: var(--wine); }
        .fd-send:disabled { opacity: .45; cursor: default; }

        .fd-linkbox {
          display: flex; align-items: center; gap: 8px; padding: 6px 6px 6px 14px;
          background: #fff; border: 1px solid var(--line); border-radius: 999px; margin-bottom: 16px;
          color: #7a6d58;
        }
        .fd-linkbox input {
          flex: 1; min-width: 0; border: none; outline: none; background: transparent;
          font-size: 13px; color: var(--ink); font-family: var(--sans);
        }
        .fd-linkbox button {
          background: var(--ink); color: var(--paper); border: none; border-radius: 999px;
          padding: 8px 16px; font-size: 12.5px; font-weight: 500; cursor: pointer;
        }
        .fd-linkbox button:hover { background: var(--wine); }

        .fd-share-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .fd-share-grid a, .fd-share-grid button {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          border: 1px solid var(--line); background: var(--paper-2); color: var(--ink);
          padding: 10px 8px; border-radius: 12px; font-size: 13px; text-decoration: none;
          cursor: pointer; font-family: var(--sans); transition: all .15s ease;
        }
        .fd-share-grid a:hover, .fd-share-grid button:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); }

        .fd-toast {
          position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%); z-index: 120;
          display: flex; align-items: center; gap: 8px; white-space: nowrap;
          background: rgba(30,30,30,.92); color: #fff; font-size: 13px; font-weight: 500;
          padding: 10px 18px; border-radius: 999px; box-shadow: 0 14px 34px rgba(0,0,0,.4);
        }

        @media (max-width: 900px) {
          .fd-nav, .fd-dots { display: none; }
          .fd-stage { padding: 0; }
        }

        @media (max-width: 640px) {
          .fd-stage { display: block; padding: 0; }
          .fd-card {
            width: 100%; height: 100%; max-width: none; aspect-ratio: auto;
            border-radius: 0; box-shadow: none; transform: scale(.96);
          }
          .fd-reel.is-active .fd-card { transform: scale(1); }
          .fd-rail { position: absolute; right: 10px; bottom: 112px; z-index: 3; gap: 16px; margin: 0; }
          .fd-act em { font-size: 11px; }
          .fd-act-btn { width: 44px; height: 44px; background: transparent; backdrop-filter: none; }
          .fd-act-btn svg { filter: drop-shadow(0 1px 6px rgba(0,0,0,.55)); }
          .fd-info { padding: 24px 76px 20px 16px; }
          .fd-title { font-size: 21px; }
          .fd-hint { bottom: 120px; }
          .fd-modal-wrap { align-items: flex-end; padding: 0; }
          .fd-modal { width: 100%; border-radius: 22px 22px 0 0; padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); }
          .fd-toast { bottom: calc(24px + env(safe-area-inset-bottom, 0px)); }
        }
        @media (hover: none) {
          .fd-act:hover .fd-act-btn { background: transparent; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fd-app *, .fd-app *::before, .fd-app *::after { transition: none !important; animation: none !important; }
          .fd-info > *, .fd-act { opacity: 1 !important; transform: none !important; }
          .fd-card { opacity: 1; transform: none; }
          .fd-scroll { scroll-behavior: auto; }
        }
      `}</style>
    </div>
  );
}