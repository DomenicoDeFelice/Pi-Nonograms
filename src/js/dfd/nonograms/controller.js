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

dfd.nonograms.Controller = function (model, view) {
    this._dragHelper = new dfd.nonograms.DragHelper();

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
        var CellState = dfd.nonograms.CellState;
        if (guess === CellState.UNKNOWN) {
            return CellState.FILLED;
        } else if (guess === CellState.FILLED) {
            return CellState.EMPTY;
        }
        return CellState.UNKNOWN;
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

}(window);
