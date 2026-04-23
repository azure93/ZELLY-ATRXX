/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GRID_SIZE } from '../constants';
import { Player, Position } from '../types';

export function createInitialBoard(size: number): Player[][] {
  const board: Player[][] = Array.from({ length: size }, () => Array(size).fill(null));
  // Ataxx initial positions (Standard corner start)
  board[0][0] = 'AI';
  board[0][size - 1] = 'PLAYER';
  board[size - 1][0] = 'PLAYER';
  board[size - 1][size - 1] = 'AI';
  return board;
}

export function isValidPos(r: number, c: number): boolean {
  return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

export function getMoves(board: Player[][], r: number, c: number): { clones: Position[], jumps: Position[] } {
  const clones: Position[] = [];
  const jumps: Position[] = [];

  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (isValidPos(nr, nc) && board[nr][nc] === null) {
        const dist = Math.max(Math.abs(dr), Math.abs(dc));
        if (dist === 1) clones.push({ r: nr, c: nc });
        else jumps.push({ r: nr, c: nc });
      }
    }
  }
  return { clones, jumps };
}

export function hasAnyMoves(board: Player[][], player: Player): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === player) {
        const { clones, jumps } = getMoves(board, r, c);
        if (clones.length > 0 || jumps.length > 0) return true;
      }
    }
  }
  return false;
}

export function executeMove(board: Player[][], from: Position | null, to: Position, player: Player): { newBoard: Player[][], converted: Position[] } {
  const newBoard = board.map(row => [...row]);
  const dist = from ? Math.max(Math.abs(from.r - to.r), Math.abs(from.c - to.c)) : 1;

  if (dist === 2 && from) {
    // Jump: remove from original
    newBoard[from.r][from.c] = null;
  }
  // Place piece
  newBoard[to.r][to.c] = player;

  // Conversion logic
  const converted: Position[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = to.r + dr;
      const nc = to.c + dc;
      if (isValidPos(nr, nc) && newBoard[nr][nc] !== null && newBoard[nr][nc] !== player) {
        newBoard[nr][nc] = player;
        converted.push({ r: nr, c: nc });
      }
    }
  }

  return { newBoard, converted };
}

export function countPieces(board: Player[][]) {
  let p = 0;
  let a = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === 'PLAYER') p++;
      else if (cell === 'AI') a++;
    }
  }
  return { PLAYER: p, AI: a };
}

// AI Implementation
export function getAIMove(board: Player[][], level: number, randomChance: number): { from: Position, to: Position } | null {
  const allMoves: { from: Position, to: Position, gain: number }[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 'AI') {
        const { clones, jumps } = getMoves(board, r, c);
        clones.forEach(to => {
          const gain = calculateGain(board, to, 'AI') + 1; // +1 for cloning
          allMoves.push({ from: { r, c }, to, gain });
        });
        jumps.forEach(to => {
          const gain = calculateGain(board, to, 'AI'); // no +1 for jump
          allMoves.push({ from: { r, c }, to, gain });
        });
      }
    }
  }

  if (allMoves.length === 0) return null;

  // Level based strategy
  if (Math.random() < randomChance) {
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  // Sorting moves by gain
  allMoves.sort((a, b) => b.gain - a.gain);
  const maxGain = allMoves[0].gain;
  const bestMoves = allMoves.filter(m => m.gain === maxGain);

  if (level === 5) {
    // Boss: weights center
    const centerWeight = (pos: Position) => {
      const distToCenter = Math.abs(pos.r - 3) + Math.abs(pos.c - 3);
      return (6 - distToCenter); // closer is better
    };
    bestMoves.sort((a, b) => centerWeight(b.to) - centerWeight(a.to));
    return bestMoves[0];
  }

  // Greedy: pick random among best
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function calculateGain(board: Player[][], to: Position, player: Player): number {
  let gain = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = to.r + dr;
      const nc = to.c + dc;
      if (isValidPos(nr, nc) && board[nr][nc] !== null && board[nr][nc] !== player) {
        gain++;
      }
    }
  }
  return gain;
}
