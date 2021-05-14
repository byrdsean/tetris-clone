'use strict';
(function () {

    //Variables
    let GameCanvas = null;
    let MAX_WIDTH = 16;
    let MAX_HEIGHT = 20;
    let TETRAMINO_SIZE = 30;
    let DidGameStart = false;
    let BoardInfo = [];
    let AllTetraminos = [];
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
        rotations : [
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 0, y : 1}, {x : 0, y : 2}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 2, y : 0}, {x : 2, y : 1}],
            [{x : 1, y : 0}, {x : 1, y : 1}, {x : 1, y : 2}, {x : 0, y : 2}],
        ]
    };
    let Reverse_L_Tetramino = {
        color: Colors.blue,
        rotations : [
            [{x : 2, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 0, y : 2}, {x : 1, y : 2}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 2, y : 0}, {x : 0, y : 1}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 1, y : 1}, {x : 1, y : 2}],
        ]
    };
    let Z_Tetramino = {
        color: Colors.yellow,
        rotations : [
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 1, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 1, y : 2}]
        ]
    };
    let S_Tetramino = {
        color: Colors.green,
        rotations : [
            [{x : 1, y : 0}, {x : 2, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}],
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 1, y : 2}]
        ]
    };
    let Block_Tetramino = {
        color: Colors.purple,
        rotations : [
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}]
        ]
    };
    let Line_Tetramino = {
        color: Colors.orange,
        rotations : [
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

        //Store all tetraminos into an array
        AllTetraminos = [
            L_Tetramino,
            Reverse_L_Tetramino,
            Z_Tetramino,
            S_Tetramino,
            Block_Tetramino,
            Line_Tetramino
        ];

        //Build the game board model
        BoardInfo = Array(MAX_HEIGHT).fill(Array(MAX_WIDTH).fill(0));
        // for(let r = 0; r < MAX_HEIGHT; r++)
        // {
        //     let column = Array(MAX_WIDTH).fill(0);
        //     BoardInfo.push(column);
        // }
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Start the game
    function StartGame()
    {
        //Set flag to know the game has started
        DidGameStart = true;

        //Set the initial block to display the next tetramino
        let InitialBlock = {x: Math.floor((MAX_WIDTH - 1) / 2), y: 0};

        //Get the next tetramino, and try to display
        let NextTetramino = GetNextTetramino();
        let DisplaySuccessful = DisplayTetramino(InitialBlock, NextTetramino);





    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Try to display the tetramino
    function DisplayTetramino(InitialBlock, NextTetramino)
    {
        //Get the array of coords to display the tetramino
        let DisplayCoords = NextTetramino.rotations[0].map(coord => {
            return {
                x: coord.x + InitialBlock.x,
                y: coord.y + InitialBlock.y
            }
        });

        console.log(DisplayCoords);

        //Display the tetramino
        DisplayCoords.map(coords => {
            DrawBlock(coords.x, coords.y, NextTetramino.color, Colors.white)
        });


        



        return false;


    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Get the next tetramino, and try to display
    function GetNextTetramino()
    {
        let Index = Math.floor(Math.random() * AllTetraminos.length);
        return AllTetraminos[Index];
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
