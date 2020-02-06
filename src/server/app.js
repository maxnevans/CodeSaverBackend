const mysql = require('mysql');
const express = require('express');
const fs = require('fs');
const utils = require('./utils');

class App {
    constructor() {
        this._connection = mysql.createConnection({
            host: 'localhost',
            user: 'spp',
            password: '123',
            database: 'spp'
        });

        this._app = express();
        this._app.use(express.static('public'));

        this.setupPathes();
    }

    setupPathes() {
        this._app.get('/', (req, res, next) => {
            const indexTemplate = fs.readFileSync('./pages/index.mst');
            
            connection.query('SELECT * FROM `tasks` ORDER BY id DESC', function (error, results, fields) {
                if (error) throw error;
                
                const tasks = results.map((task) => {
                    
                    const retVal = {...task};
        
                    if (task['time_created']) {
                        retVal.created = utils.parseDateTime(task['time_created']);
                    }
        
                    if (task['time_expired']) {
                        retVal.expires = utils.parseDateTime(task['time_expired']);
                    }
        
                    return retVal;
                });
                
                res.end(mustache.render(indexTemplate.toString(), {
                    tasks
                }));
            });    
        });
    }

    start() {
        this._connection.connect();
        
        this._app.listen(8080, '127.0.0.1', () => {
            console.log('Server is listening on port 8080!');
        });
    }
}

module.exports = {App};