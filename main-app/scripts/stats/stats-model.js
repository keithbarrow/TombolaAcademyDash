(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .factory('StatsModel',['$q', 'GitHubUserProxy', 'ApiDataConverter', 'UserInformation', 'StatsNormaliser', function ($q, gitHubUserProxy, apiDataConverter, userInformation, statsNormaliser) {
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
                        //TODO: also - this doesn't seem to work....
                        if(!githubUsers[i].includeinstats){
                            continue;
                        }
                        promises.push(getDataForUser(githubUsers[i].username));
                    }
                    return promises;
                };

            return {
                getData: function(){
                    var deferred = $q.defer();
                    userInformation.getUsers(apiDataConverter.getJson).then(function(results){
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