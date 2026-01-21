import React, { useState, useEffect } from 'react';

const BackgammonTutorial = () => {
  // Board setup: positive = white pieces, negative = black pieces
  // Points are numbered 1-24 from white's perspective
  const initialBoard = () => {
    const board = Array(24).fill(0);
    // White pieces - positive numbers
    board[0] = 2;   // Point 1
    board[11] = 5;  // Point 12
    board[16] = 3;  // Point 17
    board[18] = 5;  // Point 19
    // Black pieces - negative numbers
    board[23] = -2;  // Point 24
    board[12] = -5;  // Point 13
    board[7] = -3;   // Point 8
    board[5] = -5;   // Point 6
    return board;
  };

  const [board, setBoard] = useState(initialBoard());
  const [dice, setDice] = useState([]);
  const [movesLeft, setMovesLeft] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [turn, setTurn] = useState('white');
  const [gamePhase, setGamePhase] = useState('menu'); // menu, intro, roll, move, opponent, gameover
  const [gameMode, setGameMode] = useState(null); // 'tutorial', 'ai', 'twoplayer'
  const [whiteBar, setWhiteBar] = useState(0);
  const [blackBar, setBlackBar] = useState(0);
  const [whiteOff, setWhiteOff] = useState(0);
  const [blackOff, setBlackOff] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [message, setMessage] = useState('');
  const [highlightedPoints, setHighlightedPoints] = useState([]);
  const [winner, setWinner] = useState(null);

  const tutorials = [
    {
      title: "Welcome to Backgammon!",
      text: "Backgammon is one of the oldest board games. Your goal is to move all 15 of your pieces around the board and off before your opponent does the same. Let's learn by playing!",
      action: "Next"
    },
    {
      title: "The Board",
      text: "The board has 24 triangular points. White moves counterclockwise (from point 24 toward point 1), while Black moves clockwise (from point 1 toward point 24). The board is divided into four quadrants of 6 points each.",
      action: "Next"
    },
    {
      title: "Home Boards",
      text: "Points 1-6 (bottom right) are White's home board. Points 19-24 (top right) are Black's home board. You must get ALL your pieces to your home board before you can start 'bearing off' (removing pieces).",
      action: "Next"
    },
    {
      title: "Rolling Dice",
      text: "Each turn, you roll two dice. Each die represents a separate move. For example, if you roll 3 and 5, you can move one piece 3 spaces and another 5 spaces, OR move one piece 3 then 5 (or 5 then 3) spaces.",
      action: "Next"
    },
    {
      title: "Doubles!",
      text: "If you roll doubles (like 4-4), you get to move FOUR times that number instead of two! Doubles are powerful.",
      action: "Next"
    },
    {
      title: "Landing Rules",
      text: "You can land on: empty points, points with your own pieces, OR points with only ONE opponent piece. If you land on a single opponent piece, it gets 'hit' and sent to the bar (middle)!",
      action: "Next"
    },
    {
      title: "Blocked Points",
      text: "You CANNOT land on a point with 2+ opponent pieces. These are 'blocked'. Building your own stacks of 2+ pieces creates 'blocks' that protect your position.",
      action: "Next"
    },
    {
      title: "Let's Play!",
      text: "Now let's try it! Click 'Roll Dice' to start your turn. I'll guide you through making moves.",
      action: "Start Game"
    }
  ];

  const rollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);
    
    let moves;
    if (d1 === d2) {
      moves = [d1, d1, d1, d1];
      const playerName = turn === 'white' ? 'White' : 'Black';
      setMessage(`${playerName} rolled double ${d1}s! 4 moves of ${d1} each.`);
    } else {
      moves = [d1, d2];
      const playerName = turn === 'white' ? 'White' : 'Black';
      setMessage(`${playerName} rolled ${d1} and ${d2}. Select a piece to move.`);
    }
    setMovesLeft(moves);
    setGamePhase('move');
  };

  const getValidMoves = (fromPoint, currentTurn = turn) => {
    const validMoves = [];
    const isWhite = currentTurn === 'white';
    const playerBar = isWhite ? whiteBar : blackBar;
    
    // Check if we have pieces on the bar first
    if (playerBar > 0 && fromPoint !== 'bar') {
      return [];
    }
    
    for (const move of [...new Set(movesLeft)]) {
      let toPoint;
      if (fromPoint === 'bar') {
        if (isWhite) {
          toPoint = 24 - move; // White enters from points 24-19
        } else {
          toPoint = move - 1; // Black enters from points 1-6
        }
      } else {
        if (isWhite) {
          toPoint = fromPoint - move;
        } else {
          toPoint = fromPoint + move;
        }
      }
      
      // Check if bearing off
      if ((isWhite && toPoint < 0) || (!isWhite && toPoint > 23)) {
        if (canBearOff(currentTurn)) {
          validMoves.push('off');
        }
        continue;
      }
      
      // Check if point is valid (not blocked by opponent)
      if (isWhite) {
        if (board[toPoint] >= -1) {
          validMoves.push(toPoint);
        }
      } else {
        if (board[toPoint] <= 1) {
          validMoves.push(toPoint);
        }
      }
    }
    
    return validMoves;
  };

  const canBearOff = (currentTurn = turn) => {
    const isWhite = currentTurn === 'white';
    const playerBar = isWhite ? whiteBar : blackBar;
    
    if (playerBar > 0) return false;
    
    if (isWhite) {
      // All white pieces must be in home board (points 0-5)
      for (let i = 6; i < 24; i++) {
        if (board[i] > 0) return false;
      }
    } else {
      // All black pieces must be in home board (points 18-23)
      for (let i = 0; i < 18; i++) {
        if (board[i] < 0) return false;
      }
    }
    return true;
  };

  const handlePointClick = (pointIndex) => {
    if (gamePhase !== 'move') return;
    
    const isWhite = turn === 'white';
    const playerBar = isWhite ? whiteBar : blackBar;
    const hasPiece = isWhite ? board[pointIndex] > 0 : board[pointIndex] < 0;
    
    // If we have pieces on bar, must move them first
    if (playerBar > 0) {
      if (selectedPoint === 'bar') {
        const validMoves = getValidMoves('bar');
        if (validMoves.includes(pointIndex)) {
          makeMove('bar', pointIndex);
        }
      } else {
        setSelectedPoint('bar');
        setHighlightedPoints(getValidMoves('bar'));
        setMessage(`${isWhite ? 'White' : 'Black'} has a piece on the bar. Must enter it first.`);
      }
      return;
    }
    
    if (selectedPoint === null) {
      // Selecting a piece to move
      if (hasPiece) {
        const validMoves = getValidMoves(pointIndex);
        if (validMoves.length > 0) {
          setSelectedPoint(pointIndex);
          setHighlightedPoints(validMoves);
          setMessage(`Selected point ${pointIndex + 1}. Click a highlighted point to move.`);
        } else {
          setMessage("No valid moves from this point. Try another piece.");
        }
      }
    } else {
      // Making a move
      const validMoves = getValidMoves(selectedPoint);
      if (validMoves.includes(pointIndex)) {
        makeMove(selectedPoint, pointIndex);
      } else if (hasPiece) {
        // Select different piece
        const newValidMoves = getValidMoves(pointIndex);
        if (newValidMoves.length > 0) {
          setSelectedPoint(pointIndex);
          setHighlightedPoints(newValidMoves);
          setMessage(`Selected point ${pointIndex + 1}. Click a highlighted point to move.`);
        }
      } else {
        setMessage("Invalid move. Click a highlighted point or select a different piece.");
      }
    }
  };

  const handleBarClick = () => {
    const isWhite = turn === 'white';
    const playerBar = isWhite ? whiteBar : blackBar;
    
    if (playerBar > 0 && gamePhase === 'move') {
      setSelectedPoint('bar');
      setHighlightedPoints(getValidMoves('bar'));
      setMessage(`Select where to enter from the bar.`);
    }
  };

  const handleBearOff = () => {
    if (selectedPoint !== null && selectedPoint !== 'bar' && canBearOff()) {
      const validMoves = getValidMoves(selectedPoint);
      if (validMoves.includes('off')) {
        makeMove(selectedPoint, 'off');
      }
    }
  };

  const makeMove = (from, to) => {
    const newBoard = [...board];
    const isWhite = turn === 'white';
    let moveDistance;
    
    if (from === 'bar') {
      if (isWhite) {
        setWhiteBar(prev => prev - 1);
        moveDistance = 24 - to;
      } else {
        setBlackBar(prev => prev - 1);
        moveDistance = to + 1;
      }
    } else {
      if (isWhite) {
        newBoard[from]--;
        if (to === 'off') {
          moveDistance = from + 1;
          setWhiteOff(prev => prev + 1);
        } else {
          moveDistance = from - to;
        }
      } else {
        newBoard[from]++;
        if (to === 'off') {
          moveDistance = 24 - from;
          setBlackOff(prev => prev + 1);
        } else {
          moveDistance = to - from;
        }
      }
    }
    
    if (to !== 'off') {
      // Check for hit
      if (isWhite && newBoard[to] === -1) {
        newBoard[to] = 1;
        setBlackBar(prev => prev + 1);
        setMessage(`White hits! Black piece sent to the bar.`);
      } else if (!isWhite && newBoard[to] === 1) {
        newBoard[to] = -1;
        setWhiteBar(prev => prev + 1);
        setMessage(`Black hits! White piece sent to the bar.`);
      } else {
        if (isWhite) {
          newBoard[to]++;
        } else {
          newBoard[to]--;
        }
        setMessage(`Moved from ${from === 'bar' ? 'bar' : `point ${from + 1}`} to point ${to + 1}.`);
      }
    } else {
      const remaining = isWhite ? 14 - whiteOff : 14 - blackOff;
      setMessage(`${isWhite ? 'White' : 'Black'} bore off a piece! ${remaining} more to go.`);
    }
    
    setBoard(newBoard);
    setSelectedPoint(null);
    setHighlightedPoints([]);
    
    // Remove used die
    const newMovesLeft = [...movesLeft];
    const dieIndex = newMovesLeft.indexOf(moveDistance);
    if (dieIndex > -1) {
      newMovesLeft.splice(dieIndex, 1);
    } else {
      // For bearing off, might use higher die
      const availableDice = isWhite 
        ? newMovesLeft.filter(d => d >= moveDistance)
        : newMovesLeft.filter(d => d >= moveDistance);
      if (availableDice.length > 0) {
        const usedDie = Math.min(...availableDice);
        newMovesLeft.splice(newMovesLeft.indexOf(usedDie), 1);
      }
    }
    setMovesLeft(newMovesLeft);
    
    // Check for win
    const newWhiteOff = isWhite && to === 'off' ? whiteOff + 1 : whiteOff;
    const newBlackOff = !isWhite && to === 'off' ? blackOff + 1 : blackOff;
    
    if (newWhiteOff >= 15) {
      setGamePhase('gameover');
      setWinner('white');
      setMessage("🎉 White wins!");
      return;
    }
    if (newBlackOff >= 15) {
      setGamePhase('gameover');
      setWinner('black');
      setMessage("🎉 Black wins!");
      return;
    }
    
    // Check if turn is over
    if (newMovesLeft.length === 0 || !hasValidMoves(newBoard, newMovesLeft, turn)) {
      endTurn(newBoard);
    }
  };

  const hasValidMoves = (currentBoard, moves, currentTurn) => {
    const isWhite = currentTurn === 'white';
    const playerBar = isWhite ? whiteBar : blackBar;
    
    if (playerBar > 0) {
      for (const move of moves) {
        let toPoint;
        if (isWhite) {
          toPoint = 24 - move;
        } else {
          toPoint = move - 1;
        }
        if (isWhite && currentBoard[toPoint] >= -1) return true;
        if (!isWhite && currentBoard[toPoint] <= 1) return true;
      }
      return false;
    }
    
    for (let i = 0; i < 24; i++) {
      const hasPiece = isWhite ? currentBoard[i] > 0 : currentBoard[i] < 0;
      if (hasPiece) {
        for (const move of moves) {
          let toPoint;
          if (isWhite) {
            toPoint = i - move;
            if (toPoint < 0 && canBearOff(currentTurn)) return true;
            if (toPoint >= 0 && currentBoard[toPoint] >= -1) return true;
          } else {
            toPoint = i + move;
            if (toPoint > 23 && canBearOff(currentTurn)) return true;
            if (toPoint <= 23 && currentBoard[toPoint] <= 1) return true;
          }
        }
      }
    }
    return false;
  };

  const endTurn = (currentBoard) => {
    const nextTurn = turn === 'white' ? 'black' : 'white';
    
    if (gameMode === 'twoplayer' || gameMode === 'tutorial') {
      // Two player mode - just switch turns
      setTurn(nextTurn);
      setGamePhase('roll');
      setDice([]);
      setMovesLeft([]);
      setMessage(`${nextTurn === 'white' ? 'White' : 'Black'}'s turn. Click 'Roll Dice'.`);
    } else {
      // AI mode
      if (nextTurn === 'black') {
        setTimeout(() => opponentTurn(currentBoard), 1000);
      } else {
        setTurn('white');
        setGamePhase('roll');
        setDice([]);
        setMovesLeft([]);
        setMessage("Your turn! Click 'Roll Dice'.");
      }
    }
  };

  const skipTurn = () => {
    if (movesLeft.length > 0 && !hasValidMoves(board, movesLeft, turn)) {
      setMessage(`No valid moves available. Turn skipped.`);
      endTurn(board);
    }
  };

  const opponentTurn = (currentBoard) => {
    setTurn('black');
    setGamePhase('opponent');
    
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    let moves = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
    
    setDice([d1, d2]);
    setMessage(`Opponent rolled ${d1} and ${d2}. Thinking...`);
    
    setTimeout(() => {
      let newBoard = [...currentBoard];
      let newBlackBar = blackBar;
      let newBlackOff = blackOff;
      let newWhiteBar = whiteBar;
      
      // Simple AI: try to make moves
      for (const move of moves) {
        let moved = false;
        
        // Check bar first
        if (newBlackBar > 0) {
          const toPoint = move - 1;
          if (newBoard[toPoint] <= 1) {
            if (newBoard[toPoint] === 1) {
              newBoard[toPoint] = -1;
              newWhiteBar++;
            } else {
              newBoard[toPoint]--;
            }
            newBlackBar--;
            moved = true;
          }
          continue;
        }
        
        // Try regular moves (black moves from low to high)
        for (let i = 0; i < 24 && !moved; i++) {
          if (newBoard[i] < 0) {
            const toPoint = i + move;
            if (toPoint > 23) {
              // Bear off check
              let allHome = true;
              for (let j = 0; j < 18; j++) {
                if (newBoard[j] < 0) allHome = false;
              }
              if (allHome && newBlackBar === 0) {
                newBoard[i]++;
                newBlackOff++;
                moved = true;
              }
            } else if (newBoard[toPoint] <= 1) {
              if (newBoard[toPoint] === 1) {
                newBoard[toPoint] = -1;
                newWhiteBar++;
              } else {
                newBoard[toPoint]--;
              }
              newBoard[i]++;
              moved = true;
            }
          }
        }
      }
      
      setBoard(newBoard);
      setBlackBar(newBlackBar);
      setBlackOff(newBlackOff);
      setWhiteBar(newWhiteBar);
      
      if (newBlackOff >= 15) {
        setGamePhase('gameover');
        setWinner('black');
        setMessage("Opponent wins! Don't worry, backgammon takes practice.");
      } else {
        setTurn('white');
        setGamePhase('roll');
        setDice([]);
        setMovesLeft([]);
        if (newWhiteBar > whiteBar) {
          setMessage(`Opponent hit your piece! You have ${newWhiteBar} on the bar. Roll to continue.`);
        } else {
          setMessage("Your turn! Click 'Roll Dice'.");
        }
      }
    }, 1500);
  };

  const handleTutorialAction = () => {
    if (tutorialStep < tutorials.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setGamePhase('roll');
      setMessage(`${turn === 'white' ? 'White' : 'Black'}'s turn. Click 'Roll Dice'!`);
    }
  };

  const skipTutorial = () => {
    setTutorialStep(tutorials.length - 1);
    setGamePhase('roll');
    setMessage(`${turn === 'white' ? 'White' : 'Black'}'s turn. Click 'Roll Dice'!`);
  };

  const startGame = (mode) => {
    setGameMode(mode);
    if (mode === 'tutorial') {
      setGamePhase('intro');
    } else {
      setGamePhase('roll');
      setMessage("White goes first. Click 'Roll Dice'!");
    }
  };

  const resetGame = () => {
    setBoard(initialBoard());
    setDice([]);
    setMovesLeft([]);
    setSelectedPoint(null);
    setTurn('white');
    setGamePhase('menu');
    setGameMode(null);
    setWhiteBar(0);
    setBlackBar(0);
    setWhiteOff(0);
    setBlackOff(0);
    setTutorialStep(0);
    setMessage('');
    setHighlightedPoints([]);
    setWinner(null);
  };

  // Render point with pieces
  const renderPoint = (index, isTop) => {
    const pieces = board[index];
    const isHighlighted = highlightedPoints.includes(index);
    const isSelected = selectedPoint === index;
    const pieceCount = Math.abs(pieces);
    const isWhitePiece = pieces > 0;
    
    const isCurrentPlayerPiece = turn === 'white' ? pieces > 0 : pieces < 0;
    const canSelect = gamePhase === 'move' && isCurrentPlayerPiece;
    
    return (
      <div
        key={index}
        onClick={() => handlePointClick(index)}
        className={`relative flex flex-col ${isTop ? 'items-center' : 'items-center flex-col-reverse'} 
          transition-all duration-200
          ${canSelect || isHighlighted ? 'cursor-pointer' : 'cursor-default'}
          ${isHighlighted ? 'bg-green-300 bg-opacity-50' : ''}
          ${isSelected ? 'bg-yellow-300 bg-opacity-50' : ''}`}
        style={{ width: '40px', height: '140px' }}
      >
        {/* Triangle */}
        <div
          className={`absolute ${isTop ? 'top-0' : 'bottom-0'} w-0 h-0`}
          style={{
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            ...(isTop
              ? { borderTop: `100px solid ${index % 2 === 0 ? '#8B4513' : '#D2691E'}` }
              : { borderBottom: `100px solid ${index % 2 === 0 ? '#8B4513' : '#D2691E'}` }
            ),
          }}
        />
        {/* Pieces */}
        <div className={`absolute ${isTop ? 'top-2' : 'bottom-2'} flex flex-col ${isTop ? '' : 'flex-col-reverse'} items-center gap-0.5 z-10`}>
          {Array.from({ length: Math.min(pieceCount, 5) }).map((_, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-full border-2 shadow ${
                isWhitePiece
                  ? 'bg-gradient-to-br from-white to-gray-200 border-gray-400'
                  : 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600'
              } flex items-center justify-center text-xs font-bold`}
              style={{ marginTop: isTop && i > 0 ? '-8px' : '0', marginBottom: !isTop && i > 0 ? '-8px' : '0' }}
            >
              {i === 0 && pieceCount > 5 && (
                <span className={isWhitePiece ? 'text-gray-800' : 'text-white'}>{pieceCount}</span>
              )}
            </div>
          ))}
        </div>
        {/* Point number */}
        <div className={`absolute ${isTop ? 'bottom-0' : 'top-0'} text-xs text-gray-500 z-10`}>
          {index + 1}
        </div>
      </div>
    );
  };

  // Menu Screen
  if (gamePhase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold text-amber-900 text-center mb-2">Backgammon</h1>
          <p className="text-amber-700 text-center mb-8">Choose your game mode</p>
          
          <div className="space-y-4">
            <button
              onClick={() => startGame('tutorial')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-lg"
            >
              <div className="text-xl font-bold">📚 Tutorial</div>
              <div className="text-sm opacity-90">Learn how to play with guided instructions</div>
            </button>
            
            <button
              onClick={() => startGame('ai')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
            >
              <div className="text-xl font-bold">🤖 vs Computer</div>
              <div className="text-sm opacity-90">Play against a simple AI opponent</div>
            </button>
            
            <button
              onClick={() => startGame('twoplayer')}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition shadow-lg"
            >
              <div className="text-xl font-bold">👥 Two Players</div>
              <div className="text-sm opacity-90">Play locally with a friend</div>
            </button>
          </div>
          
          <div className="mt-8 bg-white rounded-lg p-4 shadow">
            <h3 className="font-bold text-amber-800 mb-2">Quick Rules</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Move all 15 pieces to your home board, then bear them off</li>
              <li>• White moves counterclockwise, Black moves clockwise</li>
              <li>• Roll dice to determine how far you can move</li>
              <li>• Hit opponent's single pieces to send them to the bar</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-amber-900">
            Backgammon
            <span className="text-sm font-normal ml-2 text-amber-700">
              {gameMode === 'tutorial' && '(Tutorial)'}
              {gameMode === 'ai' && '(vs Computer)'}
              {gameMode === 'twoplayer' && '(Two Players)'}
            </span>
          </h1>
          <button
            onClick={resetGame}
            className="text-amber-600 hover:text-amber-800 text-sm"
          >
            ← Back to Menu
          </button>
        </div>
        
        {/* Tutorial Card */}
        {gamePhase === 'intro' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-amber-800 mb-2">
              {tutorials[tutorialStep].title}
            </h2>
            <p className="text-gray-700 mb-4">{tutorials[tutorialStep].text}</p>
            <div className="flex gap-2">
              <button
                onClick={handleTutorialAction}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
              >
                {tutorials[tutorialStep].action}
              </button>
              {tutorialStep < tutorials.length - 1 && (
                <button
                  onClick={skipTutorial}
                  className="text-amber-600 px-4 py-2 hover:underline"
                >
                  Skip Tutorial
                </button>
              )}
            </div>
            <div className="mt-4 flex gap-1">
              {tutorials.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${i <= tutorialStep ? 'bg-amber-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Turn Indicator for Two Player Mode */}
        {gameMode === 'twoplayer' && gamePhase !== 'intro' && gamePhase !== 'gameover' && (
          <div className={`mb-4 p-3 rounded-lg text-center font-bold text-lg ${
            turn === 'white' 
              ? 'bg-white border-2 border-gray-300 text-gray-800' 
              : 'bg-gray-800 text-white'
          }`}>
            {turn === 'white' ? '⚪ White\'s Turn' : '⚫ Black\'s Turn'}
          </div>
        )}
        
        {/* Game Board */}
        <div className="bg-amber-800 p-4 rounded-lg shadow-xl">
          {/* Score and Status */}
          <div className="flex justify-between text-white mb-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
              <span>Off: {whiteOff}/15</span>
            </div>
            <div className="font-bold text-center flex-1 px-4">{message}</div>
            <div className="flex items-center gap-2">
              <span>Off: {blackOff}/15</span>
              <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-600"></div>
            </div>
          </div>
          
          {/* Main Board */}
          <div className="bg-amber-100 rounded-lg p-2 flex">
            {/* Left side (points 13-18 top, 7-12 bottom) */}
            <div className="flex flex-col">
              <div className="flex bg-amber-200 rounded-t-lg p-1">
                {[12, 13, 14, 15, 16, 17].map(i => renderPoint(i, true))}
              </div>
              <div className="flex bg-amber-200 rounded-b-lg p-1 mt-2">
                {[11, 10, 9, 8, 7, 6].map(i => renderPoint(i, false))}
              </div>
            </div>
            
            {/* Bar */}
            <div className="w-12 bg-amber-700 mx-1 rounded flex flex-col items-center justify-between py-2">
              <div 
                className={`text-center ${selectedPoint === 'bar' && turn === 'black' ? 'bg-yellow-400 rounded p-1' : ''}`}
                onClick={() => turn === 'black' && handleBarClick()}
              >
                {blackBar > 0 && (
                  <div className="flex flex-col items-center cursor-pointer">
                    {Array.from({ length: Math.min(blackBar, 3) }).map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gray-800 border border-gray-600 -mt-1 first:mt-0 shadow" />
                    ))}
                    {blackBar > 3 && <span className="text-white text-xs">{blackBar}</span>}
                  </div>
                )}
              </div>
              <div className="text-white text-xs font-bold">BAR</div>
              <div 
                className={`text-center ${selectedPoint === 'bar' && turn === 'white' ? 'bg-yellow-400 rounded p-1' : ''}`}
                onClick={() => turn === 'white' && handleBarClick()}
              >
                {whiteBar > 0 && (
                  <div className="flex flex-col items-center cursor-pointer">
                    {Array.from({ length: Math.min(whiteBar, 3) }).map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-white border border-gray-400 -mb-1 last:mb-0 shadow" />
                    ))}
                    {whiteBar > 3 && <span className="text-white text-xs">{whiteBar}</span>}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side (points 19-24 top, 1-6 bottom) */}
            <div className="flex flex-col">
              <div className="flex bg-amber-200 rounded-t-lg p-1 relative">
                {[18, 19, 20, 21, 22, 23].map(i => renderPoint(i, true))}
                <div className="absolute -top-6 left-0 right-0 text-center text-xs text-amber-900">
                  Black's Home
                </div>
              </div>
              <div className="flex bg-amber-200 rounded-b-lg p-1 mt-2 relative">
                {[5, 4, 3, 2, 1, 0].map(i => renderPoint(i, false))}
                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-amber-900">
                  White's Home
                </div>
              </div>
            </div>
            
            {/* Bear off tray */}
            <div className="w-12 bg-amber-900 ml-1 rounded flex flex-col items-center justify-between py-2">
              <div className="text-center">
                {blackOff > 0 && (
                  <div className="bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white border border-gray-600">
                    {blackOff}
                  </div>
                )}
              </div>
              <div className="text-amber-100 text-xs font-bold">OFF</div>
              <div 
                className={`text-center ${highlightedPoints.includes('off') ? 'cursor-pointer' : ''}`}
                onClick={handleBearOff}
              >
                {whiteOff > 0 && (
                  <div className={`bg-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-gray-400 ${
                    highlightedPoints.includes('off') ? 'ring-2 ring-green-400' : ''
                  }`}>
                    {whiteOff}
                  </div>
                )}
                {highlightedPoints.includes('off') && whiteOff === 0 && (
                  <div className="bg-green-400 w-8 h-8 rounded-full flex items-center justify-center text-xs text-white">
                    Bear Off
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Dice and Controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            {dice.length > 0 && (
              <div className="flex gap-2">
                {dice.map((d, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg
                      ${movesLeft.filter(m => m === d).length > 0 ? 'text-gray-800' : 'text-gray-300'}`}
                  >
                    {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][d - 1]}
                  </div>
                ))}
              </div>
            )}
            {movesLeft.length > 0 && (
              <div className="text-white text-sm bg-amber-900 px-3 py-1 rounded">
                Moves: {movesLeft.join(', ')}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-4">
            {gamePhase === 'roll' && (
              <button
                onClick={rollDice}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:from-green-600 hover:to-green-700 transition shadow-lg"
              >
                🎲 Roll Dice
              </button>
            )}
            {gamePhase === 'move' && movesLeft.length > 0 && !hasValidMoves(board, movesLeft, turn) && (
              <button
                onClick={skipTurn}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition"
              >
                No Valid Moves - Skip Turn
              </button>
            )}
            {gamePhase === 'opponent' && (
              <div className="text-white text-lg animate-pulse">
                🤔 Opponent is thinking...
              </div>
            )}
            {gamePhase === 'gameover' && (
              <div className="flex flex-col items-center gap-4">
                <div className={`text-2xl font-bold ${winner === 'white' ? 'text-white' : 'text-gray-300'}`}>
                  {winner === 'white' ? '⚪ White Wins! 🎉' : '⚫ Black Wins! 🎉'}
                </div>
                <button
                  onClick={resetGame}
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-blue-600 transition"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Reference */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-amber-800 mb-2">Quick Reference</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="bg-amber-50 p-2 rounded">
              <strong>White:</strong> Moves counterclockwise (24→1), home is points 1-6
            </div>
            <div className="bg-amber-50 p-2 rounded">
              <strong>Black:</strong> Moves clockwise (1→24), home is points 19-24
            </div>
            <div className="bg-amber-50 p-2 rounded">
              <strong>Hitting:</strong> Land on a single opponent piece to send it to the bar
            </div>
            <div className="bg-amber-50 p-2 rounded">
              <strong>Blocked:</strong> Can't land on 2+ opponent pieces
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgammonTutorial;
