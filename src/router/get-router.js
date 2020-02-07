const express = require('express');

class GetRouter {
    constructor(connection) {
        this._router = express.Router();

        this._setupRouter(this._router, connection);
    }

    _setupRouter(router, connection) {
        router.get('/list', (req, res, next) => {
            connection.query('SELECT id, created_time FROM `code_samples` ORDER BY created_time DESC', function (error, results, fields) {
                if (error)
                    return next(error);

                const codeSamples = [];

                console.log(results);

                res.json(results);
            });
        });
        
        router.get('/code/:sampleId', (req, res, next) => {
            connection.query('SELECT * FROM `code_samples` WHERE id = ?',[req.params.sampleId] , function (error, results, fields) {
                if (error)
                    return next(error);

                console.log(results);

                res.json('this is a code sample');
            });
        });
    }

    getRouter() {
        return this._router;
    }
}



module.exports = GetRouter;