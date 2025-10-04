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

import { Event } from './event.js';
import { CellState } from './constants.js';

export class View {
    constructor(model, container) {
        this._model      = model;
        this._container  = typeof container === 'string' ? document.querySelector(container) : container;
        this._nonogram   = null;
        this._theme      = 'classic';

        let id;
        do {
            const random = Math.random();
            id = 'nonogram-' + Math.floor(random * 1000001);
        } while (document.getElementById(id));
        this._id = id;

        // Events fired by the View
        this.events = {};

        this.events.mouseDownOnCell = new Event(this);
        this.events.mouseUp         = new Event(this);
        this.events.mouseEntersCell = new Event(this);
        this.events.mouseLeavesCell = new Event(this);
    }

    show() {
        this.rebuildNonogram();
    }

    setSolved() {
        this._nonogram.classList.remove('nonogram_playing');
        this._nonogram.classList.add('nonogram_solved');
    }

    setUnsolved() {
        this._nonogram.classList.remove('nonogram_solved');
        this._nonogram.classList.add('nonogram_playing');
    }

    setTheme(theme) {
        if (this._nonogram) {
            this._nonogram.classList.remove(this._theme);
            this._nonogram.classList.add(theme);
        }
        this._theme = theme;
    }

    highlightColumn(col) {
        const cells = this._container.querySelectorAll('.nonogram_column_' + col + '_cell');
        cells.forEach(cell => cell.classList.add('nonogram_hovered_column'));

        const colDef = document.getElementById(this._idOfColumnDefinition(col));
        if (colDef) {
            colDef.classList.add('nonogram_hovered_column');
        }
    }

    unhighlightColumn(col) {
        const cells = this._container.querySelectorAll('.nonogram_column_' + col + '_cell');
        cells.forEach(cell => cell.classList.remove('nonogram_hovered_column'));

        const colDef = document.getElementById(this._idOfColumnDefinition(col));
        if (colDef) {
            colDef.classList.remove('nonogram_hovered_column');
        }
    }

    setGuessAt(x, y, newGuess) {
        const cell = document.getElementById(this._idOfCell(x, y));
        const oldGuess = cell._cellData.guess;

        cell.classList.remove('nonogram_correct_guess');
        cell.classList.remove(this._guessToCSSClass(oldGuess));
        cell.classList.add(this._guessToCSSClass(newGuess));
        cell._cellData.guess = newGuess;

        if (this._model.getCellAt(x, y) === newGuess) {
            cell.classList.add('nonogram_correct_guess');
        }

        // Update row & column definitions
        const rowDef = document.getElementById(this._idOfRowDefinition(y));
        rowDef.innerHTML = this._rowDefinitionToHTML(this._model.getRowDefinition(y));

        const colDef = document.getElementById(this._idOfColumnDefinition(x));
        colDef.innerHTML = this._columnDefinitionToHTML(this._model.getColumnDefinition(x));
    }

    rebuildNonogram() {
        const width  = this._model.width;
        const height = this._model.height;
        let x, y, tr;

        const table = this._nonogram = document.createElement('table');
        table.id = this._id;
        table.classList.add('nonogram', this._theme);

        if (this._model.isSolved()) {
            table.classList.add('nonogram_solved');
        } else {
            table.classList.add('nonogram_playing');
        }

        // Column Definitions Row
        tr = document.createElement('tr');
        tr.classList.add('nonogram_row');

        // Top Left cell
        const topLeftCell = document.createElement('td');
        topLeftCell.classList.add('nonogram_top_left_cell');
        tr.appendChild(topLeftCell);

        for (x = 0; x < width; x++) {
            if (x && x % 5 === 0) {
                const sepCol = document.createElement('td');
                sepCol.classList.add('nonogram_separation_column');
                tr.appendChild(sepCol);
            }

            const colDef = document.createElement('td');
            colDef.id = this._idOfColumnDefinition(x);
            colDef.classList.add('nonogram_definition', 'nonogram_column_definition');
            colDef.innerHTML = this._columnDefinitionToHTML(this._model.getColumnDefinition(x));
            tr.appendChild(colDef);
        }
        table.appendChild(tr);

        for (y = 0; y < height; y++) {
            // Separate groups of five rows
            if (y && y % 5 === 0) {
                const sepRow = document.createElement('tr');
                sepRow.classList.add('nonogram_separation_row');
                const sepCell = document.createElement('td');
                sepCell.setAttribute('colspan', width + width - 1);
                sepRow.appendChild(sepCell);
                table.appendChild(sepRow);
            }

            // Create new row
            tr = document.createElement('tr');
            tr.classList.add('nonogram_row');

            // Create definition for the current row
            const rowDef = document.createElement('td');
            rowDef.id = this._idOfRowDefinition(y);
            rowDef.classList.add('nonogram_definition', 'nonogram_row_definition');
            rowDef.innerHTML = this._rowDefinitionToHTML(this._model.getRowDefinition(y));
            tr.appendChild(rowDef);

            for (x = 0; x < width; x++) {
                // Separate groups of five columns
                if (x && x % 5 === 0) {
                    const sepCol = document.createElement('td');
                    sepCol.classList.add('nonogram_separation_column');
                    tr.appendChild(sepCol);
                }

                // Build the actual nonogram cell
                const cell = document.createElement('td');
                cell.id = this._idOfCell(x, y);
                cell.className = this._CSSClassesForCell(x, y);
                cell._cellData = {
                    x: x,
                    y: y,
                    guess: this._model.getGuessAt(x, y)
                };
                tr.appendChild(cell);
            }
            table.appendChild(tr);
        }

        this._setupEventHandlers(table);

        this._container.style.display = 'none';
        this._container.innerHTML = '';
        this._container.appendChild(table);
        this._container.style.display = '';
    }

