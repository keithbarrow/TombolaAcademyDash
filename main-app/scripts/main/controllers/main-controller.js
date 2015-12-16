(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Main')
        .controller('MainController', ['$scope', '$state', '$interval','TokenService', 'SpecialDayService', function($scope, $state, $interval,tokenService, specialDayService){

            var update = function(){
                    $scope.isAuthenticated = tokenService.isAuthenticated();
                    $scope.specialClass = specialDayService();
                };



            $scope.specialClass =specialDayService();

            $scope.logout = function (){
                tokenService.resetToken();
            };

            $state.go('waitingPulls');

            update();

            $interval(update, 1000);

    }]);
})();