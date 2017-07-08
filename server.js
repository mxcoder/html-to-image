const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const chromeLauncher = require('chrome-launcher');
const screenshot = require(__dirname + '/src/lib/screenshot');

const debug = process.env.DEBUG || false;
const port = process.env.WEBPORT || 3000;
const chromeport = process.env.CHROMEPORT || 9222;

function launchHeadlessChrome() {
    return chromeLauncher.launch({
        port: chromeport,
        chromeFlags: [
            '--window-size=600,400',
            '--disable-gpu',
            '--headless'
        ]
    });
}

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => {
    response.sendFile('index.html', {
        root: __dirname + '/src/views/',
        dotfiles: 'deny',
        headers: {
            'content-type': 'text/html',
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    });
});

app.get('/image', (request, response) => {
    const { html, width, height, timeout } = request.query;
    debug && console.log('Screenshot of image', width, height);
    screenshot(html, width, height, timeout, debug)
        .then((data) => {
            const buffer = new Buffer(data, 'base64');
            response.type('png');
            response.send(buffer);
        })
        .catch((err) => {
            debug && console.error(err);
            res.status(500).send({ error: err.message });
        });
});

app.listen(port, (err) => {
    if (err) {
        console.error(err);
        return true;
    }
    debug && console.log(`server is listening on ${port}`)
})

launchHeadlessChrome().then(chrome => {
    debug && console.log(`Chrome debuggable on port: ${chrome.port}`);
    process.on('exit', function() {
        debug && console.log(`Killing Chrome on port: ${chrome.port}`);
        chrome.kill();
    });
});
