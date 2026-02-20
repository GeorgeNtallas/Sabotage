import React from "react";

const Notify = ({ message, show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-sm border border-amber-600/50 rounded-lg shadow-2xl px-5 py-3 flex items-center justify-center gap-3">
        <div className="flex-shrink-0 animate-blink">
          <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-amber-100 text-sm font-medium tracking-wide text-center" style={{ fontFamily: "MedievalSharp" }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default Notify;
