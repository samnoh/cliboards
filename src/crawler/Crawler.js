const puppeteer = require('puppeteer');

class Crawler {
    constructor() {
        if (this.constructor === Crawler) {
            throw new TypeError('Abstract class "Crawler" cannot be instantiated directly');
        }
    }

    async start() {
        if (this.browser) return;

        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--diable-dev-shm-usage'],
            });

            this.page = await this.browser.newPage();
            await this.page.setUserAgent(
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36'
            );
            await this.page.setRequestInterception(true);

            this.page.on('request', (request) => {
                if (
                    ['image', 'stylesheet', 'media', 'font', 'imageset', 'script'].indexOf(
                        request.resourceType()
                    ) !== -1 ||
                    request.url().startsWith('https://www.youtube.com')
                ) {
                    request.abort();
                } else {
                    request.continue();
                }
            });
        } catch (e) {
            this.browser && (await this.browser.close());
            throw new Error(e);
        }
    }

    async close() {
        try {
            await this.page.close();
            await this.browser.close();
        } catch (e) {
            throw new Error(e);
        }
    }
}

module.exports = Crawler;
