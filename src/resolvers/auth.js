const Auth = require('../middleware/auth');

module.exports = {
    account: async (args, ctx) => {
        if (ctx.req.token == null)
            return null;

        try {
            const results = await ctx.db.query('SELECT * FROM users WHERE id = ?;', [ctx.req.token.id]);

            if (results.length != 1)
                return null;

            return {...results[0]};
        } catch(error) {
            return null;
        }
    },
    register: async (args, ctx) => {
        try {
            const results = await ctx.db.query('INSER INTO users SET login = ?, password = ?;', [args.login, args.password]);
            const user = {
                id: results.insertId,
                login: args.login,
                password: args.password
            };

            ctx.res.cookie(...Auth.createCookieToken(user));

            return {
                id: results.insertId,
                token: Auth.createToken(user)
            }; 
        } catch (error) {
            return null;
        }    
    },
    authorize: async (args, ctx) => {
        let results = null;
        try {
            results = await ctx.db.query('SELECT * FROM users WHERE login = ? AND password = ? LIMIT 1;',
                [args.login, args.password]);
        } catch(error) {
            return null;
        }

        if (results.length != 1)
            return null;

        const user = {...results[0]};

        ctx.res.cookie(...Auth.createCookieToken(user));

        return {
            id: user.id,
            token: Auth.createToken(user)
        };
    },
    unauthorize: (args, ctx) => {
        if (ctx.req.token == null)
            return false;

        ctx.res.cookie('token', null, {maxAge: 0});

        return true;
    },
};