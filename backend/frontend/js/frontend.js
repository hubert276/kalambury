const socket = io();
const frontendPlayers = [];
const frontendLobbies = [];
let list = document.getElementById("lobbiesList");
let list2 = document.getElementById("lobbyPlayers");
let lobNam;

// wprowadzono złą nazwę użytkownika
socket.on("wrongUser", () => {
	alert("Username already taken");
});

// aktualizacja listy użytkowników
socket.on("updatePlayers", backendPlayers => {
	// console.log(backendPlayers)

	for (const player in backendPlayers) {
		if (!frontendPlayers[player]) {
			frontendPlayers.push(backendPlayers[player]);
		}
	}
});

// zmiana storny po utworzeniu użytkonika
socket.on("newPlayer", () => {
	pullLobbies();
	document.getElementById("first").style.display = "none";
	document.getElementById("second").style.display = "block";
	document.getElementById("secondCreate").style.display = "none";
	document.getElementById("inputPassword").style.display = "none";
});

// aktualizacja listy lobby
socket.on("updateLobbies", backendLobbies => {
	for (const lobby in backendLobbies) {
		if (!frontendLobbies[lobby]) {
			frontendLobbies[lobby] = backendLobbies[lobby];
			let x = backendLobbies[lobby].lobbyName;
			if (!list[x]) {
				var li = document.createElement("li");
				li.classList.add("lobbyList");
				li.innerText = x;
				list.appendChild(li);
			}
		}
	}
	console.log(frontendLobbies);
});

// aktualizacja listy graczy w tym samym lobby
socket.on("updateLobbyPlayers", backend => {
	for (const player in backend.lobby.players) {
		t = backend.lobby.players[player];
		if (!frontendLobbies[backend.id].players[player]) {
			frontendLobbies[backend.id].players.push(t);
			if (!list2[t]) {
				var li = document.createElement("li");
				li.innerText = t;
				list2.appendChild(li);
			}
		}
	}
	console.log(list2);
});

// wprowadzono złą nazwę lobby
socket.on("wrongLobby", () => {
	alert("Lobby already exists");
});

// zmiana strony przy wejściu do lobby
socket.on("enterLobby", lobbyName => {
	console.log("entering a lobby");
	console.log(frontendLobbies);
	document.getElementById("second").style.display = "none";
	document.getElementById("third").style.display = "block";
	// console.log(socket.rooms)
});
// zmiana strony na gre
socket.on("createGame2", () => {
	randomRole();
	console.log("entering to game");
});
// sprawdzanie czy użytkownik już istnieje lub jego stworzenie
function play() {
	username = document.getElementById("inputName").value;
	if (username == null || username == "") {
		alert("Please enter a name");
	} else {
		socket.emit("checkUser", { name: username });
	}
}

// wyświetlanie pola do wpisania hasła
function writePass() {
	checkbox = document.getElementById("passCheckbox").checked;
	if (checkbox == true) {
		document.getElementById("inputPassword").style.display = "block";
	} else {
		document.getElementById("inputPassword").style.display = "none";
	}
}

// tworzenie lobby
function createLobby() {
	lobbyName = "";
	lobbyPass = "";
	checkbox = document.getElementById("passCheckbox").checked;
	lobbyName = document.getElementById("inputLobbyName").value;
	lobbyPass = document.getElementById("inputPassword").value;
	if (checkbox == false && (lobbyName == null || lobbyName == "")) {
		alert("Please enter a lobby name");
	} else if (
		checkbox == true &&
		(lobbyName == null ||
			lobbyName == "" ||
			lobbyPass == null ||
			lobbyPass == "")
	) {
		alert("Please enter a lobby name and a password");
	} else {
		socket.emit("createLobby", { lobbyName, lobbyPass });
	}
}

function pullLobbies() {
	console.log("pulling lobbies");
	socket.emit("pullLobbies");
}

function chooseLobby(lobby) {
	socket.emit("chooseLobby", lobby);
}
function createGame() {
	socket.emit("createGame", frontendPlayers);
}

// chat
socket.on("message", message => {
	displayMessage(message);
});

// Funkcja do wyświetlania wiadomości na czacie
function displayMessage(message) {
	const chatMessages = document.getElementById("chat-messages");
	const messageElement = document.createElement("div");
	messageElement.textContent = message;
	chatMessages.appendChild(messageElement);
}
const sendButton = document.getElementById("send-button");
sendButton.addEventListener("click", () => {
	const chatInput = document.getElementById("chat-input");
	const message = chatInput.value;
	socket.emit("message", message, frontendPlayers);
	chatInput.value = "";
});

