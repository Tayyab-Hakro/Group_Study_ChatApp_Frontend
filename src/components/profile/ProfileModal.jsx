import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import { Avatar } from "../common/Avatar";
import { RefreshCw } from "lucide-react";

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [institution, setInstitution] = useState(user?.institution || "");
  const [major, setMajor] = useState(user?.major || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const res = await authService.updateProfile({
        name,
        bio,
        institution,
        major,
        avatar,
      });
      updateUser(res.data.user);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Avatar preview & change */}
        <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <Avatar src={avatar} alt={name} size="xl" />
          <div>
            <p className="text-sm font-semibold text-white">Profile Avatar</p>
            <p className="text-xs text-slate-400 mb-2">Generate a random robot avatar</p>
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate New Avatar
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            University / Institution
          </label>
          <input
            type="text"
            placeholder="e.g. Stanford University"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Major / Study Field
          </label>
          <input
            type="text"
            placeholder="e.g. Computer Science & AI"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Bio
          </label>
          <textarea
            rows="3"
            maxLength="200"
            placeholder="Tell fellow students about your study goals..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm resize-none"
          />
          <div className="text-right text-[11px] text-slate-500">{bio.length}/200</div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/25 transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
