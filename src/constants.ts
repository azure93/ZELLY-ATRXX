/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, WeatherType } from './types';

export const GRID_SIZE = 7;

export const LEVELS: LevelConfig[] = [
  { stage: 1, aiRandomChance: 0.75, visualStage: 1 },
  { stage: 2, aiRandomChance: 0.50, visualStage: 2 },
  { stage: 3, aiRandomChance: 0.25, visualStage: 3 },
  { stage: 4, aiRandomChance: 0.00, visualStage: 4 },
  { stage: 5, aiRandomChance: 0.00, visualStage: 5 },
];

export const WEATHERS: WeatherType[] = ['BLOSSOM', 'LEAF', 'MONEY', 'DUST'];

export const COLORS = {
  PLAYER: '#FF8C00', // Dark Orange
  AI: '#8A2BE2',     // Blue Violet
  BOARD: '#FFE4E1',  // Misty Rose (돗자리 느낌)
};
