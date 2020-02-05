const mysql = require('mysql');
const express = require('express');
const fs = require('fs');
const mustache = require('mustache');
const utils = require('./src/utils');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'spp',
    password: '123',
    database: 'spp'
});

connection.connect();

const app = express();
app.use(express.static('public'));

app.get('/', (req, res, next) => {
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

app.listen(8080, '127.0.0.1', () => {
    console.log('Server is listening on port 8080!');
});