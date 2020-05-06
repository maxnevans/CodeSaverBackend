const auth = require('./auth');
const code = require('./code');
const user = require('./user');

module.exports = {
    ...code,
    ...auth,
    ...user,
};