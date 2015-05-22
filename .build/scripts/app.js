(function () {
    'use strict';

    //TODO: Shift to somewhere sensible like a polyfill file...
    // Production steps of ECMA-262, Edition 5, 15.4.4.14
    if (!Array.prototype.findIndex) {
        Array.prototype.findIndex = function(predicate) {
            if (this === null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        };
    }

    angular.module('Tombola.Academy.Dash.TaProxy', []);
    angular.module('Tombola.Academy.Dash.GithubProxy', ['Tombola.Academy.Dash.GithubProxy']);
    angular.module('Tombola.Academy.Dash.WaitingPulls', ['Tombola.Academy.Dash.GithubProxy']);
    angular.module('Tombola.Academy.Dash.Stats', ['Tombola.Academy.Dash.TaProxy']);

    angular.module('myApp', [
        'ui.router',
        'Tombola.Academy.Dash.WaitingPulls',
        'Tombola.Academy.Dash.Stats'
    ]);
})();
(function () {
    'use strict';
    angular.module('myApp').config( function($stateProvider) {
        $stateProvider
            .state('waitingPulls', {
                templateUrl: 'partials/waitingpulls.html',
                controller:  'WaitingPullsController'
            })
            .state('stats', {
                templateUrl: 'partials/stats.html',
                controller:  'StatsController'
            });
    });
})();
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.GithubProxy').constant('GithubConstants', {
            rootUrl: 'https://api.github.com/',
            secret: '?client_id=fe13088b37cb2cd28583&client_secret=28ea47383843b41f7c2a5a246ece82cead02db72'
        }
    );
})();
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
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.GithubProxy')
        .service('GitHubUserProxy',['$http', '$q', 'UserStatsFactory', 'GithubConstants', function($http, $q, userStatsFactory, githubConstants){
        return function(username){
            var deferred = $q.defer();
            $http.get(githubConstants.rootUrl + 'users/' + username + '/events'+ githubConstants.secret)
                .then(function(data){
                    deferred.resolve(userStatsFactory(username, data.data));
                })
                .catch(function(){
                    deferred.reject('User Proxy Error');
                });
            return deferred.promise;
        };
    }]);
})();
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('UserInformation', function(){
            var UserInfo = function() {
                var me = this;
                me.users = ['Davros2106', /*'DeclanT',*/ 'Koolaidman64', 'LewisGardner25', 'SalamanderMan'];

                me.repositoriesToCheck = [
                    {username: 'Davros2106', repositories: ['NoughtsAndCrossesClient']},
                    {username: 'Koolaidman64', repositories: ['NoughtsAndCrosses']},
                    {username: 'LewisGardner25', repositories: ['NoughtsAndCrosses']},
                    {username: 'SalamanderMan', repositories: ['NoughtsAndCrosses']},

                    {username: 'Matthew-Gilmore', repositories: ['HendonHerald', 'NoughtsAndCrosses']},
                    {username: 'JakeArkleyTombola', repositories: ['NoughtsAndCrosses']},
                    {username: 'matthew-english', repositories: ['Noughts-and-Crosses']}
                ];
            };
            return new UserInfo();
    });
})();
(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.WaitingPulls')
        .factory('WaitingPullsModel',['$q', 'UserInformation', 'GithubRepoProxy', function ($q, userInformation, githubRepoProxy) {
            var WaitingPullsModel = function (data) {
                var me = this;
                var repositoriesToCheck = userInformation.repositoriesToCheck;
                me.waitingPulls = [];

                var requestPulls = function(){
                    var promises = [];

                    for (var i = 0; i < repositoriesToCheck.length; i++) {
                        var username = repositoriesToCheck[i].username;
                        for (var j = 0; j < repositoriesToCheck[i].repositories.length; j++) {
                            var repositoryName = repositoriesToCheck[i].repositories[j];
                            promises.push(githubRepoProxy(username, repositoryName));
                        }
                    }

                    return promises;
                };

                var update = function (waitingPullsResult) {
                    me.waitingPulls = [];
                    for(var i = 0; i < waitingPullsResult.length; i++){
                        if(waitingPullsResult[i].pullRequests){
                            me.waitingPulls.push(waitingPullsResult[i]);
                        }
                    }
                };

                me.refresh = function(){
                    var deferred = $q.defer();
                    $q.all(requestPulls()).
                        then(function(waitingPullsResult){
                            update(waitingPullsResult);
                            deferred.resolve();
                        })
                        .catch(function(message){
                            deferred.reject(message);
                        });
                    return deferred.promise;
                };

            };
            return new WaitingPullsModel();

        }]);
})();


