import { useEffect, useRef, useState } from "react";
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

type Message = { role: "assistant" | "user"; text: string; time: string };

const QUICK_QUESTIONS = [
  "¿Cómo mezclo la resina?",
  "¿Qué moldes tienen?",
  "¿Cómo elimino burbujas?",
  "¿Cómo empiezo desde cero?",
  "¿Cuánto tarda en curar?",
  "¿Hacen envíos?",
];

const now = () => new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

const formatText = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
};

export default function AssistantRossy() {
  const [open, setOpen]           = useState(false);
  const [bubble, setBubble]       = useState(false);
  const [messages, setMessages]   = useState<Message[]>([
    { role: "assistant", text: "¡Hola! 👋 Soy **Asistente Rossy**, tu experta en resina y artesanía. ¿En qué puedo ayudarte hoy?", time: now() },
  ]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setBubble(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: msg, time: now() }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.slice(1).map((m) => ({ role: m.role, text: m.text }));
      const res  = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg, history: history.slice(0, -1) }) });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${data.detail || data.error || "Intenta de nuevo"}`, time: now() }]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer || "Lo siento, no pude procesar tu pregunta.", time: now() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Hubo un error al conectar. Por favor intenta de nuevo. 🙏", time: now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => { setOpen(true); setBubble(false); };

  return (
    <div className="fixed bottom-24 right-4 z-[70] md:bottom-6 flex flex-col items-end gap-2">

      {/* Burbuja */}
      {bubble && !open && (
        <div className="flex items-end gap-2 animate-fadeInUp">
          <div className="relative max-w-[220px] rounded-2xl rounded-br-none bg-white px-4 py-3 shadow-xl border border-gray-100">
            <p className="text-[11px] font-bold mb-1" style={{ color: "#6E2CA1" }}>Asistente Rossy ✨</p>
            <p className="text-xs text-gray-700 leading-snug">¡Hola! ¿Tienes dudas sobre resina o artesanía? ¡Puedo ayudarte! 😊</p>
            <div className="absolute -bottom-2 right-0 w-3 h-3 bg-white border-r border-b border-gray-100" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
          </div>
          <button onClick={() => setBubble(false)} className="mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 text-xs">✕</button>
        </div>
      )}

      {/* Ventana del chat */}
      {open && (
        <div className="w-80 md:w-96 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-zoomIn" style={{ height: "520px" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: "linear-gradient(135deg, #6E2CA1, #cb299e)" }}>
            <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border-2 border-white/30">
              <Image src="/favicon-96x96.png" alt="Rossy Resina" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Asistente Rossy</p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                <p className="text-[11px] text-white/80">En línea · Experta en resina</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50 sidebar-scroll">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {m.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full shrink-0 overflow-hidden border border-purple-200 mt-1">
                    <Image src="/favicon-96x96.png" alt="Rossy" width={28} height={28} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className={`max-w-[78%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "text-white rounded-tr-none"
                        : "bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100"
                    }`}
                    style={m.role === "user" ? { background: "linear-gradient(135deg, #6E2CA1, #cb299e)" } : {}}
                    dangerouslySetInnerHTML={{ __html: formatText(m.text) }}
                  />
                  <span className="text-[10px] text-gray-400 px-1">{m.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full shrink-0 overflow-hidden border border-purple-200">
                  <Image src="/favicon-96x96.png" alt="Rossy" width={28} height={28} className="h-full w-full object-cover" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Preguntas rápidas */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-white shrink-0">
              <p className="text-[10px] text-gray-400 mb-1.5 font-medium">Preguntas frecuentes:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-gray-100 bg-white shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
                className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 disabled:opacity-60 bg-gray-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white transition disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #6E2CA1, #cb299e)" }}
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={handleOpen}
        aria-label="Abrir asistente Rossy"
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 overflow-hidden border-2 border-white"
        style={{ background: "linear-gradient(135deg, #6E2CA1, #cb299e)" }}
      >
        <Image src="/favicon-96x96.png" alt="Asistente Rossy" width={56} height={56} className="h-full w-full object-cover" />
      </button>
    </div>
  );
}
