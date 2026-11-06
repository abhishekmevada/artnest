import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Heart, X, ShoppingCart, CreditCard, Star, ArrowLeft } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { IoMdBrush } from "react-icons/io";
import { IoCameraOutline, IoColorPaletteOutline } from "react-icons/io5";
import homeHeroVideo from "../../assets/home_hero_video.mp4";
import { PiCubeFocus, PiPaintBrushBroadFill } from "react-icons/pi";
import { FaArrowsToCircle, FaShieldHeart } from "react-icons/fa6";
import {
  MdTexture,
  MdOutlineDraw,
  MdOutlineLayers,
  MdOutlineVerified,
  MdArrowOutward,
  MdHandshake,
} from "react-icons/md";
import { LuTruck, LuHeadset } from "react-icons/lu";
import { TfiMedall } from "react-icons/tfi";
import { API_BASE_URL } from "@/config/api";
const MotionLink = motion.create(Link);

const mediums = [
  {
    name: "Painting",
    works: "1,420 works",
    icon: IoMdBrush,
    slug: "paintings",
  },
  {
    name: "Sculpture",
    works: "480 works",
    icon: PiCubeFocus,
    slug: "sculptures",
  },
  {
    name: "Ceramics",
    works: "610 works",
    icon: FaArrowsToCircle,
    slug: "ceramics",
  },
  {
    name: "Photography",
    works: "890 works",
    icon: IoCameraOutline,
    slug: "photography",
  },
  {
    name: "Textile",
    works: "340 works",
    icon: MdTexture,
    slug: "textile",
  },
  {
    name: "Digital Art",
    works: "520 works",
    icon: MdOutlineDraw,
    slug: "digital",
  },
  {
    name: "Mixed Media",
    works: "290 works",
    icon: MdOutlineLayers,
    slug: null,
  },
  {
    name: "Printmaking",
    works: "410 works",
    icon: PiPaintBrushBroadFill,
    slug: "printmaking",
  },
];

