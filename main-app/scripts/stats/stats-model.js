(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .factory('StatsModel',['$q', 'GitHubUserProxy', 'UserInformation', 'StatsNormaliser', function ($q, gitHubUserProxy, userInformation, statsNormaliser) {
            var StatsModel = function(){

                var me = this;
                var rawStatistics = [];
                me.statistics = [];

                var getDataForUser = function (username){
                    var deferred = $q.defer();
                    gitHubUserProxy(username)
                        .then(function(userStats){
                            rawStatistics .push(userStats);
                            deferred.resolve();
                        })
                        .catch(function(error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                };

                me.refresh = function() {
                    var promises = [];
                    for (var i = 0; i < userInformation.users.length; i++) {
                        promises.push(getDataForUser(userInformation.users[i]));
                    }

                    $q.all(promises).then(function(data){
                        me.statistics = statsNormaliser(rawStatistics);
                    });
                };
            };
            return new StatsModel();
    }]);
})();