module.exports = {
    isDevEnv: process.env.NODE_ENV === 'development',
    isCIEnv: !!process.env.CI,
};
