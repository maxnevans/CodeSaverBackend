const express = require('express');

class GetRouter {
    constructor(connection) {
        this._router = express.Router();
        this._connection = connection;

        this._setupRoutes(this._router);
    }

    _setupRoutes(router) {
        router.get('/list', this._getListRouteHandler.bind(this));
        router.get('/code/:sampleId', this._getCodeSampleRouteHandler.bind(this));
    }

    _getListRouteHandler(req, res, next) {
        this._connection.query('SELECT id, created_time FROM `code_samples` ORDER BY created_time DESC', function (error, results, fields) {
            if (error)
                return next(error);

            const codeSamples = [];

            console.log(results);

            res.json(results);
        });
    }

    _getCodeSampleRouteHandler(req, res, next) {
        connection.query('SELECT * FROM `code_samples` WHERE id = ?',[req.params.sampleId] , function (error, results, fields) {
            if (error)
                return next(error);

            console.log(results);

            res.json('this is a code sample');
        });
    }

    getRouter() {
        return this._router;
    }
}

module.exports = GetRouter;