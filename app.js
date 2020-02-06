const { App } = require('./src/server/app');

console.log('Server starting up from boostrapper...');

const app = new App();

app.start();