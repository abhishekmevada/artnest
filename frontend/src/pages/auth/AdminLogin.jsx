import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "@/config/api";

const field =
  "w-full rounded-lg border border-stone-200 bg-[#FBEFE6]/60 px-3 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-[#A5522F] focus:bg-white focus:ring-2 focus:ring-[#A5522F]/15";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      const data = response.data;

      // Check admin role
      if (data.user?.role !== "admin") {
        setError("This account is not registered as an admin.");
        return;
      }

      // Save user and authentication token
      login(data.user, data.token);

      // Navigate to admin dashboard
      navigate("/admin");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full place-items-center bg-[#FDF1E8] p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-7 shadow-[0_2px_24px_rgba(80,40,20,0.06)]"
      >
        <span className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-[#A5522F] text-white">
          <ShieldCheck size={20} />
        </span>

        <h1 className="font-serif text-[26px] leading-tight text-stone-900">
          Admin sign in
        </h1>

        <p className="mb-5 mt-1 text-[13px] text-stone-500">
          Authorised staff only.
        </p>

        <label
          htmlFor="admin-email"
          className="mb-1 block text-[12px] font-medium text-stone-700"
        >
          Email
        </label>

        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="admin email"
          className={`${field} mb-3`}
          required
        />

        <label
          htmlFor="admin-password"
          className="mb-1 block text-[12px] font-medium text-stone-700"
        >
          Password
        </label>

        <div className="relative mb-3">
          <input
            id="admin-password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Password"
            className={`${field} pr-10`}
            required
          />

          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-3 rounded-lg bg-[#F6DFDA] px-3 py-2 text-[13px] text-[#9B3B2E]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#A5522F] py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#8f4526] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
          {!loading && <ArrowRight size={14} />}
        </button>
      </form>
    </div>
  );
}
