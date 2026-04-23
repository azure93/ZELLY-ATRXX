/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Player } from '../types';
import { Bot } from 'lucide-react';

interface Props {
  type: Player;
  visualStage: number;
  isSelected?: boolean;
  isConverted?: boolean;
}

export default function JellyPiece({ type, visualStage, isSelected, isConverted }: Props) {
  if (!type) return null;

  const isPlayer = type === 'PLAYER';
  
  // Base styles based on visual evolution stage
  const getStyles = () => {
    let base = "w-full h-full rounded-2xl flex items-center justify-center relative ";
    
    if (visualStage === 1) {
      base += isPlayer ? "bg-orange-400 border-b-4 border-orange-600 shadow-md" : "bg-purple-400 border-b-4 border-purple-600 shadow-md";
    } else if (visualStage === 2) {
      base += isPlayer 
        ? "bg-gradient-to-br from-orange-300 to-orange-500 shadow-lg border-b-4 border-orange-600" 
        : "bg-gradient-to-br from-purple-300 to-purple-500 shadow-lg border-b-4 border-purple-600";
    } else if (visualStage === 3 || visualStage === 4) {
      base += isPlayer 
        ? "bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 shadow-xl border border-white/30 border-b-4 border-orange-800" 
        : "bg-gradient-to-br from-purple-300 via-purple-600 to-purple-900 shadow-xl border border-white/30 border-b-4 border-purple-800";
      base += " ring-1 ring-white/20";
    } else { // Stage 5: MAX
      base += isPlayer
        ? "bg-[radial-gradient(circle_at_30%_30%,_#fdba74_0%,_#f97316_50%,_#7c2d12_100%)] shadow-[0_0_15px_rgba(255,165,0,0.5)] border-2 border-white/40 border-b-4 border-orange-900"
        : "bg-[radial-gradient(circle_at_30%_30%,_#e879f9_0%,_#9333ea_50%,_#3b0764_100%)] shadow-[0_0_15px_rgba(138,43,226,0.6)] border-2 border-white/40 border-b-4 border-purple-950";
      base += " backdrop-blur-sm overflow-hidden";
    }

    return base;
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0, rotate: isConverted ? 0 : undefined }}
      animate={{ 
        scale: isSelected ? 1.2 : 1,
        y: isSelected ? -5 : 0,
        rotate: isConverted ? 360 : 0,
      }}
      transition={{ rotate: { duration: 0.5 } }}
      className={getStyles()}
    >
      {/* Sparle Particles for conversion */}
      {isConverted && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ scale: [0, 1, 0], x: (i - 2.5) * 10, y: (i % 2 ? -20 : 20) }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="absolute left-1/2 top-1/2 w-1 h-1 bg-yellow-200 rounded-full"
            />
          ))}
        </div>
      )}
      {/* Glossy Overlay for higher stages */}
      {visualStage >= 3 && (
        <div className="absolute top-1 left-1 w-1/2 h-1/3 bg-white/30 rounded-full blur-[2px] -rotate-15" />
      )}
      
      {/* Character Identity */}
      {isPlayer ? (
        <div className={`text-white transition-opacity ${visualStage >= 5 ? 'drop-shadow-glow' : ''}`}>
           🐻
        </div>
      ) : (
        <div className="relative">
          <Bot size={24} className={`text-white ${visualStage >= 5 ? 'animate-pulse' : ''}`} />
          {visualStage >= 5 && (
            <div className="absolute top-1 left-1.5 w-1 h-1 bg-red-500 rounded-full animate-ping" />
          )}
        </div>
      )}

      {/* Cyber scan lines for AI at Stage 5 */}
      {!isPlayer && visualStage >= 5 && (
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]" />
      )}
    </motion.div>
  );
}
