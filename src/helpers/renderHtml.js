const { homepage } = require('../../package.json');

const staticPath = '../src/static/';

const renderImageTag = ({ type, value }) => {
    switch (type) {
        case 'gif':
        case 'image':
            return `<img src="${value}">`;
        case 'mp4':
            return `<video autoplay loop muted><source src=${value} type="video/mp4"></video>`;
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
}) => `
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
        <h1><a href="${link}" target="_blank">${title} (${
    comments.length
}) <span class="author">${author}</span></a></h1>
        ${images
            .map(
                ({ type, value, name }, index) =>
                    `<div class="image-box" data-image="${index}">${renderImageTag(
                        {
                            type,
                            value,
                        },
                    )}<div class="name">${name}</div></div>`,
            )
            .join('\n')}
        <script src="${staticPath}js/index.js"></script>
    </div>
</body>
</html>`;

module.exports = renderHtml;
