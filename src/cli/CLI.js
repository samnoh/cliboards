const blessed = require('blessed');

// abstract
class CLI {
    constructor(title) {
        if (this.constructor === CLI) {
            throw new TypeError('Abstract class "Crawler" cannot be instantiated directly');
        }

        if (this.start === undefined || typeof this.start !== 'function') {
            throw new TypeError('Child should extend the method "start"');
        }

        this.screen = blessed.screen({
            title,
            dockBorders: true,
            smartCSR: true,
            fullUnicode: true,
            error: true,
            debug: true,
        });
        const box = blessed.box({
            parent: this.screen,
            width: '100%',
            height: '100%',
        });
        this.titleBox = blessed.box({
            parent: box,
            tags: true,
            top: 0,
            width: '100%',
            height: 1,
            padding: {
                left: 2,
                right: 2,
            },
            style: {
                bg: '#243B4D',
            },
        });
        this.bodyBox = blessed.box({
            parent: box,
            top: 1,
            bottom: 1,
            width: '100%',
            scrollbar: {
                ch: ' ',
                inverse: true,
            },
        });
        this.footerBox = blessed.box({
            parent: box,
            tags: true,
            width: '100%',
            top: '100%-1',
            height: 1,
            padding: {
                left: 2,
            },
            style: {
                bg: '#243B4D',
            },
        });

        this.screen.key('C-c', () => {
            this.terminate();
        });

        this.screen.key(['escape', 'q'], (ch, key) => {
            !this.footerBox.focused && this.moveToWidget('prev', null);
        });

        this.footerBox.on('focus', () => {
            this.footerBox.setContent(`${this.footerBox.getContent()} {|}{yellow-fg}Loading...{/}`);
            this.screen.render();
        });

        this.currentWidgetIndex = 0;
    }

    // direction: 'prev' || 'next'
    moveToWidget(direction, callback, key) {
        const nextWidgetIndex =
            direction === 'next' ? this.currentWidgetIndex + 1 : this.currentWidgetIndex - 1;

        const currWidget = this.widgets[this.currentWidgetIndex];
        const nextWidget = this.widgets[nextWidgetIndex];

        this.currentWidgetIndex = nextWidgetIndex;

        if (nextWidget) {
            direction === 'prev' && currWidget.select && currWidget.select(0);
            currWidget.detach();
            this.bodyBox.append(nextWidget);

            callback && callback(nextWidget);

            nextWidget.focus();
        } else {
            this.terminate();
        }
    }

    async terminate() {
        this.terminateCallback && (await this.terminateCallback());
        this.screen.destroy();
        blessed.program().clear();
        return process.exit(0);
    }

    setTitleFooterContent(leftTitleText = '', rightTitleText = '', footerText = '') {
        this.titleBox.setContent(`${leftTitleText} {|}{gray-fg}${rightTitleText}{/}`);
        this.footerBox.setContent(`{gray-fg}${footerText}{/}`);
        this.screen.render();
    }
}

module.exports = CLI;
