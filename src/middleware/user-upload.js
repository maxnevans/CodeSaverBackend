const multer = require("multer");
const upload = multer({storage: multer.diskStorage({})});
const db = require("../db");
const fs = require("fs");
const path = require("path");
const util = require("util");
const url = require("url");

module.exports = (userFilesDir, publicUserUrl) => {

    const USER_DIR = userFilesDir;
    const USER_URL = publicUserUrl;

    const avatarFileFieldName = "avatar";

    function uploadRouter(req, res, next) {
        handleUpload(req, res, next)
            .catch(next);
    }

    async function handleUpload(req, res, next) {
        const avatar = req.file;
        const newPath = path.resolve(USER_DIR, avatar.filename);
        await util.promisify(fs.copyFile)(avatar.path, newPath);

        const result = await db.query("INSERT INTO `files` SET name = ?;", [avatar.filename]);
        
        if (result.insertId == null) {
            await util.promisify(fs.unlink)(newPath);
            return res.json(null);
        }

        return res.json({
            id: result.insertId,
            url: path.resolve(USER_URL, avatar.filename),
        });
    }

    (async () => {
        if (!await util.promisify(fs.exists)(path.resolve(USER_DIR)))
            await util.promisify(fs.mkdir)(path.resolve(USER_DIR));
    })();

    return [
        upload.single(avatarFileFieldName),
        uploadRouter
    ];
};