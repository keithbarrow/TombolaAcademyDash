(function () {
    'use strict';

    //TODO: Now using lodash - deprecate?
    // Production steps of ECMA-262, Edition 5, 15.4.4.14
    if (!Array.prototype.findIndex) {
        Array.prototype.findIndex = function(predicate) {
            if (this === null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        };
    }


    angular.module('Tombola.Academy.Dash.Authentication', []);
    angular.module('Tombola.Academy.Dash.GithubProxy', []);
    angular.module('Tombola.Academy.Dash.TaProxy', ['Tombola.Academy.Dash.Authentication']);
    angular.module('Tombola.Academy.Dash.Admin.GithubUsers', ['Tombola.Academy.Dash.TaProxy']);
    angular.module('Tombola.Academy.Dash.WaitingPulls', ['Tombola.Academy.Dash.GithubProxy', 'Tombola.Academy.Dash.TaProxy']);
    angular.module('Tombola.Academy.Dash.Stats', ['Tombola.Academy.Dash.GithubProxy', 'Tombola.Academy.Dash.TaProxy']);
    angular.module('Tombola.Academy.Dash.Pixi', []);

    angular.module('myApp', [
        'ui.router',
        'Tombola.Academy.Dash.TaProxy',
        'Tombola.Academy.Dash.Authentication',
        'Tombola.Academy.Dash.WaitingPulls',
        'Tombola.Academy.Dash.Stats',
        'Tombola.Academy.Dash.Admin.GithubUsers',
        'Tombola.Academy.Dash.Pixi'
    ]);
})();