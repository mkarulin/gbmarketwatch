const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const _ = require("lodash")

// YOUR SETTINGS //
var TopPairs = 5 // How many TopX volume pairs you want to get from CoinMarketCap
var Exchange = 'bittrex' // Your exchange, currently bittrex and poloniex are supported
var changeBTC = 2.5

// DON'T TOUCH //
var pairs = []
var topVolume = []
var url = 'https://coinmarketcap.com/exchanges/'+Exchange+'/'

// Build the new config file
function buildConfig() {
    var curConfig = readConfig('example-config.js')

    // Here we have several options how to do this... but i'm stuck comparing the two json arrays and replace/append/prepend them
    // feel free to help out here :)
    // 
    // Option 1: By Volume: Stop buying pairs that are not in Top Volume: 
    //           get pairs from topVolume array and set override BUY_ENABLED=FALSE for pairs in curConfig array, 
    //           then prepend pairs to curConfig that are rising up in volume and start buying these coins

    // Option 2: By Market Trend: If topX pairs (except BTC) go down, stop buying altcoins and activate TV addon
    //           to buy/sell USDT-BTC until BTC goes bearish again and we start buying altcoins by enabling buys
}

// Read the current config.js file and return the JSON
function readConfig(configPath) {
    var rawdata = fs.readFileSync(configPath)
    var configJSON = JSON.parse(rawdata)
    if(Exchange == 'bittrex') { 
        return configJSON.pairs.bittrex
    } else 
    if(Exchange == 'poloniex') {
        return configJSON.pairs.poloniex
    } else {
        console.log("Exchange not specified. Please check the settings.")
    }
}

// Build array of pairs (topVolume) the are scraped below from CoinMarketCap, limited by TopPairs settings above
function buildPairs() {
    for (var i = 0, len = TopPairs; i < len; i++) {
        topVolume.push(pairs[i])
    }
    console.log(topVolume)
    buildConfig()
}
// Scrape TopX volume pairs from CoinMarketCap
request(url,(error,response,html)=>{
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