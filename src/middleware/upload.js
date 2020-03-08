const multer = require('multer');
const upload = multer();
const db = require('../db');

const fileFieldname = 'code-file';

function uploadRouter(req, res, next) {
    if (req.params.sampleId != null)
        return handleUpdate(req, res, next);

    return handleUpload(req, res, next);
}

function handleUpdate(req, res, next) {
    db.query('UPDATE code_samples SET name = ?, code = ?, edited_time = ? WHERE id = ?', 
        [req.body['code-name'], req.file.buffer.toString(), new Date(), req.params.sampleId], (error, results, fields) => {
        if (error)
            return next(error);

        res.end();
    });
}

function handleUpload(req, res, next) {
    db.query('INSERT INTO code_samples SET name = ?, author_id = ?, code = ?', 
            [req.body['code-name'], 1, req.file.buffer.toString('utf-8')], (error, results, fields) => {
        if (error)
            return next(error);

        res.status(200).json({
            codeSampleId: results.insertId
        });
    });
}


module.exports = [
    upload.single(fileFieldname),
    uploadRouter
];