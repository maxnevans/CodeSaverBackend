const Auth = require('./middleware/auth');

class SocketManager {
    constructor(io) {
        this._io = io;
        this._setupHandlers(io);

        this._tokenSockets = new Map();
    }

    _setupHandlers(io) {
        io.on('connection', (socket) => {
            socket.on('auth', this._auth.bind(this, socket));
        });
    }

    _auth(socket, message) {
        if (message.token == null)
            return;
        
        if (!Auth.isValidToken(message.id, message.token))
            return;

        console.log('socket authenitacted...', socket.id);

        if (!this._tokenSockets.has(message.token))
            this._tokenSockets.set(message.token, new Set());

        const socketSet = this._tokenSockets.get(message.token);
        socketSet.add(socket.id);
        this._tokenSockets.set(message.token, socketSet);

        socket.emit('auth', {socketId: socket.id});
    }

    codeEdited(token, socketId, sampleId) {
        console.log('codeEdited executing...');

        const socketsSet = this._tokenSockets.get(token);

        if (socketsSet == null)
            return console.log('user is not authenticated!');

        if (!socketsSet.has(socketId))
            return console.log('user is not authenticated!')

        this._io.sockets.emit('codeEdited', {
            id: sampleId
        });
    }

    codeCreated(token, socketId, code) {
        console.log('codeCreated executing...');

        const socketsSet = this._tokenSockets.get(token);

        if (socketsSet == null)
            return console.log('user is not authenticated!');

        if (!socketsSet.has(socketId))
            return console.log('user is not authenticated!');
        
        this._io.sockets.emit('codeCreated', code);
    }

    codeDeleted(token, socketId, sampleId) {
        console.log('codeDeleted executing...');
        const socketsSet = this._tokenSockets.get(token);

        if (socketsSet == null)
            return console.log('user is not authenticated!');

        if (!socketsSet.has(socketId))
            return console.log('user is not authenticated!')

        this._io.sockets.emit('codeDeleted', {
            id: sampleId
        });
    }
}

module.exports = SocketManager;