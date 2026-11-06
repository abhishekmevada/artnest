import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  Clock,
  Palette,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { API_BASE_URL } from "@/config/api";

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRCompact(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
  return `₹${amount}`;
}

const RECENT_ORDERS = [
  {
    id: "ORD-10245",
    piece: "Golden Silence",
    artist: "Aarav Mehta",
    buyer: "Priya Sharma",
    amount: 18500,
    date: "18 Sep 2026",
    status: "Completed",
  },
  {
    id: "ORD-10244",
    piece: "Monsoon Reverie",
    artist: "Riya Sharma",
    buyer: "Rahul Kapoor",
    amount: 32400,
    date: "18 Sep 2026",
    status: "Processing",
  },
  {
    id: "ORD-10243",
    piece: "Bronze Whisper",
    artist: "Kabir Verma",
    buyer: "Sneha Iyer",
    amount: 64200,
    date: "17 Sep 2026",
    status: "Pending",
  },
  {
    id: "ORD-10242",
    piece: "City in Ochre",
    artist: "Ananya Kapoor",
    buyer: "Vikram Nair",
    amount: 21800,
    date: "17 Sep 2026",
    status: "Completed",
  },
  {
    id: "ORD-10241",
    piece: "Terracotta Dream",
    artist: "Meera Iyer",
    buyer: "Ishaan Joshi",
    amount: 15600,
    date: "16 Sep 2026",
    status: "Cancelled",
  },
  {
    id: "ORD-10240",
    piece: "Still Water Study",
    artist: "Aarav Mehta",
    buyer: "Ananya Rao",
    amount: 27900,
    date: "16 Sep 2026",
    status: "Completed",
  },
  {
    id: "ORD-10239",
    piece: "Marble Repose",
    artist: "Kabir Verma",
    buyer: "Kunal Bose",
    amount: 98000,
    date: "15 Sep 2026",
    status: "Processing",
  },
  {
    id: "ORD-10238",
    piece: "Ink and Rust",
    artist: "Riya Sharma",
    buyer: "Divya Menon",
    amount: 12400,
    date: "15 Sep 2026",
    status: "Completed",
  },
];

const TOP_ARTISTS = [
  {
    id: 1,
    name: "Aarav Mehta",
    initials: "AM",
    category: "Paintings",
    artworks: 42,
    rating: 4.9,
    sales: 612000,
    followers: 3200,
  },
  {
    id: 2,
    name: "Riya Sharma",
    initials: "RS",
    category: "Digital Art",
    artworks: 35,
    rating: 4.8,
    sales: 498000,
    followers: 2750,
  },
  {
    id: 3,
    name: "Kabir Verma",
    initials: "KV",
    category: "Sculpture",
    artworks: 21,
    rating: 4.9,
    sales: 741000,
    followers: 1980,
  },
  {
    id: 4,
    name: "Ananya Kapoor",
    initials: "AK",
    category: "Abstract Art",
    artworks: 29,
    rating: 4.7,
    sales: 356000,
    followers: 2140,
  },
  {
    id: 5,
    name: "Meera Iyer",
    initials: "MI",
    category: "Photography",
    artworks: 18,
    rating: 4.6,
    sales: 214000,
    followers: 1520,
  },
];

const RECENT_ARTWORKS = [
  {
    id: "AW-1",
    title: "Golden Silence",
    artist: "Aarav Mehta",
    price: 18500,
    status: "Approved",
    color: "#C98A68",
  },
  {
    id: "AW-2",
    title: "Monsoon Reverie",
    artist: "Riya Sharma",
    price: 32400,
    status: "Approved",
    color: "#9F5639",
  },
  {
    id: "AW-3",
    title: "Bronze Whisper",
    artist: "Kabir Verma",
    price: 64200,
    status: "Pending",
    color: "#A28F7D",
  },
  {
    id: "AW-4",
    title: "City in Ochre",
    artist: "Ananya Kapoor",
    price: 21800,
    status: "Approved",
    color: "#D9C7B2",
  },
  {
    id: "AW-5",
    title: "Still Water Study",
    artist: "Meera Iyer",
    price: 15600,
    status: "Pending",
    color: "#736153",
  },
  {
    id: "AW-6",
    title: "Ink and Rust",
    artist: "Riya Sharma",
    price: 12400,
    status: "Rejected",
    color: "#E8E1DB",
  },
];

