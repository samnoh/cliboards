module.exports = ({ communityTitle, title, images }) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>(${images.length}) ${communityTitle} - cliboards</title>
    <style>
        body { color: gray; background: black; padding: 30px 0 30px; display: flex; align-items: center; justify-content: center; flex-direction: column; }
        img { display: block; max-width: 80vw; margin: 30px 0; }
    </style>
</head>

<body>
    <h1>
        ${title}
    </h1>
        ${images.map(image => '<img src="' + image + '">').join('\n')}
</body>

</html>`;
