document.addEventListener("DOMContentLoaded", function () {
  const cardsContainer = document.getElementById("game-container");
  const timerElement = document.getElementById("timer-value");

  let flippedCards = [];
  let moves = 0;
  let score = 0;
  let timeRemaining = 30;
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
    clearGame,
    hideGameCompletedDialog
  );

  const menuButton = createButton(
    "Volver al menú",
    () => (window.location.href = "singleplayer_index.html")
  );


  function createButton(text, ...listeners) {
    const button = document.createElement("button");
    button.textContent = text;
    listeners.forEach((listener) =>
      button.addEventListener("click", listener)
    );
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
    const cols = 2;

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
        });

        // Iniciar el cronómetro después de desvoltear las cartas
        updateTimer();
      }, 2000);
    }, 1000);
  }

  function getCardImages() {
    const imageFolder = "images";
    const images = [
      "carat1FACIL.jpeg",
      "carta2FACIL.jpeg",
      "carta3FACIL.jpeg",
      "carta4FACIL.jpeg",
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
        setTimeout(checkMatch, 1000);
        moves++;
        updateMoves();
      }
    }
  }

  function checkMatch() {
    const [firstCard, secondCard] = flippedCards;

    try {
      if (firstCard.image === secondCard.image) {
        flippedCards.forEach(({ card }) => card.classList.add("matched"));
        score += 5;
        cartaCorrecta.play();

        if (score === getCardImages().length * 5) {
          gameCompleted = true;
          showGameCompletedDialog();
        }
      } else {
        flippedCards.forEach(({ card }) => {
          card.classList.remove("flipped");
          card.classList.add("unflipped");
          card.style.backgroundImage = `url(images/fondo_maybe.jpg)`;
        });
        cartaErronea.play(); // Reproducir el sonido de carta incorrecta
      }
    } catch (error) {
      console.error("Error checking match:", error);
    }

    updateScore();
    flippedCards = [];

    if (!gameCompleted) {
      updateTimer();
    }
  }

  function updateMoves() {
    const movesValueElement = document.getElementById("moves-value");
    movesValueElement.textContent = moves.toString();
    console.log("Movimientos: " + moves);
  }

  function updateScore() {
    const scoreValueElement = document.getElementById("score-value");
    scoreValueElement.textContent = score.toString();
    console.log("Puntuación: " + score);
  }

  function updateTimer() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
    timerElement.textContent = formattedTime;

    if (timeRemaining === 0 && !gameCompleted) {
      endGame();
    } else if (timeRemaining > 0 && !gameCompleted) {
      timeRemaining--;
    }
  }

  function endGame() {
    clearInterval(timerInterval);
    perder.play(); // Reproducir el sonido de perder
    showGameCompletedDialog();
  }
  

  function showGameCompletedDialog() {
    gameCompleted = true;
  
    const dialog = document.createElement("div");
    dialog.classList.add("game-completed-dialog");
  
    const message = document.createElement("p");
  
    if (score === getCardImages().length * 5) {
      message.textContent = "¡Felicidades, ganaste!🎊";
      win.play();
      confetti();
    } else {
      message.textContent = "Oh perdiste, que pena 😭 ";
      perder.play();
    }
  
    dialog.appendChild(message);
    dialog.appendChild(restartButton);
    dialog.appendChild(menuButton);
  
    document.body.appendChild(dialog);
  }
  
  function hideGameCompletedDialog() {
    gameCompleted = false;

    const dialog = document.querySelector(".game-completed-dialog");
    if (dialog) {
      dialog.remove();
    }
  }

  function clearGame() {
    cardsContainer.innerHTML = "";
    flippedCards = [];
    moves = 0;
    score = 0;
    timeRemaining = 30;
    gameCompleted = false;
    updateMoves();
    updateScore();

    createBoard();

    // Reiniciar el cronómetro
    clearInterval(timerInterval);
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  }

  createBoard();
  timerInterval = setInterval(updateTimer, 1000);
});
