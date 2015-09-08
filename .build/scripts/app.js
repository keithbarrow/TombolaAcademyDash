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


    angular.module('Tombola.Academy.Dash.Authentication', []);
    angular.module('Tombola.Academy.Dash.GithubProxy', []);
    angular.module('Tombola.Academy.Dash.TaProxy', ['Tombola.Academy.Dash.Authentication']);
    angular.module('Tombola.Academy.Dash.WaitingPulls', ['Tombola.Academy.Dash.GithubProxy', 'Tombola.Academy.Dash.TaProxy']);
    angular.module('Tombola.Academy.Dash.Stats', ['Tombola.Academy.Dash.GithubProxy', 'Tombola.Academy.Dash.TaProxy']);

    angular.module('myApp', [
        'ui.router',
        'Tombola.Academy.Dash.TaProxy',
        'Tombola.Academy.Dash.Authentication',
        'Tombola.Academy.Dash.WaitingPulls',
        'Tombola.Academy.Dash.Stats']);
})();
(function () {
    'use strict';
    angular.module('myApp')
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider
                .state('waitingPulls', {
                    templateUrl: 'partials/waitingpulls.html',
                    controller:  'WaitingPullsController'
                })
                .state('stats', {
                    templateUrl: 'partials/stats.html',
                    controller:  'StatsController'
                })
                .state('login', {
                    templateUrl: 'partials/login.html',
                    controller:  'AuthenticationController'
                });
        }]);
})();
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Authentication')
        .service('Authenticator', ['$http', 'TokenService', function ($http, tokenService){
        return {
            login: function(username, password){
                    var request = {
                        method: 'POST',
                        url: 'https://localhost:3000/authenticate',
                        withCredentials: false,
                        data: {"username":username, "password":password}
                    };
                    $http(request).success(function(data){
                        if(data.success){
                            tokenService.setToken(data.token);
                        }
                        else{
                            tokenService.resetToken();
                        }
                    })
                    .error(function(data, status) {
                        console.log(data);
                        console.log(status);
                        tokenService.resetToken();
                    });

            },
            logout: function() {
                tokenService.resetToken();
            }
        };
    }]);

})();
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Authentication')
        .service('TokenService', ['$state', function ($state){
            var token = null;

            return {
                isAuthenticated : function(){
                    return token !== null;
                },
                getToken: function (){
                    return token;
                },
                setToken: function(newToken){
                    token = newToken;
                    if(this.isAuthenticated()){
                        $state.go('waitingPulls'); //No sense of where user was going...
                    }
                    else{
                        $state.go('login');
                    }
                },
                resetToken: function(){
                    this.setToken(null);
                }
            };
        }]);

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

    angular.module('Tombola.Academy.Dash.GithubProxy')
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
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('UserInformation', ['$http', 'TokenService', function($http, tokenService){
            return {
                //TODO: ferry off URLS somewhere
                //TODO: get repos call
                getRepositoriesToCheck: function(){
                    return [
                        {username: 'Davros2106', repositories: ['NoughtsAndCrossesClient']},
                        {username: 'Koolaidman64', repositories: ['NoughtsAndCrosses']},
                        {username: 'SalamanderMan', repositories: ['NoughtsAndCrosses']},
                    ];
                },
                getUsers: function (){
                    var request = {
                        method: 'GET',
                        url: 'https://localhost:3000/api/githubusers',
                        headers:{
                            'x-access-token': tokenService.getToken()
                        }
                    };
                    return $http(request);
                }
            };
    }]);
})();
(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Authentication')
        .controller('AuthenticationController', ['$scope', '$state', 'Authenticator', function($scope, $state, authenticator) {
            $scope.username ='';
            $scope.password ='';
            $scope.login = function(){
                authenticator.login($scope.username, $scope.password);
            };
        }]);
})();
(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.WaitingPulls')
        .factory('WaitingPullsModel',['$q', 'UserInformation', 'GithubRepoProxy', function ($q, userInformation, githubRepoProxy) {
            var WaitingPullsModel = function (data) {
                var me = this;
                var repositoriesToCheck = userInformation.getRepositoriesToCheck();
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
            var rawStatistics = [],
                getDataForUser = function (username){
                    var deferred = $q.defer();
                    gitHubUserProxy(username).then(function(userStats){
                        rawStatistics.push(userStats);
                        deferred.resolve();
                    })
                    .catch(function(error){
                        deferred.reject(error);
                    });
                    return deferred.promise;
                },
                processUsers = function(users){
                    var promises = [],
                        i;
                    for (i = 0; i < users.length; i++) {
                        console.log(users[i].username);
                        promises.push(getDataForUser(users[i].username));
                    }
                    return promises;
                };
            return {
                getData: function(){
                    var deferred = $q.defer();
                    userInformation.getUsers().then(function(data){
                        var promises = processUsers(data.data.json);
                        $q.all(promises)
                            .then(function(){
                                deferred.resolve(statsNormaliser(rawStatistics));
                            })
                            .catch(function(){
                                deferred.reject();
                            });
                    });
                    return deferred.promise;
                }
            };
    }]);
})();
(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .controller('StatsController', ['$scope', 'StatsModel', function($scope,  statsModel) {
            statsModel.getData()
                .then(function(data){
                    $scope.stats = data;
                });
        }]);
})();
(function () {
    'use strict';
    angular.module('myApp')
        .controller('MainController', ['$scope', '$state','TokenService', function($scope, $state, tokenService){
            $scope.isAuthenticated = function(){
                return tokenService.isAuthenticated();
            };
            $scope.logout = function (){
                authenticator.logout();
            };
            $state.go('waitingPulls');
    }]);
})();
(function () {
    'use strict';
    angular.module('myApp')
        .run(['$rootScope', '$state','TokenService', 'UserInformation', function($rootScope, $state, tokenService, foo){
            $rootScope.$on('$stateChangeStart', function(event, toState){
                //Note - no sense of roles, will lose where we were headed at login...
                if(!tokenService.isAuthenticated() && toState.name !== 'login'){
                    event.preventDefault();
                    $state.go('login');
                }
            });
        }]);
})();