const url = require("url");
const {userFilePathToUrl} = require("../utils");
const config = require("../config");
const path = require("path");

module.exports = {
    file: async (args, ctx) => {
        if (args.id == null)
            return null;

        const result = await ctx.db.query("SELECT * FROM files WHERE id = ? LIMIT 1;", [args.id]);

        if (result.length != 1)
            return null;

        return {
            id: result[0].id,
            url: url.resolve(ctx.req.headers.origin, userFilePathToUrl(path.join(config.userFilesDir,result[0].name)))
        };
    },
};