(function () {
    'use strict';


    angular.module('Tombola.Academy.Dash.WaitingPulls')
        .controller('WaitingPullsController', ['$scope', '$rootScope', '$http', '$interval', '$q', 'WaitingPullsModel', function ($scope, $rootScope, $http, $interval, $q, waitingPullsModel) {
            $scope.model = waitingPullsModel;
            $scope.timerClass = '';
            var intervalPromise;


            var refresh = function () {
                $scope.timerClass = '';
                waitingPullsModel.refresh()
                    .catch(function(message){
                        alert(message);
                    });
                $scope.timerClass = 'nyantimer';

            };

            var startPolling = function () {
                intervalPromise = $interval(function () {
                        refresh();
                    }, 5 * 60 * 1000
                );
            };

            $rootScope.$on('$routeChangeSuccess', function (event, toRoute) {
                if (toRoute.$$route.controller === 'WaitingPullsController') {
                    refresh();
                }
                else {
                    $interval.cancel(intervalPromise);
                }
            });

            refresh();
            startPolling();
        }]);
})();