import React, { useState } from "react";

function EnterPasswordModal({ show, roomName, onSubmit, onCancel }) {
  const [pressedButton, setPressedButton] = useState(null);

  const medievalFontStyle = {
    fontFamily: "MedievalSharp",
    fontWeight: 400,
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-8 w-[350px] text-white">
        <h3
          className="text-white text-xl mb-4 text-center font-bold"
          style={medievalFontStyle}
        >
          Private Room:
          <span className="text-indigo-300 ml-3">{roomName}</span>
        </h3>
        <input
          type="password"
          placeholder="Enter room password"
          className="w-full mb-4 p-3 rounded-md bg-indigo-500/15 border border-white/40 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={medievalFontStyle}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onSubmit(e.target.value);
            }
          }}
        />
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              const password = e.target.parentElement.previousElementSibling.value;
              onSubmit(password);
            }}
            onMouseDown={() => setPressedButton("modalJoin")}
            onMouseUp={() => setPressedButton(null)}
            onMouseLeave={() => setPressedButton(null)}
            onTouchStart={() => setPressedButton("modalJoin")}
            onTouchEnd={() => setPressedButton(null)}
            className={`flex-1 py-3 bg-gradient-to-r bg-green-700 hover:bg-green-800 transition rounded-md font-bold border border-green-950 text-white ${
              pressedButton === "modalJoin" ? "scale-95 brightness-75" : ""
            }`}
            style={medievalFontStyle}
          >
            Join
          </button>
          <button
            onClick={onCancel}
            onMouseDown={() => setPressedButton("modalCancel")}
            onMouseUp={() => setPressedButton(null)}
            onMouseLeave={() => setPressedButton(null)}
            onTouchStart={() => setPressedButton("modalCancel")}
            onTouchEnd={() => setPressedButton(null)}
            className={`flex-1 py-3 bg-gradient-to-r bg-red-700 hover:bg-red-800 transition rounded-md font-bold border border-red-900 text-white ${
              pressedButton === "modalCancel" ? "scale-95 brightness-75" : ""
            }`}
            style={medievalFontStyle}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnterPasswordModal;