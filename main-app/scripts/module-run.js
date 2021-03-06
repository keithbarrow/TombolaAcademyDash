(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash')
        .run(['$rootScope', '$state','TokenService', function($rootScope, $state, tokenService){
            $rootScope.$on('$stateChangeStart', function(event, toState){
                //TODO: roles for admin
                //Note - no sense of roles, will lose where we were headed at login...
                if(!tokenService.isAuthenticated() && toState.name !== 'login'){
                    event.preventDefault();
                    $state.go('login');
                }
            });
        }]);
})();