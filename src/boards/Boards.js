const blessed = require('blessed');

const { getTheme } = require('../helpers');

const screen = blessed.screen({
    title,
    dockBorders: true,
    fastCSR: true,
    fullUnicode: true,
    debug: true,
});

class Boards {
    constructor(title) {
        this.colors = getTheme(title);

        this.screen = screen;

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
                bg: this.colors.top_bg,
                fg: this.colors.top_left_color,
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
                fg: this.colors.bottom_left_color,
            },
        });

        this.screen.key('C-c', () => {
            this.terminate();
        });

        this.screen.key(['escape', 'q'], (ch, key) => {
            !this.footerBox.focused && this.moveToWidget('prev');
        });

        this.footerBox.on('focus', () => {
            this.footerBox.setContent(
                `${this.footerBox.getContent()} {|}{${
                    this.colors.bottom_right_color
                }-fg}Loading...{/}`
            );
            this.footerBox.style = { ...this.footerBox.style, bg: this.colors.bottom_bg_loading };
            this.screen.render();
        });

        this.footerBox.on('blur', () => {
            this.footerBox.style = { ...this.footerBox.style, bg: this.colors.bottom_bg };
        });

        this.currentWidgetIndex = 0;
    }

    // direction: 'prev' || 'next'
    moveToWidget(direction, callback) {
        try {
            const nextWidgetIndex =
                direction === 'next' ? this.currentWidgetIndex + 1 : this.currentWidgetIndex - 1;

            const nextWidget = this.widgets[nextWidgetIndex];
            const currWidget = this.widgets[this.currentWidgetIndex];

            if (!currWidget) {
                throw new Error('The next widget index is outside the bounds of the widgets array');
            }

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
        } catch (e) {
            this.terminate(1, e);
        }
    }

    async terminate(exitCode = 0, message) {
        this.terminateCallback && (await this.terminateCallback());
        !exitCode && blessed.program().clear();
        message && console[exitCode ? 'error' : 'log'](message);
        return process.exit(exitCode);
    }

    setTitleFooterContent(leftTitleText = '', rightTitleText = '', footerText = '') {
        this.titleBox.setContent(
            `${leftTitleText} {|}{${this.colors.top_right_color}-fg}${rightTitleText}{/}`
        );
        this.footerBox.setContent(footerText);
        this.screen.render();
    }
}

module.exports = Boards;
