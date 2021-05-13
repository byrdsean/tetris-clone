'use strict';
(function () {

    //Variables
    let GameCanvas = null;
    let MAX_WIDTH = 16;
    let MAX_HEIGHT = 20;
    let TETRAMINO_SIZE = 30;
    let DidGameStart = false;
    let BoardInfo = [];
    let Colors = {
        red : '#FF0000',
        blue : '#0000FF',
        yellow : '#FFFF00',
        green : '#00FF00',
        purple : '#3700FF',
        orange : '#FFA500',
        white: '#FFFFFF',
        black: '#000000'
    };

    //Tetraminos
    let L_Tetramino = {
        color: Colors.red,
        roations : [
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 0, y : 1}, {x : 0, y : 2}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 2, y : 0}, {x : 2, y : 1}],
            [{x : 1, y : 0}, {x : 1, y : 1}, {x : 1, y : 2}, {x : 0, y : 2}],
        ]
    };
    let Reverse_L_Tetramino = {
        color: Colors.blue,
        roations : [
            [{x : 2, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 0, y : 2}, {x : 1, y : 2}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 2, y : 0}, {x : 0, y : 1}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 1, y : 1}, {x : 1, y : 2}],
        ]
    };
    let Z_Tetramino = {
        color: Colors.yellow,
        roations : [
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 1, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 1, y : 2}]
        ]
    };
    let S_Tetramino = {
        color: Colors.green,
        roations : [
            [{x : 1, y : 0}, {x : 2, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}],
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 1, y : 2}]
        ]
    };
    let Block_Tetramino = {
        color: Colors.purple,
        roations : [
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}]
        ]
    };
    let Line_Tetramino = {
        color: Colors.orange,
        roations : [
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 2, y : 0}, {x : 3, y : 0}],
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 0, y : 2}, {x : 0, y : 3}]
        ]
    };
    //-----------------------------------------------------------------------------------------------------------------------------

    //Initialize the game
    function InitGame()
    {
        //Set the gameboard
        let GameBoardElemet = document.querySelector('.GameBoard');
        GameCanvas = GameBoardElemet.getContext("2d");

        //Build the game board model
        for(let r = 0; r < MAX_HEIGHT; r++)
        {
            let column = Array(MAX_WIDTH).fill(0);
            BoardInfo.push(column);
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Start the game
    function StartGame()
    {
        //Set flag to know the game has started
        DidGameStart = true;

   

    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Draw a block to the screen
    function DrawBlock(x, y, color, borderColor)
    {
        //Set the x and y position relative to the game board
        let x_pos = x*TETRAMINO_SIZE;
        let y_pos = y*TETRAMINO_SIZE;
        
        //If there is a border, display it
        //The "border" is a larger block appearing behind the main block
        let HasBorder = borderColor !== null && borderColor !== undefined;
        let BorderWidth = 0;
        if(HasBorder)
        {
            //Draw the square
            GameCanvas.fillStyle = borderColor;
            GameCanvas.fillRect(x_pos, y_pos, TETRAMINO_SIZE, TETRAMINO_SIZE);

            //Set the border width
            BorderWidth = 1;
        }
        
        //Display the main block
        GameCanvas.fillStyle = color;
        GameCanvas.fillRect(
            x_pos + BorderWidth,
            y_pos + BorderWidth,
            TETRAMINO_SIZE - (2*BorderWidth),
            TETRAMINO_SIZE - (2*BorderWidth)
        );
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Handle user keyboard input
    document.onkeyup = function(e)
    {
        e = e || window.event;
        if(!DidGameStart)
        {
            //Game didn't start yet. If user pressed ENTER, start the game
            if(e.key === 'Enter')      //ENTER
            {
                //Initialize the game
                InitGame();

                //Start!
                StartGame();
            }
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------
})();
