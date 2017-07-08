const CDP = require('chrome-remote-interface');
const fs = require('fs');
const Q = require('q')
const baseHTML = `
    <!doctype html>
    <style>html,body{margin:0;padding:0;height:100%;overflow:hidden;}</style>
`;

function screenshot(html, width, height, timeout) {
    const deferred = Q.defer();
    width = ~~width;
    height = ~~height;
    timeout = timeout || 250;

    console.log('screenshot', 'start', html, width, height, timeout);
    CDP({
        host: 'localhost',
        port: 9222,
    }, (client) => {
        const { Runtime, Network, Emulation, Page } = client;

        Page.loadEventFired(captureScreenshot);
        Network.setCacheDisabled({ cacheDisabled: true });
        Network.requestWillBeSent(({ requestId, request }) => {
            console.log('requestWillBeSent', requestId, request.url);
        });
        Runtime.consoleAPICalled(({type, args}) => {
            console.log('consoleAPICalled', mtype);
        });
        Emulation.setDeviceMetricsOverride({
            width: width,
            height: height,
            deviceScaleFactor: 0,
            mobile: false,
            fitWindow: false,
        });
        Emulation.setVisibleSize({
            width: width,
            height: height,
        });

        function init() {
            return Promise.all([
                Page.enable(),
                Runtime.enable(),
                Network.enable(),
            ]);
        }

        function navigate() {
            console.log('screenshot', 'navigate');
            const markup = baseHTML + `<div style="position:absolute;width:${width}px;height:${height}px;background:rgba(0,0,0,0.25)">` + html + '</div>';
            return Page.navigate({ url: 'data:text/html;base64,' + new Buffer(markup).toString('base64') })
        }

        function captureScreenshot() {
            setTimeout(() => {
                Page.captureScreenshot({ format: 'png' }).then(afterCapture);
            }, timeout);
        }

        function afterCapture({data}) {
            client.close(() => {
                console.log('screenshot end');
                deferred.resolve(data);
            });
        }

        init()
        .then(navigate)
        .catch((err) => {
            console.log(err);
            deferred.reject(err);
        });
    }).on('error', (err) => {
        console.error(err);
        deferred.reject(err);
    });
    return deferred.promise;
}

module.exports = screenshot;
