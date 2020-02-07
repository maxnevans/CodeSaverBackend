function parseDateTime(dateToConvert) {
    const dt = new Date(dateToConvert);
    const date = `${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}`;
    const time = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;

    return {
        date, time
    };
}

module.exports = {
    parseDateTime
};