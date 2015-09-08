(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .factory('StatsModel',['$q', 'GitHubUserProxy', 'UserInformation', 'StatsNormaliser', function ($q, gitHubUserProxy, userInformation, statsNormaliser) {
            var rawStatistics = [],
                getDataForUser = function (username){
                    var deferred = $q.defer();
                    gitHubUserProxy(username).then(function(userStats){
                        rawStatistics.push(userStats);
                        deferred.resolve();
                    })
                    .catch(function(error){
                        deferred.reject(error);
                    });
                    return deferred.promise;
                },
                processUsers = function(users){
                    var promises = [],
                        i;
                    for (i = 0; i < users.length; i++) {
                        console.log(users[i].username);
                        promises.push(getDataForUser(users[i].username));
                    }
                    return promises;
                };
            return {
                getData: function(){
                    var deferred = $q.defer();
                    userInformation.getUsers().then(function(data){
                        var promises = processUsers(data.data.json);
                        $q.all(promises)
                            .then(function(){
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