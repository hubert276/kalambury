const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path"); // Moduł path do zarządzania ścieżkami

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Ustaw folder publiczny, gdzie znajduje się plik index.html
app.use(express.static("public"));

// Obsługa połączeń klientów przez Socket.IO
io.on("connection", socket => {
	console.log("Klient połączony");

	// Obsługa wiadomości i innych zdarzeń Socket.IO
	socket.on("message", message => {
		console.log(`Otrzymano wiadomość: ${message}`);
		io.emit("message", message); // Rozsyłanie wiadomości do wszystkich klientów
	});

	socket.on("disconnect", () => {
		console.log("Klient rozłączony");
	});
});

// Serwuj stronę główną (index.html)
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

// Uruchom serwer
server.listen(PORT, () => {
	console.log(`Serwer działa na porcie ${PORT}`);
});
