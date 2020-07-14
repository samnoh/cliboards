# cliboards &middot; [![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-darkgreen)](https://nodejs.org) [![npm version](https://img.shields.io/npm/v/cliboards)](https://www.npmjs.com/package/cliboards) [![npm downloads](https://img.shields.io/npm/dt/cliboards?color=red)](https://npm-stat.com/charts.html?package=cliboards) [![GitHub last commit](https://img.shields.io/github/last-commit/samnoh/cliboards?color=blue)](https://github.com/samnoh/cliboards/commits/master) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/samnoh/cliboards/Node.js%20CI)](https://github.com/samnoh/cliboards/actions?query=workflow%3A%22Node.js+CI%22)

> ⌨️ Surf your online communities on CLI

![screenshot](img/screenshot-01.jpg)

## Features

-   Browse online communities: `Clien`, `dcinside`, `DVDPrime`, `Ruliweb`, `PPOMPPU` and `SLRClub`
-   Supports Post Favorites
-   Supports Post History
-   Search posts
-   Shurtcut for viewing images on default web browser
-   Spoiler protection
-   Hide screen instantly (`space` key)
-   May Load faster with a slow Internect connection
-   Supports color customizations

## Installation

Use the package manager [npm](https://www.npmjs.com) to install `cliboards`.

```bash
# Install globally (recommended).
npm i -g cliboards

# Or run directly with npx (installs CLI on every run).
npx cliboards
```

## Usage

```bash
# Display a list of community
cliboards

# Display the nth community (1 is the first)
cliboards <index>

# Display community for given name (non case sensitive)
cliboards <name>

# Reset all data including favorites
cliboards --reset

# Reset data for given community only
cliboards <index|name> --reset

# Update theme (color customizations)
cliboards --theme

# Disable spoiler protection
cliboards --disableSP
```

## Changelog

[Read the changelog here](CHANGELOG.md)

## Contributing

Please do contribute! Issues and pull requests are all welcome.

### Code of Conduct

Please read the [full text](CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Licnese

[MIT licensed](LICENSE)
