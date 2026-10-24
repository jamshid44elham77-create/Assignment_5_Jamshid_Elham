
"use strict";

// All game numbers are stored at the top.
const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const STARTING_LIVES = 3;
const CRITICAL_STREAK = 5;

let currentNumber = randomNumber();
let lives = STARTING_LIVES;
let streak = 0;
let bestStreak = 0;
let gameOver = false;

const currentNumberElement = document.querySelector("#current-number");
const livesElement = document.querySelector("#lives");
const streakElement = document.querySelector("#streak");
const bestStreakElement = document.querySelector("#best-streak");
const gameMessage = document.querySelector("#game-message");
const higherButton = document.querySelector("#higher-btn");
const lowerButton = document.querySelector("#lower-btn");
const restartButton = document.querySelector("#restart-game");

function randomNumber() {
    return Math.floor(
        Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)
    ) + MIN_NUMBER;
}

function showState() {
    currentNumberElement.textContent = currentNumber;
    livesElement.textContent = lives;
    streakElement.textContent = streak;
    bestStreakElement.textContent = bestStreak;

    higherButton.disabled = gameOver;
    lowerButton.disabled = gameOver;

    if (gameOver === true) {
        gameMessage.textContent =
            `Game over! Your best streak was ${bestStreak}. Restart to play again.`;
        gameMessage.className = "message error";
    }
}

function makeGuess(direction) {
    // Invalid moves do not change the game state.
    if (gameOver === true ||
        (direction !== "higher" && direction !== "lower")) {
        gameMessage.textContent = "This move is not available.";
        return;
    }

    const nextNumber = randomNumber();
    const wasCorrect =
        (direction === "higher" && nextNumber >= currentNumber) ||
        (direction === "lower" && nextNumber <= currentNumber);

    currentNumber = nextNumber;

    if (wasCorrect === true) {
        streak++;

        if (streak > bestStreak) {
            bestStreak = streak;
        }

        if (streak >= CRITICAL_STREAK && lives < STARTING_LIVES) {
            gameMessage.textContent =
                `Correct! ${nextNumber}. You reached a ${streak} streak!`;
        } else {
            gameMessage.textContent =
                `Correct! The new number is ${nextNumber}.`;
        }

        gameMessage.className = "message success";
    } else {
        lives--;
        streak = 0;

        gameMessage.textContent =
            `Wrong guess! The new number is ${nextNumber}.`;
        gameMessage.className = "message error";
    }

    // Stop the game when there are no lives left.
    if (lives <= 0 || lives === 0) {
        gameOver = true;
    }

    showState();
}

higherButton.addEventListener("click", function () {
    makeGuess("higher");
});

lowerButton.addEventListener("click", function () {
    makeGuess("lower");
});

restartButton.addEventListener("click", function () {
    currentNumber = randomNumber();
    lives = STARTING_LIVES;
    streak = 0;
    gameOver = false;

    gameMessage.textContent = "New game! Choose Higher or Lower.";
    gameMessage.className = "message";

    showState();
});

showState();
