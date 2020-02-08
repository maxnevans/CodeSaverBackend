const express = require('express');
const multer = require('multer');

class PostRouter {
    constructor(connection) {
        this._connection = connection;
        this._router = express.Router();
        this._upload = multer();

        this._setupRoutes(this._router);
    }

    _setupRoutes(router) {
        router.post('/code/upload', this._upload.single('code-file'), this._uploadCodeSampleHandler.bind(this));
        router.post('/code/create', this._createCodeSampleHandler.bind(this));
    }

    _uploadCodeSampleHandler(req, res, next) {
        this._connection.query('insert into code_samples set name = ?, author_id = ?, code = ?', 
            ['hardcoded code name', 1, req.file.buffer.toString()], (error, results, fields) => {
            if (error)
                return next(error);

            console.log('file uploaded');

            res.json('file has been uploaded');
        });
    }

    _createCodeSampleHandler(req, res, next) {
        this._connection.query('insert into code_samples set name = ?, author_id = ?, code = ?', 
            ['hardcoded code name', 1, 'this is hardcoded content'], (error, results, fields) => {
            if (error)
                return next(error);

            console.log('file created');

            res.json('file has been created');
        });
    }

    getRouter() {
        return this._router;
    }
}

module.exports = PostRouter;