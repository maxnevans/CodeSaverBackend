const express = require('express');

class DeleteRouter {
    constructor(connection) {
        this._connection = connection;
        this._router = express.Router();

        this._setupRoutes(this._router);
    }

    _setupRoutes(router) {
        router.delete('/code/:sampleId', this._deleteCodeSampleHandler.bind(this));
    }

    _deleteCodeSampleHandler(req, res, next) {
        this._connection.query('update code_samples set deleted = true where id = ?', [req.params.sampleId], (error, results, fields) => {
            if (error)
                return next(error);
                
            res.status(200).end();
        });
    }

    getRouter() {
        return this._router;
    }
}

module.exports = DeleteRouter;