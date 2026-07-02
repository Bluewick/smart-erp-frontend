import React from "react";

export default function Button({
  children,
  onClick,
  isActive,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-lg px-5 py-2 font-medium transition-all duration-200 outline-none
      ${
        isActive
          ? "bg-amber-400 text-amber-950 shadow-sm"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
      }
      focus:ring-2 focus:ring-amber-500 ${className}`}
    >
      {children}
    </button>
  );
}
