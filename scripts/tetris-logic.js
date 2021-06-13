'use strict';
(function () {

    //Constants
    const GAME_BOARD_MAX_WIDTH = 16;    //Number of pieces of the game board's width
    const GAME_BOARD_MAX_HEIGHT = 20;   //Number of pieces of the game board's height
    const TETRAMINO_SIZE = 30;          //Size (pixels) of the tetramino's height/width
    const INCREASE_LEVEL_MAX = 100;     //Amount to increase the level's max points to go to the next level
    const MAX_LEVELS_IN_GAME = 10;      //Maximum levels in the game
    const POINT_COMPLETE_ROW = 20;      //Amount of points user gets for completing 1 row
    const FIXED_BLOCK_OFFSET = 1000;    //Offset the Id of a fixed block on the gameboard, so we can differentiate
                                        //between previous blocks and current blocks of the same tetramino

    //Game components
    let GameCanvas = null;
    let BoardInfo = [];                 //2D array
    let AllTetraminos = {};
    let PointsDisplay = null;
    
    //Variables
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
        gray: '#808080',
        boardColor: '#000000'
    };
    let GameBoardStates = {
        Empty: 0,
        Invalid: -1
    };
    let Progress = {
        CurrentLevel : 1,
        CurrentPoints : 0,

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

        //Set additional game components
        PointsDisplay = document.querySelector('.points');

        //Store all tetraminos into a dictionary
        AllTetraminos[L_Tetramino.id] = L_Tetramino;
        AllTetraminos[Reverse_L_Tetramino.id] = Reverse_L_Tetramino;
        AllTetraminos[Z_Tetramino.id] = Z_Tetramino;
        AllTetraminos[S_Tetramino.id] = S_Tetramino;
        AllTetraminos[Block_Tetramino.id] = Block_Tetramino;
        AllTetraminos[Line_Tetramino.id] = Line_Tetramino;
        AllTetraminos[T_Tetramino.id] = T_Tetramino;

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
        let keys = Object.keys(AllTetraminos);
        let Index = Math.floor(Math.random() * keys.length);
        return AllTetraminos[keys[Index]];
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Get the new coordinates for a tetramino
    function GetTetraminoCoords(anchorX, anchorY, rotation)
    {
        //Set the rotation if needed
        if(rotation === null || rotation === undefined)
        {
            rotation = Progress.CurrentRotation;
        }

        //Get the display coordinates
        let DisplayCoords = Progress.CurrentTetramino.rotations[rotation].map(coord => {
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
            DrawBlock(OldX, OldY, Colors.black);
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
                        DrawBlock(x, CoordY, Colors.black);
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
                                        DrawBlock(x, y, Colors.black);
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
                                DrawBlock(x, y, Colors.black);
                            }
                        }
                    }

                    //Update the user's points and display
                    Progress.CurrentPoints += POINT_COMPLETE_ROW;
                    PointsDisplay.innerHTML = Progress.CurrentPoints.toString();
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

    //Play the game
    function PlayGame()
    {
        //Set flag to start the game
        DidGameStart = true;

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
                
                //Set a new random tetramino to the board
                let DisplaySuccess = SetNewTetramino();

                //If the tetramino could not be placed, end the loop
                if(!DisplaySuccess)
                {
                    ClearGameLoop(ClearIntervalID);
                }
            }
        }, 300);//1000
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
                    console.log('up');
                    RotateTetramino();
                    break;
                case "ArrowDown":
                    console.log('down');
                    MoveDown();
                    break;
                case "ArrowLeft":
                    console.log('left');
                    MoveLeft();
                    break;
                case "ArrowRight":
                    console.log('right');
                    MoveRight();
                    break;                                        
            }
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------

    //Initialize the game
    InitGame();
    //-----------------------------------------------------------------------------------------------------------------------------
})();