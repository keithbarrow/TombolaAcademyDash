(function () {
    'use strict';
    angular.module('myApp')
        .run(['$rootScope', '$state','TokenService', 'UserInformation', function($rootScope, $state, tokenService){
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