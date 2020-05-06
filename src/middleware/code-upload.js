const multer = require('multer');
const upload = multer();
const db = require('../db');

module.exports = () => {

    const filesFieldName = "code-files[]";
    const nameFieldName = "code-name";
    
    function uploadRouter(req, res, next) {
        if (req.query.id != null)
            return handleUpdate(req, res, next);
    
        return handleUpload(req, res, next);
    }
    
    function handleUpdate(req, res, next) {
        const codeJoined = req.files.reduce((acc, file) => acc + getFileHeader(file) + file.buffer.toString('utf-8') + "\n\n", "").slice(0, -2);
        const name = JSON.parse(req.body[nameFieldName]);
        const editedTime = new Date();
        db.query('UPDATE codeSamples SET name = ?, code = ?, editedTime = ? WHERE id = ?', 
            [name, codeJoined, editedTime, req.query.id], (error, results, fields) => {
            if (error)
                return next(error);
    
                getCodeSampleFull(req.query.id)
                .then(code => res.json(code))
                .catch(error => next(error));
        });
    }
    
    function handleUpload(req, res, next) {
        const code = req.files.reduce((acc, file) => acc + getFileHeader(file) + file.buffer.toString('utf-8') + "\n\n", "").slice(0, -2);
        const name = JSON.parse(req.body[nameFieldName]);
        const authorId = 1;
        db.query('INSERT INTO codeSamples SET name = ?, authorId = ?, code = ?', 
            [name, authorId, code], (error, results, fields) => {
            if (error)
                return next(error);
    
                getCodeSampleFull(results.insertId)
                .then(code => res.json(code))
                .catch(error => next(error));
        });
    }

    async function getCodeSampleFull(id) {
        const code =  await getCodeSample(id);
        if (code == null)
            return null;


        code.mods = await getMods(code.id);
        code.author = await getUser(code.authorId);

        if (code.author == null) {
            return code;
        }

        const avatarIds = JSON.parse(code.author.avatars);

        if (avatarIds == null) {
            code.author.avatars = null;
            return code;
        }

        const avatars = await getFiles(avatarIds);
        code.author.avatars = avatars;
        
        return code;
    }
    
    
    async function getCodeSample(id) {
        return new Promise((res, rej) => db.query("SELECT * FROM codeSamples WHERE id=?;", [id], (error, results) => {
            if (error) return rej(error);
            return res(results[0]);
        }));
    }

    async function getUser(id) {
        return new Promise((res, rej) => db.query("SELECT * FROM users WHERE id=?;", [id], (error, results) => {
            if (error) return rej(error);
            return res(results[0]);
        }));
    }

    async function getMods(id) {
        return new Promise((res, rej) => db.query("SELECT * FROM codeSampleMods WHERE codeSampleId=?;", [id], (error, results) => {
            if (error) return rej(error);
            return res(results[0]);
        }));
    }

    async function getFiles(ids) {
        const whereIds = ids.map(id => `id = ${id}`).join(" OR ");

        return new Promise((res, rej) => db.query(`SELECT * FROM files WHERE ${whereIds};`, (error, results) => {
            if (error) return rej(error);
            return res(results);
        }));
    }
    
    
    function getFileHeader(file) {
        const padding = 10;
        const fileName = `File ${file.originalname}`;
        const firstLine = "=".repeat(padding) + fileName + "=".repeat(padding);
        return firstLine + "\n" + "=".repeat(firstLine.length) + "\n";
    }

    return [
        upload.array(filesFieldName),
        uploadRouter
    ];
};