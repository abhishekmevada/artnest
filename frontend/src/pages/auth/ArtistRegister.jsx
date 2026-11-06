import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Percent, ShieldCheck, Truck, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.5 0 10.4-1.9 14.3-5l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.9 39.7 16.4 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.6 5.4C41.3 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z"
    />
  </svg>
);

const Field = ({ label, ...props }) => (
  <div className="flex-1">
    <label className="block text-[12px] font-medium text-stone-700 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-lg border border-stone-200 bg-[#FBEFE6]/60 px-3 py-2 text-[13px] text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-[#A5522F] focus:bg-white focus:ring-2 focus:ring-[#A5522F]/15"
    />
  </div>
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const FEATURES = [
  {
    icon: Percent,
    title: "0% Upfront Listing Fees",
    body: "Keep full control. We only receive a curatorial commission when your masterwork finds a patron.",
  },
  {
    icon: ShieldCheck,
    title: "Curatorial Verification & Provenance",
    body: "Each creation receives a verifiable archival certificate of authenticity backed by audited escrow.",
  },
  {
    icon: Truck,
    title: "White-Glove Shipping Concierge",
    body: "Fully insured international transit, custom crate packing logistics, and direct collector delivery.",
  },
];

const MEDIUMS = [
  "painting",
  "sculpture",
  "digital art",
  "abstract art",
  "photography",
];

export default function ArtistSignup() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(["painting", "sculpture"]);
  const [agree, setAgree] = useState(false);

  const toggleMedium = (m) =>
    setSelected((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validate terms
    if (!agree) {
      setError("Please accept the Terms and Conditions.");
      return;
    }

    // Validate password
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate specialty
    if (selected.length === 0) {
      setError("Please select at least one specialty");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/auth/artist_signup`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          specialty: selected,
        },
      );

      setSuccess(response.data.message || "Artist registered successfully!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setSelected([]);
      setAgree(false);

      // Navigate only after successful registration
      setTimeout(() => {
        navigate("/artist/login");
      }, 1500);
    } catch (error) {
      console.error("Artist signup error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to register. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-screen w-full bg-[#FDF1E8] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="w-full max-w-5xl max-h-[94vh] grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:flex flex-col justify-between p-6 sm:p-8 h-full max-h-[94vh] rounded-2xl overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,12,10,0.55), rgba(15,12,10,0.8)), url(https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-white bg-white/10 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
              Juried Artist Registry
            </span>
            <span className="text-[10px] tracking-wide text-white/70">
              Cohort VI
            </span>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-wide text-[#E8A87C] mb-2">
              Exhibition • Patronage • Sovereignty
            </p>
            <h1 className="font-serif text-white text-[28px] xl:text-[32px] leading-tight mb-2">
              Join ArtNest as an Artist
            </h1>
            <p className="text-white/75 text-[13px] max-w-sm mb-5">
              Share your original artwork and bespoke commissions with
              discerning patrons worldwide. Preserve archival craftsmanship with
              transparent gallery terms.
            </p>

            <div className="space-y-2.5">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="flex gap-2.5 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-3"
                >
                  <div className="h-7 w-7 shrink-0 rounded-lg bg-[#A5522F] flex items-center justify-center">
                    <Icon size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-[12px] font-semibold mb-0.5">
                      {title}
                    </p>
                    <p className="text-white/65 text-[11px] leading-snug">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/70 pt-3">
            <span>Over ₹1.4M+ paid directly to ateliers</span>
            <span className="font-medium text-white/90">Global Guild</span>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="no-scrollbar bg-white rounded-2xl shadow-[0_2px_24px_rgba(80,40,20,0.06)] p-5 sm:p-7 overflow-y-auto max-h-[94vh]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <motion.h1
            variants={item}
            className="font-serif text-[26px] sm:text-[28px] leading-tight text-stone-900 mb-1.5"
          >
            Create Your Artist Account
          </motion.h1>
          <motion.p
            variants={item}
            className="text-[13px] text-stone-500 mb-4 max-w-sm"
          >
            Submit your studio credentials to begin curatorial onboarding and
            list your portfolio.
          </motion.p>

          <motion.div variants={item} className="mb-4">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const idToken = credentialResponse.credential;

                  if (!idToken) {
                    throw new Error("Google did not return an ID token");
                  }

                  const response = await fetch(
                    `${API_BASE_URL}/auth/google/artist`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ idToken }),
                    },
                  );

                  const text = await response.text();

                  let data;

                  try {
                    data = JSON.parse(text);
                  } catch {
                    throw new Error(
                      `Backend returned a non-JSON response. HTTP status: ${response.status}`,
                    );
                  }
                  if (!response.ok) {
                    throw new Error(data.message || "Google signup failed");
                  }

                  if (data.accessToken) {
                    localStorage.setItem("accessToken", data.accessToken);
                  }

                  if (data.refreshToken) {
                    localStorage.setItem("refreshToken", data.refreshToken);
                  }

                  alert("Google signup successful!");

                  // Change this to your actual buyer dashboard route.
                  navigate("/artist/login");
                } catch (error) {
                  console.error("Google signup error:", error);
                  alert(error.message || "Google signup failed");
                }
              }}
              onError={() => {
                console.error("Google sign-in failed");
                alert("Google sign-in failed. Please try again.");
              }}
            />
          </motion.div>

          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-[10px] font-medium tracking-wide text-stone-400">
              Or register with email
            </span>
            <div className="h-px flex-1 bg-stone-200" />
          </motion.div>

          <form onSubmit={handleSignup}>
            {/* Full Name */}
            <motion.div variants={item} className="mb-3">
              <Field
                label="Full Legal Name"
                placeholder="Enter your name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={item} className="mb-3">
              <Field
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </motion.div>

            {/* Password */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3"
            >
              <Field
                label="Password"
                placeholder="Min. 8 characters"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />

              <Field
                label="Confirm Password"
                placeholder="Repeat password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </motion.div>

            {/* Multiple Specialties */}
            <motion.div variants={item} className="mb-4">
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-[12px] font-medium text-stone-700">
                  Primary Medium / Discipline
                </label>

                <span className="text-[10px] text-stone-400">
                  Select all that apply
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {MEDIUMS.map((m) => {
                  const active = selected.includes(m);

                  return (
                    <button
                      type="button"
                      key={m}
                      onClick={() => toggleMedium(m)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-medium transition ${
                        active
                          ? "bg-[#A5522F] border-[#A5522F] text-white"
                          : "border-stone-200 text-stone-600 bg-[#FBEFE6]/50 hover:border-stone-300"
                      }`}
                    >
                      {active && <Check size={12} />}
                      {m}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            {success && (
              <p className="text-sm text-green-600 mb-3">{success}</p>
            )}

            <motion.label
              variants={item}
              className="flex items-start gap-2 mb-4 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree((v) => !v)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-stone-300 text-[#A5522F] focus:ring-[#A5522F]/30"
              />
              <span className="text-[12px] text-stone-600">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-[#A5522F] underline underline-offset-2"
                >
                  Terms of Service
                </a>
                ,{" "}
                <a
                  href="#"
                  className="text-[#A5522F] underline underline-offset-2"
                >
                  Privacy Policy
                </a>
                , and the ArtNest Curatorial Standards Agreement.
              </span>
            </motion.label>

            <motion.button
              variants={item}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#A5522F] py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#8f4526] disabled:opacity-50"
            >
              {loading ? (
                <>
                  Creating Account...
                  <ArrowRight size={14} />
                </>
              ) : (
                <>
                  Create Artist Account
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>
          </form>

          <motion.p
            variants={item}
            className="text-center text-[11px] text-stone-400 mt-2"
          >
            Portfolio applications are reviewed within 48 hours by our
            Curatorial Board.
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mt-4 pt-4 border-t border-stone-100 text-[12px]"
          >
            <span className="text-stone-500">
              Are you a collector looking to acquire art?
            </span>
            <a
              href="/register/buyer"
              className="font-medium text-stone-800 flex items-center gap-1"
            >
              Register as a Buyer <ArrowRight size={12} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
