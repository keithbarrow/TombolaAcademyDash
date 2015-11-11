(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Authentication')
        .service('Authenticator', ['$http', 'API_URLS', 'TokenService', function ($http, apiUrls, tokenService){
        return {
            login: function(username, password){
                    var request = {
                        method: 'POST',
                        url: apiUrls.authentication,
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