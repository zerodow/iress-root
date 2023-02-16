class LogDevice {
    constructor() {
        this.logId = 0
        this.request = new XMLHttpRequest();
    }
    LogDevice(type = 'info', textSend = '', firstKey, channel) {
        try {
            const body = {
                id: firstKey,
                type,
                data: textSend
            };
            this.request.open('POST', channel);
            this.request.setRequestHeader('Content-Type', 'application/json');
            this.request.onreadystatechange = () => {
                if (this.request.readyState === 4 && this.request.status === 200) {
                    window.ReactNativeWebView.postMessage('SUCCESS');
                }
            }
            this.request.send(JSON.stringify(body));
            window.ReactNativeWebView.postMessage('SENDED');
        } catch (e) {
            window.ReactNativeWebView.postMessage('FAIL');
        }
    }
}
ld = new LogDevice();
