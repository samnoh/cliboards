#!/usr/bin/env node

const Boards = require('./newBoards/Boards');

(async () => {
    const boards = new Boards();
    boards.start();
})();
