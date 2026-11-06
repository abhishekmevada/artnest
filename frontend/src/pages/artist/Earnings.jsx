import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  IndianRupee,
  Palette,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { Badge, Card, PAGE, inr } from "./shared";
import { API_BASE_URL } from "@/config/api";

function StatCard({ icon: Icon, label, value, note }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="
        group relative overflow-hidden
        rounded-[18px]
        border border-[#E8E1DB]
        bg-[linear-gradient(145deg,#ffffff_0%,#fffaf6_52%,#f8eee7_100%)]
        p-5 sm:p-6
        shadow-[0_6px_18px_rgba(65,43,31,0.04)]
        transition-all duration-300 ease-out
        hover:border-[#D8C1B4]
        hover:shadow-[0_14px_30px_rgba(65,43,31,0.09)]
      "
    >
      <div
        className="
          pointer-events-none
          absolute -right-8 -top-8
          h-24 w-24 rounded-full
          bg-[#D9A184]/10
          blur-2xl
          transition-transform duration-500
          group-hover:scale-125
        "
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-[#A28F7D]">
            {label}
          </p>

          <p className="mt-2 font-serif text-[30px] leading-[33px] tracking-[-0.025em] text-[#362F26]">
            {value}
          </p>

          <p className="mt-1.5 text-[11.5px] leading-4 text-[#9B8979]">
            {note}
          </p>
        </div>

        <div
          className="
            grid h-11 w-11 shrink-0 place-items-center
            rounded-[14px]
            border border-[#E6D4C8]
            bg-[linear-gradient(135deg,#F7EADF_0%,#EBD4C5_100%)]
            text-[#9F5639]
            shadow-[0_4px_12px_rgba(65,43,31,0.07)]
          "
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>

      <div
        className="
          absolute inset-x-8 bottom-0 h-px
          scale-x-0
          bg-[linear-gradient(90deg,transparent,#C98C69,transparent)]
          transition-transform duration-300
          group-hover:scale-x-100
        "
      />
    </motion.div>
  );
}

function PerformanceRow({ artwork, buyer, amount, orders, status, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: "easeOut",
      }}
      className="
        group relative overflow-hidden
        rounded-[14px]
        border border-[#E9DFD8]
        bg-[linear-gradient(135deg,#ffffff_0%,#fffdfb_100%)]
        px-3.5 py-3.5
        shadow-[0_2px_8px_rgba(65,43,31,0.04)]
        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:border-[#DCC2B3]
        hover:bg-[linear-gradient(135deg,#FFF9F4_0%,#FCEDE3_100%)]
        hover:shadow-[0_10px_24px_rgba(65,43,31,0.11)]
        sm:px-4 sm:py-4
      "
    >
      <div
        className="
          absolute inset-y-2 left-0 w-[3px]
          origin-center scale-y-0
          rounded-r-full
          bg-[linear-gradient(180deg,#C98C69,#9F5639)]
          transition-transform duration-300
          group-hover:scale-y-100
        "
      />

      <div className="flex items-center gap-3">
        <div
          className="
            grid h-10 w-10 shrink-0 place-items-center
            rounded-[12px]
            border border-[#E6D4C8]
            bg-[linear-gradient(135deg,#F7EADF_0%,#EBD4C5_100%)]
            text-[#9F5639]
            shadow-[0_3px_8px_rgba(65,43,31,0.07)]
          "
        >
          <Palette size={17} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="
              truncate
              font-serif text-[14.5px]
              tracking-[-0.01em]
              text-[#3E3028]
              transition-colors duration-200
              group-hover:text-[#9F5639]
            "
          >
            {artwork}
          </p>

          <p className="mt-0.5 truncate text-[12px] text-[#8F7D6E]">{buyer}</p>
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-[14px] font-semibold text-[#3E3028]">
            {inr(amount)}
          </p>

          <p className="mt-0.5 text-[11px] text-[#9B8979]">
            {orders} {orders === 1 ? "sale" : "sales"}
          </p>
        </div>

        <Badge status={status} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#EEE5DF] pt-3 sm:hidden">
        <span className="text-[11px] text-[#9B8979]">
          {orders} {orders === 1 ? "sale" : "sales"}
        </span>

        <span className="text-[13px] font-semibold text-[#3E3028]">
          {inr(amount)}
        </span>
      </div>

      <div
        className="
          absolute inset-x-6 bottom-0 h-px
          scale-x-0
          bg-[linear-gradient(90deg,transparent,#D7B09B,transparent)]
          transition-transform duration-300
          group-hover:scale-x-100
        "
      />
    </motion.div>
  );
}

export default function Earnings() {
  const [earnings, setEarnings] = useState({
    totalSales: 0,
    artworksSold: 0,
    averageSaleValue: 0,
    soldArtworks: [],
    categorySales: [],
    topPerformingArtworks: [],
    monthlySales: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtistEarnings = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in first.");
        }

        const response = await fetch(
          `${API_BASE_URL}/artwork/artist-earnings`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch artist earnings.");
        }

        setEarnings({
          totalSales: result.totalSales ?? 0,
          artworksSold: result.artworksSold ?? 0,
          averageSaleValue: result.averageSaleValue ?? 0,
          soldArtworks: result.soldArtworks ?? [],
          categorySales: result.categorySales ?? [],
          topPerformingArtworks: result.topPerformingArtworks ?? [],
          monthlySales: result.monthlySales ?? [],
        });
      } catch (error) {
        console.error("Fetch artist earnings error:", error);
        setError(error.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistEarnings();
  }, []);

  const maxMonthlySales = Math.max(
    0,
    ...earnings.monthlySales.map((item) => Number(item.sales) || 0),
  );

  const monthlyTotal = earnings.monthlySales.reduce(
    (sum, item) => sum + (Number(item.sales) || 0),
    0,
  );

  const stats = [
    {
      icon: IndianRupee,
      label: "Total sales",
      value: inr(earnings.totalSales),
      note: "Value of recorded artwork sales",
    },
    {
      icon: ShoppingBag,
      label: "Artworks sold",
      value: earnings.artworksSold,
      note: "Recorded artwork sales",
    },
    {
      icon: BarChart3,
      label: "Average sale value",
      value: inr(earnings.averageSaleValue),
      note: "Average value per artwork sale",
    },
  ];

  if (loading) {
    return (
      <div className={PAGE}>
        <p className="py-10 text-center text-[#806D60]">Loading earnings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={PAGE}>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={PAGE}>
      {/* Financial stats */}
      <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Monthly sales */}
      <Card
        title={
          <span className="font-serif text-[19px] font-medium text-[#362F26] sm:text-[20px]">
            Monthly sales
          </span>
        }
        action={
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#4C6B3F]">
            <ArrowUpRight size={14} />
            <span>Sales trend</span>
          </div>
        }
        className="w-full bg-[linear-gradient(315deg,#fffdfb_0%,#fff8f2_48%,#f8eee6_100%)]"
      >
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] text-[#9B8877]">
              Total sales · last 6 months
            </p>
            <p className="mt-1 font-serif text-[28px] text-[#362F26]">
              {inr(monthlyTotal)}
            </p>
          </div>
          <p className="text-[12px] text-[#A28F7D]">Monthly performance</p>
        </div>

        <div className="flex h-56 items-end gap-2 sm:gap-4">
          {earnings.monthlySales.map((item, index) => {
            const value = Number(item.sales) || 0;

            const height =
              maxMonthlySales > 0 ? (value / maxMonthlySales) * 72 : 0;

            return (
              <div
                key={`${item.month}-${index}`}
                className="group flex h-full flex-1 flex-col items-center justify-end"
              >
                <span className="mb-3 rounded-full border border-[#E7D8CE] bg-[#FFF9F5] px-2.5 py-1 text-[10px] font-semibold text-[#7F4632] sm:text-[11px]">
                  {value >= 100000
                    ? `₹${(value / 100000).toFixed(1)}L`
                    : `₹${Math.round(value / 1000)}k`}
                </span>

                <motion.div
                  className="w-full max-w-[32px] rounded-t-[10px] bg-[linear-gradient(135deg,#D9A184_0%,#C17A58_22%,#9F5639_65%,#783B2B_100%)] sm:max-w-[38px] md:max-w-[44px] xl:max-w-[54px]"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.03,
                    ease: "easeOut",
                  }}
                />

                <span className="mt-3 text-[11.5px] font-medium text-[#4A4037] sm:text-[12px]">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Sales breakdown */}
      <Card
        title={
          <span className="font-serif text-[19px] font-medium text-[#362F26] sm:text-[20px]">
            Sales Breakdown
          </span>
        }
        action={<span className="text-[12px] text-[#9B8979]">By category</span>}
        className="bg-[linear-gradient(145deg,#fffefc_0%,#fcf8f4_55%,#f9f1eb_100%)]"
      >
        <div className="space-y-5">
          {earnings.categorySales.map((category, index) => (
            <motion.div
              key={category.name || index}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.07 }}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-[#51453C]">
                  {category.name}
                </span>
                <span className="text-[13px] font-semibold text-[#3E3028]">
                  {inr(category.sales)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#EDE4DE]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${Math.min(
                      100,
                      Math.max(0, Number(category.percentage) || 0),
                    )}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15 + index * 0.08 }}
                  className="h-full rounded-full bg-[linear-gradient(90deg,#C98C69,#9F5639)]"
                />
              </div>
            </motion.div>
          ))}

          {earnings.categorySales.length === 0 && (
            <p className="py-5 text-center text-sm text-[#9B8979]">
              No category sales available.
            </p>
          )}
        </div>
      </Card>

      {/* Top performing artworks */}
      <Card
        title={
          <span className="font-serif text-[19px] font-medium text-[#362F26] sm:text-[20px]">
            Top Performing Artworks
          </span>
        }
        action={
          <Link
            to="/artist/artworks"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#9F5639] hover:text-[#7F432C]"
          >
            View artworks
            <ArrowUpRight size={14} />
          </Link>
        }
        className="bg-[linear-gradient(145deg,#fffefc_0%,#fcf8f4_55%,#f9f1eb_100%)]"
      >
        <div className="grid gap-3">
          {earnings.topPerformingArtworks.map((item, index) => (
            <PerformanceRow
              key={item.artworkId || index}
              artwork={item.title || "Untitled artwork"}
              buyer={item.category || "Artwork"}
              amount={Number(item.price) || 0}
              orders={Number(item.quantitySold) || 0}
              status="Delivered"
              index={index}
            />
          ))}

          {earnings.topPerformingArtworks.length === 0 && (
            <p className="py-5 text-center text-sm text-[#9B8979]">
              No top-performing artworks available.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
