(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Admin.GithubUsers')
        .controller('GithubRepositoriesController', ['$scope', 'GithubRepositoryService', function($scope, githubRepositoryService){
            //TODO: common function
            var validateAndUpdate = function(fieldName, updateMethodName, githubRepository){
                if(!$scope.repoList.$dirty){
                    return;
                }
                if(githubRepository[fieldName]){
                    $scope.githubRepositoryService[updateMethodName](githubRepository);
                }
                else {
                    githubRepositoryService.getCurrentRepositories();
                }

            };

            $scope.githubRepositoryService = githubRepositoryService;

            $scope.updateRepositoryName = function (githubRepository){
                if(!githubRepository.repositoryname){
                    return;
                }
                validateAndUpdate('repositoryname', 'updateRepositoryName', githubRepository);
            };

            $scope.updateDescription = function (githubRepository){
                validateAndUpdate('description', 'updateDescription', githubRepository);
            };

            $scope.add = function(){
                if(!githubRepositoryService.newRepository.repositoryname){
                    return;
                }
                githubRepositoryService.addRepository();
            };

            $scope.remove = function(githubRepository){
                githubRepositoryService.removeRepository(githubRepository);
            };

            githubRepositoryService.setUpdateCallback(function(){
                if($scope.repoList){
                    $scope.repoList.$setPristine();
                }
            });

            githubRepositoryService.getCurrentRepositories();

        }]);
})();