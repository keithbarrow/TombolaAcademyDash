(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .factory('StatsModel',['$q', 'GitHubUserProxy', 'UserInformation', 'StatsNormaliser', function ($q, gitHubUserProxy, userInformation, statsNormaliser) {
            var StatsModel = function(){

                var me = this;
                me.statistics = [];
                me.statisticsOrder = userInformation.users;

                var getDataForUser = function (username){
                    var deferred = $q.defer();
                    gitHubUserProxy(username)
                        .then(function(userStats){
                            me.statistics.push(userStats);
                            deferred.resolve();
                        })
                        .catch(function(error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                };

                //var normalise = function(){
                //    //Creates a full year's worth of dates, ready for you to insert your data.
                //    var now = moment().startOf('day');
                //    var currentDate = moment().startOf('day').subtract(1, 'years');
                //    while (currentDate <= now){
                //
                //        var usersStats = {};
                //        for(var i = 0; i<  userInformation.users.length; i++){
                //            var username =  userInformation.users[i];
                //            usersStats[username] = {pullRequests:0, pushRequests:{pushes:0, commits:0}};
                //        }
                //
                //        usersStats.date = currentDate.toDate();
                //        var key = currentDate.format('DD/MM/YYYY');
                //        me.statisticsOrder.push(key);
                //        me.statistics[key] = usersStats;
                //        currentDate.add(1,'day');
                //    }
                //};

                me.refresh = function() {
                    var promises = [];
                    for (var i = 0; i < userInformation.users.length; i++) {
                        promises.push(getDataForUser(userInformation.users[i]));
                    }

                    $q.all(promises).then(function(data){
                        statsNormaliser(me.statistics);
                    });
                };
            };
            return new StatsModel();
    }]);
})();