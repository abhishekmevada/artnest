import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
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

export default function BuyerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      // Check user role
      console.log("Checking buyer role:", data.user?.role);

      if (data.user?.role !== "buyer") {
        throw new Error(`Invalid user role: ${data.user?.role}`);
      }

      // Check token
      if (!data.token) {
        throw new Error("Authentication token was not received.");
      }

      // Store token
      const storage = remember ? localStorage : sessionStorage;
      const otherStorage = remember ? sessionStorage : localStorage;

      otherStorage.removeItem("token");
      storage.setItem("token", data.token);

      console.log("Token stored successfully");

      // Update authentication context
      login(data.user, data.token);

      console.log("AuthContext updated");

      // Navigate
      navigate("/dashboard");

      console.log("Navigation triggered");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#FDF1E8] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="w-full max-w-5xl max-h-[94vh] grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(80,40,20,0.06)] p-5 sm:p-7 flex flex-col justify-center w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 overflow-y-auto max-h-[94vh]"
        >
          <motion.p
            variants={item}
            className="text-[10px] font-semibold tracking-wide text-[#B5602F] mb-2"
          >
            Welcome back to ArtNest
          </motion.p>
          <motion.h1
            variants={item}
            className="font-serif text-[26px] sm:text-[28px] leading-tight text-stone-900 mb-1.5"
          >
            Sign in to your account
          </motion.h1>
          <motion.p
            variants={item}
            className="text-[13px] text-stone-500 mb-5 max-w-sm"
          >
            Pick up where you left off — your saved pieces and orders are
            waiting.
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
                    `${API_BASE_URL}/auth/google/buyer`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ idToken }),
                    },
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.message || "Google login failed");
                  }

                  if (data.accessToken) {
                    localStorage.setItem("accessToken", data.accessToken);
                  }

                  if (data.refreshToken) {
                    localStorage.setItem("refreshToken", data.refreshToken);
                  }

                  // Verify that the returned account is a buyer.
                  if (!data.user || data.user.role !== "buyer") {
                    throw new Error("This account is not a buyer account.");
                  }

                  if (!data.token) {
                    throw new Error("Authentication token was not received.");
                  }

                  login(data.user, data.token, remember);

                  navigate("/dashboard");
                } catch (error) {
                  console.error("Google login error:", error);
                  alert(error.message || "Google login failed");
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
              Or sign in with email
            </span>
            <div className="h-px flex-1 bg-stone-200" />
          </motion.div>

          <motion.div variants={item} className="mb-3">
            <label className="block text-[12px] font-medium text-stone-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="e-mail"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-stone-200 bg-[#FBEFE6]/60 px-3 py-2 text-[13px] text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-[#A5522F] focus:bg-white focus:ring-2 focus:ring-[#A5522F]/15"
            />
          </motion.div>

          <motion.div variants={item} className="mb-3">
            <div className="flex items-baseline justify-between mb-1">
              <label className="text-[12px] font-medium text-stone-700">
                Password
              </label>
              <a
                href="/forgot-password/buyer"
                className="text-[11px] font-medium text-[#A5522F]"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                placeholder="Please enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-200 bg-[#FBEFE6]/60 px-3 py-2 pr-8 text-[13px] outline-none transition focus:border-[#A5522F] focus:bg-white focus:ring-2 focus:ring-[#A5522F]/15"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </motion.div>

          <motion.label
            variants={item}
            className="flex items-center gap-2 mb-4 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember((v) => !v)}
              className="h-3.5 w-3.5 rounded border-stone-300 text-[#A5522F] focus:ring-[#A5522F]/30"
            />
            <span className="text-[12px] text-stone-600">
              Keep me signed in on this device
            </span>
          </motion.label>

          <motion.button
            variants={item}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#A5522F] py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#8f4526] disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
            {!loading && <ArrowRight size={14} />}
          </motion.button>

          <motion.p
            variants={item}
            className="text-center text-[12px] text-stone-500 mt-3"
          >
            Don't have an account?{" "}
            <a href="/register/buyer" className="font-medium text-[#A5522F]">
              Create one
            </a>
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mt-4 pt-4 border-t border-stone-100 text-[12px]"
          >
            <span className="text-stone-500">
              Are you an artist or gallery? Then
            </span>
            <a
              href="/login/artist"
              className="font-medium text-stone-800 flex items-center gap-1"
            >
              Sign in as Artist <ArrowRight size={12} />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block rounded-2xl overflow-hidden h-full max-h-[94vh]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,14,10,0.15), rgba(20,14,10,0.65)), url(https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=1200)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute top-4 left-0 right-0 flex flex-col items-center">
            <span className="font-serif text-white text-[17px] tracking-wide">
              ArtNest
            </span>
            <span className="mt-1.5 text-[10px] text-white/90 bg-white/10 backdrop-blur px-2.5 py-0.5 rounded-full border border-white/20">
              Authentic &amp; Direct
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="font-serif italic text-white text-[16px] leading-snug mb-3">
              "Art brings quiet beauty and enduring resonance to the spaces we
              inhabit every day."
            </p>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-full bg-[#A5522F] text-white text-[11px] font-semibold flex items-center justify-center">
                AS
              </div>
              <div>
                <p className="text-white text-[12px] font-medium">
                  Ananya Sharma
                </p>
                <p className="text-white/70 text-[10px]">
                  Atelier Sculptor &amp; Painter
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/80">
              <span>Curated Original Art</span>
              <span>•</span>
              <span>Direct from Artists</span>
              <span>•</span>
              <span>Safe Delivery</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
