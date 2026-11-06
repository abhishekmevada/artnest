import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ChevronDown, Mail, Lock, Cookie, Users, Database, Share2 } from "lucide-react";

const SECTIONS = [
  {
    id: "intro",
    icon: Shield,
    title: "1. Introduction",
    body: [
      "ArtNest (\"we\", \"us\", \"our\", \"the Platform\") operates a marketplace connecting independent artists with buyers and collectors of original art, sculptures and handmade work. This Privacy Policy explains what personal data we collect from Buyers, Artists and Visitors, why we collect it, how we use and protect it, and what choices you have.",
      "By creating an account, browsing artworks, listing artwork for sale, or otherwise using ArtNest, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of the Platform.",
    ],
  },
  {
    id: "data-we-collect",
    icon: Database,
    title: "2. Information We Collect",
    body: [
      "We collect different information depending on whether you use ArtNest as a Visitor, Buyer, Artist or Admin.",
    ],
    table: {
      headers: ["Category", "Examples", "Collected From"],
      rows: [
        ["Account details", "Full name, email address, phone number, password (hashed), profile photo", "Buyer / Artist registration"],
        ["Artist profile data", "Bio, specialty/medium, location, experience, website, portfolio images, exhibition history", "Artist Profile & Dashboard"],
        ["Artwork listings", "Title, description, category, medium, dimensions, price, images, availability status", "Add New Artwork form"],
        ["Order & payment data", "Shipping address, billing details, order history, payment method type, transaction reference", "Cart & Checkout"],
        ["Payment card / UPI details", "Processed directly by our payment gateway partner — ArtNest does not store full card numbers", "Checkout — Payment Method step"],
        ["Wishlist & browsing activity", "Saved artworks, followed artists, categories viewed, search queries", "Discover, Wishlist, Artist pages"],
        ["Commission requests", "Artwork type, description, reference images, budget, preferred size, deadline", "Custom Art / Commission page"],
        ["Reviews & messages", "Star ratings, written reviews, buyer–artist message threads", "Artwork Detail, Artist Dashboard — Messages"],
        ["Device & usage data", "IP address, browser type, device identifiers, pages visited, session duration", "Automatically, via cookies and server logs"],
      ],
    },
  },
  {
    id: "how-we-use",
    icon: Users,
    title: "3. How We Use Your Information",
    bullets: [
      "Create and manage Buyer, Artist and Admin accounts, including role-based access control.",
      "Process orders, payments, shipping, refunds and order tracking.",
      "Display artist portfolios, artwork listings and search/filter results.",
      "Operate the Wishlist, Cart, Follow, Review and Commission features.",
      "Verify new Artist applications through our Pending Artist Verification review process.",
      "Send transactional emails — order confirmations, shipping updates, commission responses, password resets.",
      "Send optional marketing communications about new artists, collections or features (you can opt out anytime).",
      "Detect fraud, enforce our Terms of Service, and moderate reported listings.",
      "Generate anonymised analytics to improve site performance, page layout and recommendations.",
    ],
  },
  {
    id: "sharing",
    icon: Share2,
    title: "4. How We Share Your Information",
    body: [
      "We do not sell your personal data. We share information only in the following circumstances:",
    ],
    bullets: [
      "Between Buyers and Artists — your name, shipping city and order details are shared with the relevant Artist to fulfil an order; your public profile (name, avatar, reviews) is visible to other users.",
      "Service providers — payment gateways (for processing UPI, card and net banking payments), Cloudinary or an equivalent image-hosting service (for storing artwork and profile images), and email/SMS providers (for notifications).",
      "Legal & safety — where required by law, court order, or to protect the rights, property or safety of ArtNest, our users or the public.",
      "Business transfers — in the event of a merger, acquisition or sale of assets, user data may be transferred as part of that transaction, subject to this policy.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "5. Cookies & Tracking",
    body: [
      "ArtNest uses cookies and similar technologies to keep you logged in (JWT session tokens), remember cart/wishlist contents between visits, and understand aggregate site usage.",
    ],
    table: {
      headers: ["Cookie Type", "Purpose", "Duration"],
      rows: [
        ["Essential", "Authentication (JWT), cart & checkout session, security", "Session / up to 30 days"],
        ["Preference", "Remembers filters, sort order, view (grid/list), theme", "Up to 90 days"],
        ["Analytics", "Aggregated, anonymised usage patterns to improve the Platform", "Up to 12 months"],
      ],
    },
    body2: [
      "You can disable non-essential cookies through your browser settings. Disabling essential cookies may prevent core features like login and checkout from working correctly.",
    ],
  },
  {
    id: "security",
    icon: Lock,
    title: "6. Data Security",
    bullets: [
      "Passwords are hashed and never stored in plain text.",
      "Authentication uses JWT (JSON Web Tokens) with role-based authorization for Buyer, Artist and Admin access.",
      "All data in transit is encrypted via HTTPS/TLS.",
      "Uploaded images and files are validated and stored securely via our image-hosting provider.",
      "Admin access to sensitive data is restricted and logged.",
      "While we take reasonable technical and organisational measures to protect your data, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "retention",
    title: "7. Data Retention",
    body: [
      "We retain account and order data for as long as your account is active and as needed to comply with legal, accounting and tax obligations. Order and payment records are typically retained for at least the statutory period required under applicable law. You may request deletion of your account at any time (see Section 9); some order records may be retained in anonymised form for legal and reporting purposes.",
    ],
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    body: [
      "ArtNest is not directed at children under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has created an account, please contact us and we will take steps to remove the associated data.",
    ],
  },
  {
    id: "rights",
    title: "9. Your Rights & Choices",
    bullets: [
      "Access — request a copy of the personal data we hold about you.",
      "Correction — update your profile, artist bio, or account details at any time from your Profile / Settings page.",
      "Deletion — request permanent deletion of your account and associated personal data, subject to legal retention requirements.",
      "Opt-out — unsubscribe from marketing emails via the link in any email, or manage notification preferences in Settings.",
      "Portability — request your data in a structured, commonly-used format.",
      "To exercise any of these rights, contact us using the details in Section 12.",
    ],
  },
  {
    id: "artist-specific",
    title: "10. Additional Notice for Artists",
    body: [
      "As an Artist, your public profile — including your name, bio, specialty, location, portfolio images and star rating — is visible to all Platform visitors. Sales, earnings and payout information shown in your Artist Dashboard is private and visible only to you and Platform Admins. Reference images and requirements submitted through incoming Custom Requests are shared only with the Artist the commission was addressed to.",
    ],
  },
  {
    id: "third-party",
    title: "11. Third-Party Links",
    body: [
      "Artist profiles or listings may occasionally link to external websites (e.g. an artist's personal portfolio). ArtNest is not responsible for the privacy practices of third-party sites, and we encourage you to review their policies separately.",
    ],
  },
  {
    id: "changes",
    title: "12. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational or regulatory reasons. Material changes will be notified via email or an in-app notice. The \"Last Updated\" date below reflects the most recent revision.",
    ],
  },
];

function Section({ section }) {
  const [open, setOpen] = useState(true);
  const Icon = section.icon;
  return (
    <div className="priv-section" id={section.id}>
      <button className="priv-section-head" onClick={() => setOpen((o) => !o)} type="button">
        <span className="priv-section-title">
          {Icon && (
            <span className="priv-section-icon">
              <Icon size={16} strokeWidth={1.8} />
            </span>
          )}
          {section.title}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} strokeWidth={1.8} />
        </motion.span>
      </button>

      {open && (
        <motion.div
          className="priv-section-body"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25 }}
        >
          {section.body?.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          {section.table && (
            <div className="priv-table-wrap">
              <table className="priv-table">
                <thead>
                  <tr>
                    {section.table.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section.body2?.map((p, i) => (
            <p key={`b2-${i}`}>{p}</p>
          ))}

          {section.bullets && (
            <ul className="priv-bullets">
              {section.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function Privacy() {
  return (
    <div className="priv-app">
      <section className="priv-hero">
        <div className="priv-hero-inner">
          <span className="priv-hero-badge">
            <Shield size={14} strokeWidth={1.8} />
            Your data, handled with care
          </span>
          <h1>Privacy Policy</h1>
          <p>
            How ArtNest collects, uses and protects the information of every Buyer, Artist
            and Visitor on the platform.
          </p>
          <p className="priv-updated">Last Updated: September 16, 2026</p>
        </div>
      </section>

      <div className="priv-shell">
        <aside className="priv-toc">
          <h4>On this page</h4>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ul>
          <div className="priv-toc-contact">
            <Mail size={16} strokeWidth={1.8} />
            <div>
              <p>Questions about your data?</p>
              <a href="mailto:privacy@artnest.example">privacy@artnest.example</a>
            </div>
          </div>
        </aside>

        <main className="priv-main">
          {SECTIONS.map((s) => (
            <Section key={s.id} section={s} />
          ))}

          <div className="priv-footer-note">
            <p>
              This policy is provided as a general template for the ArtNest platform and
              should be reviewed by a qualified legal professional before publishing, to
              ensure compliance with applicable data protection laws (e.g. India's DPDP
              Act, GDPR, or other regional regulations relevant to your users).
            </p>
          </div>
        </main>
      </div>

      <style>{`
        .priv-app {
          --ink: #1c1712;
          --ink-soft: #4a423a;
          --paper: #f6f1e6;
          --paper-2: #efe6d3;
          --line: #ddd0b8;
          --brass: #96702f;
          --brass-deep: #6f5222;
          --wine: #5c2b30;
          --serif: "Fraunces", "Iowan Old Style", Georgia, serif;
          --sans: "Work Sans", "Inter", system-ui, sans-serif;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--sans);
          min-height: 100vh;
        }
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');
        .priv-app * { box-sizing: border-box; }

        .priv-hero {
          background: linear-gradient(180deg, #241b12 0%, #1c1712 100%);
          color: var(--paper);
          padding: 72px 28px 56px;
          text-align: center;
        }
        .priv-hero-inner { max-width: 640px; margin: 0 auto; }
        .priv-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(246,241,230,.1); border: 1px solid rgba(246,241,230,.2);
          padding: 7px 16px; border-radius: 999px; font-size: 12.5px;
          color: #d9c48f; margin-bottom: 20px;
        }
        .priv-hero h1 {
          font-family: var(--serif); font-weight: 500;
          font-size: clamp(32px, 5vw, 46px); margin: 0 0 14px; letter-spacing: -0.01em;
        }
        .priv-hero p { font-size: 15.5px; color: #e7ddc9; line-height: 1.6; margin: 0 auto 10px; max-width: 480px; }
        .priv-updated { font-size: 13px; color: #a3946f !important; }

        .priv-shell {
          display: grid; grid-template-columns: 240px 1fr; gap: 40px;
          max-width: 1120px; margin: 0 auto; padding: 48px 28px 90px;
        }

        .priv-toc {
          position: sticky; top: 24px; align-self: start;
          padding: 20px; background: var(--paper-2); border: 1px solid var(--line); border-radius: 14px;
        }
        .priv-toc h4 {
          font-family: var(--serif); font-weight: 500; font-size: 14px; margin: 0 0 12px; color: var(--ink);
        }
        .priv-toc ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .priv-toc a {
          font-size: 12.5px; color: var(--ink-soft); text-decoration: none; line-height: 1.4;
        }
        .priv-toc a:hover { color: var(--brass-deep); }
        .priv-toc-contact {
          margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line);
          display: flex; gap: 10px;
        }
        .priv-toc-contact svg { color: var(--brass-deep); flex-shrink: 0; margin-top: 2px; }
        .priv-toc-contact p { font-size: 12px; color: var(--ink-soft); margin: 0 0 3px; }
        .priv-toc-contact a { font-size: 12.5px; color: var(--wine); font-weight: 600; text-decoration: underline; }

        .priv-main { display: flex; flex-direction: column; gap: 14px; }

        .priv-section {
          background: var(--paper-2); border: 1px solid var(--line); border-radius: 14px;
          overflow: hidden; scroll-margin-top: 24px;
        }
        .priv-section-head {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          background: none; border: none; cursor: pointer; padding: 18px 20px;
          font-family: var(--serif); font-size: 17px; font-weight: 500; color: var(--brass-deep);
          text-align: left;
        }
        .priv-section-title { display: flex; align-items: center; gap: 10px; }
        .priv-section-icon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%; background: var(--paper);
          color: var(--brass-deep); flex-shrink: 0;
        }
        .priv-section-head svg:last-child { color: var(--ink-soft); flex-shrink: 0; }

        .priv-section-body { padding: 0 22px 22px; }
        .priv-section-body p {
          font-size: 14px; line-height: 1.7; color: var(--ink-soft); margin: 0 0 12px;
        }
        .priv-bullets { margin: 6px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
        .priv-bullets li { font-size: 13.5px; line-height: 1.6; color: var(--ink-soft); }

        .priv-table-wrap { overflow-x: auto; margin: 10px 0 14px; border: 1px solid var(--line); border-radius: 10px; }
        .priv-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .priv-table th {
          text-align: left; background: var(--paper); color: var(--ink);
          font-weight: 600; padding: 10px 14px; border-bottom: 1px solid var(--line); white-space: nowrap;
        }
        .priv-table td {
          padding: 10px 14px; border-bottom: 1px solid var(--line); color: var(--ink-soft); vertical-align: top;
        }
        .priv-table tr:last-child td { border-bottom: none; }

        .priv-footer-note {
          margin-top: 10px; padding: 18px 20px; background: rgba(150,112,47,.08);
          border: 1px dashed var(--brass); border-radius: 12px;
        }
        .priv-footer-note p { font-size: 12.5px; line-height: 1.6; color: var(--ink-soft); margin: 0; }

        @media (max-width: 900px) {
          .priv-shell { grid-template-columns: 1fr; gap: 24px; padding: 40px 24px 70px; }
          .priv-toc {
            position: static;
            display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px 28px;
          }
          .priv-toc ul {
            flex-direction: row; flex-wrap: wrap; gap: 8px 16px; flex: 1 1 auto;
          }
          .priv-toc-contact { margin-top: 0; padding-top: 0; border-top: none; flex: 0 0 auto; }
        }

        @media (max-width: 600px) {
          .priv-hero { padding: 56px 18px 36px; }
          .priv-hero-badge { font-size: 11.5px; padding: 6px 12px; }
          .priv-hero p { font-size: 14px; }
          .priv-shell { padding: 28px 16px 56px; gap: 20px; }
          .priv-toc { padding: 16px; }
          .priv-toc ul { flex-direction: column; gap: 8px; }
          .priv-section-head { padding: 14px 16px; font-size: 15px; gap: 8px; }
          .priv-section-icon { width: 24px; height: 24px; }
          .priv-section-body { padding: 0 16px 16px; }
          .priv-section-body p,
          .priv-bullets li { font-size: 13px; }
          .priv-table { font-size: 12px; }
          .priv-table th, .priv-table td { padding: 8px 10px; }
        }

        @media (max-width: 375px) {
          .priv-hero h1 { font-size: 28px; }
          .priv-shell { padding: 24px 12px 48px; }
          .priv-section-head { font-size: 14px; }
        }

        @media (max-height: 650px) and (min-width: 700px) {
          .priv-hero { padding: 40px 28px 32px; }
          .priv-toc { position: static; }
        }

        .priv-table td, .priv-table th { word-break: break-word; }
        img { max-width: 100%; }
      `}</style>
    </div>
  );
}