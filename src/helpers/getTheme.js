const fs = require('fs');

const defaultColors = require('../cli/theme');

let customColors;

module.exports = (title) => {
    try {
        if (!customColors) {
            customColors = JSON.parse(fs.readFileSync(__dirname + '/../cli/theme/customTheme.txt'));
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

        return [customColorsTitle, false];
    } catch (e) {
        return [defaultColors[title], true];
    }
};
