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
import { HintProvider } from '../hint-provider.js';
import { Grid } from '../grid.js';
import { CellState, CellStateType } from '../constants.js';
import Srand from 'seeded-rand';

describe('HintProvider', () => {
    let hintProvider: HintProvider;
    let srand: Srand;

    beforeEach(() => {
        srand = new Srand(12345);
        hintProvider = new HintProvider(srand);
    });

    describe('findHint', () => {
        it('should return null when puzzle is complete', () => {
            const actualGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            actualGrid.set(0, 0, CellState.FILLED);
            actualGrid.set(1, 1, CellState.FILLED);

            const guessGrid = actualGrid.clone();

            const hint = hintProvider.findHint(actualGrid, guessGrid);

            expect(hint).toBeNull();
        });

        it('should correct an error when filled cell is marked empty', () => {
            const actualGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            actualGrid.set(1, 1, CellState.FILLED);

            const guessGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            guessGrid.set(1, 1, CellState.EMPTY); // Error!

            const hint = hintProvider.findHint(actualGrid, guessGrid);

            expect(hint).toEqual({
                x: 1,
                y: 1,
                value: CellState.FILLED,
            });
        });

        it('should correct an error when empty cell is marked filled', () => {
            const actualGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            actualGrid.set(0, 0, CellState.EMPTY);

            const guessGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            guessGrid.set(0, 0, CellState.FILLED); // Error!

            const hint = hintProvider.findHint(actualGrid, guessGrid);

            expect(hint).toEqual({
                x: 0,
                y: 0,
                value: CellState.EMPTY,
            });
        });

        it('should reveal a random unknown cell when no errors exist', () => {
            const actualGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            actualGrid.set(0, 0, CellState.FILLED);
            actualGrid.set(1, 1, CellState.FILLED);
            actualGrid.set(2, 2, CellState.EMPTY);

            const guessGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            guessGrid.set(0, 0, CellState.FILLED); // Correct

            const hint = hintProvider.findHint(actualGrid, guessGrid);

            expect(hint).not.toBeNull();
            expect(hint!.value).toBe(actualGrid.get(hint!.x, hint!.y));
        });

        it('should prioritize errors over unknown cells', () => {
            const actualGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            actualGrid.set(0, 0, CellState.FILLED);
            actualGrid.set(2, 2, CellState.FILLED);

            const guessGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            guessGrid.set(0, 0, CellState.EMPTY); // Error!

            const hint = hintProvider.findHint(actualGrid, guessGrid);

            // Should correct the error, not reveal an unknown cell
            expect(hint).toEqual({
                x: 0,
                y: 0,
                value: CellState.FILLED,
            });
        });

        it('should use seeded random for consistent hint selection', () => {
            const actualGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            actualGrid.set(0, 0, CellState.FILLED);
            actualGrid.set(1, 1, CellState.EMPTY);
            actualGrid.set(2, 2, CellState.FILLED);

            // Create two hint providers with the same seed
            const provider1 = new HintProvider(new Srand(99999));
            const provider2 = new HintProvider(new Srand(99999));

            const guessGrid1 = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            const guessGrid2 = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);

            const hint1 = provider1.findHint(actualGrid, guessGrid1);
            const hint2 = provider2.findHint(actualGrid, guessGrid2);

            // Should select the same random unknown cell
            expect(hint1).toEqual(hint2);
        });

        it('should find first error in grid order', () => {
            const actualGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            actualGrid.set(0, 0, CellState.FILLED);
            actualGrid.set(2, 2, CellState.FILLED);

            const guessGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            guessGrid.set(0, 0, CellState.EMPTY); // First error
            guessGrid.set(2, 2, CellState.EMPTY); // Second error

            const hint = hintProvider.findHint(actualGrid, guessGrid);

            // Should return the first error encountered
            expect(hint).toEqual({
                x: 0,
                y: 0,
                value: CellState.FILLED,
            });
        });

        it('should handle grid with only unknown cells', () => {
            const actualGrid = new Grid<CellStateType>(2, 2, CellState.UNKNOWN);
            actualGrid.set(0, 0, CellState.FILLED);
            actualGrid.set(1, 1, CellState.EMPTY);

            const guessGrid = new Grid<CellStateType>(2, 2, CellState.UNKNOWN);

            const hint = hintProvider.findHint(actualGrid, guessGrid);

            expect(hint).not.toBeNull();
            expect([0, 1]).toContain(hint!.x);
            expect(hint!.value).toBe(actualGrid.get(hint!.x, hint!.y));
        });

        it('should handle mixed correct guesses and unknown cells', () => {
            const actualGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            actualGrid.set(0, 0, CellState.FILLED);
            actualGrid.set(1, 1, CellState.EMPTY);
            actualGrid.set(2, 2, CellState.FILLED);

            const guessGrid = new Grid<CellStateType>(3, 3, CellState.UNKNOWN);
            guessGrid.set(0, 0, CellState.FILLED); // Correct
            guessGrid.set(2, 2, CellState.FILLED); // Correct
            // (1,1) is unknown

            const hint = hintProvider.findHint(actualGrid, guessGrid);

            // Should reveal the one remaining unknown cell
            expect(hint).toEqual({
                x: 1,
                y: 1,
                value: CellState.EMPTY,
            });
        });
    });
});
