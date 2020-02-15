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
        this._connection.query('SELECT id, name, created_time, edited_time FROM code_samples WHERE deleted = false ORDER BY created_time DESC', function (error, results, fields) {
            if (error)
                return next(error);

            res.status(200).json(results);
        });
    }

    _getCodeSampleRouteHandler(req, res, next) {
        this._connection.query('SELECT * FROM `code_samples` WHERE id = ?', [req.params.sampleId], function (error, results, fields) {
            if (error)
                return next(error);

            res.status(200).json(results[0]);
        });
    }

    getRouter() {
        return this._router;
    }
}

module.exports = GetRouter;