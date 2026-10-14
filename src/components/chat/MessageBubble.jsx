import React from "react";
import { Avatar } from "../common/Avatar";
import {
  FileText,
  Download,
  Check,
  CheckCheck,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

export const MessageBubble = ({ message, isSelf, showSender = false }) => {
  const { sender, content, attachments = [], createdAt, readBy = [] } = message;

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const isReadByOthers = readBy.length > 1;

  return (
    <div
      className={`flex items-end gap-2.5 my-2.5 ${
        isSelf ? "justify-end" : "justify-start"
      }`}
    >
      {!isSelf && (
        <Avatar
          src={sender?.avatar}
          alt={sender?.name || "Student"}
          size="sm"
          className="mb-1"
        />
      )}

      <div
        className={`max-w-[85%] sm:max-w-md md:max-w-lg rounded-2xl p-3.5 shadow-sm transition-all ${
          isSelf
            ? "bg-brand-600 text-white rounded-br-none"
            : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60"
        }`}
      >
        {/* Sender name for group chats */}
        {showSender && !isSelf && (
          <p className="text-[11px] font-bold text-brand-300 mb-1 leading-none">
            {sender?.name}
          </p>
        )}

        {/* Text content */}
        {content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words select-text font-normal">
            {content}
          </p>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2 mt-2">
            {attachments.map((file, idx) => {
              const isImage = file.fileType?.startsWith("image/");
              const fullUrl = file.fileUrl.startsWith("http")
                ? file.fileUrl
                : `http://localhost:5000${file.fileUrl}`;

              return isImage ? (
                <div key={idx} className="relative group overflow-hidden rounded-xl">
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden"
                  >
                    <img
                      src={fullUrl}
                      alt={file.fileName}
                      className="max-h-60 w-auto rounded-xl object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                </div>
              ) : (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    isSelf
                      ? "bg-brand-700/60 border-brand-500/40"
                      : "bg-slate-900/80 border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelf ? "bg-brand-500 text-white" : "bg-brand-500/10 text-brand-400"
                      }`}
                    >
                      <FileText className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold truncate text-white">
                        {file.fileName}
                      </p>
                      <p className="text-[10px] opacity-75">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  </div>

                  <a
                    href={fullUrl}
                    download={file.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg hover:bg-black/20 text-white/90 hover:text-white transition-colors ml-2 flex-shrink-0"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Timestamp & read receipts */}
        <div
          className={`flex items-center justify-end gap-1.5 text-[10px] mt-1.5 ${
            isSelf ? "text-brand-100" : "text-slate-400"
          }`}
        >
          <span>{formatTime(createdAt)}</span>
          {isSelf && (
            <span>
              {isReadByOthers ? (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-300" title="Read" />
              ) : (
                <Check className="w-3.5 h-3.5 opacity-80" title="Sent" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