// GAME !!!
canvas = document.getElementById("paintCanvas");
const context = canvas.getContext("2d");
const thicknessInput = document.getElementById("thickness");
const thicknessValue = document.getElementById("thicknessValue");
const wordButtonsContainer = document.getElementById("chooseWords");
const selectedWord = document.getElementById("selectedWord");
let isDrawing = false;
let currentColor = "black"; // Domyślny kolor
let lineThickness = 2;
let Tour = 0;
let PlayerRole = "";
let xSave = 0;
let ySave = 0;
let delay = 0;

function randomRole() {
	for (const player in frontendPlayers) {
		frontendPlayers[player].role = "observer";
		if (frontendPlayers[player].socket == socket.id) {
			PlayerRole = frontendPlayers[player].role;
		}
	}
	frontendPlayers[Tour % frontendPlayers.length].role = "printer";
	if (frontendPlayers[Tour % frontendPlayers.length].socket == socket.id) {
		PlayerRole = frontendPlayers[Tour % frontendPlayers.length].role;
	}
	console.log(frontendPlayers);
	roleAtributes();
}
function roleAtributes() {
	console.log(PlayerRole);
	if (PlayerRole == "printer") {
		const p = document.createElement("p");
		p.innerText = "Jestes malarzem";
		wordButtonsContainer.appendChild(p);
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
				selectedWord.textContent = "Narysuj: " + word;
				document.getElementById("overlay").style.display = "none"; // Ukryj overlay
				document.getElementById("chat-input").disabled = true;
				document.getElementById("send-button").disabled = true;
			});
			wordButtonsContainer.appendChild(button);
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
			// Wysyłanie akcji do drugiego gracza
			socket.emit("clearCanvas");
		});
		// malowanie
		canvas.addEventListener("mousedown", () => {
			isDrawing = true;
		});
		canvas.addEventListener("mousemove", draw);
		canvas.addEventListener("mouseup", () => {
			isDrawing = false;
			context.beginPath();
			delay = 1000;
		});
		function draw(e) {
			if (!isDrawing) return;

			context.lineWidth = lineThickness;
			context.lineCap = "round";

			const x = e.clientX - canvas.getBoundingClientRect().left;
			const y = e.clientY - canvas.getBoundingClientRect().top;
			// Wysyłanie danych malowania do serwera za pomocą Socket.IO
			socket.emit("drawing", {
				x,
				y,
				color: currentColor,
				thickness: lineThickness,
				delay: delay,
			});
			context.lineTo(x, y);
			context.stroke();
			context.beginPath();
			context.moveTo(x, y);
			delay = 0;
		}
	} else {
		const p = document.createElement("p");
		p.innerText = "Jestes obserwatorem";
		selectedWord.textContent = "Sprobuj zgadnac wylosowane slowo";
		wordButtonsContainer.appendChild(p);
		const button = document.createElement("button");
		button.textContent = "OK";
		button.addEventListener("click", () => {
			document.getElementById("overlay").style.display = "none";
		});
		wordButtonsContainer.appendChild(button);
		document.getElementsByClassName("left-div").disabled = true;
		document.getElementsByClassName("canvas-div").disabled = true;
	}
	document.getElementById("third").style.display = "none";
	document.getElementById("gamePage").style.display = "block";
}
socket.on("drawing", data => {
	// Odbieranie danych malowania od innych graczy i aktualizacja płótna
	drawOnCanvas(data);
});
// Funkcja do rysowania na płótnie na podstawie danych
function drawOnCanvas(data) {
	context.lineWidth = data.thickness;
	context.lineCap = "round";
	context.strokeStyle = data.color;
	if (xSave != 0 || ySave != 0) {
		const distance = (((data.x - xSave) ^ 2) + (data.y - ySave)) ^ 2;
		console.log(distance);
		if (Math.abs(distance) + data.delay > 1000) {
			context.moveTo(data.x, data.y);
		}
	}
	context.lineTo(data.x, data.y);
	context.stroke();
	context.beginPath();
	context.moveTo(data.x, data.y);
	xSave = data.x;
	ySave = data.y;
}
socket.on("clearCanvas", () => {
	context.clearRect(0, 0, canvas.width, canvas.height); // Wyczyść płótno
});
