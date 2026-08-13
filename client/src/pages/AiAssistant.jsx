import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Command, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { sendChatMessage } from "../services/aiApi";

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your AI Secretary powered by Groq. How can I assist you with your contacts, appointments, reminders, or calls today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    setError("");
    const userMsg = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(query);
      // Handles backend structure response.data.data.response or response.data.response
      const aiResponseText =
        response?.data?.response ||
        response?.data?.data?.response ||
        response?.message ||
        "I have processed your request.";

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: aiResponseText },
      ]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Sorry, I ran into an issue connecting to AI services.";
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `Error: ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const promptSuggestions = [
    "Show me all my contacts",
    "What are my upcoming appointments?",
    "Summarize my dashboard stats",
    "How many calls have I answered today?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-4">
      {/* Header Aura Card */}
      <div className="relative apple-card p-4 sm:p-6 rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 shrink-0">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 text-zinc-950 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Apple Intelligence Secretary
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-amber-300">
                  Active
                </span>
              </h1>
              <p className="text-xs text-zinc-300">
                Context-aware assistant integrated with your database modules
              </p>
            </div>
          </div>
        </div>
        {/* Glow accent */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 apple-card p-4 sm:p-6 rounded-3xl overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.sender === "user"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs"
                  : "bg-gradient-to-tr from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 text-amber-400 dark:text-amber-600"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap transition-all shadow-sm ${
                msg.sender === "user"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-tr-none font-medium"
                  : "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-2xl bg-zinc-900 text-amber-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 rounded-tl-none">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <span>AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {promptSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(suggestion)}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            💡 {suggestion}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative apple-card p-2 rounded-3xl flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask AI Secretary (e.g. 'Show me my contacts')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-all duration-200 shadow-md disabled:opacity-30 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;