(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.WaitingPulls')
        .factory('PullRequestInformationFactory', function () {
            var pullRequestInformation = function (data) {
                var pullRequestInformation = {};

                function getUserInformation(userData) {
                    pullRequestInformation.login = userData.login;
                    pullRequestInformation.avatarUrl = userData.avatar_url;
                    pullRequestInformation.htmlUrl = userData.html_url;

                }

                function getRepositoryInformation(respositoryData) {
                    pullRequestInformation.repositoryName = respositoryData.name;
                    pullRequestInformation.repositoryHtmlUrl = respositoryData.html_url;
                }

                function addPullRequestInformation(pullRequestData) {
                    pullRequestInformation.pullRequests.push({
                        htmlUrl: pullRequestData.html_url,
                        state: pullRequestData.state,
                        title: pullRequestData.title,
                        body: pullRequestData.body,
                        created: Date.parse(pullRequestData.created_at)
                    });
                }

                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        getUserInformation(data[0].user);
                        getRepositoryInformation(data[0].base.repo);
                        pullRequestInformation.pullRequests = [];
                    }
                    addPullRequestInformation(data[i]);
                }

                return pullRequestInformation;
            };
            return pullRequestInformation;

        });
})();

(function () {
    'use strict';


    angular.module('Tombola.Academy.Dash.WaitingPulls')
        .controller('WaitingPullsController', ['$scope', '$rootScope', '$http', '$interval', '$q', 'WaitingPullsModel', function ($scope, $rootScope, $http, $interval, $q, waitingPullsModel) {
            $scope.model = waitingPullsModel;
            $scope.timerClass = '';
            var intervalPromise;


            var refresh = function () {
                $scope.timerClass = '';
                waitingPullsModel.refresh()
                    .catch(function(message){
                        alert(message);
                    });
                $scope.timerClass = 'nyantimer';

            };

            var startPolling = function () {
                intervalPromise = $interval(function () {
                        refresh();
                    }, 5 * 60 * 1000
                );
            };

            $rootScope.$on('$routeChangeSuccess', function (event, toRoute) {
                if (toRoute.$$route.controller === 'WaitingPullsController') {
                    refresh();
                }
                else {
                    $interval.cancel(intervalPromise);
                }
            });

            refresh();
            startPolling();
        }]);
})();

(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Stats')
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
(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .factory('StatsModel',['$q', 'GitHubUserProxy', 'UserInformation', 'StatsNormaliser', function ($q, gitHubUserProxy, userInformation, statsNormaliser) {
            var StatsModel = function(){

                var me = this;
                me.statistics = [];

                me.refresh = function() {
                    var promises = [];
                    var rawStatistics = [];
                    var getDataForUser = function (username){
                        var deferred = $q.defer();
                        gitHubUserProxy(username)
                            .then(function(userStats){
                                rawStatistics .push(userStats);
                                deferred.resolve();
                            })
                            .catch(function(error){
                                deferred.reject(error);
                            });
                        return deferred.promise;
                    };

                    for (var i = 0; i < userInformation.users.length; i++) {
                        promises.push(getDataForUser(userInformation.users[i]));
                    }

                    $q.all(promises).then(function(data){
                        me.statistics = statsNormaliser(rawStatistics);
                    });
                };
            };
            return new StatsModel();
    }]);
})();
(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .controller('StatsController', ['$scope', 'StatsModel', function($scope,  statsModel) {
            $scope.model = statsModel;
            $scope.model.refresh();

        }]);
})();
(function () {
    'use strict';
    angular.module('myApp').controller('MainController', ['$state',function($state){
        $state.go('waitingPulls');
    }]);
})();