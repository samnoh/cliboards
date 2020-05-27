const puppeteer = require('puppeteer');

class Crawler {
    constructor(ignoreRequests) {
        if (this.constructor === Crawler) {
            throw new TypeError('Abstract class "Crawler" cannot be instantiated directly');
        }
        this.ignoreRequests = ignoreRequests;
    }

    async start() {
        if (this.browser) return;

        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--diable-dev-shm-usage'],
            });

            this.page = await this.browser.newPage();
            this.page.setDefaultNavigationTimeout(10000);

            await this.page.setUserAgent(
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
            );

            await this.page.setRequestInterception(true);

            this.page.on('request', (request) => {
                if (
                    this.ignoreRequests.indexOf(request.resourceType()) !== -1 ||
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
