# GBMarketWatch (0.1-alpha)
THIS SCRIPT IS STILL IN DEVELOPMENT - USE AT OWN RISK

An extendable script that compares your pairs with trading volume and overall market trend.
Depending on the current market trend the script can enable/disable buy orders or activate 
the TradingView addon to stop altcoin trades and switch to USDT-pair trading. 

More to come....

## Requirements
nodejs & npm

## Install
- git clone or download the .zip
- run: npm install
- run: node index.js

## Roadmap
- [x] Compare pairs in config.js with TopX volume pairs of your exchange and update config file
- [x] Automatic update every X minutes
- [ ] Add new pairs that are in the TopX volume of your exchange and apply your desired TRADING_LIMIT
- [ ] Update config depending on market trend (stop trading altcoins, activate TV mode for USDT-pairs)
- [ ] Work with multiple config files in different folders for several GB instances
- [ ] Simple Desktop UI for Windows, Mac and Linux
- [ ] Telegram notifications
