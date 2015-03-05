'use strict';

angular.module('Tombola.Academy.Dash.Stats', [])

.controller('StatsController', function($scope, $http, $q) {
        $scope.users = ['Davros2106', /*'DeclanT',*/ 'Koolaidman64', 'LewisGardner25', 'SalamanderMan'];
        $scope.statistics = {};
        $scope.statisticsOrder = [];


        var convertDateStringKey = function(apiDate){
            var date = new Date(apiDate);
            return date.toLocaleDateString();
        };

        var processPullRequest = function (username, pullRequest){
            if(pullRequest.payload.action !== 'opened'){
                      return;
            }
            var dateKey = convertDateStringKey(pullRequest.created_at);
            $scope.statistics[dateKey][username].pullRequests++;
        };

        var processPush = function(username, pullRequest){
            var dateKey = convertDateStringKey(pullRequest.created_at);
            $scope.statistics[dateKey][username].pushRequests.pushes++;
            $scope.statistics[dateKey][username].pushRequests.commits += pullRequest.payload.commits.length;
        };

        var getDataForUser = function (username){
            var deferred = $q.defer();
            $http.get('https://api.github.com/users/' + username + '/events?client_id=fe13088b37cb2cd28583&client_secret=28ea47383843b41f7c2a5a246ece82cead02db72')
                .success(function(events){
                    for (var i = 0; i < events.length; i++) {
                        var currentEvent =events[i];
                        if (currentEvent.type == 'PullRequestEvent'){
                            processPullRequest(username, currentEvent);
                        }
                        else if(currentEvent.type == 'PushEvent') {
                            processPush(username, currentEvent);
                        }
                    }
                  deferred.resolve();
                });
            return deferred.promise;
        }




        var initialise = function(){
            //Creates a full year's worth of dates, ready for you to insert your data.
            var now = moment().startOf('day');
            var currentDate = moment().startOf('day').subtract(1, 'years')
            while (currentDate <= now){

                var usersStats = {};
                for(var i = 0; i<  $scope.users.length; i++){
                    var username =  $scope.users[i];
                    usersStats[username] = {pullRequests:0, pushRequests:{pushes:0, commits:0}};
                }

                usersStats.date = currentDate.toDate();
                var key = currentDate.format('DD/MM/YYYY');
                $scope.statisticsOrder.push(key);
                $scope.statistics[key] = usersStats;
                currentDate.add(1,'day');
            }
        }

        var clean = function(){
            var daysToRemove = 0;
            for(var i=0; i< $scope.statisticsOrder .length; i++)
            {
                var currentDay = $scope.statisticsOrder[i];
                var row = $scope.statistics[currentDay];
                var sum = 0;

                for(var j =0; j < $scope.users.length; j++)
                {
                    var userData = row[$scope.users[j]];
                    sum += userData.pullRequests;
                    sum += userData.pushRequests.pushes;
                    sum += userData.pushRequests.commits;
                }
                if(sum == 0){
                    delete $scope.statistics[currentDay];
                    daysToRemove++;
                }
                else
                {
                    break;
                }
            }
            $scope.statisticsOrder.splice(0, daysToRemove);
        }

        var refresh = function(){
            initialise();
            var promises = [];

            for(var i = 0; i<   $scope.users.length; i++){
                var username = $scope.users[i];
                promises.push(getDataForUser(username));
            }
            $q.all(promises).then(clean);
        }

        refresh();

});