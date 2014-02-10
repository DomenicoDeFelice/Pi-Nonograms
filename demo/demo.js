var nonogram;

var difficulty_labels = {
    2: "very easy",
    3: "easy",
    4: "normal",
    5: "medium",
    6: "hard",
    7: "very hard",
};

function play() {
    var width      = $("#width").val();
    var height     = $("#height").val();
    var difficulty = $("#difficulty_slider").slider("value");
    var theme      = $("#theme").val();

    var density    = (10 - difficulty) / 10;

    nonogram = new dfd.nonograms.Nonogram($("#nonogram"), {
	width:  width,
	height: height,
	theme:  theme
    });
    nonogram.randomize({ density: density });
}

$(function () {
    $("#difficulty_slider").slider({
	min:   2,
	max:   7,
	value: 4,
	slide: function (e, ui) {
	    var difficulty = ui.value;
	    $("#difficulty_label").text(difficulty_labels[difficulty]);
	}
    });

    $("#difficulty_label").text(difficulty_labels[$("#difficulty_slider").slider("value")]);

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

    $("#draw_mode").click(function () {
	nonogram.setMode("draw");
	nonogram.startOver();
    });

    // $("#show_state").click(function () {
    // 	nonogram.showGameState();
    // });

    $("#play").click(function () {
	play();
    }).click();
});
