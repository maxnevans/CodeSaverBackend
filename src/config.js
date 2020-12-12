const path = require("path");

module.exports = {
    schemaFileName: path.resolve(__dirname, "schema.gql"),
    userFilesUrl: "/files",
    userFilesDir: "./user",
    staticFilesDir: "../front/dist",
    host: "localhost",
    port: 8080,
    db: {
        host: 'localhost',
        user: 'codesaver',
        password: '123',
        database: 'code_saver'
    }
};