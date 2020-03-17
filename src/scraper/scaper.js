import puppeteer from 'puppeteer';

class Scaper {
    browser = null;
    page = null;

    constructor(url) {
        this.start(url);
    }

    async start(url) {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--diable-dev-shm-usage']
        });
        this.page = await this.browser.newPage();
        await this.page.goto(url);
    }
}

export default Scaper;
