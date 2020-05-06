const multer = require("multer");
const upload = multer();
const db = require("../db");
const fs = require("fs");
const path = require("path");
const util = require("util");
const url = require("url");

module.exports = (publicUserUrl) => {

    async function handleDownload(req, res, next) {
        const urlPath = req.path;
        const filename = path.basename(urlPath);

        const results = await db.query("SELECT * FROM files WHERE name = ? LIMIT 1;", [filename]);

        if (results.length != 1)
            return res.status(404).end();

        // TODO: perform check where user has rights to get this file
        next();
    }

    function downloadRouter(req, res, next) {
        handleDownload(req, res, next)
            .catch(next);
    }

    return [
        downloadRouter
    ];
};