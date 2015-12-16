(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash')
        .constant('API_URLS',{
            authentication:'https://localhost:3000/authenticate',
            apiBaseUrl: 'https://localhost:3000/api/'
        });
})();