document.addEventListener("DOMContentLoaded", function () {
  // Solicitar el nombre del Jugador 1
  let player1Name = prompt("Ingrese el nombre del Jugador 1:");
  player1Name = validatePlayerName(player1Name, "Jugador 1");

  document.getElementById("player1-info").querySelector("h2").textContent =
    player1Name;

  // Solicitar el nombre del Jugador 2
  let player2Name = prompt("Ingrese el nombre del Jugador 2:");
  player2Name = validatePlayerName(player2Name, "Jugador 2");

  document.getElementById("player2-info").querySelector("h2").textContent =
    player2Name;

  function validatePlayerName(name, defaultName) {
    // Si el nombre está vacío, asignar un valor predeterminado
    if (!name) {
      name = defaultName;
    }

    // Limitar la longitud del nombre a 10 caracteres
    name = name.slice(0, 10);

    return name;
  }

  const cardsContainer = document.getElementById("game-container");
  const timerElement = document.getElementById("timer-value");

  let currentPlayer = 1; // Variable para rastrear el jugador actual
  let flippedCards = [];
  let moves = [0, 0];
  let scores = [0, 0]; // Puntuaciones para cada jugador
  let timeRemaining = 50;
  let gameCompleted = false;
  let timerInterval;

  const giro = new Audio("Audio/sound......wav");
  const perder = new Audio(
    "Audio/Muerte (Mario Bros) - Efecto de sonido _ Sound effect (6).mp3"
  );
  const cartaErronea = new Audio("Audio/sound error.wav");
  const win = new Audio("Audio/Sonido de ganador _ Efecto de sonido.mp3");
  const cartaCorrecta = new Audio("Audio/rupia_zelda.mp3");

  const restartButton = createButton(
    "Reiniciar",
    () => {
      clearGame();
      currentPlayer = 1;
      updatePlayerInfo();
    },
    hideGameCompletedDialog
  );
  const menuButton = createButton(
    "Volver al menú",
    () => (window.location.href = "multiplayer_index.html")
  );

  function createButton(text, ...listeners) {
    const button = document.createElement("button");
    button.textContent = text;
    listeners.forEach((listener) => button.addEventListener("click", listener));
    return button;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function createCard(image) {
    const card = document.createElement("div");
    card.classList.add("card", "unflipped");
    card.style.backgroundImage = `url(images/fondo_maybe.jpg)`;
    card.dataset.image = image;
    card.addEventListener("click", () => flipCard(card));
    return card;
  }

  function createBoard() {
    const cardImages = getCardImages();
    const duplicatedImages = [...cardImages, ...cardImages];
    shuffleArray(duplicatedImages);

    const rows = 4;
    const cols = 3;

    for (let i = 0; i < rows; i++) {
      const row = document.createElement("div");
      row.classList.add("card-row");

      for (let j = 0; j < cols; j++) {
        const index = i * cols + j;
        const image = duplicatedImages[index];
        const card = createCard(image);
        row.appendChild(card);
      }

      cardsContainer.appendChild(row);
    }
    setTimeout(() => {
      // Voltear automáticamente las cartas después de 5 segundos
      const allCards = document.querySelectorAll(".card");
      allCards.forEach((card) => {
        card.classList.remove("unflipped");
        card.classList.add("flipped");
        card.style.backgroundImage = `url(images/${card.dataset.image})`;
      });

      setTimeout(() => {
        // Desvoltear las cartas después de otro periodo de tiempo
        allCards.forEach((card) => {
          card.classList.remove("flipped");
          card.classList.add("unflipped");
          card.style.backgroundImage = `url(images/fondo_maybe.jpg)`;
          card.addEventListener("click", () => flipCard(card));
        });

        // Iniciar el cronómetro después de desvoltear las cartas
        updateTimer();
      }, 3000);
    }, 1000);
  }

  function getCardImages() {
    const imageFolder = "images";
    const images = [
      "carta5_MEDIO.jpeg",
      "carta6_MEDIO.jpeg",
      "carta7_MEDIO.jpeg",
      "carta8_MEDIO.jpg",
      "carta9_MEDIO.jpg",
      "carta10_MEDIO.jpg",
    ];

    return images;
  }

  function flipCard(card) {
    if (
      !gameCompleted &&
      timeRemaining > 0 &&
      !card.classList.contains("flipped") &&
      flippedCards.length < 2
    ) {
      card.classList.remove("unflipped");
      card.classList.add("flipped");
      card.style.backgroundImage = `url(images/${card.dataset.image})`;
      flippedCards.push({ card, image: card.dataset.image });

      giro.play();

      if (flippedCards.length === 2) {
        moves[currentPlayer - 1]++;
        updateMoves();

        setTimeout(() => {
          checkMatch(card);

          updatePlayerStyle();
        }, 1000);
      }
    }
  }

  function updatePlayerStyle() {
    // Elimina la clase current-player de ambos jugadores
    const player1Container = document.getElementById("player1-info");
    const player2Container = document.getElementById("player2-info");
    player1Container.classList.remove("current-player");
    player2Container.classList.remove("current-player");

    // Agrega la clase current-player al jugador actual
    const currentPlayerContainer = document.getElementById(
      `player${currentPlayer}-info`
    );
    currentPlayerContainer.classList.add("current-player");
  }

  function checkMatch(card) {
    const [firstCard, secondCard] = flippedCards;

    try {
      if (firstCard.image === secondCard.image) {
        flippedCards.forEach(({ card }) => card.classList.add("matched"));
        cartaCorrecta.play();

        scores[currentPlayer - 1] += 5;
        updateScore();

        if (
          scores.reduce((total, score) => total + score, 0) ===
          getCardImages().length * 5
        ) {
          gameCompleted = true;
          showGameCompletedDialog();
        }
      } else {
        flippedCards.forEach(({ card }) => {
          card.classList.remove("flipped");
          card.classList.add("unflipped");
          card.style.backgroundImage = `url(images/fondo_maybe.jpg)`;
        });
        cartaErronea.play();

        // Cambiamos de jugador solo si no hay coincidencia
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updatePlayerInfo();
      }
    } catch (error) {
      console.error("Error checking match:", error);
    }

    updateMoves();
    flippedCards = [];

    if (!gameCompleted) {
      updateTimer();
    }
  }

  function updateMoves() {
    const movesValueElement = document.getElementById(
      `moves${currentPlayer}-value`
    );

    if (movesValueElement) {
      movesValueElement.textContent = `${moves[currentPlayer - 1]}`;
    } else {
      console.error(`Elemento moves${currentPlayer}-value no encontrado`);
    }
  }

  function updateScore() {
    const scoreValueElement = document.getElementById(
      `score${currentPlayer}-value`
    );
    scoreValueElement.textContent = `${scores[currentPlayer - 1]}`;
  }

  function updateTimer() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
    timerElement.textContent = `${formattedTime}`;

    if (timeRemaining === 0 && !gameCompleted) {
      endGame();
    } else if (timeRemaining > 0 && !gameCompleted) {
      timeRemaining--;
    }
  }

  function endGame() {
    clearInterval(timerInterval);

    const dialog = document.createElement("div");
    dialog.classList.add("game-completed-dialog");

    let message;

    if (scores[0] > scores[1]) {
      message = `¡Juego completado! - ${player1Name} gana`;
      confetti();
      win.play();
    } else if (scores[1] > scores[0]) {
      message = `¡Juego completado! - ${player2Name} gana`;
      confetti();
      win.play();
    } else {
      message = `¡Juego completado! - Empate`;
      perder.play();
    }

    const messageElement = document.createElement("p");
    messageElement.textContent = message;

    dialog.appendChild(messageElement);
    dialog.appendChild(restartButton);
    dialog.appendChild(menuButton);

    document.body.appendChild(dialog);
  }

  function showGameCompletedDialog() {
    gameCompleted = true;

    const dialog = document.createElement("div");
    dialog.classList.add("game-completed-dialog");

    let message;

    if (scores[0] > scores[1]) {
      message = `¡Juego completado! - ${player1Name} gana`;
    } else if (scores[1] > scores[0]) {
      message = `¡Juego completado! - ${player2Name} gana`;
    } else {
      message = `¡Juego completado! - Empate`;
    }

    const messageElement = document.createElement("p");
    messageElement.textContent = message;

    dialog.appendChild(messageElement);
    dialog.appendChild(restartButton);
    dialog.appendChild(menuButton);

    win.play();
    document.body.appendChild(dialog);
    confetti();

  }

  function hideGameCompletedDialog() {
    gameCompleted = false;

    const dialog = document.querySelector(".game-completed-dialog");
    if (dialog) {
      dialog.remove();
    }
  }

  function clearGame() {
    clearInterval(timerInterval);
    cardsContainer.innerHTML = "";
    flippedCards = [];
    moves = [0, 0];
    scores = [0, 0];
    timeRemaining = 50;
    gameCompleted = false;
    updateMoves();
    updateScore();
    currentPlayer = 1;

    // Restablecer los movimientos y la puntuación de ambos jugadores
    const movesValueElementPlayer1 = document.getElementById("moves1-value");
    const scoreValueElementPlayer1 = document.getElementById("score1-value");

    const movesValueElementPlayer2 = document.getElementById("moves2-value");
    const scoreValueElementPlayer2 = document.getElementById("score2-value");

    if (
      movesValueElementPlayer1 &&
      scoreValueElementPlayer1 &&
      movesValueElementPlayer2 &&
      scoreValueElementPlayer2
    ) {
      movesValueElementPlayer1.textContent = "0";
      scoreValueElementPlayer1.textContent = "0";

      movesValueElementPlayer2.textContent = "0";
      scoreValueElementPlayer2.textContent = "0";
    }

    createBoard();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  }

  createBoard();
  timerInterval = setInterval(updateTimer, 1000);
});
