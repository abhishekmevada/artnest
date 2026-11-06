import { useEffect, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { MessageCircle, Pencil, Reply, Star } from "lucide-react";
import { Card, PAGE, btnGhost, btnPrimary } from "./shared";
import { API_BASE_URL } from "@/config/api";

function ThreeDStar({ filled = true, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Main star */}
      <path
        d="M50 4L61.5 36.5L96 38L69 59.5L78 94L50 74L22 94L31 59.5L4 38L38.5 36.5L50 4Z"
        fill={filled ? "url(#goldGradient)" : "#EEE7E0"}
        stroke={filled ? "#A96F1E" : "#D8CDC2"}
        strokeWidth="2"
      />

      {filled && (
        <>
          {/* Left light facet */}
          <path d="M50 4L38.5 36.5L50 49L50 4Z" fill="#FFE58A" />

          {/* Right bright facet */}
          <path d="M50 4L61.5 36.5L50 49L50 4Z" fill="#E8A92E" />

          {/* Lower-left facet */}
          <path d="M50 49L31 59.5L22 94L50 74V49Z" fill="#D58D20" />

          {/* Lower-right facet */}
          <path d="M50 49L69 59.5L78 94L50 74V49Z" fill="#B96F18" />

          {/* Center highlight */}
          <path d="M50 49L38.5 36.5L31 59.5L50 49Z" fill="#FFF0A8" />

          <defs>
            <linearGradient
              id="goldGradient"
              x1="20"
              y1="15"
              x2="80"
              y2="85"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#FFE08A" />
              <stop offset="0.45" stopColor="#D99A28" />
              <stop offset="1" stopColor="#A96512" />
            </linearGradient>
          </defs>
        </>
      )}
    </svg>
  );
}

