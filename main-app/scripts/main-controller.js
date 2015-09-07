(function () {
    'use strict';
    angular.module('myApp')
        .controller('MainController', ['$scope', '$state','Authenticator', function($scope, $state, authenticator){
            $scope.isAuthenticated = function(){
                return authenticator.isAuthenticated();
            };
            $scope.logout = function (){
                authenticator.logout();
            };
            $state.go('waitingPulls');
    }]);
})();