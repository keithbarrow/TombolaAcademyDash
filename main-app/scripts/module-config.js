(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash')
        .config(['$locationProvider', '$stateProvider', function($locationProvider, $stateProvider) {
            $locationProvider.html5Mode(true);
            $stateProvider
                .state('waitingPulls', {
                    templateUrl: 'partials/waitingpulls.html',
                    controller:  'WaitingPullsController'
                })
                .state('stats', {
                    templateUrl: 'partials/stats.html',
                    controller:  'StatsController'
                })
                .state('login', {
                    templateUrl: 'partials/login.html',
                    controller:  'AuthenticationController'
                })
                .state('admin', {
                    url:'/admin',
                    templateUrl: 'partials/admin/index.html',
                    controller:'GithubUsersController'
                })
                .state('admin.githubusers', {
                    url:'/githubusers',
                    controller:'GithubUsersController',
                    templateUrl: 'partials/admin/githubusers.html'
                })
                .state('admin.githubrepositories', {
                    url:'/githubrepos',
                    controller:'GithubRepositoriesController',
                    templateUrl: 'partials/admin/githubrepos.html'
                });
        }]);
})();