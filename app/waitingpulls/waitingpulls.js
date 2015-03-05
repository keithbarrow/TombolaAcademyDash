'use strict';

angular.module('Tombola.Academy.Dash.WaitingPulls', [])

.factory('pullRequestInformationFactory', function(){
  var pullRequestInformation = function(data){
    var pullRequestInformation = {};
    function getUserInformation(userData){
      pullRequestInformation.login = userData.login;
      pullRequestInformation.avatarUrl = userData.avatar_url;
      pullRequestInformation.htmlUrl = userData.html_url;

    }

    function getRepositoryInformation(respositoryData){
      pullRequestInformation.repositoryName = respositoryData.name;
      pullRequestInformation.repositoryHtmlUrl = respositoryData.html_url;
    }

    function addPullRequestInformation(pullRequestData){
      pullRequestInformation.pullRequests.push({
            htmlUrl: pullRequestData.html_url,
            state: pullRequestData.state,
            title: pullRequestData.title,
            body: pullRequestData.body,
            created: pullRequestData.created_at
      });
    }

    for(var i = 0; i< data.length; i++){
      if(i===0){
        getUserInformation(data[0].user);
        getRepositoryInformation(data[0].base.repo);
        pullRequestInformation.pullRequests = [];
      }
      addPullRequestInformation(data[i]);
    }

    return pullRequestInformation;
  }
  return pullRequestInformation;

})

.controller('WaitingPullsController', function($scope,$rootScope, $http, $interval, $q, pullRequestInformationFactory) {
  $scope.pullRequestsBreakdowns = [];
  $scope.timerClass='';

  $scope.repositoriesToCheck = [
    {username:'Davros2106',repositories:['NoughtsAndCrossesClient']},
    {username:'Koolaidman64',repositories:['NoughtsAndCrosses']},
    {username:'LewisGardner25',repositories:['NoughtsAndCrosses']},
    {username:'SalamanderMan',repositories:['NoughtsAndCrosses']}
  ];

  var intervalPromise;
  var refresh = function(){
    $scope.pullRequestsBreakdowns = [];
      $scope.timerClass='';
    for(var i = 0; i< $scope.repositoriesToCheck.length; i++)
    {
      var username = $scope.repositoriesToCheck[i].username;
      for(var j= 0; j<  $scope.repositoriesToCheck[i].repositories.length; j++){
        var repositoryName = $scope.repositoriesToCheck[i].repositories[j];
        $http.get('https://api.github.com/repos/' + username + '/' + repositoryName + '/pulls?client_id=fe13088b37cb2cd28583&client_secret=28ea47383843b41f7c2a5a246ece82cead02db72')
            .success(function(data, status, headers){
              if(data.length >0) {
                $scope.pullRequestsBreakdowns.push(pullRequestInformationFactory(data));
              }
            });
      }
    }
    $scope.timerClass='nyantimer';
  };

  var startPolling = function(){
    intervalPromise = $interval(function(){
          refresh();
        }, 5 * 60 * 1000
    );
  };

  $rootScope.$on('$routeChangeSuccess', function(event, toRoute){
    if(toRoute.$$route.controller ==='WaitingPullsController'){
      refresh();
    }
    else{
      $interval.cancel(intervalPromise);
    }
  });


  refresh();
  startPolling();

});