function StatusBadge({ status }) {
  const map = {
    Approved: "bg-[#E7EEDD] text-[#4C6B3F]",
    Completed: "bg-[#E7EEDD] text-[#4C6B3F]",
    Pending: "bg-[#F6E7D0] text-[#8A5A22]",
    Processing: "bg-[#F6E7D0] text-[#8A5A22]",
    Cancelled: "bg-[#F6DFDA] text-[#9B3B2E]",
    Rejected: "bg-[#F6DFDA] text-[#9B3B2E]",
  };
  const cls = map[status] || "bg-[#EFE9E1] text-[#736153]";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap ${cls}`}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value, isCurrency, icon: Icon }) {
  return (
    <div className="bg-white border border-[#E8E1DB] rounded-xl px-6 py-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#9F5639]" />

      <div className="flex items-start justify-between gap-2">
        <p className="text-[14px] text-[#A28F7D]">{label}</p>

        {Icon && (
          <span className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F5F0E9] text-[#A28F7D]">
            <Icon size={18} />
          </span>
        )}
      </div>

      <p className="font-['Playfair_Display'] text-[30px] text-[#362F26] mt-3">
        {isCurrency ? formatINR(value) : value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [chartMetric, setChartMetric] = useState("revenue");

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch admin dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/admin/get-admin-overview`,
          {
            headers: {
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
          },
        );

        setDashboardData(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const overview = dashboardData?.overview;

  // Statistics cards
  const stats = overview
    ? [
        {
          id: "revenue",
          label: "Total revenue",
          value: overview.totalRevenue || 0,
          isCurrency: true,
          icon: IndianRupee,
        },
        {
          id: "orders",
          label: "Total orders",
          value: overview.totalOrders || 0,
          icon: ShoppingBag,
        },
        {
          id: "artists",
          label: "Total artists",
          value: overview.totalArtists || 0,
          icon: Users,
        },
        {
          id: "artworks",
          label: "Total artworks",
          value: overview.totalArtwork || 0,
          icon: ImageIcon,
        },
        {
          id: "pending",
          label: "Pending orders",
          value: overview.pendingOrders || 0,
          icon: Clock,
        },
        {
          id: "custom",
          label: "Custom art requests",
          value: overview.customArtRequests || 0,
          icon: Palette,
        },
      ]
    : [];

  // Combine monthly API data for the area chart
  const revenueData = dashboardData?.monthlyRevenue?.data || [];
  const ordersData = dashboardData?.monthlyOrders?.data || [];
  const artistsData = dashboardData?.monthlyArtists?.data || [];

  const chartData = revenueData.map((item) => ({
    month: item.month.slice(0, 3),
    revenue: item.revenue || 0,

    orders:
      ordersData.find((order) => order.monthNumber === item.monthNumber)
        ?.orders || 0,

    artists:
      artistsData.find((artist) => artist.monthNumber === item.monthNumber)
        ?.artists || 0,
  }));

  // Sales by category
  const categoryData =
    dashboardData?.salesByCategory?.data?.map((item) => ({
      label: item.category.charAt(0).toUpperCase() + item.category.slice(1),

      value: item.percentage || 0,
      color: "#9F5639",
      totalSold: item.totalSold,
      salesRevenue: item.salesRevenue,
    })) || [];

  const METRICS = [
    { key: "revenue", label: "Revenue" },
    { key: "orders", label: "Orders" },
    { key: "artists", label: "Artists" },
  ];

  if (loading) {
    return (
      <div className="p-6 text-center text-[#736153]">
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!dashboardData) return null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 font-['Plus_Jakarta_Sans']">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {stats.map((s) => (
          <StatCard key={s.id} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5">
        <div className="bg-white border border-[#E8E1DB] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Playfair_Display'] text-[20px] text-[#362F26]">
              {chartMetric === "revenue"
                ? "Monthly Revenue"
                : chartMetric === "orders"
                  ? "Monthly Orders"
                  : "Monthly Artists"}
            </h2>

            <span className="text-[13px] text-[#A28F7D]">
              {dashboardData.monthlyRevenue?.year}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setChartMetric(m.key)}
                className={`text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
                  chartMetric === m.key
                    ? "bg-[#9F5639] text-white"
                    : "bg-[#F5F0E9] text-[#A28F7D] hover:text-[#362F26]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9F5639" stopOpacity={0.28} />
                    <stop
                      offset="100%"
                      stopColor="#9F5639"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E8E1DB" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#A28F7D", fontSize: 13 }}
                  axisLine={{ stroke: "#E8E1DB" }}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "#A28F7D", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                  tickFormatter={(v) =>
                    chartMetric === "revenue" ? formatINRCompact(v) : v
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "#362F26",
                    border: "none",
                    borderRadius: 8,
                    color: "#FCEFE1",
                    fontSize: 13,
                  }}
                  formatter={(v) =>
                    chartMetric === "revenue" ? formatINR(v) : v
                  }
                />
                <Area
                  type="monotone"
                  dataKey={chartMetric}
                  stroke="#9F5639"
                  strokeWidth={2}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#E8E1DB] rounded-xl p-6 shadow-sm">
          <h2 className="font-['Playfair_Display'] text-[20px] text-[#362F26] mb-6">
            Sales by category
          </h2>

          {categoryData.every((item) => item.value === 0) ? (
            <div className="flex min-h-[200px] items-center justify-center text-sm text-[#A28F7D]">
              No category sales data available yet.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
                <div className="w-[200px] h-[200px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {categoryData.map((c, index) => (
                          <Cell
                            key={c.label}
                            fill={
                              [
                                "#9F5639",
                                "#C98A68",
                                "#A28F7D",
                                "#D9C7B2",
                                "#736153",
                                "#E8E1DB",
                                "#B0573A",
                              ][index % 7]
                            }
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <ul className="flex-1 w-full space-y-3">
                  {categoryData.map((c, index) => (
                    <li
                      key={c.label}
                      className="flex items-center gap-3 text-[14px]"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: [
                            "#9F5639",
                            "#C98A68",
                            "#A28F7D",
                            "#D9C7B2",
                            "#736153",
                            "#E8E1DB",
                            "#B0573A",
                          ][index % 7],
                        }}
                      />

                      <span className="text-[#362F26] flex-1 truncate">
                        {c.label}
                      </span>

                      <span className="text-[#362F26] font-medium">
                        {c.value}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
