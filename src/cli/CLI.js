const blessed = require('blessed');

const { updateNotifier } = require('../helpers');
const cliOptions = require('./CLIOptions');

class CLI {
    constructor() {
        // dev
        this.isDevMode = process.env.NODE_ENV === 'development';

        // theme
        const { colors, isError } = cliOptions.colors;
        this.colors = colors;
        this.isColorsError = isError;

        // cli
        this.currentWidgetIndex = 0;
        this.screen = blessed.screen(cliOptions.screen);
        const box = blessed.box({
            ...cliOptions.defaultBox,
            parent: this.screen,
        });
        this.titleBox = blessed.box({
            ...cliOptions.title,
            parent: box,
        });
        this.bodyBox = blessed.box({
            ...cliOptions.body,
            parent: box,
        });
        this.footerBox = blessed.box({
            ...cliOptions.footer,
            parent: box,
        });

        // update
        process.on('exit', updateNotifier.notifyUpdate);
    }

    setKeyPressEvent() {
        this.screen.on('keypress', async (_, { full }) => {
            switch (full) {
                case 'C-c':
                    return await this.terminate(this.isDevMode ? 1 : 0);
                case 'escape':
                case 'q':
                    return (
                        !this.footerBox.focused &&
                        !this.formBox &&
                        this.moveToWidget('prev')
                    );
                case 'space':
                    return this.screen.children.forEach(c => {
                        if (c.visible) {
                            this.footerBox.focus();
                            c.hide();
                        } else {
                            this.widgets[this.currentWidgetIndex].focus();
                            c.show();
                        }
                        this.screen.render();
                    });
            }
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
                }-fg}Loading...{/}`,
            );
            this.footerBox.style = {
                ...this.footerBox.style,
                bg: this.colors.bottom_bg_loading,
            };
            this.screen.render();
        });
    }

    setBlurEvent() {
        this.footerBox.on('blur', () => {
            this.footerBox.style = {
                ...this.footerBox.style,
                bg: this.colors.bottom_bg,
            };
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
                direction === 'next'
                    ? this.currentWidgetIndex + 1
                    : this.currentWidgetIndex - 1;

            const nextWidget = this.widgets[nextWidgetIndex];
            const currWidget = this.widgets[this.currentWidgetIndex];

            this.currentWidgetIndex = nextWidgetIndex;

            if (nextWidget) {
                direction === 'prev' &&
                    currWidget.select &&
                    currWidget.select(0);
                currWidget.destroy();
                this.bodyBox.append(nextWidget);

                callback && callback(nextWidget);

                nextWidget.focus();
            } else {
                this.terminate(this.isDevMode ? 1 : 0);
            }
        } catch (e) {
            this.terminate(1, e);
        }
    }

    setTitleContent(leftTitleText, rightTitleText) {
        this.titleBox.setContent(
            `${leftTitleText} {|}{${this.colors.top_right_color}-fg}${
                rightTitleText || ''
            }{/}`,
        );
        this.screen.render();
    }

    setFooterContent(footerText) {
        this.footerBox.setContent(
            `q: ${this.currentWidgetIndex ? 'back' : 'quit'}${
                footerText ? ', ' + footerText : ''
            }`,
        );
        this.screen.render();
    }

    setTitleFooterContent(
        leftTitleText = '',
        rightTitleText = '',
        footerText = '',
    ) {
        this.setTitleContent(leftTitleText, rightTitleText);
        this.setFooterContent(footerText);
    }

    resetScroll(widget, offset = 0) {
        if (!widget) return;
        widget.scrollTo(offset);
        widget.select(offset);
    }

    async terminate(exitCode = 0, message = '') {
        this.crawler && (await this.crawler.close());
        this.screen.destroy();
        blessed.program().clear();
        message && console[exitCode ? 'error' : 'log'](message);
        process.nextTick(() => process.exit(exitCode));
    }
}

module.exports = CLI;
