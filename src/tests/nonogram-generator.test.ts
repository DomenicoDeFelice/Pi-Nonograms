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

import { describe, it, expect } from 'vitest';
import { NonogramGenerator } from '../nonogram-generator.js';
import { Grid } from '../grid.js';
import { CellState, CellStateType } from '../constants.js';
import Srand from 'seeded-rand';

describe('NonogramGenerator', () => {
    describe('generate', () => {
        it('should fill cells according to density', () => {
            const srand = new Srand(12345);
            const generator = new NonogramGenerator(srand);
            const grid = new Grid<CellStateType>(10, 10, CellState.EMPTY);

            generator.generate(grid, 0.5);

            let filledCount = 0;
            grid.forEach((_x, _y, value) => {
                if (value === CellState.FILLED) filledCount++;
            });

            expect(filledCount).toBe(50);
        });

        it('should handle zero density (all empty)', () => {
            const srand = new Srand(12345);
            const generator = new NonogramGenerator(srand);
            const grid = new Grid<CellStateType>(5, 5, CellState.EMPTY);

            generator.generate(grid, 0);

            let filledCount = 0;
            grid.forEach((_x, _y, value) => {
                if (value === CellState.FILLED) filledCount++;
            });

            expect(filledCount).toBe(0);
        });

        it('should handle full density (all filled)', () => {
            const srand = new Srand(12345);
            const generator = new NonogramGenerator(srand);
            const grid = new Grid<CellStateType>(5, 5, CellState.EMPTY);

            generator.generate(grid, 1.0);

            let filledCount = 0;
            grid.forEach((_x, _y, value) => {
                if (value === CellState.FILLED) filledCount++;
            });

            expect(filledCount).toBe(25);
        });

        it('should cap density at 100% even if value exceeds 1.0', () => {
            const srand = new Srand(12345);
            const generator = new NonogramGenerator(srand);
            const grid = new Grid<CellStateType>(3, 3, CellState.EMPTY);

            generator.generate(grid, 1.5);

            let filledCount = 0;
            grid.forEach((_x, _y, value) => {
                if (value === CellState.FILLED) filledCount++;
            });

            expect(filledCount).toBe(9);
        });

        it('should produce consistent results with same seed', () => {
            const grid1 = new Grid<CellStateType>(10, 10, CellState.EMPTY);
            const grid2 = new Grid<CellStateType>(10, 10, CellState.EMPTY);

            const generator1 = new NonogramGenerator(new Srand(99999));
            const generator2 = new NonogramGenerator(new Srand(99999));

            generator1.generate(grid1, 0.6);
            generator2.generate(grid2, 0.6);

            // Both grids should be identical
            grid1.forEach((x, y, value) => {
                expect(value).toBe(grid2.get(x, y));
            });
        });

        it('should produce different results with different seeds', () => {
            const grid1 = new Grid<CellStateType>(10, 10, CellState.EMPTY);
            const grid2 = new Grid<CellStateType>(10, 10, CellState.EMPTY);

            const generator1 = new NonogramGenerator(new Srand(11111));
            const generator2 = new NonogramGenerator(new Srand(22222));

            generator1.generate(grid1, 0.5);
            generator2.generate(grid2, 0.5);

            // Grids should be different
            let differenceCount = 0;
            grid1.forEach((x, y, value) => {
                if (value !== grid2.get(x, y)) {
                    differenceCount++;
                }
            });

            expect(differenceCount).toBeGreaterThan(0);
        });

        it('should generate specific known puzzle for regression testing', () => {
            // This test ensures that puzzle ID mapping remains stable
            // If you add/remove PRNG calls, this test will fail
            const FIXED_SEED = 314159;
            const srand = new Srand(FIXED_SEED);
            const generator = new NonogramGenerator(srand);
            const grid = new Grid<CellStateType>(5, 5, CellState.EMPTY);

            generator.generate(grid, 0.6);

            // Count filled cells
            let filledCount = 0;
            grid.forEach((_x, _y, value) => {
                if (value === CellState.FILLED) filledCount++;
            });

            // Should fill exactly 15 cells (60% of 25)
            expect(filledCount).toBe(15);

            // Capture the exact pattern for regression testing
            // This ensures the puzzle with ID 314159 always generates the same pattern
            const pattern: boolean[] = [];
            grid.forEach((_x, _y, value) => {
                pattern.push(value === CellState.FILLED);
            });

            // Store the actual pattern generated (for first-time setup)
            // console.log('Actual pattern:', JSON.stringify(pattern));

            // This specific pattern should remain stable
            // If this fails, it means PRNG call order changed (breaking puzzle IDs)
            const expectedPattern = [
                true,
                false,
                true,
                false,
                false,
                true,
                false,
                true,
                true,
                false,
                true,
                false,
                true,
                true,
                true,
                true,
                true,
                true,
                false,
                false,
                true,
                false,
                true,
                false,
                true,
            ];

            expect(pattern).toEqual(expectedPattern);
        });

        it('should handle rectangular grids', () => {
            const srand = new Srand(12345);
            const generator = new NonogramGenerator(srand);
            const grid = new Grid<CellStateType>(8, 4, CellState.EMPTY);

            generator.generate(grid, 0.5);

            let filledCount = 0;
            grid.forEach((_x, _y, value) => {
                if (value === CellState.FILLED) filledCount++;
            });

            expect(filledCount).toBe(16); // 50% of 32
        });

        it('should handle small grids', () => {
            const srand = new Srand(12345);
            const generator = new NonogramGenerator(srand);
            const grid = new Grid<CellStateType>(2, 2, CellState.EMPTY);

            generator.generate(grid, 0.75);

            let filledCount = 0;
            grid.forEach((_x, _y, value) => {
                if (value === CellState.FILLED) filledCount++;
            });

            expect(filledCount).toBe(3); // 75% of 4
        });
    });
});
