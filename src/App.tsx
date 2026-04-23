/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  createInitialBoard, 
  getMoves, 
  executeMove, 
  countPieces, 
  getAIMove, 
  hasAnyMoves 
} from './utils/gameLogic';
import { GRID_SIZE, LEVELS, WEATHERS, COLORS } from './constants';
import { Player, Position, GameStatus, WeatherType } from './types';
import { sound } from './utils/audio';
import WeatherEffect from './components/WeatherEffect';
import JellyPiece from './components/JellyPiece';
import { Trophy, RefreshCw, ChevronRight, Play } from 'lucide-react';

export default function App() {
  // Game State
  const [levelIdx, setLevelIdx] = useState(0);
  const [board, setBoard] = useState<Player[][]>(createInitialBoard(GRID_SIZE));
  const [lastMove, setLastMove] = useState<{ to: Position, converted: Position[] } | null>(null);
  const [turn, setTurn] = useState<Player>('PLAYER');
  const [status, setStatus] = useState<GameStatus>('START');
  const [weather, setWeather] = useState<WeatherType>('BLOSSOM');
  const [selected, setSelected] = useState<Position | null>(null);
  const [hintMoves, setHintMoves] = useState<{ clones: Position[], jumps: Position[] }>({ clones: [], jumps: [] });
  const [isAiThinking, setIsAiThinking] = useState(false);

  const currentLevel = LEVELS[levelIdx];
  const scores = useMemo(() => countPieces(board), [board]);

  // Initialize Game
  const initGame = useCallback((lvlIdx: number) => {
    setBoard(createInitialBoard(GRID_SIZE));
    setTurn('PLAYER');
    setStatus('PLAYING');
    setLevelIdx(lvlIdx);
    setWeather(WEATHERS[Math.floor(Math.random() * WEATHERS.length)]);
    setSelected(null);
    setHintMoves({ clones: [], jumps: [] });
  }, []);

  // Check Game End
  const checkGameEnd = useCallback((currentBoard: Player[][], nextTurn: Player) => {
    const pMoves = hasAnyMoves(currentBoard, 'PLAYER');
    const aMoves = hasAnyMoves(currentBoard, 'AI');
    const counts = countPieces(currentBoard);

    if (counts.PLAYER === 0 || counts.AI === 0 || (!pMoves && !aMoves)) {
      setStatus('GAMEOVER');
      return true;
    }
    
    // If one player has no moves but the other does, the other keeps playing
    if (nextTurn === 'PLAYER' && !pMoves && aMoves) {
      setTurn('AI');
      return false;
    }
    if (nextTurn === 'AI' && !aMoves && pMoves) {
      setTurn('PLAYER');
      return false;
    }

    return false;
  }, []);

  // Handle Cell Click
  const handleCellClick = (r: number, c: number) => {
    if (status !== 'PLAYING' || turn !== 'PLAYER' || isAiThinking) return;

    const cell = board[r][c];

    // Select piece
    if (cell === 'PLAYER') {
      sound.select();
      setSelected({ r, c });
      setHintMoves(getMoves(board, r, c));
      return;
    }

    // Try move
    if (selected) {
      const isClone = hintMoves.clones.some(m => m.r === r && m.c === c);
      const isJump = hintMoves.jumps.some(m => m.r === r && m.c === c);

      if (isClone || isJump) {
        if (isClone) sound.clone();
        else sound.jump();
        
        const { newBoard, converted } = executeMove(board, selected, { r, c }, 'PLAYER');
        if (converted.length > 0) sound.convert();
        
        setBoard(newBoard);
        setLastMove({ to: { r, c }, converted });
        setSelected(null);
        setHintMoves({ clones: [], jumps: [] });
        
        if (!checkGameEnd(newBoard, 'AI')) {
          setTurn('AI');
        }
      } else {
        // Deselect if clicking elsewhere
        setSelected(null);
        setHintMoves({ clones: [], jumps: [] });
      }
    }
  };

  // AI Turn Effect
  useEffect(() => {
    if (status === 'PLAYING' && turn === 'AI') {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const move = getAIMove(board, currentLevel.stage, currentLevel.aiRandomChance);
        if (move) {
          const isClone = Math.max(Math.abs(move.from.r - move.to.r), Math.abs(move.from.c - move.to.c)) === 1;
          if (isClone) sound.clone(); else sound.jump();

          const { newBoard, converted } = executeMove(board, move.from, move.to, 'AI');
          if (converted.length > 0) sound.convert();
          
          setBoard(newBoard);
          setLastMove({ to: move.to, converted });
          if (!checkGameEnd(newBoard, 'PLAYER')) {
            setTurn('PLAYER');
          }
        } else {
          // AI has no moves
          if (!checkGameEnd(board, 'PLAYER')) {
            setTurn('PLAYER');
          }
        }
        setIsAiThinking(false);
      }, 1000); // 1s delay for "thinking"
      return () => clearTimeout(timer);
    }
  }, [turn, status, board, currentLevel, checkGameEnd]);

  const winner = scores.PLAYER > scores.AI ? 'PLAYER' : scores.AI > scores.PLAYER ? 'AI' : 'DRAW';

  return (
    <div className="min-h-svh flex flex-col font-sans overflow-hidden relative" style={{ background: 'radial-gradient(circle at center, #d1fae5 0%, #a7f3d0 100%)' }}>
      <WeatherEffect type={weather} />

      {/* Header Section */}
      <header className="h-20 px-6 sm:px-10 flex items-center justify-between bg-white/30 backdrop-blur-md border-b border-white/40 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl shadow-lg flex items-center justify-center border-2 border-white/50">
            <span className="text-xl sm:text-2xl">🐻</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight leading-none uppercase">JELLY ATAXX</h1>
            <p className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-widest">Haribo vs. Cyber Grape-bot</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-6">
          <div className="px-4 py-2 bg-white/50 backdrop-blur-lg rounded-full border border-white/60 shadow-sm flex items-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">STAGE</span>
            <span className="ml-2 text-lg font-black text-emerald-950">{currentLevel.stage.toString().padStart(2, '0')} <span className="text-xs opacity-50">/ 05</span></span>
          </div>
          <div className="px-4 py-2 bg-pink-100/60 backdrop-blur-lg rounded-full border border-pink-200 shadow-sm flex items-center">
            <span className="text-[10px] font-bold text-pink-800 uppercase tracking-widest">WEATHER</span>
            <span className="ml-2 text-lg font-black text-pink-600 uppercase italic">🌸 {weather}</span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col sm:flex-row items-center justify-around sm:justify-between px-4 sm:px-10 relative z-10 gap-4 py-6">
        
        {/* Scoreboard: Player (Left) */}
        <motion.div 
          animate={{ 
            scale: turn === 'PLAYER' ? 1.1 : 0.95,
            opacity: turn === 'PLAYER' ? 1 : 0.6,
          }}
          className={`w-full max-w-[200px] sm:w-56 p-4 sm:p-6 rounded-[2rem] bg-orange-500/10 backdrop-blur-2xl border-4 ${turn === 'PLAYER' ? 'border-orange-500/40 ring-4 ring-orange-500/20' : 'border-white/20'} shadow-2xl transition-all flex flex-col items-center`}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-inner border-4 border-white/30">
            <span className="text-4xl sm:text-5xl">🐻</span>
          </div>
          <span className="mt-4 text-[10px] sm:text-xs font-black text-orange-800 tracking-widest uppercase">PLAYER</span>
          <span className="text-4xl sm:text-6xl font-black text-orange-600 tracking-tighter mt-1">{scores.PLAYER}</span>
          {turn === 'PLAYER' && status === 'PLAYING' && (
            <div className="mt-4 px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full animate-pulse uppercase tracking-wider">YOUR TURN</div>
          )}
        </motion.div>

        {/* 7x7 Game Board */}
        <div className="relative group">
          <div className="absolute -inset-4 sm:-inset-6 bg-emerald-900/5 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-xl"></div>
          <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] grid grid-cols-7 grid-rows-7 gap-1 sm:gap-2 p-2 sm:p-3 relative z-10">
            {board.map((row: Player[], r: number) => row.map((cell: Player, c: number) => {
              const isSelected: boolean = selected?.r === r && selected?.c === c;
              const isCloneHint: boolean = hintMoves.clones.some(m => m.r === r && m.c === c);
              const isJumpHint: boolean = hintMoves.jumps.some(m => m.r === r && m.c === c);
              const isConverted: boolean = !!lastMove?.converted.some(m => m.r === r && m.c === c);

              return (
                <div 
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative rounded-xl cursor-pointer transition-all duration-200 bg-white/40 border border-white/60 shadow-sm flex items-center justify-center group/cell ${
                    isCloneHint ? 'bg-green-400/40 border-green-400 scale-95' : 
                    isJumpHint ? 'bg-yellow-400/40 border-yellow-400 scale-95' : 
                    isSelected ? 'ring-4 ring-orange-500 ring-offset-2 scale-105' :
                    'hover:bg-white/60 hover:scale-[1.02]'
                  }`}
                >
                  <AnimatePresence mode="popLayout">
                    {cell && (
                      <div className="w-full h-full p-0.5 sm:p-1">
                        <JellyPiece 
                          type={cell} 
                          visualStage={currentLevel.visualStage} 
                          isSelected={isSelected}
                          isConverted={isConverted}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                  
                  {/* Hints */}
                  {isCloneHint && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: [0.8, 1.1, 1] }}
                      repeatCount={Infinity}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-4 h-4 bg-green-400/80 rounded-full border-2 border-white shadow-lg animate-pulse" />
                    </motion.div>
                  )}
                  {isJumpHint && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, y: [0, -4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                       <span className="text-xl sm:text-2xl drop-shadow-md">⬇️</span>
                    </motion.div>
                  )}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Scoreboard: AI (Right) */}
        <motion.div 
          animate={{ 
            scale: turn === 'AI' ? 1.1 : 0.95,
            opacity: turn === 'AI' ? 1 : 0.6,
          }}
          className={`w-full max-w-[200px] sm:w-56 p-4 sm:p-6 rounded-[2rem] bg-purple-500/10 backdrop-blur-2xl border-4 ${turn === 'AI' ? 'border-purple-500/40 ring-4 ring-purple-500/20' : 'border-white/20'} shadow-2xl transition-all flex flex-col items-center`}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-600 rounded-full flex items-center justify-center shadow-inner border-4 border-white/20">
            <span className="text-4xl sm:text-5xl">🤖</span>
          </div>
          <span className="mt-4 text-[10px] sm:text-xs font-black text-purple-800 tracking-widest uppercase">GRAPE-BOT</span>
          <span className="text-4xl sm:text-6xl font-black text-purple-600 tracking-tighter mt-1">{scores.AI}</span>
          {turn === 'AI' && status === 'PLAYING' && (
            <div className="mt-4 px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-full animate-pulse uppercase tracking-wider">AI THINKING</div>
          )}
        </motion.div>

      </main>

      {/* Bottom Controls / Status */}
      <footer className="h-24 px-4 sm:px-10 flex items-center justify-between bg-white/20 backdrop-blur-xl border-t border-white/30 relative z-20">
        <div className="flex gap-4 sm:gap-8 items-center">
          <div className="hidden sm:flex flex-col items-center">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">Graphic Level</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(lv => (
                <div 
                  key={lv}
                  className={`w-8 h-2 rounded-full transition-all duration-500 ${
                    currentLevel.visualStage >= lv 
                    ? (lv === 5 ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]' : 'bg-emerald-500') 
                    : 'bg-emerald-800/10'
                  }`} 
                />
              ))}
            </div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-emerald-800/20"></div>
          <div className="flex gap-2 sm:gap-4">
             <button 
              onClick={() => initGame(levelIdx)}
              className="px-4 sm:px-6 py-2 bg-emerald-900/10 hover:bg-emerald-900/20 text-emerald-900 font-bold rounded-xl border border-emerald-900/20 transition-all text-xs sm:text-sm active:scale-95"
            >
              RESTART
            </button>
          </div>
        </div>

        <div className="text-right">
           <div className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest leading-tight">Stage Reward</div>
           <div className="text-xs sm:text-sm font-black text-emerald-900 uppercase">Visual Evolution</div>
        </div>
      </footer>

      {/* Overlays */}
      <AnimatePresence>
        {status === 'START' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/20 backdrop-blur-3xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 max-w-sm w-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col items-center text-center border border-white"
            >
              <div className="w-24 h-24 bg-orange-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-lg border-4 border-white/50">
                <span className="text-5xl">🐻</span>
              </div>
              <h1 className="text-4xl font-black text-emerald-950 tracking-tighter mb-3 uppercase italic">JELLY ATAXX</h1>
              <p className="text-emerald-800/70 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">
                Protect the Haribo territory<br/>from the Cyber Grape-bots!
              </p>
              <button 
                onClick={() => initGame(0)}
                className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-black py-5 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                <Play size={20} fill="currentColor" />
                Play Game
              </button>
            </motion.div>
          </motion.div>
        )}

        {status === 'GAMEOVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-2xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-3xl rounded-[3rem] p-12 max-w-md w-full shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] flex flex-col items-center text-center border-2 border-white"
            >
              <div className="mb-8 relative">
                 <div className={`w-24 h-24 rounded-full flex items-center justify-center ${winner === 'PLAYER' ? 'bg-orange-500 text-white' : 'bg-purple-600 text-white'} shadow-2xl`}>
                    <Trophy size={48} />
                 </div>
                 {winner === 'PLAYER' && (
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute -inset-6 -z-10"
                    >
                        <div className="w-full h-full border-2 border-dashed border-orange-300 rounded-full opacity-50" />
                    </motion.div>
                 )}
              </div>
              
              <h2 className="text-5xl font-black text-emerald-950 italic tracking-tighter mb-4 uppercase">
                {winner === 'PLAYER' ? 'Victory!' : winner === 'DRAW' ? 'Draw!' : 'Defeat...'}
              </h2>
              
              <div className="flex gap-6 mb-12">
                 <div className="flex flex-col items-center bg-orange-500/10 px-6 py-3 rounded-2xl border-2 border-orange-500/20">
                    <span className="text-[10px] font-black text-orange-800 uppercase tracking-widest">YOU</span>
                    <span className="text-3xl font-black text-orange-600 tracking-tighter">{scores.PLAYER}</span>
                 </div>
                 <div className="flex flex-col items-center bg-purple-500/10 px-6 py-3 rounded-2xl border-2 border-purple-500/20">
                    <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest">AI</span>
                    <span className="text-3xl font-black text-purple-600 tracking-tighter">{scores.AI}</span>
                 </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                {winner === 'PLAYER' && levelIdx < LEVELS.length - 1 ? (
                   <button 
                    onClick={() => initGame(levelIdx + 1)}
                    className="group w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                  >
                    Next Stage
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button 
                    onClick={() => initGame(0)}
                    className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                  >
                    <RefreshCw size={20} />
                    Restart Match
                  </button>
                )}
                
                {winner !== 'PLAYER' && (
                   <button 
                    onClick={() => initGame(levelIdx)}
                    className="w-full bg-white hover:bg-emerald-50 text-emerald-950 border-2 border-emerald-100 font-black py-5 rounded-[1.5rem] transition-all active:scale-95 uppercase tracking-widest text-sm"
                  >
                    Retry Current Stage
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage Info (Mobile/Desktop consistent) */}
      <div className="fixed bottom-4 left-4 z-20">
         <div className="bg-white/50 backdrop-blur rounded-full px-3 py-1 flex items-center gap-2 border border-white/50 shadow-sm">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
               Lv.{currentLevel.stage} Visual Stage {currentLevel.visualStage}
            </span>
         </div>
      </div>
    </div>
  );
}
