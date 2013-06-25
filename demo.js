var nonogram;

function play() {
	var width   = $("#width").val();
	var height  = $("#height").val();
	var density = $("#density").val();
	var theme   = $("#theme").val();
	
	nonogram = new koala.nonograms.Nonogram($("#nonogram"), {
		 width: width,
		height: height,
		 theme: theme
	});
	nonogram.randomize({ density: density });
}

$(function () {
	$("#theme").change(function () {
		var newTheme = $(this).val();
		nonogram.setTheme(newTheme);
	}).click();

	$("#play").click(function () {
		play();
	}).click();
});
