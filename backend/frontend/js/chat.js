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
