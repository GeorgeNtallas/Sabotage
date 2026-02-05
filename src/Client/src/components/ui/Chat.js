import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import socket from "../../socket";

function Chat({ show, onClose, character, playerSessionKey, roomSessionKey, onMessagesRead }) {
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
  }, [messages]);

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

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border-2 border-slate-600 shadow-2xl w-[90%] max-w-md h-[500px] flex flex-col"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-600">
            <h2 className="text-xl font-bold text-white">
              {t("chat.title") || "Chat"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, idx) => {
              const isOwnMessage = msg.senderSessionKey === playerSessionKey;
              return (
                <div
                  key={idx}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-2 ${
                      isOwnMessage ? "bg-indigo-600/80" : "bg-slate-700/50"
                    }`}
                  >
                    <span className="font-bold text-amber-400 text-sm">
                      {msg.playerName}
                    </span>
                    <p className="text-gray-200 text-sm break-words">
                      {msg.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-600 flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={t("chat.placeholder") || "Type a message..."}
              className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2 rounded-lg transition"
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
