const user = require("./user");

const FilterFields = {
    ID: "ID",
    NAME: "NAME",
    CODE_LENGTH: "CODE_LENGTH",
    EDITED_TIME: "EDITED_TIME",
    CREATED_TIME: "CREATED_TIME",
    AUTHOR: "AUTHOR",
    IS_READ_PRIVATE: "IS_READ_PRIVATE",
    IS_WRITE_PRIVATE: "IS_WRITE_PRIVATE",
};

const SortFields = {
    ID: "ID",
    NAME: "NAME",
    CODE_LENGTH: "CODE_LENGTH",
    EDITED_TIME: "EDITED_TIME",
    CREATED_TIME: "CREATED_TIME",
    AUTHOR: "AUTHOR",
    IS_READ_PRIVATE: "IS_READ_PRIVATE",
    IS_WRITE_PRIVATE: "IS_WRITE_PRIVATE",
};

const SortType = {
    ASC: "ASC",
    DESC: "DESC",
};

const HistoryFrameType = {
    EDIT: "EDIT",
    CHMOD: "CHMOD",
    CREATE: "CREATE",
    DELETE: "DELETE",
};

const filterFieldToDatabaseFields = (ff) => {
    switch (ff) {
        case FilterFields.ID: return "id";
        case FilterFields.NAME: return "name";
        case FilterFields.CODE_LENGTH: return "LENGTH(code)";
        case FilterFields.EDITED_TIME: return "editedTime";
        case FilterFields.CREATED_TIME: return "createdTime";
        case FilterFields.AUTHOR: return "authorId";
        case FilterFields.IS_READ_PRIVATE: return "isReadPrivate";
        case FilterFields.IS_WRITE_PRIVATE: return "isWritePrivate";
    }

    throw new Error("Undefined GraphQL enum CodeSampleFilterFields to database fields conversion!");
};

const sortFieldToDatabaseFields = (sf) => {
    switch (sf) {
        case SortFields.ID: return "id";
        case SortFields.NAME: return "name";
        case SortFields.CODE_LENGTH: return "LENGTH(code)";
        case SortFields.EDITED_TIME: return "editedTime";
        case SortFields.CREATED_TIME: return "createdTime";
        case SortFields.AUTHOR: return "authorId";
        case SortFields.IS_READ_PRIVATE: return "isReadPrivate";
        case SortFields.IS_WRITE_PRIVATE: return "isWritePrivate";
    }

    throw new Error("Undefined GraphQL enum CodeSampleSortFields to database fields conversion!");
};

const historyFrameTypeToDatabaseType = (ft) => {
    switch (ft) {
        case HistoryFrameType.EDIT: return 0;
        case HistoryFrameType.DELETE: return 1;
        case HistoryFrameType.CREATE: return 2;
        case HistoryFrameType.CHMOD: return 3;
    }

    throw new Error("Undefined GraphQL enum CodeSampleHistoryFrameType to database fields conversion!");
};

const databaseTypeToHisttoryFrameType = (dt) => {
    switch (dt) {
        case 0: return HistoryFrameType.EDIT;
        case 1: return HistoryFrameType.DELETE;
        case 2: return HistoryFrameType.CREATE;
        case 3: return HistoryFrameType.CHMOD;
    }

    throw new Error("Undefined database fields to GraphQL enum CodeSampleHistoryFrameType conversion!");
};

const insertHistoryFrame = async (ctx, userId, codeId,  frameType) => {
    const type = historyFrameTypeToDatabaseType(frameType);
    const historyResult = await ctx.db.query("INSERT INTO codeSamplesHistory SET userId = ?, codeSampleId = ?, type = ?;", 
        [userId, codeId, type]);

    if (historyResult.insertId == null)
        throw new Error("Failed to insert history frame after successful update!");
};

async function code (args, ctx) {
    if (ctx.req.token == null)
        return ctx.res.status(401);

    const code = (await ctx.db.query("SELECT *, codeSamples.id AS id FROM `codeSamples` INNER JOIN codeSampleMods " +
        "ON codeSamples.id = codeSampleMods.codeSampleId WHERE codeSamples.id = ? AND isDeleted = false " +
        "AND (isReadPrivate = false OR authorId = ?) LIMIT 1;", [args.id, ctx.req.token.id]))?.[0];

    if (code == null)
        return null;

    const codeSampleData = await Promise.all([
        user.user({id: code.authorId}, ctx),
        codeMods({id: code.id}, ctx)
    ]);

    return {
        ...code, 
        createdTime: new Date(code["createdTime"]).toISOString(), 
        editedTime: code["editedTime"] ? new Date(code["editedTime"]).toISOString() : null,
        author: codeSampleData[0],
        mods: codeSampleData[1]
    };
}

