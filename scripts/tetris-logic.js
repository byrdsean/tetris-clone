'use strict';
(function () {

    //Constants
    const GAME_BOARD_MAX_WIDTH = 16;    //Number of pieces of the game board's width
    const GAME_BOARD_MAX_HEIGHT = 20;   //Number of pieces of the game board's height
    const NEXT_BOARD_MAX_WIDTH = 6;     //Number of pieces of the next board's width
    const NEXT_BOARD_MAX_HEIGHT = 4;    //Number of pieces of the next board's height
    const TETRAMINO_SIZE = 30;          //Size (pixels) of the tetramino's height/width

    const INCREASE_LEVEL_MAX = 200;      //Amount to increase the level's max points to go to the next level
    const MAX_LEVELS_IN_GAME = 3;       //Maximum levels in the game
    const POINT_COMPLETE_ROW = 20;      //Amount of points user gets for completing 1 row
    
    const INCREASE_SPEED_AMOUNT = 150;  //Increase the speed of the game by a certain amount
    
    const FIXED_BLOCK_OFFSET = 1000;    //Offset the Id of a fixed block on the gameboard, so we can differentiate
                                        //between previous blocks and current blocks of the same tetramino

    //Game components
    let GameCanvas = null;
    let NextCanvas = null;
    let BoardInfo = [];                 //2D array
    let AllTetraminos = {};
    let PointsDisplay = null;
    let LevelDisplay = null;
    let PointsLevelUpDisplay = null;
    
    //Variables
    let DidGameStart = false;
    let IsGameOver = false;
    let Colors = {
        red : '#FF0000',
        blue : '#0000FF',
        //yellow : '#FFFF00',
        yellow: '#D4AC0D',
        green : '#00FF00',
        purple : '#3700FF',
        orange : '#FFA500',
        brown : '#964B00',
        white: '#FFFFFF',
        black: '#000000',
        gray: '#808080',
        boardColor: '#000000',
        boardBackground: '#FAE5D3'
    };
    let GameBoardStates = {
        Empty: 0,
        Invalid: -1
    };
    let Progress = {
        CurrentLevel : 1,
        CurrentPoints : 0,

        //Amount of time the loop waits, in milliseconds
        GameLoopWaitTime: 500,

        //Set the initial block to display the next tetramino
        InitialBlock : {x: Math.floor((GAME_BOARD_MAX_WIDTH - 1) / 2), y: 0},

        //Current Tetramino, and its rotation
        CurrentRotation: 0,
        CurrentAnchor: null,
        CurrentTetramino: null,
        NextTetramino: null,

        //Get the current points needed to reach the next level
        PointsToNextLevel : (level) => {return level * INCREASE_LEVEL_MAX;}
    };

    //Tetraminos
    //Each tetramino contains:
    //Color of its blocks
    //How to map the x and y coordinates for each rotation
    let L_Tetramino = {
        id: 1,
        color: Colors.red,
        rotations : [
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 0, y : 1}, {x : 0, y : 2}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 2, y : 0}, {x : 2, y : 1}],
            [{x : 1, y : 0}, {x : 1, y : 1}, {x : 1, y : 2}, {x : 0, y : 2}],
        ]
    };
    let Reverse_L_Tetramino = {
        id: 2,
        color: Colors.blue,
        rotations : [
            [{x : 2, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 0, y : 2}, {x : 1, y : 2}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 2, y : 0}, {x : 0, y : 1}],
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 1, y : 1}, {x : 1, y : 2}],
        ]
    };
    let Z_Tetramino = {
        id: 3,
        color: Colors.yellow,
        rotations : [
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 1, y : 1}, {x : 2, y : 1}],
            [{x : 1, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 0, y : 2}]
        ]
    };
    let S_Tetramino = {
        id: 4,
        color: Colors.green,
        rotations : [
            [{x : 1, y : 0}, {x : 2, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}],
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 1, y : 2}]
        ]
    };
    let T_Tetramino = {
        id: 5,
        color: Colors.gray,
        rotations : [
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 2, y : 0}, {x : 1, y : 1}],
            [{x : 1, y : 0}, {x : 1, y : 1}, {x : 1, y : 2}, {x : 0, y : 1}],
            [{x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}, {x : 1, y : 0}],
            [{x : 0, y : 0}, {x : 0, y : 1}, {x : 0, y : 2}, {x : 1, y : 1}]
        ]
    };
    let Block_Tetramino = {
        id: 6,
        color: Colors.brown,
        rotations : [
            [{x : 0, y : 0}, {x : 1, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}]
        ]
    };
    let Line_Tetramino = {
        id: 7,
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

        //Set the board for the next tetramino
        let NextBoardElemet = document.querySelector('.NextBoard');
        NextCanvas = NextBoardElemet.getContext("2d");

        //Set additional game components
        PointsDisplay = document.querySelector('.points');
        PointsLevelUpDisplay = document.querySelector('.levelup');
        LevelDisplay = document.querySelector('.level');
        
        //Display initial points
        DisplayLevel();
        DisplayPoints();
        DisplayLevelUpDisplay();

        //Store all tetraminos into a dictionary
        AllTetraminos[L_Tetramino.id] = L_Tetramino;
        AllTetraminos[Reverse_L_Tetramino.id] = Reverse_L_Tetramino;
        AllTetraminos[Z_Tetramino.id] = Z_Tetramino;
        AllTetraminos[S_Tetramino.id] = S_Tetramino;
        AllTetraminos[Block_Tetramino.id] = Block_Tetramino;
        AllTetraminos[Line_Tetramino.id] = Line_Tetramino;
        AllTetraminos[T_Tetramino.id] = T_Tetramino;

        //Build the game board model
        for(let c = 0; c < GAME_BOARD_MAX_WIDTH; c++)
        {
            let Column = [];
            for(let r = 0; r < GAME_BOARD_MAX_HEIGHT; r++)
            {
                Column.push(GameBoardStates.Empty);
                DrawBlock(r, c, Colors.boardBackground);
            }
            BoardInfo.push(Column);
        }

        //Reset the progress variables
        ResetProgress();
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Reset the progress
    function ResetProgress()
    {
        Progress.CurrentPoints = 0;
        Progress.CurrentRotation = 0;
        Progress.CurrentAnchor = null;
        Progress.CurrentTetramino = null;
        Progress.NextTetramino = null;
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Display the points to level up
    function DisplayLevelUpDisplay()
    {
        //Display the points to reach the next level
        PointsLevelUpDisplay.innerHTML = Progress.PointsToNextLevel(Progress.CurrentLevel).toString();
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Display level
    function DisplayLevel()
    {
        LevelDisplay.innerHTML = Progress.CurrentLevel.toString();
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Display points
    function DisplayPoints()
    {
        PointsDisplay.innerHTML = Progress.CurrentPoints.toString();
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Get a random tetramino
    function GetRandomTetramino()
    {
        let keys = Object.keys(AllTetraminos);
        let Index = Math.floor(Math.random() * keys.length);
        return AllTetraminos[keys[Index]];
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Get the new coordinates for a tetramino
    function GetTetraminoCoords(anchorX, anchorY, rotation, tetramino)
    {
        //Set the rotation if needed
        if(rotation === null || rotation === undefined)
        {
            rotation = Progress.CurrentRotation;
        }

        if(tetramino === null || tetramino === undefined)
        {
            tetramino = Progress.CurrentTetramino;
        }

        //Get the display coordinates
        let DisplayCoords = tetramino.rotations[rotation].map(coord => {
            return {
                x: coord.x + anchorX,
                y: coord.y + anchorY,
            }
        });
        return DisplayCoords;
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Check if the coordinates to display are valid (can be placed on the game board)
    function CheckValidCoordinates(DisplayCoords)
    {
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
            if(!(CurrentBlockStatus === GameBoardStates.Empty || CurrentBlockStatus === Progress.CurrentTetramino.id))
            {
                IsValidPosition = false;
                break;
            }
        }
        return IsValidPosition;
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Remove the Tetramino from its current coordinates
    function RemoveTetramino(rotation)
    {
        let OldCoords = GetTetraminoCoords(Progress.CurrentAnchor.x, Progress.CurrentAnchor.y, rotation);
        for(let i = 0; i < OldCoords.length; i++)
        {
            let OldX = OldCoords[i].x;
            let OldY = OldCoords[i].y;

            //Clear the value
            BoardInfo[OldX][OldY] = GameBoardStates.Empty;

            //Draw a blank block
            DrawBlock(OldX, OldY, Colors.boardBackground);
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Try to rotate the tetramino    
    function RotateTetramino()
    {
        //Set the proposed new rotation
        let OriginalRotation = Progress.CurrentRotation;
        let NextRotation = (Progress.CurrentRotation + 1) % Progress.CurrentTetramino.rotations.length;
        Progress.CurrentRotation = NextRotation;

        //Get the array of new coords to display the tetramino
        let DisplayCoords = GetTetraminoCoords(Progress.CurrentAnchor.x, Progress.CurrentAnchor.y);

        //Check that the new coordinates are valid
        let IsValidPosition = CheckValidCoordinates(DisplayCoords);

        //If the position is valid, draw the tetramino in the new position
        if(IsValidPosition)
        {
            //Remove the current tetramino from the board
            RemoveTetramino(OriginalRotation);

            //Draw the current tetramino with the new rotation
            MoveTetramino(Progress.CurrentAnchor.x, Progress.CurrentAnchor.y);
        }
        else
        {
            //Set the old rotation value back
            Progress.CurrentRotation = OriginalRotation;
        }

        //return the validation flag
        return IsValidPosition;
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Try to display the tetramino. Returns true or false flag to know if the tetramino was placed
    //anchorX: X coordinate we want to anchor the tetramino to
    //anchorY: Y coordinate we want to anchor the tetramino to
    function MoveTetramino(anchorX, anchorY)
    {
        let IsValidPosition = false;

        if(Progress.CurrentTetramino !== null && Progress.CurrentTetramino !== undefined)
        {
            //Get the array of new coords to display the tetramino
            let DisplayCoords = GetTetraminoCoords(anchorX, anchorY);

            //Check that the new coordinates are valid
            IsValidPosition = CheckValidCoordinates(DisplayCoords);

            //Display the tetramino
            if(IsValidPosition)
            {
                //Remove the current tetramino
                RemoveTetramino();

                //Display the tetramino in the new coordinates, and set the new anchor coordinates
                let NewAnchor = {x : null, y : null};
                for(let i = 0; i < DisplayCoords.length; i++)
                {
                    let NewX = DisplayCoords[i].x;
                    let NewY = DisplayCoords[i].y;

                    //Set the minimum values of x and y, which will be uses as the new anchor
                    NewAnchor.x = NewAnchor.x === null ? NewX : Math.min(NewAnchor.x, NewX);
                    NewAnchor.y = NewAnchor.y === null ? NewY : Math.min(NewAnchor.y, NewY);

                    //Set the board values
                    BoardInfo[NewX][NewY] = Progress.CurrentTetramino.id;

                    //Draw the block for the tetramino
                    DrawBlock(NewX, NewY, Progress.CurrentTetramino.color, Colors.white);
                }

                //Set the new anchor
                Progress.CurrentAnchor = NewAnchor;
            }
        }

        //return the success flag
        return IsValidPosition;
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Move the tetramino down.
    function MoveDown()
    {
        let SuccessfulPlacement = MoveTetramino(Progress.CurrentAnchor.x, Progress.CurrentAnchor.y + 1);

        //If the placement was UNsuccessful, then set the appropriate board values to the offset ID for the tetramino
        if(!SuccessfulPlacement)
        {
            let DisplayCoords = GetTetraminoCoords(Progress.CurrentAnchor.x, Progress.CurrentAnchor.y);
            for(let i=0; i<DisplayCoords.length;i++)
            {
                let Coords = DisplayCoords[i];
                BoardInfo[Coords.x][Coords.y] = FIXED_BLOCK_OFFSET + Progress.CurrentTetramino.id;
            }
        }

        //return the flag
        return SuccessfulPlacement;
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Move the tetramino left.
    function MoveLeft()
    {
        return MoveTetramino(Progress.CurrentAnchor.x-1, Progress.CurrentAnchor.y);
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Move the tetramino right.
    function MoveRight()
    {
        return MoveTetramino(Progress.CurrentAnchor.x+1, Progress.CurrentAnchor.y);
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Draw a block to the screen
    function DrawBlock(x, y, color, borderColor, SelectCanvas)
    {
        if(SelectCanvas === null || SelectCanvas === undefined)
        {
            SelectCanvas = GameCanvas;
        }

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
            SelectCanvas.fillStyle = borderColor;
            SelectCanvas.fillRect(x_pos, y_pos, TETRAMINO_SIZE, TETRAMINO_SIZE);

            //Set the border width
            BorderWidth = 1;
        }
        
        //Display the main block
        SelectCanvas.fillStyle = color;
        SelectCanvas.fillRect(
            x_pos + BorderWidth,
            y_pos + BorderWidth,
            TETRAMINO_SIZE - (2*BorderWidth),
            TETRAMINO_SIZE - (2*BorderWidth)
        );
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Set a new tetramino, and display it to the board
    function SetNewTetramino()
    {
        //Set the new current tetramino
        Progress.CurrentTetramino = (Progress.NextTetramino !== null && Progress.NextTetramino !== undefined)
            ? Progress.NextTetramino
            : GetRandomTetramino();

        //Reset the initial block and the next tetramino
        Progress.CurrentAnchor = Progress.InitialBlock;
        Progress.NextTetramino = GetRandomTetramino();
        Progress.CurrentRotation = 0;

        //Display the tetramino
        let DisplaySuccess = MoveTetramino(Progress.CurrentAnchor.x, Progress.CurrentAnchor.y);

        //Get the coordinates to draw the next tetramino in the appropriate canvas
        let NextCoords = GetTetraminoCoords(1, 1, 0, Progress.NextTetramino);
        if(NextCoords !== null && NextCoords !== undefined && 0 < NextCoords.length)
        {
            //Clear the next canvas
            for(let x=0; x<NEXT_BOARD_MAX_WIDTH; x++)
            {
                for(let y=0; y<NEXT_BOARD_MAX_HEIGHT; y++)
                {
                    DrawBlock(x, y, Colors.boardBackground, null, NextCanvas);
                }
            }

            //Draw the next tetramino
            for(let i=0; i<NextCoords.length;i++)
            {
                let Coords = NextCoords[i];
                DrawBlock(Coords.x, Coords.y, Progress.NextTetramino.color, Colors.white, NextCanvas);
            }
        }

        //return the success flag
        return DisplaySuccess;
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Check if we should remove a complete line of blocks
    function CheckCompletedLines()
    {
        //Get the array of new coords to display the tetramino
        let DisplayCoords = GetTetraminoCoords(Progress.CurrentAnchor.x, Progress.CurrentAnchor.y);

        //Loop through the display coordinates, and check each distinct Y value's row to see if the row is complete
        let YSet = new Set();
        for(let i=0; i<DisplayCoords.length;i++)
        {
            let CoordY = DisplayCoords[i].y;
            if(!YSet.has(CoordY))
            {
                //Add the coordinate to the set, so we don't risk evaluating the same row multiple times
                YSet.add(CoordY);

                //Check the row to see if it is complete
                let BlocksInUse = 0;
                for(let x=0; x<GAME_BOARD_MAX_WIDTH; x++)
                {
                    if(0 < BoardInfo[x][CoordY])
                    {
                        BlocksInUse++;
                    }
                }

                //If "BlocksInUse" === GAME_BOARD_MAX_WIDTH, then the entire row is complete.
                //Update the user's points, remove the row, and push all rows above down by 1
                if(BlocksInUse === GAME_BOARD_MAX_WIDTH)
                {
                    //Remove the row
                    for(let x=0; x<GAME_BOARD_MAX_WIDTH; x++)
                    {
                        //Set the block as empty, and draw an empty block
                        BoardInfo[x][CoordY] = GameBoardStates.Empty;
                        DrawBlock(x, CoordY, Colors.boardBackground);
                    }

                    //Push all rows above down by 1
                    for(let y=CoordY; y>=0; y--)
                    {
                        let YAbove = y - 1;
                        let HasRowAbove = YAbove >= 0;
                        for(let x=0; x<GAME_BOARD_MAX_WIDTH; x++)
                        {
                            if(HasRowAbove)
                            {
                                //Copy the value of the block above. Then redraw the block above into the existing block
                                BoardInfo[x][y] = BoardInfo[x][YAbove];

                                //Draw the appropriate block
                                switch(BoardInfo[x][y])
                                {
                                    case GameBoardStates.Empty:
                                        DrawBlock(x, y, Colors.boardBackground);
                                        break;
                                    default:
                                        if(0 < BoardInfo[x][y])
                                        {
                                            DrawBlock(x, y, AllTetraminos[BoardInfo[x][y] - FIXED_BLOCK_OFFSET].color, Colors.white);
                                        }
                                        break;
                                }
                            }
                            else
                            {
                                //There is no row above, so the the block to empty, and draw an empy block
                                BoardInfo[x][y] = GameBoardStates.Empty;
                                DrawBlock(x, y, Colors.boardBackground);
                            }
                        }
                    }

                    //Update the user's points and display
                    Progress.CurrentPoints += POINT_COMPLETE_ROW;
                    DisplayPoints();
                }                
            }
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Clear the game loop
    function ClearGameLoop(ClearIntervalID)
    {
        clearInterval(ClearIntervalID);

        //Reset flag to know that the current game has ended.
        DidGameStart = false;
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Start the game loop
    function StartGameLoop()
    {
        //Set the game loop to move the tetramino down
        let ClearIntervalID = setInterval(function(){

            //Set the new tetramino if needed
            let SuccessfulPlacement = false;
            if(Progress.CurrentTetramino === null || Progress.CurrentTetramino === undefined)
            {
                //Set a new random tetramino to the board
                SuccessfulPlacement = SetNewTetramino();
            }
            else
            {
                //Try to move the existing tetramino down
                SuccessfulPlacement = MoveDown();
            }

            //If the move was UNsuccessful, then the tetramino can no longer move down.
            //Set the next tetramino to play
            if(!SuccessfulPlacement)
            {
                //Check if we should remove a complete line of blocks
                CheckCompletedLines();

                //Check if the user reached the points for the next level
                let PointsToLevelUp = Progress.PointsToNextLevel(Progress.CurrentLevel);
                if(PointsToLevelUp <= Progress.CurrentPoints)
                {
                    //Stop the game loop
                    ClearGameLoop(ClearIntervalID);

                    //Check if the user should level up, or won the game
                    if(Progress.CurrentLevel < MAX_LEVELS_IN_GAME)
                    {
                        //Level up
                        Progress.CurrentLevel += 1;
                        DisplayLevel();

                        //Reset the board
                        for(let x = 0; x < GAME_BOARD_MAX_WIDTH; x++)
                        {
                            for(let y = 0; y < GAME_BOARD_MAX_HEIGHT; y++)
                            {
                                BoardInfo[x][y] = GameBoardStates.Empty;
                                DrawBlock(x, y, Colors.boardBackground);
                            }
                        }

                        //Reset progress
                        ResetProgress();

                        //Increase speed by decreasing the wait interval
                        //Ensure that it never goes below 10 milliseconds
                        Progress.GameLoopWaitTime -= INCREASE_SPEED_AMOUNT;
                        if(Progress.GameLoopWaitTime < 10)
                        {
                            Progress.GameLoopWaitTime = 10;
                        }
                    }
                    else
                    {
                        //The user beat the game!
                        PointsDisplay.innerHTML = 'You win! Thanks for playing!'                        
                    }
                }
                else
                {
                    //Set a new random tetramino to the board
                    let DisplaySuccess = SetNewTetramino();

                    //If the tetramino could not be placed, end the loop
                    if(!DisplaySuccess)
                    {
                        PointsDisplay.innerHTML = 'Sorry, you lose. GAME OVER'
                        ClearGameLoop(ClearIntervalID);
                        IsGameOver = true;
                    }
                }
            }
        }, Progress.GameLoopWaitTime);
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Play the game
    function PlayGame()
    {
        //Set flag to start the game
        DidGameStart = true;

        //Display the points to reach the next level
        DisplayLevelUpDisplay();

        //Start the game loop
        StartGameLoop();
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Handle user keyboard input
    document.onkeyup = function(e)
    {
        e = e || window.event;
        if(!IsGameOver)
        {
            if(!DidGameStart)
            {    
                //Game didn't start yet. If user pressed ENTER, start the game
                switch(e.key)
                {
                    case "Enter":
                        //Start playing!
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
                        e.preventDefault();
                        RotateTetramino();
                        break;
                    case "ArrowDown":
                        e.preventDefault();
                        MoveDown();
                        break;
                    case "ArrowLeft":
                        e.preventDefault();
                        MoveLeft();
                        break;
                    case "ArrowRight":
                        e.preventDefault();
                        MoveRight();
                        break;                                        
                }
            }
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Initialize the game
    InitGame();
    //-----------------------------------------------------------------------------------------------------------------------------
})();