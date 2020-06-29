const { getTheme } = require('../helpers');

const [colors, isError] = getTheme();

const defaultOptions = {
    boxScrollbar: { ch: ' ', inverse: true },
    listScrollbar: { ch: ' ', style: { inverse: true } },
    box: {
        tags: true,
        width: '100%',
        height: '100%',
    },
    list: {
        keys: true,
        vi: true,
        tags: true,
    },
    padding: { left: 2, right: 2 },
};

defaultOptions.list.scrollbar = defaultOptions.listScrollbar;

module.exports = {
    defaultBox: defaultOptions.box,
    screen: {
        _type: 'screen',
        dockBorders: true,
        fastCSR: true,
        fullUnicode: true,
        debug: process.env.NODE_ENV === 'development',
    },
    title: {
        ...defaultOptions.box,
        top: 0,
        height: 1,
        padding: defaultOptions.padding,
        style: {
            bg: colors.top_bg,
            fg: colors.top_left_color,
        },
    },
    body: {
        ...defaultOptions.box,
        top: 1,
        bottom: 1,
        height: null,
        scrollbar: defaultOptions.boxScrollbar,
    },
    footer: {
        ...defaultOptions.box,
        top: '100%-1',
        height: 1,
        padding: defaultOptions.padding,
        style: {
            fg: colors.bottom_left_color,
            bg: colors.bottom_bg,
        },
    },
    community: {
        ...defaultOptions.list,
        style: {
            selected: {
                bg: colors.cursor_bg,
                fg: colors.cursor_color,
            },
            bg: colors.list_bg,
            fg: colors.list_left_color,
        },
    },
    board: {
        ...defaultOptions.list,
        style: {
            selected: {
                bg: colors.cursor_bg,
                fg: colors.cursor_color,
            },
            bg: colors.list_bg,
            fg: colors.list_left_color,
        },
    },
    postList: {
        ...defaultOptions.list,
        style: {
            selected: {
                bg: colors.cursor_bg,
                fg: colors.cursor_color,
            },
            bg: colors.list_bg,
            fg: colors.list_left_color,
        },
    },
    postDetail: {
        ...defaultOptions.box,
        scrollable: true,
        keys: true,
        vi: true,
        alwaysScroll: true,
        scrollbar: defaultOptions.boxScrollbar,
        style: {
            bg: colors.post_bg,
            fg: colors.post_color,
        },
    },
    colors: { colors, isError },
};
