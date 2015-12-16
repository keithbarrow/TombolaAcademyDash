(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.WaitingPulls')
        .factory('WaitingPullsModel',['$q', 'TaGithubRepositoryProxy', 'GithubRepoProxy', function ($q, taGithubRepositoryProxy, githubRepoProxy) {
            var WaitingPullsModel = function () {
                var me = this,
                    addError = function (error){
                        me.errors.push(error);
                    },
                    addWaitingPull = function (waitingPullsResult){
                        me.waitingPulls.push(waitingPullsResult);
                    },
                    requestPullsForUser = function (userRepositoryList, promises) {
                        var i;
                        for (i = 0; i < userRepositoryList.repositories.length; i++) {
                            promises.push(githubRepoProxy(userRepositoryList.username, userRepositoryList.repositories[i]));
                    }},

                    requestPulls = function(userRepositoryLists){
                        var i,
                            promises = [];
                        for (i = 0; i < userRepositoryLists.length; i++) {
                            requestPullsForUser(userRepositoryLists[i], promises);
                        }
                        return promises;
                    },

                    update = function (waitingPullsResults) {
                        for(var i = 0; i < waitingPullsResults.length; i++){
                            if(waitingPullsResults[i].isError){
                                addError(waitingPullsResults[i].data);
                            }
                            else if(waitingPullsResults[i].pullRequests){
                                waitingPullsResults[i].pullRequests = _.sortBy(waitingPullsResults[i].pullRequests, 'created');
                                addWaitingPull(waitingPullsResults[i]);
                            }
                        }
                    };

                me.waitingPulls = [];
                me.errors = [];

                me.refresh = function(){
                    var deferred = $q.defer();
                    me.waitingPulls = [];
                    me.errors = [];
                    taGithubRepositoryProxy.getRepositoriesToCheck().then(function(userRepositoryList){
                        $q.all(requestPulls(userRepositoryList)).
                            then(function(waitingPullsResult){
                                update(waitingPullsResult);
                                deferred.resolve();
                            })
                            .catch(function(message){
                                deferred.reject(message);
                            });
                    });
                    return deferred.promise;

                };
            };
            return new WaitingPullsModel();
        }]);
})();

