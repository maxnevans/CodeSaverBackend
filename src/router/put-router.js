const express = require('express');

class PutRouter {
    constructor(connection) {
        this._connection = connection;
        this._router = express.Router();

        this._setupRoutes(this._router);
    }

    _setupRoutes(router) {
        router.put('/code/:sampleId', this._editCodeSampleHandler.bind(this));
    }

    _editCodeSampleHandler(req, res, next) {
        const editedTime = (new Date()).toString();
        this._connection.query('update code_samples set code = ?, edited_time = ? where id = ?', 
            ['This text is hardcoded', req.params.sampleId, editedTime], (error, results, fields) => {
            if (error)
                return next(error);

            res.json('code sample has been successfully changed');
        });
    }
}