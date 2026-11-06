import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Image,
  ShoppingBag,
  Palette,
  Wallet,
  Star,
  CircleUser,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

// [label, path, icon, badge count]
const GROUPS = [
  ["Overview", [["Dashboard", "/artist", LayoutDashboard]]],
  [
    "My Work",
    [
      ["My Artworks", "/artist/artworks", Image],
      ["Orders", "/artist/orders", ShoppingBag],
      ["Custom Requests", "/artist/requests", Palette],
    ],
  ],
  [
    "Business",
    [
      ["Earnings", "/artist/earnings", Wallet],
      ["Reviews", "/artist/reviews", Star],
      ["Messages", "/artist/messages", MessageSquare],
    ],
  ],
];

const linkCls = ({ isActive }) =>
  `relative flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] transition-colors ${
    isActive
      ? "bg-[#4A4036] text-white before:absolute before:left-[-4px] before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-[#E08A5C]"
      : "text-[#E3D8CC] hover:bg-[#40372E]"
  }`;

const spring = {
  type: "spring",
  stiffness: 420,
  damping: 34,
};

function MenuButton({ open, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close sidebar" : "Open sidebar"}
      aria-expanded={open}
      className="
        relative
        flex
        h-8
        w-8
        shrink-0
        cursor-pointer
        items-center
        justify-center
        rounded-lg
        text-[#E3D8CC]
        transition-colors
        hover:bg-white/10
      "
    >
      <span className="relative block h-[16px] w-[19px]">
        <motion.span
          className="absolute left-0 top-0 h-[2px] w-[19px] rounded-full bg-current"
          animate={open ? { y: 7, rotate: 45 } : { y: 0, rotate: 0 }}
          transition={spring}
        />

        <motion.span
          className="absolute left-0 top-[7px] h-[2px] w-[19px] rounded-full bg-current"
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.18 }}
        />

        <motion.span
          className="absolute left-0 top-[14px] h-[2px] w-[19px] rounded-full bg-current"
          animate={open ? { y: -7, rotate: -45 } : { y: 0, rotate: 0 }}
          transition={spring}
        />
      </span>
    </button>
  );
}

function SidebarContent({ onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to sign out?");

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Logout failed");
      }

      console.log(result.message);
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear authentication data
      logout();

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login
      navigate("/artist/login");

      // Close mobile sidebar
      onClose?.();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#5A4A3C] text-[12px] font-semibold text-[#E8D9CB]">
            A
          </div>

          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold leading-none text-white">
              ArtNest
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#A8998A]">
              Artist
            </p>
          </div>
        </div>

        {/* Mobile/tablet close button */}
        <div className="lg:hidden">
          <MenuButton open={true} onClick={onClose} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GROUPS.map(([group, items]) => (
          <div key={group} className="mb-5">
            <p className="mb-2 px-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A8998A]">
              {group}
            </p>

            <div className="space-y-1">
              {items.map(([label, to, Icon, badge]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/artist"}
                  onClick={onClose}
                  className={linkCls}
                >
                  <Icon size={18} className="shrink-0" />

                  <span className="flex-1">{label}</span>

                  {badge > 0 && (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#B0573A] text-[12px] font-semibold text-white">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="shrink-0 space-y-1 border-t border-white/10 px-4 py-4">
        <NavLink to="/artist/profile" onClick={onClose} className={linkCls}>
          <CircleUser size={18} className="shrink-0" />
          <span>Profile</span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="
            flex
            w-full
            cursor-pointer
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-[15px]
            text-[#E3D8CC]
            transition-colors
            hover:bg-[#40372E]
          "
        >
          <LogOut size={18} className="shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="
          sticky
          top-0
          hidden
          h-screen
          w-[280px]
          shrink-0
          flex-col
          bg-[#362F26]
          text-[#E3D8CC]
          lg:flex
        "
      >
        <SidebarContent />
      </aside>

      {/* Mobile / tablet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="
                fixed
                inset-0
                z-40
                cursor-default
                bg-black/45
                lg:hidden
              "
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 34,
              }}
              className="
                fixed
                inset-y-0
                left-0
                z-50
                flex
                h-screen
                w-[280px]
                max-w-[82vw]
                flex-col
                bg-[#362F26]
                text-[#E3D8CC]
                shadow-[12px_0_40px_rgba(0,0,0,0.18)]
                lg:hidden
              "
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
