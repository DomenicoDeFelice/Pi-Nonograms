/*
  A nonogram game written in javascript
  https://github.com/DomenicoDeFelice/Pi-Nonograms

  Play the game: http://freenonograms.altervista.org

  Copyright (c) 2013-2014 Domenico De Felice

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
    
if (!window.dfd) {
    window.dfd = {};
}

dfd.nonograms = {};


/* MVC pattern */

dfd.nonograms.Event = function (sender) {
    this._sender = sender;
    this._listeners = [];
};

dfd.nonograms.Event.prototype = {
    attach: function (listener) {
        this._listeners.push(listener);
    },

    notify: function (args) {
        for (var index = 0, nListeners = this._listeners.length; index < nListeners; index++) {
            this._listeners[index](this._sender, args);
        }
    }
};


/*
   __  __           _      _ 
  |  \/  |         | |    | |
  | \  / | ___   __| | ___| |
  | |\/| |/ _ \ / _` |/ _ \ |
  | |  | | (_) | (_| |  __/ |
  |_|  |_|\___/ \__,_|\___|_|
  
*/

dfd.nonograms.Model = function (opts) {
    if (!opts) opts = {};

    this.width  = opts.width;
    this.height = opts.height;
    this._srand = opts.srand;

    // Events fired by the model
    this.events = {};

    // The ussr guessed the content of a cell
    this.events.guessChanged     = new dfd.nonograms.Event(this);
    // The nonogram has been changed
    this.events.nonogramChanged  = new dfd.nonograms.Event(this);
    // The user solved the nonogram
    this.events.nonogramSolved   = new dfd.nonograms.Event(this);
    // The nonogram was solved but now it isn't
    this.events.nonogramUnsolved = new dfd.nonograms.Event(this);

    this._setupNonogram();
    this.setMode(opts.mode);
};


