const puppeteer = require('puppeteer');

class Crawler {
    constructor(ignoreRequests, baseUrl) {
        if (this.constructor === Crawler) {
            throw new TypeError('Abstract class "Crawler" cannot be instantiated directly');
        }
        this.ignoreRequests = ignoreRequests;
        this.baseUrl = baseUrl;
    }

    async start() {
        if (this.browser) return;

        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--diable-dev-shm-usage'],
            });

            this.page = (await this.browser.pages())[0];

            // page settings
            this.page.setDefaultNavigationTimeout(10000);
            await this.changeUserAgent();
            await this.page.setJavaScriptEnabled(false);
            await this.page.setRequestInterception(true);

            this.page.on('request', (request) => {
                if (
                    this.ignoreRequests.indexOf(request.resourceType()) !== -1 ||
                    request.url().startsWith('https://www.youtube.com') ||
                    !request.url().startsWith(this.baseUrl)
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

    async changeUserAgent(type) {
        switch (type) {
            case 'mobile':
                await this.page.setUserAgent(
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
                );
                break;
            default:
                await this.page.setUserAgent(
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
                );
        }
    }

    get currentBaseUrl() {
        return this.page.url().split('?')[0];
    }
}

module.exports = Crawler;
