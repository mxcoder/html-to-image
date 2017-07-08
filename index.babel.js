require("babel-polyfill");
const CDP = require('chrome-remote-interface');
const fs = require('fs');

function exit() {
    process.exit(0);
}

CDP({
    host: 'localhost',
    port: 9222,
}, async (client) => {
    try {
        const { Page, Emulation } = client;
        const viewport = [728, 90];
        const device = {
            width: viewport[0],
            height: viewport[1],
            deviceScaleFactor: 0,
            mobile: false,
            fitWindow: false
        };

        await Page.enable()
        await Emulation.setDeviceMetricsOverride(device);
        await Emulation.setVisibleSize({width: viewport[0], height: viewport[1]});

        Page.loadEventFired(async () => {
            setTimeout(async () => {
                let { data } = await Page.captureScreenshot({ format: 'png' });
                const buffer = new Buffer(data, 'base64');
                fs.writeFileSync('screenshot.png', buffer, 'base64');
                exit()
            }, 2000);
        });

        let { frameId } = await Page.navigate({url: 'about:blank'});
        await Page.setDocumentContent({
            frameId: frameId,
            html: '<!doctype html><iframe id="c28be4ae02" name="c28be4ae02" src="http://us-ads.openx.net/w/1.0/afr?auid=538180883&cb=[timestamp]" frameborder="0" scrolling="no" width="728" height="90"><a href="http://us-ads.openx.net/w/1.0/rc?cs=c28be4ae02&cb=[timestamp]" ><img src="http://us-ads.openx.net/w/1.0/ai?auid=538180883&cs=c28be4ae02&cb=[timestamp]" border="0" alt=""></a></iframe>'
        });
    } catch (err) {
        console.log(err);
    }
});
