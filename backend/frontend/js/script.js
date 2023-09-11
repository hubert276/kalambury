const canvas = document.getElementById("paintCanvas");
const context = canvas.getContext("2d");
const thicknessInput = document.getElementById("thickness");
const thicknessValue = document.getElementById("thicknessValue");
const wordButtonsContainer = document.getElementById("chooseWords");
const selectedWord = document.getElementById("selectedWord");
let isDrawing = false;
let currentColor = "black"; // Domyślny kolor
let lineThickness = 2;

// wybor slowa

// Wykonywane przy załadowaniu strony
window.addEventListener("load", () => {
	const words = ["jabłko", "samochód", "rower", "kot", "pies", "dom"]; // Przykładowe słowa
	const selectedWords = [];
	// Wylosuj 3 unikalne słowa
	while (selectedWords.length < 3) {
		const randomIndex = Math.floor(Math.random() * words.length);
		const word = words[randomIndex];
		if (!selectedWords.includes(word)) {
			selectedWords.push(word);
		}
	}
	// Wygeneruj przyciski z wylosowanymi słowami
	selectedWords.forEach(word => {
		const button = document.createElement("button");
		button.textContent = word;
		button.addEventListener("click", () => {
			selectedWord.textContent = word;
			document.getElementById("overlay").style.display = "none"; // Ukryj overlay
		});
		wordButtonsContainer.appendChild(button);
	});
});
// kolory
const colorButtons = document.querySelectorAll(".color-button");
colorButtons.forEach(button => {
	button.addEventListener("click", e => {
		currentColor = e.target.style.backgroundColor;
		context.strokeStyle = currentColor;
	});
});
// grubosc pisaka
thicknessInput.addEventListener("input", e => {
	lineThickness = parseInt(e.target.value);
	thicknessValue.textContent = lineThickness; // Aktualizuj wyświetlaną grubość
});
// czysczenie plotna
const clearButton = document.getElementById("clearCanvas");
clearButton.addEventListener("click", () => {
	context.clearRect(0, 0, canvas.width, canvas.height); // Wyczyść płótno
});
// wybor slowa
const wordDisplay = document.getElementById("wordDisplay");
const words = ["jabłko", "samochód", "rower"]; // Przykładowe słowa

// malowanie
canvas.addEventListener("mousedown", () => {
	isDrawing = true;
});
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", () => {
	isDrawing = false;
	context.beginPath();
});
function draw(e) {
	if (!isDrawing) return;

	context.lineWidth = lineThickness;
	context.lineCap = "round";

	context.lineTo(
		e.clientX - canvas.getBoundingClientRect().left,
		e.clientY - canvas.getBoundingClientRect().top
	);
	context.stroke();
	context.beginPath();
	context.moveTo(
		e.clientX - canvas.getBoundingClientRect().left,
		e.clientY - canvas.getBoundingClientRect().top
	);
}
