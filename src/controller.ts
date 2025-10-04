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
    private dragHelper: DragHelper;
    private model: Model;
    private view: View;

    constructor(model: Model, view: View) {
        this.dragHelper = new DragHelper();

        this.model = model;
        this.view = view;

        // Application Logic
        model.events.nonogramChanged.attach(() => {
            view.rebuildNonogram();
        });

        model.events.guessChanged.attach((_model, opts) => {
            view.setGuessAt(opts.x, opts.y, opts.newGuess);
        });

        model.events.nonogramSolved.attach(() => {
            view.setSolved();
        });

        model.events.nonogramUnsolved.attach(() => {
            view.setUnsolved();
        });

        view.events.mouseDownOnCell.attach((_view, cell) => {
            if (!cell) return;
            this.dragHelper.start(cell.x, cell.y, this.nextGuess(model.getGuessAt(cell.x, cell.y)));
            this.previewDragging();
        });

        view.events.mouseUp.attach(() => {
            if (!this.dragHelper.isDragging()) return;
            this.dragHelper.stop();
            this.cancelDraggingPreview();
            this.applyDragging();
        });

        view.events.mouseEntersCell.attach((_view, cell) => {
            if (!cell) return;
            view.highlightColumn(cell.x);
            if (!this.dragHelper.isDragging()) return;

            this.cancelDraggingPreview();
            this.dragHelper.to(cell.x, cell.y);
            this.previewDragging();
        });

        view.events.mouseLeavesCell.attach((_view, cell) => {
            if (!cell) return;
            view.unhighlightColumn(cell.x);
        });
    }

    // Private methods

    // cycles in [unknown, filled, empty]
    private nextGuess(guess: CellStateType | undefined): CellStateType {
        if (guess === CellState.UNKNOWN) {
            return CellState.FILLED;
        } else if (guess === CellState.FILLED) {
            return CellState.EMPTY;
        }
        return CellState.UNKNOWN;
    }

    private previewDragging(): void {
        const view = this.view;

        this.dragHelper.iterateOverDraggedCells((x, y, guess) => {
            view.setGuessAt(x, y, guess);
        });
    }

    private applyDragging(): void {
        const model = this.model;

        this.dragHelper.iterateOverDraggedCells((x, y, guess) => {
            model.setGuessAt(x, y, guess);
        });
    }

    private cancelDraggingPreview(): void {
        const model = this.model;
        const view = this.view;

        this.dragHelper.iterateOverDraggedCells((x, y, _guess) => {
            view.setGuessAt(x, y, model.getGuessAt(x, y)!);
        });
    }
}
