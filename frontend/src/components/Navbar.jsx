import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import logo from "../assets/logo.png";
import {
  MdArrowForward,
  MdFavorite,
  MdFavoriteBorder,
  MdKeyboardArrowDown,
  MdOutlineBrush,
  MdOutlineExplore,
  MdOutlineHome,
  MdOutlineImage,
  MdOutlinePeopleAlt,
  MdOutlineShoppingBag,
} from "react-icons/md";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/", Icon: MdOutlineHome },
  { label: "Discover", href: "/discover", Icon: MdOutlineExplore },
  { label: "Artists", href: "/artists", Icon: MdOutlineImage },
  { label: "Custom Art", href: "/custom-art", Icon: MdOutlineBrush },
  { label: "About", href: "/about", Icon: MdOutlinePeopleAlt },
];

const PROFILE_LINK = {
  buyer: "/dashboard",
  artist: "/artist/profile",
  admin: "/admin",
};
const ROLE_LABEL = {
  buyer: "Buyer account",
  artist: "Artist dashboard",
  admin: "Admin panel",
};

const spring = { type: "spring", stiffness: 420, damping: 34 };
const ease = [0.76, 0, 0.24, 1];
const CIRCLE_ORIGIN = "at calc(100% - 2.5rem) 2.5rem";
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a65335]";

function Dot({ count }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 16 }}
          className="absolute right-1 top-1 h-3 w-3 rounded-full bg-[#b4452a] ring-2 ring-[#fbf6f1]"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-[#b4452a]/60 [animation-iteration-count:2] motion-reduce:animate-none" />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function RoundLink({ to, label, count, children }) {
  return (
    <Link
      to={to}
      aria-label={count ? `${label} (${count})` : label}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-[#3d3430] shadow-[0_4px_12px_-4px_rgba(65,43,31,0.28)] transition-colors hover:bg-white hover:text-[#a65335] ${focusRing}`}
    >
      <motion.span
        whileHover={{ y: -2, scale: 1.08 }}
        whileTap={{ scale: 0.86 }}
        transition={spring}
        className="flex"
      >
        {children}
      </motion.span>
      <Dot count={count} />
    </Link>
  );
}

function Avatar({ name, size = "h-11 w-11", text = "text-[13px]" }) {
  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#dcc4aa] to-[#b6957a] ${text} font-semibold text-white shadow-[0_4px_10px_-3px_rgba(65,43,31,0.35)]`}
    >
      {getInitials(name)}
    </span>
  );
}

function Divider() {
  return (
    <div aria-hidden className="mx-1 hidden h-10 w-px bg-[#e5d6ca] sm:block" />
  );
}

