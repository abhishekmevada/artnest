import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const ease = [0.22, 1, 0.36, 1];

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["bg-stone-200", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-green-600"];

const sideCopy = {
  email: {
    title: "Regain access to your studio",
    text: "Your listings, commissions, and collector offers are safe — reset your password to get back in.",
  },
  sent: {
    title: "Regain access to your studio",
    text: "Your listings, commissions, and collector offers are safe — reset your password to get back in.",
  },
  reset: {
    title: "Set a new key to your studio",
    text: "Choose a strong password so your listings, commissions, and collector offers stay protected.",
  },
  done: {
    title: "Welcome back to your studio",
    text: "Your password is updated. Sign in to pick up right where you left off.",
  },
};

function PasswordField({ label, value, onChange, placeholder, show, onToggle, error, autoComplete }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-stone-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`w-full rounded-lg border bg-[#FBEFE6]/60 pl-3 pr-10 py-2 text-[13px] text-stone-800 placeholder:text-stone-400 outline-none transition focus:bg-white focus:ring-2 ${error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
              : "border-stone-200 focus:border-[#A5522F] focus:ring-[#A5522F]/15"
            }`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none focus-visible:text-[#A5522F]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function ArtistForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = password ? getStrength(password) : 0;
  const mismatch = confirm.length > 0 && password !== confirm;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStep("sent");
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setStep("done");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tryAgain = () => {
    setStep("email");
  };

  return (
    <div className="h-screen w-full bg-[#FDF1E8] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="w-full max-w-5xl max-h-[94vh] grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease }}
          className="relative hidden md:flex flex-col justify-between p-5 sm:p-6 md:p-8 h-full max-h-[94vh] rounded-2xl overflow-hidden"
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
            <span className="text-[10px] tracking-wide text-white/70">Cohort VI</span>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-wide text-[#E8A87C] mb-2">
              Exhibition • Patronage • Sovereignty
            </p>
            <h1 className="font-serif text-white text-[22px] sm:text-[24px] md:text-[28px] leading-tight mb-2">
              {sideCopy[step].title}
            </h1>
            <p className="text-white/75 text-[13px] max-w-sm">{sideCopy[step].text}</p>
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
          className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(80,40,20,0.06)] p-5 sm:p-7 flex flex-col justify-center w-full max-w-lg mx-auto md:max-w-none md:mx-0 overflow-y-auto max-h-[94vh]"
        >
          {step === "email" && (
            <>
              <motion.a
                variants={item}
                href="/login/artist"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-stone-500 hover:text-stone-700 mb-4"
              >
                <ArrowLeft size={13} /> Back to Sign In
              </motion.a>

              <motion.div
                variants={item}
                className="h-10 w-10 rounded-xl bg-[#A5522F]/10 flex items-center justify-center mb-4"
              >
                <Mail size={20} className="text-[#A5522F]" />
              </motion.div>

              <motion.h1
                variants={item}
                className="font-serif text-[22px] sm:text-[24px] leading-tight text-stone-900 mb-1.5"
              >
                Forgot your password?
              </motion.h1>

              <motion.p variants={item} className="text-[13px] text-stone-500 mb-5 max-w-sm">
                Enter the email linked to your studio account and we'll send a reset link your way.
              </motion.p>

              <form onSubmit={handleEmailSubmit}>
                <motion.div variants={item} className="mb-4">
                  <label className="block text-[12px] font-medium text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e-mail"
                    required
                    className="w-full rounded-lg border border-stone-200 bg-[#FBEFE6]/60 px-3 py-2 text-[13px] text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-[#A5522F] focus:bg-white focus:ring-2 focus:ring-[#A5522F]/15"
                  />
                </motion.div>

                <motion.button
                  variants={item}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#A5522F] py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#8f4526]"
                >
                  Send Reset Link
                </motion.button>
              </form>

              <motion.p variants={item} className="text-center text-[12px] text-stone-500 mt-4">
                Remembered your password?{" "}
                <a href="/login/artist" className="font-medium text-[#A5522F]">
                  Sign In
                </a>
              </motion.p>
            </>
          )}

          {step === "sent" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease }}
              className="text-center py-2"
            >
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>

              <h1 className="font-serif text-[20px] sm:text-[22px] leading-tight text-stone-900 mb-1.5">
                Check your inbox
              </h1>

              <p className="text-[13px] text-stone-500 mb-5 max-w-sm mx-auto">
                We've sent a password reset link to{" "}
                <span className="font-medium text-stone-700 break-all">{email}</span>. The link
                will expire in 30 minutes.
              </p>

              <button
                type="button"
                onClick={() => setStep("reset")}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-[#A5522F] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#8f4526] mb-3"
              >
                Enter new password
              </button>

              <div>
                <a
                  href="/login/artist"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-[12px] font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </a>
              </div>

              <p className="text-[12px] text-stone-400 mt-4">
                Didn't get the email?{" "}
                <button type="button" onClick={tryAgain} className="font-medium text-[#A5522F]">
                  Try again
                </button>
              </p>
            </motion.div>
          )}

          {step === "reset" && (
            <>
              <motion.div
                variants={item}
                className="h-10 w-10 rounded-xl bg-[#A5522F]/10 flex items-center justify-center mb-4"
              >
                <Lock size={20} className="text-[#A5522F]" />
              </motion.div>

              <motion.h1
                variants={item}
                className="font-serif text-[22px] sm:text-[24px] leading-tight text-stone-900 mb-1.5"
              >
                Create new password
              </motion.h1>

              <motion.p variants={item} className="text-[13px] text-stone-500 mb-5 max-w-sm">
                Your new password must be different from the one you used before.
              </motion.p>

              <form onSubmit={handleResetSubmit} noValidate>
                <motion.div variants={item} className="mb-3">
                  <PasswordField
                    label="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    show={showPw}
                    onToggle={() => setShowPw((s) => !s)}
                    autoComplete="new-password"
                  />

                  {password && (
                    <div className="mt-2" aria-live="polite">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : "bg-stone-200"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Strength:{" "}
                        <span className="font-medium text-stone-700">{strengthLabels[strength]}</span>
                      </p>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={item} className="mb-3">
                  <PasswordField
                    label="Confirm New Password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    show={showConfirm}
                    onToggle={() => setShowConfirm((s) => !s)}
                    error={mismatch}
                    autoComplete="new-password"
                  />
                  {mismatch && <p className="text-[11px] text-red-600 mt-1">Passwords do not match.</p>}
                </motion.div>

                {error && (
                  <p role="alert" className="text-[12px] text-red-600 mb-3">
                    {error}
                  </p>
                )}

                <motion.button
                  variants={item}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#A5522F] py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#8f4526] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Reset Password"}
                </motion.button>
              </form>

              <motion.p variants={item} className="text-center text-[12px] text-stone-500 mt-4">
                Remembered your password?{" "}
                <a href="/login/artist" className="font-medium text-[#A5522F]">
                  Sign In
                </a>
              </motion.p>
            </>
          )}

          {step === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease }}
              className="text-center py-2"
            >
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>

              <h1 className="font-serif text-[20px] sm:text-[22px] leading-tight text-stone-900 mb-1.5">
                Password updated
              </h1>

              <p className="text-[13px] text-stone-500 mb-5 max-w-sm mx-auto">
                Your password has been changed successfully. Sign in with your new password to get
                back to your studio.
              </p>

              <a
                href="/login/artist"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#A5522F] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#8f4526]"
              >
                Back to Sign In
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}