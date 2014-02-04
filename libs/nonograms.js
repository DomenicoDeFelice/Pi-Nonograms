/*
  A Nonogram game written in Javascript
  Copyright (C) 2013 Domenico De Felice
  http://domenicodefelice.blogspot.com
  Try the game on:
  http://freenonograms.altervista.org

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

/*
  Thanks to Alex Netkachov for his article:
  http://www.alexatnet.com/articles/model-view-controller-mvc-javascript
*/


if (!window.koala) {
    window.koala = {};
}

koala.nonograms = {};


/*

  The game uses the MVC pattern.

*/

/*
  __  __           _      _ 
 |  \/  |         | |    | |
 | \  / | ___   __| | ___| |
 | |\/| |/ _ \ / _` |/ _ \ |
 | |  | | (_) | (_| |  __/ |
 |_|  |_|\___/ \__,_|\___|_|
                            
*/

koala.nonograms.Model = function (opts) {
    if (!opts) opts = {};
    this._opts  = opts;

    this.width  = opts.width  = (opts.width  ? Number(opts.width) : 10);
    this.height = opts.height = (opts.height ? Number(opts.height) : 10);

    // Events fired by the model
    this.events = {};

    // The ussr guessed the content of a cell
    this.events.guessChanged     = new koala.utils.Event(this);

    // The nonogram has been changed
    this.events.nonogramChanged  = new koala.utils.Event(this);

    // The user solved the nonogram
    this.events.nonogramSolved   = new koala.utils.Event(this);

    // The nonogram was solved but now it isn't
    this.events.nonogramUnsolved = new koala.utils.Event(this);
};


