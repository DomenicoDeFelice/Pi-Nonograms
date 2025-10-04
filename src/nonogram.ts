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

import { GameMode, GameModeType } from './constants.js';
import { Model } from './model.js';
import { View } from './view.js';
import { Controller } from './controller.js';
import Srand from 'seeded-rand';

export interface NonogramOptions {
    width?: number;
    height?: number;
    mode?: GameModeType;
    theme?: string;
    srand?: Srand;
    onSolved?: () => void;
}

// Default options
const DEFAULT_OPTIONS: Required<NonogramOptions> = {
    width:    10,
    height:   10,
    mode:     GameMode.PLAY,
    theme:    'classic',
    srand:    new Srand(),
    onSolved: () => {
        alert('Congratulations! Nonogram solved!');
    }
};

export class Nonogram {
    static options = DEFAULT_OPTIONS;

    private _model: Model;
    private _view: View;
    private _controller: Controller;
    private _container: string | HTMLElement;
    private _opts: Required<NonogramOptions>;

    constructor(container: string | HTMLElement, opts?: NonogramOptions) {
        const mergedOpts: Required<NonogramOptions> = { ...DEFAULT_OPTIONS };

        // Apply user options
        if (opts) {
            for (const key in opts) {
                if (opts[key as keyof NonogramOptions] !== undefined) {
                    (mergedOpts as any)[key] = opts[key as keyof NonogramOptions];
                }
            }
        }

        const model = new Model({
            width:  mergedOpts.width,
            height: mergedOpts.height,
            srand:  mergedOpts.srand,
            mode:   mergedOpts.mode
        });
        model.events.nonogramSolved.attach(mergedOpts.onSolved);

        const view = new View(model, container);
        view.setTheme(mergedOpts.theme);

        const controller = new Controller(model, view);

        this._model      = model;
        this._view       = view;
        this._controller = controller;

        this._container = container;
        this._opts      = mergedOpts;
    }

    show(): void {
        this._view.show();
    }

    randomize(opts?: { density?: number }): void {
        let density = 0.60;
        if (opts && opts.density) {
            density = opts.density;
        }

        this._model.randomize(density);
    }

    giveHint(): void {
        this._model.giveHint();
    }

    startOver(): void {
        this._model.resetGuesses();
    }

    setTheme(theme: string): void {
        this._opts.theme = theme;
        this._view.setTheme(theme);
    }

    getMode(): GameModeType {
        return this._model.getMode();
    }

    setMode(mode: GameModeType): void {
        this._model.setMode(mode);
    }

    showGameState(): void {
        //alert(this._model.getGameState());
    }
}
