(function () {
    'use strict';
    angular.module('myApp')
        .controller('MainController', ['$scope', '$state', '$interval','TokenService', function($scope, $state, $interval,tokenService){

            var setSpecial = function(){
                    var now = new Date();
                    $scope.isAuthenticated = tokenService.isAuthenticated();

                    if(now.getMonth() === 11 || (now.getMonth() === 0 && now.getDate() <= 6)){
                        $scope.specialClass =  'christmas';
                    }

                    else if(now.getDay()==5){
                        $scope.specialClass = 'friday';
                    }
                    else{
                        $scope.specialClass = null;
                    }
                };



            $scope.specialClass = null;

            $scope.logout = function (){
                tokenService.resetToken();
            };

            $state.go('waitingPulls');

            setSpecial();

            $interval(setSpecial, 1000);

    }]);
})();