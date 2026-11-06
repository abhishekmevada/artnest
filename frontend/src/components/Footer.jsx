import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaPinterest, FaYoutube } from "react-icons/fa";
import { MdCheck, MdOutlineMail } from "react-icons/md";
import logo from "../assets/logo.png";

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "Discover", href: "/discover" },
      { label: "Artists", href: "/artists" },
      { label: "Custom Artworks", href: "/custom-art" },
      { label: "Collections", href: "/collections" },
      { label: "Blog", href: "/blog" },
      { label: "Testimonials", href: "/testimonials" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Artnest", href: "/about" },
      { label: "Our Mission", href: "/about#mission" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Safe Packaging & Care", href: "/packaging" },
      { label: "FAQs", href: "/faq" },
    ],
  },
];

const LEGAL = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Accessibility", href: "/accessibility" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", Icon: FaInstagram },
  { label: "Facebook", href: "https://facebook.com", Icon: FaFacebookF },
  { label: "YouTube", href: "https://youtube.com", Icon: FaYoutube },
  { label: "Pinterest", href: "https://pinterest.com", Icon: FaPinterest },
];

const ease = [0.22, 1, 0.36, 1];
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a65335]";

function FooterLink({ href, children, className = "" }) {
  return (
    <Link
      to={href}
      className={`group inline-flex items-center rounded-sm transition-colors duration-200 hover:text-[#a65335] ${focusRing} ${className}`}
    >
      <span className="bg-gradient-to-r from-[#a65335] to-[#a65335] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size,transform] duration-300 ease-out group-hover:translate-x-1 group-hover:bg-[length:100%_1px] group-focus-visible:bg-[length:100%_1px]">
        {children}
      </span>
    </Link>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || done) return;
    setDone(true);
    setEmail("");
    setTimeout(() => setDone(false), 4000);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 w-full max-w-[440px]">
      <label
        htmlFor="footer-email"
        className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2b1710]"
      >
        Get new artworks &amp; updates
      </label>

      <div className="mt-4 flex items-stretch gap-1.5">
        <input
          id="footer-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="min-w-0 flex-1 rounded-lg border border-[#e6d8cb] bg-[#fdf9f5] px-4 py-3 text-[16px] text-[#2b1710] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#9c8c80] focus:border-[#a65335] focus:shadow-[0_0_0_4px_rgba(166,83,53,0.14)]"
        />
        <motion.button
          type="submit"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 500, damping: 24 }}
          className={`group relative flex shrink-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg bg-gradient-to-b from-[#b9532f] to-[#a2411f] px-5 text-[16px] font-medium text-white shadow-[0_10px_20px_-10px_rgba(166,83,53,0.8)] ${focusRing}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <MdCheck size={20} />
                Subscribed
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5"
              >
                <MdOutlineMail size={22} className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
                Subscribe
              </motion.span>
            )}
          </AnimatePresence>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
        </motion.button>
      </div>

      <p role="status" aria-live="polite" className="mt-2 h-5 text-[13px] text-[#a65335]">
        <AnimatePresence>
          {done && (
            <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="block">
              You&apos;re on the list. Watch your inbox for new arrivals.
            </motion.span>
          )}
        </AnimatePresence>
      </p>
    </form>
  );
}

export default function Footer() {
  return (
    <MotionConfig reducedMotion="user">
      <footer
        className="font-serif text-[#6a5a52]"
        style={{
          backgroundColor: "#f6ebe0",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      >
        <div className="mx-auto max-w-[1450px] px-6 pb-8 pt-14 sm:px-10 sm:pt-16 lg:px-[60px]">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-[1.45fr_1fr_1fr_1fr] lg:gap-x-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease }}
              className="sm:col-span-2 lg:col-span-1"
            >
              <Link to="/" aria-label="Athenura home" className={`inline-block rounded-md ${focusRing}`}>
                <motion.img
                  src={logo}
                  alt="Athenura"
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  className="h-12 w-auto sm:h-14"
                />
              </Link>
              <p className="mt-5 max-w-[470px] text-[16px] leading-[1.75] sm:text-[17px]">
                Curated paintings, sculptures, and custom artworks from local and independent artists &mdash; with a
                focus on preservation and appreciation of Indian art.
              </p>
              <Newsletter />
            </motion.div>

            {COLUMNS.map((col, i) => (
              <motion.div
                key={col.heading}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.12 + i * 0.1, ease }}
              >
                <h3 className="text-[24px] font-semibold leading-none text-[#2b1710]">{col.heading}</h3>
                <ul className="mt-6 space-y-[18px]">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink href={link.href} className="text-[16px] sm:text-[17px]">
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 border-t border-[#dccdbf] pt-8"
          >
            <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
              <p className="text-[15px] sm:text-[16px]">&copy; {new Date().getFullYear()} Athenura. All rights reserved.</p>

              <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
                <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[15px]">
                  {LEGAL.map((l) => (
                    <li key={l.label}>
                      <FooterLink href={l.href}>{l.label}</FooterLink>
                    </li>
                  ))}
                </ul>

                <ul className="flex items-center gap-5">
                  {SOCIALS.map(({ label, href, Icon }) => (
                    <li key={label}>
                      <motion.a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        whileHover={{ y: -4, scale: 1.12 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                        className={`flex text-[#6a5a52] transition-colors duration-200 hover:text-[#a65335] ${focusRing}`}
                      >
                        <Icon size={22} />
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </MotionConfig>
  );
}