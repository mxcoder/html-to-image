const fs = require('fs');
const path = require('path');
const express = require('express')
const bodyParser = require('body-parser');
const screenshot = require(__dirname + '/src/lib/screenshot');
const port = 3000

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
    console.log('Screenshot of image', width, height);
    screenshot(html, width, height, timeout || 1000)
        .then((data) => {
            const buffer = new Buffer(data, 'base64');
            response.type('png');
            response.send(buffer);
            // fs.writeFile('screenshot.png', buffer, 'base64');
        })
        .catch((err) => {
            res.status(500).send({ error: err.message });
        });
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})