dfd.nonograms.Model.prototype = {
    // Returns the state of a cell.
    // Arguments can be the x and y coordinates of the cell or
    // the index of the cell (second argument not passed)
    getCellAt: function (x, y) {
        var index;
        if (y === undefined) {
            index = x;
        } else {
            index = this._indexFromXY(x, y);
        }

        var cell  = this._actual[index];
        return (cell === undefined) ? "empty" : cell;
    },

    getGuessAt: function (x, y) {
        var index;
        if (y === undefined) {
            index = x;
        } else {
            index = this._indexFromXY(x, y);
        }

        var guess = this._guess[index];
        return (guess === undefined) ? "unknown" : guess;
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

        if (this._mode === "play") this._checkIfSolved();
    },

    getMode: function () {
        return this._mode;
    },

    setMode: function (mode) {
        if (mode === this._mode) return;

        this._mode = mode;

        if (mode === "draw") {
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
        var definition = [];

        var sequenceBegin;
        var sequenceEnd;
        var sequenceSolved;
        var sequenceLength = 0;

        var mode = this._mode;

        for (var x = 0; x < this.width; x++) {
            if (this.getCellAt(x, row) === "filled") {
                if (sequenceLength === 0) sequenceBegin = x;
                sequenceLength++;
            } else if (sequenceLength) {
                sequenceEnd = x-1;

                sequenceSolved = false;

                if (mode === "play") {
                    if ((sequenceBegin === 0 || this.getGuessAt(sequenceBegin-1, row) === "empty")
                        && (sequenceEnd === this.width-1 || this.getGuessAt(sequenceEnd+1, row) === "empty")) {

                        sequenceSolved = true;
                        for (var index = sequenceBegin; index <= sequenceEnd; index++) {
                            if (this.getGuessAt(index, row) !== "filled") {
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

        if (sequenceLength) {
            sequenceEnd = x-1;

            sequenceSolved = false;

            if (mode === "play") {
                if ((sequenceBegin === 0             ||  this.getGuessAt(sequenceBegin-1, row) === "empty") &&
                    (sequenceEnd   === this.width-1  ||  this.getGuessAt(sequenceEnd+1,   row) === "empty")) {

                    sequenceSolved = true;
                    for (var index = sequenceBegin; index <= sequenceEnd; index++) {
                        if (this.getGuessAt(index, row) !== "filled") {
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

    getColumnDefinition: function (col) {
        var definition = [];

        var sequenceBegin;
        var sequenceEnd;
        var sequenceSolved;
        var sequenceLength = 0;

        var mode = this._mode;

        for (var y = 0; y < this.height; y++) {
            if (this.getCellAt(col, y) === "filled") {
                if (sequenceLength === 0) sequenceBegin = y;
                sequenceLength++;
            } else if (sequenceLength) {
                sequenceEnd = y-1;

                sequenceSolved = false;

                if (mode === "play") {
                    if ((sequenceBegin === 0              ||  this.getGuessAt(col, sequenceBegin-1) === "empty") &&
                        (sequenceEnd   === this.height-1  ||  this.getGuessAt(col, sequenceEnd+1)   === "empty")) {

                        sequenceSolved = true;
                        for (var index = sequenceBegin; index <= sequenceEnd; index++) {
                            if (this.getGuessAt(col, index) !== "filled") {
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

        if (sequenceLength) {
            sequenceEnd = y-1;

            sequenceSolved = false;

            if (mode === "play") {
                if ((sequenceBegin === 0              ||  this.getGuessAt(col, sequenceBegin-1) === "empty") &&
                    (sequenceEnd   === this.height-1  ||  this.getGuessAt(col, sequenceEnd+1)   === "empty")) {

                    sequenceSolved = true;
                    for (var index = sequenceBegin; index <= sequenceEnd; index++) {
                        if (this.getGuessAt(col, index) !== "filled") {
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
        // Is there any hint to give?
        if (this.isSolved() || this._mode !== "play") return;

        // Let's first check for errors
        var nCells = this.width * this.height;
        var actual = this._actual;
        var guess  = this._guess;
        var xy, x, y;
        for (var index=nCells; index--; ) {
            if ((guess[index] === "filled" && actual[index] !== "filled") ||
                (guess[index] === "empty"  && actual[index] === "filled")) {
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
        } while (this.getGuessAt(x, y) !== "unknown")
        this.setGuessAt(x, y, this.getCellAt(x, y));
    },

    randomize: function (density) {
        this._setupNonogram();
        this._mode = "play";

        var actual = this._actual;
        var nCells = this.width * this.height;
        var toBeFilled = Math.floor(nCells * density);
        if (toBeFilled > nCells) toBeFilled = nCells;

        var index;
        while (toBeFilled) {
            index = this._getRandomIndex();
            if (actual[index] === undefined) {
                actual[index] = "filled";
                toBeFilled--;
            }
        }

        this.events.nonogramChanged.notify();
    },

    resetGuesses: function () {
        var nCells = this.width * this.height;

        this._guess = new Array(nCells);
        if (this._mode === "draw") {
            this._actual = this._guess;
        }

        this._solved = false;

        this.events.nonogramChanged.notify();
    },

    // getGameState: function () {
    //     //  Actual   Guess     Value
    //     // --------------------------
    //     //  Empty    Unknown   0
    //     //  Empty    Empty     1
    //     //  Empty    Filled    2
    //     //  Filled   Unknown   3
    //     //  Filled   Empty     4
    //     //  Filled   Filled    5
    //     // --------------------------
    //     //              0       10        20        30        40        50        60        70        80 \ "      90
    //     //              12345678901234567890123456789012345678901234567890123456789012345678901234567890112234567890
    //     var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?,.:;[]()+-*/<>_|\\\"@#$%^&='";
    //     var state = "" + this.width + "x" + this.height + ":";
    //     for (var index = 0, nCells = this._actual.length; index < nCells; index++) {
    //         if (this._actual[index] === "filled") {
    //         if (this._guess[index] === "filled") {
    //             state += "5";
    //         } else if (this._guess[index] === "empty") {
    //             state += "4";
    //         } else { // Guess is Unknown
    //             state += "3";
    //         }
    //         } else { // Actual cell value is Empty
    //         if (this._guess[index] === "filled") {
    //             state += "2";
    //         } else if (this._guess[index] === "empty") {
    //             state += "1";
    //         } else { // Guess is Unknown
    //             state += "0";
    //         }
    //         }
    //     }
    //     return state;
    // },

    // Private methods
    _setupNonogram: function () {
        var nCells = this.width * this.height;

        this._actual = new Array(nCells);
        this._guess  = new Array(nCells);
        this._setUnsolved();
    },

    _indexFromXY: function (x, y) {
        return y * this.width + x;
    },

    _XYFromIndex: function (index) {
        var width = this.width;
        var y = Math.floor(index / width);
        var x = index % width;
        return [x, y];
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
        var actual = this._actual;
        var guess  = this._guess;

        for (var index = actual.length; index--; ) {
            if ((actual[index] === "filled" && guess[index] !== "filled") ||
                (actual[index] !== "filled" && guess[index] === "filled")) {
                this._setUnsolved();
                return;
            }
        }
        this._setSolved();
    }
};


/*
  __      ___
  \ \    / (_)
   \ \  / / _  _____      __
    \ \/ / | |/ _ \ \ /\ / /
     \  /  | |  __/\ V  V /
      \/   |_|\___| \_/\_/ 

*/

dfd.nonograms.View = function (model, container) {
    var $ = jQuery;

    this._model     = model;
    this._container = $(container);
    this._theme     = "classic";

    var id;
    do {
        id = "nonogram" + dfd.Srand.randomIntegerIn(0, 1000000, Math.random());
    } while ($("#" + id).length);
    this._id = id;

    // Events fired by the View
    this.events = {};

    this.events.mouseDownOnCell = new dfd.nonograms.Event(this);
    this.events.mouseUp         = new dfd.nonograms.Event(this);
    this.events.mouseEntersCell = new dfd.nonograms.Event(this);
    this.events.mouseLeavesCell = new dfd.nonograms.Event(this);
}

dfd.nonograms.View.prototype = {
    show: function () {
        this.rebuildNonogram();
    },

    setSolved: function () {
        jQuery("#" + this._id).removeClass("nonogram_playing").addClass("nonogram_solved");
    },

    setUnsolved: function () {
        jQuery("#" + this._id).removeClass("nonogram_solved").addClass("nonogram_playing");
    },

    setTheme: function (theme) {
        jQuery("#" + this._id).removeClass(this._theme).addClass(theme);
        this._theme = theme;
    },

    highlightColumn: function (col) {
        this._container.find(".nonogram_column_" + col + "_cell").addClass("nonogram_hovered_column");
        this._container.find("#" + this._idOfColumnDefinition(col)).addClass("nonogram_hovered_column");
    },

    unhighlightColumn: function (col) {
        this._container.find(".nonogram_column_" + col + "_cell").removeClass("nonogram_hovered_column");
        this._container.find("#" + this._idOfColumnDefinition(col)).removeClass("nonogram_hovered_column");
    },

    setGuessAt: function (x, y, newGuess) {
        var $ = jQuery;
        var cell = $("#" + this._idOfCell(x, y));
        var oldGuess = cell.data().guess;

        cell
            .removeClass("nonogram_correct_guess")
            .removeClass(this._guessToCSSClass(oldGuess))
            .addClass(this._guessToCSSClass(newGuess))
            .data({guess: newGuess});

        if (this._model.getCellAt(x, y) === newGuess) {
            cell.addClass("nonogram_correct_guess");
        }

        // Update row & column definitions
        $("#" + this._idOfRowDefinition(y)).html(this._rowDefinitionToHTML(this._model.getRowDefinition(y)));
        $("#" + this._idOfColumnDefinition(x)).html(this._columnDefinitionToHTML(this._model.getColumnDefinition(x)));
    },

    rebuildNonogram: function () {
        var $ = jQuery;
        var width  = this._model.width,
        height = this._model.height;
        var x, y, tr;
        var table = $("<table/>").attr("id", this._id).addClass("nonogram").addClass(this._theme);

        if (this._model.isSolved())
            table.addClass("nonogram_solved");
        else
            table.addClass("nonogram_playing");

        // Column Definitions Row
        tr = $("<tr/>").addClass("nonogram_row");

        // Top Left cell
        $("<td>").addClass("nonogram_top_left_cell").appendTo(tr);

        for (x = 0; x < width; x++) {
            if (x && x % 5 === 0) {
                $("<td/>").addClass("nonogram_separation_column").appendTo(tr);
            }

            $("<td/>")
                .attr("id", this._idOfColumnDefinition(x))
                .addClass("nonogram_definition nonogram_column_definition")
                .html(this._columnDefinitionToHTML(this._model.getColumnDefinition(x)))
                .appendTo(tr);
        }
        tr.appendTo(table);

        for (y = 0; y < height; y++) {
            // Separate groups of five rows
            if (y && y % 5 === 0) {
                $("<tr/>")
                    .addClass("nonogram_separation_row")
                    .append($("<td colspan='" + (width + width - 1) + "'/>"))
                    .appendTo(table);
            }

            // Create new row
            tr = $("<tr/>").addClass("nonogram_row");

            // Create definition for the current row
            $("<td/>")
                .attr("id", this._idOfRowDefinition(y))
                .addClass("nonogram_definition nonogram_row_definition")
                .html(this._rowDefinitionToHTML(this._model.getRowDefinition(y)))
                .appendTo(tr);

            for (x = 0; x < width; x++) {
                // Separate groups of five columns
                if (x && x % 5 === 0) {
                    $("<td/>")
                        .addClass("nonogram_separation_column")
                        .appendTo(tr);
                }

                // Build the actual nonogram cell
                $("<td/>")
                    .attr("id", this._idOfCell(x, y))
                    .addClass(this._CSSClassesForCell(x, y))
                    .data({
                        x: x,
                        y: y,
                        guess: this._model.getGuessAt(x, y)
                    })
                    .appendTo(tr);
            }
            tr.appendTo(table);
        }

        this._container
            .finish()
            .hide()
            .empty()
            .append(table)
            .show();

        // Events firing code
        var view = this;
        table.mousedown(function (e) {
            if (e.target.nodeName !== "TD") return;
            // Only take in consideration left button clicks
            if (e.which !== 1) return;

            e.preventDefault();
            var cellData = $(e.target).data();
            view.events.mouseDownOnCell.notify(cellData);
        });

        $(document).mouseup(function (e) {
            view.events.mouseUp.notify();
        });

        table.mouseover(function (e) {
            if (e.target.nodeName !== "TD") return;

            e.preventDefault();
            var cellData = $(e.target).data();
            view.events.mouseEntersCell.notify(cellData);
        });

        table.mouseout(function (e) {
            if (e.target.nodeName !== "TD") return;

            e.preventDefault();
            var cellData = $(e.target).data();
            view.events.mouseLeavesCell.notify(cellData);
        });
    },

    // Private methods
    _idOfCell: function (x, y) {
        return this._id + "_x_" + x + "_y_" + y;
    },

    _idOfRowDefinition: function (row) {
        return this._id + "_row_" + row + "_definition";
    },

    _idOfColumnDefinition: function (col) {
        return this._id + "_column_" + col + "_definition";
    },

    _rowDefinitionToHTML: function (sequences) {
        var html = "<nobr>";
        var nSeq = sequences.length;
        for (var index = 0; index < nSeq; index++) {
            if (index) html += "&nbsp;";
            html += "<span class='nonogram_sequence";
            if (sequences[index].solved) {
                html += " nonogram_solved_sequence";
            }
            html += "'>" + sequences[index].length + "</span>";
        }
        html += "</nobr>";
        return html;
    },
    
    _columnDefinitionToHTML: function (sequences) {
        var html = "";
        var nSeq = sequences.length;
        for (var index = 0; index < nSeq; index++) {
            if (index) html += "<br>";
            html += "<nobr><span class='nonogram_sequence";
            if (sequences[index].solved) {
                html += " nonogram_solved_sequence";
            }
            html += "'>" + sequences[index].length + "</span></nobr>";
        }
        return html;
    },

    _CSSClassesForCell: function (x, y) {
        var cellGuess  = this._model.getGuessAt(x, y);
        var actualCell = this._model.getCellAt(x, y);

        var classes = [];

        classes.push("nonogram_cell");
        classes.push("nonogram_column_" + x + "_cell");
        classes.push(this._guessToCSSClass(cellGuess));

        if (cellGuess === actualCell) {
            classes.push("nonogram_correct_guess");
        }

        return classes.join(" ");
    },

    _guessToCSSClass: function (guess) {
        return "nonogram_" + guess + "_cell";
    }
};


/*
    _____            _             _ _           
   / ____|          | |           | | |          
  | |     ___  _ __ | |_ _ __ ___ | | | ___ _ __ 
  | |    / _ \| '_ \| __| '__/ _ \| | |/ _ \ '__|
  | |___| (_) | | | | |_| | | (_) | | |  __/ |   
   \_____\___/|_| |_|\__|_|  \___/|_|_|\___|_|   
  
*/

dfd.nonograms.Controller = function (model, view) {
    this._dragHelper = new dfd.nonograms.dragHelper();

    this._model = model;
    this._view = view;
    var controller = this;

    // Application Logic
    model.events.nonogramChanged.attach(function () {
        view.rebuildNonogram();
    });

    model.events.guessChanged.attach(function (model, opts) {
        view.setGuessAt(opts.x, opts.y, opts.newGuess);
    });

    model.events.nonogramSolved.attach(function () {
        view.setSolved();
    });

    model.events.nonogramUnsolved.attach(function () {
        view.setUnsolved();
    });

    view.events.mouseDownOnCell.attach(function (view, cell) {
        controller._dragHelper.start(cell.x, cell.y, controller._nextGuess(model.getGuessAt(cell.x, cell.y)));
        controller._previewDragging();
    });

    view.events.mouseUp.attach(function () {
        if (!controller._dragHelper.isDragging())
            return;
        controller._dragHelper.stop();
        controller._cancelDraggingPreview();
        controller._applyDragging();
    });

    view.events.mouseEntersCell.attach(function (view, cell) {
        view.highlightColumn(cell.x);
        if (!controller._dragHelper.isDragging()) return;

        controller._cancelDraggingPreview();
        controller._dragHelper.to(cell.x, cell.y);
        controller._previewDragging();
    });

    view.events.mouseLeavesCell.attach(function (view, cell) {
        view.unhighlightColumn(cell.x);
    });
}

dfd.nonograms.Controller.prototype = {
    // Private methods

    // cycles in [unknown, filled, empty]
    _nextGuess: function (guess) {
        if (guess === "unknown") {
            return "filled";
        } else if (guess === "filled") {
            return "empty";
        }
        return "unknown";
    },

    _previewDragging: function () {
        var view = this._view;

        this._dragHelper.iterateOverDraggedCells(function (x, y, guess) {
            view.setGuessAt(x, y, guess);
        });
    },

    _applyDragging: function () {
        var model = this._model;

        this._dragHelper.iterateOverDraggedCells(function (x, y, guess) {
            model.setGuessAt(x, y, guess);
        });
    },

    _cancelDraggingPreview: function () {
        var model = this._model;
        var view  = this._view;

        this._dragHelper.iterateOverDraggedCells(function (x, y, guess) {
            view.setGuessAt(x, y, model.getGuessAt(x, y));
        });
    }
};

/*****************************************************/

dfd.nonograms.dragHelper = function () {
    this._dragging = false;
};

dfd.nonograms.dragHelper.prototype = {
    start: function (x, y, guess) {
        this._x1 = this._x2 = x;
        this._y1 = this._y2 = y;
        this._guess = guess;

        this._dragging = true;
    },

    to: function (x, y) {
        this._x2 = x;
        this._y2 = y;
    },

    stop: function () {
        this._dragging = false;
    },

    isDragging: function () {
        return this._dragging;
    },

    iterateOverDraggedCells: function (fn) {
        var x1 = this._x1;
        var y1 = this._y1;
        var x2 = this._x2;
        var y2 = this._y2;

        var fromX, toX, stepX, fromY, toY, stepY;

        if (Math.abs(x1-x2) > Math.abs(y1-y2)) {
            // Horizontal Line
            stepX = 1;
            stepY = 0;

            fromY = toY = y1;

            if (x1 < x2) {
                fromX = x1;
                toX = x2;
            } else {
                fromX = x2;
                toX = x1;
            }
        } else {
            // Vertical line
            stepX = 0;
            stepY = 1;

            fromX = toX = x1;

            if (y1 < y2) {
                fromY = y1;
                toY = y2;
            } else {
                fromY = y2;
                toY = y1;
            }
        }

        for (var x = fromX, y = fromY; x <= toX && y <= toY; x += stepX, y += stepY) {
            fn(x, y, this._guess);
        }
    }
};

/*****************************************************/
/*  The main Nonogram object                         */
/*****************************************************/

dfd.nonograms.Nonogram = function (container, opts) {
    var model, view, controller;
    var default_options = dfd.nonograms.Nonogram.options;

    opts = opts || {};
    for (var option in default_options) {
        // Default value if not specified
        opts[option] = opts[option] || default_options[option];
    }

    model = new dfd.nonograms.Model({
        width:  opts.width,
        height: opts.height,
        srand:  opts.srand,
        mode:   opts.mode
    });
    model.events.nonogramSolved.attach(opts.onSolved);

    view = new dfd.nonograms.View(model, container);
    view.setTheme(opts.theme);

    controller = new dfd.nonograms.Controller(model, view);

    this._model      = model
    this._view       = view;
    this._controller = controller;

    this._container = container;
    this._opts      = opts;
}

// Options and their default value
dfd.nonograms.Nonogram.options = {
    width:    10,
    height:   10,
    mode:     "play",
    theme:    "classic",
    srand:    dfd.Srand,
    onSolved: function () {
        alert("Congratulations! Nonogram solved!");
    }
};

dfd.nonograms.Nonogram.prototype = {
    show: function () {
        this._view.show();
    },

    randomize: function (opts) {
        var density = 0.60;
        if (opts && opts.density) {
            density = opts.density;
        }

        this._model.randomize(density);
    },

    giveHint: function () {
        this._model.giveHint();
    },

    startOver: function () {
        this._model.resetGuesses();
    },

    setTheme: function (theme) {
        this._opts.theme = theme;
        this._view.setTheme(theme);
    },

    getMode: function () {
        return this._model.getMode();
    },

    setMode: function (mode) {
        this._model.setMode(mode);
    },

    showGameState: function () {
        //alert(this._model.getGameState());
    }
};
