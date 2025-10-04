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

/**
 * Generates random nonogram puzzles.
 */
export class NonogramGenerator {
    private srand: Srand;

    constructor(srand: Srand) {
        this.srand = srand;
    }

    /**
     * Generate a random nonogram by filling cells based on density
     *
     * @param grid - Empty grid to populate
     * @param density - Proportion of cells to fill (0.0 to 1.0)
     */
    generate(grid: Grid<CellStateType>, density: number): void {
        const nCells = grid.size();
        let toBeFilled = Math.floor(nCells * density);

        if (toBeFilled > nCells) toBeFilled = nCells;

        let index: number;
        while (toBeFilled) {
            index = this.srand.intInRange(0, nCells - 1);
            // Check if cell is empty (not yet filled)
            if (grid.get(index) === CellState.EMPTY) {
                grid.set(index, CellState.FILLED);
                toBeFilled--;
            }
        }
    }
}
