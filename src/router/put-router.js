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
        
        router.put('/code/:sampleId', this._upload.single(), this._editCodeSampleHandler.bind(this));
        router.put('/code/upload/:sampleId', this._upload.single('code-file'), this._uploadCodeSampleHandler.bind(this));
    }

    _editCodeSampleHandler(req, res, next) {
        if (req.body['code-name'].length == 0)
            return res.status(406).json({reason: 'code name should not be empty'});

        if (req.body['code-sample'].length == 0)
            return res.status(406).json({reason: 'code sample should not be empty'});

        const editedTime = new Date();
        this._connection.query('update code_samples set name = ?, code = ?, edited_time = ? where id = ?', 
            [req.body['code-name'], req.body['code-sample'], editedTime, req.params.sampleId], (error, results, fields) => {
                
            if (error)
                return next(error);

            if (results.affectedRows === 0) {
                return res.status(404).end();
            }

            if (results.affectedRows > 1) {
                return res.status(500).end();
            }

            res.status(200).end();
        });
    }

    _uploadCodeSampleHandler(req, res, next) {
        if (req.body['code-name'].length == 0)
            return res.status(406).json({reason: 'code name should not be empty'});

        if (req.file.buffer.length == 0)
            return res.status(406).json({reason: 'code sample should not be empty'});

        const editedTime = new Date();
        this._connection.query('update code_samples set name = ?, code = ?, edited_time = ? where id = ?', 
            [req.body['code-name'], req.file.buffer.toString(), editedTime, req.params.sampleId], (error, results, fields) => {

            if (error)
                return next(error);

            if (results.affectedRows === 0) {
                return res.status(404).end();
            }

            if (results.affectedRows > 1) {
                return res.status(500).end();
            }

            res.status(200).end();
        });
    }

    getRouter() {
        return this._router;
    }
}

module.exports = PutRouter;