import './App.css';
import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

function App() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [statusMessage, setStatusMessage] = useState('White to move');
  const [errorMessage, setErrorMessage] = useState('');

  function safeGameMutate(modify) {
    setGame((g) => {
      const updatedGame = new Chess(g.fen());
      modify(updatedGame);
      return updatedGame;
    });
  }

  function onSquareClick(square) {
    if ((game.turn() === 'w' && game.board().flat().find((p) => p?.square === square)?.color === 'b') ||
      (game.turn() === 'b' && game.board().flat().find((p) => p?.square === square)?.color === 'w')) {
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setHighlightedSquares({});
      return;
    }

    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) {
      setSelectedSquare(null);
      setHighlightedSquares({});
      return;
    }

    const highlights = {};
    moves.forEach((move) => {
      highlights[move.to] = true;
    });

    setSelectedSquare(square);
    setHighlightedSquares(highlights);
  }

  function onDestinationClick(destination) {
    if (!selectedSquare) return;

    const move = game.move({
      from: selectedSquare,
      to: destination,
      promotion: 'q',
    });

    if (move === null) {
      setErrorMessage('Invalid move. Try again.');
      return;
    }

    setErrorMessage('');
    updateGameStatus();
    setSelectedSquare(null);
    setHighlightedSquares({});
  }

  function updateGameStatus() {
    if (game.in_checkmate()) {
      setStatusMessage(`${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`);
    } else if (game.in_stalemate()) {
      setStatusMessage('Game over: Stalemate.');
    } else if (game.in_draw()) {
      setStatusMessage('Game over: Draw.');
    } else if (game.in_check()) {
      setStatusMessage(`${game.turn() === 'w' ? 'White' : 'Black'} is in check.`);
    } else {
      setStatusMessage(`${game.turn() === 'w' ? 'White' : 'Black'} to move.`);
    }
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Real Chess Game</h1>
      </div>
      <div className="game-container">
        <p className="status">{statusMessage}</p>
        <Chessboard
          position={game.fen()}
          onSquareClick={onSquareClick}
          customSquareStyles={{
            [selectedSquare]: { backgroundColor: 'rgba(0, 255, 0, 0.4)' },
            ...Object.keys(highlightedSquares).reduce((acc, square) => {
              acc[square] = { backgroundColor: 'rgba(255, 255, 0, 0.5)' };
              return acc;
            }, {}),
          }}
          onPieceClick={(piece) => {
            onSquareClick(piece.square);
          }}
          boardWidth={Math.min(window.innerWidth - 50, 600)}
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="highlight-container">
          {selectedSquare && (
            <div>
              <p>Click on a valid move to place the piece:</p>
              <div className="valid-move-buttons">
                {Object.keys(highlightedSquares).map((destination) => (
                  <button
                    key={destination}
                    onClick={() => onDestinationClick(destination)}
                    className="valid-move-btn"
                  >
                    {destination}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="background-animation"></div>
    </div>
  );
}

export default App;
