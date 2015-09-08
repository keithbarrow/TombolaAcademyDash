(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('UserInformation', ['$http', 'TokenService', function($http, tokenService){
            return {
                //TODO: ferry off URLS somewhere
                //TODO: get repos call
                getRepositoriesToCheck: function(){
                    return [
                        {username: 'Davros2106', repositories: ['NoughtsAndCrossesClient']},
                        {username: 'Koolaidman64', repositories: ['NoughtsAndCrosses']},
                        {username: 'SalamanderMan', repositories: ['NoughtsAndCrosses']},
                    ];
                },
                getUsers: function (){
                    var request = {
                        method: 'GET',
                        url: 'https://localhost:3000/api/githubusers',
                        headers:{
                            'x-access-token': tokenService.getToken()
                        }
                    };
                    return $http(request);
                }
            };
    }]);
})();