const Clien = require('./clien');

const crawlers = [Clien, Clien];

const getCrawler = (index) => new crawlers[index]();

module.exports = { getCrawler, crawlers: crawlers.map((c) => c.toString()) };
