const files = require("./files");

module.exports = {
    user: async (args, ctx) => {
        if (ctx.req.token == null)
            return null;

        const userId = args.id ?? ctx.req.token.id;

        const results = await ctx.db.query('SELECT * FROM users WHERE id = ?;', [userId]);

        if (results.length != 1)
            return null;

        const avatars = await Promise.all((JSON.parse(results[0].avatars) ?? []).map(avatar => files.file({id: avatar}, ctx)));

        return {...results[0], avatars};
    },
    editUser: async (args, ctx) => {
        if (ctx.req.token == null)
            return ctx.res.status(401);

        const updateValues = {};

        args.data.name != null && (updateValues.name = args.data.name);
        args.data.secondName != null && (updateValues.secondName = args.data.secondName);
        args.data.login == null && (updateValues.login = args.data.login);
        args.data.avatars !== undefined && (updateValues.avatars = JSON.stringify(args.data.avatars));

        if (Object.getOwnPropertyNames(updateValues).length == 0)
            return null;

        const values = Object.getOwnPropertyNames(updateValues).map(key => `${key} = '${updateValues[key]}'`).join(", ");

        const updateResult = await ctx.db.query(`UPDATE users SET ${values} WHERE id = ? LIMIT 1;`, [ctx.req.token.id]);

        if (updateResult.affectedRows != 1)
            return null;

        const user = await ctx.db.query("SELECT * FROM users WHERE id = ? LIMIT 1;", [ctx.req.token.id]);

        if (user.length != 1)
            return null;

        const avatars = await Promise.all((JSON.parse(user[0].avatars) ?? []).map(avatar => files.file({id: avatar}, ctx)));

        return {
            ...user[0],
            avatars
        };
    },
    setUserAvatars: async (args, ctx) => {
        if (ctx.req.token == null)
            return false;

        const avatars = JSON.stringify(args.avatars);
        const results = await ctx.db.query("UPDATE users SET avatars = ? WHERE id = ?;", [avatars, ctx.req.token.id]);

        if (results.affectedRows != 1)
            return false;

        return true;
    },
    unsetUserAvatars: async (args, ctx) => {
        if (ctx.req.token == null)
            return false;
        
        const results = await ctx.db.query('UPDATE users SET avatars = ? WHERE id = ?;', [null, ctx.req.token.id]);

        if (results.affectedRows != 1)
            return false;

        return true;
    }
};