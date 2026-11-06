import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Image,
  Palette,
  ShoppingBag,
  Star,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ARTWORKS, Card, PAGE, inr } from "./shared";
import { API_BASE_URL } from "@/config/api";

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────

function StatCard({ label, value, note, icon: Icon, index }) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.25,
  });

  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (isInView) {
      setHasEntered(true);
    }
  }, [isInView]);

  const accents = [
    {
      icon: "bg-[linear-gradient(135deg,#f9eee6_0%,#f1ddd1_100%)]",
      glow: "group-hover:shadow-[0_0_28px_rgba(159,86,57,0.13)]",
    },
    {
      icon: "bg-[linear-gradient(135deg,#f4efe7_0%,#ebe2d5_100%)]",
      glow: "group-hover:shadow-[0_0_28px_rgba(192,138,62,0.12)]",
    },
    {
      icon: "bg-[linear-gradient(135deg,#f8ece5_0%,#ecd9ce_100%)]",
      glow: "group-hover:shadow-[0_0_28px_rgba(159,86,57,0.13)]",
    },
    {
      icon: "bg-[linear-gradient(135deg,#f4efe7_0%,#e7e9dc_100%)]",
      glow: "group-hover:shadow-[0_0_28px_rgba(76,107,63,0.10)]",
    },
  ];

  const accent = accents[index % accents.length];

  //   const mediumCounts = ARTWORKS.reduce((acc, artwork) => {
  //   const medium = artwork.medium || "Other";
  //   acc[medium] = (acc[medium] || 0) + 1;
  //   return acc;
  // }, {});

  // const totalArtworks = ARTWORKS.length;

  // const mediumData = Object.entries(mediumCounts).map(
  //   ([name, count], index) => {
  //     const fills = ["#9F5639", "#B8955A", "#6F8F7A", "#8B7465", "#A88B76"];

  //     return {
  //       name,
  //       value: Math.round((count / totalArtworks) * 100),
  //       fill: fills[index % fills.length],
  //     };
  //   }
  // );

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={
        hasEntered
          ? {
              opacity: 1,
              y: 0,
            }
          : {
              opacity: 0,
              y: 30,
            }
      }
      transition={
        hasEntered
          ? {
              duration: 0.6,
              delay: index * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }
          : {
              duration: 0,
            }
      }
      className="
        group
        relative
        overflow-hidden
        rounded-[18px]
        border
        border-[#E8E1DB]
        bg-[linear-gradient(145deg,#ffffff_0%,#fffaf6_52%,#f8eee7_100%)]
        p-5
        shadow-[0_6px_18px_rgba(65,43,31,0.04)]
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1.5
        hover:border-[#D8C1B4]
        hover:shadow-[0_14px_30px_rgba(65,43,31,0.09)]
        sm:p-6
      "
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-24
          w-24
          rounded-full
          bg-[#f0d6c7]/30
          blur-2xl
          transition-transform
          duration-500
          ease-out
          group-hover:scale-125
        "
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        {/* Label + Value */}
        <div className="min-w-0">
          <p className="text-[12.5px] font-medium text-[#A28F7D] sm:text-[13px]">
            {label}
          </p>

          <p className="mt-4 font-serif text-[30px] leading-none tracking-[-0.3px] text-[#362F26] sm:text-[33px]">
            {value}
          </p>

          <p className="mt-3 text-[11.5px] text-[#A28F7D] sm:text-[12px]">
            {note}
          </p>
        </div>

        {/* Icon */}
        <span
          className={`
            grid
            h-11
            w-11
            shrink-0
            place-items-center
            rounded-[14px]
            text-[#9F5639]
            transition-all
            duration-300
            ease-out
            group-hover:scale-105
            ${accent.icon}
            ${accent.glow}
          `}
        >
          <Icon size={19} strokeWidth={1.9} />
        </span>
      </div>

      {/* Bottom accent line */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-0
          bottom-0
          h-[2px]
          origin-left
          scale-x-0
          bg-[linear-gradient(90deg,#9F5639,#C08A3E)]
          transition-transform
          duration-500
          ease-out
          group-hover:scale-x-100
        "
      />
    </motion.div>
  );
}

function ThreeDPieChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f8eee7] text-[#9F5639]">
          <Palette size={22} />
        </div>
        <p className="font-serif text-[17px] text-[#362F26]">No Artworks Added Yet</p>
        <p className="mt-1 max-w-sm text-[12.5px] text-[#8A796B]">
          Upload your artworks to see a 3D breakdown of your styles and mediums.
        </p>
      </div>
    );
  }

  const cx = 270;
  const cy = 160;
  const rx = 160;
  const ry = 92;
  const depth = 40;

  const polar = (angle, rX = rx, rY = ry) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + rX * Math.cos(rad),
      y: cy + rY * Math.sin(rad),
    };
  };

  const getTopPath = (startAngle, endAngle) => {
    const start = polar(startAngle);
    const end = polar(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${cx} ${cy}
      L ${start.x} ${start.y}
      A ${rx} ${ry} 0 ${largeArc} 1 ${end.x} ${end.y}
      Z
    `;
  };

  const getSidePath = (startAngle, endAngle) => {
    const startTop = polar(startAngle);
    const endTop = polar(endAngle);
    const startBottom = { x: startTop.x, y: startTop.y + depth };
    const endBottom = { x: endTop.x, y: endTop.y + depth };
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${startTop.x} ${startTop.y}
      A ${rx} ${ry} 0 ${largeArc} 1 ${endTop.x} ${endTop.y}
      L ${endBottom.x} ${endBottom.y}
      A ${rx} ${ry} 0 ${largeArc} 0 ${startBottom.x} ${startBottom.y}
      Z
    `;
  };

  // Precompute slices with exact angles from count / total to prevent looping or overlaps
  const totalCount = data.reduce(
    (sum, item) => sum + (item.count || item.value || 0),
    0,
  );

  const slices = [];
  let currentAngle = -90;

  data.forEach((item, index) => {
    const val = item.count || item.value || 0;
    const fraction = totalCount > 0 ? val / totalCount : 0;
    const angle = fraction * 360;
    const percent = Math.round(fraction * 100);

    slices.push({
      ...item,
      index,
      percent,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      span: angle,
    });

    currentAngle += angle;
  });

  return (
    <div className="w-full">
      <div className="relative mx-auto max-w-[560px]">
        <svg
          viewBox="0 0 540 370"
          className="h-auto w-full select-none overflow-visible"
        >
          {/* Ground shadow */}
          <ellipse
            cx={cx}
            cy={cy + depth + 14}
            rx={rx + 15}
            ry={ry * 0.42}
            fill="rgba(54,47,38,0.11)"
          />

          {/* 3D SIDE / EXTRUSION (front-facing part: angles between 0 and 180 degrees) */}
          <g>
            {slices.map((slice) => {
              const start = Math.max(slice.startAngle, 0);
              const end = Math.min(slice.endAngle, 180);

              if (start >= end) return null;

              const isHovered = hoveredIndex === slice.index;

              return (
                <path
                  key={`side-${slice.index}`}
                  d={getSidePath(start, end)}
                  fill={slice.darkFill}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  className="transition-all duration-200"
                  style={{
                    filter: isHovered ? "brightness(1.15)" : "none",
                  }}
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </g>

          {/* TOP SURFACE */}
          <g>
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.index;

              return (
                <path
                  key={`top-${slice.index}`}
                  d={getTopPath(slice.startAngle, slice.endAngle)}
                  fill={slice.fill}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: isHovered ? "brightness(1.12)" : "none",
                  }}
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </g>

          {/* SLICE LABELS (rendered with safe thresholds to prevent overlapping) */}
          <g className="pointer-events-none">
            {slices.map((slice) => {
              // Slices narrower than 22 degrees omit internal text to eliminate overlap
              if (slice.span < 22) return null;

              const middleAngle = (slice.startAngle + slice.endAngle) / 2;
              const middleRad = (middleAngle * Math.PI) / 180;
              const labelRadiusX = rx * 0.62;
              const labelRadiusY = ry * 0.62;

              const x = cx + labelRadiusX * Math.cos(middleRad);
              const y = cy + labelRadiusY * Math.sin(middleRad);

              const showTitle = slice.span >= 42;

              return (
                <g key={`label-${slice.index}`}>
                  {showTitle && (
                    <text
                      x={x}
                      y={y - 7}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="11.5"
                      fontWeight="600"
                      style={{
                        paintOrder: "stroke",
                        stroke: "rgba(0,0,0,0.55)",
                        strokeWidth: "3px",
                        strokeLinejoin: "round",
                      }}
                    >
                      {slice.name.length > 14
                        ? `${slice.name.slice(0, 12)}…`
                        : slice.name}
                    </text>
                  )}

                  <text
                    x={x}
                    y={showTitle ? y + 10 : y + 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={showTitle ? "12" : "13"}
                    fontWeight="700"
                    style={{
                      paintOrder: "stroke",
                      stroke: "rgba(0,0,0,0.55)",
                      strokeWidth: "3px",
                      strokeLinejoin: "round",
                    }}
                  >
                    {slice.percent}%
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating tooltip on hover */}
        {hoveredIndex !== null && slices[hoveredIndex] && (
          <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-[#E8DDD5] bg-white/95 px-3.5 py-1 text-center shadow-md backdrop-blur-sm transition-all duration-150">
            <span className="text-[12.5px] font-semibold text-[#362F26]">
              {slices[hoveredIndex].name}
            </span>
            <span className="mx-1.5 text-[#A28F7D]">•</span>
            <span className="text-[12px] font-medium text-[#9F5639]">
              {slices[hoveredIndex].count}{" "}
              {slices[hoveredIndex].count === 1 ? "artwork" : "artworks"} (
              {slices[hoveredIndex].percent}%)
            </span>
          </div>
        )}
      </div>

      {/* COMPREHENSIVE LEGEND (Guarantees every medium is clearly readable with no overlaps) */}
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {slices.map((slice) => {
          const isHovered = hoveredIndex === slice.index;

          return (
            <div
              key={`legend-${slice.index}`}
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 transition-all duration-200 ${
                isHovered
                  ? "-translate-y-0.5 border-[#9F5639] bg-[#FAF3EE] shadow-sm"
                  : "border-[#EFE7E0] bg-white/60 hover:border-[#D8C1B4] hover:bg-white"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm"
                  style={{ backgroundColor: slice.fill }}
                />
                <span className="truncate text-[13px] font-medium text-[#362F26]">
                  {slice.name}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 pl-2">
                <span className="text-[11.5px] text-[#8A796B]">
                  {slice.count}
                </span>
                <span className="rounded-md bg-[#F4EDE6] px-1.5 py-0.5 text-[11px] font-bold text-[#6E4B37]">
                  {slice.percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

export default function Dashboard() {
  // ─────────────────────────────────────────────
  // Artwork calculations
  // ─────────────────────────────────────────────

  const [dashboardData, setDashboardData] = useState(null);
  const [artworksList, setArtworksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtistOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const [overviewRes, artworksRes] = await Promise.all([
          fetch(`${API_BASE_URL}/artwork/artist-overview`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/artwork/get-artwork`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).catch(() => null),
        ]);

        const result = await overviewRes.json();

        if (!overviewRes.ok) {
          throw new Error(result.message || "Failed to fetch dashboard data");
        }

        setDashboardData(result);

        if (artworksRes && artworksRes.ok) {
          const artResult = await artworksRes.json().catch(() => null);
          if (artResult?.getAllArtwork) {
            setArtworksList(artResult.getAllArtwork);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistOverview();
  }, []);

  const overview = dashboardData?.overview || {};
  const artworkStats = dashboardData?.artworkStats || {};
  const orderStats = dashboardData?.orderStats || {};

  const published = artworkStats.published || 0;
  const draft = artworkStats.draft || 0;
  const sold = artworkStats.sold || 0;
  const totalArtworks = artworkStats.totalArtwork || 0;

  // Use real artworks from API if available, fallback to mock ARTWORKS if in demo
  const effectiveArtworks =
    artworksList && artworksList.length > 0
      ? artworksList
      : totalArtworks === 0
      ? []
      : ARTWORKS;

  // Average artwork price
  const averagePrice =
    effectiveArtworks.length > 0
      ? effectiveArtworks.reduce(
          (sum, artwork) => sum + Number(artwork.price || 0),
          0,
        ) / effectiveArtworks.length
      : 0;

  // Published percentage
  const publishedRate =
    totalArtworks > 0 ? Math.round((published / totalArtworks) * 100) : 0;

  // Category / medium count derived from effective artworks
  const categoryCounts = effectiveArtworks.reduce((acc, artwork) => {
    const category = (artwork.medium && artwork.medium.trim()) || "Other";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const totalEffectiveCount = Object.values(categoryCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  const colors = [
    { fill: "#C08A3E", darkFill: "#7A5320" },
    { fill: "#A95738", darkFill: "#69301F" },
    { fill: "#6F8F7A", darkFill: "#3E5747" },
    { fill: "#8B7465", darkFill: "#544337" },
    { fill: "#4E7B8A", darkFill: "#2A4B56" },
    { fill: "#9E6B7A", darkFill: "#5E3843" },
    { fill: "#B8955A", darkFill: "#6F542D" },
    { fill: "#7E8566", darkFill: "#4E533B" },
  ];

  const mediumData = Object.entries(categoryCounts).map(
    ([name, count], index) => {
      const color = colors[index % colors.length];
      const percent =
        totalEffectiveCount > 0
          ? Math.round((count / totalEffectiveCount) * 100)
          : 0;

      return {
        name,
        count,
        value: count,
        percent,
        fill: color.fill,
        darkFill: color.darkFill,
      };
    },
  );
  console.log("ARTWORKS:", ARTWORKS);
  console.log("Category Counts:", categoryCounts);
  console.log("Medium Data:", mediumData);

  if (loading) {
    return (
      <div className={PAGE}>
        <p className="text-center text-[#8A796B]">
          Loading artist dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={PAGE}>
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Dashboard stats
  // ─────────────────────────────────────────────

  const stats = [
    {
      label: "Published artworks",
      value: overview.publishedArtworks ?? 0,
      note: `${totalArtworks} in total`,
      icon: Image,
    },
    {
      label: "Open orders",
      value: overview.openOrders ?? 0,
      note: `${orderStats.totalOrders ?? 0} total orders`,
      icon: ShoppingBag,
    },
    {
      label: "Open requests",
      value: overview.openRequests ?? 0,
      note: "Custom requests",
      icon: Palette,
    },
    {
      label: "Average rating",
      value: (overview.averageRating ?? 0).toFixed(1),
      note: `From ${overview.totalReviews ?? 0} reviews`,
      icon: Star,
    },
    {
      label: "Total reviews",
      value: overview.totalReviews ?? 0,
      note: "Across all artworks",
      icon: Star,
    },
    {
      label: "Order success",
      value: `${(overview.orderSuccess ?? 0).toFixed(1)}%`,
      note: "Successful orders",
      icon: CheckCircle2,
    },
  ];

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className={PAGE}>
      {/* ═══════════════════════════════════════════
          QUICK STATS
      ═══════════════════════════════════════════ */}

      <div
        className="
          grid
          gap-y-4
          gap-x-6
          sm:grid-cols-2
          lg:grid-cols-3
          lg:gap-x-8
          lg:gap-y-5
        "
      >
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          ARTWORK STATUS
      ═══════════════════════════════════════════ */}

      <Card
        title="Artwork Status"
        className="
          bg-[linear-gradient(315deg,#fffdfb_0%,#fff8f2_48%,#f8eee6_100%)]
        "
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Published",
              value: published,
            },
            {
              label: "Draft",
              value: draft,
            },
            {
              label: "Sold",
              value: sold,
            },
            {
              label: "Total artworks",
              value: totalArtworks,
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                rounded-[16px]
                border
                border-[#E8E1DB]
                bg-white/70
                p-4
                shadow-[0_4px_14px_rgba(65,43,31,0.04)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#D8C1B4]
                hover:shadow-[0_10px_24px_rgba(65,43,31,0.08)]
              "
            >
              <p className="text-[12px] font-medium text-[#A28F7D]">
                {item.label}
              </p>

              <p className="mt-2 font-serif text-[28px] leading-none text-[#362F26]">
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Artist Insights */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Card className="overflow-hidden">
          <div className="mb-4">
            <h2 className="text-[18px] font-semibold text-[#362F26]">
              Artist Insights
            </h2>

            <p className="mt-1 text-[13px] text-[#8A796B]">
              Your artwork distribution by medium
            </p>
          </div>

          <ThreeDPieChart data={mediumData} />
        </Card>
      </motion.div>
    </div>
  );
}
