(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Admin.GithubUsers')
        .controller('GithubUsersController', ['$scope', 'GithubUserService', function($scope, githubUserService){

            var validateAndUpdate = function(fieldName, updateMethodName, githubUser){
                if(!$scope.userList.$dirty){
                    return;
                }
                if(githubUser[fieldName]){
                    $scope.githubUserService[updateMethodName](githubUser);
                }
                else {
                    githubUserService.getCurrentUsers();
                }

            };

            $scope.githubUserService = githubUserService;

            $scope.updateUsername = function (githubUser){
                validateAndUpdate('username', 'updateUsername', githubUser);
            };

            $scope.updateForename = function (githubUser){
                validateAndUpdate('forename', 'updateForename', githubUser);
            };

            $scope.updateSurname = function (githubUser){
                validateAndUpdate('surname', 'updateSurname', githubUser);
            };

            $scope.add = function(){
                if(!githubUserService.newUser.username || !githubUserService.newUser.forename || !githubUserService.newUser.surname ){
                    return;
                }
                githubUserService.addUser();
            };

            $scope.remove = function(githubUser){
                githubUserService.removeUser(githubUser);
            };

            githubUserService.setUpdateCallback(function(){
                if($scope.userList){
                    $scope.userList.$setPristine();
                }
            });

            githubUserService.getCurrentUsers();

        }]);
})();