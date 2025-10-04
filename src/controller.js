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

import { CellState } from './constants.js';
import { DragHelper } from './drag-helper.js';

export class Controller {
    constructor(model, view) {
        this._dragHelper = new DragHelper();

        this._model = model;
        this._view = view;
        const controller = this;

        // Application Logic
        model.events.nonogramChanged.attach(() => {
            view.rebuildNonogram();
        });

        model.events.guessChanged.attach((model, opts) => {
            view.setGuessAt(opts.x, opts.y, opts.newGuess);
        });

        model.events.nonogramSolved.attach(() => {
            view.setSolved();
        });

        model.events.nonogramUnsolved.attach(() => {
            view.setUnsolved();
        });

        view.events.mouseDownOnCell.attach((view, cell) => {
            controller._dragHelper.start(cell.x, cell.y, controller._nextGuess(model.getGuessAt(cell.x, cell.y)));
            controller._previewDragging();
        });

        view.events.mouseUp.attach(() => {
            if (!controller._dragHelper.isDragging())
                return;
            controller._dragHelper.stop();
            controller._cancelDraggingPreview();
            controller._applyDragging();
        });

        view.events.mouseEntersCell.attach((view, cell) => {
            view.highlightColumn(cell.x);
            if (!controller._dragHelper.isDragging()) return;

            controller._cancelDraggingPreview();
            controller._dragHelper.to(cell.x, cell.y);
            controller._previewDragging();
        });

        view.events.mouseLeavesCell.attach((view, cell) => {
            view.unhighlightColumn(cell.x);
        });
    }

    // Private methods

    // cycles in [unknown, filled, empty]
    _nextGuess(guess) {
        if (guess === CellState.UNKNOWN) {
            return CellState.FILLED;
        } else if (guess === CellState.FILLED) {
            return CellState.EMPTY;
        }
        return CellState.UNKNOWN;
    }

    _previewDragging() {
        const view = this._view;

        this._dragHelper.iterateOverDraggedCells((x, y, guess) => {
            view.setGuessAt(x, y, guess);
        });
    }

    _applyDragging() {
        const model = this._model;

        this._dragHelper.iterateOverDraggedCells((x, y, guess) => {
            model.setGuessAt(x, y, guess);
        });
    }

    _cancelDraggingPreview() {
        const model = this._model;
        const view  = this._view;

        this._dragHelper.iterateOverDraggedCells((x, y, guess) => {
            view.setGuessAt(x, y, model.getGuessAt(x, y));
        });
    }
}
