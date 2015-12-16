(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Core')
        .service('SpecialDayService',[function () {
            return function(){
                var now = new Date();

                if(now.getMonth() === 11 || (now.getMonth() === 0 && now.getDate() <= 6)){
                    return 'christmas';
                }

                if(now.getDay()===5){
                    return 'friday';
                }
                return null;
            };
        }]);
})();