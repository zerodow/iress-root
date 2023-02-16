const timeout = 6 * 1000
const timeInterval = 6 * 1000
function checkInfor({
    url = null,
    accessToken,
    cbSuccess,
    cbFail
}) {
    axios({
        url,
        method: 'get',
        headers: {
            // Authorization: `Bearer ${accessToken}`
            'Cache-Control': 'no-cache'
        },
        timeout: timeout
    }).then(res => {
        cbSuccess(true)
    }).catch((e) => {
        cbFail(false)
    })
}
class Timer {
    constructor() {
        this.logId = 0
        this.request = new XMLHttpRequest();
        this.timeoutInterval = null
        this.preIsConnected = null
        this.cbSuccess = this.cbSuccess.bind(this)
        this.cbFail = this.cbFail.bind(this)
        this.avoidInterval = false
        this.url = null
    }
    cbFail(isConnected) {
        if (!isConnected && this.preIsConnected) {
            this.preIsConnected = isConnected
            return window.ReactNativeWebView.postMessage('false');
        }
    }
    cbSuccess(isConnected) {
        if (isConnected && !this.preIsConnected) {
            this.preIsConnected = isConnected
            return window.ReactNativeWebView.postMessage('true');
        }
    }
    checkNetworkConnection(url) {
        try {
            this.url = url
            if (this.timeoutInterval) clearInterval(this.timeoutInterval)
            this.timeoutInterval = setInterval(() => {
                !this.avoidInterval && checkInfor({
                    preIsConnected: this.preIsConnected,
                    cbSuccess: this.cbSuccess,
                    cbFail: this.cbFail,
                    url
                })
            }, timeInterval);
        } catch (e) {
            window.ReactNativeWebView.postMessage(e);
        }
    }
    disabledInterval() {
        this.avoidInterval = true
        if (this.timeoutInterval) clearInterval(this.timeoutInterval)
    }
    activeInterval() {
        this.avoidInterval = false
        this.url && this.checkNetworkConnection(this.url)
    }
}
timer = new Timer();
