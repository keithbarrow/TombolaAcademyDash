(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.Pixi')
        .service('Nyan',[function () {
            var nayanCanvas = document.getElementById('nyan-canvas'),
                stage = new PIXI.Stage(0x66FF99),
                renderer = PIXI.autoDetectRenderer(
                    nayanCanvas.width,
                    nayanCanvas.height,
                    {view:nayanCanvas}
                );

            console.log('Foo');
            renderer.render(stage);
        }]);
})();