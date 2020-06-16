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

module.exports = ({
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
    <link rel="stylesheet" href="../src/static/css/style.css" />
</head>
<body>
    <h1><a href="${link}" target="_blank">${title} (${
    comments.length
}) - ${author}</a></h1>
    ${images
        .map(
            ({ type, value, name }) =>
                `<div class="image-box">${renderImageTag({
                    type,
                    value,
                })}<div class="name">${name}</div></div>`,
        )
        .join('\n')}
</body>
</html>`;
