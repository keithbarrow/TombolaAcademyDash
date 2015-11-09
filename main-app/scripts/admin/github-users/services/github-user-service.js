(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Admin.GithubUsers')
        .service('GithubUserService', ['TaGithubUserProxy','ApiDataConverter', function(taGithubUserProxy, apiDataConverter){
            var me= this,
                updateCallback;
            me.githubUsers = [];
            me.newUser = {};

            me.resetNewUser = function(){
                me.newUser = {
                    username:'',
                    forename:'',
                    surname:''
                };
            };

            me.getCurrentUsers = function() {
                taGithubUserProxy.get(apiDataConverter.getJson)
                    .then(function (data) {
                        me.githubUsers = data;
                        if(updateCallback){
                            updateCallback();
                        }
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.updateUser = function(id, update){
                taGithubUserProxy.update(id, update)
                    .then(function(){
                        me.getCurrentUsers();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.updateUsername = function(user){
                if(!user.username){
                    return;
                }
                me.updateUser(user.id, {username: user.username});
            };

            me.updateForename = function(user){
                if(!user.forename){
                    return;
                }
                me.updateUser(user.id, {forename: user.forename});
            };

            me.updateSurname = function(user){
                if(!user.surname){
                    return;
                }
                me.updateUser(user.id, {surname: user.surname});
            };

            me.toggleInclude = function(user){
                me.updateUser(user.id, {includeinstats: !user.includeinstats[0]});
            };

            me.addUser = function(){
                taGithubUserProxy.add(me.newUser)
                    .then(function(){
                        me.resetNewUser();
                        me.getCurrentUsers();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.removeUser = function(user){
                taGithubUserProxy.remove(user.id)
                    .then(function(){
                        me.getCurrentUsers();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.setUpdateCallback = function(callback){
                updateCallback = callback;
            };

            me.resetNewUser();
        }]);
})();
