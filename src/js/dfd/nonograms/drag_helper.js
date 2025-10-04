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

export class DragHelper {
    constructor() {
        this._dragging = false;
    }

    start(x, y, guess) {
        this._x1 = this._x2 = x;
        this._y1 = this._y2 = y;
        this._guess = guess;

        this._dragging = true;
    }

    to(x, y) {
        this._x2 = x;
        this._y2 = y;
    }

    stop() {
        this._dragging = false;
    }

    isDragging() {
        return this._dragging;
    }

    iterateOverDraggedCells(fn) {
        const x1 = this._x1;
        const y1 = this._y1;
        const x2 = this._x2;
        const y2 = this._y2;

        let fromX, toX, stepX, fromY, toY, stepY;

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

        for (let x = fromX, y = fromY; x <= toX && y <= toY; x += stepX, y += stepY) {
            fn(x, y, this._guess);
        }
    }
}
