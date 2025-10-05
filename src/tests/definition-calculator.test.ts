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

import { describe, it, expect, beforeEach } from 'vitest';
import { DefinitionCalculator } from '../definition-calculator.js';
import { CellState, GameMode } from '../constants.js';

describe('DefinitionCalculator', () => {
    let calculator: DefinitionCalculator;

    beforeEach(() => {
        calculator = new DefinitionCalculator();
    });

    describe('calculateLineDefinition', () => {
        it('should return empty array for all empty line', () => {
            const actual = [
                CellState.EMPTY,
                CellState.EMPTY,
                CellState.EMPTY,
                CellState.EMPTY,
                CellState.EMPTY,
            ];
            const guess = actual;

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([]);
        });

        it('should calculate single sequence', () => {
            const actual = [
                CellState.EMPTY,
                CellState.FILLED,
                CellState.FILLED,
                CellState.FILLED,
                CellState.EMPTY,
            ];
            const guess = actual;

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([{ length: 3, solved: true }]);
        });

        it('should calculate multiple sequences', () => {
            const actual = [
                CellState.FILLED,
                CellState.FILLED,
                CellState.EMPTY,
                CellState.FILLED,
                CellState.EMPTY,
                CellState.FILLED,
                CellState.FILLED,
                CellState.FILLED,
            ];
            const guess = actual;

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([
                { length: 2, solved: true },
                { length: 1, solved: true },
                { length: 3, solved: true },
            ]);
        });

        it('should handle sequence at start of line', () => {
            const actual = [CellState.FILLED, CellState.FILLED, CellState.EMPTY, CellState.EMPTY];
            const guess = actual;

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([{ length: 2, solved: true }]);
        });

        it('should handle sequence at end of line', () => {
            const actual = [
                CellState.EMPTY,
                CellState.EMPTY,
                CellState.FILLED,
                CellState.FILLED,
                CellState.FILLED,
            ];
            const guess = actual;

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([{ length: 3, solved: true }]);
        });

        it('should mark sequence as unsolved when not all cells are filled in guess', () => {
            const actual = [
                CellState.EMPTY,
                CellState.FILLED,
                CellState.FILLED,
                CellState.FILLED,
                CellState.EMPTY,
            ];
            const guess = [
                CellState.EMPTY,
                CellState.FILLED,
                CellState.UNKNOWN,
                CellState.FILLED,
                CellState.EMPTY,
            ];

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([{ length: 3, solved: false }]);
        });

        it('should mark sequence as unsolved when boundaries are not marked empty', () => {
            const actual = [
                CellState.EMPTY,
                CellState.FILLED,
                CellState.FILLED,
                CellState.FILLED,
                CellState.EMPTY,
            ];
            const guess = [
                CellState.UNKNOWN,
                CellState.FILLED,
                CellState.FILLED,
                CellState.FILLED,
                CellState.EMPTY,
            ];

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([{ length: 3, solved: false }]);
        });

        it('should handle all cells filled', () => {
            const actual = [CellState.FILLED, CellState.FILLED, CellState.FILLED];
            const guess = actual;

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([{ length: 3, solved: true }]);
        });

        it('should handle alternating pattern', () => {
            const actual = [
                CellState.FILLED,
                CellState.EMPTY,
                CellState.FILLED,
                CellState.EMPTY,
                CellState.FILLED,
            ];
            const guess = actual;

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([
                { length: 1, solved: true },
                { length: 1, solved: true },
                { length: 1, solved: true },
            ]);
        });

        it('should mark all sequences unsolved in DRAW mode', () => {
            const actual = [CellState.FILLED, CellState.FILLED, CellState.EMPTY, CellState.FILLED];
            const guess = actual;

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.DRAW);

            expect(result).toEqual([
                { length: 2, solved: false },
                { length: 1, solved: false },
            ]);
        });

        it('should handle undefined cells as UNKNOWN', () => {
            const actual = [CellState.FILLED, CellState.FILLED, CellState.EMPTY];
            const guess = [undefined, CellState.FILLED, CellState.EMPTY];

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([{ length: 2, solved: false }]);
        });

        it('should calculate definition for real nonogram pattern', () => {
            // Pattern: XX..X...XX.XXXX (from a 15-cell line)
            const actual = [
                CellState.FILLED,
                CellState.FILLED,
                CellState.EMPTY,
                CellState.EMPTY,
                CellState.FILLED,
                CellState.EMPTY,
                CellState.EMPTY,
                CellState.EMPTY,
                CellState.FILLED,
                CellState.FILLED,
                CellState.EMPTY,
                CellState.FILLED,
                CellState.FILLED,
                CellState.FILLED,
                CellState.FILLED,
            ];
            const guess = actual;

            const result = calculator.calculateLineDefinition(actual, guess, GameMode.PLAY);

            expect(result).toEqual([
                { length: 2, solved: true },
                { length: 1, solved: true },
                { length: 2, solved: true },
                { length: 4, solved: true },
            ]);
        });
    });
});
