(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash')
        .constant('API_URLS',{
            authentication:'https://eutaveg-01.tombola.emea:3000/authenticate',
            apiBaseUrl: 'https://eutaveg-01.tombola.emea:3000/api/'
        });
})();