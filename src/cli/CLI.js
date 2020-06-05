const blessed = require('blessed');

const { updateNotifier, getTheme } = require('../helpers');

class CLI {
    constructor() {
        // update
        this.shouldUpdatePackage = updateNotifier.shouldUpdatePackage;
        process.on('exit', updateNotifier.notifyUpdate);

        // theme
        const [colors, isError] = getTheme('default');
        this.colors = colors;
        this.isColorsError = isError;

        // cli
        this.currentWidgetIndex = 0;
        this.screen = blessed.screen({
            dockBorders: true,
            fastCSR: true,
            fullUnicode: true,
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
                right: 2,
            },
            style: {
                fg: this.colors.bottom_left_color,
                bg: this.colors.bottom_bg,
            },
        });
    }

    setKeyPressEvent() {
        this.screen.key('C-c', async () => {
            await this.terminate();
        });

        this.screen.key(['escape', 'q'], () => {
            !this.footerBox.focused && this.moveToWidget('prev');
        });
    }

    setSelectEvent() {
        //
    }

    setFocusEvent() {
        this.footerBox.on('focus', () => {
            this.footerBox.setContent(
                `${this.footerBox.getContent()} {|}{${
                    this.colors.bottom_right_color
                }-fg}Loading...{/}`
            );
            this.footerBox.style = { ...this.footerBox.style, bg: this.colors.bottom_bg_loading };
            this.screen.render();
        });
    }

    setBlurEvent() {
        this.footerBox.on('blur', () => {
            this.footerBox.style = { ...this.footerBox.style, bg: this.colors.bottom_bg };
        });
    }

    setAllEvents() {
        this.setKeyPressEvent();
        this.setSelectEvent();
        this.setFocusEvent();
        this.setBlurEvent();
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
            // this.terminate(1, e);
        }
    }

    setTitleContent(leftTitleText, rightTitleText) {
        this.titleBox.setContent(
            `${leftTitleText} {|}{${this.colors.top_right_color}-fg}${rightTitleText || ''}{/}`
        );
        this.screen.render();
    }

    setFoooterContent(footerText) {
        this.footerBox.setContent(footerText);
        this.screen.render();
    }

    setTitleFooterContent(leftTitleText = '', rightTitleText = '', footerText = '') {
        this.setTitleContent(leftTitleText, rightTitleText);
        this.setFoooterContent(footerText);
    }

    resetScroll(widget, offset = 0) {
        widget.scrollTo(offset);
        widget.select(offset);
    }

    async terminate(exitCode = 0, message) {
        this.crawler && (await this.crawler.close());
        message && console[exitCode ? 'error' : 'log'](message);
        return process.exit(exitCode);
    }
}

module.exports = CLI;
