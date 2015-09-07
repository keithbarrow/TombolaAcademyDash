(function () {
    'use strict';
    angular.module('myApp')
        .run(['$rootScope', '$state','Authenticator', function($rootScope, $state, authenticator){
            $rootScope.$on('$stateChangeStart', function(event, toState){
                //Note - no sense of roles, will lose where we were headed at login...
                if(!authenticator.isAuthenticated() && toState.name !== 'login'){
                    event.preventDefault();
                    $state.go('login');
                }
            });
        }]);
})();