module.exports = {
    code: async (args, ctx) => {
        if (ctx.req.token == null)
            return null;

        const code = await ctx.db.query('SELECT * FROM `code_samples` WHERE id = ?', [args.id]);

        if (code.length != 1)
            return null;

        return {...code[0]};
    },
    codeList: async (args, ctx) => {
        if (ctx.req.token == null)
            return null;

        let codeList = 
            await ctx.db.query(
                'SELECT id, name, created_time, edited_time FROM code_samples WHERE deleted = false ORDER BY created_time DESC');
        
        return codeList;
    },
    
    createCode: async (args, ctx) => {
        if (ctx.req.token == null)
            return null;

        const results = await ctx.db.query('INSERT INTO code_samples SET name = ?, code = ?, author_id = ?;', 
            [args.name, args.code, ctx.req.token.id]);

        return {
            id: results.insertId,
            name: args.name,
            code: args.code,
            createdTime: new Date().toISOString(),
            editedTime: ''
        };
    },
    editCode: async (args, ctx) => {
        if (ctx.req.token == null)
            return false;

        const results = await ctx.db.query('UPDATE code_samples SET name = ?, code = ?, edited_time = ? WHERE id = ? LIMIT 1;', 
            [args.name, args.code, new Date(), args.id]);

        if (results.affectedRows != 1)
            return false;

        return true;
    },
    deleteCode: async (args, ctx) => {
        if (ctx.req.token == null)
            return false;

        const results = await ctx.db.query('UPDATE code_samples SET deleted = true WHERE id = ? LIMIT 1;', [args.id]);

        if (results.affectedRows != 1)
            return false;

        return true;
    }
};