const express = require("express");
const app = express();

// socket.io setup
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;

const Player = require("./Player.js");
const Lobby = require("./Lobby.js");
const backendPlayers = [];
const backendLobbies = [];
let k = 0;

app.use(express.static("frontend"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/frontend/index.html");
});

server.listen(port, () => {
	console.log(`Serwer dziala na porcie: ${port}`);
});

io.on("connection", socket => {
	console.log(`user connected : ${socket.id}`);
	// tworzenie nowych użytkowników
	socket.on("checkUser", checkPlayer => {
		newUser = true;

		for (const player in backendPlayers) {
			if (backendPlayers[player].name == checkPlayer.name) {
				socket.emit("wrongUser");
				newUser = false;
			}
		}

		if (newUser == true) {
			i = backendPlayers.length + 1;
			n = checkPlayer.name;
			s = socket.id;
			p = new Player(i, n, s);
			backendPlayers.push(p);
			io.emit("updatePlayers", backendPlayers);
			console.log(backendPlayers);
			socket.emit("newPlayer");
		}
	});

	// usuwanie użytkowników
	socket.on("disconnect", reason => {
		console.log(reason);
		let id;
		let tempName = "";
		let tempLobbyId = "";

		// usuwanie użytkowników z backendPlayers
		for (const player in backendPlayers) {
			if (backendPlayers[player].socket == socket.id) {
				id = backendPlayers[player].id;
				tempName = backendPlayers[player].name;
				backendPlayers.splice(id - 1, 1);
				l = backendPlayers.length;

				for (i = id - 1; i < l; i++) {
					backendPlayers[i].id = backendPlayers[i].id - 1;
				}
			}
		}

		// usuwanie użytkowników z backendLobbies
		if (tempName !== "" || tempName !== null) {
			for (const lobby in backendLobbies) {
				for (const player in backendLobbies[lobby].players) {
					if (backendLobbies[lobby].players[player] == tempName) {
						tempLobbyId = backendLobbies[lobby].lobbyId;
						backendLobbies[lobby].players.splice(player, 1);
						console.log("splicin");
					}
				}

				// usuwanie pustego lobby
				if (
					backendLobbies[lobby].players == "" ||
					backendLobbies[lobby].players == null
				) {
					backendLobbies.splice(lobby, 1);
				}
			}
		}

		io.emit("updatePlayers", backendPlayers);
		io.emit("updateLobbies", backendLobbies);
	});

	// tworzenie lobby
	socket.on("createLobby", ({ lobbyName, lobbyPass }) => {
		newLobby = true;

		// sprawdzenie czy takie lobby już istnieje
		for (const lobby in backendLobbies) {
			if (
				backendLobbies[lobby].lobbyName == lobbyName &&
				backendLobbies[lobby].lobbyPass == lobbyPass
			) {
				socket.emit("wrongLobby");
				newLobby = false;
			}
		}

		// stworzenie nowego lobby
		if (newLobby == true) {
			tempId = k;
			l = new Lobby(tempId, lobbyName, lobbyPass);
			backendLobbies[l.lobbyId] = l;
			socket.join(lobbyName);
			io.emit("updateLobbies", backendLobbies);

			// dodanie właściciela lobby do listy graczy
			for (const player in backendPlayers) {
				if (backendPlayers[player].socket == socket.id) {
					playerName = backendPlayers[player].name;
					backendLobbies[l.lobbyId].players.push(playerName);
					socket.emit("updateLobbyPlayers", {
						lobby: backendLobbies[tempId],
						id: l.lobbyId,
					});
					console.log(l.lobbyId);
				}
			}

			socket.emit("enterLobby", lobbyName);
			console.log(socket.rooms);
		}

		console.log(backendLobbies);
		k++;
	});

	socket.on("pullLobbies", () => {
		socket.emit("updateLobbies", backendLobbies);
	});

	// dołączenie do istniejącego lobby
	socket.on("chooseLobby", lobNam => {
		socket.join(lobNam);
		io.emit("updateLobbies");
		let id;

		for (const lobby in backendLobbies) {
			if (backendLobbies[lobby].lobbyName == lobNam) {
				id = backendLobbies[lobby].lobbyId;
			}
		}

		for (const player in backendPlayers) {
			if (backendPlayers[player].socket == socket.id) {
				playerName = backendPlayers[player].name;
				backendLobbies[id].players.push(playerName);
			}
		}

		io.emit("updateLobbyPlayers", {
			lobby: backendLobbies[id],
			id: id,
		});
		socket.emit("enterLobby");
	});
	socket.on("createGame", players => {
		console.log(players);
		for (const player in players) {
			socket.to(players[player].socket).emit("createGame2");
		}
		socket.emit("createGame2");
	});
	//malowanie
	// przysylanie malowania
	socket.on("drawing", data => {
		socket.broadcast.emit("drawing", data);
	});
	//czyszczenie
	socket.on("clearCanvas", () => {
		// Przekaż akcję do innych klientów, aby również wyczyścili swoje płótno
		socket.broadcast.emit("clearCanvas");
	});
	// chat
	socket.on("message", (message, players) => {
		console.log(`Otrzymano wiadomość: ${message}`);
		console.log(players);
		for (const player in players) {
			console.log(players);
			socket.to(players[player].socket).emit("message", message);
		}
		socket.emit("message", message);
	});

	socket.on("disconnect", () => {
		console.log("Klient rozłączony");
	});
});
