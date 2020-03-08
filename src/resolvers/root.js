const auth = require('./auth');
const code = require('./code');

module.exports = {
    ...code,
    ...auth
};