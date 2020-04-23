const puppeteer = require('puppeteer');

const { urls } = require('./lib/constant');

const cralwer = async () => {
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36'
    );
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
            request.abort();
        } else {
            request.continue();
        }
    });

    await page.goto(urls.park + '0');

    const result = await page.evaluate(() => {
        const lists = document.querySelectorAll('.list_content .list_item');

        return Array.from(lists).map((list) => {
            const title = list.querySelector('.list_subject');
            const author = list.querySelector('.list_author .nickname');
            const hit = list.querySelector('.list_hit');
            const time = list.querySelector('.list_time');

            return {
                title: title.textContent.trim(),
                author:
                    author.textContent.trim() || author.querySelector('img').getAttribute('alt'),
                hit: hit.textContent.trim(),
                time: time.textContent.trim().split('\n')[0],
                link: 'https://clien.net' + title.getAttribute('href'),
            };
        });
    });
    console.log(result);

    await page.close();
    await browser.close();
};

cralwer();
