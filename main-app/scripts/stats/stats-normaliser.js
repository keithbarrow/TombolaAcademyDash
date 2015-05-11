(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .factory('StatsNormaliser',[function () {
            return function(rawStatistics){
                var me = this,
                    i,
                    rawStatisticsLength = rawStatistics.length,
                    statsStarted = false,
                    normalisedStatistics = {},
                    now = moment().startOf('day'),
                    workingDate = now.subtract(1, 'years');

                console.log(rawStatistics);

                while (workingDate <= now){
                    //for( i = 0; i <  rawStatisticsLength; i++) {
                //      var username =  userInformation.users[i];
                //      usersStats[username] = {pullRequests:0, pushRequests:{pushes:0, commits:0}};
                    //}
                //
                //        usersStats.date = currentDate.toDate();
                //        var key = currentDate.format('DD/MM/YYYY');
                //        me.statisticsOrder.push(key);
                //        me.statistics[key] = usersStats;
                    workingDate.add(1,'day');
                }
                return normalisedStatistics;
            };
        }]);
})();