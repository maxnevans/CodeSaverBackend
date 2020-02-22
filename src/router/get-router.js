const express = require('express');
const AuthMiddleware = require('./common/auth-middleware');

class GetRouter {
    constructor(connection) {
        this._router = express.Router();
        this._connection = connection;
        this._auth = new AuthMiddleware(connection);

        this._setupRoutes(this._router);
    }

    _setupRoutes(router) {
        router.get('/test_auth',
            ...this._auth.verifyToken(),
            this._testAuthHandler.bind(this)
        );
        router.get('/list', 
            ...this._auth.verifyToken(),
            this._checkAccessRightsOnList.bind(this),
            this._getListRouteHandler.bind(this)
        );
        router.get('/code/:sampleId',  
            ...this._auth.verifyToken(),
            this._checkAccessRightsOnCodeSample.bind(this),
            this._getCodeSampleRouteHandler.bind(this)
        );
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

    _testAuthHandler(req, res, next) {
        res.json({...req.currentUser});
    }

    _checkAccessRightsOnCodeSample(req, res, next) {
        // All verified connections allowed
        next();
    }

    _checkAccessRightsOnList(req, res, next) {
        // All verified connections allowed
        next();
    }

    getRouter() {
        return this._router;
    }
}

module.exports = GetRouter;