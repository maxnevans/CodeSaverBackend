const path = require("path");
const config = require("./config");

module.exports = {};

module.exports.convertDateTime = (dateToConvert) => {
    const dt = new Date(dateToConvert);
    const date = `${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}`;
    const time = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;

    return {
        date, time
    };
};

module.exports.checkVersion = (required, current) => {
    for (let i = 0; i < required.length; i++)
        if (current[i] < required[i])
            return false;

    return true;
};

module.exports.userFilePathToUrl = (filePath) => {
    const filename = path.basename(filePath);
    return path.join(config.userFilesUrl, filename);
};