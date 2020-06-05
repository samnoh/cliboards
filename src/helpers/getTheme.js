const fs = require('fs');

const configstore = require('./configstore');
const defaultColors = require('../cli/theme');

module.exports = () => {
    try {
        const configstoreKey = 'theme';
        const fileName = __dirname + '/../cli/theme/customTheme.txt';
        const exists = fs.existsSync(fileName);

        let customColors = {};

        if (exists) {
            customColors = JSON.parse(fs.readFileSync(fileName));
        } else {
            if (configstore.has(configstoreKey)) {
                customColors = configstore.get(configstoreKey);
            }
        }

        Object.keys(defaultColors).map((key) => {
            if (!customColors[key]) {
                customColors[key] = defaultColors[key];
            }
        });

        if (!exists) {
            fs.writeFileSync(fileName, JSON.stringify(customColors, null, '\t'));
        }

        configstore.set(configstoreKey, customColors);

        return [customColors, false];
    } catch (e) {
        return [defaultColors, true];
    }
};
