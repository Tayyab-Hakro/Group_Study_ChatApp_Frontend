import React, { useState } from "react";
import {
  GraduationCap,
  Search,
  Plus,
  Compass,
  LogOut,
  User as UserIcon,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Avatar } from "./Avatar";

export const Navbar = ({
  isConnected,
  onOpenSearch,
  onOpenDiscover,
  onOpenCreateGroup,
  onOpenProfile,
}) => {
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Student<span className="text-brand-400">Connect</span>
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {isConnected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium">Live</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-400">Connecting...</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Students Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 text-xs sm:text-sm font-medium transition-all"
        >
          <Search className="w-4 h-4 text-brand-400" />
          <span className="hidden md:inline">Find Students</span>
        </button>

        {/* Discover Study Groups */}
        <button
          onClick={onOpenDiscover}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 text-xs sm:text-sm font-medium transition-all"
        >
          <Compass className="w-4 h-4 text-indigo-400" />
          <span className="hidden md:inline">Browse Groups</span>
        </button>

        {/* Create Group Button */}
        <button
          onClick={onOpenCreateGroup}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-brand-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Group</span>
        </button>

        {/* User Profile Menu */}
        <div className="relative ml-1 sm:ml-2">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <Avatar
              src={user?.avatar}
              alt={user?.name}
              size="sm"
              isOnline={true}
              showStatus={true}
            />
            <div className="hidden lg:block text-left text-xs">
              <p className="font-semibold text-slate-200 leading-tight">{user?.name}</p>
              <p className="text-slate-400 text-[11px] truncate max-w-[100px]">
                {user?.major || "Student"}
              </p>
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-dropdown p-2 shadow-2xl z-50 text-sm">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  {user?.institution && (
                    <p className="text-[11px] text-brand-400 mt-0.5 truncate">
                      {user.institution}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Edit Profile
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
