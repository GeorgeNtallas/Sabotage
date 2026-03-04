import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import socket from "../../socket";

function Chat({
  show,
  onClose,
  character,
  playerSessionKey,
  roomSessionKey,
  onMessagesRead,
  isDesktop = false,
}) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    socket.on("chat_message", ({ playerName, message, senderSessionKey }) => {
      setMessages((prev) => [
        ...prev,
        { playerName, message, senderSessionKey },
      ]);
    });

    return () => socket.off("chat_message");
  }, []);

  useEffect(() => {
    if (show && onMessagesRead) {
      onMessagesRead();
    }
  }, [show, onMessagesRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, show]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    socket.emit("send_chat_message", {
      roomSessionKey,
      playerSessionKey,
      message: messageInput.trim(),
    });

    setMessageInput("");
  };

  if (!show) return null;

  if (isDesktop) {
    return (
      <div className="w-[350px] h-[400px] bg-black/95 backdrop-blur-lg border-2 border-purple-600/50 rounded-xl shadow-[0_0_30px_rgba(150,50,150,0.3)] flex flex-col z-10 relative overflow-hidden">
        {/* Purple glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-900 via-purple-500 to-purple-900"></div>

        {/* Header */}
        <div className="flex justify-center items-center p-3 border-b border-purple-500/30 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
          <h2
            className="text-lg font-bold text-purple-300 relative z-10"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {t("chat.title")}
          </h2>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((msg, idx) => {
            const isOwnMessage = msg.senderSessionKey === playerSessionKey;
            return (
              <div
                key={idx}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-2 ${
                    isOwnMessage
                      ? "bg-purple-700/60 border border-purple-500/50"
                      : "bg-zinc-900/80 border border-purple-500/20"
                  }`}
                >
                  <span
                    className="font-bold text-purple-300 text-xs"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    {msg.playerName}
                  </span>
                  <p className="text-purple-100 text-xs break-words">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-purple-500/30 flex flex-col gap-2 bg-black/50">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t("chat.placeholder") || "Type..."}
            className="w-full bg-zinc-900/80 text-purple-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-500/30"
            style={{ fontFamily: "MedievalSharp" }}
          />
          <button
            onClick={handleSendMessage}
            className="w-full bg-gradient-to-r from-purple-800 via-purple-700 to-violet-800 hover:from-purple-700 hover:via-purple-600 hover:to-violet-700 text-purple-200 text-xs font-bold px-3 py-2 rounded-lg transition border border-purple-600/50 shadow-[0_0_10px_rgba(150,50,150,0.3)]"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {t("chat.send") || "Send"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-black/95 backdrop-blur-lg rounded-xl border-2 border-purple-600/50 shadow-[0_0_40px_rgba(150,50,150,0.4)] w-[90%] max-w-md h-[500px] flex flex-col relative overflow-hidden"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Purple glow at top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-900 via-purple-500 to-purple-900"></div>

          {/* Corner decorations */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-purple-500 z-10"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-purple-500 z-10"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-500 z-10"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-500 z-10"></div>

          {/* Ambient glow effect */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-purple-900/20 blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-purple-500/30 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent"></div>
            <h2
              className="text-xl font-bold text-purple-300 relative z-10"
              style={{ fontFamily: "MedievalSharp" }}
            >
              {t("chat.title") || "Chat"}
            </h2>
            <button
              onClick={onClose}
              className="text-purple-400 hover:text-purple-200 text-2xl font-bold relative z-10 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => {
              const isOwnMessage = msg.senderSessionKey === playerSessionKey;
              return (
                <div
                  key={idx}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      isOwnMessage
                        ? "bg-purple-700/60 border border-purple-500/50"
                        : "bg-zinc-900/80 border border-purple-500/20"
                    }`}
                  >
                    <span
                      className="font-bold text-purple-300 text-sm"
                      style={{ fontFamily: "MedievalSharp" }}
                    >
                      {msg.playerName}
                    </span>
                    <p className="text-purple-100 text-sm break-words">
                      {msg.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-purple-500/30 flex gap-2 bg-black/50">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={t("chat.placeholder") || "Type a message..."}
              className="flex-1 bg-zinc-900/80 text-purple-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-500/30"
              style={{ fontFamily: "MedievalSharp" }}
            />
            <button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-purple-800 via-purple-700 to-violet-800 hover:from-purple-700 hover:via-purple-600 hover:to-violet-700 text-purple-200 font-bold px-6 py-2 rounded-lg transition border border-purple-600/50 shadow-[0_0_15px_rgba(150,50,150,0.3)]"
              style={{ fontFamily: "MedievalSharp" }}
            >
              {t("chat.send") || "Send"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Chat;
