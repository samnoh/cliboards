const fs = require('fs');
const path = require('path');

const { configstore } = require('./configstore');
const defaultColors = require('../cli/theme');

const customThemeFilePath = path.resolve(__dirname, '..', 'cli', 'theme', 'customTheme.txt');

const resetCustomTheme = () => {
    try {
        fs.unlinkSync(customThemeFilePath);
        return true;
    } catch (e) {
        return false;
    }
};

const getTheme = () => {
    try {
        const configstoreKey = 'theme';
        const exists = fs.existsSync(customThemeFilePath);

        let customColors = {};

        if (exists) {
            customColors = JSON.parse(fs.readFileSync(customThemeFilePath));
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
            fs.writeFileSync(customThemeFilePath, JSON.stringify(customColors, null, '\t'));
        }

        configstore.set(configstoreKey, customColors);

        return [customColors, false];
    } catch (e) {
        return [defaultColors, true];
    }
};

module.exports = {
    getTheme,
    resetCustomTheme,
    customThemeFilePath,
};
