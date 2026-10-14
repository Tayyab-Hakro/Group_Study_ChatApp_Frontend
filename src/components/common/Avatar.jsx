import React from "react";

export const Avatar = ({
  src,
  alt = "User",
  size = "md",
  isOnline = false,
  showStatus = false,
  className = "",
}) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-20 h-20 text-xl",
  };

  const statusSizeClasses = {
    xs: "w-1.5 h-1.5 bottom-0 right-0",
    sm: "w-2 h-2 bottom-0 right-0",
    md: "w-2.5 h-2.5 bottom-0.5 right-0.5",
    lg: "w-3 h-3 bottom-0.5 right-0.5",
    xl: "w-3.5 h-3.5 bottom-1 right-1",
    "2xl": "w-4 h-4 bottom-1 right-1",
  };

  const fallbackInitial = alt ? alt.charAt(0).toUpperCase() : "S";

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover ring-2 ring-slate-800 bg-slate-800`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(alt)}`;
          }}
        />
      ) : (
        <div
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner ring-2 ring-slate-800`}
        >
          {fallbackInitial}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute rounded-full border-2 border-slate-950 ${statusSizeClasses[size] || statusSizeClasses.md} ${
            isOnline ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-slate-500"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
};
