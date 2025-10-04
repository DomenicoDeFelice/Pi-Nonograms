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

dfd.nonograms.Model = function (opts) {
    if (!opts) opts = {};

    this.width  = opts.width;
    this.height = opts.height;

    // Initialize helper classes
    this._definitionCalc = new dfd.nonograms.DefinitionCalculator();
    this._hintProvider = new dfd.nonograms.HintProvider(opts.srand);
    this._generator = new dfd.nonograms.NonogramGenerator(opts.srand);

    // Events fired by the model
    this.events = {};

    // The user guessed the content of a cell
    this.events.guessChanged     = new dfd.Event(this);
    // The nonogram has been changed
    this.events.nonogramChanged  = new dfd.Event(this);
    // The user solved the nonogram
    this.events.nonogramSolved   = new dfd.Event(this);
    // The nonogram was solved but now it isn't
    this.events.nonogramUnsolved = new dfd.Event(this);

    this._setupNonogram();
    this.setMode(opts.mode);
};


dfd.nonograms.Model.prototype = {
    // Returns the state of a cell.
    // Arguments can be the x and y coordinates of the cell or
    // the index of the cell (second argument not passed)
    getCellAt: function (x, y) {
        return this._actual.get(x, y);
    },

    getGuessAt: function (x, y) {
        return this._guess.get(x, y);
    },

    setGuessAt: function (x, y, guess) {
        var GameMode = dfd.nonograms.GameMode;
        var index;

        if (guess === undefined) {
            // Shift arguments - called with (index, guess)
            guess = y;
            index = x;
            var xy = this._actual._XYFromIndex(index);
            x = xy[0];
            y = xy[1];
        }

        var oldGuess = this.getGuessAt(x, y);
        this._guess.set(x, y, guess);

        this.events.guessChanged.notify({
            x: x,
            y: y,
            oldGuess: oldGuess,
            newGuess: guess
        });

        if (this._mode === GameMode.PLAY) this._checkIfSolved();
    },

    getMode: function () {
        return this._mode;
    },

    setMode: function (mode) {
        var GameMode = dfd.nonograms.GameMode;
        var CellState = dfd.nonograms.CellState;

        if (mode === this._mode) return;

        this._mode = mode;

        if (mode === GameMode.DRAW) {
            // In draw mode, guess and actual are the same
            this._guess = this._actual;
        } else {
            // In play mode, create new empty guess grid with UNKNOWN default
            this._guess = new dfd.nonograms.Grid(this.width, this.height, CellState.UNKNOWN);
        }

        this._setUnsolved();
        this.events.nonogramChanged.notify();
    },

    isSolved: function () {
        return this._solved;
    },

    getRowDefinition: function (row) {
        var actualCells = this._actual.getRow(row);
        var guessCells = this._guess.getRow(row);
        return this._definitionCalc.calculateLineDefinition(actualCells, guessCells, this._mode);
    },

    getColumnDefinition: function (col) {
        var actualCells = this._actual.getColumn(col);
        var guessCells = this._guess.getColumn(col);
        return this._definitionCalc.calculateLineDefinition(actualCells, guessCells, this._mode);
    },

    giveHint: function () {
        var GameMode = dfd.nonograms.GameMode;

        // Is there any hint to give?
        if (this.isSolved() || this._mode !== GameMode.PLAY) return;

        var hint = this._hintProvider.findHint(this._actual, this._guess);
        if (hint) {
            this.setGuessAt(hint.x, hint.y, hint.value);
        }
    },

    randomize: function (density) {
        var GameMode = dfd.nonograms.GameMode;

        this._setupNonogram();
        this._mode = GameMode.PLAY;

        this._generator.generate(this._actual, density);

        this.events.nonogramChanged.notify();
    },

    resetGuesses: function () {
        var GameMode = dfd.nonograms.GameMode;
        var CellState = dfd.nonograms.CellState;

        this._guess = new dfd.nonograms.Grid(this.width, this.height, CellState.UNKNOWN);
        if (this._mode === GameMode.DRAW) {
            this._actual = this._guess;
        }

        this._solved = false;

        this.events.nonogramChanged.notify();
    },

    // Private methods
    _setupNonogram: function () {
        var CellState = dfd.nonograms.CellState;
        this._actual = new dfd.nonograms.Grid(this.width, this.height, CellState.EMPTY);
        this._guess  = new dfd.nonograms.Grid(this.width, this.height, CellState.UNKNOWN);
        this._setUnsolved();
    },

    _setSolved: function () {
        if (!this.isSolved()) {
            this._solved = true;
            this.events.nonogramSolved.notify();
        }
    },

    _setUnsolved: function () {
        if (this.isSolved()) {
            this._solved = false;
            this.events.nonogramUnsolved.notify();
        }
    },

    _checkIfSolved: function () {
        var CellState = dfd.nonograms.CellState;
        var model = this;
        var solved = true;

        this._actual.forEach(function (x, y, actualValue) {
            var guessValue = model._guess.get(x, y);

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
};

}(window);
