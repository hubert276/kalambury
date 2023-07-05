module.exports = class Player {
    constructor(id, name, socket) {
        this.id = id
        this.name = name
        this.socket = socket
    }
}