async function codeList (args, ctx) {
    if (ctx.req.token == null)
        return ctx.res.status(401);

    const filterField = args.data?.filter != null ? filterFieldToDatabaseFields(args.data.filter) : null;
    const filterComposed = filterField != null && filterValue != null ? `${filterField} = ${filterValue}` : null;
    const sortField = args.data?.sort != null ? sortFieldToDatabaseFields(args.data.sort) : "createdTime";
    const sortType = args.data?.sortType ?? "DESC";
    const limit = args.data?.first ?? 100;
    const offset = args.data?.skip ?? 0;

    const query = `SELECT *, codeSamples.id AS id FROM codeSamples INNER JOIN codeSampleMods ON codeSamples.id = codeSampleMods.codeSampleId ` +
        `WHERE isDeleted = false AND ((isReadPrivate = false) OR authorId = ?) ` +
        (filterComposed != null ? `AND (${filterComposed})` : "") +
        `ORDER BY ${sortField} ${sortType} LIMIT ${limit} OFFSET ${offset};`;

    const codeList = await ctx.db.query(query, ctx.req.token.id);

    const codeSamplesData = await Promise.all(codeList.map(code => 
        Promise.all([
            user.user({id: code.authorId}, ctx),
            codeMods({id: code.id}, ctx)
        ])
    ));

    const codeListRet = codeList.map((code, index) => {
        return {
            ...code,
            createdTime: new Date(code['createdTime']).toISOString(),
            editedTime: code["editedTime"] ? new Date(code["editedTime"]).toString() : null,
            author: codeSamplesData[index][0],
            mods : codeSamplesData[index][1],
        };
    });
    
    return codeListRet;
}

async function createCode(args, ctx) {
    if (ctx.req.token == null)
        return ctx.res.status(401);

    const name = args.name;
    const codeData = args.code ?? "";
    const authorId = ctx.req.token.id;

    const codeId = (await ctx.db.query("INSERT INTO codeSamples SET name = ?, code = ?, authorId = ?;", 
        [name, codeData, authorId]))?.insertId;

    if (codeId == null)
        return null;

    const code = {
        id: codeId,
        name: args.name,
        code: args.code,
        createdTime: new Date().toISOString(),
        editedTime: null,
        mods : await codeMods({id: codeId}, ctx),
        author: await user.user({id: ctx.req.token.id}, ctx)
    };

    await insertHistoryFrame(ctx, ctx.req.token.id, codeId, HistoryFrameType.CREATE);

    return code;
}

async function editCode(args, ctx) {
    if (ctx.req.token == null)
        return ctx.res.status(401);

    const code = (await ctx.db.query("SELECT *, codeSamples.id AS id FROM `codeSamples` INNER JOIN codeSampleMods " +
        "ON codeSamples.id = codeSampleMods.codeSampleId  WHERE codeSamples.id = ? AND isDeleted = false AND " +
        "(isWritePrivate = false AND isReadPrivate = false OR authorId = ?) LIMIT 1", 
        [args.id, ctx.req.token.id]))?.[0];

    if (code == null)
        return null;

    const updateValues = {};

    args.name != null && (updateValues.name = args.name);
    args.code != null && (updateValues.code = args.code);
    
    const codeId = args.id;

    if (Object.getOwnPropertyNames(updateValues).length != 0) {
        args.editedTime = new Date();
        const values = Object.getOwnPropertyNames(updateValues).map(key => `${key} = '${updateValues[key]}'`).join(", ");

        const success = (await ctx.db.query(`UPDATE codeSamples SET ${values} ` +
            "WHERE id = ? AND isDeleted = false LIMIT 1;", 
            [codeId]))?.affectedRows == 1;

        if (!success)
            return null;
    }

    if (args.mods != null) {
        args.mods = await setCodeMods({id: codeId, mods: args.mods}, ctx);
    }

    await insertHistoryFrame(ctx, ctx.req.token.id, codeId, HistoryFrameType.EDIT);

    const codeRet = {
        id: code.id,
        name: args.name ?? code.name,
        code: args.code ?? code.code,
        createdTime: new Date(code.createdTime).toISOString(),
        editedTime: updateValues.editedTime ? updateValues.editedTime.toISOString() : (code.editedTime ? new Date(code.editedTime).toISOString() : null),
        mods : args.mods,
        author: await user.user({id: ctx.req.token.id}, ctx)
    };

    return codeRet;
}

