'use strict';
(function () {

    //Constants
    const GAME_BOARD_MAX_WIDTH = 16;    //Number of pieces of the game board's width
    const GAME_BOARD_MAX_HEIGHT = 20;   //Number of pieces of the game board's height
    const TETRAMINO_SIZE = 30;          //Size (pixels) of the tetramino's height/width
    const INCREASE_LEVEL_MAX = 500;     //Amount to increase the level's max points to go to the next level
    const MAX_LEVELS_IN_GAME = 10;      //Maximum levels in the game

    //Game components
    let GameCanvas = null;
    let BoardInfo = [];
    let AllTetraminos = [];
    let PointsDisplay = null;
    
    //Variables
    let PlayTetramino = null;           //Current tetramino in play
    let DidGameStart = false;
    let Colors = {
        red : '#FF0000',
        blue : '#0000FF',
        yellow : '#FFFF00',
        green : '#00FF00',
        purple : '#3700FF',
        orange : '#FFA500',
        brown : '#964B00',
        white: '#FFFFFF',
        black: '#000000',
        boardColor: '#000000'
    };
    let GameBoardStates = {
        Empty: 0,
        InUse: 1,
        UseByTetraminoInPlay: 2,
        Invalid: 3
    };
    let Progress = {
        CurrentLevel : 1,
        CurrentPoints : 0,

        //Set the initial block to display the next tetramino
        InitialBlock : {x: Math.floor((GAME_BOARD_MAX_WIDTH - 1) / 2), y: 0},

        //Get the current points needed to reach the next level
        PointsToNextLevel : (level) => {return level * INCREASE_LEVEL_MAX;}
    };

    //Tetraminos
    //Each tetramino contains:
    //Color of its blocks
    //How to map the x and y coordinates for each rotation
    let L_Tetramino = {
        color: Colors.red,
        currentRotation: 0,
        rotations : [
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 0, y : 1}, {x : 0, y : 2}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 2, y : 0}, {x : 2, y : 1}],
            [{x : 1, y : 0}, {x : 1, y : 1}, {x : 1, y : 2}, {x : 0, y : 2}],
        ]
    };
    let Reverse_L_Tetramino = {
        color: Colors.blue,
        currentRotation: 0,
        rotations : [
            [{x : 2, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 0, y : 2}, {x : 1, y : 2}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 2, y : 0}, {x : 0, y : 1}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 1, y : 1}, {x : 1, y : 2}],
        ]
    };
    let Z_Tetramino = {
        color: Colors.yellow,
        currentRotation: 0,
        rotations : [
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 1, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 1, y : 2}]
        ]
    };
    let S_Tetramino = {
        color: Colors.green,
        currentRotation: 0,
        rotations : [
            [{x : 1, y : 0}, {x : 2, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}],
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 1, y : 2}]
        ]
    };
    let Block_Tetramino = {
        color: Colors.brown,
        currentRotation: 0,
        rotations : [
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}]
        ]
    };
    let Line_Tetramino = {
        color: Colors.orange,
        currentRotation: 0,
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

        //Set additional game components
        PointsDisplay = document.querySelector('.points');

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
        //BoardInfo = Array(GAME_BOARD_MAX_WIDTH).fill(Array(GAME_BOARD_MAX_HEIGHT).fill(0));
        for(let c = 0; c < GAME_BOARD_MAX_WIDTH; c++)
        {
            let Column = [];
            for(let r = 0; r < GAME_BOARD_MAX_HEIGHT; r++)
            {
                Column.push(GameBoardStates.Empty);
                DrawBlock(r, c, Colors.black);
            }
            BoardInfo.push(Column);
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Get a random tetramino
    function GetRandomTetramino()
    {
        let Index = Math.floor(Math.random() * AllTetraminos.length);
        return AllTetraminos[Index];
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Try to display the tetramino. Returns true or false flag to know if the tetramino was placed
    //anchorX: X coordinate we want to anchor the tetramino to
    //anchorY: Y coordinate we want to anchor the tetramino to
    function DisplayTetramino(anchorX, anchorY, Tetramino)
    {
        //Get the array of coords to display the tetramino
        let DisplayCoords = Tetramino.rotations[Tetramino.currentRotation].map(coord => {
            return {
                x: coord.x + anchorX,
                y: coord.y + anchorY,
            }
        });

        //Check if the tetramino can display
        let IsValidPosition = true;
        for(let i = 0; i < DisplayCoords.length; i++)
        {
            let Coord = DisplayCoords[i];

            //Check that the XY coordinate is within the bounds of the board
            //If not, set the valid flag to false, and break loop
            let ValidCoord = 
                   0 <= Coord.x
                && 0 <= Coord.y
                && Coord.x < BoardInfo.length
                && Coord.y < BoardInfo[Coord.x].length;
            if(!ValidCoord)
            {
                IsValidPosition = false;
                break;
            }

            //If the coordinate is empty or already in use by the CURRENT tetramino, then it's a valid position
            let CurrentBlockStatus = BoardInfo[Coord.x][Coord.y];
            if(CurrentBlockStatus != GameBoardStates.Empty && CurrentBlockStatus != GameBoardStates.UseByTetraminoInPlay)
            {
                IsValidPosition = false;
                break;
            }
        }

        //Display the tetramino
        if(IsValidPosition)
        {
            for(let i = 0; i < DisplayCoords.length; i++)
            {
                DrawBlock(DisplayCoords[i].x, DisplayCoords[i].y, Tetramino.color, Colors.white);
            }
        }

        //return the success flag
        return IsValidPosition;
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

    //Play the game
    function PlayGame()
    {
        //Set flag to start the game
        DidGameStart = true;
        
        //Get a random tetramino, and display
        var Tetramino = GetRandomTetramino();
        let DisplaySuccess = DisplayTetramino(0, 0, Tetramino);

        console.log({
            DisplaySuccess: DisplaySuccess
        });


    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Handle user keyboard input
    document.onkeyup = function(e)
    {
        e = e || window.event;
        if(!DidGameStart)
        {
            //Game didn't start yet. If user pressed ENTER, start the game
            switch(e.key)
            {
                case "Enter":
                    //Start!
                    PlayGame();
                    break;
            }
        }
        else
        {
            //The game has started, so listen for specific commands.
            switch(e.key)
            {
                case "ArrowUp":
                    console.log('up');
                    break;
                case "ArrowDown":
                    console.log('down');
                    break;
                case "ArrowLeft":
                    console.log('left');
                    break;
                case "ArrowRight":
                    console.log('right');
                    break;                                        
            }
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Initialize the game
    InitGame();
    //-----------------------------------------------------------------------------------------------------------------------------
})();