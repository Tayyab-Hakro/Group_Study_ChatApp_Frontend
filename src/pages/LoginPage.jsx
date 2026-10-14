import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { GraduationCap, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      // Error handled by store
    }
  };

  const handleQuickDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/20 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome to Student<span className="text-brand-400">Connect</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Log in to collaborate with fellow students and study circles
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Student Fill Pills */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-xs font-semibold text-slate-400 mb-2 text-center">
            Quick Demo Autofill:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("alice@student.edu", "student123")}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-center transition-colors"
            >
              Demo: <span className="font-semibold text-brand-300">Alice</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("bob@student.edu", "student123")}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-center transition-colors"
            >
              Demo: <span className="font-semibold text-indigo-300">Bob</span>
            </button>
          </div>
        </div>

        {/* Sign Up Redirect */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account yet?{" "}
          <Link
            to="/register"
            className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};
