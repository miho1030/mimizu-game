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
            <h1 className="text-3xl font-bold text-stone-100 italic tracking-tight">MIMIZU SIM</h1>
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
