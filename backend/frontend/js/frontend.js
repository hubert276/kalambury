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
	console.log("entering to game");
	document.getElementById("third").style.display = "none";
	document.getElementById("gamePage").style.display = "block";
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
	socket.emit("createGame");
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

// Obsługa przycisku "Wyślij"
const sendButton = document.getElementById("send-button");
sendButton.addEventListener("click", () => {
	const chatInput = document.getElementById("chat-input");
	const message = chatInput.value;

	// Wyślij wiadomość do serwera za pomocą Socket.IO
	socket.emit("message", message);

	// Wyczyść pole tekstowe
	chatInput.value = "";
});
