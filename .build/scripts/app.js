(function () {
    'use strict';

    //TODO: Now using lodash - deprecate?
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
        .constant('API_URLS',{
            authentication:'https://eutaveg-01.tombola.emea:3000/authenticate',
            apiBaseUrl: 'https://eutaveg-01.tombola.emea:3000/api/'
        })
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
                    url:'/githubusers',
                    controller:'GithubUsersController',
                    templateUrl: 'partials/admin/githubusers.html'
                })
                .state('admin.githubrepositories', {
                    url:'/githubrepos',
                    controller:'GithubRepositoriesController',
                    templateUrl: 'partials/admin/githubrepos.html'
                });
        }]);
})();
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Authentication')
        .service('Authenticator', ['$http', 'API_URLS', 'TokenService', function ($http, apiUrls, tokenService){
        return {
            login: function(username, password){
                    var request = {
                        method: 'POST',
                        url: apiUrls.authentication,
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
    //TODO: refactor - Value? Filter?
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
        .factory('TaBaseProxy', ['$http', '$q', 'API_URLS', 'TokenService', function($http, $q, apiUrls, tokenService){
            return function(tablename) {
                var me = this,
                    baseUrl = apiUrls.apiBaseUrl,
                    getTableUrl = function() {
                        return baseUrl+ tablename;
                    },
                    getTableUrlWithId = function(id) {
                        return getTableUrl() + '/' + id;
                    },
                    getRequestHeader = function(){
                        return {
                            'x-access-token': tokenService.getToken()
                        };
                    },

                    createRequest = function(method, id, data){
                        var request = {
                            method: method,
                            url: id ? getTableUrlWithId(id) : getTableUrl(),
                            headers: getRequestHeader()
                        };
                        if (data){
                            request.data  = data;
                        }
                        return request;
                    },

                    callApi = function (request, successTransform, failTransform){
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


                me.get = function (successTransform, failTransform){
                    var request = createRequest('GET');
                    return callApi(request, successTransform, failTransform);
                };

                me.update = function(id, updateObject, successTransform, failTransform) {
                    var request = createRequest('PUT', id, updateObject);
                    return callApi(request, successTransform, failTransform);
                };

                me.add = function(newObject, successTransform, failTransform){
                    var request = createRequest('POST', null, newObject);
                    return callApi(request, successTransform, failTransform);
                };

                me.remove = function(id, successTransform, failTransform){
                    var request = createRequest('DELETE', id);
                    return callApi(request, successTransform, failTransform);
                };
            };
    }]);
})();
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('TaGithubRepositoryProxy', ['$q', 'TaBaseProxy', 'TaGithubUserProxy', 'ApiDataConverter', function($q, TaBaseProxy, taGithubUserProxy, apiDataConverter){

            var proxy = new TaBaseProxy('githubrepositories');
            return {
                getRepositoriesToCheck: function(){
                    var deferred = $q.defer(),
                        promises = [taGithubUserProxy.get(apiDataConverter.getJson), this.get(apiDataConverter.getJson)],
                        getRepositoriesForUserId = function(githubRepositories, userId){
                            return _.filter(githubRepositories, function(githubRepository) {
                                return githubRepository.githubuserid == userId;
                            });
                        },
                        createRepositoryEntryForUser = function(githubUser, githubRepositories){
                            var repositoriesForUser = getRepositoriesForUserId(githubRepositories, githubUser.id);
                            if(repositoriesForUser.length === 0){
                                return;
                            }
                            return {
                                username: githubUser.username,
                                repositories:_.map(repositoriesForUser, function(repository){
                                    return repository.repositoryname;
                                })
                            };
                        },
                        collateRepositories = function (githubUsers, githubRepositories){
                            var currentEntry,
                                i,
                                repositoriesToGet =[];
                            for(i=0; i< githubUsers.length; i++){
                                currentEntry = createRepositoryEntryForUser(githubUsers[i], githubRepositories);
                                if(!currentEntry){
                                    continue;
                                }
                                repositoriesToGet.push(currentEntry);
                            }
                            return repositoriesToGet;
                    };

                    //TODO: this could all be improved by allowing where clauses - need to investigate syntax and poss available parser...
                    //TODO: ODATA looked promising, also https://parse.com/docs/rest/guide/
                    $q.all(promises).then(function(results){
                        deferred.resolve(collateRepositories(results[0], results[1]));
                    });
                    return deferred.promise;
                },

                get: proxy.get,
                update: proxy.update,
                add: proxy.add,
                remove: proxy.remove
            };
        }]);
})();
(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('TaGithubUserProxy', ['TaBaseProxy', function(TaBaseProxy){

            var proxy = new TaBaseProxy('githubusers');
            return {
                get: proxy.get,
                update: proxy.update,
                add: proxy.add,
                remove: proxy.remove
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
        .factory('WaitingPullsModel',['$q', 'TaGithubRepositoryProxy', 'GithubRepoProxy', function ($q, taGithubRepositoryProxy, githubRepoProxy) {
            var WaitingPullsModel = function () {
                var me = this,
                    addError = function (error){
                        me.errors.push(error);
                    },
                    addWaitingPull = function (waitingPullsResult){
                        me.waitingPulls.push(waitingPullsResult);
                    },
                    requestPullsForUser = function (userRepositoryList, promises) {
                        var i;
                        for (i = 0; i < userRepositoryList.repositories.length; i++) {
                            promises.push(githubRepoProxy(userRepositoryList.username, userRepositoryList.repositories[i]));
                    }},

                    requestPulls = function(userRepositoryLists){
                        var i,
                            promises = [];
                        for (i = 0; i < userRepositoryLists.length; i++) {
                            requestPullsForUser(userRepositoryLists[i], promises);
                        }
                        return promises;
                    },

                    update = function (waitingPullsResults) {
                        for(var i = 0; i < waitingPullsResults.length; i++){
                            if(waitingPullsResults[i].isError){
                                addError(waitingPullsResults[i].data);
                            }
                            else if(waitingPullsResults[i].pullRequests){
                                waitingPullsResults[i].pullRequests = _.sortBy(waitingPullsResults[i].pullRequests, 'created');
                                console.log(waitingPullsResults[i].pullRequests);
                                addWaitingPull(waitingPullsResults[i]);
                            }
                        }
                    };

                me.waitingPulls = [];
                me.errors = [];

                me.refresh = function(){
                    var deferred = $q.defer();
                    me.waitingPulls = [];
                    me.errors = [];
                    taGithubRepositoryProxy.getRepositoriesToCheck().then(function(userRepositoryList){
                        $q.all(requestPulls(userRepositoryList)).
                            then(function(waitingPullsResult){
                                update(waitingPullsResult);
                                deferred.resolve();
                            })
                            .catch(function(message){
                                deferred.reject(message);
                            });
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
        .factory('StatsModel',['$q', 'TaGithubUserProxy', 'ApiDataConverter', 'GitHubUserProxy', 'StatsNormaliser', function ($q, taGithubUserProxy, apiDataConverter, gitHubUserProxy, statsNormaliser) {
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
                        if(githubUsers[i].includeinstats[0]){
                            promises.push(getDataForUser(githubUsers[i].username));
                        }
                    }
                    return promises;
                };

            return {
                getData: function(){
                    var deferred = $q.defer();
                    taGithubUserProxy.get(apiDataConverter.getJson).then(function(results){
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
    //TODO: Module names out of whack *****************************
    angular.module('Tombola.Academy.Dash.Admin.GithubUsers')
        .service('GithubRepositoryService', ['TaGithubRepositoryProxy', 'TaGithubUserProxy', 'ApiDataConverter',
            function(taGithubRepositoryProxy, taGithubUserProxy, apiDataConverter){
            var me= this,
                updateCallback;
            me.githubRepositories = [];
            me.githubUsers = [];
            me.newRepository = {};

            me.resetNewRepository = function(){
                me.newRepository = {
                    repositoryname:'',
                    description:'',
                    githubuserid:me.githubUsers[0].id
                };
            };

            me.getCurrentRepositories = function() {
                taGithubRepositoryProxy.get(apiDataConverter.getJson)
                    .then(function (data) {
                        me.githubRepositories = _.forEach(data, function(repository){
                            repository.username = (_.find(me.githubUsers, 'id', repository.githubuserid)).username;
                        });
                        if(updateCallback){
                            updateCallback();
                        }
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.updateRepository = function(id, update){
                taGithubRepositoryProxy.update(id, update)
                    .then(function(){
                        me.getCurrentRepositories();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.updateRepositoryName = function(repository){
                me.updateRepository(repository.id, {repositoryname: repository.repositoryname});
            };

            me.updateDescription = function(repository){
                me.updateRepository(repository.id, {description: repository.description});
            };


            me.addRepository = function(){
                taGithubRepositoryProxy.add(me.newRepository)
                    .then(function(){
                        me.resetNewRepository
                        ();
                        me.getCurrentRepositories();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.removeRepository = function(githubrepository){
                taGithubRepositoryProxy.remove(githubrepository.id)
                    .then(function(){
                        me.getCurrentRepositories();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.setUpdateCallback = function(callback){
                updateCallback = callback;
            };

            taGithubUserProxy.get(apiDataConverter.getJson).then(function(data){
                me.githubUsers = _.sortBy(data, 'username');
                me.resetNewRepository();
            });

        }]);
})();

(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Admin.GithubUsers')
        .service('GithubUserService', ['TaGithubUserProxy','ApiDataConverter', function(taGithubUserProxy, apiDataConverter){
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
                taGithubUserProxy.get(apiDataConverter.getJson)
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
                taGithubUserProxy.update(id, update)
                    .then(function(){
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
                taGithubUserProxy.add(me.newUser)
                    .then(function(){
                        me.resetNewUser();
                        me.getCurrentUsers();
                    })
                    .catch(function (response) {
                        //TODO: visible error message.
                    });
            };

            me.removeUser = function(user){
                taGithubUserProxy.remove(user.id)
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
        .controller('GithubRepositoriesController', ['$scope', 'GithubRepositoryService', function($scope, githubRepositoryService){
            //TODO: common function
            var validateAndUpdate = function(fieldName, updateMethodName, githubRepository){
                if(!$scope.repoList.$dirty){
                    return;
                }
                if(githubRepository[fieldName]){
                    $scope.githubRepositoryService[updateMethodName](githubRepository);
                }
                else {
                    githubRepositoryService.getCurrentRepositories();
                }

            };

            $scope.githubRepositoryService = githubRepositoryService;

            $scope.updateRepositoryName = function (githubRepository){
                if(!githubRepository.repositoryname){
                    return;
                }
                validateAndUpdate('repositoryname', 'updateRepositoryName', githubRepository);
            };

            $scope.updateDescription = function (githubRepository){
                validateAndUpdate('description', 'updateDescription', githubRepository);
            };

            $scope.add = function(){
                if(!githubRepositoryService.newRepository.repositoryname){
                    return;
                }
                githubRepositoryService.addRepository();
            };

            $scope.remove = function(githubRepository){
                githubRepositoryService.removeRepository(githubRepository);
            };

            githubRepositoryService.setUpdateCallback(function(){
                if($scope.repoList){
                    $scope.repoList.$setPristine();
                }
            });

            githubRepositoryService.getCurrentRepositories();

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
        .run(['$rootScope', '$state','TokenService', function($rootScope, $state, tokenService){
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