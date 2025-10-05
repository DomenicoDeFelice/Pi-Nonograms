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

import { describe, it, expect } from 'vitest';
import { Grid } from '../grid.js';

describe('Grid', () => {
    describe('constructor', () => {
        it('should create a grid with specified dimensions', () => {
            const grid = new Grid(5, 3);
            expect(grid.width).toBe(5);
            expect(grid.height).toBe(3);
            expect(grid.size()).toBe(15);
        });

        it('should initialize with default value when provided', () => {
            const grid = new Grid(2, 2, 'default');
            expect(grid.get(0, 0)).toBe('default');
            expect(grid.get(1, 1)).toBe('default');
        });

        it('should initialize with undefined when no default value provided', () => {
            const grid = new Grid<string>(2, 2);
            expect(grid.get(0, 0)).toBeUndefined();
            expect(grid.get(1, 1)).toBeUndefined();
        });
    });

    describe('get and set', () => {
        it('should set and get value using coordinates', () => {
            const grid = new Grid<string>(3, 3);
            grid.set(1, 2, 'value');
            expect(grid.get(1, 2)).toBe('value');
        });

        it('should set and get value using index', () => {
            const grid = new Grid<string>(3, 3);
            grid.set(5, 'indexed');
            expect(grid.get(5)).toBe('indexed');
        });

        it('should return default value for unset cells', () => {
            const grid = new Grid(3, 3, 'default');
            grid.set(0, 0, 'custom');
            expect(grid.get(0, 0)).toBe('custom');
            expect(grid.get(1, 1)).toBe('default');
        });

        it('should handle all cells in a 10x10 grid', () => {
            const grid = new Grid<number>(10, 10);
            for (let y = 0; y < 10; y++) {
                for (let x = 0; x < 10; x++) {
                    grid.set(x, y, y * 10 + x);
                }
            }
            expect(grid.get(0, 0)).toBe(0);
            expect(grid.get(9, 9)).toBe(99);
            expect(grid.get(5, 7)).toBe(75);
        });
    });

    describe('getRow', () => {
        it('should return all values in a row', () => {
            const grid = new Grid<string>(3, 3);
            grid.set(0, 1, 'a');
            grid.set(1, 1, 'b');
            grid.set(2, 1, 'c');

            const row = grid.getRow(1);
            expect(row).toEqual(['a', 'b', 'c']);
        });

        it('should return default values for unset cells in row', () => {
            const grid = new Grid(3, 2, 0);
            grid.set(1, 0, 5);

            const row = grid.getRow(0);
            expect(row).toEqual([0, 5, 0]);
        });
    });

    describe('getColumn', () => {
        it('should return all values in a column', () => {
            const grid = new Grid<string>(3, 3);
            grid.set(1, 0, 'x');
            grid.set(1, 1, 'y');
            grid.set(1, 2, 'z');

            const col = grid.getColumn(1);
            expect(col).toEqual(['x', 'y', 'z']);
        });

        it('should return default values for unset cells in column', () => {
            const grid = new Grid(2, 3, 0);
            grid.set(0, 1, 7);

            const col = grid.getColumn(0);
            expect(col).toEqual([0, 7, 0]);
        });
    });

    describe('forEach', () => {
        it('should iterate over all cells', () => {
            const grid = new Grid<number>(2, 2);
            grid.set(0, 0, 1);
            grid.set(1, 0, 2);
            grid.set(0, 1, 3);
            grid.set(1, 1, 4);

            const visited: number[] = [];
            grid.forEach((x, y, value) => {
                visited.push(value!);
            });

            expect(visited).toEqual([1, 2, 3, 4]);
        });

        it('should provide correct coordinates and index', () => {
            const grid = new Grid<string>(3, 2);
            const coords: Array<{ x: number; y: number; index: number }> = [];

            grid.forEach((x, y, _value, index) => {
                coords.push({ x, y, index });
            });

            expect(coords).toEqual([
                { x: 0, y: 0, index: 0 },
                { x: 1, y: 0, index: 1 },
                { x: 2, y: 0, index: 2 },
                { x: 0, y: 1, index: 3 },
                { x: 1, y: 1, index: 4 },
                { x: 2, y: 1, index: 5 },
            ]);
        });

        it('should provide default value for unset cells', () => {
            const grid = new Grid(2, 2, 'default');
            grid.set(0, 0, 'custom');

            const values: (string | undefined)[] = [];
            grid.forEach((_x, _y, value) => {
                values.push(value);
            });

            expect(values).toEqual(['custom', 'default', 'default', 'default']);
        });
    });

    describe('clear', () => {
        it('should clear all cells', () => {
            const grid = new Grid<string>(2, 2);
            grid.set(0, 0, 'a');
            grid.set(1, 1, 'b');

            grid.clear();

            expect(grid.get(0, 0)).toBeUndefined();
            expect(grid.get(1, 1)).toBeUndefined();
        });

        it('should reset to default value after clear', () => {
            const grid = new Grid(2, 2, 'default');
            grid.set(0, 0, 'custom');
            grid.clear();

            expect(grid.get(0, 0)).toBe('default');
        });
    });

    describe('clone', () => {
        it('should create an independent copy', () => {
            const original = new Grid<number>(2, 2);
            original.set(0, 0, 5);
            original.set(1, 1, 10);

            const cloned = original.clone();

            expect(cloned.get(0, 0)).toBe(5);
            expect(cloned.get(1, 1)).toBe(10);

            cloned.set(0, 0, 99);
            expect(original.get(0, 0)).toBe(5);
            expect(cloned.get(0, 0)).toBe(99);
        });

        it('should preserve dimensions', () => {
            const original = new Grid(7, 13);
            const cloned = original.clone();

            expect(cloned.width).toBe(7);
            expect(cloned.height).toBe(13);
        });
    });
});
