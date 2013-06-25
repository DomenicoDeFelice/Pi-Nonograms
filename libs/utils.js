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
