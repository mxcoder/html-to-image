#!/usr/bin/node

const fs = require('fs');
const commander = require('commander');
const chromeLauncher = require('chrome-launcher');
const screenshot = require(__dirname + '/src/lib/screenshot');
const now = new Date();
const _default = {
    html: `<center><img src="http://c.gumgum.com/ads/com/gumgum/icons/new/info_dark_3x.png" /><br /><a href="#">Hi ${process.env.USER}! Today is ${now}</a></center>`,
    width: 600,
    height: 400,
    delay: 500,
    filename: 'screenshot.png',
    debug: process.env.DEBUG || false,
};

commander
    .version('0.0.1')
    .usage('[options] <file>')
    .option('--html <s>', `html to screenshot, defaults to some basic html`)
    .option('-W, --width  <n>', `Viewport width, default=${_default.width}`, parseInt)
    .option('-H, --height <n>', `Viewport height, default=${_default.width}`, parseInt)
    .option('-D, --delay  <n>', `Delay (ms) for screenshot, default=${_default.delay}ms`, parseInt)
    .option('--debug', `Enables debug messages`)
    .parse(process.argv);

const html = commander.html || _default.html;
const width = commander.width || _default.width;
const height = commander.height || _default.height;
const delay = commander.delay || _default.delay;
const filename = commander.args[0] || _default.filename;
const debug = commander.debug || _default.debug;

function launchHeadlessChrome() {
    return chromeLauncher.launch({
        port: 9222,
        chromeFlags: [
            `--window-size=${width},${height}`,
            '--disable-gpu',
            '--headless'
        ]
    });
}

launchHeadlessChrome().then(chrome => {
    screenshot(html, width, height, delay, debug).then((data) => {
        debug && console.log('Writing to:', __dirname + '/' + filename);
        fs.writeFile(__dirname + '/' + filename, new Buffer(data, 'base64'), () => {
            chrome.kill();
            process.exit();
        });
    });
});
