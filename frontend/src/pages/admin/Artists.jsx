import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, ChevronDown, Ban, X } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

const mapArtist = (artist) => ({
  id: artist.artistId,
  name: artist.name || "Unknown Artist",
  specialty: Array.isArray(artist.specialty)
    ? artist.specialty.join(", ")
    : artist.specialty || "Not specified",
  location: artist.location || "Not specified",
  artworks: Number(artist.artworks || 0),
  sales: Number(artist.revenue ?? artist.sales ?? 0),
  rating: Number(artist.avg_rating || 0),
  verified: false,
  status: artist.status?.toLowerCase() === "active" ? "Active" : "Suspended",
});

const TONE = {
  Active: "bg-[#E7EEDD] text-[#4C6B3F]",
  Suspended: "bg-[#F6DFDA] text-[#9B3B2E]",
};

const SORTS = {
  "Sort: Sales (high to low)": (a, b) => b.sales - a.sales,
  "Sort: Sales (low to high)": (a, b) => a.sales - b.sales,
  "Sort: Rating": (a, b) => b.rating - a.rating,
  "Sort: Artworks": (a, b) => b.artworks - a.artworks,
  "Sort: Name (A-Z)": (a, b) => a.name.localeCompare(b.name),
};

const selectCls =
  "appearance-none h-11 pl-4 pr-10 rounded-full border border-[#E8E1DB] bg-white text-[14px] text-[#362F26] focus:outline-none focus:border-[#9F5639] cursor-pointer";

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectCls}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#A28F7D]"
      />
    </div>
  );
}

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All specialties");
  const [sort, setSort] = useState(Object.keys(SORTS)[0]);
  const [updatingArtistId, setUpdatingArtistId] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/admin/artist-artwork-info`,
          {
            headers: {
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
          },
        );

        const artistList = response.data.artists || [];

        setArtists(artistList.map(mapArtist));
      } catch (error) {
        console.error("Failed to fetch artists:", error);

        setError(
          error.response?.data?.message || "Failed to load artist information.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const specialties = useMemo(
    () => ["All specialties", ...new Set(artists.map((a) => a.specialty))],
    [artists],
  );
  const shown = useMemo(() => {
    const q = search.toLowerCase();

    return artists
      .filter(
        (a) => specialty === "All specialties" || a.specialty === specialty,
      )
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q),
      )
      .sort(SORTS[sort]);
  }, [artists, search, specialty, sort]);

  const patch = (id, changes) =>
    setArtists((as) => as.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  const toggleBlock = async (artist) => {
    try {
      setUpdatingArtistId(artist.id);
      setError("");

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const isSuspended = artist.status === "Suspended";

      const endpoint = isSuspended
        ? `${API_BASE_URL}/admin/active-artist/${artist.id}`
        : `${API_BASE_URL}/admin/block-artist/${artist.id}`;

      const response = await axios.patch(
        endpoint,
        {},
        {
          headers: {
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
        },
      );

      // Update frontend only after backend success
      setArtists((prevArtists) =>
        prevArtists.map((a) =>
          a.id === artist.id
            ? {
                ...a,
                status: isSuspended ? "Active" : "Suspended",
              }
            : a,
        ),
      );

      console.log(response.data.message);
    } catch (error) {
      console.error("Failed to update artist status:", error);

      setError(
        error.response?.data?.message || "Failed to update artist status.",
      );
    } finally {
      setUpdatingArtistId(null);
    }
  };

  const iconBtn =
    "grid h-8 w-8 place-items-center rounded-full text-[#A28F7D] transition-colors hover:bg-[#F3ECE5] hover:text-[#362F26]";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A28F7D]"
          />
          <input
            type="text"
            placeholder="Search artists…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-full border border-[#E8E1DB] bg-white pl-11 pr-4 text-[14px] text-[#362F26] placeholder:text-[#A28F7D] focus:border-[#9F5639] focus:outline-none"
          />
        </div>
        <Select
          value={specialty}
          onChange={setSpecialty}
          options={specialties}
        />
        <Select value={sort} onChange={setSort} options={Object.keys(SORTS)} />

        {/* Add artist button removed from here */}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E8E1DB] bg-white">
        {loading && (
          <div className="rounded-2xl border border-[#E8E1DB] bg-white p-10 text-center text-[#A28F7D]">
            Loading artists...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-600">
            {error}
          </div>
        )}
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E8E1DB] text-[11px] uppercase tracking-[0.08em] text-[#A28F7D]">
              {[
                "Artist",
                "Location",
                "Artworks",
                "Sales",
                "Rating",
                "Status",
                "Action",
              ].map((h) => (
                <th key={h} className="px-6 py-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              shown.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-[#E8E1DB] last:border-b-0 hover:bg-[#F9F8F6]"
                >
                  <td className="px-6 py-4">
                    <p className="text-[14px] text-[#362F26]">{a.name}</p>
                    <p className="text-[13px] text-[#A28F7D]">{a.specialty}</p>
                  </td>

                  <td className="px-6 py-4 text-[14px] text-[#362F26]">
                    {a.location}
                  </td>

                  <td className="px-6 py-4 text-[14px] text-[#362F26]">
                    {a.artworks}
                  </td>

                  <td className="px-6 py-4 text-[14px] text-[#362F26]">
                    {inr(a.sales)}
                  </td>

                  <td className="px-6 py-4 text-[14px] text-[#362F26]">
                    {a.rating ? a.rating.toFixed(1) : "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium ${TONE[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title={
                          a.status === "Suspended"
                            ? "Activate artist"
                            : "Suspend artist"
                        }
                        disabled={updatingArtistId === a.id}
                        className={`${iconBtn} hover:!text-[#9B3B2E] disabled:cursor-not-allowed disabled:opacity-50`}
                        onClick={() => toggleBlock(a)}
                      >
                        <Ban size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && !error && shown.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-[14px] text-[#A28F7D]"
                >
                  No artists found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
