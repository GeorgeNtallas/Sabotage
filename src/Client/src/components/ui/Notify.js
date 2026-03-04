import React from "react";

const Notify = ({ message, show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 w-[85%] max-w-sm min-w-[320px] z-10 animate-fadeIn">
      <div
        className="bg-black/90 backdrop-blur-lg border border-amber-600/50 rounded-lg shadow-[0_0_20px_rgba(200,100,50,0.3)] px-5 py-3 flex items-center justify-center gap-3 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(30, 20, 10, 0.95) 0%, rgba(20, 15, 10, 0.98) 100%)",
        }}
      >
        {/* Corner decorations */}
        <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-amber-500"></div>
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-amber-500"></div>
        <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-amber-500"></div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-amber-500"></div>

        {/* Glow effect behind icon */}
        <div
          className="absolute w-8 h-8 rounded-full blur-md pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 150, 50, 0.3) 0%, transparent 70%)",
          }}
        ></div>

        <div className="flex-shrink-0 animate-pulse">
          <svg
            className="w-5 h-5 text-amber-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p
          className="text-amber-100 text-sm font-medium tracking-wide text-center"
          style={{ fontFamily: "MedievalSharp" }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default Notify;
