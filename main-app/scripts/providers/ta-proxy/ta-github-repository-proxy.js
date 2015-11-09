(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('TaGithubRepositoryProxy', ['$q', 'TaBaseProxy', 'TaGithubUserProxy', 'ApiDataConverter', function($q, TaBaseProxy, taGithubUserProxy, apiDataConverter){

            var proxy = new TaBaseProxy('githubrepositories');
            return {
                getRepositoriesToCheck: function(){
                    var deferred = $q.defer(),
                        promises = [taGithubUserProxy.get(apiDataConverter.getJson), this.get(apiDataConverter.getJson)],
                        getRepositoriesForUserId = function(githubRepositories, userId){
                            return _.filter(githubRepositories, function(githubRepository) {
                                return githubRepository.githubuserid == userId;
                            });
                        },
                        createRepositoryEntryForUser = function(githubUser, githubRepositories){
                            var repositoriesForUser = getRepositoriesForUserId(githubRepositories, githubUser.id);
                            if(repositoriesForUser.length === 0){
                                return;
                            }
                            return {
                                username: githubUser.username,
                                repositories:_.map(repositoriesForUser, function(repository){
                                    return repository.repositoryname;
                                })
                            };
                        },
                        collateRepositories = function (githubUsers, githubRepositories){
                            var currentEntry,
                                i,
                                repositoriesToGet =[];
                            for(i=0; i< githubUsers.length; i++){
                                currentEntry = createRepositoryEntryForUser(githubUsers[i], githubRepositories);
                                if(!currentEntry){
                                    continue;
                                }
                                repositoriesToGet.push(currentEntry);
                            }
                            return repositoriesToGet;
                    };

                    //TODO: this could all be improved by allowing where clauses - need to investigate syntax and poss available parser...
                    //TODO: ODATA looked promising, also https://parse.com/docs/rest/guide/
                    $q.all(promises).then(function(results){
                        deferred.resolve(collateRepositories(results[0], results[1]));
                    });
                    return deferred.promise;
                },

                get: proxy.get,
                update: proxy.update,
                add: proxy.add,
                remove: proxy.remove
            };
        }]);
})();