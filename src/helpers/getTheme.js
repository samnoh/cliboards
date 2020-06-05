const fs = require('fs');

const defaultColors = require('../cli/theme');

let customColors;

module.exports = (title) => {
    try {
        console.log(__dirname);
        if (!customColors) {
            customColors = JSON.parse(fs.readFileSync(__dirname + '/../cli/theme/custom.txt'));
        }

        const defaultColorsTitle = defaultColors[title];
        const customColorsTitle = customColors[title];

        if (!customColorsTitle) {
            return defaultColorsTitle;
        }

        Object.keys(defaultColorsTitle).map((key) => {
            const value = customColorsTitle[key];

            if (!value) {
                customColorsTitle[key] = defaultColorsTitle[key];
            }
        });

        return customColorsTitle;
    } catch (e) {
        return defaultColors[title];
    }
};
