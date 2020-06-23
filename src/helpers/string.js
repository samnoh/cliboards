const getYoutubeVideoId = url => {
    if (typeof url !== 'string') return null;

    return url.match(
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
    )[5];
};

const hasSpoilerWord = str => {
    if (typeof str !== 'string') return false;

    const spoilerWords = ['스포', '슾호', 'spoiler'];
    const nonSpoilerWords = ['노스포', '노슾호', '스포무', '스포티'];
    const lowerStr = str.toLowerCase();

    const hasNonSpoilerContent = nonSpoilerWords.filter(w =>
        lowerStr.includes(w),
    ).length;

    if (hasNonSpoilerContent) return false;

    return !!spoilerWords.filter(w => lowerStr.includes(w)).length;
};

module.exports = {
    hasSpoilerWord,
    getYoutubeVideoId,
};