async function deleteCode(args, ctx) {
    if (ctx.req.token == null)
        return ctx.res.status(401);

    const succces = (await ctx.db.query("UPDATE codeSamples SET isDeleted = true WHERE codeSamples.id = ? AND isDeleted = false " +
        "AND authorId = ? LIMIT 1;", [args.id, ctx.req.token.id]))?.affectedRows == 1;

    if (!succces)
        return false;

    await insertHistoryFrame(ctx, ctx.req.token.id, args.id, HistoryFrameType.DELETE);

    return true;
}

async function codeHistory(args, ctx) {
    if (ctx.req.token == null)
        return ctx.res.status(401);

    const code = (await ctx.db.query("SELECT *, codeSamples.id AS id FROM `codeSamples` INNER JOIN codeSampleMods " +
        "ON codeSamples.id = codeSampleMods.codeSampleId   WHERE codeSamples.id = ? AND isDeleted = false AND " +
        "(isReadPrivate = false OR authorId = ?)", [args.id, ctx.req.token.id]))?.[0];

    if (code == null)
        return null;

    const limit = args.first ?? 10;
    const offset = args.skip ?? 0;
    const sortField = "time";
    const sortType = args.sortType ?? "DESC";

    const historyFrames = await ctx.db.query(`SELECT * FROM codeSamplesHistory WHERE codeSampleId = ? ` +
        `ORDER BY ${sortField} ${sortType} LIMIT ${limit} OFFSET ${offset};`, 
        [args.id]);

        
    const users = await Promise.all(historyFrames.map(frame => user.user({id: frame.userId}, ctx)));

    const retFrames = historyFrames.map((frame, index) => {
        return {
            time: new Date(frame.time).toISOString(),
            user: users[index],
            type: databaseTypeToHisttoryFrameType(frame.type),
        };
    });

    return retFrames;
}

async function codeMods(args, ctx) {
    if (ctx.req.token == null)
        return ctx.res.status(401);

    const userId = ctx.req.token.id;
    const code = (await ctx.db.query("SELECT * FROM codeSamples WHERE id = ? LIMIT 1;", [args.id]))?.[0];

    if (code == null)
        return null;

    const mods = (await ctx.db.query("SELECT * FROM codeSampleMods WHERE codeSampleId = ? LIMIT 1;", [args.id]))?.[0];

    if (mods == null)
        return null;

    if (mods.isReadPrivate && code.authorId != userId)
        return null;

    return mods;
}

async function setCodeMods(args, ctx) {
    if (ctx.req.token == null)
        return ctx.res.status(401);

    const userId = ctx.req.token.id;
    const code = (await ctx.db.query("SELECT * FROM codeSamples WHERE id = ? LIMIT 1;", [args.id]))?.[0];

    if (code.authorId != userId)
        return null;

    const updateValues = {};
    args.mods.isReadPrivate != null && (updateValues.isReadPrivate = args.mods.isReadPrivate);
    args.mods.isWritePrivate != null && (updateValues.isWritePrivate = args.mods.isWritePrivate);

    const values = Object.getOwnPropertyNames(updateValues).map(key => `${key} = ${updateValues[key]}`).join(", ");
    if (values.length != 0) {
        const successUpdate = (await ctx.db.query(`UPDATE codeSampleMods SET ${values} WHERE codeSampleId = ? LIMIT 1;`, [args.id]))?.affectedRows == 1;

        if (!successUpdate)
            return null;
    }

    await insertHistoryFrame(ctx, userId, code.id, HistoryFrameType.CHMOD);

    const codeMods = (await ctx.db.query("SELECT * FROM codeSampleMods WHERE codeSampleId = ? LIMIT 1;", [args.id]))?.[0];

    return codeMods;
}

module.exports = {
    code,
    codeList,
    createCode,
    editCode,
    deleteCode,
    codeHistory,
    codeMods,
    setCodeMods
};
