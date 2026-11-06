import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Upload, ImagePlus, X, CheckCircle2, FileImage } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  ARTWORKS as DEMO,
  Card,
  PAGE,
  btnGhost,
  btnPrimary,
  inputCls,
} from "./shared";
import { API_BASE_URL } from "@/config/api";

const CATEGORIES = [
  ["paintings", "Paintings"],
  ["sculptures", "Sculptures"],
  ["ceramics", "Ceramics & Pottery"],
  ["photography", "Photography"],
  ["digital", "Digital & New Media"],
  ["textile", "Textile & Fiber Art"],
  ["printmaking", "Printmaking & Monotype"],
];

const EMPTY = {
  title: "",
  category: "paintings",
  medium: "",
  dims: "",
  dimsUnit: "cm",
  price: "",
  description: "",
  status: "Published",
  location: "",
  tag: "",
  images: [],
};

export default function ArtworkForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [isLoadingArtwork, setIsLoadingArtwork] = useState(isEditMode);

  const [saveError, setSaveError] = useState("");
  const [imageError, setImageError] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);

  // Fetch artwork details when editing
  useEffect(() => {
    if (!isEditMode) return;

    const fetchArtwork = async () => {
      try {
        setIsLoadingArtwork(true);
        setSaveError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login to edit artwork.");
        }

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
          throw new Error(result.message || "Failed to fetch artwork.");
        }

        // Find artwork using MongoDB _id
        const artworks = result.getAllArtwork;

        if (!Array.isArray(artworks)) {
          throw new Error("Invalid artwork response from server.");
        }

        const artwork = artworks.find((item) => item._id === id);

        if (!artwork) {
          throw new Error("Artwork not found.");
        }

        // Convert backend images into frontend preview format
        const existingImages = (artwork.image || []).map((image) => ({
          preview: image.url,
          isExisting: true,
        }));

        // Populate form
        setForm({
          ...EMPTY,
          title: artwork.title || "",
          category: artwork.category || "paintings",
          medium: artwork.medium || "",
          dims: artwork.dimensions || "",
          dimsUnit: "cm",
          price: artwork.price ?? "",
          description: artwork.description || "",
          status: artwork.status
            ? artwork.status.charAt(0).toUpperCase() + artwork.status.slice(1)
            : "Draft",
          location: artwork.location || "",
          tag: artwork.tag || "",
          images: existingImages,
        });
      } catch (error) {
        console.error("Fetch artwork error:", error);
        setSaveError(error.message);
      } finally {
        setIsLoadingArtwork(false);
      }
    };

    fetchArtwork();
  }, [id, isEditMode]);

  const pageRef = useRef(null);
  const pageEntered = useInView(pageRef, {
    once: true,
    amount: 0.08,
  });

  const set = (key) => (e) =>
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));

  const valid =
    form.title.trim() &&
    Number(form.price) > 0 &&
    form.images.length >= 1 &&
    form.location.trim() &&
    form.medium.trim() &&
    form.dims.trim() &&
    form.tag.trim();

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setImageError("");

    // Count only newly selected files
    const newImageCount = form.images.filter((image) => image.file).length;

    const remainingSlots = 3 - form.images.length;

    if (remainingSlots <= 0) {
      setImageError("You can upload a maximum of 3 new images.");
      e.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);

    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );

    if (validFiles.length !== selectedFiles.length) {
      setImageError("Only JPG, PNG and WEBP images are allowed.");
    }

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setForm((current) => ({
      ...current,
      images: [...current.images, ...newImages],
    }));

    e.target.value = "";
  };

  const removeImage = (index) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, i) => i !== index),
    }));

    setImageError("");
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!valid || submitting) return;

    try {
      setSubmitting(true);
      setSaveError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to save artwork.");
      }

      // Create multipart form data
      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("category", form.category);
      formData.append("price", Number(form.price));
      formData.append("medium", form.medium.trim());
      formData.append("size", form.dims.trim());
      formData.append("location", form.location.trim());
      formData.append("tag", form.tag.trim());
      formData.append("description", form.description.trim());
      formData.append("status", form.status.toLowerCase());

      // Append only newly selected images
      form.images.forEach((image) => {
        if (image.file) {
          formData.append("image", image.file);
        }
      });

      // Select API based on create or edit mode
      const endpoint = isEditMode
        ? `${API_BASE_URL}/artwork/artwork-update/${id}`
        : `${API_BASE_URL}/artwork/create-artwork`;

      const response = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to ${isEditMode ? "update" : "create"} artwork.`,
        );
      }

      console.log(isEditMode ? "Artwork updated:" : "Artwork created:", result);

      // Navigate after successful API response
      navigate("/artist/artworks");
    } catch (error) {
      console.error("Artwork save error:", error);
      setSaveError(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const label = (text) => (
    <span className="mb-1.5 block text-[12px] font-medium text-[#8F7B6E]">
      {text}
    </span>
  );

  if (isLoadingArtwork) {
    return (
      <div className="py-10 text-center text-[#A28F7D]">
        Loading artwork details...
      </div>
    );
  }

  return (
    <motion.form
      ref={pageRef}
      onSubmit={submit}
      className={PAGE}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — IMAGE UPLOAD */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: "easeOut",
          }}
        >
          <Card title={isEditMode ? "Edit details" : "Artwork details"}>
            <div className="space-y-4">
              {/* Upload area */}
              <label
                className={`
                group
                relative
                flex
                min-h-[230px]
                cursor-pointer
                flex-col
                items-center
                justify-center
                overflow-hidden
                rounded-[18px]
                border
                border-dashed
                bg-[linear-gradient(145deg,#FFFCF9_0%,#F8EEE7_100%)]
                px-5
                text-center
                transition-all
                duration-300
                ease-out
                ${
                  form.images.filter((image) => image.file).length >= 3
                    ? "cursor-not-allowed border-[#E8DDD5] opacity-70"
                    : "border-[#DCCDC2] hover:-translate-y-0.5 hover:border-[#B96B4A] hover:bg-[#FFF9F5] hover:shadow-[0_8px_22px_rgba(65,43,31,0.07)]"
                }
              `}
              >
                <div
                  className="
                  grid h-12 w-12 place-items-center
                  rounded-[15px]
                  border border-[#E7D7CC]
                  bg-white
                  text-[#9F5639]
                  shadow-[0_5px_14px_rgba(65,43,31,0.06)]
                  transition-transform duration-300
                  group-hover:scale-105
                "
                >
                  <ImagePlus size={21} strokeWidth={1.8} />
                </div>

                <p className="mt-4 text-[13.5px] font-medium text-[#4E4037]">
                  {form.images.filter((image) => image.file).length >= 3
                    ? "Maximum images added"
                    : "Click to upload images"}
                </p>

                <p className="mt-1 text-[11.5px] leading-relaxed text-[#A28F7D]">
                  JPG, PNG or WEBP
                  <br />
                  Upload up to 3 images
                </p>

                <div className="mt-4 rounded-full border border-[#E7D8CE] bg-white/80 px-3 py-1">
                  <span className="text-[10.5px] font-medium text-[#8F7B6E]">
                    {form.images.length}/3 images
                  </span>
                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={onFiles}
                  disabled={
                    form.images.filter((image) => image.file).length >= 3
                  }
                  className="hidden"
                />
              </label>

              {/* Uploaded images */}
              {form.images.length > 0 && (
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#A28F7D]">
                      Uploaded images
                    </p>

                    <span className="text-[11px] text-[#B09C8D]">
                      {form.images.length} of 3
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {form.images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="
                        group
                        relative
                        aspect-square
                        overflow-hidden
                        rounded-[13px]
                        border border-[#E5D9D1]
                        bg-[#F5EEE9]
                        shadow-[0_3px_10px_rgba(65,43,31,0.05)]
                      "
                      >
                        <img
                          src={image.preview}
                          alt={`Artwork preview ${index + 1}`}
                          className="
                          h-full w-full object-cover
                          transition-transform duration-500
                          group-hover:scale-105
                        "
                        />

                        {/* Image number */}
                        <span
                          className="
                          absolute left-2 top-2
                          grid h-6 w-6 place-items-center
                          rounded-full
                          border border-white/50
                          bg-[#362F26]/65
                          text-[10px]
                          font-semibold
                          text-white
                          backdrop-blur-sm
                        "
                        >
                          {index + 1}
                        </span>

                        {/* Remove */}
                        {image.file && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            aria-label={`Remove image ${index + 1}`}
                            className="
                          absolute right-2 top-2
                          grid h-6 w-6 place-items-center
                          cursor-pointer
                          rounded-full
                          border border-white/50
                          bg-white/90
                          text-[#6F5B4E]
                          opacity-0
                          shadow-[0_3px_8px_rgba(65,43,31,0.12)]
                          transition-all duration-200
                          group-hover:opacity-100
                          hover:bg-[#9F5639]
                          hover:text-white
                        "
                          >
                            <X size={13} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imageError && (
                <p className="rounded-xl border border-[#EBCFC9] bg-[#FFF5F2] px-3 py-2.5 text-[11.5px] leading-relaxed text-[#9B3B2E]">
                  {imageError}
                </p>
              )}

              {/* Image requirement */}
              <div
                className="
                flex items-start gap-2.5
                rounded-[13px]
                border border-[#E7DDD6]
                bg-[#FCF8F4]
                px-3.5 py-3
              "
              >
                <FileImage
                  size={15}
                  className="mt-0.5 shrink-0 text-[#9F5639]"
                />

                <p className="text-[11.5px] leading-relaxed text-[#8F7B6E]">
                  Add at least one image. You can upload up to three images to
                  showcase the artwork from different views.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* RIGHT — DETAILS */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.16,
            ease: "easeOut",
          }}
        >
          <Card title={isEditMode ? "Edit details" : "Artwork details"}>
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Title */}
              <label className="block sm:col-span-2">
                {label("Title")}

                <input
                  value={form.title}
                  onChange={set("title")}
                  className={inputCls}
                  placeholder="e.g. Golden Silence"
                />
              </label>

              {/* Category */}
              <label className="block">
                {label("Category")}

                <div className="relative">
                  {/* Selected category */}
                  <button
                    type="button"
                    onClick={() => setCategoryOpen((prev) => !prev)}
                    className={`
        flex h-11 w-full
        cursor-pointer
        items-center justify-between
        rounded-xl
        border
        bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFDFC_100%)]
        px-3
        text-left
        text-[14px]
        text-[#362F26]
        shadow-[0_3px_10px_rgba(65,43,31,0.025)]
        outline-none
        transition-all duration-200 ease-out
        ${
          categoryOpen
            ? "border-[#B96B4A] shadow-[0_0_0_3px_rgba(159,86,57,0.08),0_5px_14px_rgba(65,43,31,0.05)]"
            : "border-[#E8E1DB] hover:border-[#D9C5B8] hover:shadow-[0_5px_14px_rgba(65,43,31,0.04)]"
        }
      `}
                  >
                    <span>
                      {CATEGORIES.find(
                        ([value]) => value === form.category,
                      )?.[1] || "Select category"}
                    </span>

                    <svg
                      className={`
          h-4 w-4
          text-[#9F5639]
          transition-transform duration-200 ease-out
          ${categoryOpen ? "rotate-180" : ""}
        `}
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="m5 7.5 5 5 5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Category dropdown */}
                  {categoryOpen && (
                    <div
                      className="
          absolute left-0 top-[calc(100%+8px)] z-40
          w-full
          overflow-hidden
          rounded-[16px]
          border border-[#E7DDD6]
          bg-[linear-gradient(145deg,#FFFFFF_0%,#FFF9F5_100%)]
          p-1.5
          shadow-[0_14px_35px_rgba(65,43,31,0.14)]
        "
                    >
                      {CATEGORIES.map(([value, text]) => {
                        const isSelected = form.category === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setForm((current) => ({
                                ...current,
                                category: value,
                              }));
                              setCategoryOpen(false);
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
                            {text}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </label>

              {/* Price */}
              <label className="block">
                {label("Price (₹)")}

                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={set("price")}
                  className={inputCls}
                  placeholder="e.g. 25000"
                />
              </label>

              {/* Medium */}
              <label className="block">
                {label("Medium")}

                <input
                  value={form.medium}
                  onChange={set("medium")}
                  className={inputCls}
                  placeholder="Oil on Heavy Canvas"
                />
              </label>

              {/* Size */}
              <label className="block">
                {label("Size")}

                <div
                  className="
      flex
      h-11
      overflow-visible
      rounded-xl
      border
      border-[#E8E1DB]
      bg-white
      shadow-[0_3px_10px_rgba(65,43,31,0.025)]
      transition-all
      duration-200
      ease-out
      focus-within:border-[#9F5639]
      focus-within:shadow-[0_0_0_3px_rgba(159,86,57,0.07)]
    "
                >
                  {/* Size input */}
                  <input
                    value={form.dims}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9xX\s]/g, "")
                        .replace(/x+/gi, (match) => "X")
                        .replace(/\s+/g, " ");

                      setForm((current) => ({
                        ...current,
                        dims: value,
                      }));
                    }}
                    className="
        min-w-0
        flex-1
        rounded-l-xl
        border-0
        bg-transparent
        px-3
        text-[14px]
        text-[#362F26]
        outline-none
        placeholder:text-[#A28F7D]
      "
                    placeholder="23 X 30"
                    inputMode="text"
                  />

                  {/* Custom unit dropdown */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setUnitOpen((prev) => !prev)}
                      className={`
          flex
          h-full
          min-w-[72px]
          cursor-pointer
          items-center
          justify-between
          gap-2
          rounded-r-xl
          border-l
          px-3
          text-[13px]
          font-medium
          outline-none
          transition-all
          duration-200
          ease-out
          ${
            unitOpen
              ? "border-[#B96B4A] bg-[#FCF5F0] text-[#9F5639]"
              : "border-[#E8E1DB] bg-white text-[#6F5B4E] hover:bg-[#FCF8F4]"
          }
        `}
                    >
                      <span>{form.dimsUnit}</span>

                      <svg
                        className={`
            h-3.5
            w-3.5
            text-[#9F5639]
            transition-transform
            duration-200
            ease-out
            ${unitOpen ? "rotate-180" : ""}
          `}
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          d="m5 7.5 5 5 5-5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {unitOpen && (
                      <div
                        className="
            absolute
            right-0
            top-[calc(100%+8px)]
            z-50
            w-[80px]
            overflow-hidden
            rounded-[14px]
            border
            border-[#E7DDD6]
            bg-[linear-gradient(145deg,#FFFFFF_0%,#FFF9F5_100%)]
            p-1.5
            shadow-[0_14px_35px_rgba(65,43,31,0.14)]
          "
                      >
                        {[["cm"], ["in"]].map(([value, text]) => {
                          const isSelected = form.dimsUnit === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setForm((current) => ({
                                  ...current,
                                  dimsUnit: value,
                                }));
                                setUnitOpen(false);
                              }}
                              className={`
                  flex
                  w-full
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-[10px]
                  px-3
                  py-2.5
                  text-left
                  transition-all
                  duration-150
                  ease-out
                  ${
                    isSelected
                      ? "bg-[#F3E2D7] text-[#9F5639]"
                      : "text-[#5F4D42] hover:bg-[#FAF1EB] hover:text-[#9F5639]"
                  }
                `}
                            >
                              <span
                                className={`text-[13px] ${
                                  isSelected ? "font-semibold" : "font-medium"
                                }`}
                              >
                                {value}
                              </span>

                              <span className="text-[9.5px] text-[#A28F7D]">
                                {text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-1.5 text-[10.5px] text-[#A28F7D]">
                  Enter dimensions using X, for example 23 X 30.
                </p>
              </label>

              {/* Location */}
              <label className="block">
                {label("Location")}

                <input
                  value={form.location}
                  onChange={set("location")}
                  className={inputCls}
                  placeholder="Jaipur, India"
                />
              </label>

              {/* Tag */}
              <label className="block">
                {label("Tag")}

                <input
                  value={form.tag}
                  onChange={set("tag")}
                  className={inputCls}
                  placeholder="Original Oil"
                />
              </label>

              {/* Description */}
              <label className="block sm:col-span-2">
                {label("Description")}

                <textarea
                  rows={5}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Describe the artwork, inspiration, technique or story behind it..."
                  className="
                  w-full
                  resize-none
                  rounded-xl
                  border border-[#E8E1DB]
                  bg-white
                  px-3.5 py-3
                  text-[13.5px]
                  leading-relaxed
                  text-[#362F26]
                  outline-none
                  placeholder:text-[#A28F7D]
                  transition-all duration-200
                  hover:border-[#D9C5B8]
                  focus:border-[#9F5639]
                  focus:shadow-[0_0_0_3px_rgba(159,86,57,0.07)]
                "
                />
              </label>

              {/* Status */}
              <label className="block">
                {label("Status")}

                <select
                  value={form.status}
                  onChange={set("status")}
                  className={`
                  ${inputCls}
                  cursor-pointer
                  appearance-none
                `}
                >
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </label>
            </div>

            {/* Validation */}
            {!valid && (
              <div
                className="
                mt-6
                rounded-[14px]
                border border-[#E9DDD5]
                bg-[#FCF8F4]
                px-4 py-3
              "
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0 text-[#B8955A]"
                  />

                  <p className="text-[11.5px] leading-relaxed text-[#8F7B6E]">
                    Image, title, price, medium, size, location and tag are
                    required. These details are displayed in your artwork
                    collection.
                  </p>
                </div>
              </div>
            )}

            {saveError && (
              <p className="mt-3 rounded-xl border border-[#EBCFC9] bg-[#FFF5F2] px-3 py-2.5 text-[12px] text-[#9B3B2E]">
                {saveError}
              </p>
            )}

            {/* Actions */}
            <div className="mt-7 flex flex-col gap-3 border-t border-[#E8E1DB] pt-5 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={!valid || submitting || isLoadingArtwork}
                className="
                inline-flex
                h-11
                cursor-pointer
                items-center
                justify-center
                rounded-full
                bg-[linear-gradient(135deg,#B96B4A,#9F5639)]
                px-6
                text-[13.5px]
                font-semibold
                text-white
                shadow-[0_7px_18px_rgba(159,86,57,0.16)]
                transition-all duration-300 ease-out
                hover:-translate-y-0.5
                hover:shadow-[0_11px_24px_rgba(159,86,57,0.23)]
                active:scale-[0.97]
                disabled:cursor-not-allowed
                disabled:opacity-45
                disabled:hover:translate-y-0
              "
              >
                {isLoadingArtwork
                  ? "Loading artwork..."
                  : submitting
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Save changes"
                      : "Create artwork"}
              </button>

              <Link
                to="/artist/artworks"
                className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-full
                border border-[#DED0C7]
                bg-white/80
                px-6
                text-[13.5px]
                font-medium
                text-[#6F5B4E]
                transition-all duration-200 ease-out
                hover:-translate-y-0.5
                hover:border-[#CBB4A5]
                hover:bg-white
                hover:text-[#9F5639]
                active:scale-[0.97]
              "
              >
                Cancel
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.form>
  );
}
