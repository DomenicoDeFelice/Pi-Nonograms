/*
  A nonogram game written in javascript
  https://github.com/DomenicoDeFelice/Pi-Nonograms

  Play the game: http://freenonograms.altervista.org

  Copyright (c) 2013-2015 Domenico De Felice

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

/**
 * Grid - A 2D grid data structure to replace flat array storage
 * Provides cleaner API for coordinate-based access
 */
dfd.nonograms.Grid = function (width, height, defaultValue) {
    this.width = width;
    this.height = height;
    this._defaultValue = defaultValue; // Value to return for unset cells
    this._data = new Array(width * height);
};

dfd.nonograms.Grid.prototype = {
    // Get cell value at coordinates or index
    get: function (x, y) {
        var index;
        if (y === undefined) {
            index = x; // Called with index only
        } else {
            index = this._indexFromXY(x, y);
        }
        var value = this._data[index];
        // Return default value for unset cells
        return (value === undefined) ? this._defaultValue : value;
    },

    // Set cell value at coordinates or index
    set: function (x, y, value) {
        var index;
        if (arguments.length === 2) {
            // Called with (index, value)
            index = x;
            value = y;
        } else {
            // Called with (x, y, value)
            index = this._indexFromXY(x, y);
        }
        this._data[index] = value;
    },

    // Get entire row as array
    getRow: function (row) {
        var result = [];
        for (var x = 0; x < this.width; x++) {
            result.push(this.get(x, row));
        }
        return result;
    },

    // Get entire column as array
    getColumn: function (col) {
        var result = [];
        for (var y = 0; y < this.height; y++) {
            result.push(this.get(col, y));
        }
        return result;
    },

    // Iterate over all cells
    forEach: function (callback) {
        for (var index = 0; index < this._data.length; index++) {
            var xy = this._XYFromIndex(index);
            var value = this._data[index];
            // Return default value for unset cells, just like get()
            if (value === undefined) value = this._defaultValue;
            callback(xy[0], xy[1], value, index);
        }
    },

    // Get total number of cells
    size: function () {
        return this.width * this.height;
    },

    // Clear all cells (set to undefined)
    clear: function () {
        this._data = new Array(this.width * this.height);
    },

    // Clone the grid
    clone: function () {
        var cloned = new dfd.nonograms.Grid(this.width, this.height);
        for (var i = 0; i < this._data.length; i++) {
            cloned._data[i] = this._data[i];
        }
        return cloned;
    },

    // Get direct access to underlying array (for backward compatibility)
    _getArray: function () {
        return this._data;
    },

    // Coordinate conversion helpers
    _indexFromXY: function (x, y) {
        return y * this.width + x;
    },

    _XYFromIndex: function (index) {
        var y = Math.floor(index / this.width);
        var x = index % this.width;
        return [x, y];
    }
};

}(window);
