const CDP = require('chrome-remote-interface');
const Q = require('q')
const baseHTML = `
    <!doctype html>
    <style>html,body{margin:0;padding:0;height:100%;overflow:hidden;}</style>
`;

function buildHTML(html, width, height) {
    return baseHTML + `<div style="position:absolute;width:${width}px;height:${height}px;background:rgba(0,0,0,0.25)">` + html + '</div>';
}
function getDataURI(html) {
    return 'data:text/html;base64,' + new Buffer(html).toString('base64');
}

function screenshot(html, width, height, timeout) {
    const deferred = Q.defer();
    width = ~~width;
    height = ~~height;
    timeout = timeout || 250;

    // console.log('screenshot', 'start', html, width, height, timeout);
    CDP({
        host: 'localhost',
        port: 9222,
    }, (client) => {
        const { Runtime, Network, Emulation, Page } = client;

        // Set browser environment
        Page.loadEventFired(captureScreenshot);
        Network.setCacheDisabled({ cacheDisabled: true });
        Network.requestWillBeSent(({ requestId, request }) => {
            console.log('requestWillBeSent', requestId, request.url);
        });
        // Runtime.consoleAPICalled(({type, args}) => {
        //     console.log('consoleAPICalled', mtype);
        // });
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

        // Init all domains
        function init() {
            return Promise.all([
                Page.enable(),
                Runtime.enable(),
                Network.enable(),
            ]);
        }

        // Navigates to data uri built from markup
        // @see https://github.com/ChromeDevTools/devtools-protocol/issues/13
        function navigate() {
            // console.log('screenshot', 'navigate');
            return Page.navigate({
                url: getDataURI(buildHTML(html, width, height)),
            });
        }

        // Triggers screenshot after timetout
        function captureScreenshot() {
            setTimeout(() => {
                Page.captureScreenshot({ format: 'png' }).then(afterCapture);
            }, timeout);
        }

        // Resolves promise after screenshot
        function afterCapture({data}) {
            client.close(() => {
                // console.log('screenshot end');
                deferred.resolve(data);
            });
        }

        // Inits process
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
