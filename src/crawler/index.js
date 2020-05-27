const Clien = require('./clien');
const Ruliweb = require('./ruliweb');
const DVDPrime = require('./dvdprime');
const SLRClub = require('./slrclub');

const crawlers = [Clien, Ruliweb, DVDPrime, SLRClub];

const getCrawler = (index) => new crawlers[index]();

module.exports = { getCrawler, crawlers: crawlers.map((c) => c.toString()) };
