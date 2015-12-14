(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Pixi')
        .controller('NyanController', ['$scope', 'Nyan', function ($scope, nyan) {
            $scope.nyan = nyan;
        }]);
})();