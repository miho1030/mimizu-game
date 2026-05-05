/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, Dog, Sparkles } from 'lucide-react';

export default function App() {
  const [wormName, setWormName] = useState("");
  const [isNamed, setIsNamed] = useState(false);
  const [size, setSize] = useState(1);
  const [hunger, setHunger] = useState(30); 
  const [lastFed, setLastFed] = useState<number | null>(null);
  const [message, setMessage] = useState("こんにちは！ぼくはみみずだよ。");
  const [isEating, setIsEating] = useState(false);
  
  // Walking states
  const [isWalking, setIsWalking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Hunger increases over time
  useEffect(() => {
    if (!isNamed) return;
    const timer = setInterval(() => {
      setHunger((prev) => Math.min(prev + (isWalking ? 4 : 2), 100));
    }, 2000);
    return () => clearInterval(timer);
  }, [isWalking, isNamed]);

  // Update message
  useEffect(() => {
    if (!isNamed) return;
    if (isWalking) {
      setMessage(`${wormName}はお散歩中だよ！楽しいな〜`);
    } else if (hunger > 80) {
      setMessage("お腹がペコペコだよ… 餌をちょうだい！");
    } else if (hunger > 50) {
      setMessage("ちょっとお腹が空いてきたなぁ。");
    } else if (hunger < 10) {
      setMessage("お腹いっぱい！しあわせ〜。");
    }
  }, [hunger, isWalking, isNamed, wormName]);

  const handleFeed = useCallback(() => {
    if (hunger <= 0 || isWalking) return;

    setHunger((prev) => Math.max(prev - 25, 0));
    setSize((prev) => prev + 0.05);
    setLastFed(Date.now());
    setMessage("パクパク！おいしい！");
    
    setIsEating(true);
    setTimeout(() => setIsEating(false), 600);
  }, [hunger, isWalking]);

  const toggleWalk = () => {
    setIsWalking(!isWalking);
    if (!isWalking) {
      setMessage(`${wormName}とお散歩に出発だ！`);
    } else {
      setMousePos({ x: 0, y: 0 });
      setMessage("ただいま〜。土の中は落ち着くね。");
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isWalking || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setMousePos({
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    });
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (wormName.trim()) {
      setIsNamed(true);
      setMessage(`こんにちは！ぼくは${wormName}だよ。`);
    }
  };

  if (!isNamed) {
    return (
      <div className="min-h-screen bg-dirt animate-dirt-moving flex items-center justify-center p-6 text-stone-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-[#2D241E]/95 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl text-center space-y-6"
        >
          <div className="space-y-4">
            <div className="text-6xl animate-bounce">🪱</div>
            <h1 className="text-3xl font-bold text-stone-100 italic tracking-tight">みみず育成ゲーム</h1>
            <p className="text-sm opacity-70">あなたのみみずに名前を付けて育てよう</p>
          </div>
          
          <form onSubmit={handleStart} className="space-y-4">
            <input 
              type="text" 
              value={wormName}
              onChange={(e) => setWormName(e.target.value)}
              placeholder="なまえを入力..."
              className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-pink-400/50 transition-colors text-center"
              maxLength={10}
              required
            />
            <button 
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] border-b-4 border-pink-700"
            >
              ゲームをはじめる
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      className={`min-h-screen transition-all duration-700 overflow-hidden relative flex flex-col items-center justify-center font-sans text-stone-200 select-none
        ${isWalking ? 'bg-grass' : 'bg-dirt animate-dirt-moving'}`}
    >
      {/* Title/Name display */}
      <div className="absolute top-10 text-center z-10 w-full px-4">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-tighter"
        >
          {wormName}
        </motion.h1>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/70 mt-1">
          {isWalking ? "EXPLORING THE SURFACE" : "LIVING UNDERGROUND"}
        </p>
      </div>

      {/* Leash line */}
      {isWalking && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <motion.line
            x1="50%"
            y1="50%"
            x2={`calc(50% + ${mousePos.x}px)`}
            y2={`calc(50% + ${mousePos.y}px)`}
            stroke="#ffffff" 
            strokeWidth="2"
            strokeDasharray="5 5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
          />
        </svg>
      )}

      {/* Main Game Interface */}
      <div className="z-10 flex flex-col items-center gap-6 p-8 max-w-sm w-full">
        {/* Status Bubble */}
        <div className="w-full bg-[#2D241E]/90 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black opacity-50 tracking-widest">
            <span>HUNGER</span>
            <span>{Math.round(hunger)}%</span>
          </div>
          <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div
              className={`h-full rounded-full ${hunger > 70 ? 'bg-orange-500' : 'bg-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.5)]'}`}
              initial={{ width: 0 }}
              animate={{ width: `${hunger}%` }}
              transition={{ type: "spring", stiffness: 40 }}
            />
          </div>
          <motion.p 
            key={message}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-semibold text-pink-100"
          >
            {message}
          </motion.p>
        </div>

        {/* The Action Area */}
        <div className="relative h-48 w-full flex items-center justify-center pointer-events-none">
          <motion.div
            className={`flex items-center -space-x-4 ${isEating ? 'animate-bounce-custom' : ''}`}
            style={{ '--worm-scale': size } as any}
            animate={{
              scale: size,
              x: isWalking ? mousePos.x : 0,
              y: isWalking ? mousePos.y : 0,
            }}
            transition={{
              scale: { type: "spring", stiffness: 100, damping: 12 },
              x: isWalking ? { type: "spring", damping: 25, stiffness: 60 } : { duration: 0.4 },
              y: isWalking ? { type: "spring", damping: 25, stiffness: 60 } : { duration: 0.4 },
            }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-14 h-14 rounded-full shadow-lg"
                style={{
                  backgroundColor: i === 0 ? "#FFB6C1" : "#FF99AA", 
                  zIndex: 5 - i,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
                animate={{
                  y: isWalking ? [0, -4, 0] : [0, -2, 0],
                  scaleY: [1, 0.92, 1],
                }}
                transition={{
                  duration: isWalking ? 0.3 : 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              >
                {i === 0 && (
                  <div className="relative w-full h-full">
                    {/* Tiny leash hook */}
                    {isWalking && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-600 rounded-full" />}
                    {/* Eyes */}
                    <div className="absolute top-4 left-2.5 w-3.5 h-3.5 bg-black rounded-full overflow-hidden">
                      <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5" />
                    </div>
                    <div className="absolute top-4 right-2.5 w-3.5 h-3.5 bg-black rounded-full overflow-hidden">
                      <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5" />
                    </div>
                    {/* Blush */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-4 opacity-50">
                      <div className="w-2.5 h-1 bg-red-400 rounded-full blur-[1.5px]" />
                      <div className="w-2.5 h-1 bg-red-400 rounded-full blur-[1.5px]" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
          
          <AnimatePresence>
            {lastFed && !isWalking && (
              <motion.div
                key={lastFed}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -80, scale: 1.3 }}
                exit={{ opacity: 0 }}
                className="absolute text-xl font-bold text-pink-300 drop-shadow-lg flex items-center gap-1"
              >
                <Sparkles className="w-5 h-5" /> 成長！
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Actions */}
        <div className="flex flex-col gap-4 w-full mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFeed}
            disabled={hunger === 0 || isWalking}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-lg shadow-xl border-b-4 transition-all
              ${(hunger === 0 || isWalking)
                ? 'bg-stone-700 border-stone-900 text-stone-500 cursor-not-allowed opacity-50' 
                : 'bg-pink-500 border-pink-700 text-white active:translate-y-1 active:border-b-0'
              }`}
          >
            <Utensils className="w-6 h-6" />
            餌をあげる
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleWalk}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-lg shadow-xl border-b-4 transition-all
              ${isWalking 
                ? 'bg-red-500 border-red-700 text-white active:translate-y-1 active:border-b-0' 
                : 'bg-stone-100 border-stone-300 text-stone-800 hover:bg-white active:translate-y-1 active:border-b-0'
              }`}
          >
            <Dog className="w-6 h-6" />
            {isWalking ? "家（土）に帰る" : "散歩にでかける"}
          </motion.button>
        </div>
      </div>

      <div className="absolute bottom-8 font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">
        SIZE: {size.toFixed(2)}m • BUILD v1.3
      </div>
    </div>
  );
}
