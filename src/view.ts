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
import { CellState, CellStateType } from './constants.js';
import { Model } from './model.js';
import { LineDefinition } from './definition-calculator.js';

interface CellData {
    x: number;
    y: number;
    guess: CellStateType | undefined;
}

interface HTMLTableCellElementWithData extends HTMLTableCellElement {
    _cellData: CellData;
}

export class View {
    readonly events: {
        mouseDownOnCell: Event<View, CellData | undefined>;
        mouseUp: Event<View, undefined>;
        mouseEntersCell: Event<View, CellData | undefined>;
        mouseLeavesCell: Event<View, CellData | undefined>;
    };

    private model: Model;
    private container: HTMLElement;
    private nonogram: HTMLTableElement | null = null;
    private theme: string = 'classic';
    private id: string;

    constructor(model: Model, container: string | HTMLElement) {
        this.model = model;
        this.container =
            typeof container === 'string' ? document.querySelector(container)! : container;

        let id: string;
        do {
            const random = Math.random();
            id = 'nonogram-' + Math.floor(random * 1000001);
        } while (document.getElementById(id));
        this.id = id;

        // Events fired by the View
        this.events = {
            mouseDownOnCell: new Event<View, CellData | undefined>(this),
            mouseUp: new Event<View, undefined>(this),
            mouseEntersCell: new Event<View, CellData | undefined>(this),
            mouseLeavesCell: new Event<View, CellData | undefined>(this),
        };
    }

    show(): void {
        this.rebuildNonogram();
    }

    setSolved(): void {
        this.nonogram!.classList.remove('nonogram_playing');
        this.nonogram!.classList.add('nonogram_solved');
    }

    setUnsolved(): void {
        this.nonogram!.classList.remove('nonogram_solved');
        this.nonogram!.classList.add('nonogram_playing');
    }

    setTheme(theme: string): void {
        if (this.nonogram) {
            this.nonogram.classList.remove(this.theme);
            this.nonogram.classList.add(theme);
        }
        this.theme = theme;
    }

    highlightColumn(col: number): void {
        const cells = this.container.querySelectorAll('.nonogram_column_' + col + '_cell');
        cells.forEach((cell) => cell.classList.add('nonogram_hovered_column'));

        const colDef = document.getElementById(this.idOfColumnDefinition(col));
        if (colDef) {
            colDef.classList.add('nonogram_hovered_column');
        }
    }

    unhighlightColumn(col: number): void {
        const cells = this.container.querySelectorAll('.nonogram_column_' + col + '_cell');
        cells.forEach((cell) => cell.classList.remove('nonogram_hovered_column'));

        const colDef = document.getElementById(this.idOfColumnDefinition(col));
        if (colDef) {
            colDef.classList.remove('nonogram_hovered_column');
        }
    }

    setGuessAt(x: number, y: number, newGuess: CellStateType): void {
        const cell = document.getElementById(this.idOfCell(x, y)) as HTMLTableCellElementWithData;
        const oldGuess = cell._cellData.guess;

        cell.classList.remove('nonogram_correct_guess');
        cell.classList.remove(this.guessToCSSClass(oldGuess));
        cell.classList.add(this.guessToCSSClass(newGuess));
        cell._cellData.guess = newGuess;

        if (this.model.getCellAt(x, y) === newGuess) {
            cell.classList.add('nonogram_correct_guess');
        }

        // Update row & column definitions
        const rowDef = document.getElementById(this.idOfRowDefinition(y))!;
        rowDef.innerHTML = this.rowDefinitionToHTML(this.model.getRowDefinition(y));

        const colDef = document.getElementById(this.idOfColumnDefinition(x))!;
        colDef.innerHTML = this.columnDefinitionToHTML(this.model.getColumnDefinition(x));
    }

