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
    
    //Variables
    let DidGameStart = false;
    let Colors = {
        red : '#FF0000',
        blue : '#0000FF',
        yellow : '#FFFF00',
        green : '#00FF00',
        purple : '#3700FF',
        orange : '#FFA500',
        white: '#FFFFFF',
        black: '#000000',
        boardColor: '#000000'
    };
    let GameBoardStates = {
        Empty: 0,
        InUse: 1,
        UseByTetraminoInPlay: 2
    };

    //Tetraminos
    //Each tetramino contains:
    //Color of its blocks
    //How to map the x and y coordinates for each rotation
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
        //BoardInfo = Array(GAME_BOARD_MAX_WIDTH).fill(Array(GAME_BOARD_MAX_HEIGHT).fill(0));
        for(let c = 0; c < GAME_BOARD_MAX_WIDTH; c++)
        {
            let Column = [];
            for(let r = 0; r < GAME_BOARD_MAX_HEIGHT; r++)
            {
                Column.push(GameBoardStates.Empty);
            }
            BoardInfo.push(Column);
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Start the game
    function StartGame()
    {
        //Set flag to know the game has started
        DidGameStart = true;

        //Play the game. Get flag to know if the user won or not
        let DidWin = PlayGame();
        
        
        
        
        
        
        
        
        
        
        
        //console.log(DidWin ? "Win!" : "Lose");
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Play the game. Returns end game state
    function PlayGame()
    {
        let DidWin = false;

        //Set the initial block to display the next tetramino
        let InitialBlock = {x: Math.floor((GAME_BOARD_MAX_WIDTH - 1) / 2), y: 0};
        
        //Continuously play until the user exceeds the max levels of the game
        let CurrentPoints = 0;
        let PointsToNextLevel = 0;
        for(let CurrentLevel = 1; CurrentLevel <= MAX_LEVELS_IN_GAME; CurrentLevel++)
        {
            //Re/set the points to level up
            CurrentPoints = 0;
            PointsToNextLevel += INCREASE_LEVEL_MAX;

            //Set the tetramino to play, and the next tetramino coming up
            let PlayTetramino = GetNextTetramino();
            let NextTetramino = GetNextTetramino();

            //Setthe block that anchors the tetramino to the board, and remember the previous one
            let AnchorBlock = InitialBlock;
            let PreviousAnchor = null;

            //Continuously display new tetraminos until:
            //a. The user reaches/exceeds the points needed to reach the next level
            //b. The user can not play any more tetraminos
            let TetraminoInPlay = false;
            do {
                // //Set the next tetramino to play, then set a new "next" tetramino
                // PlayTetramino = NextTetramino;
                // NextTetramino = GetNextTetramino();

                //Try to play the current tetramino
                if(!TetraminoInPlay)
                {
                    AnchorBlock = InitialBlock;
                    PreviousAnchor = null;
                    TetraminoInPlay = true;
                }
                else
                {
                    //Try to move the current tetramino down
                    PreviousAnchor = {x: AnchorBlock.x, y: AnchorBlock.y };
                    AnchorBlock.y = AnchorBlock.y + 1;
                }

                //Try to display the current tetramino to play
                //If we can't, the user lost
                AnchorBlock = DisplayTetramino(AnchorBlock, PreviousAnchor, PlayTetramino);
                if(AnchorBlock === null)
                {
                    //User lost
                    break;
                }






                CurrentPoints++;
            }
            while(CurrentPoints < PointsToNextLevel);
        }

        //return the flag to know if the user won or now
        return DidWin;
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Try to display the tetramino
    function DisplayTetramino(InitialBlock, PreviousAnchor, NextTetramino)
    {
        //Get the array of coords to display the tetramino
        let DisplayCoords = NextTetramino.rotations[0].map(coord => {
            return {
                x: coord.x + InitialBlock.x,
                y: coord.y + InitialBlock.y
            }
        });

        //Check if the tetramino can be placed on the board (empty or block is part of current tetremino)
        //Sums the values from the appropriate coordinates in the game board
        let ValidPositions = DisplayCoords.reduce((initVal, coord) => {
            let StateValue = GameBoardStates.Empty;
            {
                let CurrentVal = BoardInfo[coord.x][coord.y];
                if(CurrentVal !== GameBoardStates.Empty && CurrentVal !== GameBoardStates.UseByTetraminoInPlay)
                {
                    StateValue = GameBoardStates.InUse;
                }
            }
            return initVal + StateValue;
        }, 0);

        //Set the previous coordinates of the tetramino, if possible
        let PreviousCoords = null;
        if(PreviousAnchor !== null)
        {
            PreviousCoords = NextTetramino.rotations[0].map(coord => {
                return {
                    x: coord.x + PreviousAnchor.x,
                    y: coord.y + PreviousAnchor.y
                }
            });
        }

        //Validate the new position of the tetramino
        let Anchor = null;
        if(ValidPositions === 0)
        {
            //We can place the tetramino
            //1. Update the board
            //2. Draw the tetramino to the new positions on the screen

            //1. Update the board with the previous coordinates, if any
            if(PreviousCoords !== null)
            {
                ResetOrDrawTetramino(PreviousCoords, true, Colors.boardColor);
            }

            //2. Draw the tetramino to the new positions on the screen
            ResetOrDrawTetramino(DisplayCoords, false, NextTetramino.color, Colors.white);

            //Set the anchor, which are coordinates with the minimum x and y
            let x = null, y = null;
            for(let i=0; i<DisplayCoords.length; i++)
            {
                x = (x === null) ? DisplayCoords[i].x : Math.min(x, DisplayCoords[i].x);
                y = (y === null) ? DisplayCoords[i].y : Math.min(y, DisplayCoords[i].y);
            }
            Anchor = {x : x, y : y};
        }
        else
        {
            //Update the game board to set the tetramino's position as GameBoardStates.InUse
            if(PreviousCoords !== null)
            {
                for(let i = 0; i < PreviousCoords.length; i++)
                {
                    let coords = PreviousCoords[i];
                    BoardInfo[coords.x][coords.y] = GameBoardStates.InUse;
                }
            }
        }

        //return the coords of the block that anchors the tetramino to the board
        return Anchor;
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Draw the tetramino, or empty the board at those coordinates
    function ResetOrDrawTetramino(TetraminoCoords, IsReset, Color, BgColor)
    {
        let BoardVal = IsReset ? GameBoardStates.Empty : GameBoardStates.UseByTetraminoInPlay;
        for(let i=0; i < TetraminoCoords.length; i++)
        {
            let coord = TetraminoCoords[i];
            BoardInfo[coord.x][coord.y] = BoardVal;
        }

        //Display the tetramino
        TetraminoCoords.map(coords => {
            DrawBlock(coords.x, coords.y, Color, BgColor)
        });
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
