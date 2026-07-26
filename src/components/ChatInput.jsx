import React, { useState, useRef } from 'react';
import { Send, Sparkles, Paperclip, X, FileText, Film, Image as ImageIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { processAttachment } from '../services/fileProcessing';

export default function ChatInput({ lang, onSend, disabled, hasApiKey, onError }) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  const handleFileClick = () => {
    if (disabled || isProcessingFile) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (attachments.length + files.length > 4) {
      if (onError) onError('Максимум 4 вложения в одном сообщении');
    }

    setIsProcessingFile(true);
    try {
      const remainingSlots = 4 - attachments.length;
      const filesToProcess = files.slice(0, remainingSlots);

      const processedItems = await Promise.all(
        filesToProcess.map(file => processAttachment(file))
      );

      setAttachments(prev => [...prev, ...processedItems.filter(Boolean)]);
    } catch (err) {
      console.error("Error processing files:", err);
      if (onError) onError(err.message || 'Ошибка обработки файла');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((text.trim() || attachments.length > 0) && !disabled && !isProcessingFile) {
      onSend({ text: text.trim(), attachments });
      setText('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSubmit = (text.trim().length > 0 || attachments.length > 0) && !disabled && !isProcessingFile;

  return (
    <div className="w-full relative mt-4 mb-4">
      {/* Hidden File Input with 'multiple' */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,.txt,.pdf,video/mp4,video/webm,video/mov"
        multiple
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
        
        <div className="relative flex flex-col bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-2 focus-within:border-zinc-700 transition-colors shadow-2xl">
          
          {/* Attachments Preview Bar */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mx-2 mt-1 mb-2 p-2 rounded-2xl bg-[#141414] border border-[#262626]">
              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 pr-2 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] relative group">
                  {/* Thumbnail or File Icon */}
                  {att.thumbnail ? (
                    <img
                      src={att.thumbnail}
                      alt={att.fileName}
                      className="w-8 h-8 object-cover rounded-lg border border-zinc-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-zinc-400">
                      {att.type === 'pdf' ? <FileText className="w-4 h-4 text-red-400" /> : <FileText className="w-4 h-4 text-blue-400" />}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[11px] font-medium text-white truncate max-w-[120px]">
                      {att.fileName}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">
                      {att.type === 'video' ? '📹 Видео' : att.type === 'image' ? '🖼 Фото' : att.type === 'pdf' ? '📄 PDF' : '📝 Текст'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                    title="Удалить вложение"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Loading Indicator when processing videos or PDFs */}
          {isProcessingFile && (
            <div className="flex items-center gap-2 mx-3 my-2 text-xs text-emerald-400 font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              Обработка вложений...
            </div>
          )}

          {/* Input Controls */}
          <div className="flex items-end gap-2 px-2">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={handleFileClick}
              disabled={disabled || isProcessingFile || attachments.length >= 4}
              className="flex-shrink-0 w-10 h-10 rounded-2xl bg-[#141414] hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer mb-0.5 border border-[#222222]"
              title="Прикрепить фото, PDF, txt или видео (до 4 файлов)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Text Area */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={attachments.length > 0 ? 'Добавьте комментарий к вложениям...' : (t.sendMessage || 'Send a message...')}
              className="w-full bg-transparent text-white placeholder-zinc-600 outline-none resize-none min-h-[44px] max-h-32 py-3 text-sm scrollbar-thin font-medium"
              rows="1"
              autoFocus
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-zinc-200 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all active:scale-95 cursor-pointer shadow-lg mb-0.5"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </form>

      <div className="flex justify-center mt-3">
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#0A0A0A] rounded-full border border-[#1F1F1F] text-[10px] text-zinc-500 font-mono tracking-wide">
          <Sparkles className={`w-3 h-3 ${hasApiKey ? 'text-emerald-400' : 'text-amber-500'}`} />
          {hasApiKey ? 'Perplexity Sonar-Pro Vision (Active)' : 'Local Heuristic (Fallback)'}
        </span>
      </div>
    </div>
  );
}
