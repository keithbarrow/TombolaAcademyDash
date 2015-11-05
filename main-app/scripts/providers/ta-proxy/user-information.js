(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('UserInformation', ['$http', '$q', 'TokenService', function($http, $q, tokenService){
            var callServer = function (request, successTransform, failTransform){
                var deferred = $q.defer();
                $http(request).then(function(response){
                    if(successTransform){
                        deferred.resolve(successTransform(response));
                    }
                    else{
                        deferred.resolve(response);
                    }
                }).catch(function(response){
                    //TODO: log
                    if(failTransform) {
                        deferred.reject(failTransform(response));
                    }
                    else{
                        deferred.reject(response);
                    }
                });
                return deferred.promise;
            };

            return {
                //TODO: ferry off URLS somewhere
                //TODO: get repos call
                getRepositoriesToCheck: function(){
                    return [
                        {username: 'IanMcLeodTombola', repositories: ['Tombola.Games.NoughtsAndCrosses']},
                        {username: 'kathHen', repositories: ['NoughtsandCrosses']},
                        {username: 'SalamanderMan', repositories: ['NoughtsAndCrosses']}
                    ];
                },

                getUsers: function (successTransform, failTransform){
                    var request = {
                            method: 'GET',
                            url: 'https://localhost:3000/api/githubusers',
                            headers:{
                                'x-access-token': tokenService.getToken()
                            }
                        };
                    return callServer(request, successTransform, failTransform);
                },

                updateUser: function(id, updateObject, successTransform, failTransform) {
                    var request = {
                        method: 'PUT',
                        url: 'https://localhost:3000/api/githubusers/'+ id,
                        headers:{
                            'x-access-token': tokenService.getToken()
                        },
                        data: updateObject
                    };
                    return callServer(request, successTransform, failTransform);
                },

                addUser: function(newUser, successTransform, failTransform){
                    var request = {
                        method: 'POST',
                        url: 'https://localhost:3000/api/githubusers',
                        headers:{
                            'x-access-token': tokenService.getToken()
                        },
                        data: newUser
                    };
                    return callServer(request, successTransform, failTransform);
                },
                removeUser: function(id, successTransform, failTransform){
                    var request = {
                        method: 'DELETE',
                        url: 'https://localhost:3000/api/githubusers/' + id,
                        headers:{
                            'x-access-token': tokenService.getToken()
                        }
                    };
                    return callServer(request, successTransform, failTransform);
                }
            };
    }]);
})();