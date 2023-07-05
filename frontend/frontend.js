const socket = io();
const frontendPlayers = [];
const frontendLobbies = [];
let list = document.getElementById("lobbiesList");

socket.on('wrongUser', () => {
    alert("Username already taken")
})

socket.on('updatePlayers', (backendPlayers) => {

    for (const player in backendPlayers) {
        if (!frontendPlayers[player]) {
            frontendPlayers.push(backendPlayers[player])
        }
    }
    console.log(frontendPlayers)
})

socket.on('newPlayer', () => {
    pullLobbies();
    document.getElementById("first").style.display = "none"
    document.getElementById("second").style.display = "block"
    document.getElementById("secondCreate").style.display = "none"
    document.getElementById("inputPassword").style.display = "none"
})

socket.on('updateLobbies', (backendLobbies) => {
    for (const lobby in backendLobbies) {
        if (!frontendLobbies[lobby]) {
            frontendLobbies.push(backendLobbies[lobby])
        }
    }

    for (const lobby in frontendLobbies) {
        x = frontendLobbies[lobby].lobbyName
        if (!list[x]) {
            var li = document.createElement('li');
            li.innerText = frontendLobbies[lobby].lobbyName;
            list.appendChild(li);
        }
    }
    console.log(frontendLobbies)
})

socket.on('wrongLobby', () => {
    alert("Lobby already exists")
})

function play() {
    username = document.getElementById("inputName").value
    if (username == null || username == '') {
        alert("Please enter a name")
    } else {
        socket.emit("checkUser", { name: username })
    }
}

socket.on('enterLobby', (lobbyName) => {
    console.log("entering a lobby")
    document.getElementById("second").style.display = "none"
    document.getElementById("third").style.display = "block"
})

function writePass() {
    checkbox = document.getElementById("passCheckbox").checked
    if (checkbox == true) {
        document.getElementById("inputPassword").style.display = "block"
    } else {
        document.getElementById("inputPassword").style.display = "none"
    }
}

function createLobby() {
    lobbyName = ""
    lobbyPass = ""
    checkbox = document.getElementById("passCheckbox").checked
    lobbyName = document.getElementById("inputLobbyName").value
    lobbyPass = document.getElementById("inputPassword").value
    if (checkbox == false && (lobbyName == null || lobbyName == '')) {
        alert("Please enter a lobby name")
    } else if (checkbox == true && (lobbyName == null || lobbyName == '' || lobbyPass == null || lobbyPass == '')) {
        alert("Please enter a lobby name and a password")
    } else {
        socket.emit("createLobby", ({ lobbyName, lobbyPass }))
    }
}

function pullLobbies() {
    console.log("pulling lobbies")
    socket.emit('pullLobbies')
}


