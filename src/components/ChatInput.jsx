import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip, X, FileText, Mic, Square, Loader2, Image as ImageIcon, Film } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { processAttachment } from '../services/fileProcessing';
import { transcribeAudioGroq } from '../services/speechService';

export default function ChatInput({ lang, onSend, disabled, hasApiKey, onError }) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleFileClick = () => {
    if (disabled || isProcessingFile || isRecording) return;
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

  // Start Voice Recording
  const startRecording = async () => {
    if (disabled || isProcessingFile || isTranscribing) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (onError) onError('Ваш браузер не поддерживает запись аудио');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        
        if (audioBlob.size < 1000) {
          if (onError) onError(t.speechError || 'Запись слишком короткая');
          return;
        }

        setIsTranscribing(true);
        try {
          const transcribedText = await transcribeAudioGroq(audioBlob, lang);
          if (transcribedText) {
            onSend({ text: transcribedText, attachments, isVoice: true });
            setText('');
            setAttachments([]);
          }
        } catch (err) {
          console.error("Transcription error:", err);
          if (onError) onError(err.message || t.speechError);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Mic permission error:", err);
      if (onError) onError(t.micDenied || 'Доступ к микрофону отклонен');
      setIsRecording(false);
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((text.trim() || attachments.length > 0) && !disabled && !isProcessingFile && !isRecording) {
      onSend({ text: text.trim(), attachments, isVoice: false });
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

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const canSubmit = (text.trim().length > 0 || attachments.length > 0) && !disabled && !isProcessingFile && !isRecording && !isTranscribing;

  return (
    <div className="w-full relative mt-2 mb-3">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,.txt,.pdf,video/mp4,video/webm,video/mov"
        multiple
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col bg-[#0d0d14]/80 backdrop-blur-xl border border-white/[0.1] rounded-[50px] px-3 py-2 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all shadow-xl">
          
          {/* Attachments Preview Bar */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mx-3 mt-1 mb-2 p-2 rounded-[30px] bg-white/[0.04] border border-white/[0.08]">
              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-white/[0.06] border border-white/[0.1] relative">
                  {att.thumbnail ? (
                    <img
                      src={att.thumbnail}
                      alt={att.fileName}
                      className="w-7 h-7 object-cover rounded-full border border-white/[0.1] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center flex-shrink-0 text-zinc-400">
                      {att.type === 'video' ? <Film className="w-3.5 h-3.5 text-zinc-400" /> : att.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> : <FileText className="w-3.5 h-3.5 text-zinc-400" />}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[11px] font-medium text-white truncate max-w-[120px]">
                      {att.fileName}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">
                      {att.type}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="p-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-zinc-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Transcribing or Processing Indicator */}
          {isTranscribing && (
            <div className="flex items-center gap-2 mx-4 my-2 text-xs text-indigo-300 font-mono animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              {t.transcribing || 'Распознавание речи...'}
            </div>
          )}

          {isProcessingFile && (
            <div className="flex items-center gap-2 mx-4 my-2 text-xs text-zinc-400 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Обработка вложений...
            </div>
          )}

          {/* Active Voice Recording UI */}
          {isRecording ? (
            <div className="flex items-center justify-between px-4 py-2 bg-rose-950/20 border border-rose-500/30 rounded-full mx-1 my-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-mono font-semibold text-rose-300">
                  {t.recording || 'Запись:'} {formatTime(recordingDuration)}
                </span>
              </div>

              <button
                type="button"
                onClick={stopRecording}
                className="px-3.5 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-md"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>Стоп</span>
              </button>
            </div>
          ) : (
            /* Input Controls */
            <div className="flex items-center gap-2 px-2 py-0.5">
              {/* Attachment Button */}
              <button
                type="button"
                onClick={handleFileClick}
                disabled={disabled || isProcessingFile || isTranscribing || attachments.length >= 4}
                className="flex-shrink-0 w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer border border-white/[0.08]"
                title="Прикрепить фото, PDF, txt или видео"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Voice Record Button */}
              <button
                type="button"
                onClick={startRecording}
                disabled={disabled || isProcessingFile || isTranscribing}
                className="flex-shrink-0 w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer border border-white/[0.08]"
                title={t.voiceRecord || "Голосовой ввод"}
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Text Area */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled || isTranscribing}
                placeholder={attachments.length > 0 ? 'Добавьте комментарий...' : (t.inputPlaceholder || t.sendMessage || 'Спросите о чем угодно...')}
                className="w-full bg-transparent text-white placeholder-zinc-500 outline-none resize-none min-h-[36px] max-h-32 py-2 px-2 text-sm scrollbar-thin font-normal"
                rows="1"
                autoFocus
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-shrink-0 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 disabled:opacity-30 disabled:bg-white/[0.1] disabled:text-zinc-600 transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </form>

      <div className="flex flex-col items-center gap-1 mt-2">
        <div className="flex items-center gap-1.5 px-3 py-0.5 bg-white/[0.04] backdrop-blur-md rounded-full border border-white/[0.08] text-[10px] text-zinc-400 font-mono">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>fun.ai Engine</span>
        </div>
        <p className="text-[10px] text-zinc-500 text-center font-normal">
          {t.aiDisclaimerNote || "ИИ может ошибаться. Развлекательный контент 18+"}
        </p>
      </div>
    </div>
  );
}
