(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Authentication')
        .controller('AuthenticationController', ['$scope', '$state', 'Authenticator', function($scope, $state, authenticator) {
            $scope.username ='';
            $scope.password ='';
            $scope.login = function(){
                authenticator.login($scope.username, $scope.password);
            };
        }]);
})();