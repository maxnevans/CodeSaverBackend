const express = require('express');
const multer = require('multer');

class PutRouter {
    constructor(connection) {
        this._connection = connection;
        this._router = express.Router();
        this._upload = multer();

        this._setupRoutes(this._router);
    }

    _setupRoutes(router) {
        router.put('*', this._upload.single());
        
        router.put('/code/:sampleId', this._editCodeSampleHandler.bind(this));
        router.put('/code/upload/:sampleId', this._upload.single('code-file'), this._uploadCodeSampleHandler.bind(this));
    }

    _editCodeSampleHandler(req, res, next) {
        const editedTime = (new Date()).toString();
        this._connection.query('update code_samples set name = ?, code = ?, edited_time = ? where id = ?', 
            [req.body['code-name'], req.body['code-sample'], req.params.sampleId, editedTime], (error, results, fields) => {
            if (error)
                return next(error);

            res.status(200).end();
        });
    }

    _uploadCodeSampleHandler(req, res, next) {
        const editedTime = (new Date()).toString();
        this._connection.query('update code_samples set name = ?, code = ?, edited_time = ? where id = ?', 
            [req.body['code-name'], req.file.buffer.toString(), req.params.sampleId, editedTime], (error, results, fields) => {
            if (error)
                return next(error);

            res.status(200).end();
        });
    }

    getRouter() {
        return this._router;
    }
}

module.exports = PutRouter;