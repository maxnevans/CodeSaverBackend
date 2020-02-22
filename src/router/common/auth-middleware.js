const multer = require('multer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

class AuthMiddleware {
    static secret = 'some sort of secret info';
    static LOGIN_MIN_LENGTH = 6;
    static PASSWORD_MIN_LENGTH = 6;
    static AUTH_TIME_TO_LIVE = 3600 * 24;

    constructor(connection) {
        this._upload = multer();
        this._connection = connection;
    }

    _checkLoginAndPassword(req, res, next) {
        const login = req.body['login'].toString();
        const password = req.body['password'].toString();

        if (login.length < AuthMiddleware.LOGIN_MIN_LENGTH)
            return res.status(406).json({reason: 'login should be more than 5 characters'});

        if (password.length < AuthMiddleware.PASSWORD_MIN_LENGTH)
            return res.status(406).json({reason: 'passowrd should be more than 5 characters'});

        this._connection.query('SELECT * FROM users WHERE login = ? AND password = ? LIMIT 1;',
            [login, password], (error, results, fields) => {
                if (error)
                    return next(error);

                if (results.length == 0)
                    return res.status(404).json({reason: 'wrong login or password'});

                // Double check pass and login
                if (results[0].login !== login || results[0].password !== password)
                    return res.status(404).json({reason: 'wrong login or password'});

                req.currentUser = {...results[0]};
                next();
        });
    }

    _writeAuthToken(req, res, next) {
        const token = jwt.sign(req.currentUser, AuthMiddleware.secret);

        res.cookie('token', token, {maxAge: AuthMiddleware.AUTH_TIME_TO_LIVE * 1000, httpOnly: true}).end();
    }

    _verifyToken(req, res, next) {
        if (req.cookies.token == null)
            return res.status(401).end();

        let user = null;

        try {
            user = jwt.verify(req.cookies.token, AuthMiddleware.secret);
        } catch(error) {
            return res.status(422).json({reason: 'invalid token'});
        }
        
        req.currentUser = user;
        next();
    }

    _registerUser(req, res, next) {
        if (req.body['login'].toString().length == 0)
            return res.status(406).json({reason: 'login can not be empty'});

        if (req.body['login'].toString().length < AuthMiddleware.LOGIN_MIN_LENGTH)
            return res.status(406).json({reason: 'login can not be less than 6 characters'});

        if (req.body['password'].toString().length == 0)
            return res.status(406).json({password: 'password can not be empty'});

        if (req.body['password'].toString().length < AuthMiddleware.PASSWORD_MIN_LENGTH)
            return res.status(406).json({password: 'password can not be less than 6 characters'});

        const login = req.body['login'].toString();
        const password = req.body['password'].toString();

        this._connection.query('INSERT INTO users SET login = ?, password = ?;',
            [login, password], (error, results, fields) => {
            if (error.code === 'ER_DUP_ENTRY')
                return res.status(406).json({reason: `user {${login}} already exists`});

            if (error)
                return next(error);

            if (results.insertId == null)
                return res.status(500).end();

            return res.status(201).json({
                id: results.insertId,
                login,
                password
            });
        });
    }

    _logout(req, res, next) {
        if (req.cookies['token'] == null)
            return res.status(200).end();

        res.cookie('token', null, {maxAge: 0, httpOnly: true}).end();
    }

    authorize() {
        return [
            this._upload.single(),
            this._checkLoginAndPassword.bind(this),
            this._writeAuthToken.bind(this)
        ];
    }

    verifyToken() {
        return [
            cookieParser(),
            this._verifyToken.bind(this)
        ];
    }

    registerUser() {
        return [
            this._upload.single(),
            this._registerUser.bind(this)
        ];
    }

    logout() {
        return [
            cookieParser(),
            this._logout.bind()
        ];
    }
}

module.exports = AuthMiddleware;