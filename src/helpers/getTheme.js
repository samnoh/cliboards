const fs = require('fs');

const defaultColors = require('../cli/theme');

module.exports = (title) => {
    try {
        const fileName = __dirname + '/../cli/theme/customTheme.txt';

        let customColors;

        fs.exists(fileName, (exists) => {
            if (exists) {
                customColors = JSON.parse(fs.readFileSync(fileName));
            } else {
                fs.writeFileSync(
                    fileName,
                    JSON.stringify(defaultColors, null, '\t'),
                    { flag: 'wx' },
                    () => {
                        customColors = JSON.parse(fs.readFileSync(fileName));
                    }
                );
            }
        });

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
