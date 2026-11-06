import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Send,
  Check,
  CheckCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
  Forward,
  Info,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/config/api";

const WALLPAPER = [
  { emoji: "🎨", left: "8%", top: "9%", rotate: "-14deg" },
  { emoji: "✨", left: "32%", top: "17%", rotate: "12deg" },
  { emoji: "🌿", left: "72%", top: "10%", rotate: "10deg" },
  { emoji: "🖼️", left: "89%", top: "27%", rotate: "-10deg" },
  { emoji: "🤎", left: "18%", top: "38%", rotate: "8deg" },
  { emoji: "🌸", left: "49%", top: "43%", rotate: "-12deg" },
  { emoji: "🖌️", left: "81%", top: "51%", rotate: "14deg" },
  { emoji: "💌", left: "7%", top: "66%", rotate: "-8deg" },
  { emoji: "⭐", left: "36%", top: "73%", rotate: "12deg" },
  { emoji: "🏺", left: "67%", top: "70%", rotate: "-14deg" },
  { emoji: "🌷", left: "90%", top: "85%", rotate: "10deg" },
  { emoji: "🪴", left: "53%", top: "91%", rotate: "12deg" },
];

export default function Messages() {
  const { user } = useAuth();

  const artistId = user?._id || user?.id || user?.userId;
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in first.");
        }

        const response = await fetch(
          `${API_BASE_URL}/artwork/conversation`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch conversations.");
        }

        const formattedConversations = (result.findConver || []).map(
          (conversation) => ({
            id: conversation._id,
            name: conversation.buyer_id?.name || "Unknown Buyer",
            subject: conversation.subject || "General Inquiry",
            unread: false,
            msgs: [],
          }),
        );

        setThreads(formattedConversations);
      } catch (error) {
        console.error("Fetch conversations error:", error);
        setError(error.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeId) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setMessageError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/artwork/conversation/${activeId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch messages.");
        }

        const conversation = result.findConver;

        const formattedMessages = (conversation?.conversation || []).map(
          (message) => ({
            id: message._id,
            text: message.message || "",
            from:
              String(message.messageBy) === String(artistId) ? "me" : "them",
            time: message.messageTimeDate
              ? new Date(message.messageTimeDate).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
          }),
        );

        setThreads((previousThreads) =>
          previousThreads.map((thread) =>
            thread.id === activeId
              ? {
                  ...thread,
                  name: conversation.buyer_id?.name || thread.name,
                  subject: conversation.subject || thread.subject,
                  msgs: formattedMessages,
                }
              : thread,
          ),
        );
      } catch (error) {
        console.error("Fetch messages error:", error);
        setMessageError(error.message || "Something went wrong.");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeId, artistId]);

  const active = threads.find((t) => t.id === activeId);

  const open = (id) => {
    setActiveId(id);
  };

  const send = async (e) => {
    e.preventDefault();

    const body = text.trim();

    if (!body || !activeId || sending) return;

    try {
      setSending(true);
      setMessageError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in first.");
      }

      // Step 1: Send message to backend
      const response = await fetch(
        `${API_BASE_URL}/artwork/conversation/${activeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: body,
          }),
        },
      );

      const responseText = await response.text();

      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.message || "Failed to send message.");
      }

      // Step 2: Fetch updated conversation messages
      const updatedResponse = await fetch(
        `${API_BASE_URL}/artwork/conversation/${activeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedResult = await updatedResponse.json();

      if (!updatedResponse.ok) {
        throw new Error(
          updatedResult.message ||
            "Message sent, but failed to refresh conversation.",
        );
      }

      const conversation = updatedResult.findConver;

      // Step 3: Format messages for frontend
      const formattedMessages = (conversation?.conversation || []).map(
        (message) => ({
          id: message._id,
          text: message.message || "",
          from: String(message.messageBy) === String(artistId) ? "me" : "them",
          time: message.messageTimeDate
            ? new Date(message.messageTimeDate).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        }),
      );

      // Step 4: Update conversation UI
      setThreads((previousThreads) =>
        previousThreads.map((thread) =>
          thread.id === activeId
            ? {
                ...thread,
                msgs: formattedMessages,
              }
            : thread,
        ),
      );

      // Step 5: Clear input
      setText("");
    } catch (error) {
      console.error("Send message error:", error);
      setMessageError(error.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 sm:py-5 lg:p-6"
    >
      {loading && (
        <p className="py-10 text-center text-[#806D60]">
          Loading conversations...
        </p>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <div
        className="
    grid h-[calc(100dvh-170px)] min-h-[460px]
    grid-rows-[125px_minmax(0,1fr)]
    overflow-hidden rounded-[22px]
    border border-[#E7DDD6] bg-white
    shadow-[0_10px_35px_rgba(65,43,31,0.075)]
    md:h-[calc(100vh-190px)] md:min-h-[480px]
    md:grid-cols-[280px_minmax(0,1fr)]
    md:grid-rows-1
    lg:grid-cols-[320px_minmax(0,1fr)]
  "
      >
        <div
          className="
    flex min-h-0 gap-2 overflow-x-auto
    border-b border-[#E8E1DB]
    bg-[linear-gradient(180deg,#FFFCFA_0%,#FAF5F0_100%)]
    px-3 py-2
    md:block md:overflow-x-hidden md:overflow-y-auto
    md:border-b-0 md:border-r md:px-0 md:py-0
  "
        >
          <div
            className="
    flex min-w-[175px] shrink-0 items-center justify-between
    rounded-xl border border-[#E8DDD4] bg-white px-3 py-2
    md:sticky md:top-0 md:z-10 md:w-full
    md:rounded-none md:border-x-0 md:border-t-0
    md:border-b md:border-[#E8DDD4]
    md:bg-[#FFFCFA] md:px-5 md:py-3
  "
          >
            <span className="font-serif text-[16px] text-[#362F26]">
              Messages
            </span>

            <button
              type="button"
              title="Clear all chats"
              onClick={() => setShowClearConfirm(true)}
              className="
      group inline-flex cursor-pointer items-center gap-1.5
      rounded-full border border-transparent px-2.5 py-2
      text-[11px] font-medium text-[#8A6B5A]
      transition-all duration-200
      hover:border-[#EBCFC9] hover:bg-[#FFF1ED]
      hover:text-[#9B3B2E]
      hover:shadow-[0_4px_12px_rgba(155,59,46,0.08)]
      active:scale-95
    "
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Clear all</span>
            </button>
          </div>
          {threads.map((t, index) => (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => open(t.id)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`
      group relative min-w-[190px] shrink-0
      rounded-xl border px-3 py-2.5 text-left
      transition-colors duration-200
      hover:shadow-[0_5px_14px_rgba(65,43,31,0.07)]

      md:block md:w-full md:min-w-0
      md:rounded-none md:border-x-0 md:border-t-0
      md:border-b md:border-[#E8E1DB]
      md:px-5 md:py-4 md:hover:shadow-none

      ${
        t.id === activeId
          ? "border-[#D9BBAA] bg-[#F5E8DF] shadow-[inset_3px_0_0_#9F5639] md:border-transparent md:bg-[#F9F1EB]"
          : "border-[#E8E1DB] bg-white hover:bg-[#FFFCFA] md:border-transparent md:bg-transparent"
      }
    `}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`truncate text-[13.5px] text-[#362F26] ${
                    t.unread ? "font-semibold" : "font-medium"
                  }`}
                >
                  {t.name}
                </span>

                {t.unread && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#9F5639] shadow-[0_0_0_3px_rgba(159,86,57,0.09)]" />
                )}
              </div>

              <p className="mt-1 truncate text-[12px] text-[#958073]">
                {t.subject}
              </p>
            </motion.button>
          ))}

          {threads.length === 0 && (
            <p className="min-w-[175px] px-4 py-6 text-center text-[12px] text-[#958073] md:min-w-0">
              No conversations yet.
            </p>
          )}
        </div>

        <div className="flex min-h-0 flex-col">
          {active ? (
            <>
              {/* Active Chat Header */}
              <div
                className="
          shrink-0 border-b border-[#E8E1DB]
          bg-[linear-gradient(110deg,#FFFFFF_0%,#FFFAF6_100%)]
          px-4 py-3.5
          shadow-[0_3px_12px_rgba(65,43,31,0.025)]
          sm:px-6 sm:py-4
        "
              >
                <p className="text-[15px] text-[#362F26]">{active.name}</p>

                <p className="text-[12.5px] text-[#A28F7D]">{active.subject}</p>
              </div>

              {/* Messages */}
              <div
                className="
          relative min-h-0 flex-1 overflow-y-auto
          bg-[linear-gradient(135deg,#FCF8F4_0%,#F8F0E9_48%,#FFFCFA_100%)]
        "
              >
                {/* Decorative wallpaper */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 select-none overflow-hidden"
                >
                  {WALLPAPER.map((item, index) => (
                    <span
                      key={index}
                      className="absolute text-[20px] opacity-[0.14] sm:text-[23px]"
                      style={{
                        left: item.left,
                        top: item.top,
                        transform: `rotate(${item.rotate})`,
                      }}
                    >
                      {item.emoji}
                    </span>
                  ))}
                </div>

                {/* Messages */}
                <div className="relative z-10 space-y-3 p-3 sm:space-y-4 sm:p-6">
                  {loadingMessages ? (
                    <p className="py-10 text-center text-sm text-[#958073]">
                      Loading messages...
                    </p>
                  ) : messageError ? (
                    <p className="py-10 text-center text-sm text-red-600">
                      {messageError}
                    </p>
                  ) : active.msgs.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#958073]">
                      No messages in this conversation yet.
                    </p>
                  ) : (
                    active.msgs.map((m, i) => (
                      // Keep your existing motion.div message UI here
                      <motion.div
                        key={`${active.id}-${i}`}
                        initial={{
                          opacity: 0,
                          y: 10,
                          x: m.from === "me" ? 8 : -8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          x: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(i * 0.035, 0.18),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={`flex ${
                          m.from === "me" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`
                  max-w-[90%] break-words
                  rounded-[18px] px-3.5 py-2.5
                  text-[13px] leading-relaxed
                  shadow-[0_3px_10px_rgba(65,43,31,0.045)]
                  sm:max-w-[80%] sm:px-4 sm:py-3
                  lg:max-w-[72%]

                  ${
                    m.from === "me"
                      ? "rounded-br-[5px] border border-[#975036] bg-[linear-gradient(135deg,#A85D3E_0%,#91472F_100%)] text-white shadow-[0_5px_14px_rgba(145,71,47,0.13)]"
                      : "rounded-bl-[5px] border border-[#EAE0D8] bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFAF6_100%)] text-[#44352C]"
                  }
                `}
                        >
                          <p className="whitespace-pre-wrap">{m.text}</p>

                          <p
                            className={`mt-1.5 text-right text-[10px] ${
                              m.from === "me"
                                ? "text-white/70"
                                : "text-[#9B887A]"
                            }`}
                          >
                            {m.time}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Message Input */}
              <form
                onSubmit={send}
                className="flex gap-3 border-t border-[#E8E1DB] p-4"
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
                  className="
            h-11 min-w-0 flex-1 rounded-full
            border border-[#E6DAD1] bg-[#FFFCFA]
            px-4 text-[13px] text-[#362F26]
            outline-none placeholder:text-[#A28F7D]
            shadow-[inset_0_1px_3px_rgba(65,43,31,0.025)]
            transition-all duration-200
            focus:border-[#C69B85] focus:bg-white
            focus:ring-4 focus:ring-[#9F5639]/[0.08]
            sm:h-12 sm:px-5 sm:text-[14px]
          "
                />

                <motion.button
                  type="submit"
                  disabled={!text.trim() || sending}
                  whileHover={
                    text.trim()
                      ? {
                          y: -2,
                          scale: 1.05,
                          boxShadow: "0 9px 20px rgba(159,86,57,0.26)",
                        }
                      : undefined
                  }
                  whileTap={text.trim() ? { scale: 0.92, y: 0 } : undefined}
                  aria-label="Send message"
                  className="
            grid h-11 w-11 shrink-0 cursor-pointer
            place-items-center rounded-full
            border border-[#9F5639]
            bg-[linear-gradient(135deg,#A85D3E_0%,#91472F_100%)]
            text-white
            shadow-[0_4px_12px_rgba(159,86,57,0.17)]
            transition-colors duration-200
            hover:border-[#85432C] hover:bg-[#8A4A30]
            disabled:cursor-not-allowed
            disabled:border-[#D8C8BE]
            disabled:bg-[#E9DED6]
            disabled:text-[#A28F7D]
            disabled:shadow-none
            sm:h-12 sm:w-12
          "
                >
                  {sending ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Send size={17} strokeWidth={2} />
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            /* Empty State */
            <div
              className="
        relative flex min-h-0 flex-1 items-center
        justify-center overflow-hidden
        bg-[linear-gradient(135deg,#FCF8F4_0%,#F8F0E9_48%,#FFFCFA_100%)]
      "
            >
              {/* Decorative wallpaper */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 select-none overflow-hidden"
              >
                {WALLPAPER.map((item, index) => (
                  <span
                    key={index}
                    className="absolute text-[20px] opacity-[0.10] sm:text-[23px]"
                    style={{
                      left: item.left,
                      top: item.top,
                      transform: `rotate(${item.rotate})`,
                    }}
                  >
                    {item.emoji}
                  </span>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 px-6 text-center"
              >
                <div
                  className="
            mx-auto grid h-16 w-16 place-items-center
            rounded-full border border-[#E6D5C8]
            bg-[#F8EDE5]
            text-[#9F5639]
            shadow-[0_8px_24px_rgba(65,43,31,0.07)]
          "
                >
                  <Send size={24} strokeWidth={1.6} />
                </div>

                <h3 className="mt-5 text-[17px] font-medium text-[#362F26]">
                  Your messages
                </h3>

                <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-6 text-[#A28F7D]">
                  Select a conversation from the left to view your messages.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