    // Private methods
    _setupEventHandlers(target) {
        const view = this;

        target.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'TD') return;

            // Only take in consideration left button clicks
            if (e.which !== 1 && e.button !== 0) return;

            e.preventDefault();

            const cellData = e.target._cellData;
            view.events.mouseDownOnCell.notify(cellData);
        });

        const mouseup_handler = () => {
            // Has the nonogram been removed from the DOM?
            if (!document.contains(target)) {
                // If it has been removed, unbind this event handler
                // from document to avoid memory leaks (the references
                // to `view` and `target` make it impossible for the
                // garbage collector to free them).
                document.removeEventListener('mouseup', mouseup_handler);
            } else {
                view.events.mouseUp.notify();
            }
        };
        document.addEventListener('mouseup', mouseup_handler);

        target.addEventListener('mouseover', (e) => {
            if (e.target.tagName !== 'TD') return;

            e.preventDefault();

            const cellData = e.target._cellData;
            view.events.mouseEntersCell.notify(cellData);
        });

        target.addEventListener('mouseout', (e) => {
            if (e.target.tagName !== 'TD') return;

            e.preventDefault();

            const cellData = e.target._cellData;
            view.events.mouseLeavesCell.notify(cellData);
        });
    }

    _idOfCell(x, y) {
        return this._id + '_x_' + x + '_y_' + y;
    }

    _idOfRowDefinition(row) {
        return this._id + '_row_' + row + '_definition';
    }

    _idOfColumnDefinition(col) {
        return this._id + '_column_' + col + '_definition';
    }

    _rowDefinitionToHTML(sequences) {
        let html = '<nobr>';
        const nSeq = sequences.length;
        for (let index = 0; index < nSeq; index++) {
            if (index) html += '&nbsp;';
            html += '<span class="nonogram_sequence';
            if (sequences[index].solved) {
                html += ' nonogram_solved_sequence';
            }
            html += '">' + sequences[index].length + '</span>';
        }
        html += '</nobr>';
        return html;
    }

    _columnDefinitionToHTML(sequences) {
        let html = '';
        const nSeq = sequences.length;
        for (let index = 0; index < nSeq; index++) {
            if (index) html += '<br>';
            html += '<nobr><span class="nonogram_sequence';
            if (sequences[index].solved) {
                html += ' nonogram_solved_sequence';
            }
            html += '">' + sequences[index].length + '</span></nobr>';
        }
        return html;
    }

    _CSSClassesForCell(x, y) {
        const cellGuess  = this._model.getGuessAt(x, y);
        const actualCell = this._model.getCellAt(x, y);

        const classes = [];

        classes.push('nonogram_cell');
        classes.push('nonogram_column_' + x + '_cell');
        classes.push(this._guessToCSSClass(cellGuess));

        if (cellGuess === actualCell) {
            classes.push('nonogram_correct_guess');
        }

        return classes.join(' ');
    }

    _guessToCSSClass(guess) {
        // Handle both constant values and legacy string values
        let guessValue = guess;
        if (guess === CellState.UNKNOWN || guess === CellState.FILLED || guess === CellState.EMPTY) {
            guessValue = guess;
        }
        return 'nonogram_' + guessValue + '_cell';
    }
}
