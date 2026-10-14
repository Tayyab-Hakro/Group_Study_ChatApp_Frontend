import React, { useState, useEffect, useRef } from "react";
import { Avatar } from "../common/Avatar";
import { MessageBubble } from "./MessageBubble";
import { AttachmentPreview } from "./AttachmentPreview";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { usePresenceStore } from "../../store/presenceStore";
import { fileService } from "../../services/fileService";
import {
  Phone,
  Video,
  Paperclip,
  Send,
  Info,
  Loader2,
  Users,
  BookOpen,
} from "lucide-react";

export const ChatArea = ({
  conversation,
  onStartCall,
  onOpenGroupDetails,
  emitTyping,
  emitStopTyping,
  sendSocketMessage,
}) => {
  const { user: currentUser } = useAuthStore();
  const {
    messages: allMessages,
    pagination,
    fetchMessages,
    typingStatus,
  } = useChatStore();
  const { isOnline } = usePresenceStore();

  const conversationId = conversation?._id;
  const messages = allMessages[conversationId] || [];
  const paging = pagination[conversationId] || { hasMore: false, isLoading: false };

  const [inputContent, setInputContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isGroup = conversation?.type === "group";
  const peer = isGroup
    ? null
    : conversation?.participants?.find((p) => p._id !== currentUser?._id);

  const title = isGroup
    ? conversation.groupDetails?.name || "Study Group"
    : peer?.name || "Student";
  const avatar = isGroup ? conversation.groupDetails?.avatar : peer?.avatar;
  const peerOnline = !isGroup && peer ? isOnline(peer._id) : false;

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Handle typing debounce
  const handleInputChange = (e) => {
    setInputContent(e.target.value);

    if (conversationId && emitTyping) {
      emitTyping(conversationId);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (emitStopTyping) emitStopTyping(conversationId);
      }, 2500);
    }
  };

  // Handle file attachment selection & upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await fileService.uploadFile(file);
      const uploadedFile = res.data.file;
      setAttachments((prev) => [...prev, uploadedFile]);
    } catch (err) {
      alert(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle message submission
  const handleSend = (e) => {
    e?.preventDefault();
    if ((!inputContent.trim() && attachments.length === 0) || isSending) return;

    if (emitStopTyping && conversationId) {
      emitStopTyping(conversationId);
    }

    setIsSending(true);

    const messageData = {
      conversationId,
      content: inputContent.trim(),
      messageType: attachments.length > 0 ? (attachments[0].fileType.startsWith("image/") ? "image" : "file") : "text",
      attachments,
    };

    sendSocketMessage(messageData, (response) => {
      setIsSending(false);
      if (response?.error) {
        alert(response.error);
      } else {
        setInputContent("");
        setAttachments([]);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Active typing participants map
  const activeTypers = Array.from(
    (typingStatus[conversationId] || new Map()).values()
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Chat Area Header */}
      <div className="h-16 px-4 sm:px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar
            src={avatar}
            alt={title}
            size="md"
            isOnline={peerOnline}
            showStatus={!isGroup}
          />
          <div>
            <h3 className="font-bold text-white text-base leading-tight flex items-center gap-2">
              {title}
            </h3>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              {isGroup ? (
                <>
                  <span className="flex items-center gap-1 text-brand-400">
                    <BookOpen className="w-3 h-3" />
                    {conversation.groupDetails?.subjectOrTopic || "Study Group"}
                  </span>
                  <span>•</span>
                  <span>{conversation.participants?.length || 0} students</span>
                </>
              ) : peerOnline ? (
                <span className="text-emerald-400 font-medium">Active now</span>
              ) : (
                <span>{peer?.major || "Student"}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio Call */}
          <button
            onClick={() => onStartCall(conversationId, title, false)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Start Voice Call"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          {/* Video Call */}
          <button
            onClick={() => onStartCall(conversationId, title, true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-400 hover:text-white border border-brand-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Start Video Call"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Video Call</span>
          </button>

          {/* Group details button */}
          {isGroup && (
            <button
              onClick={onOpenGroupDetails}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="Group Roster & Settings"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1">
        {/* Load more indicator */}
        {paging.hasMore && (
          <div className="text-center py-2">
            <button
              onClick={() => fetchMessages(conversationId, true)}
              disabled={paging.isLoading}
              className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors disabled:opacity-50"
            >
              {paging.isLoading ? "Loading earlier messages..." : "Load earlier messages"}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold text-slate-300">
              Beginning of collaboration with {title}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Ask a question, share homework notes, or upload a PDF document to begin.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isSelf={msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id}
              showSender={isGroup}
            />
          ))
        )}

        {/* Live Typing Indicator */}
        {activeTypers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-brand-400 py-1 italic animate-pulse">
            <span className="w-2 h-2 rounded-full bg-brand-400" />
            <span>
              {activeTypers.join(", ")} {activeTypers.length === 1 ? "is" : "are"} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Staging Area */}
      <AttachmentPreview
        attachments={attachments}
        onRemove={handleRemoveAttachment}
        isUploading={isUploading}
      />

      {/* Message Input Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* File input trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors disabled:opacity-50"
            title="Attach PDF, notes or images"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <input
            type="text"
            placeholder={`Message ${title}...`}
            value={inputContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={(!inputContent.trim() && attachments.length === 0) || isSending}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all disabled:opacity-40 disabled:hover:bg-brand-600"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
