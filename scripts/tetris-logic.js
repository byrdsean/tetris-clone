System.register("Gameboard", [], function (exports_1, context_1) {
    'use strict';
    var Gameboard;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Gameboard = /** @class */ (function () {
                function Gameboard(_Gameboard) {
                    this.width = 16;
                    this.height = 20;
                    this.Gameboard = _Gameboard;
                }
                return Gameboard;
            }());
            exports_1("default", Gameboard);
        }
    };
});
System.register("tetris-logic", [], function (exports_2, context_2) {
    'use strict';
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            (function () {
                //Variables
                //-----------------------------------------------------------------------------------------------------------------------------
                //Start the game
                function StartGame() {
                }
                StartGame();
                //-----------------------------------------------------------------------------------------------------------------------------
            })();
        }
    };
});
