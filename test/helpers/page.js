const checkResponseStatus = (status = 200) => res => {
    expect(res.status()).toEqual(status);
};

module.exports = {
    checkResponseStatus,
};
