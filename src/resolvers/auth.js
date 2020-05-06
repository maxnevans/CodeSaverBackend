const Auth = require('../middleware/auth');

const files = require("./files");

module.exports = {
    register: async (args, ctx) => {
        const userId = (await ctx.db.query('INSERT INTO users SET login = ?, password = ?;', [args.login, args.password]))?.insertId;

        const user = (await ctx.db.query('SELECT * FROM users WHERE id = ?;', [userId]))?.[0];

        if (user == null)
            return null;

            
        ctx.res.cookie(...Auth.createCookieToken({
            id: user.id,
            login: user.login,
        }));

        const avatars = await Promise.all((JSON.parse(user.avatars) ?? []).map(avatar => files.file({id: avatar}, ctx)));

        return {...user, avatars};
    },
    authorize: async (args, ctx) => {
        const user = (await ctx.db.query('SELECT * FROM users WHERE login = ? AND password = ?;', [args.login, args.password]))?.[0];
        if (user == null)
            return null;

        ctx.res.cookie(...Auth.createCookieToken({
            id: user.id,
            login: user.login
        }));

        const avatars = await Promise.all((JSON.parse(user.avatars) ?? []).map(avatar => files.file({id: avatar}, ctx)));

        return {...user, avatars};
    },
    unauthorize: (args, ctx) => {
        if (ctx.req.token == null)
            return false;

        ctx.res.cookie('token', null, {maxAge: 0});

        return true;
    },
    editPassword: async (args, ctx) => {
        if (ctx.req.token == null)
            return false;

        const results = await ctx.db.query('UPDATE users SET password = ? WHERE id = ? LIMIT 1;', [args.password, ctx.req.token.id]);

        if (results.affectedRows != 1)
            return false;

        return true;
    },
    fetchPassword: async (args, ctx) => {
        if (ctx.req.token == null)
            return null;

        const results = await ctx.db.query('SELECT password FROM users WHERE id = ? LIMIT 1;', [ctx.req.token.id]);

        if (results.length != 1)
            return null;

        return results[0].password;
    } 
};