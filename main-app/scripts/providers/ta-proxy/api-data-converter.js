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
