const { homepage } = require('../../package.json');

const staticPath = '../src/static/';

let imageIndex = 0;

const renderImageTag = ({ type, value }) => {
    switch (type) {
        case 'gif':
        case 'image':
            return `<img src="${value}">`;
        case 'mp4':
            return `<video autoplay loop muted><source src="${value}" type="video/mp4"></video>`;
        case 'youtube':
            const src = value.split('?')[0] + '?enablejsapi=1';
            return `<iframe class="youtube-video" src="${src}" frameborder="0" allowfullscreen></iframe>`;
        default:
            return '';
    }
};

const renderHtml = ({
    communityTitle,
    title,
    author,
    link,
    comments,
    images,
}) => {
    imageIndex = 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${communityTitle} - ${title}</title>
    <link rel="stylesheet" href="${staticPath}css/style.css" />
</head>
<body>
    <a href=${homepage} aria-label="View source on GitHub" target="_blank">
        <div class="github"></div>
    </a>
    <div id="content">
        <h1>
            <a href="${link}" target="_blank">${title} (${comments.length})</a>
            <span class="author">${author}</span>
        </h1>
        ${images
            .map(item => {
                const name = `<div class="name">${item.name}</div>`;

                if (item.type !== 'youtube')
                    return `<div class="image-box" data-image-index=${imageIndex++}>${renderImageTag(
                        item,
                    )}${name}</div>`;
                return `<div class="iframe-box">${renderImageTag(
                    item,
                )}${name}</div>`;
            })
            .join('\n')}
    </div>
    <script src="${staticPath}js/index.js"></script>
</body>
</html>`;
};

module.exports = renderHtml;
