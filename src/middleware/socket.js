module.exports = (req, res, next) => {
    if (req.cookies == null)
        throw new Error('please parse cookies into req.cookies before using socket middleware');

    const socketId = req.cookies['socket-id'];

    req.socketId = socketId;

    next();
};