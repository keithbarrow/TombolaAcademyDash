(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy', []);
    angular.module('Tombola.Academy.Dash.GithubProxy', ['Tombola.Academy.Dash.GithubProxy']);
    angular.module('Tombola.Academy.Dash.WaitingPulls', ['Tombola.Academy.Dash.GithubProxy']);
    angular.module('Tombola.Academy.Dash.Stats', ['Tombola.Academy.Dash.TaProxy']);

    angular.module('myApp', [
        'ngRoute',
        'Tombola.Academy.Dash.WaitingPulls',
        'Tombola.Academy.Dash.Stats'
    ]).config( function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);
            $locationProvider.hashPrefix('!');
            $routeProvider
                .when('/', {
                    templateUrl: 'partials/waitingpulls.html',
                    controller:  'WaitingPullsController'
                })
                .when('/stats', {
                    templateUrl: 'partials/stats.html',
                    controller:  'StatsController'
                })
                .otherwise({redirectTo: '/'});

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
        .service('GitHubUserProxy',['$http', 'GithubConstants', function($http, githubConstants){
        return function(username){
            return $http.get(githubConstants.rootUrl + 'users/' + username + '/events'+ githubConstants.secret);
        };
    }]);
})();
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .factory('UserInformation', function(){
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
        .controller('WaitingPullsController', ['$scope', '$rootScope', '$http', '$interval', '$q', 'WaitingPullsModel', 'GithubRepoProxy', 'PullRequestInformationFactory', function ($scope, $rootScope, $http, $interval, $q, waitingPullsModel, githubRepoProxy, pullRequestInformationFactory) {
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
        .controller('StatsController', ['$scope', '$http', '$q', 'GitHubUserProxy', 'UserInformation', function($scope, $http, $q, gitHubUserProxy, userInformation) {
            $scope.users = userInformation.users;
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
                gitHubUserProxy(username).success(function(events){
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
            };

            var initialise = function(){
                //Creates a full year's worth of dates, ready for you to insert your data.
                var now = moment().startOf('day');
                var currentDate = moment().startOf('day').subtract(1, 'years');
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
            };

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
                    if(sum === 0){
                        delete $scope.statistics[currentDay];
                        daysToRemove++;
                    }
                    else
                    {
                        break;
                    }
                }
                $scope.statisticsOrder.splice(0, daysToRemove);
            };

            var refresh = function(){
                initialise();
                var promises = [];

                for(var i = 0; i<   $scope.users.length; i++){
                    var username = $scope.users[i];
                    promises.push(getDataForUser(username));
                }
                $q.all(promises).then(clean);
            };

            refresh();

        }]);
})();