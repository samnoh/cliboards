const Clien = require('./clien');
const SLRClub = require('./slrclub');

const crawlers = [Clien, SLRClub];

const getCrawler = (index) => new crawlers[index]();

module.exports = { getCrawler, crawlers: crawlers.map((c) => c.toString()) };
