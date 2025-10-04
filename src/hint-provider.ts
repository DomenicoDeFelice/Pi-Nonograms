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

import { CellState, CellStateType } from './constants.js';
import { Grid } from './grid.js';
import type Srand from 'seeded-rand';

export interface Hint {
    x: number;
    y: number;
    value: CellStateType | undefined;
}

/**
 * Provides hints for solving the nonogram.
 */
export class HintProvider {
    private srand: Srand;

    constructor(srand: Srand) {
        this.srand = srand;
    }

    /**
     * Find a hint to give the player
     * First checks for errors, then completes a random unknown cell
     *
     * @returns {x, y, value} or null if no hint available
     */
    findHint(actualGrid: Grid<CellStateType>, guessGrid: Grid<CellStateType>): Hint | null {
        // First, check for errors and correct them
        const errorHint = this.findError(actualGrid, guessGrid);
        if (errorHint) {
            return errorHint;
        }

        // No errors found, complete a random unknown cell
        return this.findUnknownCell(actualGrid, guessGrid);
    }

    /**
     * Find the first error in the guess grid
     */
    private findError(
        actualGrid: Grid<CellStateType>,
        guessGrid: Grid<CellStateType>
    ): Hint | null {
        let hint: Hint | null = null;

        guessGrid.forEach((x, y, guessValue, index) => {
            if (hint) return; // Already found an error

            const actualValue = actualGrid.get(index);

            if (
                (guessValue === CellState.FILLED && actualValue !== CellState.FILLED) ||
                (guessValue === CellState.EMPTY && actualValue === CellState.FILLED)
            ) {
                hint = {
                    x: x,
                    y: y,
                    value: actualValue,
                };
            }
        });

        return hint;
    }

    /**
     * Find a random unknown cell to reveal
     */
    private findUnknownCell(
        actualGrid: Grid<CellStateType>,
        guessGrid: Grid<CellStateType>
    ): Hint | null {
        // First, check if there are any unknown cells at all
        const unknownCells: { x: number; y: number }[] = [];
        guessGrid.forEach((x, y, guessValue) => {
            if (guessValue === CellState.UNKNOWN) {
                unknownCells.push({ x: x, y: y });
            }
        });

        // If no unknown cells, return null (puzzle is complete or all cells have been guessed)
        if (unknownCells.length === 0) {
            return null;
        }

        // Pick a random unknown cell
        const randomIndex = this.srand.intInRange(0, unknownCells.length - 1);
        const cell = unknownCells[randomIndex];

        return {
            x: cell.x,
            y: cell.y,
            value: actualGrid.get(cell.x, cell.y),
        };
    }
}
