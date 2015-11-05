(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .factory('StatsNormaliser',[function () {

            var createEmptyWorkingDayData  = function (date, rawStatistics){
                var i,
                    rawStatisticsLength = rawStatistics.length,
                    data = {date: date.format('DD/MM/YYYY'), dateUS: date.format('M/D/YYYY'), userdata:[]};

                for (i=0; i< rawStatisticsLength; i++){
                    data.userdata.push({ user:rawStatistics[i].username, commits:0, pushes:0, pullRequests:0 });
                }
                return data;
            };

            var normalisePersonsWorkingDay = function(rawPersonDayStatistics, normalisedPersonDayStatistics){
                normalisedPersonDayStatistics.crossCheck = rawPersonDayStatistics;
                normalisedPersonDayStatistics.commits = rawPersonDayStatistics.commits;
                normalisedPersonDayStatistics.pullRequests = rawPersonDayStatistics.pullRequests;
                normalisedPersonDayStatistics.pushes = rawPersonDayStatistics.pushes;
            };

            var normaliseAllWorkingDaysForPerson = function(rawPersonStatistics, normalisedUserData, currentDate){
                var i,
                    dayDataLength = rawPersonStatistics.dayData.length;
                for(i = 0; i < dayDataLength; i++){
                    if(currentDate !== rawPersonStatistics.dayData[i].date){
                        continue;
                    }
                    //This indexing is predicated on the normalised stats users being in the same order as the raw data users
                    // Which it should be as the former is created from the latter§
                    normalisePersonsWorkingDay(rawPersonStatistics.dayData[i], normalisedUserData);
                    break;
                }
            };

            var normaliseWorkingDayData = function(rawStatistics, normalisedDayStatistics){
                var i,
                    rawStatisticsLength = rawStatistics.length;
                for(i=0; i < rawStatisticsLength; i++){

                    if(rawStatistics[i].dayData.length === 0){
                        continue;
                    }
                    normaliseAllWorkingDaysForPerson(rawStatistics[i], normalisedDayStatistics.userdata[i], normalisedDayStatistics.dateUS);
                }
            };

            return function(statisticsToConvert){
                var normalisedStatistics = [],
                    workingDate = moment().startOf('day').subtract(1, 'month'),
                    normalisedDayStatistics;

                while (workingDate <= moment().startOf('day')){
                    normalisedDayStatistics= createEmptyWorkingDayData(workingDate, statisticsToConvert);
                    normaliseWorkingDayData(statisticsToConvert, normalisedDayStatistics);
                    normalisedStatistics.push(normalisedDayStatistics);
                    workingDate.add(1,'day');
                }
                return normalisedStatistics;
            };
        }]);
})();