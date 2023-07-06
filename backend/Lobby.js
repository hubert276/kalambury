module.exports = class Lobby {
    constructor(id, name, password) {
        this.lobbyId = id
        this.lobbyName = name
        this.lobbyPassword = password
    }
    players = [];
}