/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { WeatherType } from '../types';
import { Leaf, Cherry, DollarSign, Cloud } from 'lucide-react';

interface Props {
  type: WeatherType;
}

export default function WeatherEffect({ type }: Props) {
  const particles = Array.from({ length: 20 });

  const getIcon = () => {
    switch (type) {
      case 'BLOSSOM': return <Cherry className="text-pink-300 opacity-60" size={24} />;
      case 'LEAF': return <Leaf className="text-green-600 opacity-60" size={24} />;
      case 'MONEY': return <DollarSign className="text-yellow-500 opacity-60" size={24} />;
      case 'DUST': return <Cloud className="text-yellow-900 opacity-30" size={32} />;
    }
  };

  const getBackground = () => {
    switch (type) {
      case 'DUST': return 'bg-yellow-100/50';
      default: return '';
    }
  };

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-1000`}>
      {/* Design blobs for Frosted Glass theme */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-20 w-32 h-32 bg-pink-300 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-40 right-40 w-48 h-48 bg-pink-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-400 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-2/3 right-10 w-64 h-64 bg-pink-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -50,
            rotate: 0,
            opacity: 0,
          }}
          animate={{
            y: window.innerHeight + 50,
            x: `calc(${Math.random() * 100}vw + ${Math.sin(i) * 50}px)`,
            rotate: 360,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute"
        >
          {getIcon()}
        </motion.div>
      ))}
      {type === 'DUST' && (
        <motion.div
          animate={{
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-yellow-600/10 mix-blend-multiply"
        />
      )}
    </div>
  );
}
