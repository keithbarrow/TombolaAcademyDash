(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Authentication')
        .service('TokenService', ['$state', function ($state){
            var token = null;

            return {
                isAuthenticated : function(){
                    return token !== null;
                },
                getToken: function (){
                    return token;
                },
                setToken: function(newToken){
                    token = newToken;
                    if(this.isAuthenticated()){
                        $state.go('waitingPulls'); //No sense of where user was going...
                    }
                    else{
                        $state.go('login');
                    }
                },
                resetToken: function(){
                    this.setToken(null);
                }
            };
        }]);

})();