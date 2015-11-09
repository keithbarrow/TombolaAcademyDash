(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('TaGithubUserProxy', ['TaBaseProxy', function(TaBaseProxy){

            var proxy = new TaBaseProxy('githubusers');
            return {
                get: proxy.get,
                update: proxy.update,
                add: proxy.add,
                remove: proxy.remove
            };
    }]);
})();