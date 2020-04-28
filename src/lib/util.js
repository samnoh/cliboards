const { maxNumbers } = require('./constants');

exports.parseEllipsisText = (text) => {
    const _text = text.trim();
    const maxTitleLength = maxNumbers.title;

    if (_text.length > maxTitleLength + 3) {
        return _text.slice(0, maxTitleLength).trim() + '...';
    }
    return _text;
};
