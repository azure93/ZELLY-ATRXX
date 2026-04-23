/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Player = 'PLAYER' | 'AI' | null;

export interface Position {
  r: number;
  c: number;
}

export type WeatherType = 'BLOSSOM' | 'LEAF' | 'MONEY' | 'DUST';

export interface LevelConfig {
  stage: number;
  aiRandomChance: number; // 0 to 1
  visualStage: number; // 1 to 5
}

export type GameStatus = 'START' | 'PLAYING' | 'GAMEOVER';

export interface GameState {
  board: Player[][];
  turn: Player;
  status: GameStatus;
  winner: Player | 'DRAW' | null;
  level: number;
  weather: WeatherType;
  history: Position[][];
}
