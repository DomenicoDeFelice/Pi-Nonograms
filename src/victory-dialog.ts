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

import confetti from 'canvas-confetti';

export class VictoryDialog {
    private dialog: HTMLDialogElement;
    private confettiInterval: number | null = null;

    constructor() {
        this.dialog = document.getElementById('victory-dialog') as HTMLDialogElement;
        if (!this.dialog) {
            throw new Error('Victory dialog element not found');
        }

        // Close dialog when clicking the close button
        const closeButton = this.dialog.querySelector('.victory-close');
        closeButton?.addEventListener('click', () => this.close());

        // Close dialog when clicking outside (on backdrop)
        this.dialog.addEventListener('click', (e) => {
            const rect = this.dialog.getBoundingClientRect();
            if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            ) {
                this.close();
            }
        });
    }

    show(): void {
        this.dialog.showModal();
        this.startConfettiLoop();
    }

    close(): void {
        this.stopConfettiLoop();
        this.dialog.close();
    }

    private startConfettiLoop(): void {
        // Fire immediately
        this.fireConfetti();

        // Then fire every 2 seconds
        this.confettiInterval = window.setInterval(() => {
            this.fireConfetti();
        }, 2000);
    }

    private stopConfettiLoop(): void {
        if (this.confettiInterval !== null) {
            window.clearInterval(this.confettiInterval);
            this.confettiInterval = null;
        }
    }

    private fireConfetti(): void {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
        };

        function fire(particleRatio: number, opts: confetti.Options) {
            void confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }
}
