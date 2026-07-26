import React, { useState, useEffect, useRef } from 'react';
import { X, Flame, Users, Share2, Send, Trophy, Copy, Check, Sparkles, Swords, RefreshCw } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { generateRoomCode, subscribeToBattleRoom, broadcastBattleEvent } from '../services/battleService';
import { analyzeVibeAI } from '../services/aiService';

export default function RoastBattleModal({ isOpen, onClose, lang, activePersonaId }) {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.RU;
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('Player 1');
  const [playerRole, setPlayerRole] = useState('player1'); // 'player1' or 'player2'
  const [isInRoom, setIsInRoom] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [inputCode, setInputCode] = useState('');
  const [battleMessages, setBattleMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isJudging, setIsJudging] = useState(false);

  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [battleFinished, setBattleFinished] = useState(false);

  const bottomRef = useRef(null);

  // Subscribe to room events
  useEffect(() => {
    if (!isInRoom || !roomCode) return;

    const unsubscribe = subscribeToBattleRoom(roomCode, (eventData) => {
      if (eventData.type === 'NEW_MESSAGE') {
        setBattleMessages(prev => [...prev, eventData.message]);
      } else if (eventData.type === 'SCORE_UPDATE') {
        setScores(eventData.scores);
      } else if (eventData.type === 'BATTLE_FINISHED') {
        setBattleFinished(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isInRoom, roomCode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleMessages, isJudging]);

  const handleCreateRoom = () => {
    const newCode = generateRoomCode();
    setRoomCode(newCode);
    setPlayerRole('player1');
    setIsInRoom(true);
    setBattleMessages([
      {
        id: 'sys-1',
        sender: 'system',
        text: `Комната ${newCode} создана! Скопируйте ссылку и отправьте Сопернику (Игрок 2).`
      }
    ]);
  };

  const handleJoinRoom = () => {
    if (!inputCode.trim()) return;
    const cleanCode = inputCode.trim().toUpperCase();
    setRoomCode(cleanCode);
    setPlayerRole('player2');
    setPlayerName('Player 2');
    setIsInRoom(true);
    setBattleMessages([
      {
        id: 'sys-2',
        sender: 'system',
        text: `Вы присоединились к дуэли ${cleanCode} как Игрок 2!`
      }
    ]);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}?battle=${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendBattleMsg = async () => {
    if (!inputMsg.trim() || isJudging) return;

    const msgText = inputMsg.trim();
    setInputMsg('');

    const newMsg = {
      id: Date.now().toString(),
      sender: playerName,
      role: playerRole,
      text: msgText,
      timestamp: Date.now()
    };

    // Broadcast to room
    broadcastBattleEvent(roomCode, {
      type: 'NEW_MESSAGE',
      message: newMsg
    });

    // Request fun.ai Judge Verdict for this round
    setIsJudging(true);
    try {
      const historyContext = [...battleMessages, newMsg].slice(-6);
      const battlePrompt = `[ROAST BATTLE: ${playerName} (${playerRole}) только что написал: "${msgText}"]. Оцени реплику, сравни с соперником, жестко зажарь и объяви счет этого раунда.`;

      const aiResult = await analyzeVibeAI(battlePrompt, lang, historyContext, null, activePersonaId);

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'fun.ai Referee',
        role: 'referee',
        text: aiResult.translation || aiResult.verdict,
        verdict: aiResult.verdict,
        detectedTone: aiResult.detectedTone,
        badgeEmoji: aiResult.badgeEmoji || '⚔️',
        timestamp: Date.now()
      };

      // Calculate score increment
      const p1ScoreInc = playerRole === 'player1' ? (aiResult.gauges?.overallVibe || 50) : 0;
      const p2ScoreInc = playerRole === 'player2' ? (aiResult.gauges?.overallVibe || 50) : 0;

      const updatedScores = {
        player1: scores.player1 + Math.round(p1ScoreInc / 10),
        player2: scores.player2 + Math.round(p2ScoreInc / 10)
      };

      setScores(updatedScores);

      broadcastBattleEvent(roomCode, {
        type: 'NEW_MESSAGE',
        message: botMsg
      });

      broadcastBattleEvent(roomCode, {
        type: 'SCORE_UPDATE',
        scores: updatedScores
      });

    } catch (e) {
      console.error("Battle judging error:", e);
    } finally {
      setIsJudging(false);
    }
  };

  const handleFinishBattle = () => {
    setBattleFinished(true);
    broadcastBattleEvent(roomCode, {
      type: 'BATTLE_FINISHED'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#120E24] border border-[#2D244D] rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#231B40] bg-[#16112C]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-purple-800 flex items-center justify-center text-white shadow-lg">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                {t.roastBattle || "fun.ai Roast Battle"}
                {isInRoom && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-mono">
                    {roomCode}
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Дуэль 2 игроков в реальном времени с ИИ-судейством
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#20193D] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {!isInRoom ? (
          /* Lobby Screen */
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white mb-4 shadow-xl animate-pulse">
              <Flame className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-extrabold font-heading text-white mb-2">
              Вызовите друга на Roast Battle ⚔️
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
              Оба участника пишут колкости в один чат, а fun.ai выносит жесткий вердикт и выбирает победителя!
            </p>

            <div className="w-full max-w-xs flex flex-col gap-4">
              {/* Custom Nickname */}
              <div className="flex flex-col text-left">
                <label className="text-[10px] font-mono text-zinc-400 uppercase mb-1">Ваш никнейм:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-[#181330] border border-[#2D234A] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              {/* Create Room Button */}
              <button
                onClick={handleCreateRoom}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold font-heading text-sm shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                {t.createRoomBtn || "Создать Дуэль"}
              </button>

              <div className="flex items-center gap-2 my-1">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">или</span>
                <div className="h-px bg-zinc-800 flex-1"></div>
              </div>

              {/* Join Room */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Код комнаты (ROAST-XXXX)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full bg-[#181330] border border-[#2D234A] rounded-xl px-3 py-2 text-xs text-white outline-none uppercase font-mono"
                />
                <button
                  onClick={handleJoinRoom}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold font-heading transition-colors cursor-pointer flex-shrink-0"
                >
                  {t.joinRoomBtn || "Войти"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Room Screen */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scoreboard Bar */}
            <div className="px-4 py-2 bg-[#17122E] border-b border-[#251D42] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-purple-300 font-bold">{playerName} ({playerRole}):</span>
                <span className="px-2 py-0.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 font-bold">
                  {playerRole === 'player1' ? scores.player1 : scores.player2} pts
                </span>
              </div>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Скопировать ссылку для друга"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedLink ? 'Скопировано!' : roomCode}</span>
              </button>

              <button
                onClick={handleFinishBattle}
                className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/40 text-red-300 text-[10px] font-bold"
              >
                Итоги
              </button>
            </div>

            {/* Battle Feed */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
              {battleMessages.map((m) => {
                if (m.sender === 'system') {
                  return (
                    <div key={m.id} className="text-center my-2 text-xs font-mono text-zinc-500 bg-[#16112C] py-1.5 px-3 rounded-full self-center border border-[#231B40]">
                      {m.text}
                    </div>
                  );
                }

                if (m.role === 'referee') {
                  return (
                    <div key={m.id} className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-pink-950/60 border border-purple-800/50 my-1">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-purple-300">
                        <span>{m.badgeEmoji || '⚔️'}</span>
                        <span>{m.sender}</span>
                      </div>
                      <p className="text-sm text-purple-100 leading-relaxed font-medium">{m.text}</p>
                    </div>
                  );
                }

                const isMe = m.sender === playerName || m.role === playerRole;
                return (
                  <div key={m.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    <span className="text-[10px] text-zinc-500 font-mono mb-0.5">{m.sender}</span>
                    <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700'}`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {isJudging && (
                <div className="text-xs text-purple-400 font-mono animate-pulse flex items-center gap-2 p-2">
                  <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
                  fun.ai оценивает панч и выносит судейский вердикт...
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            {!battleFinished ? (
              <div className="p-3 bg-[#16112C] border-t border-[#251D42] flex items-center gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendBattleMsg()}
                  disabled={isJudging}
                  placeholder="Напишите свой панч/колкость..."
                  className="flex-1 bg-[#1A1435] border border-[#2E2452] rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleSendBattleMsg}
                  disabled={!inputMsg.trim() || isJudging}
                  className="w-10 h-10 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer flex-shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-purple-950 to-pink-950 text-center border-t border-purple-800/50">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-bounce" />
                <h4 className="text-base font-bold text-white mb-1">Дуэль Завершена!</h4>
                <p className="text-xs text-purple-200 mb-3">
                  {scores.player1 > scores.player2 
                    ? `Победитель: Игрок 1 (${scores.player1} pts)!` 
                    : scores.player2 > scores.player1 
                      ? `Победитель: Игрок 2 (${scores.player2} pts)!` 
                      : 'Ничья! Оба игрока показали мощный вайб!'}
                </p>
                <button
                  onClick={() => setIsInRoom(false)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Новая Дуэль
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
