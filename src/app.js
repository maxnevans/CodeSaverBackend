const express = require('express');
const expressGraphQL = require('express-graphql');
const cookieParser = require('cookie-parser');

const Auth = require('./middleware/auth');
const uploadMiddleware = require('./middleware/upload');

const connection = require('./db');

const schema = require('./schema');
const resolvers = require('./resolvers/root');

class App {
    constructor(port) {
        this._port = port || 8080;
        this._connection = connection;
        this._app = express();
        this.setupRoutes();
        this._app.use(express.static('../client/dist'));
    }

    setupRoutes() {
        this._app.use(cookieParser());
        this._app.use(Auth.parseToken);
        this._app.use('/graphql', (req, res, next) => expressGraphQL({
            schema,
            rootValue: resolvers,
            graphiql: true,
            context: { req, res, db: this._connection }
        })(req, res, next));
        this._app.use('/api/code/upload/:sampleId?', uploadMiddleware);
    }

    start() {
        this._connection.connect();

        this._app.listen(this._port, 'localhost', () => {
            console.log('Server is listening on port 8080!');
        });
    }
}

module.exports = { App };