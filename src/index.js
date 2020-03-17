#!/usr/bin/env node

import { Scraper } from './scraper';

import constants from './constants';

const { CLIEN_URL } = constants;
new Scraper(CLIEN_URL);
