#!/usr/bin/env node

const Boards = require('./newBoards/Boards');

(async () => {
    const boards = Boards.start();
})();
