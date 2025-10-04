import { Nonogram, GameMode, Srand } from '../src/main.js';

let nonogram;

const difficultyLabels = {
    2: "very easy",
    3: "easy",
    4: "normal",
    5: "medium",
    6: "hard",
    7: "very hard",
};

function densityFromDifficulty(difficulty) {
    return (10 - difficulty) / 10;
}

function playNonogram(nonogramId) {
    const width  = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const theme  = document.getElementById('theme').value;

    // nonogramId is used as seed for the pseudo-random numbers
    // generator (same seed generates same nonogram).
    // If nonogramId is undefined, a random seed is set.
    const srand = new Srand(nonogramId);

    // Gets the seed. If nonogramId is defined, seed will be equal
    // to nonogramId, otherwise it will be a randomly chosen seed.
    const seed = srand.seed();

    document.getElementById('nonogram_id').value = seed;

    nonogram = new Nonogram(document.getElementById('nonogram'), {
        width:  width,
        height: height,
        theme:  theme,
        srand:  srand
    });

    const difficulty = document.getElementById('difficulty_slider').value;
    const density    = densityFromDifficulty(difficulty);

    nonogram.randomize({ density: density });
}

function playSelectedNonogram() {
    const nonogramId = Number(document.getElementById('nonogram_id').value);

    playNonogram(nonogramId);
}

function drawNewNonogram() {
    const width  = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const theme  = document.getElementById('theme').value;

    nonogram = new Nonogram(document.getElementById('nonogram'), {
        width:  width,
        height: height,
        theme:  theme,
        mode:   GameMode.DRAW
    });

    nonogram.show();
}

document.addEventListener('DOMContentLoaded', function () {
    const demoElement = document.getElementById('demo');
    const difficultySlider = document.getElementById('difficulty_slider');
    const difficultyLabel = document.getElementById('difficulty_label');
    const themeSelect = document.getElementById('theme');

    demoElement.style.display = 'none';

    // Update difficulty label when slider changes
    difficultySlider.addEventListener('input', function () {
        const difficulty = this.value;
        difficultyLabel.textContent = difficultyLabels[difficulty];
    });

    // Initialize difficulty label
    difficultyLabel.textContent = difficultyLabels[difficultySlider.value];

    themeSelect.addEventListener('change', function () {
        const newTheme = this.value;
        nonogram.setTheme(newTheme);
    });
    themeSelect.click();

    document.getElementById('give_hint').addEventListener('click', function () {
        nonogram.giveHint();
    });

    document.getElementById('start_over').addEventListener('click', function () {
        nonogram.startOver();
    });

    document.getElementById('draw_nonogram').addEventListener('click', drawNewNonogram);

    document.getElementById('play_by_id').addEventListener('click', playSelectedNonogram);

    const playButton = document.getElementById('play');
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
});
