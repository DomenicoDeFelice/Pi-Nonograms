/*
  General purpose shared functions.
  Copyright (C) 2013 Domenico De Felice
  http://domenicodefelice.blogspot.com

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

if (!window.koala) {
    window.koala = {};
}

koala.utils = {
    randomIntegerInRange: function (min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
    }
};


/*
  Thanks to Alex Netkachov for his article:
  http://www.alexatnet.com/articles/model-view-controller-mvc-javascript
*/
koala.utils.Event = function (sender) {
    this._sender = sender;
    this._listeners = [];
};

koala.utils.Event.prototype = {
    attach: function (listener) {
        this._listeners.push(listener);
    },

    notify: function (args) {
        for (var index = 0, nlisteners = this._listeners.length; index < nlisteners; index++) {
            this._listeners[index](this._sender, args);
        }
    }
};
