const express = require('express');
const expressGraphQL = require('express-graphql');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketio = require('socket.io');
const cors = require("cors");
const fs = require("fs");
const url = require("url");

const Auth = require('./middleware/auth');
const codeUploadMiddleware = require('./middleware/code-upload');
const userUploadMiddleware = require('./middleware/user-upload');
const userDownloadMiddleware = require('./middleware/user-download');
const socketMiddleware = require('./middleware/socket');

const SocketManager = require('./socket-manager.js')

const connection = require('./db');

const { buildSchema } = require('graphql');
const resolvers = require('./resolvers/root');
const config = require("./config");


class App {
    #host;
    #port;
    #connection;
    #app;
    #server;
    #io;
    #socketManager;

    constructor(host, port) {
        this.#port = port || config.port;
        this.#host = host || config.host;
        this.#connection = connection;
        this.#app = express();
        this.#app.disable("x-powered-by");
        this.#app.use(cors());
        this.#server = http.Server(this.#app);
        this.#io = socketio(this.#server);
        this.#socketManager = new SocketManager(this.#io);
        this.setupRoutes();
    }

    setupRoutes() {
        this.#app.use(cookieParser());
        this.#app.use(Auth.parseTokenMiddleware);
        this.#app.use(socketMiddleware);
        this.#app.use("/graphql", (req, res, next) => expressGraphQL({
            schema: buildSchema(fs.readFileSync(config.schemaFileName).toString("utf-8")),
            rootValue: resolvers,
            graphiql: true,
            context: { req, res, db: this.#connection, socketManager: this.#socketManager }
        })(req, res, next));
        this.#app.use("/code/upload", codeUploadMiddleware());
        this.#app.use("/user/upload", userUploadMiddleware(config.userFilesDir, url.resolve(this.#host, config.userFilesUrl)));
        this.#app.use(config.userFilesUrl, [userDownloadMiddleware(), express.static(config.userFilesDir)]);
        this.#app.use("/", express.static(config.staticFilesDir));
    }

    start() {
        this.#connection.connect();
        this.#server.listen(this.#port, this.#host, () => {
            console.log('Server is listening on port 8080!');
        });
    }
}

module.exports = { App };