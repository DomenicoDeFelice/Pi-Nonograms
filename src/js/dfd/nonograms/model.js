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
    this._srand = opts.srand;

    // Events fired by the model
    this.events = {};

    // The ussr guessed the content of a cell
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
    // Coordinate helper methods
    _indexFromXY: function (x, y) {
        return y * this.width + x;
    },

    _XYFromIndex: function (index) {
        var width = this.width;
        var y = Math.floor(index / width);
        var x = index % width;
        return [x, y];
    },

    // Returns the state of a cell.
    // Arguments can be the x and y coordinates of the cell or
    // the index of the cell (second argument not passed)
    getCellAt: function (x, y) {
        var CellState = dfd.nonograms.CellState;
        var index;
        if (y === undefined) {
            index = x;
        } else {
            index = this._indexFromXY(x, y);
        }

        var cell = this._actual[index];
        return (cell === undefined) ? CellState.EMPTY : cell;
    },

    getGuessAt: function (x, y) {
        var CellState = dfd.nonograms.CellState;
        var index;
        if (y === undefined) {
            index = x;
        } else {
            index = this._indexFromXY(x, y);
        }

        var guess = this._guess[index];
        return (guess === undefined) ? CellState.UNKNOWN : guess;
    },

    setGuessAt: function (x, y, guess) {
        var index;

        if (guess === undefined) {
            // Shift arguments
            guess = y;
            index = x;
        } else {
            index = this._indexFromXY(x, y);
        }

        var oldGuess = this.getGuessAt(index);
        this._guess[index] = guess;

        this.events.guessChanged.notify({
            x: x,
            y: y,
            oldGuess: oldGuess,
            newGuess: guess
        });

        var GameMode = dfd.nonograms.GameMode;
        if (this._mode === GameMode.PLAY) this._checkIfSolved();
    },

    getMode: function () {
        return this._mode;
    },

    setMode: function (mode) {
        var GameMode = dfd.nonograms.GameMode;
        if (mode === this._mode) return;

        this._mode = mode;

        if (mode === GameMode.DRAW) {
            this._guess = this._actual;
        } else {
            var nCells = this.width * this.height;
            this._guess = new Array(nCells);
        }

        this._setUnsolved();
        this.events.nonogramChanged.notify();
    },

    isSolved: function () {
        return this._solved;
    },

    getRowDefinition: function (row) {
        var model = this;
        return this._getLineDefinition(
            this.width,
            function(i) { return model.getCellAt(i, row); },
            function(i) { return model.getGuessAt(i, row); },
            function(i) { return i === 0 || i === model.width - 1; }
        );
    },

    getColumnDefinition: function (col) {
        var model = this;
        return this._getLineDefinition(
            this.height,
            function(i) { return model.getCellAt(col, i); },
            function(i) { return model.getGuessAt(col, i); },
            function(i) { return i === 0 || i === model.height - 1; }
        );
    },

    // Private helper to eliminate duplication between row and column definition logic
    _getLineDefinition: function (length, getCellFn, getGuessFn, isEdgeFn) {
        var CellState = dfd.nonograms.CellState;
        var GameMode = dfd.nonograms.GameMode;
        var definition = [];

        var sequenceBegin;
        var sequenceEnd;
        var sequenceSolved;
        var sequenceLength = 0;

        var mode = this._mode;

        for (var i = 0; i < length; i++) {
            if (getCellFn(i) === CellState.FILLED) {
                if (sequenceLength === 0) sequenceBegin = i;
                sequenceLength++;
            } else if (sequenceLength) {
                sequenceEnd = i - 1;
                sequenceSolved = false;

                if (mode === GameMode.PLAY) {
                    if ((isEdgeFn(sequenceBegin) || getGuessFn(sequenceBegin - 1) === CellState.EMPTY) &&
                        (isEdgeFn(sequenceEnd) || getGuessFn(sequenceEnd + 1) === CellState.EMPTY)) {

                        sequenceSolved = true;
                        for (var index = sequenceBegin; index <= sequenceEnd; index++) {
                            if (getGuessFn(index) !== CellState.FILLED) {
                                sequenceSolved = false;
                                break;
                            }
                        }
                    }
                }

                definition.push({
                    length: sequenceLength,
                    solved: sequenceSolved
                });

                sequenceLength = 0;
            }
        }

        // Handle sequence that extends to the end of the line
        if (sequenceLength) {
            sequenceEnd = i - 1;
            sequenceSolved = false;

            if (mode === GameMode.PLAY) {
                if ((isEdgeFn(sequenceBegin) || getGuessFn(sequenceBegin - 1) === CellState.EMPTY) &&
                    (isEdgeFn(sequenceEnd) || getGuessFn(sequenceEnd + 1) === CellState.EMPTY)) {

                    sequenceSolved = true;
                    for (var index = sequenceBegin; index <= sequenceEnd; index++) {
                        if (getGuessFn(index) !== CellState.FILLED) {
                            sequenceSolved = false;
                            break;
                        }
                    }
                }
            }

            definition.push({
                length: sequenceLength,
                solved: sequenceSolved
            });
        }

        return definition;
    },

    giveHint: function () {
        var CellState = dfd.nonograms.CellState;
        var GameMode = dfd.nonograms.GameMode;

        // Is there any hint to give?
        if (this.isSolved() || this._mode !== GameMode.PLAY) return;

        // Let's first check for errors
        var nCells = this.width * this.height;
        var actual = this._actual;
        var guess  = this._guess;
        var xy, x, y;
        for (var index=nCells; index--; ) {
            if ((guess[index] === CellState.FILLED && actual[index] !== CellState.FILLED) ||
                (guess[index] === CellState.EMPTY  && actual[index] === CellState.FILLED)) {
                // Error found, correct it
                xy = this._XYFromIndex(index);
                x = xy[0];
                y = xy[1];
                this.setGuessAt(x, y, this.getCellAt(x, y));
                return;
            }
        }

        // No errors found, let's complete a cell
        do {
            xy = this._getRandomXY();
            x = xy[0];
            y = xy[1];
        } while (this.getGuessAt(x, y) !== CellState.UNKNOWN)
        this.setGuessAt(x, y, this.getCellAt(x, y));
    },

    randomize: function (density) {
        var CellState = dfd.nonograms.CellState;
        var GameMode = dfd.nonograms.GameMode;

        this._setupNonogram();
        this._mode = GameMode.PLAY;

        var actual = this._actual;
        var nCells = this.width * this.height;
        var toBeFilled = Math.floor(nCells * density);
        if (toBeFilled > nCells) toBeFilled = nCells;

        var index;
        while (toBeFilled) {
            index = this._getRandomIndex();
            if (actual[index] === undefined) {
                actual[index] = CellState.FILLED;
                toBeFilled--;
            }
        }

        this.events.nonogramChanged.notify();
    },

    resetGuesses: function () {
        var GameMode = dfd.nonograms.GameMode;
        var nCells = this.width * this.height;

        this._guess = new Array(nCells);
        if (this._mode === GameMode.DRAW) {
            this._actual = this._guess;
        }

        this._solved = false;

        this.events.nonogramChanged.notify();
    },

    // Private methods
    _setupNonogram: function () {
        var nCells = this.width * this.height;

        this._actual = new Array(nCells);
        this._guess  = new Array(nCells);
        this._setUnsolved();
    },

    _getRandomIndex: function () {
        var nCells = this.width * this.height;
        return this._srand.randomIntegerIn(0, nCells - 1);
    },

    _getRandomXY: function () {
        var x = this._srand.randomIntegerIn(0, this.width  - 1);
        var y = this._srand.randomIntegerIn(0, this.height - 1);
        return [x, y];
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
        var actual = this._actual;
        var guess  = this._guess;

        for (var index = actual.length; index--; ) {
            if ((actual[index] === CellState.FILLED && guess[index] !== CellState.FILLED) ||
                (actual[index] !== CellState.FILLED && guess[index] === CellState.FILLED)) {
                this._setUnsolved();
                return;
            }
        }
        this._setSolved();
    }
};

}(window);
