(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.WaitingPulls')
        .factory('WaitingPullsModel',['$q', 'UserInformation', 'GithubRepoProxy', function ($q, userInformation, githubRepoProxy) {
            var WaitingPullsModel = function (data) {
                var me = this;
                var repositoriesToCheck = userInformation.getRepositoriesToCheck();
                me.waitingPulls = [];
                me.errors = [];

                var requestPulls = function(){
                    var i,
                        j,
                        promises = [];

                    for (i = 0; i < repositoriesToCheck.length; i++) {
                        for (j = 0; j < repositoriesToCheck[i].repositories.length; j++) {
                            promises.push(githubRepoProxy(repositoriesToCheck[i].username, repositoriesToCheck[i].repositories[j]));
                        }
                    }
                    return promises;
                };

                var update = function (waitingPullsResult) {
                    me.waitingPulls = [];
                    me.errors = [];
                    for(var i = 0; i < waitingPullsResult.length; i++){
                        if(waitingPullsResult[i].isError){
                            me.errors.push(waitingPullsResult[i].data);
                        }
                        else if(waitingPullsResult[i].pullRequests){
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

