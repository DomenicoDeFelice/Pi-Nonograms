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

import { CellState, CellStateType, GameMode, GameModeType } from './constants.js';

export interface LineDefinition {
    length: number;
    solved: boolean;
}

/**
 * Calculates row/column definitions (clue numbers).
 */
export class DefinitionCalculator {
    /**
     * Calculate definition for a line (row or column)
     */
    calculateLineDefinition(
        actualCells: (CellStateType | undefined)[],
        guessCells: (CellStateType | undefined)[],
        mode: GameModeType
    ): LineDefinition[] {
        const definition: LineDefinition[] = [];
        const length = actualCells.length;

        let sequenceBegin: number;
        let sequenceEnd: number;
        let sequenceSolved: boolean;
        let sequenceLength = 0;

        for (let i = 0; i < length; i++) {
            if (actualCells[i] === CellState.FILLED) {
                if (sequenceLength === 0) sequenceBegin = i;
                sequenceLength++;
            } else if (sequenceLength) {
                sequenceEnd = i - 1;
                sequenceSolved = this.isSequenceSolved(
                    sequenceBegin!,
                    sequenceEnd,
                    length,
                    guessCells,
                    mode
                );

                definition.push({
                    length: sequenceLength,
                    solved: sequenceSolved,
                });

                sequenceLength = 0;
            }
        }

        // Handle sequence that extends to the end of the line
        if (sequenceLength) {
            sequenceEnd = length - 1;
            sequenceSolved = this.isSequenceSolved(
                sequenceBegin!,
                sequenceEnd,
                length,
                guessCells,
                mode
            );

            definition.push({
                length: sequenceLength,
                solved: sequenceSolved,
            });
        }

        return definition;
    }

    /**
     * Check if a sequence is correctly solved
     */
    private isSequenceSolved(
        begin: number,
        end: number,
        lineLength: number,
        guessCells: (CellStateType | undefined)[],
        mode: GameModeType
    ): boolean {
        if (mode !== GameMode.PLAY) return false;

        // Check boundaries - sequence must be surrounded by empty cells
        const leftBoundary = begin === 0 || guessCells[begin - 1] === CellState.EMPTY;
        const rightBoundary = end === lineLength - 1 || guessCells[end + 1] === CellState.EMPTY;

        if (!leftBoundary || !rightBoundary) return false;

        // Check all cells in sequence are filled
        for (let i = begin; i <= end; i++) {
            if (guessCells[i] !== CellState.FILLED) {
                return false;
            }
        }

        return true;
    }
}