function Stars({ n }) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <ThreeDStar key={i} filled={i < n} size={22} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openId, setOpenId] = useState(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in first.");
        }

        const response = await fetch(
          `${API_BASE_URL}/reviews/get-all-review`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch reviews.");
        }

        const formattedReviews = (result.reviews || []).map((review) => ({
          id: review._id,
          buyer: review.buyer_id?.name || "Unknown Buyer",
          artwork: review.artwork_id?.title || "Unknown Artwork",
          rating: Number(review.rating) || 0,
          date: review.createdAt
            ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",
          comment: review.comment || "",
          reply: review.reply?.text || "",
        }));

        setReviews(formattedReviews);
      } catch (error) {
        console.error("Fetch reviews error:", error);
        setError(error.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const avg =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";
  const startReply = (r) => {
    setOpenId(r.id);
    setText(r.reply || "");
  };

  const saveReply = (id) => {
    const reply = text.trim();

    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, reply } : r)));

    try {
      const stored = loadNew().map((r) => (r.id === id ? { ...r, reply } : r));

      localStorage.setItem(REVIEWS_KEY, JSON.stringify(stored));
    } catch {
      // Ignore localStorage errors
    }

    setOpenId(null);
    setText("");
  };

  return (
    <MotionConfig
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className={PAGE}>
        {loading && (
          <p className="py-10 text-center text-[#806D60]">Loading reviews...</p>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <p className="py-10 text-center text-[#806D60]">
            No reviews available yet.
          </p>
        )}
        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[22px] border border-[#E7DDD6] bg-[linear-gradient(145deg,#ffffff_0%,#fffaf6_58%,#f8eee7_100%)] shadow-[0_8px_28px_rgba(65,43,31,0.06)]"
        >
          <div className="relative p-6 sm:p-7">
            {/* Decorative background */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#F3E4D8]/60 blur-2xl" />

            <div className="relative flex items-center gap-5">
              {/* Rating number */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 }}
                className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-[20px] border border-[#E7D6C9] bg-white/80 shadow-[0_5px_18px_rgba(65,43,31,0.06)]"
              >
                <p className="text-[34px] font-medium leading-none tracking-[-0.04em] text-[#362F26]">
                  {avg}
                </p>
              </motion.div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Stars n={Math.round(avg)} size={17} />
                  <span className="text-[13px] font-medium text-[#725F52]">
                    {avg} / 5
                  </span>
                </div>

                <p className="mt-2 text-[13px] text-[#A28F7D]">
                  Based on {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reviews */}
        {reviews.map((r, index) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.08 + index * 0.07,
              duration: 0.4,
            }}
            whileHover={{
              y: -3,
              boxShadow: "0 14px 32px rgba(65,43,31,0.09)",
            }}
            className="group rounded-[22px] border border-[#E8E1DB] bg-white p-5 shadow-[0_4px_18px_rgba(65,43,31,0.035)] transition-shadow duration-300 sm:p-6"
          >
            {/* Review Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {/* Buyer Avatar */}
                <div
                  className="
    grid h-10 w-10 shrink-0 place-items-center
    rounded-full
    border border-[#E6D4C8]
    bg-[linear-gradient(135deg,#F7EADF_0%,#EBD4C5_100%)]
    text-[11px] font-semibold
    text-[#3E3028]
    shadow-[0_3px_8px_rgba(65,43,31,0.08)]
  "
                >
                  {(r.buyer || "Buyer")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-medium text-[#362F26]">
                    {r.buyer}
                  </h3>

                  <p className="mt-0.5 truncate text-[12.5px] text-[#A28F7D]">
                    on {r.artwork} · {r.date}
                  </p>
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-1.5 sm:text-right">
                <div className="flex items-center gap-2 sm:justify-end">
                  <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A28F7D]">
                    Artwork
                  </span>

                  <Stars n={r.rating} />
                </div>

                {r.artistRating && (
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A28F7D]">
                      You
                    </span>

                    <Stars n={r.artistRating} />
                  </div>
                )}
              </div>
            </div>

            {/* Review Comment */}
            <div className="mt-5 rounded-[16px] border border-[#EEE7E1] bg-[linear-gradient(135deg,#FCFBF9_0%,#F9F6F2_100%)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#9F5639]">
                <MessageCircle size={14} strokeWidth={1.8} />
                <span className="text-[11px] font-medium uppercase tracking-[0.07em]">
                  Customer review
                </span>
              </div>

              <p className="text-[14px] leading-6 text-[#4A4037]">
                {r.comment}
              </p>
            </div>

            {/* Reply / Edit Section */}
            {openId === r.id ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 overflow-hidden border-t border-[#E8E1DB] pt-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Reply
                    size={15}
                    strokeWidth={1.8}
                    className="text-[#9F5639]"
                  />

                  <p className="text-[13px] font-medium text-[#362F26]">
                    {r.reply ? "Edit your reply" : "Reply to this review"}
                  </p>
                </div>

                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a thoughtful reply…"
                  className="w-full resize-none rounded-[15px] border border-[#E5DCD4] bg-[#FFFEFC] px-4 py-3 text-[14px] leading-6 text-[#362F26] outline-none transition-all duration-200 placeholder:text-[#B2A397] focus:border-[#9F5639] focus:ring-4 focus:ring-[#9F5639]/10"
                />

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <motion.button
                    type="button"
                    disabled={!text.trim()}
                    onClick={() => saveReply(r.id)}
                    whileHover={!text.trim() ? {} : { y: -1, scale: 1.02 }}
                    whileTap={!text.trim() ? {} : { scale: 0.97 }}
                    className={`${btnPrimary} disabled:cursor-not-allowed`}
                  >
                    Post reply
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => {
                      setOpenId(null);
                      setText("");
                    }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className={btnGhost}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="mt-5 border-t border-[#E8E1DB] pt-5">
                {/* Existing Reply */}
                {r.reply && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-[16px] border border-[#E8E0D8] bg-[linear-gradient(135deg,#FBF8F4_0%,#F5EEE7_100%)] p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Reply
                        size={14}
                        strokeWidth={1.8}
                        className="text-[#9F5639]"
                      />

                      <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-[#9F5639]">
                        Your reply
                      </p>
                    </div>

                    <p className="mt-2 text-[14px] leading-6 text-[#4A4037]">
                      {r.reply}
                    </p>
                  </motion.div>
                )}

                {/* Reply Button */}
                <motion.button
                  type="button"
                  onClick={() => startReply(r)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group/reply inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#9F5639] transition-colors duration-200 hover:text-[#7F432C]"
                >
                  {r.reply ? (
                    <Pencil size={14} strokeWidth={1.8} />
                  ) : (
                    <Reply size={14} strokeWidth={1.8} />
                  )}

                  <span>{r.reply ? "Edit reply" : "Reply"}</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </MotionConfig>
  );
}
