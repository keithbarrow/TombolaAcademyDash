(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.GithubProxy')
        .service('GithubRepoProxy',['$http', '$q', 'GithubConstants', 'PullRequestInformationFactory', function($http, $q, githubConstants, pullRequestInformationFactory){
        return function(username, repositoryName){
            var deferred = $q.defer();
            $http.get(githubConstants.rootUrl + 'repos/' + username + '/' + repositoryName + '/pulls' + githubConstants.secret)
                .success(function(data){
                    deferred.resolve(pullRequestInformationFactory(data));
                })
                .catch(function(){
                    deferred.reject('Repo Proxy Error');
                });

            return deferred.promise;
        };
    }]);
})();