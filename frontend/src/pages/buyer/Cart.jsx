import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Trash2, ArrowRight, ShieldCheck, Truck, BadgeCheck, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { API_BASE_URL } from "@/config/api";

export default function Cart() {
  const { items, removeFromCart, toggleCart, clearCart, setCartItems } = useCart();
  const { favorites, toggle: toggleWishlist } = useWishlist();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [undo, setUndo] = useState(null);
  const [note, setNote] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCart = async () => {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/buyer/get-cart`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch cart items");
        }

        console.log("Cart API Response:", data);

        const serverItems = (data.cartItems || [])
          .filter((c) => c && c.artwork_id)
          .map((c) => {
            const art = c.artwork_id;
            return {
              cartItemId: c._id,
              id: art.artworkId || art._id,
              artworkDbId: art._id,
              title: art.title || "Untitled",
              artist: art.artist_id?.name || art.artist || "Unknown Artist",
              location: art.location || "India",
              medium: art.medium || "Original",
              dims: art.dimensions || art.dims || "",
              img:
                art.image?.[0]?.url ||
                (typeof art.image === "string" ? art.image : art.img) ||
                "",
              value: Number(art.price ?? art.value ?? 0),
              addedAt: new Date(c.createdAt || Date.now()).getTime(),
            };
          });

        if (isMounted && typeof setCartItems === "function") {
          setCartItems(serverItems);
        }
      } catch (err) {
        console.error("Cart Error:", err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCart();
    return () => {
      isMounted = false;
    };
  }, [setCartItems]);

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(t);
  }, [undo]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(""), 2000);
    return () => clearTimeout(t);
  }, [note]);

  useEffect(() => {
    if (!confirmClear) return;
    const t = setTimeout(() => setConfirmClear(false), 3500);
    return () => clearTimeout(t);
  }, [confirmClear]);

  const subtotal = items.reduce((sum, i) => sum + i.value, 0);
  const artistCount = new Set(items.map((i) => i.artist)).size;

  const handleRemove = async (art) => {
    removeFromCart(art.id);
    setUndo(art);

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token) {
      try {
        const targetId = art.artworkDbId || art.cartItemId || art.id;
        await fetch(`${API_BASE_URL}/buyer/remove-cart/${targetId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Failed to delete cart item from server:", err);
      }
    }
  };

  const handleUndo = async () => {
    if (!undo) return;
    const art = undo;
    toggleCart(art);
    setUndo(null);

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token && (art.artworkDbId || art.id)) {
      try {
        await fetch(
          `${API_BASE_URL}/buyer/cart/${art.artworkDbId || art.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (err) {
        console.error("Failed to restore cart item on server:", err);
      }
    }
  };

  const moveToWishlist = async (art) => {
    if (!favorites.has(art.id)) toggleWishlist(art);
    removeFromCart(art.id);
    setUndo(null);
    setNote("Moved to wishlist");

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token) {
      try {
        const targetId = art.artworkDbId || art.cartItemId || art.id;
        await fetch(`${API_BASE_URL}/buyer/remove-cart/${targetId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (art.artworkDbId || art.id) {
          await fetch(
            `${API_BASE_URL}/buyer/wishlist-item/${art.artworkDbId || art.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );
        }
      } catch (err) {
        console.error("Error moving to wishlist on server:", err);
      }
    }
  };

  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearCart();
    setConfirmClear(false);
    setUndo(null);

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/buyer/remove-all-cart`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Failed to clear cart on server:", err);
      }
    }
  };

  return (
    <div className="ct-app">
      <div className="ct-shell">
        <motion.header
          className="ct-head"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className="ct-eyebrow">Your acquisitions</p>
            <h1 className="ct-title">Cart</h1>
            {items.length > 0 && (
              <p className="ct-sub">
                {items.length} original {items.length === 1 ? "work" : "works"} from {artistCount}{" "}
                {artistCount === 1 ? "artist" : "artists"}
              </p>
            )}
          </div>

          {items.length > 0 && (
            <button
              type="button"
              className={`ct-clear ${confirmClear ? "is-confirm" : ""}`}
              onClick={handleClear}
            >
              <Trash2 size={14} strokeWidth={1.8} />
              {confirmClear ? "Tap again to confirm" : "Clear cart"}
            </button>
          )}
        </motion.header>

        {loading ? (
          <div className="ct-empty">
            <h2>Loading your cart...</h2>
          </div>
        ) : error && items.length === 0 ? (
          <div className="ct-empty">
            <h2>Unable to load cart</h2>
            <p>{error}</p>
          </div>
        ) : items.length === 0 ? (
          <motion.div
            className="ct-empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ct-empty-icon">
              <ShoppingBag size={30} strokeWidth={1.5} />
            </div>
            <h2>Your cart is empty</h2>
            <p>
              Every piece on ArtNest is one of a kind. Save the ones you love, and add them here
              when you are ready to acquire.
            </p>
            <div className="ct-empty-actions">
              <Link to="/discover" className="ct-cta">
                Explore artworks <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
              <Link to="/wishlist" className="ct-ghost">
                <Heart size={15} strokeWidth={1.8} /> View wishlist
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="ct-layout">
            {/* Items */}
            <div className="ct-list">
              <AnimatePresence initial={false}>
                {items.map((art) => (
                  <motion.article
                    key={art.id}
                    className="ct-item"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link to={`/artwork/${art.id}`} className="ct-thumb">
                      <img src={art.img} alt={art.title} loading="lazy" />
                    </Link>

                    <div className="ct-info">
                      <p className="ct-artist">
                        {art.artist} <span>· {art.location}</span>
                      </p>
                      <Link to={`/artwork/${art.id}`} className="ct-name">
                        {art.title}
                      </Link>
                      <p className="ct-medium">
                        {art.medium} · {art.dims}
                      </p>
                      <span className="ct-badge">
                        <BadgeCheck size={13} strokeWidth={1.8} /> Certificate of authenticity
                      </span>

                      <div className="ct-item-actions">
                        <button type="button" onClick={() => moveToWishlist(art)}>
                          <Heart size={14} strokeWidth={1.8} /> Move to wishlist
                        </button>
                        <button type="button" onClick={() => handleRemove(art)}>
                          <Trash2 size={14} strokeWidth={1.8} /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="ct-price">
                      <span>Value</span>
                      <strong>₹{art.value.toLocaleString()}</strong>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>

              <Link to="/discover" className="ct-continue">
                Continue exploring <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
            </div>

            {/* Summary */}
            <aside className="ct-summary">
              <h2>Order summary</h2>

              <div className="ct-row">
                <span>Subtotal ({items.length} {items.length === 1 ? "work" : "works"})</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="ct-row muted">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="ct-row muted">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="ct-total">
                <span>Total</span>
                <strong>₹{subtotal.toLocaleString()}</strong>
              </div>

              <Link to="/checkout" className="ct-checkout">
                Proceed to checkout <ArrowRight size={16} strokeWidth={1.8} />
              </Link>

              <ul className="ct-trust">
                <li>
                  <ShieldCheck size={16} strokeWidth={1.6} />
                  Every work is inspected and vetted by our curators
                </li>
                <li>
                  <Truck size={16} strokeWidth={1.6} />
                  Ships in archival packaging within 5–9 business days
                </li>
                <li>
                  <BadgeCheck size={16} strokeWidth={1.6} />
                  Certificate of authenticity included
                </li>
              </ul>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile sticky checkout bar */}
      {items.length > 0 && (
        <div className="ct-bar">
          <div>
            <span>Total</span>
            <strong>₹{subtotal.toLocaleString()}</strong>
          </div>
          <Link to="/checkout">
            Checkout <ArrowRight size={15} strokeWidth={1.8} />
          </Link>
        </div>
      )}

      <AnimatePresence>
        {(undo || note) && (
          <motion.div
            key={undo ? "undo" : note}
            className="ct-toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            {undo ? (
              <>
                <span>Removed “{undo.title}”</span>
                <button type="button" onClick={handleUndo}>
                  Undo
                </button>
              </>
            ) : (
              <span className="ct-toast-note">
                <Check size={14} /> {note}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');

        .ct-app {
          --ink: #1c1712; --ink-soft: #4a423a; --paper: #f6f1e6; --paper-2: #efe6d3;
          --line: #ddd0b8; --brass-deep: #6f5222; --wine: #5c2b30;
          --serif: "Fraunces", "Iowan Old Style", Georgia, serif;
          --sans: "Work Sans", "Inter", system-ui, sans-serif;
          background: var(--paper); color: var(--ink); font-family: var(--sans); min-height: 80vh;
        }
        .ct-app * { box-sizing: border-box; }
        .ct-shell { max-width: 1240px; margin: 0 auto; padding: 56px 28px 90px; }

        .ct-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: 32px; }
        .ct-eyebrow { font-size: 13px; letter-spacing: .04em; color: var(--brass-deep); margin: 0 0 10px; font-weight: 500; }
        .ct-title { font-family: var(--serif); font-weight: 500; font-size: clamp(34px, 5vw, 54px); line-height: 1.05; margin: 0 0 10px; letter-spacing: -0.01em; }
        .ct-sub { margin: 0; color: var(--ink-soft); font-size: 15px; }

        .ct-clear {
          display: inline-flex; align-items: center; gap: 8px; background: transparent;
          border: 1px solid var(--line); color: var(--ink-soft); padding: 9px 16px; border-radius: 999px;
          font-size: 13px; cursor: pointer; font-family: var(--sans); transition: all .2s ease;
        }
        .ct-clear:hover { border-color: var(--wine); color: var(--wine); }
        .ct-clear.is-confirm { background: var(--wine); border-color: var(--wine); color: var(--paper); }

        .ct-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
        .ct-list { display: flex; flex-direction: column; gap: 16px; }

        .ct-item {
          display: grid; grid-template-columns: 150px 1fr auto; gap: 20px; align-items: stretch;
          background: var(--paper-2); border: 1px solid var(--line); border-radius: 18px; padding: 14px;
        }
        .ct-thumb { display: block; border-radius: 12px; overflow: hidden; aspect-ratio: 1 / 1; align-self: start; }
        .ct-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
        .ct-item:hover .ct-thumb img { transform: scale(1.05); }

        .ct-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; padding: 4px 0; }
        .ct-artist { margin: 0; font-size: 12.5px; color: var(--ink-soft); }
        .ct-artist span { color: #a3946f; }
        .ct-name { font-family: var(--serif); font-weight: 500; font-size: 20px; line-height: 1.25; color: var(--brass-deep); text-decoration: none; }
        .ct-name:hover { text-decoration: underline; }
        .ct-medium { margin: 0 0 6px; font-size: 13px; color: var(--ink-soft); }
        .ct-badge {
          display: inline-flex; align-items: center; gap: 5px; align-self: flex-start;
          font-size: 11.5px; color: var(--brass-deep); background: var(--paper);
          border: 1px solid var(--line); padding: 4px 10px; border-radius: 999px;
        }
        .ct-item-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-top: auto; padding-top: 14px; }
        .ct-item-actions button {
          display: inline-flex; align-items: center; gap: 6px; background: none; border: none; padding: 0;
          font-size: 12.5px; color: var(--ink-soft); cursor: pointer; font-family: var(--sans);
          text-decoration: underline; text-underline-offset: 3px;
        }
        .ct-item-actions button:hover { color: var(--wine); }

        .ct-price { text-align: right; padding: 4px 6px 0 0; }
        .ct-price span { display: block; font-size: 11px; color: #a3946f; }
        .ct-price strong { font-family: var(--serif); font-weight: 500; font-size: 22px; white-space: nowrap; }

        .ct-continue {
          align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; margin-top: 6px;
          color: var(--brass-deep); font-size: 14px; font-weight: 500; text-decoration: none;
          border-bottom: 1px solid transparent; transition: border-color .2s ease;
        }
        .ct-continue:hover { border-color: var(--brass-deep); }

        .ct-summary {
          position: sticky; top: 88px; background: var(--paper-2); border: 1px solid var(--line);
          border-radius: 20px; padding: 26px;
        }
        .ct-summary h2 { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 18px; }
        .ct-row { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; padding: 8px 0; }
        .ct-row.muted { color: var(--ink-soft); font-size: 13px; }
        .ct-total {
          display: flex; justify-content: space-between; align-items: baseline;
          border-top: 1px solid var(--line); margin-top: 10px; padding-top: 16px; margin-bottom: 20px;
        }
        .ct-total span { font-size: 14px; }
        .ct-total strong { font-family: var(--serif); font-weight: 500; font-size: 28px; }
        .ct-checkout {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--ink); color: var(--paper); text-decoration: none;
          padding: 14px; border-radius: 999px; font-size: 14.5px; font-weight: 500; transition: background .2s ease;
        }
        .ct-checkout:hover { background: var(--wine); }
        .ct-trust { list-style: none; padding: 0; margin: 20px 0 0; display: flex; flex-direction: column; gap: 12px; }
        .ct-trust li { display: flex; gap: 10px; align-items: flex-start; font-size: 12.5px; line-height: 1.5; color: var(--ink-soft); }
        .ct-trust svg { color: var(--brass-deep); flex-shrink: 0; margin-top: 1px; }

        .ct-empty { text-align: center; padding: 70px 20px 90px; background: var(--paper-2); border: 1px dashed var(--line); border-radius: 22px; }
        .ct-empty-icon {
          width: 72px; height: 72px; margin: 0 auto 20px; border-radius: 50%; background: var(--paper);
          border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; color: var(--brass-deep);
        }
        .ct-empty h2 { font-family: var(--serif); font-weight: 500; font-size: 26px; margin: 0 0 10px; }
        .ct-empty p { color: var(--ink-soft); font-size: 14.5px; line-height: 1.6; max-width: 420px; margin: 0 auto 24px; }
        .ct-empty-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .ct-cta {
          display: inline-flex; align-items: center; gap: 8px; background: var(--ink); color: var(--paper);
          text-decoration: none; padding: 12px 22px; border-radius: 999px; font-size: 14px; font-weight: 500; transition: background .2s ease;
        }
        .ct-cta:hover { background: var(--brass-deep); }
        .ct-ghost {
          display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--line); color: var(--ink);
          text-decoration: none; padding: 12px 22px; border-radius: 999px; font-size: 14px; transition: all .2s ease;
        }
        .ct-ghost:hover { border-color: var(--wine); color: var(--wine); }

        .ct-bar { display: none; }

        .ct-toast {
          position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 90;
          display: flex; align-items: center; gap: 16px; background: var(--ink); color: var(--paper);
          padding: 12px 14px 12px 20px; border-radius: 999px; font-size: 13px;
          box-shadow: 0 16px 40px rgba(0,0,0,.28); max-width: 92vw;
        }
        .ct-toast span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ct-toast-note { display: flex; align-items: center; gap: 8px; padding-right: 6px; }
        .ct-toast button {
          background: rgba(246,241,230,.14); color: var(--paper); border: none; padding: 6px 14px;
          border-radius: 999px; font-size: 12.5px; font-weight: 600; cursor: pointer;
        }
        .ct-toast button:hover { background: rgba(246,241,230,.26); }

        @media (max-width: 980px) {
          .ct-layout { grid-template-columns: 1fr; }
          .ct-summary { position: static; }
        }
        @media (max-width: 620px) {
          .ct-shell { padding: 36px 16px 120px; }
          .ct-item { grid-template-columns: 96px 1fr; gap: 14px; padding: 12px; }
          .ct-price { grid-column: 2; text-align: left; padding: 0; display: flex; align-items: baseline; gap: 8px; }
          .ct-price span { display: inline; }
          .ct-name { font-size: 17px; }
          .ct-bar {
            display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 80;
            align-items: center; justify-content: space-between; gap: 16px;
            background: var(--paper); border-top: 1px solid var(--line); padding: 12px 16px;
            box-shadow: 0 -10px 30px rgba(28,23,18,.08);
          }
          .ct-bar span { display: block; font-size: 11px; color: #a3946f; }
          .ct-bar strong { font-family: var(--serif); font-weight: 500; font-size: 20px; }
          .ct-bar a {
            display: inline-flex; align-items: center; gap: 8px; background: var(--ink); color: var(--paper);
            text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: 500;
          }
          .ct-toast { bottom: 84px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ct-app * { transition: none !important; animation: none !important; }
        }
      `}</style>
    </div>
  );
}