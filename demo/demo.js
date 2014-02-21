var nonogram;

var difficultyLabels = {
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
    var width  = $("#width").val();
    var height = $("#height").val();
    var theme  = $("#theme").val();

    // nonogramId is used as seed for the pseudo-random numbers
    // generator (same seed generates same nonogram).
    // If nonogramId is undefined, a random seed is set.
    var srand = new Srand(nonogramId);

    // Gets the seed. If nonogramId is defined, seed will be equal
    // to nonogramId, otherwise it will be a randomly chosen seed.
    var seed = srand.seed();
    $("#nonogram_id").val(seed);

    nonogram = new dfd.nonograms.Nonogram($("#nonogram"), {
	width:  width,
	height: height,
	theme:  theme,
	srand:  srand
    });

    var difficulty = $("#difficulty_slider").slider("value");
    var density    = densityFromDifficulty(difficulty);

    nonogram.randomize({ density: density });
}

function playSelectedNonogram() {
    var nonogramId = Number($("#nonogram_id").val());

    playNonogram(nonogramId);
}

function drawNewNonogram() {
    var width  = $("#width").val();
    var height = $("#height").val();
    var theme  = $("#theme").val();

    nonogram = new dfd.nonograms.Nonogram($("#nonogram"), {
	width:  width,
	height: height,
	theme:  theme,
	mode:   "draw"
    });

    nonogram.show();
}

$(function () {
    $("#demo").hide();

    $("#difficulty_slider").slider({
	min:   2,
	max:   7,
	value: 4,
	slide: function (e, ui) {
	    var difficulty = ui.value;
	    $("#difficulty_label").text(difficultyLabels[difficulty]);
	}
    });

    $("#difficulty_label").text(difficultyLabels[$("#difficulty_slider").slider("value")]);

    $("#theme").change(function () {
	var newTheme = $(this).val();
	nonogram.setTheme(newTheme);
    }).click();

    $("#give_hint").click(function () {
	nonogram.giveHint();
    });

    $("#start_over").click(function () {
	nonogram.startOver();
    });

    $("#draw_nonogram").click(function (e) {
	drawNewNonogram();
    });
    $("#play_by_id").click(function (e) {
	playSelectedNonogram();
    });
    $("#play").click(function (e) {
	playNonogram();
    }).click();

    $("#demo").fadeIn(1500);
});
