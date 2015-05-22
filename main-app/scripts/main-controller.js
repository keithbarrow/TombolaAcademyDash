(function () {
    'use strict';
    angular.module('myApp').controller('MainController', ['$state',function($state){
        $state.go('waitingPulls');
    }]);
})();