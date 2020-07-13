const postHistories = {};

const initPostHistory = crawlerName => {
    if (!postHistories[crawlerName]) {
        postHistories[crawlerName] = new Map();
    }
};

const clearHistory = crawlerName => {
    postHistories[crawlerName].clear();
};

const getCurrentHistories = crawlerName => {
    initPostHistory(crawlerName);
    return Array.from(postHistories[crawlerName].values()).reverse();
};

const setHistory = (crawlerName, boardType, post) => {
    const postId = post.id;
    const currHistories = postHistories[crawlerName];
    const hasPost = isInPostHistory(crawlerName, postId);
    let data;

    if (hasPost) {
        // update order if the post exists
        data = currHistories.get(postId);
        currHistories.delete(postId);
    } else {
        data = {
            category: `${boardType.name}`,
            title: post.title,
            link: post.link,
            author: post.author,
        };
    }
    currHistories.set(postId, data);
};

const isInPostHistory = (crawlerName, id) => {
    initPostHistory(crawlerName);
    return postHistories[crawlerName].has(id);
};

module.exports = {
    clearHistory,
    getCurrentHistories,
    setHistory,
    isInPostHistory,
};
