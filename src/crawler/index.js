const Clien = require('./clien');
const Ruliweb = require('./ruliweb');
const SLRClub = require('./slrclub');

const crawlers = [Clien, Ruliweb, SLRClub];

const getCrawler = (index) => new crawlers[index]();

module.exports = { getCrawler, crawlers: crawlers.map((c) => c.toString()) };
