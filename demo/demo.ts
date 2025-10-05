import { Nonogram, GameMode, Srand } from '../src/main.js';
import { registerServiceWorker } from '../src/pwa.js';

let nonogram: Nonogram;

const difficultyLabels: Record<number, string> = {
    2: 'very easy',
    3: 'easy',
    4: 'normal',
    5: 'medium',
    6: 'hard',
    7: 'very hard',
};

function densityFromDifficulty(difficulty: number): number {
    return (10 - difficulty) / 10;
}

function playNonogram(nonogramId?: number): void {
    const width = (document.getElementById('width') as HTMLInputElement).value;
    const height = (document.getElementById('height') as HTMLInputElement).value;
    const theme = (document.getElementById('theme') as HTMLSelectElement).value;

    // nonogramId is used as seed for the pseudo-random numbers
    // generator (same seed generates same nonogram).
    // If nonogramId is undefined, a random seed is set.
    const srand = new Srand(nonogramId);

    // Gets the seed. If nonogramId is defined, seed will be equal
    // to nonogramId, otherwise it will be a randomly chosen seed.
    const seed = srand.seed();

    (document.getElementById('nonogram_id') as HTMLInputElement).value = seed.toString();

    nonogram = new Nonogram(document.getElementById('nonogram')!, {
        width: parseInt(width),
        height: parseInt(height),
        theme: theme,
        srand: srand,
    });

    const difficulty = parseInt(
        (document.getElementById('difficulty_slider') as HTMLInputElement).value
    );
    const density = densityFromDifficulty(difficulty);

    nonogram.randomize({ density: density });
}

function playSelectedNonogram(): void {
    const nonogramId = Number((document.getElementById('nonogram_id') as HTMLInputElement).value);

    playNonogram(nonogramId);
}

function drawNewNonogram(): void {
    const width = (document.getElementById('width') as HTMLInputElement).value;
    const height = (document.getElementById('height') as HTMLInputElement).value;
    const theme = (document.getElementById('theme') as HTMLSelectElement).value;

    nonogram = new Nonogram(document.getElementById('nonogram')!, {
        width: parseInt(width),
        height: parseInt(height),
        theme: theme,
        mode: GameMode.DRAW,
    });

    nonogram.show();
}

document.addEventListener('DOMContentLoaded', function () {
    const demoElement = document.getElementById('demo')!;
    const difficultySlider = document.getElementById('difficulty_slider') as HTMLInputElement;
    const difficultyLabel = document.getElementById('difficulty_label')!;
    const themeSelect = document.getElementById('theme') as HTMLSelectElement;

    demoElement.style.display = 'none';

    // Update difficulty label when slider changes
    difficultySlider.addEventListener('input', function () {
        const difficulty = parseInt(this.value);
        difficultyLabel.textContent = difficultyLabels[difficulty];
    });

    // Initialize difficulty label
    difficultyLabel.textContent = difficultyLabels[parseInt(difficultySlider.value)];

    themeSelect.addEventListener('change', function () {
        const newTheme = this.value;
        nonogram.setTheme(newTheme);
    });
    themeSelect.click();

    document.getElementById('give_hint')!.addEventListener('click', function () {
        nonogram.giveHint();
    });

    document.getElementById('start_over')!.addEventListener('click', function () {
        nonogram.startOver();
    });

    document.getElementById('draw_nonogram')!.addEventListener('click', drawNewNonogram);

    document.getElementById('play_by_id')!.addEventListener('click', playSelectedNonogram);

    const playButton = document.getElementById('play')!;
    playButton.addEventListener('click', function () {
        playNonogram();
    });
    playButton.click();

    // Fade in demo element
    demoElement.style.opacity = '0';
    demoElement.style.display = 'inline-block';
    demoElement.style.transition = 'opacity 1.5s';
    setTimeout(() => {
        demoElement.style.opacity = '1';
    }, 10);

    // Register service worker for PWA support
    registerServiceWorker();
});
