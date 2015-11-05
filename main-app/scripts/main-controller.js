(function () {
    'use strict';
    angular.module('myApp')
        .controller('MainController', ['$scope', '$state','TokenService', function($scope, $state, tokenService){
            $scope.isAuthenticated = function(){
                return tokenService.isAuthenticated();
            };
            $scope.logout = function (){
                tokenService.resetToken();
            };
            $state.go('waitingPulls');
    }]);
})();