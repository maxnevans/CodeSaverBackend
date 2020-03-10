const express = require('express');
const expressGraphQL = require('express-graphql');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketio = require('socket.io');

const Auth = require('./middleware/auth');
const uploadMiddleware = require('./middleware/upload');
const socketMiddleware = require('./middleware/socket');

const SocketManager = require('./socket-manager.js')

const connection = require('./db');

const schema = require('./schema');
const resolvers = require('./resolvers/root');

class App {
    constructor(port) {
        this._port = port || 8080;
        this._connection = connection;
        this._app = express();
        this._server = http.Server(this._app);
        this._io = socketio(this._server);
        this._socketManager = new SocketManager(this._io);
        this.setupRoutes();
        this._app.use(express.static('../client/dist'));
    }

    setupRoutes() {
        this._app.use(cookieParser());
        this._app.use(Auth.parseTokenMiddleware);
        this._app.use(socketMiddleware);
        this._app.use('/graphql', (req, res, next) => expressGraphQL({
            schema,
            rootValue: resolvers,
            graphiql: true,
            context: { req, res, db: this._connection, socketManager: this._socketManager }
        })(req, res, next));
        this._app.use('/api/code/upload/:sampleId?', uploadMiddleware);
    }

    start() {
        this._connection.connect();

        this._server.listen(this._port, () => {
            console.log('Server is listening on port 8080!');
        });
    }
}

module.exports = { App };