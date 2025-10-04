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
 * DefinitionCalculator - Calculates row/column definitions (clue numbers)
 * Extracted from Model to follow Single Responsibility Principle
 */
dfd.nonograms.DefinitionCalculator = function () {};

dfd.nonograms.DefinitionCalculator.prototype = {
    /**
     * Calculate definition for a line (row or column)
     * @param {Array} actualCells - Array of actual cell states for the line
     * @param {Array} guessCells - Array of guess cell states for the line
     * @param {string} mode - Current game mode (PLAY or DRAW)
     * @returns {Array} Array of {length, solved} objects
     */
    calculateLineDefinition: function (actualCells, guessCells, mode) {
        var CellState = dfd.nonograms.CellState;
        var GameMode = dfd.nonograms.GameMode;
        var definition = [];
        var length = actualCells.length;

        var sequenceBegin;
        var sequenceEnd;
        var sequenceSolved;
        var sequenceLength = 0;

        for (var i = 0; i < length; i++) {
            if (actualCells[i] === CellState.FILLED) {
                if (sequenceLength === 0) sequenceBegin = i;
                sequenceLength++;
            } else if (sequenceLength) {
                sequenceEnd = i - 1;
                sequenceSolved = this._isSequenceSolved(
                    sequenceBegin, sequenceEnd, length,
                    guessCells, mode
                );

                definition.push({
                    length: sequenceLength,
                    solved: sequenceSolved
                });

                sequenceLength = 0;
            }
        }

        // Handle sequence that extends to the end of the line
        if (sequenceLength) {
            sequenceEnd = length - 1;
            sequenceSolved = this._isSequenceSolved(
                sequenceBegin, sequenceEnd, length,
                guessCells, mode
            );

            definition.push({
                length: sequenceLength,
                solved: sequenceSolved
            });
        }

        return definition;
    },

    /**
     * Check if a sequence is correctly solved
     */
    _isSequenceSolved: function (begin, end, lineLength, guessCells, mode) {
        var CellState = dfd.nonograms.CellState;
        var GameMode = dfd.nonograms.GameMode;

        if (mode !== GameMode.PLAY) return false;

        // Check boundaries - sequence must be surrounded by empty cells
        var leftBoundary = (begin === 0) || (guessCells[begin - 1] === CellState.EMPTY);
        var rightBoundary = (end === lineLength - 1) || (guessCells[end + 1] === CellState.EMPTY);

        if (!leftBoundary || !rightBoundary) return false;

        // Check all cells in sequence are filled
        for (var i = begin; i <= end; i++) {
            if (guessCells[i] !== CellState.FILLED) {
                return false;
            }
        }

        return true;
    }
};

}(window);
