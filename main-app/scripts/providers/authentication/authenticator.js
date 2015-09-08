(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Authentication')
        .service('Authenticator', ['$http', 'TokenService', function ($http, tokenService){
        return {
            login: function(username, password){
                    var request = {
                        method: 'POST',
                        url: 'https://localhost:3000/authenticate',
                        withCredentials: false,
                        data: {"username":username, "password":password}
                    };
                    $http(request).success(function(data){
                        if(data.success){
                            tokenService.setToken(data.token);
                        }
                        else{
                            tokenService.resetToken();
                        }
                    })
                    .error(function(data, status) {
                        console.log(data);
                        console.log(status);
                        tokenService.resetToken();
                    });

            },
            logout: function() {
                tokenService.resetToken();
            }
        };
    }]);

})();