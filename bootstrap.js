const { App } = require('./src/app');

console.log('Server starting up from boostrapper...');

const app = new App();

app.start();