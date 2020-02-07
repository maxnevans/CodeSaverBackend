const mysql = require('mysql');
const express = require('express');
const GetRouter = require('./router/get-router');

class App {
    constructor() {
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
    }

    start() {
        this._connection.connect();
        
        this._app.listen(8080, 'localhost', () => {
            console.log('Server is listening on port 8080!');
        });
    }
}

module.exports = {App};