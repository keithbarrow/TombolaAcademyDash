(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.GithubProxy')
        .service('GitHubUserProxy',['$http', '$q', 'UserStatsFactory', 'GithubConstants', function($http, $q, userStatsFactory, githubConstants){
        return function(username){
            var deferred = $q.defer();
            $http.get(githubConstants.rootUrl + 'users/' + username + '/events'+ githubConstants.secret)
                .then(function(data){
                    deferred.resolve(userStatsFactory(username, data.data));
                })
                .catch(function(){
                    deferred.resolve({isError: true, data: {username: username}});
                });
            return deferred.promise;
        };
    }]);
})();