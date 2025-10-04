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

!function (global) {

if (!global.dfd) {
    global.dfd = {};
}

if (!dfd.nonograms) {
    dfd.nonograms = {};
}

/**
 * NonogramGenerator - Generates random nonogram puzzles
 * Extracted from Model to follow Single Responsibility Principle
 */
dfd.nonograms.NonogramGenerator = function (srand) {
    this._srand = srand;
};

dfd.nonograms.NonogramGenerator.prototype = {
    /**
     * Generate a random nonogram by filling cells based on density
     *
     * @param {Grid} grid - Empty grid to populate
     * @param {number} density - Proportion of cells to fill (0.0 to 1.0)
     */
    generate: function (grid, density) {
        var CellState = dfd.nonograms.CellState;
        var nCells = grid.size();
        var toBeFilled = Math.floor(nCells * density);

        if (toBeFilled > nCells) toBeFilled = nCells;

        var index;
        while (toBeFilled) {
            index = this._srand.randomIntegerIn(0, nCells - 1);
            // Check if cell is empty (not yet filled)
            if (grid.get(index) === CellState.EMPTY) {
                grid.set(index, CellState.FILLED);
                toBeFilled--;
            }
        }
    }
};

}(window);
