import React from "react";
import { FileText, Image as ImageIcon, X, Loader2 } from "lucide-react";

export const AttachmentPreview = ({ attachments, onRemove, isUploading }) => {
  if (!attachments || attachments.length === 0) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-slate-900/90 border-t border-slate-800 animate-fadeIn">
      {attachments.map((file, idx) => {
        const isImage = file.fileType?.startsWith("image/");
        return (
          <div
            key={idx}
            className="relative group flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-slate-700 max-w-xs shadow-md"
          >
            {isImage ? (
              <img
                src={file.fileUrl}
                alt={file.fileName}
                className="w-10 h-10 rounded-lg object-cover bg-slate-900"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <FileText className="w-5 h-5" />
              </div>
            )}

            <div className="overflow-hidden pr-4">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {file.fileName}
              </p>
              <p className="text-[11px] text-slate-400">
                {formatFileSize(file.fileSize)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      {isUploading && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-brand-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading attachment...</span>
        </div>
      )}
    </div>
  );
};
