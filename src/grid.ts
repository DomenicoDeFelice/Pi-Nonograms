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

export class Grid<T> {
    readonly width: number;
    readonly height: number;
    private defaultValue: T | undefined;
    private data: (T | undefined)[];

    constructor(width: number, height: number, defaultValue?: T) {
        this.width = width;
        this.height = height;
        this.defaultValue = defaultValue; // Value to return for unset cells
        this.data = new Array(width * height);
    }

    // Get cell value at coordinates or index
    get(x: number, y?: number): T | undefined {
        let index: number;
        if (y === undefined) {
            index = x; // Called with index only
        } else {
            index = this.indexFromXY(x, y);
        }
        const value = this.data[index];
        // Return default value for unset cells
        return (value === undefined) ? this.defaultValue : value;
    }

    // Set cell value at coordinates or index
    set(x: number, y: number | T, value?: T): void {
        let index: number;
        if (arguments.length === 2) {
            // Called with (index, value)
            index = x;
            value = y as T;
        } else {
            // Called with (x, y, value)
            index = this.indexFromXY(x, y as number);
        }
        this.data[index] = value;
    }

    // Get entire row as array
    getRow(row: number): (T | undefined)[] {
        const result: (T | undefined)[] = [];
        for (let x = 0; x < this.width; x++) {
            result.push(this.get(x, row));
        }
        return result;
    }

    // Get entire column as array
    getColumn(col: number): (T | undefined)[] {
        const result: (T | undefined)[] = [];
        for (let y = 0; y < this.height; y++) {
            result.push(this.get(col, y));
        }
        return result;
    }

    // Iterate over all cells
    forEach(callback: (x: number, y: number, value: T | undefined, index: number) => void): void {
        for (let index = 0; index < this.data.length; index++) {
            const xy = this.xyFromIndex(index);
            let value = this.data[index];
            // Return default value for unset cells, just like get()
            if (value === undefined) value = this.defaultValue;
            callback(xy[0], xy[1], value, index);
        }
    }

    // Get total number of cells
    size(): number {
        return this.width * this.height;
    }

    // Clear all cells (set to undefined)
    clear(): void {
        this.data = new Array(this.width * this.height);
    }

    // Clone the grid
    clone(): Grid<T> {
        const cloned = new Grid<T>(this.width, this.height);
        for (let i = 0; i < this.data.length; i++) {
            cloned.data[i] = this.data[i];
        }
        return cloned;
    }

    // Coordinate conversion helpers
    private indexFromXY(x: number, y: number): number {
        return y * this.width + x;
    }

    private xyFromIndex(index: number): [number, number] {
        const y = Math.floor(index / this.width);
        const x = index % this.width;
        return [x, y];
    }
}
