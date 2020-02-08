const mysql = require('mysql');
const express = require('express');
const GetRouter = require('./router/get-router');
const PostRouter = require('./router/post-router');
const DeleteRouter = require('./router/delete-router');
const PutRouter = require('./router/put-router');

class App {
    constructor(port) {
        this._port = port || 8080;
        this._connection = mysql.createConnection({
            host: 'localhost',
            user: 'codesaver',
            password: '123',
            database: 'code_saver'
        });

        this._app = express();
        this.setupRoutes();
        this._app.use(express.static('../client/dist'));
    }

    setupRoutes() {
        this._app.use('/api', (new GetRouter(this._connection)).getRouter());
        this._app.use('/api', (new PostRouter(this._connection)).getRouter());
        this._app.use('/api', (new DeleteRouter(this._connection)).getRouter());
        this._app.use('/api', (new PutRouter(this._connection)).getRouter());
    }

    start() {
        this._connection.connect();
        
        this._app.listen(this._port, 'localhost', () => {
            console.log('Server is listening on port 8080!');
        });
    }
}

module.exports = {App};