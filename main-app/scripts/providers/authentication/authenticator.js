(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Authentication')
        .service('Authenticator', [ '$state', 'UserInformation', function ($state, userInformation){
        var token = null;

        return {
            login: function(username, password){
                token = userInformation.login(username, password);
                if(this.isAuthenticated()){
                    $state.go('waitingPulls'); //No sense of where user was going...
                }
            },
            logout: function() {
                token = null;
                $state.go('login');
            },
            isAuthenticated : function(){
                return token !== null;
            },
            getToken: function (){
                return token;
            }
        };
    }]);

})();