function EyebrowLabel({ children }) {
  return (
    <motion.p
      initial={{
        opacity: 0,
        y: 25,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.4,
      }}
      transition={{
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mb-3 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#984c30] sm:text-xs"
    >
      {children}
    </motion.p>
  );
}

function SectionHeading({ children }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 1,
        delay: 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="font-serif text-[#201a17] text-[34px] sm:text-[40px] lg:text-[42px] leading-none font-normal"
    >
      {children}
    </motion.h2>
  );
}

function MediumCard({ medium, index }) {
  const ref = React.useRef(null);

  // Detect when the card enters the viewport.
  const isInView = useInView(ref, {
    once: true,
    amount: 0.25,
  });

  // Remembers that the card has already entered the viewport.
  // This stays true even when Home re-renders because of wishlist/modal state.
  const [hasEntered, setHasEntered] = React.useState(false);

  React.useEffect(() => {
    if (isInView) {
      setHasEntered(true);
    }
  }, [isInView]);

  const hiddenY = index % 2 === 0 ? -35 : 35;

  return (
    <MotionLink
      ref={ref}
      to={medium.slug ? `/discover?category=${medium.slug}` : "/discover"}
      /*
        We do NOT use `initial={{ opacity: 0 }}`
        because after a re-render we never want the card
        to go back to its hidden state.
      */
      initial={false}
      /*
        Before first viewport entry:
        opacity = 0
        y = starting position

        After first viewport entry:
        opacity = 1
        y = 0

        Once hasEntered becomes true, it never becomes false.
      */
      animate={{
        opacity: hasEntered ? 1 : 0,
        y: hasEntered ? 0 : hiddenY,
      }}
      transition={
        hasEntered
          ? {
              duration: 0.8,
              delay: index * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }
          : {
              duration: 0,
            }
      }
      className="
        group
        relative
        isolate
        flex
        min-h-[145px]
        cursor-pointer
        flex-col
        items-center
        justify-center
        overflow-hidden
        rounded-[10px]
        border
        border-transparent
        bg-[radial-gradient(circle_at_90%_95%,rgba(255,255,255,0.88)_0%,transparent_48%),radial-gradient(circle_at_85%_75%,rgba(226,205,187,0.55)_0%,transparent_58%),linear-gradient(140deg,#ffffff_0%,#f8eadc_48%,#eee0d3_100%)]
        px-3
        py-5
        transition-[border-color,box-shadow,background-color]
        duration-500
        ease-out
        hover:-translate-y-5
        hover:border-[#984c30]
        hover:shadow-[0_10px_25px_rgba(248,234,220,0.8)]
        sm:min-h-[160px]
        sm:px-4
        sm:py-6
        md:min-h-[170px]
        lg:min-h-[180px]
        xl:min-h-[190px]
      "
    >
      {/* White Top → Bottom Hover Overlay */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          origin-top
          scale-y-0
          bg-white
          transition-transform
          duration-500
          ease-out
          group-hover:scale-y-100
        "
      />

      {/* Card Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon Box */}
        <div
          className="
            flex
            h-[54px]
            w-[54px]
            items-center
            justify-center
            rounded-[16px]
            bg-white
            text-[#984c30]
            shadow-[0_2px_5px_rgba(80,50,30,0.08)]
            transition-all
            duration-300
            ease-out
            group-hover:scale-105
            group-hover:shadow-[0_0_25px_rgba(248,234,220,0.8)]
            group-hover:border
            group-hover:border-[#984c30]
            sm:h-[58px]
            sm:w-[58px]
            sm:rounded-[17px]
          "
        >
          <span
            className={`
              relative
              z-10
              inline-block
              transform-gpu
              transition-transform
              duration-300
              ease-out
              group-hover:scale-110
              ${
                medium.name === "Textile"
                  ? "text-[17px] font-semibold tracking-[-2px]"
                  : "text-[25px] sm:text-[26px]"
              }
            `}
          >
            <medium.icon />
          </span>
        </div>

        {/* Medium Name */}
        <h3
          className="
            mt-4
            text-center
            text-[16px]
            font-medium
            leading-tight
            text-[#171310]
            transition-colors
            duration-300
            sm:text-[18px]
            md:text-[19px]
          "
        >
          {medium.name}
        </h3>

        {/* Number of Works */}
        <p
          className="
            mt-3
            text-center
            text-[12px]
            font-medium
            tracking-[0.3px]
            text-[#765e51]
            transition-colors
            duration-300
            sm:mt-4
            sm:text-[13px]
            md:text-[14px]
          "
        >
          {medium.works}
        </p>
      </div>
    </MotionLink>
  );
}

function WishlistButton({ isWishlisted, onToggle }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`
        absolute
        right-3
        top-3
        z-20
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-full
        bg-white
        shadow-sm
        transition-transform
        duration-300
        ease-out
        hover:scale-105
        ${isWishlisted ? "text-[#d64545]" : "text-black"}
      `}
    >
      <Heart
        size={17}
        strokeWidth={2}
        className={isWishlisted ? "text-[#d64545]" : "text-black"}
        fill={isWishlisted ? "currentColor" : "none"}
      />
    </button>
  );
}

function ArtworkCard({ work, index, onSelect, onAddToWishlist, isWishlisted }) {
  return (
    <motion.article
      onClick={() => onSelect(work)}
      initial={{
        opacity: 0,
        y: 35,
        scale: 0.97,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.55,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -5,
        transition: {
          type: "spring",
          stiffness: 320,
          damping: 24,
        },
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(work);
        }
      }}
      className="
        group
        relative
        cursor-pointer
        overflow-hidden
        rounded-[20px]
        bg-white
        shadow-[0_6px_18px_rgba(80,50,30,0.06)]
        transition-shadow
        duration-300
        hover:shadow-[0_12px_28px_rgba(80,50,30,0.12)]
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-4
        focus-visible:outline-[#a65335]
      "
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#f8eadc]">
        <img
          src={work.img}
          alt={work.title}
          className="
      h-full
      w-full
      object-cover
      transition-all
      duration-700
      ease-out
      group-hover:scale-[1.05]
    "
        />

        {/* Wishlist */}
        <WishlistButton
          isWishlisted={isWishlisted}
          onToggle={() => onAddToWishlist(work)}
        />
      </div>

      {/* Details */}
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-[18px] leading-[1.15] text-[#201a17] sm:text-[19px]">
            {work.title}
          </h3>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f1e4d8] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.4px] text-[#875039]">
            <MdOutlineVerified className="text-[11px]" />
            Verified
          </span>
        </div>

        <p className="mt-2 text-[12px] leading-[1.5] text-[#765e51] sm:text-[13px]">
          {work.artist}
        </p>

        <p className="mt-1 text-[12px] leading-[1.5] text-[#8a7569] sm:text-[13px]">
          {work.medium}
        </p>

        <p className="mt-3 text-[15px] font-semibold text-[#29221e]">
          {formatPrice(work.price)}
        </p>
      </div>
    </motion.article>
  );
}

function ViewAllArtistsButton() {
  const ref = React.useRef(null);

  // Detect when the button enters the viewport.
  const isInView = useInView(ref, {
    once: true,
    amount: 0.3,
  });

  // Once true, it stays true for the lifetime of this page visit.
  const [hasEntered, setHasEntered] = React.useState(false);

  React.useEffect(() => {
    if (isInView) {
      setHasEntered(true);
    }
  }, [isInView]);

  return (
    <MotionLink
      ref={ref}
      to="/artists"
      /*
        Do not use an initial hidden state.
        We control the hidden/visible state ourselves.
      */
      initial={false}
      animate={{
        opacity: hasEntered ? 1 : 0,
        y: hasEntered ? 0 : 20,
      }}
      transition={
        hasEntered
          ? {
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }
          : {
              duration: 0,
            }
      }
      whileHover={{
        scale: 1.05,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 20,
        },
      }}
      whileTap={{ scale: 0.97 }}
      className="
        inline-flex
        min-h-11
        items-center
        justify-center
        rounded-[8px]
        border
        border-[#a65335]
        px-6
        py-2.5
        text-[13px]
        font-semibold
        text-[#a65335]
        transition-colors
        duration-300
        hover:bg-[#a65335]
        hover:text-white
      "
    >
      View all artists
    </MotionLink>
  );
}

function ArtistCard({ artist, onSelect, index }) {
  const initials =
    artist.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("") || "A";

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.55,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col rounded-[20px] border border-[#ead8ca] shadow-[0_10px_15px_rgba(80,50,30,0.1)] bg-[radial-gradient(circle_at_8%_50%,rgba(255,232,214,0.4)_0%,transparent_40%),radial-gradient(circle_at_92%_50%,rgba(255,232,214,0.4)_0%,transparent_40%),linear-gradient(90deg,#fffaf5_0%,#ffffff_20%,#ffffff_80%,#fffaf5_100%)] p-5 transition-shadow duration-300 hover:shadow-[0_14px_30px_rgba(80,50,30,0.13)] sm:p-6"
    >
      <div className="flex items-center gap-4">
        {/* Artist initials */}
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#a65335] text-xl font-semibold uppercase tracking-wide text-white ring-2 ring-white transition-transform duration-300 group-hover:scale-105 sm:h-[72px] sm:w-[72px] sm:text-2xl"
          aria-label={`${artist.name} initials`}
        >
          {initials}
        </div>

        <div className="min-w-0">
          <h3 className="font-serif text-[20px] leading-tight text-[#201a17]">
            {artist.name}
          </h3>
          <p className="mt-1 text-[13px] text-[#765e51]">{artist.location}</p>
        </div>
      </div>

      <p className="mt-5 flex-1 text-[14px] leading-[1.6] text-[#665650]">
        {artist.bio}
      </p>

      <motion.button
        type="button"
        onClick={onSelect}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.97 }}
        aria-haspopup="dialog"
        className="mt-5 self-start border-b border-[#a65335]/50 pb-1 text-[13px] font-semibold text-[#a65335] transition-colors hover:border-[#8f462c] hover:text-[#8f462c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a65335]"
      >
        View studio <span aria-hidden="true">→</span>
      </motion.button>
    </motion.article>
  );
}

function CuratedArtworkCard({
  work,
  index,
  onSelect,
  onAddToWishlist,
  isWishlisted,
}) {
  return (
    <motion.div
      onClick={() => onSelect(work)}
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.94,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.75,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative h-full cursor-pointer overflow-hidden rounded-[20px] bg-[#eaded5]"
    >
      {/* Artwork */}
      <img
        src={work.img}
        alt={work.title}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,13,9,0.85)] via-[rgba(20,13,9,0.18)] to-transparent" />

      {/* Wishlist */}
      <WishlistButton
        isWishlisted={isWishlisted}
        onToggle={() => onAddToWishlist(work)}
      />

      {/* Artwork details */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.8px] text-white">
          {work.medium}
        </p>

        <h3 className="font-serif text-[21px] leading-[1.1] text-white">
          {work.title}
        </h3>

        <p className="mt-1 text-[12px] text-white">{work.artist}</p>

        <p className="mt-1 text-[13px] font-medium text-white">
          {formatPrice(work.price)}
        </p>
      </div>
    </motion.div>
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
        zIndex: 40,
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
            {art?.title}
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
                  r.reply?.artist_id?.name || art?.artist || "Artist";

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

function ArtworkDetailModal({
  work,
  onClose,
  onAddToWishlist,
  isWishlisted,
  onAddToCart,
  onBuyNow,
  isInCart = false,
}) {
  const [activeImage, setActiveImage] = useState(work.images?.[0] || work.img);
  const [showReviews, setShowReviews] = useState(false);
  const isSold = work.status === "sold";
  const navigate = useNavigate();
  const { user, blockIfArtist } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        p-3
        backdrop-blur-sm
        sm:p-5
      "
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-detail-title"
        className="
          relative
          max-h-[92vh]
          w-full
          max-w-[900px]
          overflow-hidden
          rounded-[20px]
          border
          border-[#ead8ca]
          bg-white
          shadow-[0_25px_60px_rgba(20,13,9,0.20)]
        "
      >
        {showReviews && (
          <ArtReviewsPanel art={work} onClose={() => setShowReviews(false)} />
        )}

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close artwork details"
          className="
            group
            absolute
            right-4
            top-4
            z-30
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-[#ead8ca]
            bg-white
            text-[#4a3429]
            transition-all
            duration-300
            hover:border-[#a65335]
            hover:bg-[#a65335]
            hover:text-white
            hover:scale-105
          "
        >
          <span className="flex h-5 w-5 items-center justify-center transform-gpu transition-transform duration-300 group-hover:rotate-90">
            <X size={20} strokeWidth={2} />
          </span>
        </button>

        {/* Scrollable Content */}
        <div
          className="
            max-h-[92vh]
            overflow-y-auto
            [scrollbar-width:thin]
            [scrollbar-color:#c98a6e_transparent]
            [&::-webkit-scrollbar]:w-[5px]
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#c98a6e]
            [&::-webkit-scrollbar-thumb:hover]:bg-[#a65335]
          "
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Product Image + Thumbnails */}
            <div className="bg-[linear-gradient(180deg,#ffffff_0%,#edd7cc_50%,#ffffff_100%)] p-4 sm:p-6 lg:p-7">
              {/* Main Image */}
              <div className="overflow-hidden rounded-[10px]">
                <img
                  src={activeImage}
                  alt={work.title}
                  className="aspect-square h-full w-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="mt-10 grid grid-cols-3 gap-5">
                {(work.images?.length ? work.images : [work.img])
                  .filter(Boolean)
                  .slice(0, 3)
                  .map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={`
          overflow-hidden
          rounded-[8px]
          border
          bg-white
          transition-transform
          duration-200
          hover:scale-[1.03]
          ${
            activeImage === image
              ? "border-2 border-[#a65335]"
              : "border-[#ead8ca]"
          }
        `}
                    >
                      <img
                        src={image}
                        alt={`${work.title} view ${index + 1}`}
                        className="h-[75px] w-full object-cover"
                      />
                    </button>
                  ))}
              </div>
            </div>

            {/* Product Information */}
            <div className="p-5 sm:p-7 lg:p-9">
              <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#984c30] sm:text-[11px]">
                Original Artwork
              </p>

              <h2
                id="artwork-detail-title"
                className="mt-2 pr-10 font-serif text-[27px] leading-[1.08] text-[#201a17] sm:text-[32px]"
              >
                {work.title}
              </h2>

              <p className="mt-2 text-[13px] text-[#765e51]">
                by {work.artist}
              </p>

              <div className="mt-5 border-y border-[#eee8e3] py-5">
                <p className="text-[22px] font-semibold text-[#29221e]">
                  {formatPrice(work.price)}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <MdOutlineVerified className="text-[18px] text-[#a65335]" />
                  <span className="text-[12px] font-medium text-[#665650]">
                    Verified artwork
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.7px] text-[#984c30]">
                    Medium
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.6] text-[#665650]">
                    {work.medium}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.7px] text-[#984c30]">
                    About this work
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.7] text-[#665650]">
                    An original artwork by {work.artist}, created using{" "}
                    {work.medium.toLowerCase()}.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-7 space-y-3">
                <motion.button
                  type="button"
                  disabled={isSold && !isInCart}
                  onClick={() => onAddToCart(work)}
                  whileHover={{ scale: isSold && !isInCart ? 1 : 1.03 }}
                  whileTap={{ scale: isSold && !isInCart ? 1 : 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                  className={`
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[8px]
                    px-5
                    py-3
                    text-[14px]
                    font-semibold
                    text-white
                    transition-colors
                    duration-300
                    ${
                      isSold && !isInCart
                        ? "cursor-not-allowed bg-[#a65335]/50"
                        : "bg-[#a65335] hover:bg-[#8f462c]"
                    }
                  `}
                >
                  <ShoppingCart size={17} strokeWidth={2} />
                  {isInCart
                    ? "View in cart"
                    : isSold
                    ? "Artwork sold"
                    : "Add to cart"}
                </motion.button>

                <motion.button
                  type="button"
                  disabled={isSold}
                  onClick={() => onBuyNow(work)}
                  whileHover={{ scale: isSold ? 1 : 1.03 }}
                  whileTap={{ scale: isSold ? 1 : 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                  className={`
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[8px]
                    border
                    border-[#a65335]
                    bg-transparent
                    px-5
                    py-3
                    text-[14px]
                    font-semibold
                    text-[#a65335]
                    transition-colors
                    duration-300
                    hover:bg-[#fff4eb]
                    ${isSold ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <CreditCard size={17} strokeWidth={2} />
                  {isSold ? "Sold out" : "Buy now"}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setShowReviews(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[8px]
                    border
                    border-[#a65335]
                    bg-[#fff8f5]
                    px-5
                    py-3
                    text-[14px]
                    font-semibold
                    text-[#a65335]
                    transition-colors
                    duration-300
                    hover:bg-[#fdeee7]
                  "
                >
                  <Star size={17} strokeWidth={2} />
                  View reviews
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => onAddToWishlist(work)}
                  whileHover={{ scale: 1.03 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[8px]
                    px-5
                    py-3
                    text-[13px]
                    font-semibold
                    text-[#4a3429]
                    transition-colors
                    duration-300
                    hover:bg-[#fff4eb]
                  "
                >
                  <Heart
                    size={18}
                    strokeWidth={1.8}
                    fill={isWishlisted ? "currentColor" : "none"}
                    className={
                      isWishlisted ? "text-[#d64545]" : "text-[#4a3429]"
                    }
                  />
                  {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const Home = () => {
  const navigate = useNavigate();
  const { user, blockIfArtist } = useAuth();
  const { inCart, toggleCart, setCartItems } = useCart();
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sculptures, setSculptures] = useState([]);
  const [sculpturesLoading, setSculpturesLoading] = useState(true);
  const [sculpturesError, setSculpturesError] = useState("");
  const [artists, setArtists] = useState([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [artistsError, setArtistsError] = useState("");

  // Use the fetched paintings state safely (falls back to SCULPTURES or an empty list if not loaded)
  const curatedArtworks = [...paintings, ...sculptures];

  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("artnest-wishlist")) || [];
  });

  useEffect(() => {
    const fetchHomePaintings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/guest/home-paintings`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch paintings");
        }

        const data = await response.json();

        const formattedPaintings = (data.paintings || []).map((painting) => ({
          id: painting._id,
          _id: painting._id,
          artworkId: painting.artworkId,
          title: painting.title,
          artist: painting.artist?.name || "Unknown Artist",
          medium: painting.medium,
          price: Number(painting.price) || 0,
          value: Number(painting.price) || 0,
          img: painting.image?.[0]?.url || "/placeholder.png",
          images:
            painting.image?.map((image) => image.url).filter(Boolean) || [],
          status: painting.status,
          description: painting.description,
          dimensions: painting.dimensions,
          dims: painting.dimensions || "Not specified",
        }));

        setPaintings(formattedPaintings);
      } catch (error) {
        console.error("Error fetching paintings:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchHomeSculptures = async () => {
      try {
        setSculpturesLoading(true);
        setSculpturesError("");

        const response = await fetch(
          `${API_BASE_URL}/guest/home-sculptures`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sculptures");
        }

        const data = await response.json();

        const formattedSculptures = (data.sculptures || []).map(
          (sculpture) => ({
            id: sculpture._id,
            _id: sculpture._id,
            artworkId: sculpture.artworkId,
            title: sculpture.title,
            artist: sculpture.artist?.name || "Unknown Artist",
            medium: sculpture.medium,
            price: Number(sculpture.price) || 0,
            value: Number(sculpture.price) || 0,
            img: sculpture.image?.[0]?.url || "/placeholder.png",
            images:
              sculpture.image?.map((image) => image.url).filter(Boolean) || [],
            status: sculpture.status,
            description: sculpture.description,
            dimensions: sculpture.dimensions,
            dims: sculpture.dimensions || "Not specified",
          }),
        );

        setSculptures(formattedSculptures);
      } catch (error) {
        console.error("Error fetching sculptures:", error);
        setSculpturesError(error.message);
      } finally {
        setSculpturesLoading(false);
      }
    };
    const fetchArtists = async () => {
      try {
        setArtistsLoading(true);
        setArtistsError("");

        const response = await fetch(
          `${API_BASE_URL}/guest/get-artist-home`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch artists");
        }

        const data = await response.json();

        if (data.success) {
          const formattedArtists = (data.artists || []).map((artist) => ({
            _id: artist._id,
            name: artist.name || "Unknown Artist",
            location: artist.address || "Location not available",
            bio: artist.bio || "No biography available.",
            avatar: artist.avatar || "/default-avatar.png",

            studioStory: artist.studioStory || "",
            yearsPracticing: artist.yearsPracticing || "",
            commissionsOpen: artist.commissionsOpen,
            specialties: artist.specialties || [],
            materials: artist.materials || [],
            featuredWorks: artist.featuredWorks || [],
          }));

          setArtists(formattedArtists);
        } else {
          throw new Error(data.message || "Unable to load artists");
        }
      } catch (error) {
        console.error("Artist fetch error:", error);
        setArtistsError(error.message || "Something went wrong");
      } finally {
        setArtistsLoading(false);
      }
    };

    fetchArtists();

    fetchHomeSculptures();

    fetchHomePaintings();
  }, []);

  // Fetch user's wishlist from backend when authenticated
  useEffect(() => {
    const fetchUserWishlist = async () => {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("accessToken");

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

  // Fetch user's cart from backend when authenticated
  useEffect(() => {
    const fetchUserCart = async () => {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (!token || !user || user?.role !== "buyer") {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/buyer/get-cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await response.json();
        const serverItems = (data.cartItems || [])
          .filter((c) => c && c.artwork_id)
          .map((c) => {
            const art = c.artwork_id;
            const priceNum = Number(art.price ?? art.value ?? 0);
            return {
              cartItemId: c._id,
              id: art._id || art.artworkId,
              _id: art._id,
              artworkDbId: art._id,
              artworkId: art.artworkId || art._id,
              title: art.title || "Untitled",
              artist: art.artist_id?.name || art.artist || "Unknown Artist",
              location: art.location || "India",
              medium: art.medium || "Original",
              dims: art.dimensions || art.dims || "",
              img:
                art.image?.[0]?.url ||
                (typeof art.image === "string" ? art.image : art.img) ||
                "",
              images:
                art.image?.map((img) => img.url).filter(Boolean) ||
                [art.img].filter(Boolean),
              value: priceNum,
              price: priceNum,
              addedAt: new Date(c.createdAt || Date.now()).getTime(),
            };
          });

        if (typeof setCartItems === "function") {
          setCartItems(serverItems);
        }
      } catch (err) {
        console.error("Error fetching user cart on home:", err);
      }
    };

    fetchUserCart();
  }, [user, setCartItems]);

  const addToWishlist = async (work) => {
    if (!work?._id) return;

    if (blockIfArtist && blockIfArtist()) return;

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!user || !token) {
      navigate("/buyer/login");
      return;
    }

    if (user.role !== "buyer") {
      alert("Only buyers can add artworks to their wishlist.");
      return;
    }

    const alreadyExists = wishlist.some(
      (item) => item._id === work._id || item.artworkId === work._id,
    );

    if (alreadyExists) {
      const existingItem = wishlist.find(
        (item) => item._id === work._id || item.artworkId === work._id,
      );
      const removeId = existingItem?.wishlistId || work._id;

      const previousWishlist = [...wishlist];
      const updatedWishlist = wishlist.filter(
        (item) => item._id !== work._id && item.artworkId !== work._id,
      );
      setWishlist(updatedWishlist);
      localStorage.setItem("artnest-wishlist", JSON.stringify(updatedWishlist));

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
          throw new Error("Failed to remove item from wishlist");
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
        _id: work._id,
        artworkId: work.artworkId || work._id,
        title: work.title,
        artist: work.artist,
        medium: work.medium,
        price: work.price,
        img: work.img,
      };
      const updatedWishlist = [...wishlist, optimisticItem];
      setWishlist(updatedWishlist);
      localStorage.setItem("artnest-wishlist", JSON.stringify(updatedWishlist));

      try {
        const response = await fetch(
          `${API_BASE_URL}/buyer/wishlist-item/${work._id}`,
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
              item._id === work._id
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

  const handleAddToCart = (work) => {
    if (!work) return;
    if (work.status === "sold") return;
    if (blockIfArtist && blockIfArtist()) return;

    const workId = work._id || work.id;
    const isCarted =
      inCart.has(workId) || inCart.has(work.id) || inCart.has(work._id);

    if (isCarted) {
      navigate("/cart");
      return;
    }

    const priceNum =
      typeof work.price === "number"
        ? work.price
        : typeof work.value === "number"
        ? work.value
        : Number(String(work.price || "").replace(/[^0-9.]/g, "")) || 0;

    const cartItem = {
      ...work,
      id: workId,
      _id: workId,
      artworkDbId: work._id || work.id,
      artworkId: work.artworkId || workId,
      title: work.title || "Untitled",
      artist: work.artist || "Unknown Artist",
      medium: work.medium || "Original Artwork",
      price: priceNum,
      value: priceNum,
      img: work.img || work.images?.[0] || "/placeholder.png",
      images: work.images?.length ? work.images : [work.img].filter(Boolean),
      dims: work.dims || work.dimensions || "Not specified",
      location: work.location || "Not specified",
    };

    toggleCart(cartItem);

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (user && user.role === "buyer" && token && workId) {
      fetch(`${API_BASE_URL}/buyer/cart/${workId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).catch((err) => console.error("Error syncing cart to backend:", err));
    }
  };

  const handleBuyNow = (work) => {
    if (!work) return;
    if (work.status === "sold") return;
    if (blockIfArtist && blockIfArtist()) return;

    const workId = work._id || work.id;

    const priceNum =
      typeof work.price === "number"
        ? work.price
        : typeof work.value === "number"
        ? work.value
        : Number(String(work.price || "").replace(/[^0-9.]/g, "")) || 0;

    const cartItem = {
      ...work,
      id: workId,
      _id: workId,
      artworkDbId: work._id || work.id,
      artworkId: work.artworkId || workId,
      title: work.title || "Untitled",
      artist: work.artist || "Unknown Artist",
      medium: work.medium || "Original Artwork",
      price: priceNum,
      value: priceNum,
      img: work.img || work.images?.[0] || "/placeholder.png",
      images: work.images?.length ? work.images : [work.img].filter(Boolean),
      dims: work.dims || work.dimensions || "Not specified",
      location: work.location || "Not specified",
    };

    if (
      !inCart.has(workId) &&
      !inCart.has(work.id) &&
      !inCart.has(work._id)
    ) {
      toggleCart(cartItem);
    }

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (user && user.role === "buyer" && token && workId) {
      fetch(`${API_BASE_URL}/buyer/cart/${workId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).catch((err) => console.error("Error syncing cart to backend:", err));
    }

    if (!user || !token) {
      navigate("/buyer/login");
      return;
    }

    if (user.role !== "buyer") {
      alert("Only buyers can purchase artworks.");
      return;
    }

    navigate("/checkout");
  };

  useEffect(() => {
    if (!selectedArtist && !selectedWork) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [selectedArtist, selectedWork]);
  const artistInitials =
    selectedArtist?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("") || "A";

  return (
    <div>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Work+Sans:wght@400;500;600&display=swap');
    `}</style>
      <section className="relative isolate w-full overflow-hidden bg-[#1c1712]">
        {/* Background Video */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={homeHeroVideo}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-[1450px] items-center justify-center px-4 py-16 text-center sm:min-h-[650px] sm:px-6 sm:py-20 lg:min-h-[650px] lg:px-[70px] lg:py-[68px]">
          <div className="w-full max-w-[900px]">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
  mb-[26px] inline-flex items-center gap-[9px]
  rounded-full border border-[rgba(240,217,163,0.4)]
  bg-white/10 px-[14px] py-2
  text-[12px] font-medium uppercase tracking-[0.2em]
  text-[#f1d9a3] backdrop-blur-[10px]
"
            >
              <span className="h-[7px] w-[7px] rounded-full bg-[#e0bb74] shadow-[0_0_12px_rgba(224,187,116,0.5)]" />
              CURATED GLOBAL MARKETPLACE
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
  mb-[26px]
  text-[clamp(40px,6.4vw,84px)]
  font-medium leading-[1.04]
  tracking-[-0.025em] text-white
  [text-shadow:0_4px_40px_rgba(0,0,0,0.45)]
  [text-wrap:balance]
"
              style={{
                fontFamily: '"Fraunces", "Iowan Old Style", Georgia, serif',
              }}
            >
              A marketplace for{" "}
              <em
                className="
  bg-[linear-gradient(100deg,#f8e6b8_0%,#e0bb74_45%,#c9a35a_100%)]
  bg-clip-text font-normal italic text-transparent
  [filter:drop-shadow(0_4px_24px_rgba(0,0,0,0.35))]
  [padding-right:0.08em]
"
              >
                original
              </em>
              <br className="hidden sm:block" />{" "}
              <em
                className="
  bg-[linear-gradient(100deg,#f8e6b8_0%,#e0bb74_45%,#c9a35a_100%)]
  bg-clip-text font-normal italic text-transparent
  [filter:drop-shadow(0_4px_24px_rgba(0,0,0,0.35))]
  [padding-right:0.08em]
"
              >
                art
              </em>
              , sculptures &amp;
              <br className="hidden sm:block" /> handmade creations
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.75,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
  mx-auto mb-[38px] max-w-[620px]
  text-[clamp(15.5px,1.4vw,17.5px)]
  leading-[1.75] text-[#fbf1da]
  [text-shadow:0_1px_18px_rgba(0,0,0,0.55)]
  [text-wrap:pretty]
"
            >
              Connect directly with independent creators worldwide. Acquire
              museum-grade paintings, studio ceramics, and bespoke commissions
              with verified authenticity.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.7,
                delay: 0.38,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
  mx-auto mt-0 flex w-full max-w-[500px]
  flex-col items-center justify-center gap-3
  sm:flex-row sm:gap-[14px]
"
            >
              {/* Explore Art */}
              <MotionLink
                to="/discover"
                whileHover={{ scale: 1.06 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                className="
  group inline-flex h-[48px] w-full max-w-[240px]
  items-center justify-center gap-2
  rounded-full border border-white/20
  bg-[linear-gradient(135deg,#b88a3e_0%,#96702f_55%,#7a5a22_100%)]
  px-7 text-[14.5px] font-medium text-white
  shadow-[0_12px_30px_-8px_rgba(150,112,47,0.45)]
  transition-[background-color,border-color,color,box-shadow,filter] duration-200 ease-out
  hover:border-white/35 hover:brightness-110
  hover:shadow-[0_16px_32px_-8px_rgba(150,112,47,0.6)]
  sm:w-auto
"
              >
                Explore Art
                <span className="inline-block text-[18px] transition-transform duration-300 group-hover:translate-x-1.5 group-hover:rotate-[45deg]">
                  <MdArrowOutward />
                </span>
              </MotionLink>

              {/* Meet the Artists */}
              <MotionLink
                to="/artists"
                whileHover={{ scale: 1.06 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                className="
  inline-flex h-[48px] w-full max-w-[240px]
  items-center justify-center gap-2
  rounded-full border border-white/55
  bg-white px-7
  text-[14.5px] font-medium text-[#5c2b30]
  backdrop-blur-[10px]
  transition-[box-shadow,filter] duration-200 ease-out
  sm:w-auto
"
              >
                Meet the Artists
                <span className="text-[18px]">
                  <IoColorPaletteOutline />
                </span>
              </MotionLink>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.7,
                delay: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
  mt-[clamp(28px,5vw,44px)]
  inline-flex max-w-full flex-wrap items-center gap-4 justify-center
   
  text-[13px] text-[#f6ead0]
"
            >
              <div className="flex items-center gap-2 whitespace-nowrap px-3 py-2 sm:px-5 rounded-full border border-[rgba(240,217,163,0.4)] bg-white/10 p-1.5">
                <TfiMedall className="text-[17px] text-[#e0bb74]" />
                100% Original Work
              </div>

              <div className="flex items-center gap-2 whitespace-nowrap px-3 py-2 sm:px-5 rounded-full border border-[rgba(240,217,163,0.4)] bg-white/10 p-1.5">
                <MdHandshake className="text-[17px] text-[#e0bb74]" />
                Direct From Artists
              </div>

              <div className="flex items-center gap-2 whitespace-nowrap px-3 py-2 sm:px-5 rounded-full border border-[rgba(240,217,163,0.4)] bg-white/10 p-1.5">
                <FaShieldHeart className="text-[17px] text-[#e0bb74]" />
                Worldwide Insured Delivery
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="w-full bg-white px-4 py-12 sm:px-6 sm:py-14 md:px-8 lg:px-[5%] lg:py-16">
        <div className="mx-auto max-w-[1600px]">
          {/* Section Header */}
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 lg:mb-10">
            <div>
              <EyebrowLabel>Department Index</EyebrowLabel>

              <SectionHeading>Explore by Medium</SectionHeading>
            </div>
          </div>

          {/* Medium Cards */}
          <div
            className="
        grid
        grid-cols-2
        gap-3

        sm:grid-cols-3
        sm:gap-4

        md:grid-cols-4

        lg:grid-cols-4

        xl:grid-cols-8
      "
          >
            {mediums.map((medium, index) => (
              <MediumCard key={medium.name} medium={medium} index={index} />
            ))}
          </div>
        </div>
      </section>
      <section className="w-full bg-[linear-gradient(180deg,#ffffff_0%,#edd7cc_50%,#ffffff_100%)] px-5 sm:px-8 lg:px-[5%] py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#eee8e3] pb-6 sm:mb-10">
            <div>
              <EyebrowLabel>Featured Paintings</EyebrowLabel>
              <SectionHeading>
                The curated collection of paintings
              </SectionHeading>
            </div>
            <MotionLink
              to="/discover"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
              className="shrink-0 border-b border-[#a65335]/40 pb-0.5 text-[13px] font-semibold text-[#a65335] transition-colors duration-300 hover:border-[#8f462c] hover:text-[#8f462c]"
            >
              View all paintings
            </MotionLink>
          </div>

          {loading ? (
            <div className="py-12 text-center">Loading curated artworks...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : paintings.length === 0 ? (
            <div className="py-12 text-center">
              No artworks available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {paintings.map((work, index) => (
                <ArtworkCard
                  key={work._id}
                  work={work}
                  index={index}
                  onSelect={setSelectedWork}
                  onAddToWishlist={addToWishlist}
                  isWishlisted={wishlist.some(
                    (item) =>
                      item._id === work._id || item.artworkId === work._id,
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="w-full bg-[linear-gradient(180deg,#ffffff_0%,#edd7cc_50%,#ffffff_100%)] px-5 sm:px-8 lg:px-[5%] py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#eee8e3] pb-6 sm:mb-10">
            <div>
              <EyebrowLabel>Featured Sculptures</EyebrowLabel>
              <SectionHeading>Form, cast and carved</SectionHeading>
            </div>
            <MotionLink
              to="/discover?category=sculptures"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
              className="shrink-0 border-b border-[#a65335]/40 pb-0.5 text-[13px] font-semibold text-[#a65335] transition-colors duration-300 hover:border-[#8f462c] hover:text-[#8f462c]"
            >
              View all sculptures
            </MotionLink>
          </div>

          {sculpturesLoading ? (
            <div className="py-12 text-center">Loading sculptures...</div>
          ) : sculpturesError ? (
            <div className="py-12 text-center text-red-500">
              {sculpturesError}
            </div>
          ) : sculptures.length === 0 ? (
            <div className="py-12 text-center">No sculptures available.</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sculptures.map((work, index) => (
                <ArtworkCard
                  key={work._id}
                  work={work}
                  index={index}
                  onSelect={setSelectedWork}
                  onAddToWishlist={addToWishlist}
                  isWishlisted={wishlist.some(
                    (item) =>
                      item._id === work._id || item.artworkId === work._id,
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="w-full  px-4 py-12 sm:px-6 sm:py-14 md:px-8 lg:px-[5%] lg:py-16">
        <div className="mx-auto max-w-[1600px]">
          <EyebrowLabel>Artist Spotlight</EyebrowLabel>
          <SectionHeading>
            The studios behind this season&apos;s work
          </SectionHeading>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {artistsLoading ? (
              <p className="col-span-full py-10 text-center text-[#765e51]">
                Loading artists...
              </p>
            ) : artistsError ? (
              <p className="col-span-full py-10 text-center text-red-600">
                {artistsError}
              </p>
            ) : artists.length > 0 ? (
              artists.map((artist, index) => (
                <ArtistCard
                  key={artist._id}
                  artist={artist}
                  index={index}
                  onSelect={() => setSelectedArtist(artist)}
                />
              ))
            ) : (
              <p className="col-span-full py-10 text-center text-[#765e51]">
                No artists available.
              </p>
            )}
          </div>

          <div className="mt-8 text-center">
            <ViewAllArtistsButton />
          </div>
        </div>
      </section>
      {selectedArtist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          onClick={() => setSelectedArtist(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="artist-studio-title"
            className="
        relative
        w-full
        max-w-[560px]
        overflow-hidden
        rounded-[15px]
        border
        border-[#ead8ca]
        bg-[radial-gradient(circle_at_8%_50%,rgba(255,232,214,0.4)_0%,transparent_40%),radial-gradient(circle_at_92%_50%,rgba(255,232,214,0.4)_0%,transparent_40%),linear-gradient(90deg,#fffaf5_0%,#ffffff_20%,#ffffff_80%,#fffaf5_100%)]
        shadow-[0_25px_60px_rgba(20,13,9,0.20)]
      "
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedArtist(null)}
              aria-label="Close artist studio"
              className="
          group
          absolute
          right-6
          top-4
          z-30
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          border-[#ead8ca]
          bg-white
          text-[#4a3429]
          transition-all
          duration-300
          ease-out
          hover:border-[#a65335]
          hover:bg-[#a65335]
          hover:text-white
          hover:scale-105
        "
            >
              <span
                className="
    flex
    h-5
    w-5
    items-center
    justify-center
    transform-gpu
    origin-center
    transition-transform
    duration-300
    ease-out
    group-hover:rotate-90
  "
              >
                <X size={20} strokeWidth={2} />
              </span>
            </button>

            {/* Modal Content */}
            <div
              className="
    max-h-[90vh]
    overflow-y-auto
    px-5
    pb-7
    pt-6
    [scrollbar-width:thin]
    [scrollbar-color:#c98a6e_transparent]
    [&::-webkit-scrollbar]:w-[5px]
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-[#c98a6e]
    [&::-webkit-scrollbar-thumb:hover]:bg-[#a65335]

    sm:px-8
    sm:pb-9
    sm:pt-8
  "
            >
              {/* Artist Header */}
              <div className="flex items-start gap-4 pr-12">
                <div
                  className="
    flex
    h-16
    w-16
    shrink-0
    items-center
    justify-center
    rounded-full
    bg-[#a65335]
    text-xl
    font-semibold
    uppercase
    tracking-wide
    text-white
    ring-2
    ring-white
    sm:h-20
    sm:w-20
    sm:text-2xl
  "
                  aria-label={`${selectedArtist.name} initials`}
                >
                  {artistInitials}
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#984c30] sm:text-[11px]">
                    Artist studio
                  </p>

                  <h2
                    id="artist-studio-title"
                    className="mt-1 font-serif text-[24px] leading-tight text-[#201a17] sm:text-[30px]"
                  >
                    {selectedArtist.name}
                  </h2>

                  <p className="mt-1 text-[13px] text-[#765e51]">
                    {selectedArtist.location}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="mt-6 border-t border-[#ead8ca]" />

              {/* About */}
              <div className="mt-6">
                <h3 className="font-serif text-[19px] text-[#201a17] sm:text-[20px]">
                  About the studio
                </h3>

                <p className="mt-3 text-[13px] leading-[1.7] text-[#665650] sm:text-[14px]">
                  {selectedArtist.studioStory || selectedArtist.bio}
                </p>
              </div>

              {/* Practice + Commissions */}
              {(selectedArtist.yearsPracticing ||
                selectedArtist.commissionsOpen !== undefined) && (
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedArtist.yearsPracticing && (
                    <div className="rounded-[10px] border border-[#a65335] bg-white/75 p-4 shadow-[0_4px_12px_rgba(80,50,30,0.05)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.7px] text-[#984c30]">
                        Practice
                      </p>

                      <p className="mt-1.5 text-[14px] text-[#201a17]">
                        {selectedArtist.yearsPracticing}
                      </p>
                    </div>
                  )}

                  {selectedArtist.commissionsOpen !== undefined && (
                    <div className="rounded-[10px] border border-[#a65335] bg-white/75 p-4 shadow-[0_4px_12px_rgba(80,50,30,0.05)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.7px] text-[#984c30]">
                        Commissions
                      </p>

                      <p className="mt-1.5 text-[14px] text-[#201a17]">
                        {selectedArtist.commissionsOpen
                          ? "Open for commissions"
                          : "Not taking commissions"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Specialties */}
              {selectedArtist.specialties?.length > 0 && (
                <div className="mt-7">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.7px] text-[#984c30]">
                    Specialties
                  </h4>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedArtist.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="border border-[#a65335] rounded-full bg-white/80 px-3 py-1.5 text-[12px] text-[#665650] shadow-[0_2px_6px_rgba(80,50,30,0.04)]"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {selectedArtist.materials?.length > 0 && (
                <div className="mt-7">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.7px] text-[#984c30]">
                    Materials
                  </h4>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedArtist.materials.map((material) => (
                      <span
                        key={material}
                        className="border border-[#a65335] rounded-full bg-white/80 px-3 py-1.5 text-[12px] text-[#665650] shadow-[0_2px_6px_rgba(80,50,30,0.04)]"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Works */}
              {selectedArtist.featuredWorks?.length > 0 && (
                <div className="mt-7">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.7px] text-[#984c30]">
                    Selected works
                  </h4>

                  <ul className="mt-3 space-y-2">
                    {selectedArtist.featuredWorks.map((work) => (
                      <li
                        key={work}
                        className="border border-[#a65335] rounded-[8px] bg-white/75 px-4 py-3 text-[13px] text-[#665650] shadow-[0_2px_6px_rgba(80,50,30,0.04)]"
                      >
                        {work}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explore Artist Directory */}
              <div className="mt-8 pt-1">
                <MotionLink
                  to="/artists"
                  onClick={() => setSelectedArtist(null)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                  className="
              inline-flex
              min-h-[44px]
              items-center
              justify-center
              rounded-[8px]
              bg-[#a65335]
              px-5
              py-2.5
              text-[13px]
              font-semibold
              text-white
              transition-colors
              duration-300
              ease-out
              hover:bg-[#8f462c]
            "
                >
                  Explore artist directory
                </MotionLink>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      {selectedWork && (
        <ArtworkDetailModal
          key={selectedWork._id || selectedWork.id}
          work={selectedWork}
          onClose={() => setSelectedWork(null)}
          onAddToWishlist={addToWishlist}
          isWishlisted={wishlist.some(
            (item) =>
              item._id === selectedWork._id ||
              item.artworkId === selectedWork._id ||
              item.title === selectedWork.title,
          )}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isInCart={
            inCart.has(selectedWork.id) ||
            inCart.has(selectedWork._id) ||
            inCart.has(selectedWork.artworkId)
          }
        />
      )}
      {/* =========================================================
    CURATED COLLECTION
========================================================= */}
      {/* Render when items exist */}
      {curatedArtworks.length >= 8 && (
        <section className="w-full bg-[linear-gradient(180deg,#ffffff_0%,#edd7cc_50%,#ffffff_100%)] px-5 py-16 pb-20 sm:px-8 sm:py-16 sm:pb-24 lg:px-[5%] lg:py-20 lg:pb-28">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-10 flex flex-col gap-5 border-b border-[#e8ddd5] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <EyebrowLabel>CURATED COLLECTION</EyebrowLabel>
                <SectionHeading>Art worth making room for</SectionHeading>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 lg:[grid-auto-rows:150px]">
              {/* Card 1 */}
              <div className="h-[400px] sm:h-auto lg:col-span-1 lg:row-span-3">
                <CuratedArtworkCard
                  work={curatedArtworks[0]}
                  index={0}
                  onSelect={setSelectedWork}
                  onAddToWishlist={addToWishlist}
                  isWishlisted={wishlist.some(
                    (item) =>
                      item._id === curatedArtworks[0]?._id ||
                      item.artworkId === curatedArtworks[0]?._id ||
                      item.title === curatedArtworks[0]?.title,
                  )}
                />
              </div>

              {/* Card 2 */}
              <div className="h-[260px] sm:h-auto lg:col-span-1 lg:row-span-1">
                <CuratedArtworkCard
                  work={curatedArtworks[1]}
                  index={1}
                  onSelect={setSelectedWork}
                  onAddToWishlist={addToWishlist}
                  isWishlisted={wishlist.some(
                    (item) =>
                      item._id === curatedArtworks[1]?._id ||
                      item.artworkId === curatedArtworks[1]?._id ||
                      item.title === curatedArtworks[1]?.title,
                  )}
                />
              </div>

              {/* Card 3 */}
              <div className="h-[260px] sm:h-auto lg:col-span-1 lg:row-span-1">
                <CuratedArtworkCard
                  work={curatedArtworks[2]}
                  index={2}
                  onSelect={setSelectedWork}
                  onAddToWishlist={addToWishlist}
                  isWishlisted={wishlist.some(
                    (item) =>
                      item._id === curatedArtworks[2]?._id ||
                      item.artworkId === curatedArtworks[2]?._id ||
                      item.title === curatedArtworks[2]?.title,
                  )}
                />
              </div>

              {/* Card 4 */}
              <div className="h-[400px] sm:h-auto lg:col-span-1 lg:row-span-2">
                <CuratedArtworkCard
                  work={curatedArtworks[3]}
                  index={3}
                  onSelect={setSelectedWork}
                  onAddToWishlist={addToWishlist}
                  isWishlisted={wishlist.some(
                    (item) =>
                      item._id === curatedArtworks[3]?._id ||
                      item.artworkId === curatedArtworks[3]?._id ||
                      item.title === curatedArtworks[3]?.title,
                  )}
                />
              </div>

              {/* Card 5 */}
              <div className="h-[260px] sm:h-auto lg:col-span-1 lg:row-span-1">
                <CuratedArtworkCard
                  work={curatedArtworks[4]}
                  index={4}
                  onSelect={setSelectedWork}
                  onAddToWishlist={addToWishlist}
                  isWishlisted={wishlist.some(
                    (item) =>
                      item._id === curatedArtworks[4]?._id ||
                      item.artworkId === curatedArtworks[4]?._id ||
                      item.title === curatedArtworks[4]?.title,
                  )}
                />
              </div>

              {/* Card 6 */}
              <div className="h-[400px] sm:h-auto lg:col-span-1 lg:row-span-2">
                <CuratedArtworkCard
                  work={curatedArtworks[5]}
                  index={5}
                  onSelect={setSelectedWork}
                  onAddToWishlist={addToWishlist}
                  isWishlisted={wishlist.some(
                    (item) =>
                      item._id === curatedArtworks[5]?._id ||
                      item.artworkId === curatedArtworks[5]?._id ||
                      item.title === curatedArtworks[5]?.title,
                  )}
                />
              </div>

              {/* Card 7 */}
              <div className="h-[260px] sm:h-auto lg:col-span-1 lg:row-span-1">
                <CuratedArtworkCard
                  work={curatedArtworks[6]}
                  index={6}
                  onSelect={setSelectedWork}
                  onAddToWishlist={addToWishlist}
                  isWishlisted={wishlist.some(
                    (item) =>
                      item._id === curatedArtworks[6]?._id ||
                      item.artworkId === curatedArtworks[6]?._id ||
                      item.title === curatedArtworks[6]?.title,
                  )}
                />
              </div>

              {/* Card 8 */}
              <div className="h-[260px] sm:h-auto lg:col-span-1 lg:row-span-1">
                <CuratedArtworkCard
                  work={curatedArtworks[7]}
                  index={7}
                  onSelect={setSelectedWork}
                  onAddToWishlist={addToWishlist}
                  isWishlisted={wishlist.some(
                    (item) =>
                      item._id === curatedArtworks[7]?._id ||
                      item.artworkId === curatedArtworks[7]?._id ||
                      item.title === curatedArtworks[7]?.title,
                  )}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="w-full bg-white px-4 py-10 sm:px-6 sm:py-12 md:px-8 lg:px-[5%] lg:py-14">
        <div
          className="
  mx-auto
  grid
  max-w-[1600px]
  grid-cols-1
  gap-5

  sm:gap-6

  md:grid-cols-3
  md:gap-5

  lg:gap-6
"
        >
          {[
            {
              title: "Authenticity guaranteed",
              body: "Every work is verified and issued a provenance certificate before it ships.",
              icon: MdOutlineVerified,
            },
            {
              title: "White-glove shipping",
              body: "Climate-aware packing and tracked delivery, insured door to door.",
              icon: LuTruck,
            },
            {
              title: "Collector concierge",
              body: "Talk to our team about a piece, a commission, or building a collection.",
              icon: LuHeadset,
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: 0.65,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`
          group
rounded-[20px]
border
border-[#e6ded8]
bg-[#fff8f3]
px-6
py-8
shadow-[0_8px_20px_rgba(65,43,31,0.05)]
transition-all
duration-300
ease-out
hover:-translate-y-1
hover:border-[#984c30]
hover:bg-white
hover:shadow-[0_12px_26px_rgba(65,43,31,0.08)]

          sm:px-6
          sm:py-8

          md:px-7
          md:py-9
        `}
            >
              {/* Icon */}
              <span
                className="
            inline-flex
            text-[22px]
            text-[#a65335]
            transition-transform
            duration-300
            ease-out
            group-hover:scale-110
          "
              >
                <item.icon />
              </span>

              {/* Title */}
              <h3
                className="
            mt-3
            font-serif
            text-[18px]
            leading-[1.15]
            text-[#201a17]

            sm:text-[19px]
          "
              >
                {item.title}
              </h3>

              {/* Description */}
              <p
                className="
            mt-2
            max-w-[390px]
            text-[13px]
            leading-[1.6]
            text-[#665650]

            sm:text-[14px]
          "
              >
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
      {!user && (
        <section className="w-full bg-white px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14 lg:px-[5%] lg:py-16">
          <div className="mx-auto max-w-[1600px]">
            <motion.div
              initial={{ opacity: 0, y: 35, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-[10px] border border-[#e6ded8] bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.95)_0%,transparent_55%),radial-gradient(circle_at_78%_82%,rgba(255,214,170,0.6)_0%,transparent_60%),linear-gradient(145deg,#fff4eb_0%,#ffffff_100%)] px-5 py-12 text-center shadow-[0_15px_30px_rgba(65,43,31,0.08)] sm:px-8 sm:py-14 md:px-12 md:py-16 lg:px-16 lg:py-20 xl:px-20 xl:py-[88px]"
            >
              {/* Label */}
              <EyebrowLabel>Join ArtNest</EyebrowLabel>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mx-auto mt-4 max-w-[850px] font-serif text-[28px] leading-[1.08] text-[#201a17] sm:text-[34px] md:text-[38px] lg:text-[42px] xl:text-[44px]"
              >
                Start a collection, one piece at a time.
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.55,
                  delay: 0.14,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mx-auto mt-4 max-w-[520px] text-[13px] leading-[1.6] text-[#665650] sm:text-[14px] md:mt-5 md:text-[15px]"
              >
                Create a free account to save favorites, follow artists, and get
                early access to new exhibitions.
              </motion.p>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.55,
                  delay: 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-7 sm:mt-8"
              >
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                  className="inline-block"
                >
                  <Link
                    to="/buyer/register"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-[8px] bg-[#a65335] px-6 py-3 text-[14px] font-semibold text-white transition-all duration-400 ease-out hover:bg-[#8f462c] sm:px-7 sm:text-[15px]"
                  >
                    Create your account
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
