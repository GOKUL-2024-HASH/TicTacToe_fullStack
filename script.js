const board = document.querySelector('.board');
const statusDisplay = document.querySelector('.status');
const restartButton = document.querySelector('.restart');
const modeButtons = document.querySelectorAll('.mode-buttons button');

let cells;
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'ai';
let player1Name = "";
let player2Name = "";

function setPlayers() {
  player1Name = document.getElementById("player1").value.trim() || "Player 1";
  const player2Input = document.getElementById("player2");

  if (gameMode === '2player') {
    player2Name = player2Input.value.trim() || "Player 2";
  } else {
    player2Name = "Computer";
  }

  if (gameActive) {
    statusDisplay.textContent = `${player1Name}'s turn`;
  }
}

function handleCellClick(e) {
  const clickedCell = e.target;
  const clickedIndex = parseInt(clickedCell.getAttribute('data-index'));

  if (!gameActive || clickedCell.textContent !== '') return;

  clickedCell.textContent = currentPlayer;

  if (checkWin()) {
    gameActive = false;
    statusDisplay.textContent = `${getCurrentPlayerName()} wins!`;
    recordResult(currentPlayer === 'X' ? 'win' : 'loss');
    return;
  }

  if (isDraw()) {
    gameActive = false;
    statusDisplay.textContent = "It's a draw!";
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusDisplay.textContent = `${getCurrentPlayerName()}'s turn`;

  if (gameMode === 'ai' && currentPlayer === 'O') {
    setTimeout(aiMove, 500);
  }
}

function aiMove() {
  if (!gameActive) return;

  for (let i = 0; i < 9; i++) {
    if (cells[i].textContent === '') {
      cells[i].textContent = 'O';

      if (checkWin()) {
        gameActive = false;
        statusDisplay.textContent = `${player2Name} wins!`;
        recordResult('loss');
        return;
      }

      if (isDraw()) {
        gameActive = false;
        statusDisplay.textContent = "It's a draw!";
        return;
      }

      currentPlayer = 'X';
      statusDisplay.textContent = `${player1Name}'s turn`;
      break;
    }
  }
}

function checkWin() {
  return [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ].some(([a, b, c]) =>
    cells[a].textContent &&
    cells[a].textContent === cells[b].textContent &&
    cells[b].textContent === cells[c].textContent
  );
}

function isDraw() {
  return [...cells].every(cell => cell.textContent !== '');
}

function restartGame() {
  cells.forEach(cell => (cell.textContent = ''));
  currentPlayer = 'X';
  gameActive = true;
  statusDisplay.textContent = `${getCurrentPlayerName()}'s turn`;
}

function initializeGame() {
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('data-index', i);
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
  }
  cells = document.querySelectorAll('.cell');
  restartGame();
}

function getCurrentPlayerName() {
  return currentPlayer === 'X' ? player1Name : player2Name;
}

function recordResult(result) {
  const record = (name, resultValue) => {
    fetch('http://localhost:3000/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player: name,
        result: resultValue,
        mode: gameMode,
        time: new Date().toISOString()
      })
    });
  };

  if (!player1Name || !player2Name) return;

  if (gameMode === '2player') {
    if (currentPlayer === 'X') {
      record(player1Name, 'win');
      record(player2Name, 'loss');
    } else {
      record(player1Name, 'loss');
      record(player2Name, 'win');
    }
  } else {
    record(player1Name, result);
  }
}

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    gameMode = button.getAttribute('data-mode');
    const player2Input = document.getElementById("player2");

    if (gameMode === '2player') {
      player2Input.style.display = 'inline-block';
      player2Input.placeholder = "Player 2 Name (O)";
      player2Input.classList.add('fade-in');
    } else {
      player2Input.style.display = 'none';
      player2Input.value = "";
    }
  });
});

restartButton.addEventListener('click', restartGame);

window.onload = () => {
  document.querySelector('[data-mode="ai"]').click();
  initializeGame();
};
