import React from "react";
import { Crown, Shield, GraduationCap } from "lucide-react";

export const RoleBadge = ({ role }) => {
  switch (role) {
    case "creator":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Crown className="w-3 h-3 text-amber-400" />
          Creator
        </span>
      );
    case "moderator":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Shield className="w-3 h-3 text-indigo-400" />
          Moderator
        </span>
      );
    case "student":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          <GraduationCap className="w-3 h-3 text-slate-400" />
          Student
        </span>
      );
  }
};
