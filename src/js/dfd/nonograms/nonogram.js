/*
  A nonogram game written in javascript
  https://github.com/DomenicoDeFelice/Pi-Nonograms

  Play the game: http://freenonograms.altervista.org

  Copyright (c) 2013-2015 Domenico De Felice

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

!function (global) {

if (!global.dfd) {
    global.dfd = {};
}

if (!dfd.nonograms) {
    dfd.nonograms = {};
}

dfd.nonograms.Nonogram = function (container, opts) {
    var model, view, controller;
    var default_options = dfd.nonograms.Nonogram.options;

    opts = opts || {};
    for (var option in default_options) {
        // Default value if not specified
        opts[option] = opts[option] || default_options[option];
    }

    model = new dfd.nonograms.Model({
        width:  opts.width,
        height: opts.height,
        srand:  opts.srand,
        mode:   opts.mode
    });
    model.events.nonogramSolved.attach(opts.onSolved);

    view = new dfd.nonograms.View(model, container);
    view.setTheme(opts.theme);

    controller = new dfd.nonograms.Controller(model, view);

    this._model      = model
    this._view       = view;
    this._controller = controller;

    this._container = container;
    this._opts      = opts;
}

// Options and their default value
dfd.nonograms.Nonogram.options = {
    width:    10,
    height:   10,
    mode:     'play',
    theme:    'classic',
    srand:    dfd.Srand,
    onSolved: function () {
        alert('Congratulations! Nonogram solved!');
    }
};

dfd.nonograms.Nonogram.prototype = {
    show: function () {
        this._view.show();
    },

    randomize: function (opts) {
        var density = 0.60;
        if (opts && opts.density) {
            density = opts.density;
        }

        this._model.randomize(density);
    },

    giveHint: function () {
        this._model.giveHint();
    },

    startOver: function () {
        this._model.resetGuesses();
    },

    setTheme: function (theme) {
        this._opts.theme = theme;
        this._view.setTheme(theme);
    },

    getMode: function () {
        return this._model.getMode();
    },

    setMode: function (mode) {
        this._model.setMode(mode);
    },

    showGameState: function () {
        //alert(this._model.getGameState());
    }
};

}(window);
