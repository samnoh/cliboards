const renderImageTag = ({ type, value }) => {
    switch (type) {
        case 'gif':
        case 'image':
            return `<img src="${value}">`;
        case 'mp4':
            return `<video autoplay loop muted><source src=${value} type="video/mp4"></video>`;
    }
};

module.exports = ({ communityTitle, title, images }) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>(${images.length}) ${communityTitle} - cliboards</title>
    <style>
        body { background: #2B292D; padding-bottom: 60px; padding: 0; margin: 0 0 60px; flex; align-items: center; justify-content: center; flex-direction: column; width: 70%; margin: 0 auto; }
        h1 { color: #F1F1F0; padding: 0; margin: 30px 0; }
        video, img { display: block; max-width: 100%; width: 100%; }
        .image-box { display: flex; flex-direction: column; margin: 0 auto 40px; }
        .name { font-family: "Courier New", Courier, monospace; background: #F1F1F0; display: inline-block; align-self: flex-end; padding: 5px 2px; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; user-select: none; }
    </style>
</head>

<body>
    <h1>${title}</h1>
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
