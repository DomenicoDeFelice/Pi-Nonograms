/*
  A nonogram game written in javascript
  https://github.com/DomenicoDeFelice/Pi-Nonograms

  Play the game: https://domdefelice.net/pi-nonograms/

  Copyright (c) 2013-2025 Domenico De Felice

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Cell state constants
export const CellState = {
    UNKNOWN: 'unknown',
    FILLED: 'filled',
    EMPTY: 'empty',
} as const;

export type CellStateType = (typeof CellState)[keyof typeof CellState];

// Game mode constants
export const GameMode = {
    PLAY: 'play',
    DRAW: 'draw',
} as const;

export type GameModeType = (typeof GameMode)[keyof typeof GameMode];
