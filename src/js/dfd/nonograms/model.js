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

import { Event } from '../event.js';
import { Grid } from './grid.js';
import { CellState, GameMode } from './constants.js';
import { DefinitionCalculator } from './definition_calculator.js';
import { HintProvider } from './hint_provider.js';
import { NonogramGenerator } from './nonogram_generator.js';

export class Model {
    constructor(opts) {
        if (!opts) opts = {};

        this.width  = opts.width;
        this.height = opts.height;

        // Initialize helper classes
        this._definitionCalc = new DefinitionCalculator();
        this._hintProvider = new HintProvider(opts.srand);
        this._generator = new NonogramGenerator(opts.srand);

        // Events fired by the model
        this.events = {};

        // The user guessed the content of a cell
        this.events.guessChanged     = new Event(this);
        // The nonogram has been changed
        this.events.nonogramChanged  = new Event(this);
        // The user solved the nonogram
        this.events.nonogramSolved   = new Event(this);
        // The nonogram was solved but now it isn't
        this.events.nonogramUnsolved = new Event(this);

        this._setupNonogram();
        this.setMode(opts.mode);
    }

    // Returns the state of a cell.
    // Arguments can be the x and y coordinates of the cell or
    // the index of the cell (second argument not passed)
    getCellAt(x, y) {
        return this._actual.get(x, y);
    }

    getGuessAt(x, y) {
        return this._guess.get(x, y);
    }

    setGuessAt(x, y, guess) {
        let index;

        if (guess === undefined) {
            // Shift arguments - called with (index, guess)
            guess = y;
            index = x;
            const xy = this._actual._XYFromIndex(index);
            x = xy[0];
            y = xy[1];
        }

        const oldGuess = this.getGuessAt(x, y);
        this._guess.set(x, y, guess);

        this.events.guessChanged.notify({
            x: x,
            y: y,
            oldGuess: oldGuess,
            newGuess: guess
        });

        if (this._mode === GameMode.PLAY) this._checkIfSolved();
    }

    getMode() {
        return this._mode;
    }

    setMode(mode) {
        if (mode === this._mode) return;

        this._mode = mode;

        if (mode === GameMode.DRAW) {
            // In draw mode, guess and actual are the same
            this._guess = this._actual;
        } else {
            // In play mode, create new empty guess grid with UNKNOWN default
            this._guess = new Grid(this.width, this.height, CellState.UNKNOWN);
        }

        this._setUnsolved();
        this.events.nonogramChanged.notify();
    }

    isSolved() {
        return this._solved;
    }

    getRowDefinition(row) {
        const actualCells = this._actual.getRow(row);
        const guessCells = this._guess.getRow(row);
        return this._definitionCalc.calculateLineDefinition(actualCells, guessCells, this._mode);
    }

    getColumnDefinition(col) {
        const actualCells = this._actual.getColumn(col);
        const guessCells = this._guess.getColumn(col);
        return this._definitionCalc.calculateLineDefinition(actualCells, guessCells, this._mode);
    }

    giveHint() {
        // Is there any hint to give?
        if (this.isSolved() || this._mode !== GameMode.PLAY) return;

        const hint = this._hintProvider.findHint(this._actual, this._guess);
        if (hint) {
            this.setGuessAt(hint.x, hint.y, hint.value);
        }
    }

    randomize(density) {
        this._setupNonogram();
        this._mode = GameMode.PLAY;

        this._generator.generate(this._actual, density);

        this.events.nonogramChanged.notify();
    }

    resetGuesses() {
        this._guess = new Grid(this.width, this.height, CellState.UNKNOWN);
        if (this._mode === GameMode.DRAW) {
            this._actual = this._guess;
        }

        this._solved = false;

        this.events.nonogramChanged.notify();
    }

    // Private methods
    _setupNonogram() {
        this._actual = new Grid(this.width, this.height, CellState.EMPTY);
        this._guess  = new Grid(this.width, this.height, CellState.UNKNOWN);
        this._setUnsolved();
    }

    _setSolved() {
        if (!this.isSolved()) {
            this._solved = true;
            this.events.nonogramSolved.notify();
        }
    }

    _setUnsolved() {
        if (this.isSolved()) {
            this._solved = false;
            this.events.nonogramUnsolved.notify();
        }
    }

    _checkIfSolved() {
        let solved = true;

        this._actual.forEach((x, y, actualValue) => {
            const guessValue = this._guess.get(x, y);

            if ((actualValue === CellState.FILLED && guessValue !== CellState.FILLED) ||
                (actualValue !== CellState.FILLED && guessValue === CellState.FILLED)) {
                solved = false;
            }
        });

        if (solved) {
            this._setSolved();
        } else {
            this._setUnsolved();
        }
    }
}
