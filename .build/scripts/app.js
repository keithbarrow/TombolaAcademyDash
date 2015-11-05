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
    angular.module('Tombola.Academy.Dash.Admin.GithubUsers', ['Tombola.Academy.Dash.TaProxy']);
    angular.module('Tombola.Academy.Dash.WaitingPulls', ['Tombola.Academy.Dash.GithubProxy', 'Tombola.Academy.Dash.TaProxy']);
    angular.module('Tombola.Academy.Dash.Stats', ['Tombola.Academy.Dash.GithubProxy', 'Tombola.Academy.Dash.TaProxy']);

    angular.module('myApp', [
        'ui.router',
        'Tombola.Academy.Dash.TaProxy',
        'Tombola.Academy.Dash.Authentication',
        'Tombola.Academy.Dash.WaitingPulls',
        'Tombola.Academy.Dash.Stats',
        'Tombola.Academy.Dash.Admin.GithubUsers']);
})();
(function () {
    'use strict';
    angular.module('myApp')
        .config(['$locationProvider', '$stateProvider', function($locationProvider, $stateProvider) {
            $locationProvider.html5Mode(true);
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
                })
                .state('admin', {
                    url:'/admin',
                    templateUrl: 'partials/admin/index.html',
                    controller:'GithubUsersController'
                })
                .state('admin.githubusers', {
                    url:'/admin/githubusers',
                    controller:'GithubUsersController',
                    templateUrl: 'partials/admin/githubusers.html'
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
                    deferred.resolve({isError: true, data:{username:username, repositoryName: repositoryName}});
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
                    deferred.resolve({isError: true, data: {username: username}});
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
    //TODO: refactor - Value? Filter?ß
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('ApiDataConverter', [function(){
            return {
                getJson: function(response){
                    return response.data.json;
                }
            };
        }]);
})();

(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('UserInformation', ['$http', '$q', 'TokenService', function($http, $q, tokenService){
            var callServer = function (request, successTransform, failTransform){
                var deferred = $q.defer();
                $http(request).then(function(response){
                    if(successTransform){
                        deferred.resolve(successTransform(response));
                    }
                    else{
                        deferred.resolve(response);
                    }
                }).catch(function(response){
                    //TODO: log
                    if(failTransform) {
                        deferred.reject(failTransform(response));
                    }
                    else{
                        deferred.reject(response);
                    }
                });
                return deferred.promise;
            };

            return {
                //TODO: ferry off URLS somewhere
                //TODO: get repos call
                getRepositoriesToCheck: function(){
                    return [
                        {username: 'IanMcLeodTombola', repositories: ['Tombola.Games.NoughtsAndCrosses']},
                        {username: 'kathHen', repositories: ['NoughtsandCrosses']},
                        {username: 'SalamanderMan', repositories: ['NoughtsAndCrosses']}
                    ];
                },

                getUsers: function (successTransform, failTransform){
                    var request = {
                            method: 'GET',
                            url: 'https://localhost:3000/api/githubusers',
                            headers:{
                                'x-access-token': tokenService.getToken()
                            }
                        };
                    return callServer(request, successTransform, failTransform);
                },

                updateUser: function(id, updateObject, successTransform, failTransform) {
                    var request = {
                        method: 'PUT',
                        url: 'https://localhost:3000/api/githubusers/'+ id,
                        headers:{
                            'x-access-token': tokenService.getToken()
                        },
                        data: updateObject
                    };
                    return callServer(request, successTransform, failTransform);
                },

                addUser: function(newUser, successTransform, failTransform){
                    var request = {
                        method: 'POST',
                        url: 'https://localhost:3000/api/githubusers',
                        headers:{
                            'x-access-token': tokenService.getToken()
                        },
                        data: newUser
                    };
                    return callServer(request, successTransform, failTransform);
                },
                removeUser: function(id, successTransform, failTransform){
                    var request = {
                        method: 'DELETE',
                        url: 'https://localhost:3000/api/githubusers/' + id,
                        headers:{
                            'x-access-token': tokenService.getToken()
                        }
                    };
                    return callServer(request, successTransform, failTransform);
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
                me.errors = [];

                var requestPulls = function(){
                    var i,
                        j,
                        promises = [];

                    for (i = 0; i < repositoriesToCheck.length; i++) {
                        for (j = 0; j < repositoriesToCheck[i].repositories.length; j++) {
                            promises.push(githubRepoProxy(repositoriesToCheck[i].username, repositoriesToCheck[i].repositories[j]));
                        }
                    }
                    return promises;
                };

                var update = function (waitingPullsResult) {
                    me.waitingPulls = [];
                    me.errors = [];
                    for(var i = 0; i < waitingPullsResult.length; i++){
                        if(waitingPullsResult[i].isError){
                            me.errors.push(waitingPullsResult[i].data);
                        }
                        else if(waitingPullsResult[i].pullRequests){
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
(function () {
    'use strict';

    angular.module('Tombola.Academy.Dash.Stats')
        .factory('StatsModel',['$q', 'GitHubUserProxy', 'ApiDataConverter', 'UserInformation', 'StatsNormaliser', function ($q, gitHubUserProxy, apiDataConverter, userInformation, statsNormaliser) {
            var getDataForUser = function (username){
                    var deferred = $q.defer();
                    gitHubUserProxy(username).then(function(userStats){
                        deferred.resolve(userStats);
                    })
                    .catch(function(error){
                        deferred.reject();
                    });
                    return deferred.promise;
                },
                getDataForUsers = function(githubUsers){
                    var promises = [],
                        i;
                    for (i = 0; i < githubUsers.length; i++) {
                        //TODO: add select on to API and do that instead.
                        //TODO: also - this doesn't seem to work....
                        if(!githubUsers[i].includeinstats){
                            continue;
                        }
                        promises.push(getDataForUser(githubUsers[i].username));
                    }
                    return promises;
                };

            return {
                getData: function(){
                    var deferred = $q.defer();
                    userInformation.getUsers(apiDataConverter.getJson).then(function(results){
                            $q.all(getDataForUsers(results))
                                .then(function(rawStatistics){
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
                    $scope.statistics = data;
                });
        }]);
})();
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Admin.GithubUsers')
        .service('GithubUserService', ['UserInformation','ApiDataConverter', function(userInformation, apiDataConverter){
            var me= this,
                updateCallback;

            me.githubUsers = [];
            me.newUser = {};

            me.resetNewUser = function(){
                me.newUser = {
                    username:'',
                    forename:'',
                    surname:''
                };
            };

            me.getCurrentUsers = function() {
                userInformation.getUsers(apiDataConverter.getJson)
                    .then(function (data) {
                        me.githubUsers = data;
                        if(updateCallback){
                            updateCallback();
                        }
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.updateUser = function(id, update){
                userInformation.updateUser(id, update)
                    .then(function(data){
                        me.getCurrentUsers();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.updateUsername = function(user){
                if(!user.username){
                    return;
                }
                me.updateUser(user.id, {username: user.username});
            };

            me.updateForename = function(user){
                if(!user.forename){
                    return;
                }
                me.updateUser(user.id, {forename: user.forename});
            };

            me.updateSurname = function(user){
                if(!user.surname){
                    return;
                }
                me.updateUser(user.id, {surname: user.surname});
            };

            me.toggleInclude = function(user){
                me.updateUser(user.id, {includeinstats: !user.includeinstats[0]});
            };

            me.addUser = function(){
                userInformation.addUser(me.newUser)
                    .then(function(){
                        me.resetNewUser();
                        me.getCurrentUsers();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.removeUser = function(user){
                userInformation.removeUser(user.id)
                    .then(function(){
                        me.getCurrentUsers();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.setUpdateCallback = function(callback){
                updateCallback = callback;
            };

            me.resetNewUser();
        }]);
})();

(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Admin.GithubUsers')
        .controller('GithubUsersController', ['$scope', 'GithubUserService', function($scope, githubUserService){

            var validateAndUpdate = function(fieldName, updateMethodName, githubUser){
                if(!$scope.userList.$dirty){
                    return;
                }
                if(githubUser[fieldName]){
                    $scope.githubUserService[updateMethodName](githubUser);
                }
                else {
                    githubUserService.getCurrentUsers();
                }

            };

            $scope.githubUserService = githubUserService;

            $scope.updateUsername = function (githubUser){
                validateAndUpdate('username', 'updateUsername', githubUser);
            };

            $scope.updateForename = function (githubUser){
                validateAndUpdate('forename', 'updateForename', githubUser);
            };

            $scope.updateSurname = function (githubUser){
                validateAndUpdate('surname', 'updateSurname', githubUser);
            };

            $scope.add = function(){
                if(!githubUserService.newUser.username || !githubUserService.newUser.forename || !githubUserService.newUser.surname ){
                    return;
                }
                githubUserService.addUser();
            };

            $scope.remove = function(githubUser){
                githubUserService.removeUser(githubUser);
            };

            githubUserService.setUpdateCallback(function(){
                if($scope.userList){
                    $scope.userList.$setPristine();
                }
            });

            githubUserService.getCurrentUsers();

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
                tokenService.resetToken();
            };
            $state.go('waitingPulls');
    }]);
})();
(function () {
    'use strict';
    angular.module('myApp')
        .run(['$rootScope', '$state','TokenService', 'UserInformation', function($rootScope, $state, tokenService){
            $rootScope.$on('$stateChangeStart', function(event, toState){
                //TODO: roles for admin
                //Note - no sense of roles, will lose where we were headed at login...
                if(!tokenService.isAuthenticated() && toState.name !== 'login'){
                    event.preventDefault();
                    $state.go('login');
                }
            });
        }]);
})();