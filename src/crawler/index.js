const Clien = require('./clien');
const Dcinside = require('./dcinside');
const Ruliweb = require('./ruliweb');
const DVDPrime = require('./dvdprime');
const SLRClub = require('./slrclub');

const crawlers = [Clien, Dcinside, Ruliweb, DVDPrime, SLRClub];

const getCrawler = (index) => new crawlers[index]();

module.exports = {
    getCrawler,
    crawlers: crawlers.map((c) => c.toString()),
};
