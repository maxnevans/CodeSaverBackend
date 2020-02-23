const express = require('express');
const multer = require('multer');
const AuthMiddleware = require('./common/auth-middleware');

class PostRouter {
    constructor(connection) {
        this._connection = connection;
        this._router = express.Router();
        this._upload = multer();
        this._auth = new AuthMiddleware(connection);

        this._setupRoutes(this._router);
    }

    _setupRoutes(router) {
        router.post('/register', 
            ...this._auth.registerUser()
        );
        router.put('/auth', 
            ...this._auth.authorize()
        );
        router.post('/code/upload', 
            ...this._auth.verifyToken(),
            this._upload.single('code-file'),
            this._uploadCodeSampleHandler.bind(this)
        );
        router.post('/code/create', 
            ...this._auth.verifyToken(),
            this._upload.single(), 
            this._createCodeSampleHandler.bind(this)
        );
    }

    _uploadCodeSampleHandler(req, res, next) {        
        if (req.body['code-name'].length == 0)
            return res.status(406).json({reason: 'code name should not be empty'});

        if (req.file.buffer.length == 0)
            return res.status(406).json({reason: 'code sample should not be empty'});

        this._connection.query('insert into code_samples set name = ?, author_id = ?, code = ?', 
            [req.body['code-name'], 1, req.file.buffer.toString('utf-8')], (error, results, fields) => {
            if (error)
                return next(error);

            res.status(200).json({
                codeSampleId: results.insertId
            });
        });
    }

    _createCodeSampleHandler(req, res, next) {
        if (req.body['code-name'].length == 0)
            return res.status(406).json({reason: 'code name should not be empty'});

        if (req.body['code-sample'].length == 0)
            return res.status(406).json({reason: 'code sample should not be empty'});

        this._connection.query('insert into code_samples set name = ?, author_id = ?, code = ?', 
            [req.body['code-name'], 1, req.body['code-sample']], (error, results, fields) => {
            if (error)
                return next(error);

            res.status(200).json({
                codeSampleId: results.insertId
            });
        });
    }

    getRouter() {
        return this._router;
    }
}

module.exports = PostRouter;