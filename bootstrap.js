const { App } = require('./src/app');
const { checkVersion } = require('./src/utils');


/* Format: [major, minor, small] verion*/
const versionRequirements = [
    [14], // Optional chaining
    [12], // Private fields
];

const runningVersion = process.version.substr(1).split('.')
versionRequirements.forEach(vr => {
    if (!checkVersion(vr, runningVersion)){
        console.error('Required version of NodeJS higher or equal to v14.x.x!')
    process.exit(1)
    }
});

console.log('Server starting up from boostrapper...');

const app = new App();

app.start();