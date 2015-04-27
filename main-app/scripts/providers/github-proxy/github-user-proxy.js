(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.GithubProxy')
        .service('GitHubUserProxy',['$http', 'GithubConstants', function($http, githubConstants){
        return function(username){
            return $http.get(githubConstants.rootUrl + 'users/' + username + '/events'+ githubConstants.secret);
        };
    }]);
})();