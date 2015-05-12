(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .factory('StatsNormaliser',[function () {

            var createDayData  = function (date, users){
                var i,
                    numberUsers = users.length,
                    data = {date: date, userdata:[]};

                for (i=0; i<numberUsers; i++){
                    data.userdata.push({ user:users[i], commits:0, pushes:0, pullRequests:0 });
                }
                return data;
            };

            var getUsers = function(rawStatistics){
                var i,
                    numberOfUsers = rawStatistics.length,
                    usernames= [];

                for (i=0; i < numberOfUsers; i++){
                    usernames.push(rawStatistics[i].username);
                }
                return usernames;
            };

            return function(rawStatistics){

                var i,
                    j,
                    rawStatisticsLength = rawStatistics.length,
                    normalisedStatistics = [],
                    now = moment().startOf('day'),
                    workingDate = moment().startOf('day').subtract(1, 'years'),
                    workingDateString,
                    workingData,
                    started = false,
                    usernames = getUsers(rawStatistics);

                function populateUserData() {
                    for (j = 0; j < userStats.dayData.length; j++) {
                        if (userStats.dayData[j].date == workingDateString) {
                            workingData.userdata[i].crossCheck = userStats;
                            workingData.userdata[i].commits = userStats.dayData[j].commits;
                            workingData.userdata[i].pullRequests = userStats.dayData[j].pullRequests;
                            workingData.userdata[i].pushes = userStats.dayData[j].pushes;
                            started = true;
                            break;
                        }
                    }
                }

                while (workingDate <= now){
                    workingDateString = workingDate.format('DD/MM/YYYY');
                    workingData = createDayData(workingDateString, usernames);

                    for( i = 0; i <  rawStatisticsLength; i++) {
                        var userStats =  rawStatistics[i];
                        populateUserData();
                    }
                    if(started){
                        normalisedStatistics.push(workingData);
                    }
                    workingDate.add(1,'day');
                }
                return normalisedStatistics;
            };
        }]);
})();