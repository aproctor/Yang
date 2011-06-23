/***********************
 * Redit Game Jam 2010 submission
 *
 * Title: Yang
 * Author: Adam Proctor
 * Theme: Opposites
 ******/
var MOVE_UP = 0;
var MOVE_DOWN = 1;
var MOVE_LEFT = 2;
var MOVE_RIGHT = 3;
var MAIN_STATE_GAME = 0;
var MAIN_STATE_MENU = 1;
var GAME_STATE_PLAY = 0;
var GAME_STATE_OVER = 1;
var GAME_STATE_WON = 2;

var randInt = function(min,max){
	return Math.round(min + Math.random()*(max-min));
};
var randBool = function() {
	return (Math.random() < 0.5);
};

var PuzzleGame = function(){};
PuzzleGame.prototype = {	
	masterVolume: 0.2,
	mainState: null,
	gameState: null,
	board: null,
	
	/*
	 * State Constants
	 */
	
	audio: null,
	keyListeners: null,
	
	init: function() {	
		this.board = new GameBoard();
		this.board.defaultSettings();
	
		this.mainState = MAIN_STATE_MENU;
		this.gameState = GAME_STATE_PLAY;
		this.audio = {};
		this.audio.splash = document.getElementById('splashOgg');
		this.audio.bong = document.getElementById('bongOgg');
		this.audio.move = document.getElementById('moveOgg');
		this.audio.music = document.getElementById('musicOgg');
		this.adjustVolume();
		
		//createKeyListeners
		this.keyListeners = [];
		this.keyListeners.push(new YAHOO.util.KeyListener(document, { keys:[8, 27,37,38,39,40,65,68,83,87] }, { fn:this.keyHandler } ));
		this.keyListeners.push(new YAHOO.util.KeyListener(document, { keys:[90], ctrl: true }, { fn:this.ctrlKeyHandler} ));
    		this.keyListeners[0].enable();
    		this.keyListeners[1].enable();
	},
	
	adjustVolume: function() {
		this.audio.music.volume = this.masterVolume;
		this.audio.move.volume = this.masterVolume;
		this.audio.bong.volume = this.masterVolume;
		this.audio.splash.volume = this.masterVolume;
	},
	
	keyHandler: function(e,args) {
		if(args && args[1]) {
		
			if(game.gameState === GAME_STATE_PLAY) {
				if(27 == args[0]) {
					this.board.randomBoard();
				} else if(8 == args[0]) {
					this.board.resetLevel();
				} else {
					var move = 0;
					if(38 == args[0]) {
						move = MOVE_DOWN;
					} else if(40 == args[0]) {
						move = MOVE_UP;
					} else if(37 == args[0]) {
						move = MOVE_RIGHT;
					} else if(39 == args[0]) {
						move = MOVE_LEFT;
					} else if(83 == args[0]) {
						move = MOVE_DOWN;
					} else if(87 == args[0]) {
						move = MOVE_UP;
					} else if(68 == args[0]) {
						move = MOVE_RIGHT;
					} else if(65 == args[0]) {
						move = MOVE_LEFT;
					}
					this.board.movePieces(move);
				}
			}
			 YAHOO.util.Event.stopEvent(args[1]);
		}
	},
	
	ctrlKeyHandler: function(e,args) {
		if(args && args[0]) {
			if(game.gameState === GAME_STATE_PLAY) {
				if(90 == args[0]) { //'z'
					this.board.undoMove();
				}
			}
		}
	},

	muted: false,	
	toggleSound: function(el) {		
		this.muted = !this.muted;
    		if(this.muted) {
    			YAHOO.util.Dom.addClass(el,'btn-sound-off');
    			YAHOO.util.Dom.removeClass(el,'btn-sound-on');
    		} else {
    			YAHOO.util.Dom.addClass(el,'btn-sound-on');
    			YAHOO.util.Dom.removeClass(el,'btn-sound-off');
    		}      		
    		this.audio.music.muted = this.muted;
    	},
	
	toString: function() {
		return "Puzzle Game by Adam Proctor";
	}
};
var game = new PuzzleGame();


var GameCell = function(){};
GameCell.prototype = {
	x: 0,
	y: 0,	
	wallUp: false,
	wallDown: false,
	wallLeft: false,
	wallRight: false,
	
	water: false,
	optimalPath: false,
	
	toString: function() {
		return 'GameCell('+this.x+','+this.y+')';
	}
};

