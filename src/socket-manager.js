const Auth = require('./middleware/auth');

class SocketManager {
    #io;
    #tokenSockets;

    constructor(io) {
        this.#io = io;
        this.#setupHandlers(io);

        this.#tokenSockets = new Map();
    }

    codeEdited(token, socketId, sampleId) {
        console.log('codeEdited executing...');

        const socketsSet = this.#tokenSockets.get(token);

        if (socketsSet == null)
            return console.log('user is not authenticated!');

        if (!socketsSet.has(socketId))
            return console.log('user is not authenticated!')

        this.#io.sockets.emit('codeEdited', {
            id: sampleId
        });
    }

    codeCreated(token, socketId, code) {
        console.log('codeCreated executing...');

        const socketsSet = this.#tokenSockets.get(token);

        if (socketsSet == null)
            return console.log('user is not authenticated!');

        if (!socketsSet.has(socketId))
            return console.log('user is not authenticated!');
        
        this.#io.sockets.emit('codeCreated', code);
    }

    codeDeleted(token, socketId, sampleId) {
        console.log('codeDeleted executing...');
        const socketsSet = this.#tokenSockets.get(token);

        if (socketsSet == null)
            return console.log('user is not authenticated!');

        if (!socketsSet.has(socketId))
            return console.log('user is not authenticated!')

        this.#io.sockets.emit('codeDeleted', {
            id: sampleId
        });
    }

    #setupHandlers(io) {
        io.on('connection', (socket) => {
            socket.on('auth', this.#auth.bind(this, socket));
        });
    }

    #auth(socket, message) {
        if (message.token == null)
            return;
        
        if (!Auth.isValidToken(message.id, message.token))
            return;

        console.log('socket authenitacted...', socket.id);

        if (!this.#tokenSockets.has(message.token))
            this.#tokenSockets.set(message.token, new Set());

        const socketSet = this.#tokenSockets.get(message.token);
        socketSet.add(socket.id);
        this.#tokenSockets.set(message.token, socketSet);

        socket.emit('auth', {socketId: socket.id});
    }
}

module.exports = SocketManager;