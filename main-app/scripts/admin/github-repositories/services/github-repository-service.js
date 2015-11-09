(function () {
    'use strict';
    //TODO: Module names out of whack *****************************
    angular.module('Tombola.Academy.Dash.Admin.GithubUsers')
        .service('GithubRepositoryService', ['TaGithubRepositoryProxy', 'TaGithubUserProxy', 'ApiDataConverter',
            function(taGithubRepositoryProxy, taGithubUserProxy, apiDataConverter){
            var me= this,
                updateCallback;
            me.githubRepositories = [];
            me.githubUsers = [];
            me.newRepository = {};

            me.resetNewRepository = function(){
                me.newRepository = {
                    repositoryname:'',
                    description:'',
                    githubuserid:me.githubUsers[0].id
                };
            };

            me.getCurrentRepositories = function() {
                taGithubRepositoryProxy.get(apiDataConverter.getJson)
                    .then(function (data) {
                        me.githubRepositories = _.forEach(data, function(repository){
                            repository.username = (_.find(me.githubUsers, 'id', repository.githubuserid)).username;
                        });
                        if(updateCallback){
                            updateCallback();
                        }
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.updateRepository = function(id, update){
                taGithubRepositoryProxy.update(id, update)
                    .then(function(){
                        me.getCurrentRepositories();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.updateRepositoryName = function(repository){
                me.updateRepository(repository.id, {repositoryname: repository.repositoryname});
            };

            me.updateDescription = function(repository){
                me.updateRepository(repository.id, {description: repository.description});
            };


            me.addRepository = function(){
                taGithubRepositoryProxy.add(me.newRepository)
                    .then(function(){
                        me.resetNewRepository
                        ();
                        me.getCurrentRepositories();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.removeRepository = function(githubrepository){
                taGithubRepositoryProxy.remove(githubrepository.id)
                    .then(function(){
                        me.getCurrentRepositories();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.setUpdateCallback = function(callback){
                updateCallback = callback;
            };

            taGithubUserProxy.get(apiDataConverter.getJson).then(function(data){
                me.githubUsers = _.sortBy(data, 'username');
                me.resetNewRepository();
            });

        }]);
})();