    rebuildNonogram(): void {
        const width = this.model.width;
        const height = this.model.height;
        let x: number, y: number, tr: HTMLTableRowElement;

        const table = (this.nonogram = document.createElement('table'));
        table.id = this.id;
        table.classList.add('nonogram', this.theme);

        if (this.model.isSolved()) {
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
            colDef.id = this.idOfColumnDefinition(x);
            colDef.classList.add('nonogram_definition', 'nonogram_column_definition');
            colDef.innerHTML = this.columnDefinitionToHTML(this.model.getColumnDefinition(x));
            tr.appendChild(colDef);
        }
        table.appendChild(tr);

        for (y = 0; y < height; y++) {
            // Separate groups of five rows
            if (y && y % 5 === 0) {
                const sepRow = document.createElement('tr');
                sepRow.classList.add('nonogram_separation_row');
                const sepCell = document.createElement('td');
                sepCell.setAttribute('colspan', (width + width - 1).toString());
                sepRow.appendChild(sepCell);
                table.appendChild(sepRow);
            }

            // Create new row
            tr = document.createElement('tr');
            tr.classList.add('nonogram_row');

            // Create definition for the current row
            const rowDef = document.createElement('td');
            rowDef.id = this.idOfRowDefinition(y);
            rowDef.classList.add('nonogram_definition', 'nonogram_row_definition');
            rowDef.innerHTML = this.rowDefinitionToHTML(this.model.getRowDefinition(y));
            tr.appendChild(rowDef);

            for (x = 0; x < width; x++) {
                // Separate groups of five columns
                if (x && x % 5 === 0) {
                    const sepCol = document.createElement('td');
                    sepCol.classList.add('nonogram_separation_column');
                    tr.appendChild(sepCol);
                }

                // Build the actual nonogram cell
                const cell = document.createElement('td') as HTMLTableCellElementWithData;
                cell.id = this.idOfCell(x, y);
                cell.className = this.cssClassesForCell(x, y);
                cell._cellData = {
                    x: x,
                    y: y,
                    guess: this.model.getGuessAt(x, y),
                };
                tr.appendChild(cell);
            }
            table.appendChild(tr);
        }

        this.setupEventHandlers(table);

        this.container.style.display = 'none';
        this.container.innerHTML = '';
        this.container.appendChild(table);
        this.container.style.display = '';
    }

    // Private methods
    private setupEventHandlers(target: HTMLTableElement): void {
        target.addEventListener('mousedown', (e: MouseEvent) => {
            if ((e.target as HTMLElement).tagName !== 'TD') return;

            // Only take in consideration left button clicks
            if (e.which !== 1 && e.button !== 0) return;

            e.preventDefault();

            const cellData = (e.target as HTMLTableCellElementWithData)._cellData;
            this.events.mouseDownOnCell.notify(cellData);
        });

        const mouseup_handler = () => {
            // Has the nonogram been removed from the DOM?
            if (!document.contains(target)) {
                // If it has been removed, unbind this event handler
                // from document to avoid memory leaks (the references
                // to `this` and `target` make it impossible for the
                // garbage collector to free them).
                document.removeEventListener('mouseup', mouseup_handler);
            } else {
                this.events.mouseUp.notify(undefined);
            }
        };
        document.addEventListener('mouseup', mouseup_handler);

        target.addEventListener('mouseover', (e: MouseEvent) => {
            if ((e.target as HTMLElement).tagName !== 'TD') return;

            e.preventDefault();

            const cellData = (e.target as HTMLTableCellElementWithData)._cellData;
            this.events.mouseEntersCell.notify(cellData);
        });

        target.addEventListener('mouseout', (e: MouseEvent) => {
            if ((e.target as HTMLElement).tagName !== 'TD') return;

            e.preventDefault();

            const cellData = (e.target as HTMLTableCellElementWithData)._cellData;
            this.events.mouseLeavesCell.notify(cellData);
        });
    }

    private idOfCell(x: number, y: number): string {
        return this.id + '_x_' + x + '_y_' + y;
    }

    private idOfRowDefinition(row: number): string {
        return this.id + '_row_' + row + '_definition';
    }

    private idOfColumnDefinition(col: number): string {
        return this.id + '_column_' + col + '_definition';
    }

    private rowDefinitionToHTML(sequences: LineDefinition[]): string {
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

    private columnDefinitionToHTML(sequences: LineDefinition[]): string {
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

    private cssClassesForCell(x: number, y: number): string {
        const cellGuess = this.model.getGuessAt(x, y);
        const actualCell = this.model.getCellAt(x, y);

        const classes: string[] = [];

        classes.push('nonogram_cell');
        classes.push('nonogram_column_' + x + '_cell');
        classes.push(this.guessToCSSClass(cellGuess));

        if (cellGuess === actualCell) {
            classes.push('nonogram_correct_guess');
        }

        return classes.join(' ');
    }

    private guessToCSSClass(guess: CellStateType | undefined): string {
        // Handle both constant values and legacy string values
        let guessValue = guess;
        if (
            guess === CellState.UNKNOWN ||
            guess === CellState.FILLED ||
            guess === CellState.EMPTY
        ) {
            guessValue = guess;
        }
        return 'nonogram_' + guessValue + '_cell';
    }
}
