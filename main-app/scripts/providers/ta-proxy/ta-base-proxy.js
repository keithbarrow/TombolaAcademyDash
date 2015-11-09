(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .factory('TaBaseProxy', ['$http', '$q', 'TokenService', function($http, $q, tokenService){
            return function(tablename) {
                var me = this,
                    baseUrl = 'https://localhost:3000/api/', //TODO: inject via config
                    getTableUrl = function() {
                        return baseUrl+ tablename;
                    },
                    getTableUrlWithId = function(id) {
                        return getTableUrl() + '/' + id;
                    },
                    getRequestHeader = function(){
                        return {
                            'x-access-token': tokenService.getToken()
                        };
                    },

                    createRequest = function(method, id, data){
                        var request = {
                            method: method,
                            url: id ? getTableUrlWithId(id) : getTableUrl(),
                            headers: getRequestHeader()
                        };
                        if (data){
                            request.data  = data;
                        }
                        return request;
                    },

                    callApi = function (request, successTransform, failTransform){
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


                me.get = function (successTransform, failTransform){
                    var request = createRequest('GET');
                    return callApi(request, successTransform, failTransform);
                };

                me.update = function(id, updateObject, successTransform, failTransform) {
                    var request = createRequest('PUT', id, updateObject);
                    return callApi(request, successTransform, failTransform);
                };

                me.add = function(newObject, successTransform, failTransform){
                    var request = createRequest('POST', null, newObject);
                    return callApi(request, successTransform, failTransform);
                };

                me.remove = function(id, successTransform, failTransform){
                    var request = createRequest('DELETE', id);
                    return callApi(request, successTransform, failTransform);
                };
            };
    }]);
})();