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
