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

        function init() {
            return Promise.all([
                Page.enable(),
                Runtime.enable(),
                Network.enable(),
            ]).then(() => {
                return Page.loadEventFired(captureScreenshot);
            }).then(() => {
                console.log('setCacheDisabled');
                return Network.setCacheDisabled({ cacheDisabled: true });
            }).then(() => {
                console.log('requestWillBeSent');
                return Network.requestWillBeSent(({ requestId, request }) => {
                    console.log('requestWillBeSent', requestId, request.url);
                });
            }).then(() => {
                return Runtime.consoleAPICalled(({type, args}) => {
                    console.log('consoleAPICalled', mtype);
                });
            });
        }

        function setDeviceMetricsOverride() {
            console.log('screenshot', 'setDeviceMetricsOverride');
            return Emulation.setDeviceMetricsOverride({
                width: width,
                height: height,
                deviceScaleFactor: 0,
                mobile: false,
                fitWindow: false,
            });
        }

        function setVisibleSize() {
            console.log('screenshot', 'setVisibleSize');
            return Emulation.setVisibleSize({
                width: width,
                height: height,
            })
        };

        function loadContent() {
            console.log('screenshot', 'loadContent');
            return Page.navigate({ url: 'about:blank' })
                .then(setDocumentContent);
        }

        function setDocumentContent({ frameId }) {
            console.log('screenshot', 'setDocumentContent', frameId, baseHTML + `<div style="position:absolute;width:${width}px;height:${height}px;background:rgba(0,0,0,0.25)">` + html + '</div>');
            return Page.setDocumentContent({
                frameId: frameId.toString(),
                html: baseHTML + `<div style="position:absolute;width:${width}px;height:${height}px;background:rgba(0,0,0,0.25)">` + html + '</div>',
            });
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
                // const buffer = new Buffer(data, 'base64');
                // fs.writeFile('screenshot.png', buffer, 'base64');
            });
        }

        init()
        .then(setDeviceMetricsOverride)
        .then(setVisibleSize)
        .then(loadContent)
        .catch((err) => {
            console.log(err);
            deferred.reject(err);
        });
    });
    return deferred.promise;
}

module.exports = screenshot;
