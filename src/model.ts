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

    private actual!: Grid<CellStateType>;
    private guess!: Grid<CellStateType>;
    private mode!: GameModeType;
    private solved: boolean = false;
    private definitionCalc: DefinitionCalculator;
    private hintProvider: HintProvider;
    private generator: NonogramGenerator;

    constructor(opts: ModelOptions) {
        this.width = opts.width;
        this.height = opts.height;

        // Initialize helper classes
        this.definitionCalc = new DefinitionCalculator();
        this.hintProvider = new HintProvider(opts.srand);
        this.generator = new NonogramGenerator(opts.srand);

        // Events fired by the model
        this.events = {
            // The user guessed the content of a cell
            guessChanged: new Event<Model, GuessChangedArgs>(this),
            // The nonogram has been changed
            nonogramChanged: new Event<Model, undefined>(this),
            // The user solved the nonogram
            nonogramSolved: new Event<Model, undefined>(this),
            // The nonogram was solved but now it isn't
            nonogramUnsolved: new Event<Model, undefined>(this),
        };

        this.setupNonogram();
        this.setMode(opts.mode || GameMode.PLAY);
    }

    // Returns the state of a cell.
    // Arguments can be the x and y coordinates of the cell or
    // the index of the cell (second argument not passed)
    getCellAt(x: number, y?: number): CellStateType | undefined {
        return this.actual.get(x, y);
    }

    getGuessAt(x: number, y?: number): CellStateType | undefined {
        return this.guess.get(x, y);
    }

    setGuessAt(x: number, y: number | CellStateType, guess?: CellStateType): void {
        let index: number;
        let actualX: number;
        let actualY: number;

        if (guess === undefined) {
            // Shift arguments - called with (index, guess)
            guess = y as CellStateType;
            index = x;
            const xy = this.actual['xyFromIndex'](index);
            actualX = xy[0];
            actualY = xy[1];
        } else {
            actualX = x;
            actualY = y as number;
        }

        const oldGuess = this.getGuessAt(actualX, actualY);
        this.guess.set(actualX, actualY, guess);

        this.events.guessChanged.notify({
            x: actualX,
            y: actualY,
            oldGuess: oldGuess,
            newGuess: guess,
        });

        if (this.mode === GameMode.PLAY) this.checkIfSolved();
    }

    getMode(): GameModeType {
        return this.mode;
    }

    setMode(mode: GameModeType): void {
        if (mode === this.mode) return;

        this.mode = mode;

        if (mode === GameMode.DRAW) {
            // In draw mode, start with unknown cells and guess/actual are the same
            this.actual = new Grid(this.width, this.height, CellState.UNKNOWN);
            this.guess = this.actual;
        } else {
            // In play mode, create new empty guess grid with UNKNOWN default
            this.guess = new Grid(this.width, this.height, CellState.UNKNOWN);
        }

        this.setUnsolved();
        this.events.nonogramChanged.notify(undefined);
    }

    isSolved(): boolean {
        return this.solved;
    }

    getRowDefinition(row: number): LineDefinition[] {
        const actualCells = this.actual.getRow(row);
        const guessCells = this.guess.getRow(row);
        return this.definitionCalc.calculateLineDefinition(actualCells, guessCells, this.mode);
    }

    getColumnDefinition(col: number): LineDefinition[] {
        const actualCells = this.actual.getColumn(col);
        const guessCells = this.guess.getColumn(col);
        return this.definitionCalc.calculateLineDefinition(actualCells, guessCells, this.mode);
    }

    giveHint(): void {
        // Is there any hint to give?
        if (this.isSolved() || this.mode !== GameMode.PLAY) return;

        const hint = this.hintProvider.findHint(this.actual, this.guess);
        if (hint) {
            this.setGuessAt(hint.x, hint.y, hint.value);
        }
    }

    randomize(density: number): void {
        this.setupNonogram();
        this.mode = GameMode.PLAY;

        this.generator.generate(this.actual, density);

        this.events.nonogramChanged.notify(undefined);
    }

    resetGuesses(): void {
        this.guess = new Grid(this.width, this.height, CellState.UNKNOWN);
        if (this.mode === GameMode.DRAW) {
            this.actual = this.guess;
        }

        this.solved = false;

        this.events.nonogramChanged.notify(undefined);
    }

    // Private methods
    private setupNonogram(): void {
        this.actual = new Grid(this.width, this.height, CellState.EMPTY);
        this.guess = new Grid(this.width, this.height, CellState.UNKNOWN);
        this.setUnsolved();
    }

    private setSolved(): void {
        if (!this.isSolved()) {
            this.solved = true;
            this.events.nonogramSolved.notify(undefined);
        }
    }

    private setUnsolved(): void {
        if (this.isSolved()) {
            this.solved = false;
            this.events.nonogramUnsolved.notify(undefined);
        }
    }

    private checkIfSolved(): void {
        let solved = true;

        this.actual.forEach((x, y, actualValue) => {
            const guessValue = this.guess.get(x, y);

            if (
                (actualValue === CellState.FILLED && guessValue !== CellState.FILLED) ||
                (actualValue !== CellState.FILLED && guessValue === CellState.FILLED)
            ) {
                solved = false;
            }
        });

        if (solved) {
            this.setSolved();
        } else {
            this.setUnsolved();
        }
    }
}
