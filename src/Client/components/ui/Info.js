import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedWindow({ triggerLabel = "Menu" }) {
  const [open, setOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);
  const [activeTab, setActiveTab] = useState("option1");

  const handleOpen = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setButtonRect(rect);
    setOpen(true);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="px-4 py-2 rounded-md bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition"
      >
        {triggerLabel}
      </button>

      {/* Animated Window */}
      <AnimatePresence>
        {open && buttonRect && (
          <motion.div
            className="fixed z-50"
            initial={{
              top: buttonRect.top,
              left: buttonRect.left,
              width: buttonRect.width,
              height: buttonRect.height,
              opacity: 0,
            }}
            animate={{
              top: "20%",
              left: "50%",
              x: "-50%",
              width: 420,
              height: 320,
              opacity: 1,
            }}
            exit={{
              top: buttonRect.top,
              left: buttonRect.left,
              width: buttonRect.width,
              height: buttonRect.height,
              opacity: 0,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="w-[90%] h-full ml-5 justify-center flex flex-col rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 overflow-hidden">
              {/* Tab buttons */}
              <div className="flex gap-2 p-2 border-b border-slate-700 bg-slate-800">
                <button
                  onClick={() => setActiveTab("option1")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option1"
                      ? "bg-purple-700 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  Phases Info
                </button>
                <button
                  onClick={() => setActiveTab("option2")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option2"
                      ? "bg-purple-700 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  Characters
                </button>
                <button
                  onClick={() => setActiveTab("option3")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option3"
                      ? "bg-purple-700 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  Rules and Tips
                </button>
              </div>

              {/* Content area */}
              <div className="flex-1 p-4 text-gray-200 overflow-auto">
                {activeTab === "option1" && (
                  <div>
                    <h2 className="text-lg font-bold text-purple-400 mb-2">
                      Phases Info
                    </h2>
                    <p>
                      This is where you can display **game instructions**,
                      player guides, or rules of sabotage.
                    </p>
                  </div>
                )}
                {activeTab === "option2" && (
                  <div>
                    <h2 className="text-lg font-bold text-amber-400 mb-2">
                      Characters in the Game
                    </h2>
                    <p>
                      This could show **live stats**, socket.io events, or phase
                      history.
                    </p>
                  </div>
                )}
                {activeTab === "option3" && (
                  <div>
                    <h2 className="text-lg font-bold text-red-400 mb-2">
                      Rules and Tips
                    </h2>
                    <p>
                      This can hold **settings**, exit options, or secret role
                      info (if visible).
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Close button */}
              <div className="p-2 border-t border-slate-700 flex justify-end bg-slate-800">
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
