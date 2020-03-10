const jwt = require('jsonwebtoken');

const SECRET = 'this is a secret';

module.exports = {
    parseTokenMiddleware: (req, res, next) => {
        if (req.cookies == null)
            throw new Error('cookies is undefined! please parse req.cookies first');
    
        try {
            req.token = jwt.verify(req.cookies.token, SECRET);
            req.token.token = req.cookies.token;
        } catch(error) {
            req.token = null;
        }
    
        next();
    },
    createToken: (user) => {
        return jwt.sign(user, SECRET);
    },
    createCookieToken: (user) => {
        return [
            'token',
            jwt.sign(user, SECRET),
            {httpOnly: true}
        ];
    },
    getCurrentToken(context) {
        return context.req.cookies.token;
    },
    isValidToken(userId, token) {
        try {
            const user = jwt.verify(token, SECRET);
            return user.id == userId;
        } catch(error) {
            return false;
        }
    }
};