import { useState, useRef, useEffect } from "react";
import { chatWithBot } from "../../services/ai.service";
import toast from "react-hot-toast";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  if (!token) return null;

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Map local messages to Gemini history format
      const historyPayload = messages.map(msg => ({
        role: msg.isBot ? "model" : "user",
        parts: [{ text: msg.text }]
      }));

      const res = await chatWithBot(userMessage.text, historyPayload);
      const botMessage = { text: res.data.reply, isBot: true };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      toast.error("AI đang bận hoặc chưa cấu hình API Key!", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      {/* Nút bật/tắt Chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all animate-bounce-slow"
      >
        {isOpen ? "✕" : "🐾"}
      </button>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-orange-100 flex flex-col h-[500px] max-h-[80vh] animate-fade-in overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                🤖
              </div>
              <div>
                <h3 className="font-bold">PetSaver AI</h3>
                <p className="text-xs text-orange-100">Sẵn sàng tư vấn cho bé cưng 24/7</p>
              </div>
            </div>
            
            <button 
              onClick={() => setMessages([])}
              className="text-white hover:text-orange-200 transition-colors text-sm font-medium border border-orange-300 rounded-lg px-2 py-1 flex items-center gap-1 bg-orange-600/50 hover:bg-orange-600"
              title="Làm mới cuộc trò chuyện"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          {/* Tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-orange-50/30 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm mt-10">
                <span className="text-4xl opacity-50 block mb-2">👋</span>
                Hãy bắt đầu cuộc trò chuyện!
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.isBot ? "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none" : "bg-orange-500 text-white shadow-sm rounded-tr-none"}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-colors disabled:bg-gray-300"
            >
              ➤
            </button>
          </form>
        </div>
      )}
      
      <style>{`
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
      `}</style>
    </div>
  );
}
