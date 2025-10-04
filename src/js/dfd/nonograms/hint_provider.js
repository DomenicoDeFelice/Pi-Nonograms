/*
  A nonogram game written in javascript
  https://github.com/DomenicoDeFelice/Pi-Nonograms

  Play the game: http://freenonograms.altervista.org

  Copyright (c) 2013-2015 Domenico De Felice

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
 * HintProvider - Provides hints for solving the nonogram
 * Extracted from Model to follow Single Responsibility Principle
 */
dfd.nonograms.HintProvider = function (srand) {
    this._srand = srand;
};

dfd.nonograms.HintProvider.prototype = {
    /**
     * Find a hint to give the player
     * First checks for errors, then completes a random unknown cell
     *
     * @param {Grid} actualGrid - The actual solution grid
     * @param {Grid} guessGrid - The player's guess grid
     * @returns {Object|null} {x, y, value} or null if no hint available
     */
    findHint: function (actualGrid, guessGrid) {
        var CellState = dfd.nonograms.CellState;

        // First, check for errors and correct them
        var errorHint = this._findError(actualGrid, guessGrid);
        if (errorHint) {
            return errorHint;
        }

        // No errors found, complete a random unknown cell
        return this._findUnknownCell(actualGrid, guessGrid);
    },

    /**
     * Find the first error in the guess grid
     */
    _findError: function (actualGrid, guessGrid) {
        var CellState = dfd.nonograms.CellState;
        var hint = null;

        guessGrid.forEach(function (x, y, guessValue, index) {
            if (hint) return; // Already found an error

            var actualValue = actualGrid.get(index);

            if ((guessValue === CellState.FILLED && actualValue !== CellState.FILLED) ||
                (guessValue === CellState.EMPTY && actualValue === CellState.FILLED)) {
                hint = {
                    x: x,
                    y: y,
                    value: actualValue
                };
            }
        });

        return hint;
    },

    /**
     * Find a random unknown cell to reveal
     */
    _findUnknownCell: function (actualGrid, guessGrid) {
        var CellState = dfd.nonograms.CellState;
        var width = actualGrid.width;
        var height = actualGrid.height;

        // First, check if there are any unknown cells at all
        var unknownCells = [];
        guessGrid.forEach(function (x, y, guessValue) {
            if (guessValue === CellState.UNKNOWN) {
                unknownCells.push({x: x, y: y});
            }
        });

        // If no unknown cells, return null (puzzle is complete or all cells have been guessed)
        if (unknownCells.length === 0) {
            return null;
        }

        // Pick a random unknown cell
        var randomIndex = this._srand.randomIntegerIn(0, unknownCells.length - 1);
        var cell = unknownCells[randomIndex];

        return {
            x: cell.x,
            y: cell.y,
            value: actualGrid.get(cell.x, cell.y)
        };
    }
};

}(window);
