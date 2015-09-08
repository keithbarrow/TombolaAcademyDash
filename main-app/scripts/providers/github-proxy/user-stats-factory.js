
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.GithubProxy')
        .factory('UserStatsFactory', [function(){
            return function(username, data){

                var userStats  = {
                    username: username,
                    dayData: []
                };

                var convertDateStringKey = function(apiDate){
                    var date = new Date(apiDate);
                    return date.toLocaleDateString();
                };

                var dateMatch = function (element) {
                    return element.date ===createdDate;
                };

                var createDayData = function (date){
                    return {
                        date: date,
                        commits: 0,
                        pushes: 0,
                        pullRequests:0
                    };
                };

                for (var i=0; i < data.length; i++){
                    var datum = data[i];
                    if(datum.type ==='CreateEvent' || datum.actor.login !== username){
                        continue;
                    }
                    var createdDate = convertDateStringKey(datum.created_at);
                    var dayIndex  =userStats.dayData.findIndex(dateMatch);
                    if(dayIndex < 0){
                        userStats.dayData.push(createDayData(createdDate));
                        dayIndex = userStats.dayData.length -1;
                    }

                    if(datum.type === 'PullRequestEvent'){
                        userStats.dayData[dayIndex].pullRequests++;
                    }
                    else if(datum.type === 'PushEvent'){
                        userStats.dayData[dayIndex].pushes++;
                        userStats.dayData[dayIndex].commits += datum.payload.commits.length;
                    }
                }

                return userStats;
            };
        }]);
})();