(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .factory('StatsModel',['$q', 'TaGithubUserProxy', 'ApiDataConverter', 'GitHubUserProxy', 'StatsNormaliser', function ($q, taGithubUserProxy, apiDataConverter, gitHubUserProxy, statsNormaliser) {
            var getDataForUser = function (username){
                    var deferred = $q.defer();
                    gitHubUserProxy(username).then(function(userStats){
                        deferred.resolve(userStats);
                    })
                    .catch(function(error){
                        deferred.reject();
                    });
                    return deferred.promise;
                },
                getDataForUsers = function(githubUsers){
                    var promises = [],
                        i;
                    for (i = 0; i < githubUsers.length; i++) {
                        //TODO: add select on to API and do that instead.
                        if(githubUsers[i].includeinstats[0]){
                            promises.push(getDataForUser(githubUsers[i].username));
                        }
                    }
                    return promises;
                };

            return {
                getData: function(){
                    var deferred = $q.defer();
                    taGithubUserProxy.get(apiDataConverter.getJson).then(function(results){
                        $q.all(getDataForUsers(results))

                            .then(function(rawStatistics){
                                deferred.resolve(statsNormaliser(rawStatistics));
                            })
                            .catch(function(){
                                deferred.reject();
                            });
                    });
                    return deferred.promise;
                }
            };
    }]);
})();