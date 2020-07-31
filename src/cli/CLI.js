const blessed = require('blessed');

const { updateNotifier, env } = require('../helpers');
const cliOptions = require('./CLIOptions');

class CLI {
    constructor() {
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
        this.loadingBox = blessed.loading({
            ...cliOptions.loading,
            parent: this.footerBox,
        });
        this.loadingBox._.icon.top = 0;
        this.loadingBox._.icon.left = 0;
        this.loadingBox._.icon.right = 0;

        this.loadingBox.loadingStyles = {
            fg: this.colors.bottom_right_color,
            bg: this.colors.bottom_bg_loading,
        };

        this.loadingBox.load = function (text) {
            this._.icon.style = this.loadingStyles;
            blessed.loading.prototype.load.call(this, text);
            this.screen.lockKeys = false;
            this.parent.padding.right -= 1;
        };
        this.loadingBox.stop = function () {
            blessed.loading.prototype.stop.call(this);
            this.parent.padding.right += 1;
        };

        // update
        process.on('exit', updateNotifier.notifyUpdate);
    }

    setKeyPressEvent() {
        this.screen.on('keypress', async (ch, { full }) => {
            switch (full) {
                case 'C-c':
                    return await this.terminate(env.isDevEnv ? 1 : 0);
                case 'escape':
                case 'q':
                    if (!this.footerBox.focused) {
                        const footerChildren = this.footerBox.children.find(
                            c => c.shouldStayAtCurrPage && c.name !== 'loading',
                        );

                        if (
                            this.getWidget().shouldStayAtCurrPage ||
                            footerChildren
                        ) {
                            await this.cancelSearchInMode();
                        } else {
                            this.moveToWidget('prev');
                        }
                    }
                    return;
                case 'space':
                    return this.screen.children.forEach(c => {
                        if (c.visible) {
                            this.footerBox.focus();
                            c.hide();
                        } else {
                            this.getWidget().focus();
                            c.show();
                        }
                        this.screen.render();
                    });
            }
        });
    }

    setSelectEvent() {}

    setFocusEvent() {
        this.footerBox.on('focus', () => {
            this.footerBox.setContent(`${this.footerBox.getContent()} {|}`);
            this.footerBox.style = {
                ...this.footerBox.style,
                bg: this.colors.bottom_bg_loading,
            };
            this.loadingBox.load();
            this.screen.render();
        });
    }

    setBlurEvent() {
        this.footerBox.on('blur', () => {
            this.footerBox.style = {
                ...this.footerBox.style,
                bg: this.colors.bottom_bg,
            };
            this.loadingBox.stop();
        });
    }

    setAllEvents() {
        this.setKeyPressEvent();
        this.setSelectEvent();
        this.setFocusEvent();
        this.setBlurEvent();
    }

    cancelSearchInMode() {}

    // direction: 'prev' || 'next'
    moveToWidget(direction, callback) {
        try {
            const isNextWidget = direction === 'next';
            const nextWidgetIndexOffset = isNextWidget ? 1 : -1;

            const nextWidget = this.getWidget(nextWidgetIndexOffset);
            const currWidget = this.getWidget(0);

            this.currentWidgetIndex += nextWidgetIndexOffset;

            if (nextWidget) {
                direction === 'prev' &&
                    currWidget.select &&
                    currWidget.select(0);
                currWidget.destroy();
                this.bodyBox.append(nextWidget);
                callback && callback(nextWidget);
                nextWidget.focus();
            } else {
                this.terminate(env.isDevEnv ? 1 : 0);
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
        widget.select && widget.select(offset);
        this.screen.render();
    }

    getWidget(offset = 0) {
        const index = this.currentWidgetIndex + offset;

        if (index < this.widgets.length) return this.widgets[index];
        return this.widgets[this.widgets.length - 1];
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
