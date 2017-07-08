require("babel-polyfill");
const CDP = require('chrome-remote-interface');
const fs = require('fs');
const Q = require('q')


function screenshot(html, width, height, timeout) {
    const deferred = Q.defer();
    const viewport = [width, height];
    const device = {
        width: viewport[0],
        height: viewport[1],
        deviceScaleFactor: 0,
        mobile: false,
        fitWindow: false
    };
    timeout = timeout || 250;
    console.log('screenshot', 'start', html, width, height, timeout);
    CDP({
        host: 'localhost',
        port: 9222,
    }, async (client) => {
        const { Page, Emulation } = client;
        await Page.enable()
        await Emulation.setDeviceMetricsOverride(device);
        await Emulation.setVisibleSize({width: viewport[0], height: viewport[1]});

        Page.loadEventFired(async () => {
            console.log('screenshot', 'loaded');
            let { data } = await Page.captureScreenshot({ format: 'png' });
            client.close(() => {
                console.log('screenshot end', data);
                deferred.resolve(data);
                // await fs.writeFile('screenshot.png', new Buffer(data, 'base64'), 'base64');
            });
        });

        console.log('screenshot', 'navigate');
        let { frameId } = await Page.navigate({url: 'about:blank'});
        await Page.setDocumentContent({
            frameId: frameId,
            html: '<!doctype html>' + html
        });
    });
    return deferred.promise;
}

module.exports = screenshot;
