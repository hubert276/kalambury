const express = require('express');
const app = express();

// socket.io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;

const Player = require('./Player.js');
const backendPlayers = [];
const backendLobbies = [];

app.use(express.static('frontend'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

server.listen(port, () => {
    console.log(`Serwer dziala na porcie: ${port}`)
});

io.on('connection', (socket) => {
    console.log(`user connected : ${socket.id}`);

    socket.on('checkUser', (checkPlayer) => {
        newUser = true;
        for (const player in backendPlayers) {
            if (backendPlayers[player].name == checkPlayer.name) {
                socket.emit('wrongUser')
                newUser = false;
            }
        }

        if (newUser == true) {
            i = backendPlayers.length + 1;
            n = checkPlayer.name
            s = socket.id
            p = new Player(i, n, s)
            backendPlayers.push(p)
            io.emit('updatePlayers', backendPlayers)
            console.log(backendPlayers)
            socket.emit('newPlayer')
        }
    })

    socket.on('disconnect', (reason) => {
        console.log(reason)
        let id;
        for (const player in backendPlayers) {
            if (backendPlayers[player].socket == socket.id) {
                id = backendPlayers[player].id
                backendPlayers.splice(id - 1, 1)
                l = backendPlayers.length

                for (i = id - 1; i < l; i++) {
                    backendPlayers[i].id = backendPlayers[i].id - 1;
                }
            }
        }
        socket.broadcast.emit('updatePlayers', backendPlayers)
    })

    socket.on('createLobby', ({ lobbyName, lobbyPass }) => {
        newLobby = true;
        for (const lobby in backendLobbies) {
            if (backendLobbies[lobby].lobbyName == lobbyName && backendLobbies[lobby].lobbyPass == lobbyPass) {
                socket.emit('wrongLobby')
                newLobby = false;
            }
        }

        if (newLobby == true) {
            backendLobbies.push({ lobbyName, lobbyPass })
            io.emit('updateLobbies', backendLobbies)
            socket.emit('enterLobby', lobbyName)
            socket.join(lobbyName)
            console.log(socket.rooms)
        }
        console.log(backendLobbies)
    })

    socket.on('pullLobbies', () => {
        socket.emit('updateLobbies', backendLobbies)
    })

});

