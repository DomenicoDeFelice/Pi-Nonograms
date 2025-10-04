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
import { Grid } from './grid.js';
import { CellState, CellStateType, GameMode, GameModeType } from './constants.js';
import { DefinitionCalculator, LineDefinition } from './definition-calculator.js';
import { HintProvider } from './hint-provider.js';
import { NonogramGenerator } from './nonogram-generator.js';
import type Srand from 'seeded-rand';

export interface ModelOptions {
    width: number;
    height: number;
    srand: Srand;
    mode?: GameModeType;
}

export interface GuessChangedArgs {
    x: number;
    y: number;
    oldGuess: CellStateType | undefined;
    newGuess: CellStateType;
}

export class Model {
    readonly width: number;
    readonly height: number;
    readonly events: {
        guessChanged: Event<Model, GuessChangedArgs>;
        nonogramChanged: Event<Model, undefined>;
        nonogramSolved: Event<Model, undefined>;
        nonogramUnsolved: Event<Model, undefined>;
    };

    private _actual!: Grid<CellStateType>;
    private _guess!: Grid<CellStateType>;
    private _mode!: GameModeType;
    private _solved: boolean = false;
    private _definitionCalc: DefinitionCalculator;
    private _hintProvider: HintProvider;
    private _generator: NonogramGenerator;

    constructor(opts: ModelOptions) {
        this.width  = opts.width;
        this.height = opts.height;

        // Initialize helper classes
        this._definitionCalc = new DefinitionCalculator();
        this._hintProvider = new HintProvider(opts.srand);
        this._generator = new NonogramGenerator(opts.srand);

        // Events fired by the model
        this.events = {
            // The user guessed the content of a cell
            guessChanged: new Event<Model, GuessChangedArgs>(this),
            // The nonogram has been changed
            nonogramChanged: new Event<Model, undefined>(this),
            // The user solved the nonogram
            nonogramSolved: new Event<Model, undefined>(this),
            // The nonogram was solved but now it isn't
            nonogramUnsolved: new Event<Model, undefined>(this)
        };

        this._setupNonogram();
        this.setMode(opts.mode || GameMode.PLAY);
    }

    // Returns the state of a cell.
    // Arguments can be the x and y coordinates of the cell or
    // the index of the cell (second argument not passed)
    getCellAt(x: number, y?: number): CellStateType | undefined {
        return this._actual.get(x, y);
    }

    getGuessAt(x: number, y?: number): CellStateType | undefined {
        return this._guess.get(x, y);
    }

    setGuessAt(x: number, y: number | CellStateType, guess?: CellStateType): void {
        let index: number;
        let actualX: number;
        let actualY: number;

        if (guess === undefined) {
            // Shift arguments - called with (index, guess)
            guess = y as CellStateType;
            index = x;
            const xy = this._actual['_XYFromIndex'](index);
            actualX = xy[0];
            actualY = xy[1];
        } else {
            actualX = x;
            actualY = y as number;
        }

        const oldGuess = this.getGuessAt(actualX, actualY);
        this._guess.set(actualX, actualY, guess);

        this.events.guessChanged.notify({
            x: actualX,
            y: actualY,
            oldGuess: oldGuess,
            newGuess: guess
        });

        if (this._mode === GameMode.PLAY) this._checkIfSolved();
    }

    getMode(): GameModeType {
        return this._mode;
    }

    setMode(mode: GameModeType): void {
        if (mode === this._mode) return;

        this._mode = mode;

        if (mode === GameMode.DRAW) {
            // In draw mode, start with unknown cells and guess/actual are the same
            this._actual = new Grid(this.width, this.height, CellState.UNKNOWN);
            this._guess = this._actual;
        } else {
            // In play mode, create new empty guess grid with UNKNOWN default
            this._guess = new Grid(this.width, this.height, CellState.UNKNOWN);
        }

        this._setUnsolved();
        this.events.nonogramChanged.notify(undefined);
    }

    isSolved(): boolean {
        return this._solved;
    }

    getRowDefinition(row: number): LineDefinition[] {
        const actualCells = this._actual.getRow(row);
        const guessCells = this._guess.getRow(row);
        return this._definitionCalc.calculateLineDefinition(actualCells, guessCells, this._mode);
    }

    getColumnDefinition(col: number): LineDefinition[] {
        const actualCells = this._actual.getColumn(col);
        const guessCells = this._guess.getColumn(col);
        return this._definitionCalc.calculateLineDefinition(actualCells, guessCells, this._mode);
    }

    giveHint(): void {
        // Is there any hint to give?
        if (this.isSolved() || this._mode !== GameMode.PLAY) return;

        const hint = this._hintProvider.findHint(this._actual, this._guess);
        if (hint) {
            this.setGuessAt(hint.x, hint.y, hint.value!);
        }
    }

    randomize(density: number): void {
        this._setupNonogram();
        this._mode = GameMode.PLAY;

        this._generator.generate(this._actual, density);

        this.events.nonogramChanged.notify(undefined);
    }

    resetGuesses(): void {
        this._guess = new Grid(this.width, this.height, CellState.UNKNOWN);
        if (this._mode === GameMode.DRAW) {
            this._actual = this._guess;
        }

        this._solved = false;

        this.events.nonogramChanged.notify(undefined);
    }

    // Private methods
    private _setupNonogram(): void {
        this._actual = new Grid(this.width, this.height, CellState.EMPTY);
        this._guess  = new Grid(this.width, this.height, CellState.UNKNOWN);
        this._setUnsolved();
    }

    private _setSolved(): void {
        if (!this.isSolved()) {
            this._solved = true;
            this.events.nonogramSolved.notify(undefined);
        }
    }

    private _setUnsolved(): void {
        if (this.isSolved()) {
            this._solved = false;
            this.events.nonogramUnsolved.notify(undefined);
        }
    }

    private _checkIfSolved(): void {
        let solved = true;

        this._actual.forEach((x, y, actualValue) => {
            const guessValue = this._guess.get(x, y);

            if ((actualValue === CellState.FILLED && guessValue !== CellState.FILLED) ||
                (actualValue !== CellState.FILLED && guessValue === CellState.FILLED)) {
                solved = false;
            }
        });

        if (solved) {
            this._setSolved();
        } else {
            this._setUnsolved();
        }
    }
}
