import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Tag,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import {
  ARTWORKS,
  Badge,
  PAGE,
  inr,
  inputCls,
  btnPrimary,
  btnGhost,
} from "./shared";
import { CATEGORY_LABELS } from "../../data/artworks";
import { API_BASE_URL } from "@/config/api";

const STATUSES = ["All statuses", "Published", "Draft", "Sold"];

function ArtworkDetailModal({ art, hasOffer, onClose, onEdit }) {
  if (!art) return null;

  const price = Number(art.value ?? art.price ?? 0);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-[#2B211B]/45 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{
            opacity: 0,
            y: 26,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 18,
            scale: 0.97,
          }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            relative
            z-10
            flex
            max-h-[92vh]
            w-full
            max-w-[900px]
            flex-col
            overflow-hidden
            rounded-[24px]
            border
            border-[#E8DDD5]
            bg-[linear-gradient(145deg,#ffffff_0%,#fffaf6_58%,#f8eee7_100%)]
            shadow-[0_24px_70px_rgba(43,33,27,0.22)]
            lg:flex-row
          "
        >
          {/* Close button */}
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{
              scale: 1.08,
              rotate: 3,
            }}
            whileTap={{ scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 22,
            }}
            aria-label="Close artwork details"
            className="
              absolute
              right-4
              top-4
              z-20
              grid
              h-9
              w-9
              cursor-pointer
              place-items-center
              rounded-full
              border
              border-[#E5D8CF]
              bg-white/90
              text-[#6F5B4E]
              shadow-[0_4px_12px_rgba(65,43,31,0.08)]
              transition-all
              duration-200
              hover:bg-[#9F5639]
hover:text-white
            "
          >
            <X size={17} strokeWidth={1.9} />
          </motion.button>

          {/* Image */}
          <div className="relative w-full shrink-0 overflow-hidden bg-[#F1E4D8] lg:w-[48%]">
            {art.img ? (
              <motion.img
                src={art.img}
                alt={art.title}
                initial={{ scale: 1.02 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  h-full
                  min-h-[260px]
                  w-full
                  object-cover
                  sm:min-h-[340px]
                  lg:min-h-[540px]
                "
              />
            ) : (
              <div className="flex min-h-[260px] h-full items-center justify-center bg-[linear-gradient(135deg,#e8d8c5_0%,#ccb091_100%)] sm:min-h-[340px] lg:min-h-[540px]">
                <span className="text-[13px] text-[#8F765F]">
                  No artwork preview
                </span>
              </div>
            )}

            {/* Image overlay */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                bg-[linear-gradient(to_top,rgba(45,31,23,0.22),transparent_38%)]
              "
            />

            {/* Status */}
            <span
              className="
                absolute
                bottom-4
                left-4
                rounded-full
                border
                border-white/40
                bg-white/85
                px-3
                py-1.5
                text-[11px]
                font-medium
                text-[#5F4D42]
                backdrop-blur-md
                sm:left-5
                sm:bottom-5
              "
            >
              {art.status}
            </span>
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-7 lg:p-9">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[1.5px] text-[#A28F7D]">
                Artwork details
              </p>

              <h2
                className="
                  mt-2
                  font-serif
                  text-[28px]
                  font-medium
                  tracking-[-0.4px]
                  text-[#362F26]
                  sm:text-[32px]
                "
              >
                {art.title}
              </h2>

              <p className="mt-2 text-[13px] text-[#9B887A] sm:text-[14px]">
                {CATEGORY_LABELS[art.category] || art.category}
                <span className="mx-2 text-[#D2C4BA]">·</span>
                {art.medium}
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-[14px] border border-[#E8DDD5] bg-white/75 p-4">
                <p className="text-[10.5px] uppercase tracking-[1px] text-[#A28F7D]">
                  Price
                </p>

                <p className="mt-1.5 font-serif text-[22px] text-[#362F26] sm:text-[24px]">
                  {inr(price)}
                </p>
              </div>

              <div className="rounded-[14px] border border-[#E8DDD5] bg-white/75 p-4">
                <p className="text-[10.5px] uppercase tracking-[1px] text-[#A28F7D]">
                  Offer
                </p>

                <p className="mt-1.5 text-[14px] font-medium text-[#362F26] sm:text-[15px]">
                  {hasOffer ? "Active offer" : "No active offer"}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-[#E7DDD6] pt-6">
              <p className="text-[12px] leading-relaxed text-[#8F7B6E] sm:text-[13px]">
                Keep your artwork information updated to maintain a polished
                studio collection.
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row">
              <button
                type="button"
                onClick={onEdit}
                className="
                  inline-flex
                  h-11
                  flex-1
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[linear-gradient(135deg,#B96B4A,#9F5639)]
                  px-5
                  text-[13px]
                  font-semibold
                  text-white
                  shadow-[0_8px_18px_rgba(159,86,57,0.18)]
                  transition-all
                  duration-300
                  ease-out
                  hover:-translate-y-0.5
                  hover:shadow-[0_12px_24px_rgba(159,86,57,0.24)]
                "
              >
                <Pencil size={15} strokeWidth={1.9} />
                Edit artwork
              </button>

              <button
                type="button"
                onClick={onClose}
                className="
                  h-11
                  cursor-pointer
                  rounded-full
                  border
                  border-[#DECFC5]
                  bg-white/80
                  px-5
                  text-[13px]
                  font-medium
                  text-[#6F5B4E]
                  transition-all
                  duration-300
                  hover:border-[#CBB4A5]
                  hover:bg-white
                  hover:text-[#9F5639]
                "
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatCalendarDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseCalendarDate(value) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`);
}

function ThemeCalendar({ value, min, onChange }) {
  const wrapperRef = useRef(null);
  const selectedDate = parseCalendarDate(value);
  const minDate = parseCalendarDate(min);

  const [open, setOpen] = useState(false);

  const [viewDate, setViewDate] = useState(() => {
    return selectedDate || new Date();
  });

  useEffect(() => {
    if (open && selectedDate) {
      setViewDate(selectedDate);
    }
  }, [open, value]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  const previousMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isPreviousDisabled =
    year < minDate.getFullYear() ||
    (year === minDate.getFullYear() && month <= minDate.getMonth());

  return (
    <div ref={wrapperRef} className="relative">
      {/* DATE FIELD */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex h-11 w-full cursor-pointer items-center justify-between
          rounded-xl border border-[#E8E1DB] bg-white px-3
          text-left text-[14px] text-[#362F26]
          outline-none transition-colors duration-200
          hover:border-[#D9C5B8]
          focus:border-[#9F5639]
        "
      >
        <span className={value ? "text-[#362F26]" : "text-[#A28F7D]"}>
          {selectedDate
            ? selectedDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Select date"}
        </span>

        <CalendarDays size={17} strokeWidth={1.8} className="text-[#9F5639]" />
      </button>

      {/* CALENDAR */}
      {open && (
        <div
          className="
            absolute left-0 top-[calc(100%+8px)] z-[70]
            w-[min(340px,calc(100vw-2rem))]
            overflow-hidden rounded-[20px]
            border border-[#E7DDD6]
            bg-[linear-gradient(145deg,#ffffff_0%,#fffaf6_58%,#f8eee7_100%)]
            p-4
            shadow-[0_18px_45px_rgba(65,43,31,0.16)]
          "
        >
          {/* CALENDAR HEADER */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-serif text-[17px] text-[#362F26]">
                {MONTHS[month]}
              </p>

              <p className="text-[11px] text-[#A28F7D]">{year}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={previousMonth}
                disabled={isPreviousDisabled}
                className="
                  grid h-8 w-8 place-items-center rounded-full
                  text-[#6F5B4E]
                  transition-all duration-200
                  hover:bg-[#F3E2D7] hover:text-[#9F5639]
                  disabled:cursor-not-allowed disabled:opacity-30
                "
                aria-label="Previous month"
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                onClick={nextMonth}
                className="
                  grid h-8 w-8 place-items-center rounded-full
                  text-[#6F5B4E]
                  transition-all duration-200
                  hover:bg-[#F3E2D7] hover:text-[#9F5639]
                "
                aria-label="Next month"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {/* WEEKDAYS */}
          <div className="mb-2 grid grid-cols-7">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="
                  flex h-8 items-center justify-center
                  text-[10px] font-medium uppercase
                  tracking-[0.06em] text-[#A28F7D]
                "
              >
                {day}
              </div>
            ))}
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-9" />;
              }

              const dateString = formatCalendarDate(date);

              const isSelected = value && dateString === value;

              const isToday = dateString === formatCalendarDate(new Date());

              const isDisabled = date < minDate;

              return (
                <button
                  key={dateString}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(dateString);
                    setOpen(false);
                  }}
                  className={`
                    mx-auto grid h-9 w-9 place-items-center
                    rounded-full text-[12.5px]
                    transition-all duration-150 ease-out

                    ${
                      isSelected
                        ? "bg-[#9F5639] font-semibold text-white shadow-[0_5px_12px_rgba(159,86,57,0.22)]"
                        : isToday
                          ? "border border-[#D9BBAA] bg-[#FFF5EE] font-medium text-[#9F5639]"
                          : "text-[#4E4037] hover:bg-[#F3E2D7] hover:text-[#9F5639]"
                    }

                    ${
                      isDisabled
                        ? "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-[#4E4037]"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* TODAY */}
          <div className="mt-4 border-t border-[#E8E1DB] pt-3">
            <button
              type="button"
              onClick={() => {
                const todayDate = new Date();

                setViewDate(todayDate);
                onChange(formatCalendarDate(todayDate));
                setOpen(false);
              }}
              className="
                w-full rounded-full px-3 py-2
                text-[12px] font-medium
                text-[#9F5639]
                transition-colors duration-200
                hover:bg-[#F3E2D7]
              "
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OfferModal({ art, existing, onClose, onSave, onRemove }) {
  const original = Number(art.value ?? art.price);
  const [offerPrice, setOfferPrice] = useState(
    existing?.offer_price ?? existing?.value ?? "",
  );

  const [endsAt, setEndsAt] = useState(() => {
    const date = existing?.ends_on ?? existing?.offerEnds ?? "";

    if (!date) return "";

    // Convert ISO date to YYYY-MM-DD
    return typeof date === "string"
      ? date.slice(0, 10)
      : new Date(date).toISOString().slice(0, 10);
  });

  const [note, setNote] = useState(existing?.note ?? existing?.offerNote ?? "");
  const today = new Date().toISOString().slice(0, 10);
  const valid =
    Number(offerPrice) > 0 &&
    Number(offerPrice) < original &&
    endsAt >= today &&
    endsAt &&
    note.trim();
  const pct = valid ? Math.round((1 - Number(offerPrice) / original) * 100) : 0;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!valid || submitting) return;

    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to manage offers.");
      }

      // Choose API based on whether an offer already exists
      const isUpdating = Boolean(existing);

      // Update requires Offer ID; create requires Artwork ID
      const endpoint = isUpdating
        ? `${API_BASE_URL}/artwork/update-offer/${existing._id}`
        : `${API_BASE_URL}/artwork/create-offer/${art.id}`;

      const response = await fetch(endpoint, {
        method: isUpdating ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          offer_price: Number(offerPrice),
          ends_on: endsAt,
          note: note.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to ${isUpdating ? "update" : "create"} offer.`,
        );
      }

      // Update frontend state after backend success
      onSave(result.offer, art.id);
    } catch (err) {
      console.error("Offer save error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const label = (t) => (
    <span className="mb-1 block text-[12.5px] text-[#A28F7D]">{t}</span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#2B211B]/45 backdrop-blur-[4px]"
        onClick={onClose}
      />
      <form
        onSubmit={submit}
        className="
    relative w-full max-w-[460px]
    max-h-[calc(100vh-32px)]
    overflow-y-auto
    space-y-4
    rounded-2xl
    bg-white
    p-6
    shadow-xl
  "
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[18px] text-[#362F26]">
              {existing ? "Edit offer" : "Create offer"}
            </h3>

            <p className="text-[13px] text-[#A28F7D]">
              {art.title} · Original ₹{original.toLocaleString("en-IN")}
            </p>
          </div>
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{
              scale: 1.06,
            }}
            whileTap={{
              scale: 0.94,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            aria-label="Close artwork details"
            className="
    group
    absolute
    right-4
    top-4
    z-20
    grid
    h-9
    w-9
    cursor-pointer
    place-items-center
    rounded-full
    border
    border-[#E5D8CF]
    bg-white/90
    text-[#6F5B4E]
    shadow-[0_4px_12px_rgba(65,43,31,0.08)]
    transition-colors
    duration-200
    ease-out
    hover:bg-[#9F5639]
    hover:text-white
    hover:border-[#9F5639]
  "
          >
            <X
              size={17}
              strokeWidth={1.9}
              className="
      transition-transform
      duration-200
      ease-out
      group-hover:rotate-90
    "
            />
          </motion.button>
        </div>
        <label className="block">
          {label("Offer price (₹)")}
          <input
            type="number"
            min="1"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            className={inputCls}
          />
          {valid && (
            <span className="mt-1 block text-[12px] text-[#4C6B3F]">
              {pct}% off
            </span>
          )}
          {offerPrice && Number(offerPrice) >= original && (
            <span className="mt-1 block text-[12px] text-[#9B3B2E]">
              Offer price must be lower than the original price.
            </span>
          )}
        </label>
        <label className="block">
          {label("Offer valid until")}

          <ThemeCalendar value={endsAt} min={today} onChange={setEndsAt} />
        </label>
        <label className="block">
          {label("Offer note")}
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={40}
            className={inputCls}
            placeholder="e.g. Festive sale"
          />
        </label>
        <div className="flex flex-wrap gap-3 border-t border-[#E8E1DB] pt-4">
          <button
            type="submit"
            disabled={!valid || submitting}
            className="
  cursor-pointer
  rounded-full
  bg-[linear-gradient(135deg,#B96B4A,#9F5639)]
  px-5
  py-2.5
  text-[14px]
  font-semibold
  text-white
  shadow-[0_8px_18px_rgba(159,86,57,0.16)]
  transition-all
  duration-200
  ease-out
  enabled:hover:scale-[1.04]
  enabled:hover:-translate-y-0.5
  enabled:hover:shadow-[0_12px_24px_rgba(159,86,57,0.23)]
  enabled:active:scale-[0.96]
  disabled:cursor-not-allowed
  disabled:opacity-50
"
          >
            {submitting
              ? existing
                ? "Updating..."
                : "Creating..."
              : existing
                ? "Update offer"
                : "Post offer"}
          </button>
          {existing && (
            <button
              type="button"
              onClick={() => onRemove(existing._id, art.id)}
              className="
    cursor-pointer
    rounded-full
    border
    border-[#E5D2CC]
    bg-white/80
    px-5
    py-2.5
    text-[14px]
    font-medium
    text-[#9B3B2E]
    transition-all
    duration-200
    ease-out
    hover:scale-[1.04]
    hover:-translate-y-0.5
    hover:border-[#DDBDB4]
    hover:bg-[#FFF5F2]
    active:scale-[0.96]
  "
            >
              Remove offer
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="
    cursor-pointer
    rounded-full
    border
    border-[#DED0C7]
    bg-white/80
    px-5
    py-2.5
    text-[14px]
    font-medium
    text-[#6F5B4E]
    transition-all
    duration-200
    ease-out
    hover:scale-[1.04]
    hover:-translate-y-0.5
    hover:border-[#CBB4A5]
    hover:bg-white
    hover:text-[#362F26]
    active:scale-[0.96]
  "
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

function DeleteConfirmModal({ art, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {art && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#2B211B]/45 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 12,
              scale: 0.96,
            }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              z-10
              w-full
              max-w-[420px]
              overflow-hidden
              rounded-[22px]
              border
              border-[#E7DDD6]
              bg-[linear-gradient(145deg,#ffffff_0%,#fffaf6_58%,#f8eee7_100%)]
              p-6
              shadow-[0_24px_65px_rgba(43,33,27,0.20)]
              sm:p-7
            "
          >
            {/* Decorative top glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-10
                -top-10
                h-28
                w-28
                rounded-full
                bg-[#E7C9B8]/20
                blur-3xl
              "
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div
                className="
                  grid
                  h-11
                  w-11
                  place-items-center
                  rounded-[14px]
                  border
                  border-[#E9D6CF]
                  bg-[linear-gradient(135deg,#FFF2EE_0%,#F6DFDA_100%)]
                  text-[#9B3B2E]
                "
              >
                <Trash2 size={18} strokeWidth={1.9} />
              </div>

              <h3
                className="
    mt-5
    font-serif
    text-[24px]
    font-medium
    leading-tight
    tracking-[-0.3px]
    text-[#362F26]
    sm:text-[26px]
  "
              >
                Delete artwork?
              </h3>

              <p
                className="
    mt-2.5
    text-[13.5px]
    font-medium
    leading-relaxed
    text-[#5F4A3E]
    sm:text-[14px]
  "
              >
                Are you sure you want to delete this artwork?
              </p>

              <p className="mt-1 text-[11.5px] leading-relaxed text-[#A28F7D]">
                This action cannot be undone.
              </p>

              <p
                className="
    mt-2
    truncate
    font-serif
    text-[15px]
    font-medium
    leading-snug
    text-[#5A463A]
    sm:text-[16px]
  "
              >
                “{art.title}”
              </p>

              {/* Actions */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="
    h-11
    cursor-pointer
    rounded-full
    border
    border-[#DED0C7]
    bg-white/80
    px-5
    text-[13px]
    font-medium
    text-[#6F5B4E]
    transition-transform
    duration-200
    ease-out
    hover:scale-[1.04]
    hover:-translate-y-0.5
    active:scale-[0.96]
  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  className="
    inline-flex
    h-11
    cursor-pointer
    items-center
    justify-center
    gap-2
    rounded-full
    bg-[linear-gradient(135deg,#B34E3A,#963426)]
    px-5
    text-[13px]
    font-semibold
    text-white
    shadow-[0_8px_18px_rgba(150,52,38,0.16)]
    transition-all
    duration-200
    ease-out
    hover:scale-[1.04]
    hover:-translate-y-0.5
    hover:shadow-[0_12px_24px_rgba(150,52,38,0.23)]
    active:scale-[0.96]
  "
                >
                  <Trash2 size={15} strokeWidth={1.9} />
                  Delete artwork
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function MyArtworks() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(STATUSES[0]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [offerFor, setOfferFor] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [deleteFor, setDeleteFor] = useState(null);

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/artwork/get-artwork`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch artworks");
        }

        const formattedArtworks = result.getAllArtwork.map((artwork) => ({
          id: artwork._id,
          artworkId: artwork.artworkId,
          title: artwork.title || "",
          category: artwork.category || "",
          description: artwork.description || "",
          medium: artwork.medium || "",
          dims: artwork.dimensions || "",
          location: artwork.location || "",
          tag: artwork.tag || "",
          price: Number(artwork.price) || 0,
          value: Number(artwork.price) || 0,
          status: artwork.status?.toLowerCase() || "draft",
          img: artwork.image?.[0]?.url || "",
          images: artwork.image?.map((image) => image.url) || [],
          moderation_status: artwork.moderation_status,
          stock_label: artwork.stock_label,
          createdAt: artwork.createdAt,

          // Backend offer data
          offer: artwork.offer || null,
        }));

        setArtworks(formattedArtworks);
      } catch (err) {
        console.error("Fetch artworks error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const saveOffer = (updatedOffer, artworkId) => {
    setArtworks((prev) =>
      prev.map((artwork) =>
        artwork.id === artworkId
          ? {
              ...artwork,
              offer: updatedOffer,
            }
          : artwork,
      ),
    );

    setOfferFor(null);
  };
  const removeOffer = async (offerId, artworkId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to remove an offer.");
      }

      const response = await fetch(
        `${API_BASE_URL}/artwork/delete-offer/${offerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to remove offer.");
      }

      // Remove offer from the selected artwork in frontend state
      setArtworks((prev) =>
        prev.map((artwork) =>
          artwork.id === artworkId ? { ...artwork, offer: null } : artwork,
        ),
      );

      // Close modal
      setOfferFor(null);
    } catch (error) {
      console.error("Remove offer error:", error);
      alert(error.message || "Something went wrong.");
    }
  };

  const shown = useMemo(
    () =>
      artworks.filter(
        (a) =>
          (status === STATUSES[0] ||
            a.status?.toLowerCase() === status.toLowerCase()) &&
          a.title?.toLowerCase().includes(q.toLowerCase()),
      ),
    [artworks, q, status],
  );

  const remove = async (artwork) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to delete artwork.");
      }

      const response = await fetch(
        `${API_BASE_URL}/artwork/artwork-delete/${artwork.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete artwork.");
      }

      // Remove artwork from frontend state after backend success
      setArtworks((prev) => prev.filter((item) => item.id !== artwork.id));

      // Close delete confirmation modal
      setDeleteFor(null);

      // Close detail modal if the deleted artwork is selected
      setSelectedArtwork((prev) => (prev?.id === artwork.id ? null : prev));
    } catch (error) {
      console.error("Delete artwork error:", error);
      alert(error.message || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-[#A28F7D]">
        Loading artworks...
      </div>
    );
  }

  if (error) {
    return <div className="py-10 text-center text-red-600">{error}</div>;
  }

  return (
    <div
      className="
      min-h-screen
      bg-[linear-gradient(180deg,#ffffff_0%,#f7ece6_50%,#ffffff_100%)]
    "
    >
      <div className={PAGE}>
        {offerFor && (
          <OfferModal
            art={offerFor}
            existing={offerFor.offer}
            onClose={() => setOfferFor(null)}
            onSave={saveOffer}
            onRemove={removeOffer}
          />
        )}

        {selectedArtwork && (
          <ArtworkDetailModal
            art={selectedArtwork}
            hasOffer={Boolean(selectedArtwork.offer)}
            onClose={() => setSelectedArtwork(null)}
            onEdit={() => {
              const id = selectedArtwork.id;
              setSelectedArtwork(null);
              window.location.href = `/artist/artworks/${id}/edit`;
            }}
          />
        )}

        {deleteFor && (
          <DeleteConfirmModal
            art={deleteFor}
            onClose={() => setDeleteFor(null)}
            onConfirm={() => remove(deleteFor)}
          />
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              strokeWidth={1.9}
              className="
        pointer-events-none
        absolute left-4 top-1/2
        -translate-y-1/2
        text-[#A28F7D]
        transition-colors duration-200
      "
            />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your artworks…"
              className="
        h-11 w-full
        rounded-full
        border border-[#E5DAD2]
        bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFDFC_100%)]
        pl-11 pr-4
        text-[13.5px]
        text-[#362F26]
        shadow-[0_3px_10px_rgba(65,43,31,0.035)]
        outline-none
        placeholder:text-[#A28F7D]
        transition-all duration-200 ease-out
        hover:border-[#D8C5B9]
        hover:shadow-[0_5px_14px_rgba(65,43,31,0.05)]
        focus:border-[#B96B4A]
        focus:bg-white
        focus:shadow-[0_0_0_3px_rgba(159,86,57,0.08),0_5px_14px_rgba(65,43,31,0.05)]
      "
            />
          </div>

          {/* Status filter */}
          <div className="relative w-full sm:w-[175px]">
            {/* Selected status */}
            <button
              type="button"
              onClick={() => setStatusOpen((prev) => !prev)}
              className={`
      flex h-11 w-full
      cursor-pointer
      items-center justify-between
      rounded-full
      border
      bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFDFC_100%)]
      px-4
      text-left
      text-[13.5px]
      font-medium
      text-[#4E4037]
      shadow-[0_3px_10px_rgba(65,43,31,0.035)]
      outline-none
      transition-all duration-200 ease-out
      ${
        statusOpen
          ? "border-[#B96B4A] shadow-[0_0_0_3px_rgba(159,86,57,0.08),0_5px_14px_rgba(65,43,31,0.05)]"
          : "border-[#E5DAD2] hover:border-[#D8C5B9] hover:shadow-[0_5px_14px_rgba(65,43,31,0.05)]"
      }
    `}
            >
              <span>{status}</span>

              <ChevronDown
                size={16}
                strokeWidth={1.9}
                className={`
        text-[#9F5639]
        transition-transform duration-200 ease-out
        ${statusOpen ? "rotate-180" : ""}
      `}
              />
            </button>

            {/* Dropdown */}
            {statusOpen && (
              <div
                className="
        absolute left-0 top-[calc(100%+8px)] z-30
        w-full
        overflow-hidden
        rounded-[16px]
        border border-[#E7DDD6]
        bg-[linear-gradient(145deg,#FFFFFF_0%,#FFF9F5_100%)]
        p-1.5
        shadow-[0_14px_35px_rgba(65,43,31,0.14)]
      "
              >
                {STATUSES.map((s) => {
                  const isSelected = status === s;

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStatus(s);
                        setStatusOpen(false);
                      }}
                      className={`
              flex w-full
              cursor-pointer
              items-center
              rounded-[11px]
              px-3
              py-2.5
              text-left
              text-[13px]
              transition-all duration-150 ease-out
              ${
                isSelected
                  ? "bg-[#F3E2D7] font-medium text-[#9F5639]"
                  : "text-[#5F4D42] hover:bg-[#FAF1EB] hover:text-[#9F5639]"
              }
            `}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* New artwork */}
          <Link
            to="/artist/artworks/new"
            className="
      group
      inline-flex h-11
      w-full shrink-0
      items-center justify-center
      gap-2
      rounded-full
      bg-[linear-gradient(135deg,#B96B4A_0%,#9F5639_100%)]
      px-5
      text-[13.5px]
      font-semibold
      text-white
      shadow-[0_7px_18px_rgba(159,86,57,0.16)]
      transition-all duration-300 ease-out
      hover:-translate-y-0.5
      hover:shadow-[0_11px_24px_rgba(159,86,57,0.23)]
      active:translate-y-0
      active:scale-[0.97]
      sm:w-auto
    "
          >
            <Plus
              size={16}
              strokeWidth={2}
              className="
        transition-transform duration-300 ease-out
        group-hover:rotate-90
      "
            />
            New artwork
          </Link>
        </div>

        <div className="!mt-12 !mb-10 grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-7 xl:grid-cols-3 xl:gap-8">
          {shown.map((a, index) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.55,
                delay: index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => setSelectedArtwork(a)}
              whileHover={{
                y: -8,
                boxShadow: "0 18px 34px rgba(65,43,31,0.12)",
                transition: {
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              className="
    group
    relative
    flex
    h-full
    cursor-pointer
    flex-col
    overflow-hidden
    rounded-[20px]
    border
    border-[#E7DDD6]
    bg-white
    shadow-[0_5px_16px_rgba(65,43,31,0.045)]
  "
            >
              {/* Artwork image */}
              <div className="relative overflow-hidden">
                {a.img ? (
                  <img
                    src={a.img}
                    alt={a.title}
                    className="
              aspect-[4/3]
              w-full
              object-cover
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.045]
            "
                  />
                ) : (
                  <div
                    className="
              aspect-[4/3]
              w-full
              bg-[linear-gradient(135deg,#e6d6c2_0%,#c9a888_100%)]
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.025]
            "
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      className="
                truncate
                font-serif
                text-[17px]
                font-medium
                leading-snug
                tracking-[-0.15px]
                text-[#362F26]
                transition-colors
                duration-200
                group-hover:text-[#9F5639]
                sm:text-[18px]
              "
                    >
                      {a.title}
                    </h3>

                    <p
                      className="
                mt-1
                truncate
                text-[12px]
                font-medium
                text-[#A28F7D]
                sm:text-[13px]
              "
                    >
                      {CATEGORY_LABELS[a.category] || a.category}
                      <span className="mx-1.5 text-[#D7C9BF]">·</span>
                      {a.medium}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Badge status={a.status} />
                  </div>
                </div>

                {/* Price + actions */}
                <div
                  className="
            mt-4
            flex
            items-center
            justify-between
            gap-3
            border-t
            border-[#E8E1DB]
            pt-4
          "
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="text-[14px] font-medium text-[#362F26] sm:text-[15px]">
                      {inr(a.value ?? a.price)}
                    </span>

                    {a.offer && (
                      <span
                        className="
      rounded-full
      bg-[#F6E7D0]
      px-2
      py-0.5
      text-[10.5px]
      font-medium
      text-[#8A5A22]
      sm:text-[11px]
    "
                      >
                        On offer
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 items-center gap-1">
                    <motion.button
                      type="button"
                      title="Offer"
                      onClick={() => setOfferFor(a)}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 20,
                      }}
                      className="
                  grid
                  h-8
                  w-8
                  cursor-pointer
                  place-items-center
                  rounded-full
                  text-[#A28F7D]
                  transition-colors
                  duration-200
                  hover:bg-[#F3ECE5]
                  hover:text-[#9F5639]
                "
                    >
                      <Tag size={16} strokeWidth={1.9} />
                    </motion.button>

                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 20,
                      }}
                    >
                      <Link
                        to={`/artist/artworks/${a.id}/edit`}
                        title="Edit"
                        onClick={(e) => e.stopPropagation()}
                        className="
                  grid
                  h-8
                  w-8
                  cursor-pointer
                  place-items-center
                  rounded-full
                  text-[#A28F7D]
                  transition-colors
                  duration-200
                  hover:bg-[#F3ECE5]
                  hover:text-[#362F26]
                "
                      >
                        <Pencil size={16} strokeWidth={1.9} />
                      </Link>
                    </motion.div>

                    <motion.button
                      type="button"
                      title="Delete"
                      onClick={() => setDeleteFor(a)}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 20,
                      }}
                      className="
                grid
                h-8
                w-8
                cursor-pointer
                place-items-center
                rounded-full
                text-[#A28F7D]
                transition-colors
                duration-200
                hover:bg-[#F6DFDA]
                hover:text-[#9B3B2E]
              "
                    >
                      <Trash2 size={16} strokeWidth={1.9} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {!shown.length && (
          <p className="py-10 text-center text-[14px] text-[#A28F7D]">
            No artworks found.
          </p>
        )}
      </div>
    </div>
  );
}
