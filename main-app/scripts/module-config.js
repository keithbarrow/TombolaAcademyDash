(function () {
    'use strict';
    angular.module('myApp').config( function($stateProvider) {
        $stateProvider
            .state('waitingPulls', {
                templateUrl: 'partials/waitingpulls.html',
                controller:  'WaitingPullsController'
            })
            .state('stats', {
                templateUrl: 'partials/stats.html',
                controller:  'StatsController'
            });
    });
})();