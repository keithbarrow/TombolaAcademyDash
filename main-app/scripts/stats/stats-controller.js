(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .controller('StatsController', ['$scope', 'StatsModel', function($scope,  statsModel) {
            $scope.model = statsModel;
            $scope.model.refresh();

        }]);
})();