koala.nonograms.Model.prototype = {
    getCellAt: function (x, y) {
	var index = this._indexFromXY(x, y);
	var cell = this._actual[index];

	return (cell === undefined) ? "empty" : cell;
    },

    getGuessAt: function (x, y) {
	var index = this._indexFromXY(x, y);
	var guess = this._guess[index];

	return (guess === undefined) ? "unknown" : guess;
    },

    setGuessAt: function (x, y, guess) {
	var oldGuess = this.getGuessAt(x, y);
	var index = this._indexFromXY(x, y);
	this._guess[index] = guess;

	this.events.guessChanged.notify({
	    x: x,
	    y: y,
	    oldGuess: oldGuess,
	    newGuess: guess
	});

	var was_solved = this.isSolved();
	this._checkIfSolved();
	var is_solved = this.isSolved();

	if (was_solved && !is_solved) {
	    this.events.nonogramUnsolved.notify();
	} else if (!was_solved && is_solved) {
	    this.events.nonogramSolved.notify();
	}
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
		
	for (var x = 0; x < this.width; x++) {
	    if (this.getCellAt(x, row) === "filled") {
		if (sequenceLength === 0) sequenceBegin = x;
		sequenceLength++;
	    } else if (sequenceLength) {
		sequenceEnd = x-1;

		sequenceSolved = false;
		if ((sequenceBegin === 0 || this.getGuessAt(sequenceBegin-1, row) === "empty")
		    && (sequenceEnd === this.width-1 || this.getGuessAt(sequenceEnd+1, row) === "empty")) {

		    sequenceSolved = true;
		    for (var index = sequenceBegin; index <= sequenceEnd; index++) {
			if (this.getGuessAt(index, row) != "filled") {
			    sequenceSolved = false;
			    break;
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
	    if ((sequenceBegin === 0 || this.getGuessAt(sequenceBegin-1, row) === "empty")
		&& (sequenceEnd === this.width-1 || this.getGuessAt(sequence_end+1, row) === "empty")) {

		sequenceSolved = true;
		for (var index = sequenceBegin; index <= sequenceEnd; index++) {
		    if (this.getGuessAt(index, row) != "filled") {
			sequenceSolved = false;
			break;
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

	for (var y = 0; y < this.height; y++) {
	    if (this.getCellAt(col, y) === "filled") {
		if (sequenceLength === 0) sequenceBegin = y;
		sequenceLength++;
	    } else if (sequenceLength) {
		sequenceEnd = y-1;

		sequenceSolved = false;
		if ((sequenceBegin === 0 || this.getGuessAt(col, sequenceBegin-1) === "empty")
		    && (sequenceEnd === this.height-1 || this.getGuessAt(col, sequenceEnd+1) === "empty")) {

		    sequenceSolved = true;
		    for (var index = sequenceBegin; index <= sequenceEnd; index++) {
			if (this.getGuessAt(col, index) != "filled") {
			    sequenceSolved = false;
			    break;
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
	    if ((sequenceBegin === 0 || this.getGuessAt(col, sequenceBegin-1) === "empty")
		&& (sequenceEnd === this.height-1 || this.getGuessAt(col, sequenceEnd+1) === "empty")) {

		sequenceSolved = true;
		for (var index = sequenceBegin; index <= sequenceEnd; index++) {
		    if (this.getGuessAt(col, index) != "filled") {
			sequenceSolved = false;
			break;
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

    randomize: function (density) {
	this._setupNonogram();

	var ncells = this.width * this.height;
	var to_be_filled = Math.floor(ncells * density);
	if (to_be_filled > ncells) to_be_filled = ncells;

	var index;
	while (to_be_filled) {
	    index = this._getRandomIndex();
	    if (this._actual[index] === undefined) {
		this._actual[index] = "filled";
		to_be_filled--;
	    }
	}

	this.events.nonogramChanged.notify();
    },

    // Private methods
    _setupNonogram: function () {
	var ncells = this.width * this.height;

	this._actual = new Array(ncells);
	this._guess  = new Array(ncells);
	this._solved = false;
    },

    _indexFromXY: function (x, y) {
	return y * this.width + x;
    },

    _getRandomIndex: function () {
	var ncells = this.width * this.height;
	return koala.utils.randomIntegerInRange(0, ncells - 1);
    },

    _checkIfSolved: function () {
	for (var index = 0, ncells = this._actual.length; index < ncells; index++) {
	    if ((this._actual[index] === "filled" && this._guess[index] != "filled") ||
		(this._actual[index] != "filled" && this._guess[index] == "filled")) {
		this._solved = false;
		return;
	    }
	}
	this._solved = true;
    },
};






/*
 __      ___               
 \ \    / (_)              
  \ \  / / _  _____      __
   \ \/ / | |/ _ \ \ /\ / /
    \  /  | |  __/\ V  V / 
     \/   |_|\___| \_/\_/  
                           
 */

koala.nonograms.View = function (model, container) {
    this._model = model;
    this._container = $(container);
    this._id = "nonogram" + koala.utils.randomIntegerInRange(0, 1000000);
    this._theme = "default";

    // Events fired by the View
    this.events = {};

    this.events.mouseDownOnCell = new koala.utils.Event(this);
    this.events.mouseUp         = new koala.utils.Event(this);
    this.events.mouseEntersCell = new koala.utils.Event(this);
    this.events.mouseLeavesCell = new koala.utils.Event(this);
}

koala.nonograms.View.prototype = {
    show: function () {
	this.rebuildNonogram();
    },

    setSolved: function () {
	$("#" + this._id).removeClass("nonogram_playing").addClass("nonogram_solved");
    },

    setUnsolved: function () {
	$("#" + this._id).removeClass("nonogram_solved").addClass("nonogram_playing");
    },

    setTheme: function (theme) {
	$("#" + this._id).removeClass(this._theme).addClass(theme);
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
	    if (y && y % 5 == 0) {
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
	    .hide()
	    .empty()
	    .append(table)
	    .fadeIn(500);

	// Events firing code
	var view = this;
	table.mousedown(function (e) {
	    if (e.target.nodeName != "TD") return;
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
	    if (e.target.nodeName != "TD") return;

	    e.preventDefault();
	    var cellData = $(e.target).data();
	    view.events.mouseEntersCell.notify(cellData);
	});

	table.mouseout(function (e) {
	    if (e.target.nodeName != "TD") return;

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
	for (var index = 0; index < sequences.length; index++) {
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
	for (var index = 0; index < sequences.length; index++) {
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

koala.nonograms.Controller = function (model, view) {
    this._dragHelper = new koala.nonograms.dragHelper();

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

koala.nonograms.Controller.prototype = {
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

koala.nonograms.dragHelper = function () {
    this._dragging = false;
};

koala.nonograms.dragHelper.prototype = {
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

koala.nonograms.Nonogram = function (container, opts) {
    this._container = container;
    opts = opts || {};

    this._opts = {
	width:  opts.width  || 10,
	height: opts.height || 10,
	theme:  opts.theme  || "default"
    };

    this._model = new koala.nonograms.Model({
	width:  this._opts.width,
	height: this._opts.height
    });
    this._view = new koala.nonograms.View(this._model, this._container);
    this._view.setTheme(this._opts.theme);
    this._controller = new koala.nonograms.Controller(this._model, this._view);
}

koala.nonograms.Nonogram.prototype = {
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

    setTheme: function (theme) {
	this._opts.theme = theme;
	this._view.setTheme(theme);
    }
};
