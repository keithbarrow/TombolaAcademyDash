(function () {
    'use strict';
    angular.module('myApp')
        .controller('MainController', ['$scope', '$state','TokenService', function($scope, $state, tokenService){

            $scope.partying = function(){
                var now = new Date();
                return now.getDay() === 5 && tokenService.isAuthenticated();
            };

            $scope.isAuthenticated = function(){
                return tokenService.isAuthenticated();
            };

            $scope.logout = function (){
                tokenService.resetToken();
            };

            $state.go('waitingPulls');
    }]);
})();