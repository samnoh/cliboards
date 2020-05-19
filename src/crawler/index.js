const Clien = require('./clien');

const getCrawler = (index) => {
    switch (index) {
        case 0:
            return new Clien();
        case 1:
            return new Clien();
        default:
            throw new Error(index);
    }
};

module.exports = { getCrawler };
