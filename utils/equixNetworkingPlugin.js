import { DeviceEventEmitter } from 'react-native';
import XHRInterceptor from 'react-native/Libraries/Network/XHRInterceptor';
import queryString from 'querystring';

/**
 * Don't include the response bodies for images by default.
 */
const DEFAULT_CONTENT_TYPES_RX = /^(image)\/.*$/i;

const DEFAULTS = {};

export default (pluginConfig = {}) => (reactotron) => {
    const options = Object.assign({}, DEFAULTS, pluginConfig);

    // a RegExp to suppess adding the body cuz it costs a lot to serialize
    const ignoreContentTypes =
        options.ignoreContentTypes || DEFAULT_CONTENT_TYPES_RX;

    // a XHR call tracker
    let reactotronCounter = 1000;

    // a temporary cache to hold requests so we can match up the data
    const requestCache = {};

    /**
     * Fires when we talk to the server.
     *
     * @param {*} data - The data sent to the server.
     * @param {*} instance - The XMLHTTPRequest instance.
     */
    function onSend(data, xhr) {
        const ignoreUrls = /\b(\w*(log\/data|\/info)\w*)\b/;
        if (ignoreUrls.test(xhr._url)) {
            xhr._skipReactotron = true;
            return;
        }

        // bump the counter
        reactotronCounter++;

        // tag
        xhr._trackingName = reactotronCounter;

        // cache
        requestCache[reactotronCounter] = {
            data: data,
            xhr,
            stopTimer: reactotron.startTimer()
        };
    }

    /**
     * Fires when the server gives us a response.
     *
     * @param {number} status - The HTTP response status.
     * @param {boolean} timeout - Did we timeout?
     * @param {*} response - The response data.
     * @param {string} url - The URL we talked to.
     * @param {*} type - Not sure.
     * @param {*} xhr - The XMLHttpRequest instance.
     */
    function onResponse(status, timeout, response, url, type, xhr) {
        if (xhr._skipReactotron) {
            return;
        }

        let params = null;
        const queryParamIdx = url ? url.indexOf('?') : -1;

        if (queryParamIdx > -1) {
            params = queryString.parse(url.substr(queryParamIdx));
        }

        // fetch and clear the request data from the cache
        const rid = xhr._trackingName;
        const cachedRequest = requestCache[rid] || {};
        requestCache[rid] = null;

        // assemble the request object
        const { data, stopTimer } = cachedRequest;
        if (!stopTimer) return;

        const tronRequest = {
            url: url || cachedRequest.xhr._url,
            method: xhr._method || null,
            data,
            headers: xhr._headers || null,
            params
        };

        // what type of content is this?
        const contentType =
            (xhr.responseHeaders && xhr.responseHeaders['content-type']) ||
            (xhr.responseHeaders && xhr.responseHeaders['Content-Type']) ||
            '';

        const sendResponse = (responseBodyText) => {
            let body = `~~~ skipped ~~~`;
            if (responseBodyText) {
                try {
                    // all i am saying, is give JSON a chance...
                    body = JSON.parse(responseBodyText);
                } catch (boom) {
                    body = response;
                }
            }
            const tronResponse = {
                body,
                status,
                headers: xhr.responseHeaders || null
            };

            // send this off to Reactotron
            reactotron.apiResponse(tronRequest, tronResponse, stopTimer()); // TODO: Fix
        };

        // can we use the real response?
        const useRealResponse =
            (typeof response === 'string' || typeof response === 'object') &&
            !ignoreContentTypes.test(contentType || '');

        // prepare the right body to send
        if (useRealResponse) {
            if (
                type === 'blob' &&
                typeof FileReader !== 'undefined' &&
                response
            ) {
                // Disable reason: FileReader should be in global scope since RN 0.54
                // eslint-disable-next-line no-undef
                const bReader = new FileReader();
                const brListener = () => {
                    sendResponse(bReader.result);
                    bReader.removeEventListener('loadend', brListener);
                };
                bReader.addEventListener('loadend', brListener);
                bReader.readAsText(response);
            } else {
                sendResponse(response);
            }
        } else {
            sendResponse('');
        }
    }

    // register our monkey-patch
    XHRInterceptor.setSendCallback(onSend);
    XHRInterceptor.setResponseCallback(onResponse);
    XHRInterceptor.enableInterception();

    let xhrObj = {};

    DeviceEventEmitter.addListener(
        'reactotron.rn-fetch-blob.setSendCallback',
        ([_method, _url, _headers, reqData]) => {
            xhrObj[_url] = {};
            xhrObj[_url]._method = _method;
            xhrObj[_url]._url = _url;
            xhrObj[_url]._headers = _headers;
            onSend(reqData, xhrObj[_url]);
        }
    );

    DeviceEventEmitter.addListener(
        'reactotron.rn-fetch-blob.setResponseCallback',
        ([taskId, respInfo, data]) => {
            const _url = respInfo.redirects[0];
            xhrObj[_url].responseHeaders = respInfo.headers;
            onResponse(
                respInfo.status,
                respInfo.timeout ? 1 : 0,
                data,
                _url,
                '',
                xhrObj[_url]
            );
        }
    );

    // DeviceEventEmitter.addListener(
    //     'simple-event.setResponseCallback',
    //     xhr => (reactotron).apiResponse({}, {
    //         body: xhr._response,
    //         status: xhr.status,
    //         headers: xhr.responseHeaders || null
    //     }, reactotron.startTimer())
    // )

    // nothing of use to offer to the plugin
    return {};
};

// DeviceEventEmitter.emit('reactotron.rn-fetch-blob.setSendCallback', [...args])
// DeviceEventEmitter.emit('reactotron.rn-fetch-blob.setResponseCallback', [taskId, respInfo, data])
