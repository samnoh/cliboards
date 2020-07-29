const getYoutubeVideoId = url => {
    if (typeof url !== 'string') return null;

    return url.match(
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
    )[5];
};

const hasSpoilerWord = str => {
    if (typeof str !== 'string') return false;

    const spoilerWords = ['스포', '슾호', '누설', 'spoiler'];
    const nonSpoilerWords = ['노스포', '스포츠', '노슾호', '스포무', '스포티'];
    const lowerStr = str.toLowerCase();

    const hasNonSpoilerContent = nonSpoilerWords.filter(w =>
        lowerStr.includes(w),
    ).length;

    if (hasNonSpoilerContent) return false;

    return !!spoilerWords.filter(w => lowerStr.includes(w)).length;
};

// usage: pluralize(2, 'cherr', 'y,ies') -> cherries
const pluralize = (number, text, option) => {
    const [single, plural] = option ? option.split(',') : [];
    if (number <= 1) return `${number} ${text}${single ? single : ''}`;
    return `${number} ${text}${plural ? plural : 's'}`;
};

module.exports = {
    hasSpoilerWord,
    getYoutubeVideoId,
    pluralize,
};
