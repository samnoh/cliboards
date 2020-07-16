const checkResponseStatus = (status = 200) => res => {
    expect(res.status()).toBe(status);
};

module.exports = {
    checkResponseStatus,
};
