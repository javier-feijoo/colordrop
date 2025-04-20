// VARIABLES GLOBALES
let board = [];
let size = 10;
let moves = 0;
let maxMoves = 20;
let currentColor = "";
let animationSpeed = 3;

// Colores disponibles juego
const colors = ["#0072B2", "#D55E00", "#009E73", "#CC79A7", "#F0E442", "#56B4E9"];

// Referencias a elementos del DOM
const svg = document.getElementById("board");
const info = document.getElementById("info");
const difficultyInfo = document.getElementById("difficultyInfo");
const row1 = document.getElementById("colorRow1");
const row2 = document.getElementById("colorRow2");

// Sonidos del juego
const sounds = {
    click: new Audio('../assets/sounds/click.mp3'),
    success: new Audio('../assets/sounds/success.mp3'),
    error: new Audio('../assets/sounds/error.mp3'),
    bg: new Audio('../assets/sounds/background_loop.mp3'),
};
sounds.bg.loop = true;
sounds.bg.volume = 0.2;

// Función para crear el tablero
function createBoard() {
    const tileSize = Math.floor(window.innerWidth * 0.9 / size);
    const boardSize = tileSize * size;

    svg.setAttribute("viewBox", `0 0 ${boardSize} ${boardSize}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.removeAttribute("width");
    svg.removeAttribute("height");

    svg.innerHTML = "";
    board = [];

    for (let y = 0; y < size; y++) {
        board[y] = [];
        for (let x = 0; x < size; x++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            board[y][x] = color;

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x * tileSize);
            rect.setAttribute("y", y * tileSize);
            rect.setAttribute("width", tileSize);
            rect.setAttribute("height", tileSize);
            rect.setAttribute("fill", color);
            rect.setAttribute("data-x", x);
            rect.setAttribute("data-y", y);
            svg.appendChild(rect);
        }
    }
    currentColor = board[0][0];
    updateInfo();
}

// Actualiza la información de movimientos en pantalla
function updateInfo() {
    info.textContent = `Movimientos: ${moves}/${maxMoves}`;
}

// Algoritmo de Flood Fill para cambiar colores
function floodFill(x, y, targetColor, replacementColor) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    if (board[y][x] !== targetColor || board[y][x] === replacementColor) return;

    board[y][x] = replacementColor;

    setTimeout(() => {
        const rect = svg.querySelector(`rect[data-x="${x}"][data-y="${y}"]`);
        rect.setAttribute("fill", replacementColor);
    }, animationSpeed * 20);

    floodFill(x + 1, y, targetColor, replacementColor);
    floodFill(x - 1, y, targetColor, replacementColor);
    floodFill(x, y + 1, targetColor, replacementColor);
    floodFill(x, y - 1, targetColor, replacementColor);
}

// Maneja el clic en un color
function handleColorClick(color) {
    if (color === currentColor || moves >= maxMoves) return;
    sounds.click.play();
    const targetColor = board[0][0];
    floodFill(0, 0, targetColor, color);

    moves++;
    currentColor = color;
    updateInfo();

    // Verifica si el jugador ganó o perdió mediante la función checkWin
    if (checkWin()) {
        sounds.success.play();
        sounds.bg.pause();
        sounds.bg.currentTime = 0;
        showEndMessage("¡Has ganado!", "success");
    } else if (moves >= maxMoves) {
        sounds.error.play();
        sounds.bg.pause();
        sounds.bg.currentTime = 0;
        showEndMessage("¡Has perdido! 😢", "fail");
    }
}

// checkwin: Verifica si el jugador ganó
function checkWin() {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (board[y][x] !== currentColor) {
                return false;
            }
        }
    }
    return true;
}

// Configura los botones de colores
function setupButtons() {
    row1.innerHTML = "";
    row2.innerHTML = "";
    const half = Math.ceil(colors.length / 2);

    colors.forEach((color, index) => {
        const btn = document.createElement("button");
        btn.style.backgroundColor = color;
        btn.onclick = () => handleColorClick(color);
        if (index < half) {
            row1.appendChild(btn);
        } else {
            row2.appendChild(btn);
        }
    });
}

// Inicia el juego
function startGame() {
    const selected = document.querySelector(".level-card.selected");
    const [w, h, m] = selected.dataset.value.split("x");
    size = parseInt(w);
    maxMoves = parseInt(m);
    moves = 0;

    const level = selected.id;
    updateDifficultyColor(level);

    document.getElementById("menu").classList.remove("active");
    document.getElementById("game").classList.add("active");
    createBoard();
    setupButtons();
    sounds.bg.play();
}

// Actualiza la información de dificultad
function updateDifficultyColor(level) {
    difficultyInfo.textContent = `Nivel: ${level}`;
    difficultyInfo.className = "info";
    console.log(level);
    switch (level) {
        case "facil":
            difficultyInfo.classList.add("facil");
            break;
        case "intermedio":
            difficultyInfo.classList.add("intermedio");
            break;
        case "avanzado":
            difficultyInfo.classList.add("avanzado");
            break;
    }
}



function showEndMessage(text, type) {
    const msg = document.getElementById("endMessage");
    const box = document.getElementById("endBox");
    const textEl = document.getElementById("endText");

    textEl.textContent = text;
    box.className = `end-box ${type}`;
    msg.classList.remove("hidden");
}

function handleContinue() {
    const msg = document.getElementById("endMessage");
    msg.classList.add("hidden");
    goToMenu();
}

function restartGame() {
    moves = 0;
    createBoard();
}

//Volver al menú principal, cambiando de pantalla.
function goToMenu() {
    sounds.bg.pause();
    sounds.bg.currentTime = 0;
    document.getElementById("game").classList.remove("active");
    document.getElementById("menu").classList.add("active");
}

// Abrir y cerrar ayuda
function showHelp() {
    document.getElementById("helpModal").style.display = "flex";
}

function closeHelp() {
    document.getElementById("helpModal").style.display = "none";
}

// Configura la selección de nivel
document.querySelectorAll(".level-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".level-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
    });
});

// Configura el control deslizante de velocidad
document.getElementById("animationSpeed").addEventListener("input", e => {
    animationSpeed = parseInt(e.target.value);
    const label = document.getElementById("speedLabel");
    const levels = ["Desactivada", "Muy lenta", "Lenta", "Media", "Rápida", "Muy rápida"];
    label.textContent = levels[animationSpeed] || "Media";
});
