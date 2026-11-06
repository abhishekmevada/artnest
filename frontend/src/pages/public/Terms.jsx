import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  ChevronDown,
  Mail,
  ScrollText,
  UserCheck,
  ShoppingBag,
  Palette,
  Ban,
  Copyright,
  CreditCard,
  Truck,
  Star,
  Handshake,
  Server,
  UserX,
  AlertTriangle,
  Gavel,
  RefreshCw,
  Lock,
} from "lucide-react";

const SECTIONS = [
  {
    id: "acceptance",
    icon: ScrollText,
    title: "1. Acceptance of These Terms",
    body: [
      "These Terms of Service (\"Terms\") govern your access to and use of ArtNest (\"we\", \"us\", \"our\", \"the Platform\"), a marketplace connecting independent artists with buyers and collectors of original art, sculptures and handmade work.",
      "By creating an account, browsing artworks, listing artwork for sale, placing an order, or otherwise using ArtNest in any capacity, you confirm that you have read, understood and agree to be bound by these Terms, our Privacy Policy, and any additional guidelines or policies referenced here. If you do not agree to these Terms, you must discontinue use of the Platform immediately.",
      "These Terms apply equally to Visitors, Buyers, Artists and Admins. Where a clause applies to only one role, this is stated explicitly.",
    ],
  },
  {
    id: "definitions",
    icon: Scale,
    title: "2. Definitions",
    body: [
      "For the purposes of these Terms, the following definitions apply throughout the document:",
    ],
    table: {
      headers: ["Term", "Meaning"],
      rows: [
        ["Platform", "The ArtNest website, mobile experience, dashboards, APIs and all related services."],
        ["Visitor", "Any person who browses the Platform without creating an account."],
        ["Buyer", "A registered user who browses, wishlists, purchases or commissions artwork."],
        ["Artist", "A user whose seller application has been approved by ArtNest and who may list artwork for sale."],
        ["Admin", "An authorised member of the ArtNest team operating the Admin Dashboard."],
        ["Content", "Any artwork images, photographs, text, descriptions, reviews, messages, bios or other material uploaded to or generated on the Platform."],
        ["Listing", "An artwork, sculpture or handmade item published by an Artist for sale on the Platform."],
        ["Commission", "A custom, made-to-order artwork requested by a Buyer through the Custom Art page."],
        ["Order", "A confirmed purchase of one or more Listings, or an accepted Commission."],
        ["Payout", "The transfer of an Artist's earnings, net of applicable fees, to their nominated account."],
      ],
    },
  },
  {
    id: "eligibility",
    icon: UserCheck,
    title: "3. Eligibility & Account Registration",
    bullets: [
      "You must be at least 18 years of age to create an account, purchase artwork, or apply to sell as an Artist. ArtNest is not directed at minors.",
      "You must provide accurate, current and complete information during registration, and keep it up to date from your Profile / Settings page.",
      "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.",
      "Passwords are hashed and never stored in plain text. You must not share your credentials or transfer your account to another person.",
      "One person or legal entity may not maintain more than one Buyer account. Artists may hold a single Buyer account and a single Artist account linked to the same identity.",
      "You must notify us immediately at legal@artnest.example if you suspect unauthorised access to or use of your account.",
      "We reserve the right to refuse registration, or to suspend or terminate an account, where information provided is false, misleading, or where these Terms have been breached.",
    ],
  },
  {
    id: "buyer-terms",
    icon: ShoppingBag,
    title: "4. Buyer Terms",
    body: [
      "As a Buyer, you may browse artworks and sculptures, save items to your Wishlist, purchase through Cart & Checkout, track orders, follow artists, leave reviews, and submit custom commission requests.",
    ],
    bullets: [
      "Placing an order constitutes an offer to purchase the Listing at the price displayed at the time of checkout, subject to acceptance and availability.",
      "Artwork listings may be one-of-a-kind. If two orders are placed for the same original piece due to a timing conflict, the earlier confirmed payment takes precedence and the later order will be cancelled and refunded in full.",
      "You are responsible for providing a complete and accurate shipping address. ArtNest and the Artist are not liable for failed delivery caused by incorrect address details supplied at checkout.",
      "You must not use the Platform to harass artists, submit abusive messages, or make repeated commission requests with no genuine intention to proceed.",
      "Reviews and ratings must reflect your genuine experience. Reviews that are defamatory, abusive, promotional, or unrelated to an actual transaction may be removed.",
      "Attempting to transact with an Artist outside the Platform to avoid fees — after discovering them through ArtNest — is a breach of these Terms and may result in account suspension.",
    ],
  },
  {
    id: "artist-terms",
    icon: Palette,
    title: "5. Artist Terms",
    body: [
      "Artists are required to apply and be approved before their account becomes live. Applications are reviewed by the ArtNest Admin team through the Pending Artist Verification queue.",
    ],
    bullets: [
      "You must apply with accurate details — full name, email, specialty or medium, and a portfolio link or sample image upload. Applications containing plagiarised, misrepresented or stolen work will be rejected.",
      "On approval, you gain access to the Artist Dashboard, including My Artworks, Orders, Messages, Followers, Earnings, Custom Requests, Analytics, Profile and Settings.",
      "You warrant that every Listing you publish is your own original work, is accurately described, and does not infringe any third party's intellectual property, moral or privacy rights.",
      "Listing details — title, category, medium, dimensions, price, availability status and images — must be truthful and kept current. Sold works must be marked unavailable promptly.",
      "You are solely responsible for packaging, shipping, insurance where appropriate, and any applicable taxes on your sales, subject to the shipping rules configured on the Platform.",
      "You must respond to buyer enquiries and incoming Custom Requests within a reasonable time. Repeated non-responsiveness may affect your visibility or account standing.",
      "Earnings shown in your Dashboard reflect gross sales less applicable Platform fees and payment-gateway charges, and are subject to the payout schedule set out in Section 8.",
      "ArtNest may feature, promote, or include your public profile and Listings in curated Collections and marketing materials unless you notify us otherwise in writing.",
    ],
  },
  {
    id: "commissions",
    icon: Handshake,
    title: "6. Custom Commissions",
    body: [
      "The Custom Art page allows Buyers to request a bespoke piece. Submitting the form (artwork type, description, preferred style, reference images, budget, size, deadline and notes) constitutes a request, not a binding order.",
    ],
    bullets: [
      "The Artist may accept, decline or respond with a quote. A Commission becomes binding only when the Buyer approves the quote and any required deposit is received.",
      "Reference images supplied by the Buyer must not infringe third-party rights. By uploading them you confirm you have the right to share them for the purpose of the commission.",
      "Artists must not reproduce copyrighted characters, logos or protected works in a Commission.",
      "Unless otherwise agreed in writing, a Commission does not include commercial or resale rights, which remain with the Artist.",
      "Deposits and cancellation terms for Commissions are set out in Section 9. Where work has already begun, deposits are generally non-refundable.",
    ],
  },
  {
    id: "prohibited",
    icon: Ban,
    title: "7. Prohibited Conduct & Prohibited Content",
    body: [
      "The following are strictly prohibited on ArtNest. Violation may result in immediate removal of content, suspension or permanent termination, and where appropriate, referral to law enforcement.",
    ],
    table: {
      headers: ["Category", "Examples"],
      rows: [
        ["Counterfeit & stolen work", "Listing another artist's work, AI-generated output misrepresented as handmade, reproductions sold as originals, prints sold as paintings"],
        ["Illegal content", "Content that is unlawful, defamatory, obscene, hateful, or that depicts illegal activity"],
        ["Harassment", "Abusive messages, threats, discriminatory language, or targeted harassment of any user"],
        ["Fraud & manipulation", "Fake orders, fake reviews, self-purchasing to inflate ratings, payment fraud, chargeback abuse"],
        ["Off-platform circumvention", "Sharing payment details or contact information to complete a transaction outside ArtNest to avoid fees"],
        ["Platform abuse", "Scraping, bots, automated bulk downloading, attempted unauthorised access to APIs, dashboards or admin routes"],
        ["Impersonation", "Misrepresenting yourself as another artist, user, or as a member of the ArtNest team"],
        ["Spam", "Unsolicited promotional messages, bulk enquiries, or misleading listing metadata to manipulate search"],
      ],
    },
  },
  {
    id: "ip",
    icon: Copyright,
    title: "8. Intellectual Property & Content Ownership",
    body: [
      "Ownership of content on ArtNest is divided as follows. Nothing in these Terms transfers ownership of an Artist's work to ArtNest or to a Buyer beyond the specific rights described below.",
    ],
    table: {
      headers: ["Content", "Owner", "Rights Granted to ArtNest"],
      rows: [
        ["Artwork images & listings", "The Artist", "A non-exclusive, worldwide, royalty-free licence to host, display, resize, crop and promote the content on the Platform and in marketing"],
        ["Artist profile & bio", "The Artist", "Same as above, for display on public profile, artist directory and curated Collections"],
        ["Reviews & messages", "The user who posted them", "A licence to store, display and moderate the content on the Platform"],
        ["Buyer account data", "The Buyer", "Used strictly as described in the Privacy Policy"],
        ["Platform design, code, logo & brand", "ArtNest", "All rights reserved. May not be copied or reused without written permission"],
      ],
    },
    body2: [
      "When a Buyer purchases an original artwork, ownership of the physical piece transfers to the Buyer on delivery. Copyright and reproduction rights remain with the Artist unless a separate written agreement states otherwise. Buyers may not reproduce, print or resell purchased artwork commercially without the Artist's explicit permission.",
    ],
  },
  {
    id: "fees",
    icon: CreditCard,
    title: "9. Fees, Payments & Payouts",
    body: [
      "ArtNest charges fees for use of the marketplace. The applicable rates are displayed in your Artist Dashboard and at checkout, and are summarised below for reference.",
    ],
    table: {
      headers: ["Item", "Paid By", "Notes"],
      rows: [
        ["Artwork price", "Buyer", "Set by the Artist; shown on the Listing and at checkout"],
        ["Platform commission", "Artist", "A percentage of each sale, deducted from gross before payout (rate shown in Dashboard — illustrative template value: 10%)"],
        ["Payment gateway charges", "Artist / Buyer", "Charged by the payment provider; non-refundable on refunded transactions in most cases"],
        ["Buyer service fee", "Buyer", "Where applicable, shown as a separate line in the Order Summary before payment"],
        ["Shipping", "Buyer", "Set per Listing or per order, displayed in the Order Summary"],
        ["Payout processing", "Artist", "Any bank or transfer fees applied by the payout provider"],
        ["Commission deposit", "Buyer", "Agreed with the Artist before work begins; adjusted against the final price"],
      ],
    },
    body2: [
      "Accepted payment methods are UPI, Credit / Debit Card, Net Banking and Cash on Delivery, as made available at checkout. Card and UPI details are processed directly by our payment gateway partner — ArtNest does not store full card numbers.",
      "Artists must maintain valid payout details in Settings. Payouts are released on the schedule shown in the Earnings tab, after the return or dispute window for the relevant order has closed. ArtNest may withhold a payout where an order is under dispute, suspected fraud, or a chargeback investigation.",
      "All prices are displayed in the currency shown at checkout. Artists are responsible for determining and remitting any taxes applicable to their sales.",
    ],
  },
  {
    id: "shipping-refunds",
    icon: Truck,
    title: "10. Shipping, Returns, Refunds & Cancellations",
    body: [
      "Because ArtNest sells original, frequently one-of-a-kind works, return and refund rules differ from those of mass-market retailers. The table below summarises the standard positions.",
    ],
    table: {
      headers: ["Scenario", "Window", "Outcome"],
      rows: [
        ["Artwork not as described", "Within 7 days of delivery", "Full refund or return, on provision of photos evidencing the discrepancy"],
        ["Damaged in transit", "Within 48 hours of delivery", "Full refund or replacement where feasible; photographic evidence and original packaging required"],
        ["Change of mind — original artwork", "Not applicable", "Original, one-of-a-kind works are generally non-returnable once delivered"],
        ["Made-to-order / Commission", "Not applicable", "Non-refundable once work has begun; deposits are non-refundable"],
        ["Cancellation before dispatch", "Before shipping", "Full refund, provided the Artist has not begun bespoke work"],
        ["Non-delivery due to incorrect address", "Not applicable", "Not refundable; re-shipping is at the Buyer's cost"],
        ["Lost in transit (tracked)", "After carrier investigation", "Refunded in full where the carrier confirms loss"],
      ],
    },
    body2: [
      "Refunds are issued to the original payment method. Cash on Delivery orders are refunded via bank transfer to details supplied by the Buyer. Refunds may take 5–10 business days to appear depending on your bank or payment provider.",
      "ArtNest reserves the right to mediate any dispute between a Buyer and an Artist, and to issue a refund where evidence supports it. Decisions made in good faith following review of order records, tracking data and photographic evidence are final at the platform level.",
    ],
  },
  {
    id: "reviews",
    icon: Star,
    title: "11. Reviews, Ratings & User Content",
    bullets: [
      "Reviews may only be left by Buyers who have completed a purchase or commission with the relevant Artist.",
      "Reviews must be honest, relevant and respectful. ArtNest does not edit the substance of a review, but may remove content that breaches Section 7.",
      "Artists may respond to reviews publicly or contact the Buyer through Messages, but must not offer incentives, refunds or discounts in exchange for a review being changed or removed.",
      "ArtNest may remove reviews that are demonstrably fake, submitted by a competitor, or part of a coordinated manipulation attempt, and may suspend accounts involved.",
      "By posting Content, you grant ArtNest the licence described in Section 8 and confirm that the Content does not infringe any third-party rights.",
    ],
  },
  {
    id: "disputes",
    icon: Gavel,
    title: "12. Disputes Between Buyers & Artists",
    body: [
      "ArtNest provides a messaging system and a mediation process for disputes arising from an order. Where a dispute cannot be resolved directly between the parties:",
    ],
    bullets: [
      "Either party may escalate the matter to ArtNest support, providing the order ID, tracking details and any supporting photographs.",
      "ArtNest will review the order record, messages, tracking data and any evidence provided, and will issue a determination in good faith.",
      "Where a determination is made in the Buyer's favour, ArtNest may issue a refund from the transaction and adjust the Artist's earnings accordingly.",
      "Where a determination is made in the Artist's favour, the payout proceeds as scheduled.",
      "ArtNest is a marketplace, not a party to the sale contract between Buyer and Artist, and acts as a mediator rather than an arbitrator in these proceedings.",
    ],
  },
  {
    id: "availability",
    icon: Server,
    title: "13. Platform Availability & Modifications",
    bullets: [
      "We aim to keep ArtNest available at all times but do not guarantee uninterrupted, error-free or secure access.",
      "We may perform maintenance, updates, migrations or emergency fixes that temporarily interrupt access, with or without notice.",
      "We may add, modify, or discontinue features — including dashboards, filters, collections or payment methods — at any time.",
      "We are not liable for any loss arising from downtime, data transmission failure, or your inability to access the Platform.",
    ],
  },
  {
    id: "termination",
    icon: UserX,
    title: "14. Suspension & Termination",
    body: [
      "You may close your account at any time from your Profile / Settings page. Artists with pending orders or unresolved disputes should complete those obligations first.",
    ],
    bullets: [
      "ArtNest may suspend or permanently terminate an account, remove Listings, or restrict access where these Terms, our Privacy Policy, or applicable law have been breached.",
      "Grounds for immediate termination include fraud, counterfeit listings, harassment, off-platform circumvention, repeated intellectual-property infringement, and attempted unauthorised access to Admin or API routes.",
      "Where an account is terminated for cause, pending payouts may be withheld pending investigation and adjustment for any refunds owed to Buyers.",
      "On termination, your licence to use the Platform ends immediately. Sections 7, 8, 10, 12, 15, 16 and 17 survive termination.",
      "If you believe a suspension was applied in error, you may appeal by contacting legal@artnest.example with your account details and an explanation.",
    ],
  },
  {
    id: "disclaimers",
    icon: AlertTriangle,
    title: "15. Disclaimers & Limitation of Liability",
    body: [
      "ArtNest is provided on an \"as is\" and \"as available\" basis. To the fullest extent permitted by law, we disclaim all warranties, express or implied, including fitness for a particular purpose, accuracy of listings, and uninterrupted availability.",
      "We do not warrant that any Listing is accurate, that an Artist will complete a Commission to your satisfaction, or that any artwork will meet your expectations. We do not independently authenticate every artwork listed on the Platform beyond the verification steps described in these Terms.",
    ],
    bullets: [
      "To the maximum extent permitted by law, ArtNest's total liability arising out of or relating to these Terms or the Platform shall not exceed the greater of (a) the total fees retained by ArtNest on the transaction giving rise to the claim, or (b) INR 10,000.",
      "ArtNest is not liable for indirect, incidental, special, consequential or punitive damages, including lost profits, lost data, or loss of goodwill.",
      "Nothing in these Terms excludes liability that cannot be excluded under applicable law, including liability for fraud or wilful misconduct.",
    ],
  },
  {
    id: "indemnity",
    icon: Lock,
    title: "16. Indemnification",
    body: [
      "You agree to indemnify, defend and hold harmless ArtNest, its officers, employees, and agents from any claims, damages, losses, liabilities and expenses (including reasonable legal fees) arising from: (a) your breach of these Terms; (b) your Content, including any claim that it infringes third-party rights; (c) your transactions with other users; or (d) your violation of any applicable law or the rights of a third party.",
    ],
  },
  {
    id: "governing-law",
    icon: Gavel,
    title: "17. Governing Law & Changes to These Terms",
    body: [
      "These Terms are governed by and construed in accordance with the laws of India, without regard to conflict-of-law principles. Subject to Section 12, the courts at the jurisdiction where ArtNest is registered shall have exclusive jurisdiction over any dispute arising from these Terms.",
      "We may update these Terms from time to time to reflect changes in our practices, features, fees or legal requirements. Material changes will be notified by email or an in-app notice at least 7 days before they take effect. Continued use of the Platform after the effective date constitutes acceptance of the revised Terms.",
      "If any provision of these Terms is found to be unenforceable, the remaining provisions remain in full force and effect.",
      "The \"Last Updated\" date below reflects the most recent revision of this document.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "18. Contact Us",
    body: [
      "Questions about these Terms, an appeal against a suspension, a legal notice, or a request relating to your data should be directed to the addresses below. We aim to respond to all formal enquiries within 7 business days.",
    ],
    table: {
      headers: ["Reason for Contact", "Address"],
      rows: [
        ["General support & order issues", "support@artnest.example"],
        ["Legal notices & Terms questions", "legal@artnest.example"],
        ["Privacy & data requests", "privacy@artnest.example"],
        ["Artist verification appeals", "artists@artnest.example"],
        ["Reported listings & IP infringement", "trust@artnest.example"],
      ],
    },
    bullets: [
      "Include your account email, order ID (where relevant), and a clear description of the matter.",
      "For intellectual-property complaints, include proof of ownership and the specific Listing URL.",
    ],
  },
];

function Section({ section }) {
  const [open, setOpen] = useState(true);
  const Icon = section.icon;
  return (
    <div className="tos-section" id={section.id}>
      <button className="tos-section-head" onClick={() => setOpen((o) => !o)} type="button">
        <span className="tos-section-title">
          {Icon && (
            <span className="tos-section-icon">
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
          className="tos-section-body"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25 }}
        >
          {section.body?.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          {section.table && (
            <div className="tos-table-wrap">
              <table className="tos-table">
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
            <ul className="tos-bullets">
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

export default function Terms() {
  return (
    <div className="tos-app">
      <section className="tos-hero">
        <div className="tos-hero-inner">
          <span className="tos-hero-badge">
            <Scale size={14} strokeWidth={1.8} />
            Fair terms for makers and collectors
          </span>
          <h1>Terms of Service</h1>
          <p>
            The rules that govern buying, selling, commissioning and browsing on ArtNest —
            for Buyers, Artists, Visitors and Admins alike.
          </p>
          <p className="tos-updated">Last Updated: September 16, 2026</p>
        </div>
      </section>

      <div className="tos-shell">
        <aside className="tos-toc">
          <h4>On this page</h4>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ul>
          <div className="tos-toc-contact">
            <Mail size={16} strokeWidth={1.8} />
            <div>
              <p>Questions about these terms?</p>
              <a href="mailto:legal@artnest.example">legal@artnest.example</a>
            </div>
          </div>
        </aside>

        <main className="tos-main">
          {SECTIONS.map((s) => (
            <Section key={s.id} section={s} />
          ))}

          <div className="tos-footer-note">
            <p>
              This document is provided as a general template for the ArtNest platform and
              should be reviewed by a qualified legal professional before publishing, to
              ensure compliance with applicable consumer-protection, e-commerce and
              data-protection laws (e.g. India's Consumer Protection (E-Commerce) Rules,
              the DPDP Act, GDPR, or other regional regulations relevant to your users).
              Placeholder figures such as commission rates and liability caps should be
              confirmed against your final commercial model.
            </p>
          </div>
        </main>
      </div>

      <style>{`
        .tos-app {
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
        .tos-app * { box-sizing: border-box; }

        .tos-hero {
          background: linear-gradient(180deg, #241b12 0%, #1c1712 100%);
          color: var(--paper);
          padding: 72px 28px 56px;
          text-align: center;
        }
        .tos-hero-inner { max-width: 660px; margin: 0 auto; }
        .tos-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(246,241,230,.1); border: 1px solid rgba(246,241,230,.2);
          padding: 7px 16px; border-radius: 999px; font-size: 12.5px;
          color: #d9c48f; margin-bottom: 20px;
        }
        .tos-hero h1 {
          font-family: var(--serif); font-weight: 500;
          font-size: clamp(32px, 5vw, 46px); margin: 0 0 14px; letter-spacing: -0.01em;
        }
        .tos-hero p { font-size: 15.5px; color: #e7ddc9; line-height: 1.6; margin: 0 auto 10px; max-width: 520px; }
        .tos-updated { font-size: 13px; color: #a3946f !important; }

        .tos-shell {
          display: grid; grid-template-columns: 240px 1fr; gap: 40px;
          max-width: 1120px; margin: 0 auto; padding: 48px 28px 90px;
        }

        .tos-toc {
          position: sticky; top: 24px; align-self: start;
          padding: 20px; background: var(--paper-2); border: 1px solid var(--line); border-radius: 14px;
        }
        .tos-toc h4 {
          font-family: var(--serif); font-weight: 500; font-size: 14px; margin: 0 0 12px; color: var(--ink);
        }
        .tos-toc ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .tos-toc a {
          font-size: 12.5px; color: var(--ink-soft); text-decoration: none; line-height: 1.4;
        }
        .tos-toc a:hover { color: var(--brass-deep); }
        .tos-toc-contact {
          margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line);
          display: flex; gap: 10px;
        }
        .tos-toc-contact svg { color: var(--brass-deep); flex-shrink: 0; margin-top: 2px; }
        .tos-toc-contact p { font-size: 12px; color: var(--ink-soft); margin: 0 0 3px; }
        .tos-toc-contact a { font-size: 12.5px; color: var(--wine); font-weight: 600; text-decoration: underline; }

        .tos-main { display: flex; flex-direction: column; gap: 14px; }

        .tos-section {
          background: var(--paper-2); border: 1px solid var(--line); border-radius: 14px;
          overflow: hidden; scroll-margin-top: 24px;
        }
        .tos-section-head {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          background: none; border: none; cursor: pointer; padding: 18px 20px;
          font-family: var(--serif); font-size: 17px; font-weight: 500; color: var(--brass-deep);
          text-align: left;
        }
        .tos-section-title { display: flex; align-items: center; gap: 10px; }
        .tos-section-icon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%; background: var(--paper);
          color: var(--brass-deep); flex-shrink: 0;
        }
        .tos-section-head svg:last-child { color: var(--ink-soft); flex-shrink: 0; }

        .tos-section-body { padding: 0 22px 22px; }
        .tos-section-body p {
          font-size: 14px; line-height: 1.7; color: var(--ink-soft); margin: 0 0 12px;
        }
        .tos-bullets { margin: 6px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
        .tos-bullets li { font-size: 13.5px; line-height: 1.6; color: var(--ink-soft); }

        .tos-table-wrap { overflow-x: auto; margin: 10px 0 14px; border: 1px solid var(--line); border-radius: 10px; }
        .tos-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .tos-table th {
          text-align: left; background: var(--paper); color: var(--ink);
          font-weight: 600; padding: 10px 14px; border-bottom: 1px solid var(--line); white-space: nowrap;
        }
        .tos-table td {
          padding: 10px 14px; border-bottom: 1px solid var(--line); color: var(--ink-soft); vertical-align: top;
        }
        .tos-table tr:last-child td { border-bottom: none; }

        .tos-footer-note {
          margin-top: 10px; padding: 18px 20px; background: rgba(150,112,47,.08);
          border: 1px dashed var(--brass); border-radius: 12px;
        }
        .tos-footer-note p { font-size: 12.5px; line-height: 1.6; color: var(--ink-soft); margin: 0; }

        @media (max-width: 900px) {
          .tos-shell { grid-template-columns: 1fr; gap: 24px; padding: 40px 24px 70px; }
          .tos-toc {
            position: static;
            display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px 28px;
          }
          .tos-toc ul {
            flex-direction: row; flex-wrap: wrap; gap: 8px 16px; flex: 1 1 auto;
          }
          .tos-toc-contact { margin-top: 0; padding-top: 0; border-top: none; flex: 0 0 auto; }
        }

        @media (max-width: 600px) {
          .tos-hero { padding: 56px 18px 36px; }
          .tos-hero-badge { font-size: 11.5px; padding: 6px 12px; }
          .tos-hero p { font-size: 14px; }
          .tos-shell { padding: 28px 16px 56px; gap: 20px; }
          .tos-toc { padding: 16px; }
          .tos-toc ul { flex-direction: column; gap: 8px; }
          .tos-section-head { padding: 14px 16px; font-size: 15px; gap: 8px; }
          .tos-section-icon { width: 24px; height: 24px; }
          .tos-section-body { padding: 0 16px 16px; }
          .tos-section-body p,
          .tos-bullets li { font-size: 13px; }
          .tos-table { font-size: 12px; }
          .tos-table th, .tos-table td { padding: 8px 10px; }
        }

        @media (max-width: 375px) {
          .tos-hero h1 { font-size: 28px; }
          .tos-shell { padding: 24px 12px 48px; }
          .tos-section-head { font-size: 14px; }
        }

        @media (max-height: 650px) and (min-width: 700px) {
          .tos-hero { padding: 40px 28px 32px; }
          .tos-toc { position: static; }
        }

        .tos-table td, .tos-table th { word-break: break-word; }
        img { max-width: 100%; }
      `}</style>
    </div>
  );
}