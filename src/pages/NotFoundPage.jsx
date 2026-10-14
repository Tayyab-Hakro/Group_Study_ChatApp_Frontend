import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Home } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white text-center">
      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 mb-6 shadow-xl">
        <GraduationCap className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-extrabold text-brand-500 mb-2">404</h1>
      <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        The study room or page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/25 text-sm"
      >
        <Home className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
};
