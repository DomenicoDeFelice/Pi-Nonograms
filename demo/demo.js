import { Nonogram, GameMode } from '../src/js/main.js';

// jQuery and Srand are loaded as globals from CDN
const $ = window.jQuery;
const Srand = window.dfd.Srand;

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
    const width  = $("#width").val();
    const height = $("#height").val();
    const theme  = $("#theme").val();

    // nonogramId is used as seed for the pseudo-random numbers
    // generator (same seed generates same nonogram).
    // If nonogramId is undefined, a random seed is set.
    const srand = new Srand(nonogramId);

    // Gets the seed. If nonogramId is defined, seed will be equal
    // to nonogramId, otherwise it will be a randomly chosen seed.
    const seed = srand.seed();

    $("#nonogram_id").val(seed);

    nonogram = new Nonogram($("#nonogram"), {
        width:  width,
        height: height,
        theme:  theme,
        srand:  srand
    });

    const difficulty = $("#difficulty_slider").slider("value");
    const density    = densityFromDifficulty(difficulty);

    nonogram.randomize({ density: density });
}

function playSelectedNonogram() {
    const nonogramId = Number($("#nonogram_id").val());

    playNonogram(nonogramId);
}

function drawNewNonogram() {
    const width  = $("#width").val();
    const height = $("#height").val();
    const theme  = $("#theme").val();

    nonogram = new Nonogram($("#nonogram"), {
        width:  width,
        height: height,
        theme:  theme,
        mode:   GameMode.DRAW
    });

    nonogram.show();
}

$(function () {
    $("#demo").hide();

    $("#difficulty_slider").slider({
        min:   2,
        max:   7,
        value: 4,
        slide: (e, ui) => {
            const difficulty = ui.value;
            $("#difficulty_label").text(difficultyLabels[difficulty]);
        }
    });

    $("#difficulty_label").text(difficultyLabels[$("#difficulty_slider").slider("value")]);

    $("#theme").change(function () {
        const newTheme = $(this).val();
        nonogram.setTheme(newTheme);
    }).click();

    $("#give_hint").click(() => {
        nonogram.giveHint();
    });

    $("#start_over").click(() => {
        nonogram.startOver();
    });

    $("#draw_nonogram").click(drawNewNonogram);

    $("#play_by_id").click(playSelectedNonogram);

    $("#play").click(() => {
        playNonogram();
    }).click();

    $("#demo").fadeIn(1500);
});
