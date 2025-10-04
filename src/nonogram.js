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

import { GameMode } from './constants.js';
import { Model } from './model.js';
import { View } from './view.js';
import { Controller } from './controller.js';

// Default options
const DEFAULT_OPTIONS = {
    width:    10,
    height:   10,
    mode:     GameMode.PLAY,
    theme:    'classic',
    srand:    window.dfd.Srand,
    onSolved: () => {
        alert('Congratulations! Nonogram solved!');
    }
};

export class Nonogram {
    constructor(container, opts) {
        opts = opts || {};

        // Apply default options
        for (const option in DEFAULT_OPTIONS) {
            // Default value if not specified
            opts[option] = opts[option] || DEFAULT_OPTIONS[option];
        }

        const model = new Model({
            width:  opts.width,
            height: opts.height,
            srand:  opts.srand,
            mode:   opts.mode
        });
        model.events.nonogramSolved.attach(opts.onSolved);

        const view = new View(model, container);
        view.setTheme(opts.theme);

        const controller = new Controller(model, view);

        this._model      = model;
        this._view       = view;
        this._controller = controller;

        this._container = container;
        this._opts      = opts;
    }

    show() {
        this._view.show();
    }

    randomize(opts) {
        let density = 0.60;
        if (opts && opts.density) {
            density = opts.density;
        }

        this._model.randomize(density);
    }

    giveHint() {
        this._model.giveHint();
    }

    startOver() {
        this._model.resetGuesses();
    }

    setTheme(theme) {
        this._opts.theme = theme;
        this._view.setTheme(theme);
    }

    getMode() {
        return this._model.getMode();
    }

    setMode(mode) {
        this._model.setMode(mode);
    }

    showGameState() {
        //alert(this._model.getGameState());
    }
}

// Expose default options as a static property for backward compatibility
Nonogram.options = DEFAULT_OPTIONS;
