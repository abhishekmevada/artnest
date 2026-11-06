import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, ShoppingBag, Link2, ArrowLeft, Check, Loader2 } from "lucide-react";
import { getArtwork, CATEGORY_LABELS } from "../../data/artworks";
import { API_BASE_URL } from "@/config/api";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function ArtworkDetail() {
  const { id } = useParams();
  const [art, setArt] = useState(() => getArtwork(id) || null);
  const [loading, setLoading] = useState(!getArtwork(id));
  const [copied, setCopied] = useState(false);

  const { favorites, toggle } = useWishlist();
  const { inCart, toggleCart } = useCart();
  const { blockIfArtist } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    // 1. Check local static / cached artworks first
    const localArt = getArtwork(id);
    if (localArt) {
      setArt(localArt);
      setLoading(false);
      return;
    }

    // 2. Fetch from backend API
    async function fetchArtwork() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/guest/get-artwork/${id}`);
        if (!res.ok) {
          throw new Error("Artwork not found on server");
        }
        const data = await res.json();
        if (isMounted && data.artwork) {
          const a = data.artwork;
          const prof = data.artistProfile;
          const formatted = {
            id: a.artworkId || a._id,
            _id: a._id,
            artworkId: a.artworkId,
            artworkDbId: a._id,
            title: a.title || "Untitled",
            artist: a.artist_id?.name || "Unknown Artist",
            location: a.location || prof?.location || "India",
            category: (a.category || "paintings").toLowerCase(),
            medium: a.medium || "Original",
            dims: a.dimensions || "",
            value: Number(a.price || 0),
            img:
              a.image?.[0]?.url ||
              (typeof a.image === "string" ? a.image : "") ||
              "",
            images: Array.isArray(a.image)
              ? a.image.map((img) => img?.url || img).filter(Boolean)
              : [],
            tag: a.tag || "Original",
            description: a.description || "",
          };
          setArt(formatted);
        }
      } catch (err) {
        console.error("Failed to load artwork from server:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchArtwork();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      /* ignore */
    }
  };

  if (loading && !art) {
    return (
      <div className="aw-app">
        <div className="aw-missing">
          <Loader2 size={36} className="animate-spin mx-auto mb-4 text-[#6f5222]" />
          <h1>Loading artwork details...</h1>
          <p>Connecting to the gallery catalogue.</p>
        </div>
        <Styles />
      </div>
    );
  }

  if (!art) {
    return (
      <div className="aw-app">
        <div className="aw-missing">
          <h1>Artwork not found</h1>
          <p>This piece may have been sold or removed.</p>
          <Link to="/discover">Explore artworks</Link>
        </div>
        <Styles />
      </div>
    );
  }

  const saved =
    favorites.has(art.id) ||
    (art.artworkId && favorites.has(art.artworkId)) ||
    (art.artworkDbId && favorites.has(art.artworkDbId)) ||
    (art._id && favorites.has(art._id));

  const carted =
    inCart.has(art.id) ||
    (art.artworkId && inCart.has(art.artworkId)) ||
    (art.artworkDbId && inCart.has(art.artworkDbId)) ||
    (art._id && inCart.has(art._id));

  const category =
    CATEGORY_LABELS[art.category?.toLowerCase()] || art.category || "Original Work";

  return (
    <div className="aw-app">
      <div className="aw-shell">
        <Link to="/discover" className="aw-back">
          <ArrowLeft size={15} /> Back to discover
        </Link>

        <div className="aw-grid">
          <div className="aw-media">
            <img src={art.img} alt={art.title} />
            <span>{art.tag || "Original"}</span>
          </div>

          <div className="aw-body">
            <p className="aw-artist">
              {art.artist} <em>· {art.location || "India"}</em>
            </p>
            <h1>{art.title}</h1>

            <div className="aw-specs">
              <div><span>Medium</span><p>{art.medium || "Original"}</p></div>
              <div><span>Dimensions</span><p>{art.dims || "Standard"}</p></div>
              <div><span>Category</span><p>{category}</p></div>
            </div>

            <p className="aw-desc">
              {art.description ||
                `“${art.title}” is an original work by ${art.artist}, created in ${art.location || "India"}. Each work is individually inspected and hand-catalogued by our curatorial team before being listed, ensuring condition, provenance and authenticity meet gallery standard. Certificate of authenticity included.`}
            </p>

            <div className="aw-price">
              <span>Current value</span>
              <strong>₹{(art.value || 0).toLocaleString()}</strong>
            </div>

            <div className="aw-actions">
              <button
                type="button"
                className={`aw-primary ${carted ? "is-on" : ""}`}
                onClick={() => {
                  if (blockIfArtist()) return;
                  toggleCart(art);
                }}
              >
                <ShoppingBag size={17} strokeWidth={1.8} />
                {carted ? "Added to cart" : "Add to cart"}
              </button>
              <button
                type="button"
                className={`aw-icon ${saved ? "is-on" : ""}`}
                onClick={() => toggle(art)}
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                title={saved ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={18} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} />
              </button>
              <button type="button" className="aw-icon" onClick={copyLink} aria-label="Copy link" title="Copy link">
                {copied ? <Check size={18} /> : <Link2 size={18} />}
              </button>
            </div>

            <p className="aw-ship">
              Ships in protective archival packaging within 5–9 business days. Custom framing
              available on request.
            </p>
          </div>
        </div>
      </div>
      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Work+Sans:wght@400;500;600&display=swap');
      .aw-app {
        --ink:#1c1712; --ink-soft:#4a423a; --paper:#f6f1e6; --paper-2:#efe6d3; --line:#ddd0b8;
        --brass-deep:#6f5222; --wine:#5c2b30;
        --serif:"Fraunces","Iowan Old Style",Georgia,serif; --sans:"Work Sans","Inter",system-ui,sans-serif;
        background:var(--paper); color:var(--ink); font-family:var(--sans); min-height:80vh;
      }
      .aw-app * { box-sizing:border-box; }
      .aw-shell { max-width:1180px; margin:0 auto; padding:36px 28px 90px; }
      .aw-back { display:inline-flex; align-items:center; gap:6px; color:var(--ink-soft); font-size:13px; text-decoration:none; margin-bottom:22px; }
      .aw-back:hover { color:var(--brass-deep); }
      .aw-grid { display:grid; grid-template-columns:1.05fr 1fr; gap:48px; align-items:start; }
      .aw-media { position:relative; border-radius:20px; overflow:hidden; border:1px solid var(--line); background:var(--paper-2); }
      .aw-media img { width:100%; display:block; max-height:78vh; object-fit:cover; }
      .aw-media span { position:absolute; left:14px; bottom:14px; background:rgba(28,23,18,.72); color:#f1e8d4; font-size:11.5px; padding:6px 12px; border-radius:999px; }
      .aw-artist { margin:0 0 8px; font-size:14px; color:var(--ink-soft); }
      .aw-artist em { font-style:normal; color:#a3946f; }
      .aw-body h1 { font-family:var(--serif); font-weight:500; font-size:clamp(28px,4vw,42px); line-height:1.1; margin:0 0 24px; color:var(--brass-deep); }
      .aw-specs { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:18px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); margin-bottom:20px; }
      .aw-specs > div:last-child { grid-column:1 / -1; }
      .aw-specs span { display:block; font-size:11.5px; color:#a3946f; margin-bottom:3px; }
      .aw-specs p { margin:0; font-size:14px; }
      .aw-desc { font-size:14px; line-height:1.7; color:var(--ink-soft); margin:0 0 24px; }
      .aw-price span { display:block; font-size:12px; color:#a3946f; }
      .aw-price strong { font-family:var(--serif); font-weight:500; font-size:32px; }
      .aw-price { margin-bottom:20px; }
      .aw-actions { display:flex; gap:10px; align-items:center; margin-bottom:18px; }
      .aw-primary {
        flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
        background:var(--ink); color:var(--paper); border:none; border-radius:999px;
        padding:14px 22px; font-size:14px; font-weight:500; cursor:pointer; font-family:var(--sans); transition:background .2s ease;
      }
      .aw-primary:hover { background:var(--wine); }
      .aw-primary.is-on { background:var(--brass-deep); }
      .aw-icon {
        width:48px; height:48px; border-radius:50%; border:1px solid var(--line); background:var(--paper-2);
        display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--ink-soft); transition:all .2s ease;
      }
      .aw-icon:hover, .aw-icon.is-on { color:var(--wine); border-color:var(--wine); }
      .aw-ship { font-size:12.5px; color:#7a6d58; line-height:1.6; margin:0; }
      .aw-missing { text-align:center; padding:120px 20px; }
      .aw-missing h1 { font-family:var(--serif); font-weight:500; font-size:32px; margin:0 0 8px; }
      .aw-missing p { color:var(--ink-soft); margin:0 0 20px; }
      .aw-missing a { color:var(--brass-deep); font-weight:500; }
      @media (max-width:820px) {
        .aw-grid { grid-template-columns:1fr; gap:26px; }
        .aw-shell { padding:24px 16px 70px; }
      }
    `}</style>
  );
}
