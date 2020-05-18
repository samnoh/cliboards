const fs = require('fs');

const defaultColors = JSON.parse(fs.readFileSync(__dirname + '/../community/colors.default.json'));

let customColors;

module.exports = (title) => {
    try {
        if (!customColors) {
            customColors = JSON.parse(fs.readFileSync(__dirname + '/../../colors.json'));
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
