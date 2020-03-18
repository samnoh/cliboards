import puppeteer from 'puppeteer';

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--diable-dev-shm-usage']
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get(target, property) {
                return target[property] || page[property] || browser[property];
            }
        });
    }

    constructor(page) {
        this.page = page;
    }

    getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerText);
    }

    getAllContentsOf(selector) {
        return this.page.$$eval(selector, elements => {
            return elements.map(el => ({
                text: el.innerText.replace(/\d\t\n/g, ''),
                number: el.getAttribute('data-board-sn')
            }));
        });
    }

    PressButtonAmongList(selector, char) {
        return this.page.evaluate(
            (_selector, _char) => {
                const elements = [...document.querySelectorAll(_selector)];
                const targetElement = elements.find(e => e.innerText === _char);
                targetElement && targetElement.click();
            },
            selector,
            char
        );
    }
}

export default CustomPage;
