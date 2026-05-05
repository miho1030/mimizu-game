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
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setMousePos({
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    });
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (wormName.trim()) {
      setIsNamed(true);
    }
  };

  if (!isNamed) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6 text-stone-200">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#2D241E] p-8 rounded-3xl text-center">
          <h1 className="text-3xl font-bold mb-6">MIMIZU SIM</h1>
          <form onSubmit={handleStart}>
            <input value={wormName} onChange={(e) => setWormName(e.target.value)} placeholder="なまえ..." className="w-full bg-black/40 rounded-xl px-4 py-3 mb-4 text-center" required />
            <button type="submit" className="w-full bg-pink-500 py-4 rounded-xl font-bold">ゲームをはじめる</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className="min-h-screen bg-stone-800 flex flex-col items-center justify-center">
      <h1 className="text-4xl text-white font-bold mb-8">{wormName}</h1>
      <div className="bg-[#2D241E] p-6 rounded-2xl mb-8 w-64 text-center text-pink-100">{message}</div>
      <motion.div animate={{ scale: size }} className="w-20 h-20 bg-pink-400 rounded-full" />
      <div className="flex gap-4 mt-8">
        <button onClick={handleFeed} className="bg-pink-500 px-6 py-3 rounded-xl font-bold text-white">餌をあげる</button>
        <button onClick={toggleWalk} className="bg-stone-100 px-6 py-3 rounded-xl font-bold">{isWalking ? "帰る" : "散歩"}</button>
      </div>
    </div>
  );
}
