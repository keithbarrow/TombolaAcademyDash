(function () {
    'use strict';
    angular.module('Tombola.Academy.Dash.TaProxy')
        .service('UserInformation', function(){
            var UserInfo = function() {
                var me = this;
                me.users = ['Davros2106', /*'DeclanT',*/ 'Koolaidman64', 'LewisGardner25', 'SalamanderMan'];

                me.repositoriesToCheck = [
                    {username: 'Davros2106', repositories: ['NoughtsAndCrossesClient']},
                    {username: 'Koolaidman64', repositories: ['NoughtsAndCrosses']},
                    {username: 'LewisGardner25', repositories: ['NoughtsAndCrosses']},
                    {username: 'SalamanderMan', repositories: ['NoughtsAndCrosses']},

                    {username: 'Matthew-Gilmore', repositories: ['HendonHerald', 'NoughtsAndCrosses']},
                    {username: 'JakeArkleyTombola', repositories: ['NoughtsAndCrosses']},
                    {username: 'matthew-english', repositories: ['Noughts-and-Crosses']}
                ];

                me.login = function (username, password){
                    return 'STUB TOKEN  FOR' + username;
                };
            };
            return new UserInfo();
    });
})();