const fs = require('fs-extra')
const request = require('request')
const cheerio = require('cheerio')
const _ = require("lodash")
var beautify = require("json-beautify");

// BASIC SETTINGS //
var checkVolume = false // Check for top BTC-pairs?
var TopPairs = 5 // Number of TopX volume pairs you want to get from CoinMarketCap
var Exchange = 'bittrex' // Your exchange, currently bittrex and poloniex are supported
var UpdateTime = 5 // Minutes - Run an update every X minutes

// BTC PUMP SETTINGS
var checkPump = false // Check for BTC pump?
var pumpUp = 2.5 // % - Stop buying your BTC-pairs if BTC price is up more than X-percent
var pumpTime = 1 // hour(s) - BTC price change
var activateTV = true // Activate TradingView addon to buy/sell USDT-pairs (requires TV addon and email alerts)

// MARKET TREND
var checkTrend = true // Check for overall market trend change?
var trendUp = 1.5 // % - Start buying BTC-pairs if overall market trend is up more than X-percent
var trendDown = 1.5 // % - Stop buying BTC-pairs if overall market trend is down more than X-percent
var trendTime = 1 // hour(s) - BTC price change
var activateTV = true // Activate TradingView addon to buy/sell USDT-pairs (requires TV addon and email alerts)

// PANIC?
var panicSell = false // This option will sell ALL your open positions at the current market price - see official GB wiki

// MULTI GB SETUP (In development - coming soon)
var multiGB = false // Set "true" if you uare using multiple GB instances and define the paths below
var configPath1 = "../GB-1/"
var configPath2 = "../GB-2/"
var configPath3 = "../GB-3/"

// DON'T TOUCH //
var pairs = []
var topVolume = []
var cmcExchanges = 'https://coinmarketcap.com/exchanges/'+Exchange+'/'

// Build the new config file
function buildConfig(topVolumePairs) {
    var currentConfig = readConfig('example-config.js')
    var curConfig
    if(Exchange == 'bittrex') {
        curConfig = currentConfig.pairs.bittrex
    } else
    if(Exchange == 'poloniex') {
        curConfig =  currentConfig.pairs.poloniex
    } else {
        console.log("Exchange not specified. Please check the settings.")
    }

    // For each pairs of the current config, we look if it's a top volume pair.
    // If yes, we do NOT touch anything
    // If no, we just disable the buy and maybe enable the panic sell
    for (var config in curConfig) {
      var pairPresent = false
      for (var i = 0; i < topVolumePairs.length; i++) {
        if (config === topVolumePairs[i]) {
          pairPresent = true
        }
      }
      // The pair is not present, we disable the buy and if the panic sell option is setted up to true we enable the panic sell.
      if (!pairPresent) {
        curConfig[config].override.BUY_ENABLED = false
        if (panicSell) {
          curConfig[config].override.PANIC_SELL = true
        }
      }
    }

    // Now we replace the current bittrex or poloniex config by the new one
    if(Exchange == 'bittrex') {
      currentConfig.pairs.bittrex = curConfig
    } else
    if(Exchange == 'poloniex') {
      currentConfig.pairs.poloniex = curConfig
    } else {
        console.log("Exchange not specified. Please check the settings.")
    }

    writeConfig(currentConfig, 'example-config.js')
}

// Read the current config.js file and return the JSON
function readConfig(configPath) {
    var rawdata = fs.readFileSync(configPath)
    var configJSON = JSON.parse(rawdata)
    return configJSON
}

// Write the pairs in input in the config file
function writeConfig(newConfig, configPath) {
  var fileToWrite = beautify(newConfig, null, 2, 50)
  fs.writeFile(configPath, fileToWrite)
    .then(() => {
    console.log('The new config is updated')
    })
    .catch(err => {
      console.error(err)
    })
}

// Build array of pairs (topVolume) the are scraped below from CoinMarketCap, limited by TopPairs settings above
function buildPairs() {
    for (var i = 0, len = TopPairs; i < len; i++) {
        topVolume.push(pairs[i])
    }
    buildConfig(topVolume)
}
// Scrape TopX volume pairs from CoinMarketCap
if(checkVolume) {
    request(cmcExchanges,(error,response,html)=>{
        var $ = cheerio.load(html)
        $('#markets > div.table-responsive > table > tbody > tr > td > a').each((i,element)=>{
            var omg = $(element).attr('href')
            if(Exchange == 'bittrex') {
                if(omg.match(/MarketName/i)) {
                    var pair = omg.replace("https://bittrex.com/Market/Index?MarketName=","")
                    if (pair.match(/^(BTC-)/i)) {
                        pairs.push(pair)
                    }
                }
            } else if(Exchange == 'poloniex') {
                if(omg.match(/exchange/i)) {
                    var pair = omg.replace("https://poloniex.com/exchange/#","")
                    if (pair.match(/^(btc_)/i)) {
                        pairs.push(pair)
                    }
                }
            }
        });
        setTimeout(buildPairs, 3000)
    });
}
if(checkTrend) {
    request('https://api.coinmarketcap.com/v1/ticker/?limit=100', { json: true }, (err, res, body) => {
      if (err) { return console.log(err); }
      var average = _.meanBy(body, (b) => parseInt(b.percent_change_1h))
      console.log("Top 100 Coins Trend: " + average)
    });
}