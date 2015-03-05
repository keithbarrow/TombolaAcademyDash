'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'Tombola.Academy.Dash.WaitingPulls',
    'Tombola.Academy.Dash.Stats'
]).
config( function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
        $routeProvider
            .when('/', {
                templateUrl: 'waitingpulls/waitingpulls.html',
                controller:  'WaitingPullsController'
            })
            .when('/stats', {
                templateUrl: 'stats/stats.html',
                controller:  'StatsController'
            })
            .otherwise({redirectTo: '/'});

});
