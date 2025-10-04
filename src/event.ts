/*
  A nonogram game written in javascript
  https://github.com/DomenicoDeFelice/Pi-Nonograms

  Play the game: https://domdefelice.net/pi-nonograms/

  Copyright (c) 2013-2025 Domenico De Felice

  @license

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

export type EventListener<TSender, TArgs> = (sender: TSender, args: TArgs) => void;

export class Event<TSender = unknown, TArgs = unknown> {
    private sender: TSender;
    private listeners: EventListener<TSender, TArgs>[] = [];

    constructor(sender: TSender) {
        this.sender = sender;
    }

    attach(listener: EventListener<TSender, TArgs>): void {
        this.listeners.push(listener);
    }

    notify(args: TArgs): void {
        for (let index = 0, nListeners = this.listeners.length; index < nListeners; index++) {
            this.listeners[index](this.sender, args);
        }
    }
}