var GameBoard = function(){};
GameBoard.prototype = {
	/******************
	 *     Properties     *
	 ******************/
	height: 8,
	width: 8,
	waterProbability: 0.1,
	wallProbability: 0.1,
	numberOfOptimalMoves: 7,
	originPlacementTolerance: 2,
	
	/************************
	 *    Game State Fields   *
	 ************************/
	goalX: 0,
	goalY: 0,
	yinStart: null,
	yangStart: null,
	moves: 0,	
	
	tiles: null,
	yinCell: null,
	yangCell: null,
	ctx: null,
	moveStack: null,
	solutionStack: null,
	
	/******************
	 *     Functions  *
	 ******************/
	update: function() {
		//TODO
	},
	
	shadowOn: function() {
		this.ctx.shadowOffsetX = 1;  
		this.ctx.shadowOffsetY = 1;  
		this.ctx.shadowBlur = 2;  
		this.ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
	},
	
	shadowOff: function() {
		this.ctx.shadowOffsetX = 0;  
		this.ctx.shadowOffsetY = 0;  
		this.ctx.shadowBlur = 0;  
		this.ctx.shadowColor = "rgba(0, 0, 0, 0)";
	},
	
	draw: function() {
		var cellSize = 75;
		var boardPadding = 0;
		
		this.shadowOff();
		var ptrn = this.ctx.createPattern(document.getElementById('sandBg'),'repeat');
		this.ctx.fillStyle = ptrn;    		
		//this.ctx.fillStyle = "white";
		this.ctx.fillRect(boardPadding,boardPadding,cellSize*this.width,cellSize*this.height)
		this.ctx.fillStyle = "black";
		
		var pondSprite = document.getElementById('pondSprite');
		
		this.shadowOn();
		for(var i = 0; i < this.width; i++) {
			for(var j = 0; j < this.height; j++) {	
				var cell = this.tiles[i][j];
				
				var cellPosX = cell.x*cellSize + boardPadding;
				var cellPosY = cell.y*cellSize + boardPadding;
								
				if(cell.water == true) {
					this.shadowOff();
					this.ctx.drawImage(pondSprite,cellPosX,cellPosY,75,75);
					this.shadowOn();
				}

				if(cell.wallUp) {
					this.ctx.beginPath();
					this.ctx.moveTo(cellPosX,cellPosY);
					this.ctx.lineTo(cellPosX+cellSize,cellPosY);
					this.ctx.stroke();
				}
				if(cell.wallDown) {
					this.ctx.beginPath();
					this.ctx.moveTo(cellPosX,cellPosY+cellSize);
					this.ctx.lineTo(cellPosX+cellSize,cellPosY+cellSize);
					this.ctx.stroke();
				}
				if(cell.wallLeft) {
					this.ctx.beginPath();
					this.ctx.moveTo(cellPosX,cellPosY);
					this.ctx.lineTo(cellPosX,cellPosY+cellSize);
					this.ctx.stroke();
				}
				if(cell.wallRight) {
					this.ctx.beginPath();
					this.ctx.moveTo(cellPosX+cellSize,cellPosY);
					this.ctx.lineTo(cellPosX+cellSize,cellPosY+cellSize);
					this.ctx.stroke();
				}
			}
		}
		
		//draw pieces
		this.shadowOff();
		var originSprite = document.getElementById('originSprite');
		this.ctx.drawImage(originSprite, this.goalX*cellSize+boardPadding, this.goalY*cellSize+boardPadding,75,75);
		this.shadowOn();
		
		var yinSprite = document.getElementById('yinSprite');
		this.ctx.drawImage(yinSprite,this.yinCell.x*cellSize+boardPadding,this.yinCell.y*cellSize+boardPadding,75,75);
		var yangSprite = document.getElementById('yangSprite');
		this.ctx.drawImage(yangSprite,this.yangCell.x*cellSize+boardPadding,this.yangCell.y*cellSize+boardPadding,75,75);
		
		//Draw number of moves
		this.ctx.font = "bold 20px Arial";  
		this.ctx.fillStyle = "white";  
		this.ctx.fillText("Moves: "+this.moves, 5, 20); 
		this.shadowOff();
		
		if(game.gameState == GAME_STATE_OVER) {
			var gameOvrEl = document.getElementById('gameOvr');
			this.ctx.drawImage(gameOvrEl,boardPadding,boardPadding,600,600);
		}
		
 
	},
	
	randomCell: function(posX, posY) {
		var maxWalls = 3;
		var newCell = new GameCell();
		
		newCell.x = posX;
		newCell.y = posY;
		
		var wallCount = 0;
		/*
		 * Randomize the wall positions
		 * Forgive me for this, it makes me happy
		 */
		newCell.wallLeft = (posX === 0 || Math.random() < this.wallProbability);
		newCell.wallRight = (posX == this.width-1 || Math.random() < this.wallProbability);
		newCell.wallUp = (posY === 0 || Math.random() < this.wallProbability);
		newCell.wallDown = (posY == this.height-1 || Math.random() < this.wallProbability);		
		
		return newCell;
	},	
	
	//Create a new board
	randomBoard: function(recursionFlag) {
		//clear the tiles
		this.tiles = new Array(this.width);
		this.solutionStack = [];
		this.moveStack = [];		
	
		//randomly generate new tiles with walls	
		for(var k = 0; k < this.width; k++) {
			this.tiles[k] = new Array(this.height);			
			for(var l = 0; l < this.height; l++) {
				this.tiles[k][l] = this.randomCell(k,l);
			}
		}
		
		/*
		 * merge wall data, this may seem a bit redundant now
		 * but it will make the constant movement evaluations
		 * much easier in the future.
		 */ 
		for(var i = 0; i < this.width; i++) {
			for(var j = 0; j < this.height; j++) {				
				//check left
				if(i > 0 && this.tiles[i-1][j].wallRight === true) {
					this.tiles[i][j].wallLeft = true;	
				}
				//check right
				if(i < this.width-1 && this.tiles[i+1][j].wallLeft === true) {
					this.tiles[i][j].wallRight = true;	
				}
				//check up
				if(j > 0 && this.tiles[i][j-1].wallDown === true) {
					this.tiles[i][j].wallUp = true;	
				}				
				//check down
				if(j < this.height-1 && this.tiles[i][j+1].wallUp === true) {
					this.tiles[i][j].wallDown = true;	
				}
			}
		}
		
		//randomize the origin
		this.goalX = Math.floor(this.width/2) + randInt(0, this.originPlacementTolerance) - 1;
		this.goalY = Math.floor(this.height/2) + randInt(0, this.originPlacementTolerance) -1;
		
		//Check origin isn't irreversably boxed in by perpendicular walls
		var origin = this.tiles[this.goalX][this.goalY];
		if((origin.wallLeft || origin.wallRight) && (origin.wallUp || origin.wallDown)) {
			//pieces will never be able to reassemble, generate a new board
			if(recursionFlag) {
				recursionFlag++;	
			} else {
				recursionFlag = 1;
			}
			
			if(recursionFlag < 5) {
				this.randomBoard(recursionFlag);
				return;
			}
			//if not, the board parameters may be too restrictive to make a fair game			
		}
		
		
		
		/*
		 * Generate optimal puzzle path:
		 * start both pieces at the origin, then randomly
		 * move them apart to scramble them.
		 */
		this.yinCell = origin;
		this.yinCell.optimalPath = true;
		this.yangCell = this.yinCell;
		
		for(var c = 0; c < this.numberOfOptimalMoves; c++) {
			var move = randInt(0,3);
			this.movePieces(move, true);
			if(c === 0) {
				/*
				 * Validate the first move isn't pushing against a wall,
				 * as that leeds to unsolvable puzzles.
				 *
				 * We have already assured that walls around the origin
				 * cannot be perpendicular, so this shouldn't cause an
				 * endless loop
				 */
				 var firstMove = this.solutionStack.pop();
				 if(firstMove.yin === false || firstMove.yang === false) {
				 	c--; //try another move
				 } else {
				 	this.solutionStack.push(firstMove);
				 }
			}
			
			this.yinCell.optimalPath = true;
			this.yangCell.optimalPath = true;
		}

		this.yinStart = this.yinCell;
		this.yangStart = this.yangCell;
		this.moves = 0;

		
		//add water squares
		for(var k = 0; k < this.width; k++) {
			for(var l = 0; l < this.height; l++) {	
				if(this.tiles[k][l].optimalPath == false) {
					this.tiles[k][l].water = Math.random() < this.waterProbability;
				}
			}
		}
		
		game.gameState = GAME_STATE_PLAY;
		this.draw();
	},
	
	resetLevel: function() {
		this.moveStack = [];
		this.yinCell = this.yinStart;
		this.yangCell = this.yangStart;
		
		game.gameState = GAME_STATE_PLAY;
		this.draw();
	},
	
	/**
	 * Called to undo a move, or potentially if the player
	 * choses to move yin and not yang.
	 */
	movePiecesReverse: function(move, allowYin, allowYang) {
		var newMove = 0;
		if(move == MOVE_UP) {
			newMove = MOVE_DOWN;
		} else if(move == MOVE_DOWN) {
			newMove = MOVE_UP;
		} else if(move == MOVE_LEFT) {
			newMove = MOVE_RIGHT;
		} else if(move == MOVE_RIGHT) {
			newMove = MOVE_LEFT;
		}
		this.movePieces(newMove, false, allowYin, allowYang);
	},

	/* Move the pieces based on input.  Yin always mirrors Yang's movement.
	 * We always move Yang.
	 *
	 * Edit: Controls added to move Ying, but all movement is relative to
	 * Yang prior to entering the movePieces function
	 *
	 * The board should automatically place walls on all edge cases
	 * No need to check bounds
	 */	
	movePieces: function(move, setupBoardFlag, allowYin, allowYang) {
		this.moves++;
	
		/* When undoing a move, you may have to consider that the
		 * block was unable to move in the previous direction but
		 * can possibly move in the opposite direction.
		 *
		 * Since the arguments may not exist, we need to 
		 * do a strict comparison vs the false primitive type.
		 * it's
		 */
		var preventYin = (allowYin === false);
		var preventYang = (allowYang === false);
		
		var yinMoved = false;
		var yangMoved = false;
		
		if(move == MOVE_UP) {
			if(!preventYang && this.yangCell.wallUp === false) {
				yangMoved = true;
				this.yangCell = this.tiles[this.yangCell.x][this.yangCell.y-1];
			}
			if(!preventYin && this.yinCell.wallDown === false) {
				yinMoved = true;
				this.yinCell = this.tiles[this.yinCell.x][this.yinCell.y+1];
			}
		} else if(move == MOVE_DOWN) {
			if(!preventYang && this.yangCell.wallDown === false) {
				yangMoved = true;
				this.yangCell = this.tiles[this.yangCell.x][this.yangCell.y+1];
			}
			if(!preventYin && this.yinCell.wallUp === false) {
				yinMoved = true;
				this.yinCell = this.tiles[this.yinCell.x][this.yinCell.y-1];
			}
		} else if(move == MOVE_LEFT) {
			if(!preventYang && this.yangCell.wallLeft === false) {
				yangMoved = true;
				this.yangCell = this.tiles[this.yangCell.x-1][this.yangCell.y];
			}
			if(!preventYin && this.yinCell.wallRight === false) {
				yinMoved = true;
				this.yinCell = this.tiles[this.yinCell.x+1][this.yinCell.y];
			}
		} else if(move == MOVE_RIGHT) {
			if(!preventYang && this.yangCell.wallRight === false) {
				yangMoved = true;
				this.yangCell = this.tiles[this.yangCell.x+1][this.yangCell.y];
			}
			if(!preventYin && this.yinCell.wallLeft === false) {
				yinMoved = true;
				this.yinCell = this.tiles[this.yinCell.x-1][this.yinCell.y];
			}
		}
		
		if(setupBoardFlag !== true) {
			if(this.undoState !== true) {
				this.moveStack.push({mv: move, yin: yinMoved, yang: yangMoved});
			} else {
				this.undoState = false;
			}
			game.audio.move.play();
			this.validatePositions();
			this.draw();
		} else {
			this.solutionStack.push({mv: move, yin: yinMoved, yang: yangMoved});
		}
	},
	
	undoState: false,
	undoMove: function() {
		if(this.moveStack && this.moveStack.length > 0) {
			this.undoState = true;
			var moveRecord = this.moveStack.pop();
			this.movePiecesReverse(moveRecord.mv, moveRecord.yin, moveRecord.yang);
		}
		game.gameState = GAME_STATE_PLAY;
		this.draw();
	},
	
	validatePositions: function() {
		if(this.yinCell.water || this.yangCell.water) {
			//game over
			game.audio.splash.play();
			this.gameOver();
		} else {
			if(this.yinCell.x == this.yangCell.x &&
				this.yinCell.y == this.yangCell.y &&
				this.goalX == this.yinCell.x &&
				this.goalY == this.yinCell.y) {
				
				//game won
				game.audio.bong.play();
				game.gameState = GAME_STATE_WON;
				setTimeout(function(){game.board.randomBoard();}, 3000);
			}
		}
	},

	defaultSettings: function() {
		var fields = ['height', 'width', 'waterProbability', 'wallProbability', 'numberOfOptimalMoves', 'originPlacementTolerance'];
		
		for(var i = 0; i < fields.length; i++) {
			document.getElementById('config_'+fields[i]).value = this[fields[i]];
		}
		document.getElementById('config_waterProbability').value = this.waterProbability * 100;
		document.getElementById('config_wallProbability').value = this.wallProbability * 100;
		document.getElementById('config_volume').value = game.masterVolume * 100;
	},
	
	applySettings: function() {
		var fields = ['height', 'width', 'numberOfOptimalMoves', 'originPlacementTolerance'];
				
		for(var i = 0; i < fields.length; i++) {
			this[fields[i]] = document.getElementById('config_'+fields[i]).value;
		}
		this.waterProbability = document.getElementById('config_waterProbability').value / 100;
		this.wallProbability = document.getElementById('config_wallProbability').value / 100;
		game.masterVolume = document.getElementById('config_volume').value / 100;
		game.adjustVolume();
	},
	
	gameOver: function() {
		game.gameState = GAME_STATE_OVER;
	},
	
	toString: function() {
		var buffer = ["GameBoard - v1.0\n"];
		return buffer.join('');
	}
};