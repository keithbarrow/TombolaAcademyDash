(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy', []);
    angular.module('Tombola.Academy.Dash.GithubProxy', ['Tombola.Academy.Dash.GithubProxy']);
    angular.module('Tombola.Academy.Dash.WaitingPulls', ['Tombola.Academy.Dash.GithubProxy']);
    angular.module('Tombola.Academy.Dash.Stats', ['Tombola.Academy.Dash.TaProxy']);

    angular.module('myApp', [
        'ngRoute',
        'Tombola.Academy.Dash.WaitingPulls',
        'Tombola.Academy.Dash.Stats'
    ]).config( function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);
            $locationProvider.hashPrefix('!');
            $routeProvider
                .when('/', {
                    templateUrl: 'partials/waitingpulls.html',
                    controller:  'WaitingPullsController'
                })
                .when('/stats', {
                    templateUrl: 'partials/stats.html',
                    controller:  'StatsController'
                })
                .otherwise({redirectTo: '/'});

        });
})();