(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .controller('StatsController', ['$scope', 'StatsModel', function($scope,  statsModel) {
            statsModel.getData()
                .then(function(data){
                    $scope.statistics = data;
                });
        }]);
})();