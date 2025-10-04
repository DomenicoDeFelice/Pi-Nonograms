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

import { CellState, CellStateType } from './constants.js';
import { DragHelper } from './drag-helper.js';
import { Model } from './model.js';
import { View } from './view.js';

export class Controller {
    private _dragHelper: DragHelper;
    private _model: Model;
    private _view: View;

    constructor(model: Model, view: View) {
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
            if (!cell) return;
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
            if (!cell) return;
            view.highlightColumn(cell.x);
            if (!controller._dragHelper.isDragging()) return;

            controller._cancelDraggingPreview();
            controller._dragHelper.to(cell.x, cell.y);
            controller._previewDragging();
        });

        view.events.mouseLeavesCell.attach((view, cell) => {
            if (!cell) return;
            view.unhighlightColumn(cell.x);
        });
    }

    // Private methods

    // cycles in [unknown, filled, empty]
    private _nextGuess(guess: CellStateType | undefined): CellStateType {
        if (guess === CellState.UNKNOWN) {
            return CellState.FILLED;
        } else if (guess === CellState.FILLED) {
            return CellState.EMPTY;
        }
        return CellState.UNKNOWN;
    }

    private _previewDragging(): void {
        const view = this._view;

        this._dragHelper.iterateOverDraggedCells((x, y, guess) => {
            view.setGuessAt(x, y, guess);
        });
    }

    private _applyDragging(): void {
        const model = this._model;

        this._dragHelper.iterateOverDraggedCells((x, y, guess) => {
            model.setGuessAt(x, y, guess);
        });
    }

    private _cancelDraggingPreview(): void {
        const model = this._model;
        const view  = this._view;

        this._dragHelper.iterateOverDraggedCells((x, y, guess) => {
            view.setGuessAt(x, y, model.getGuessAt(x, y)!);
        });
    }
}
