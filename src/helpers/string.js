const getYoutubeVideoId = url => {
    return url.match(
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
    )[5];
};

module.exports = {
    getYoutubeVideoId,
};
