(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.WaitingPulls')
        .factory('WaitingPullsModel',['$q', 'UserInformation', 'GithubRepoProxy', function ($q, userInformation, githubRepoProxy) {
            var WaitingPullsModel = function (data) {
                var me = this;
                var repositoriesToCheck = userInformation.getRepositoriesToCheck();
                me.waitingPulls = [];

                var requestPulls = function(){
                    var promises = [];

                    for (var i = 0; i < repositoriesToCheck.length; i++) {
                        var username = repositoriesToCheck[i].username;
                        for (var j = 0; j < repositoriesToCheck[i].repositories.length; j++) {
                            var repositoryName = repositoriesToCheck[i].repositories[j];
                            promises.push(githubRepoProxy(username, repositoryName));
                        }
                    }

                    return promises;
                };

                var update = function (waitingPullsResult) {
                    me.waitingPulls = [];
                    for(var i = 0; i < waitingPullsResult.length; i++){
                        if(waitingPullsResult[i].pullRequests){
                            me.waitingPulls.push(waitingPullsResult[i]);
                        }
                    }
                };

                me.refresh = function(){
                    var deferred = $q.defer();
                    $q.all(requestPulls()).
                        then(function(waitingPullsResult){
                            update(waitingPullsResult);
                            deferred.resolve();
                        })
                        .catch(function(message){
                            deferred.reject(message);
                        });
                    return deferred.promise;
                };

            };
            return new WaitingPullsModel();

        }]);
})();

