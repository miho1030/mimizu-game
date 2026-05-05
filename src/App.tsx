/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Dog, Sparkles } from 'lucide-react';

export default function App() {
  const [wormName, setWormName] = useState("");
  const [isNamed, setIsNamed] = useState(false);
  const [size, setSize] = useState(1);
  const [hunger, setHunger] = useState(30); 
  const [lastFed, setLastFed] = useState<number | null>(null);
  const [message, setMessage] = useState("こんにちは！ぼくはみみずだよ。");
  const [isEating, setIsEating] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNamed) return;
    const timer = setInterval(() => {
      setHunger((prev) => Math.min(prev + (isWalking ? 4 : 2), 100));
    }, 2000);
    return () => clearInterval(timer);
  }, [isWalking, isNamed]);

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
    setSize((prev) => parseFloat((prev + 0.05).toFixed(2)));
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
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setMousePos({
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    });
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (wormName.trim()) { setIsNamed(true); }
  };

  if (!isNamed) {
    return (
      <div className="min-h-screen bg-dirt animate-dirt-moving flex items-center justify-center p-6 text-stone-200">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-[#2D241E]/95 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
          <div className="text-6xl animate-bounce mb-4">🪱</div>
          <h1 className="text-3xl font-bold text-stone-100 mb-6">MIMIZU SIM</h1>
          <form onSubmit={handleStart} className="space-y-4">
            <input value={wormName} onChange={(e) => setWormName(e.target.value)} placeholder="なまえ..." className="w-full bg-black/40 rounded-xl px-4 py-3 text-center" required />
            <button type="submit" className="w-full bg-pink-500 py-4 rounded-xl font-bold">ゲームをはじめる</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className={`min-h-screen transition-all duration-700 relative flex flex-col items-center justify-center ${isWalking ? 'bg-grass' : 'bg-dirt animate-dirt-moving'}`}>
      <h1 className="text-4xl font-extrabold text-white mb-2">{wormName}</h1>
      <div className="bg-[#2D241E]/90 backdrop-blur-sm p-6 rounded-3xl mb-8 w-72 text-center text-pink-100 border border-white/10 shadow-xl">{message}</div>
      <motion.div animate={{ scale: size }} className={`flex -space-x-4 ${isEating ? 'animate-bounce-custom' : ''}`}>
        {[...Array(5)].map((_, i) => <div key={i} className="w-14 h-14 rounded-full bg-pink-400" />)}
      </motion.div>
      <div className="flex gap-4 mt-12">
        <button onClick={handleFeed} className="bg-pink-500 px-8 py-4 rounded-2xl font-black text-white shadow-xl flex items-center gap-2"><Utensils size={20}/> 餌をあげる</button>
        <button onClick={toggleWalk} className="bg-stone-100 px-8 py-4 rounded-2xl font-black text-stone-800 shadow-xl flex items-center gap-2"><Dog size={20}/> {isWalking ? "帰る" : "散歩"}</button>
      </div>
      <div className="absolute bottom-8 font-mono text-[10px] text-white/30">SIZE: {Math.round(size * 100)}%</div>
    </div>
  );
}
