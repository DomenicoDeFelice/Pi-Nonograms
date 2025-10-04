src_files = src/js/jsrand.min.js src/js/dfd/event.js src/js/dfd/nonograms/constants.js src/js/dfd/nonograms/grid.js src/js/dfd/nonograms/definition_calculator.js src/js/dfd/nonograms/hint_provider.js src/js/dfd/nonograms/nonogram_generator.js src/js/dfd/nonograms/drag_helper.js src/js/dfd/nonograms/model.js src/js/dfd/nonograms/view.js src/js/dfd/nonograms/controller.js src/js/dfd/nonograms/nonogram.js

all:	minify

minify: $(src_files)
	uglifyjs $(src_files) --comments --mangle --output dist/pi-nonograms.min.js --source-map dist/pi-nonograms.js.map --source-map-root ../ --source-map-url pi-nonograms.js.map
