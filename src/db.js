const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'codesaver',
    password: '123',
    database: 'code_saver'
});

const queryFunction = connection.query.bind(connection);
connection.query = (...args) => {
    return new Promise((res, rej) => {
        queryFunction(...args, (error, results, fields) => {
            if (error)
                return rej(error);

            res(results);
        });
    });
};


module.exports = connection;