function OfferFeed({ active, className = "" }) {
  return (
    <Link
      to="/feed"
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-[#b9532f] to-[#9d3f22] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_20px_-8px_rgba(166,83,53,0.75)] transition-shadow hover:shadow-[0_14px_26px_-8px_rgba(166,83,53,0.9)] ${
        active
          ? "ring-2 ring-[#a65335]/40 ring-offset-2 ring-offset-[#fbf6f1]"
          : ""
      } ${focusRing} ${className}`}
    >
      <span className="relative">Offer Feed</span>
      <MdArrowForward
        size={17}
        className="relative transition-transform duration-300 group-hover:translate-x-1"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
    </Link>
  );
}

function Burger({ open }) {
  const line = "absolute left-0 h-[2px] w-5 rounded-full bg-current";
  return (
    <span className="relative block h-[14px] w-5">
      <motion.span
        className={`${line} top-0`}
        animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={spring}
      />
      <motion.span
        className={`${line} top-[6px]`}
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className={`${line} top-[12px]`}
        animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
        transition={spring}
      />
    </span>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hovered, setHovered] = useState(null);

  const { pathname } = useLocation();
  const { items: wishlistItems } = useWishlist();
  const { items: cartItems } = useCart();
  const { user, logout } = useAuth();
  const loginRef = useRef(null);
  const profileRef = useRef(null);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const activeHref = NAV_LINKS.find((l) => isActive(l.href))?.href ?? null;
  const pillTarget = hovered ?? activeHref;
  const feedActive = pathname.startsWith("/feed");
  const onWishlist = pathname === "/wishlist";
  const profileTo = user ? PROFILE_LINK[user.role] : "/buyer/login";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setLoginOpen(false);
        setProfileOpen(false);
      }
    };
    const onClick = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target))
        setLoginOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-50 h-16 font-sans lg:h-[68px]">
        <motion.nav
          aria-label="Main"
          initial={{ opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 top-0 z-20 h-16 border-b border-[#eadfd6] bg-[#fbf6f1]/90 shadow-[0_8px_24px_-16px_rgba(65,43,31,0.3)] backdrop-blur-xl lg:h-[68px]"
        >
          <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
            <Link
              to="/"
              className={`flex shrink-0 items-center rounded-lg ${focusRing}`}
            >
              <motion.img
                src={logo}
                alt="Athenura"
                whileHover={{ scale: 1.04 }}
                transition={spring}
                className="h-9 w-auto sm:h-10 lg:h-11"
              />
            </Link>

            <div
              onMouseLeave={() => setHovered(null)}
              className="hidden flex-1 items-center justify-center gap-1 lg:flex"
            >
              {NAV_LINKS.map(({ label, href, Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    to={href}
                    onMouseEnter={() => setHovered(href)}
                    onFocus={() => setHovered(href)}
                    onBlur={() => setHovered(null)}
                    aria-current={active ? "page" : undefined}
                    className="group relative isolate flex min-w-[76px] flex-col items-center gap-0.5 rounded-xl px-4 py-2 outline-none"
                  >
                    {pillTarget === href && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={spring}
                        className="absolute inset-0 -z-10 rounded-xl border border-[#ecd5c6]/70 bg-[#f4e5db]"
                      />
                    )}
                    <Icon
                      size={22}
                      className={`transition-all duration-300 group-hover:-translate-y-0.5 ${
                        active
                          ? "text-[#a65335]"
                          : "text-[#3d3430] group-hover:text-[#a65335]"
                      }`}
                    />
                    <span
                      className={`whitespace-nowrap text-[13px] leading-none transition-colors ${
                        active
                          ? "font-semibold text-[#a65335]"
                          : "text-[#4d4541]"
                      }`}
                    >
                      {label}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="nav-bar"
                        transition={spring}
                        className="absolute inset-x-0 -bottom-px mx-auto h-[3px] w-7 rounded-full bg-[#a65335]"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Divider />
              <OfferFeed
                active={feedActive}
                className="hidden lg:inline-flex"
              />
              <Divider />

              <RoundLink
                to="/wishlist"
                label="Wishlist"
                count={wishlistItems.length}
              >
                {onWishlist ? (
                  <MdFavorite size={22} className="text-[#a65335]" />
                ) : (
                  <MdFavoriteBorder size={22} />
                )}
              </RoundLink>
              <RoundLink to="/cart" label="Cart" count={cartItems.length}>
                <MdOutlineShoppingBag size={22} />
              </RoundLink>

              <Divider />

              {!user && (
                <div ref={loginRef} className="relative hidden sm:block">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={loginOpen}
                    onClick={() => setLoginOpen((v) => !v)}
                    className={`flex h-11 cursor-pointer items-center gap-1 rounded-full bg-[#a65335] pl-5 pr-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#8f462c] ${focusRing}`}
                  >
                    Login
                    <motion.span
                      animate={{ rotate: loginOpen ? 180 : 0 }}
                      transition={spring}
                      className="flex"
                    >
                      <MdKeyboardArrowDown size={20} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {loginOpen && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 32,
                        }}
                        style={{ transformOrigin: "top right" }}
                        className="absolute right-0 top-full z-50 mt-3 w-60 rounded-2xl border border-[#eadfd6] bg-white p-1.5 shadow-[0_20px_40px_-12px_rgba(65,43,31,0.25)]"
                      >
                        {[
                          {
                            to: "/buyer/login",
                            title: "Login as Buyer",
                            sub: "Browse, save and buy art",
                          },
                          {
                            to: "/artist/login",
                            title: "Login as Artist",
                            sub: "Manage your studio and sales",
                          },
                        ].map((item, i) => (
                          <motion.div
                            key={item.to}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 + i * 0.05 }}
                          >
                            <Link
                              to={item.to}
                              role="menuitem"
                              onClick={() => setLoginOpen(false)}
                              className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-[#f8eadc]"
                            >
                              <span className="block text-[13px] font-semibold text-[#29221e]">
                                {item.title}
                              </span>
                              <span className="block text-[11.5px] text-[#765e51]">
                                {item.sub}
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                        <Link
                          to="/buyer/register"
                          onClick={() => setLoginOpen(false)}
                          className="mt-1 block border-t border-[#f1e4d8] px-3 pb-1.5 pt-2.5 text-[12px] text-[#765e51] hover:text-[#a65335]"
                        >
                          New here? Create an account
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {user && (
                <div
                  ref={profileRef}
                  className="relative hidden sm:block"
                  onMouseEnter={() => setProfileOpen(true)}
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    aria-label="Account menu"
                    onClick={() => setProfileOpen(true)}
                    className={`flex cursor-pointer items-center gap-1 rounded-full ${focusRing}`}
                  >
                    <motion.span
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      transition={spring}
                    >
                      <Avatar name={user.name} />
                    </motion.span>
                    <motion.span
                      animate={{ rotate: profileOpen ? 180 : 0 }}
                      transition={spring}
                      className="flex text-[#a65335]"
                    >
                      <MdKeyboardArrowDown size={20} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 32,
                        }}
                        style={{ transformOrigin: "top right" }}
                        className="absolute right-0 top-full z-50 w-64 pt-3"
                      >
                        <div className="rounded-2xl border border-[#eadfd6] bg-white p-4 shadow-[0_20px_40px_-12px_rgba(65,43,31,0.25)]">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={user.name}
                              size="h-10 w-10"
                              text="text-[12px]"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-semibold text-[#29221e]">
                                {user.name}
                              </p>
                              <p className="truncate text-[12px] text-[#765e51]">
                                {user.tagline}
                              </p>
                            </div>
                          </div>
                          <p className="mt-3 text-[12px] text-[#a8917f]">
                            {ROLE_LABEL[user.role]}
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-[#f1e4d8] pt-3">
                            <Link
                              to={profileTo}
                              onClick={() => setProfileOpen(false)}
                              className="text-[13px] font-semibold text-[#a65335] hover:text-[#8f462c]"
                            >
                              Open profile
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setProfileOpen(false);
                                logout();
                              }}
                              className="cursor-pointer text-[13px] font-semibold text-[#765e51] hover:text-[#a65335]"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((v) => !v)}
                className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[#29221e] transition-colors hover:bg-[#f1e4d8] lg:hidden ${focusRing}`}
              >
                <Burger open={menuOpen} />
              </button>
            </div>
          </div>
        </motion.nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ clipPath: `circle(0% ${CIRCLE_ORIGIN})` }}
              animate={{ clipPath: `circle(160% ${CIRCLE_ORIGIN})` }}
              exit={{ clipPath: `circle(0% ${CIRCLE_ORIGIN})` }}
              transition={{ duration: 0.7, ease }}
              className="fixed inset-0 z-10 flex flex-col overflow-y-auto bg-[#f8efe6] px-6 pb-8 pt-28 text-[#2b1710] lg:hidden"
            >
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{
                  show: {
                    transition: { staggerChildren: 0.07, delayChildren: 0.3 },
                  },
                }}
                className="flex flex-col"
              >
                {NAV_LINKS.map(({ label, href, Icon }) => {
                  const active = isActive(href);
                  return (
                    <motion.li
                      key={href}
                      variants={{
                        hidden: { opacity: 0, y: 36 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.6,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                      }}
                    >
                      <Link
                        to={href}
                        className={`group flex items-center gap-4 border-b border-[#e8d9cc] py-4 font-serif text-[1.9rem] leading-none transition-colors sm:text-[2.2rem] ${
                          active
                            ? "text-[#a65335]"
                            : "text-[#2b1710] hover:text-[#a65335]"
                        }`}
                      >
                        <Icon
                          size={26}
                          className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5"
                        />
                        {label}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                className="mt-8"
              >
                <OfferFeed active={feedActive} className="w-full sm:w-auto" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.75, duration: 0.5 }}
                className="mt-auto pt-10"
              >
                {user ? (
                  <>
                    <Link
                      to={profileTo}
                      className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm"
                    >
                      <Avatar name={user.name} />
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold">
                          {user.name}
                        </span>
                        <span className="block truncate text-[12px] text-[#765e51]">
                          {ROLE_LABEL[user.role]}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="mt-3 w-full cursor-pointer rounded-full border border-[#d9c5b6] py-3 text-[14px] font-semibold text-[#765e51] transition-colors hover:border-[#a65335] hover:text-[#a65335]"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Link
                        to="/buyer/login"
                        className="flex-1 rounded-full bg-[#a65335] py-3 text-center text-[14px] font-semibold text-white"
                      >
                        Buyer login
                      </Link>
                      <Link
                        to="/artist/login"
                        className="flex-1 rounded-full border border-[#a65335] py-3 text-center text-[14px] font-semibold text-[#a65335]"
                      >
                        Artist login
                      </Link>
                    </div>
                    <Link
                      to="/buyer/register"
                      className="mt-4 block text-center text-[13px] text-[#765e51] hover:text-[#a65335]"
                    >
                      New here? Create an account
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
}
