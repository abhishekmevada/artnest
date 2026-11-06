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

function PasswordField({ label, value, onChange, placeholder, show, onToggle, error, autoComplete }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-stone-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`w-full rounded-lg border bg-[#FBEFE6]/60 pl-3.5 pr-11 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-400 outline-none transition focus:bg-white focus:ring-2 ${error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
              : "border-stone-200 focus:border-[#A5522F] focus:ring-[#A5522F]/15"
            }`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none focus-visible:text-[#A5522F]"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

export default function BuyerForgotPassword() {
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

  return (
    <div className="min-h-screen w-full bg-[#FDF1E8] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        key={step}
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md bg-white rounded-2xl shadow-[0_2px_24px_rgba(80,40,20,0.06)] p-6 sm:p-10"
      >
        {step === "email" && (
          <>
            <motion.a
              variants={item}
              href="/login/buyer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-500 hover:text-stone-700 mb-6"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </motion.a>

            <motion.div
              variants={item}
              className="h-12 w-12 rounded-xl bg-[#A5522F]/10 flex items-center justify-center mb-5"
            >
              <Mail size={22} className="text-[#A5522F]" />
            </motion.div>

            <motion.h1
              variants={item}
              className="font-serif text-[26px] sm:text-[28px] leading-tight text-stone-900 mb-2"
            >
              Forgot your password?
            </motion.h1>

            <motion.p variants={item} className="text-[14px] text-stone-500 mb-7 max-w-sm">
              No worries. Enter the email associated with your account and we'll send you a link to reset it.
            </motion.p>

            <form onSubmit={handleEmailSubmit}>
              <motion.div variants={item} className="mb-6">
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e-mail"
                  required
                  className="w-full rounded-lg border border-stone-200 bg-[#FBEFE6]/60 px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-[#A5522F] focus:bg-white focus:ring-2 focus:ring-[#A5522F]/15"
                />
              </motion.div>

              <motion.button
                variants={item}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#A5522F] py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#8f4526]"
              >
                Send Reset Link
              </motion.button>
            </form>

            <motion.p variants={item} className="text-center text-[13px] text-stone-500 mt-6">
              Remembered your password?{" "}
              <a href="/login/buyer" className="font-medium text-[#A5522F]">
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
            className="text-center py-4"
          >
            <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>

            <h1 className="font-serif text-[24px] sm:text-[26px] leading-tight text-stone-900 mb-2">
              Check your inbox
            </h1>

            <p className="text-[14px] text-stone-500 mb-7 max-w-sm mx-auto">
              We've sent a password reset link to{" "}
              <span className="font-medium text-stone-700 break-all">{email}</span>. The link
              will expire in 30 minutes.
            </p>

            <button
              type="button"
              onClick={() => setStep("reset")}
              className="w-full inline-flex items-center justify-center rounded-lg bg-[#A5522F] px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#8f4526] mb-3"
            >
              Enter new password
            </button>

            <a
              href="/login/buyer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 px-5 py-2.5 text-[13px] font-medium text-stone-700 transition hover:bg-stone-50"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </a>

            <p className="text-[13px] text-stone-400 mt-5">
              Didn't get the email?{" "}
              <button
                type="button"
                onClick={() => setStep("email")}
                className="font-medium text-[#A5522F]"
              >
                Try again
              </button>
            </p>
          </motion.div>
        )}

        {step === "reset" && (
          <>
            <motion.div
              variants={item}
              className="h-12 w-12 rounded-xl bg-[#A5522F]/10 flex items-center justify-center mb-5"
            >
              <Lock size={22} className="text-[#A5522F]" />
            </motion.div>

            <motion.h1
              variants={item}
              className="font-serif text-[26px] sm:text-[28px] leading-tight text-stone-900 mb-2"
            >
              Create new password
            </motion.h1>

            <motion.p variants={item} className="text-[14px] text-stone-500 mb-7 max-w-sm">
              Your new password must be different from the one you used before.
            </motion.p>

            <form onSubmit={handleResetSubmit} noValidate>
              <motion.div variants={item} className="mb-4">
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
                  <div className="mt-2.5" aria-live="polite">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : "bg-stone-200"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-[12px] text-stone-500 mt-1">
                      Strength:{" "}
                      <span className="font-medium text-stone-700">{strengthLabels[strength]}</span>
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div variants={item} className="mb-5">
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
                {mismatch && <p className="text-[12px] text-red-600 mt-1.5">Passwords do not match.</p>}
              </motion.div>

              {error && (
                <p role="alert" className="text-[13px] text-red-600 mb-4">
                  {error}
                </p>
              )}

              <motion.button
                variants={item}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#A5522F] py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#8f4526] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Reset Password"}
              </motion.button>
            </form>

            <motion.p variants={item} className="text-center text-[13px] text-stone-500 mt-6">
              Remembered your password?{" "}
              <a href="/login/buyer" className="font-medium text-[#A5522F]">
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
            className="text-center py-4"
          >
            <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>

            <h1 className="font-serif text-[24px] sm:text-[26px] leading-tight text-stone-900 mb-2">
              Password updated
            </h1>

            <p className="text-[14px] text-stone-500 mb-7 max-w-sm mx-auto">
              Your password has been changed successfully. Sign in with your new password to
              continue.
            </p>

            <a
              href="/login/buyer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#A5522F] px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#8f4526]"
            >
              Back to Sign In
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}