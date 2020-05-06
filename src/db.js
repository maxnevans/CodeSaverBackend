const mysql = require('mysql');
const config = require("./config");

const connection = mysql.createConnection(config.db);

const queryFunction = connection.query.bind(connection);
connection.query = (...args) => {
    return new Promise((res, rej) => {
        queryFunction(...args, (error, results, fields) => {
            if (error)
                return rej(error);

            res(results);
        });
    });
};
connection.tweak = (query, where, sort, limit, offset) => {
    function composeWhere(whereArg) {
        return Object.getOwnPropertyNames(whereArg).reduce((acc, name) => {
            if (name.startsWith("_")) {
                return acc.push(composeWhere(whereArg[name]).join(" " + name.substr(1) + " "));
            } else {
                return acc.push(Object.getOwnPropertyNames(whereArg[name]).map(key => `${key} = ${where[name][key]}`));
            }
        }, []);
    }

    const wherePart = where != null ? "WHERE " + composeWhere(where).join(" AND ") : null;
    const sortPart = sort != null ? `ORDER BY ${sort.value} ${sort.type}` : null;
    const limitPart =  limit != null ? `LIMIT ${limit}` : null;
    const offsetPart = offset != null ? `OFFSET ${offset}` : null;

    return query + (wherePart ?? "") + (sortPart ?? "") + (limitPart ?? "") + (offsetPart ?? "");
};

module.exports = connection;