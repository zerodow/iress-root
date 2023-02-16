import Enum from '~/enum';

const TIMEOUT_REQUEST = 20000;
const TIMEOUT_GET_REQUEST = 10000;

class Base {
    constructor() {
        this.dic = {};
    }

    init(params) {
        try {
            this.dic = params;
            this.dic.isLogin = params.isLogin === 'logged';
            this.dic.isConnect = params.isConnect === 'connected';
        } catch (error) {}
    }

    // #region request base
    timeoutRequest(ms, promise) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject(new Error('timeout'));
            }, ms);
            promise.then(resolve, reject);
        });
    }

    createPromiseRequest(url, oldData) {
        return new Promise((resolve, reject) => {
            this.logDevice('info', 'get data from ' + url);
            this.timeStartRequest = new Date().getTime();

            let status = 0;

            const headerObj = {
                Authorization: `Bearer ${this.dic.accessToken}`
            };
            timeoutRequest(
                TIMEOUT_REQUEST,
                fetch(url, { headers: headerObj })
                    .then((res) => {
                        const timeReceiveRespone = new Date().getTime();
                        const timeRequest =
                            timeReceiveRespone - this.timeStartRequest;
                        this.logDevice(
                            'info',
                            `${timeRequest /
                                1000}s TO GET DATA REQUEST FROM URL: ${url} - SUCCESS`
                        );

                        status = res.status;
                        return res.text();
                    })
                    .then((resText) => {
                        let dataBody = null;
                        this.logDevice(
                            'info',
                            `GET - URL: ${url} - RESPONSE: ${resText}`
                        );
                        if (_.size(resText) === 0 || status !== 200) {
                            this.logDevice(
                                'error',
                                `FAILED - GET DATA FROM ${url} - TOKEN: ${Controller.getAccessToken()} - DATA: ${resText} - STATUS: ${status}`
                            );
                            dataBody = null;
                        } else if (resText) {
                            try {
                                dataBody = JSON.parse(resText);
                            } catch (error) {
                                dataBody = resText;
                            }
                            this.logDevice(
                                'info',
                                `SUCCESS - GET DATA FROM ${url} - TOKEN: ${Controller.getAccessToken()} - DATA: ${resText}`
                            );
                        } else {
                            this.logDevice(
                                'error',
                                `FAILED - GET DATA FROM ${url} - TOKEN: ${Controller.getAccessToken()} - DATA: ${resText}`
                            );
                            dataBody = null;
                        }

                        cw.emit('base.setDataCache', {
                            url,
                            dataBody,
                            oldData
                        });

                        resolve(dataBody);
                    })
                    .catch((errorMessage) => {
                        const timeReceiveRespone = new Date().getTime();
                        const timeRequest =
                            timeReceiveRespone - this.timeStartRequest;
                        this.logDevice(
                            'error',
                            `${timeRequest /
                                1000}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
                        );
                        this.logDevice('info', 'error get Data from: ' + url);
                        this.logDevice('info', errorMessage);
                        reject(errorMessage);
                    })
            ).catch(() => {
                this.logDevice(
                    'error: ',
                    `requestData have been cancelled - URL: ${url}`
                );
                const error = {
                    errorCode: Enum.ERROR_CODE.CANCEL_REQUEST
                };

                resolve(error);
            });
        });
    }

    handleCacheData(result, listUrl, resolve) {
        if (_.isEmpty(listUrl)) {
            this.logDevice(
                'info',
                `CACHE ==> ${(new Date().getTime() - this.timeStartRequest) /
                    1000}s TO GET DATA SUCCESS FROM CACHE: ${listUrl} - SUCCESS`
            );
            return resolve(result);
        }

        const listPromise = [];
        _.forEach(listUrl, (uri) => {
            listPromise.push(this.createPromiseRequest(uri, result));
        });
        return Promise.all(listPromise)
            .then((data) => {
                const listReturn = [];
                _.forEach(data, (iElement) => {
                    _.forEach(iElement, (eItem) => {
                        listReturn.push(eItem);
                    });
                });
                return resolve([...result, ...listReturn]);
            })
            .catch((e) => {
                return resolve([]);
            });
    }

    handleRequestData(
        oldData,
        url,
        callbackTimeout,
        byPassCache,
        resolve,
        reject
    ) {
        this.logDevice(
            'info: ',
            `CACHE ==> url: ${url} - oldData ${
                oldData ? JSON.stringify(oldData) : ''
            }`
        );

        this.timeStartRequest = new Date().getTime();

        const headerObj = {
            Authorization: `Bearer ${this.dic.accessToken}`,
            'user-agent': this.dic.userAgent
        };
        let status;
        this.timeoutRequest(
            TIMEOUT_GET_REQUEST,
            fetch(url, { headers: headerObj })
                .then((res) => {
                    const timeReceiveRespone = new Date().getTime();
                    const timeRequest =
                        timeReceiveRespone - this.timeStartRequest;
                    this.logDevice(
                        'info',
                        `${timeRequest /
                            1000}s TO GET DATA REQUEST FROM URL: ${url} - SUCCESS`
                    );
                    status = res.status;
                    return res.text();
                })
                .then((resText) => {
                    let dataBody = null;
                    const timeReceiveRespone = new Date().getTime();
                    const timeRequest =
                        timeReceiveRespone - this.timeStartRequest;
                    this.logDevice(
                        'info',
                        `${timeRequest /
                            1000}s TO GET DATA SUCCESS FROM URL: ${url} - SUCCESS - RESPONSE: ${resText}`
                    );
                    if (_.isEmpty(resText) || status !== 200) {
                        this.logDevice(
                            'error',
                            `FAILED - GET DATA FROM ${url} - TOKEN: ${this.dic.accessToken} - DATA: ${resText} - STATUS: ${status}`
                        );
                        dataBody = null;
                    } else if (resText) {
                        try {
                            dataBody = JSON.parse(resText);
                        } catch (error) {
                            dataBody = resText;
                        }
                        this.logDevice(
                            'info',
                            `SUCCESS - GET DATA FROM ${url} - TOKEN: ${this.dic.accessToken} - DATA: ${resText}`
                        );
                    } else {
                        this.logDevice(
                            'error',
                            `FAILED - GET DATA FROM ${url} - TOKEN: ${this.dic.accessToken} - DATA: ${resText}`
                        );
                        dataBody = null;
                    }

                    if (!byPassCache) {
                        cw.emit('base.setDataCache', {
                            url,
                            dataBody,
                            oldData
                        });
                    }

                    if (!url) return resolve(dataBody);
                    if (!dataBody) return resolve(oldData);
                    if (!oldData) return resolve(dataBody);

                    return resolve(
                        Array.isArray(dataBody)
                            ? [...oldData, ...dataBody]
                            : { ...oldData, ...dataBody }
                    );
                })
                .catch((errorMessage) => {
                    if (
                        errorMessage.message &&
                        errorMessage.message === 'cancelled'
                    ) {
                        this.logDevice('error', `RNFETCHBLOB CANCELED`);
                        return;
                    }
                    const timeReceiveRespone = new Date().getTime();
                    const timeRequest =
                        timeReceiveRespone - this.timeStartRequest;
                    this.logDevice(
                        'error',
                        `${timeRequest /
                            1000}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
                    );
                    reject(errorMessage);
                })
        ).catch(function (error) {
            this.logDevice(
                'error: ',
                `requestData have been cancelled - URL: ${url} -> RESEND REQUEST`
            );

            // resend request
            callbackTimeout && callbackTimeout();
        });
    }

    requestGetData(
        url,
        byPassCache = false,
        callbackTimeout = null,
        resolve,
        reject
    ) {
        this.logDevice('info', `SEND GET REQUEST: ${url} AT ${new Date()}`);
        this.timeStartRequest = new Date().getTime();
        cw.emit(
            'base.getCacheData',
            { url, byPassCache },
            ({ result, listUrl, oldData, newUrl, typeFunc }) => {
                if (typeFunc === 'handleCache') {
                    this.handleCacheData(result, listUrl, resolve);
                } else {
                    this.handleRequestData(
                        oldData,
                        newUrl || url,
                        callbackTimeout,
                        byPassCache,
                        resolve,
                        reject
                    );
                }
            }
        );
        // this.getCacheData(url, handleCache, handleRequest, byPassCache);
    }

    requestData(url, byPassCache = false) {
        return new Promise((resolve, reject) => {
            const curRequest = () =>
                this.requestGetData(
                    url,
                    byPassCache,
                    callbackTimeout,
                    resolve,
                    reject
                );

            const callbackTimeout = () => {
                // console.log('RESEND GET REQUEST', new Date(), url);
                this.logDevice(
                    'info',
                    `RESEND GET REQUEST: ${url} AT ${new Date()}`
                );
                curRequest();
            };

            curRequest();
        });
    }
    // #endregion

    // #region log func
    logDevice(type = 'info', message) {
        // cw.log('abc_logDevice', message);
        const cb = (params) => {
            try {
                const {
                    deviceId,
                    user,
                    logId,
                    environment,
                    emailLogin,
                    logChanel
                } = params;
                let textSend =
                    typeof message === 'object'
                        ? JSON.stringify(message)
                        : message;
                if (textSend === '{}' && message.message) {
                    textSend = message.message;
                }
                const currentDate = new Date();
                const timeFormat = currentDate.toString();

                textSend = `${environment} - ${timeFormat} - LogId: ${logId} - UserInfo: ${user.uid ||
                    user.user_id} - Email: ${user.email ||
                    emailLogin} - Device: ${deviceId} - Content: ${textSend}`;
                if (textSend.length && textSend.length >= 1000) {
                    textSend.slice(0, 1000);
                }
                const firstKey = uuid.v4();
                const dataSend = CryptoJS.AES.encrypt(
                    textSend,
                    firstKey
                ).toString();
                const body = {
                    id: firstKey,
                    type,
                    data: dataSend
                };

                const request = new XMLHttpRequest();
                request.open('POST', logChanel);
                request.setRequestHeader('Content-Type', 'application/json');
                request.send(JSON.stringify(body));
            } catch (error) {
                cw.log('Error when logDeviceWeb', error);
            }
        };

        cw.emit('base.logDevice', undefined, cb);
    }
    // #endregion

    // #region get func

    encodeSymbolString(str) {
        const encodeSplash = encodeURIComponent('/');
        const encodeHash = encodeURIComponent('#');
        let encodeSymbol = str.replace(new RegExp('/', 'g'), encodeSplash); // replace / -> %2F
        encodeSymbol = encodeSymbol.replace(new RegExp('#', 'g'), encodeHash); // replace / -> %2F
        return encodeSymbol;
    }

    getSymbolUrl(isSearch, isAll, symbol) {
        if (isSearch) {
            return `${this.dic.baseUrl}/${this.dic.version}/market-info/symbol/company_name?class=equity&symbol=`;
        }
        if (isAll) {
            return `${this.dic.baseUrl}/${this.dic.version}/market-info/symbol/`;
        }
        if (symbol) {
            const newTxt = this.encodeSymbolString(symbol);
            return `${this.dic.baseUrl}/${this.dic.version}/market-info/symbol/${newTxt}`;
        }
		return `${this.dic.baseUrl}/${this.dic.version}/market-info/symbol/`;
    }

    getSymbolInfo(stringQuery) {
        const strUrl = this.encodeSymbolString(stringQuery);
        if (strUrl !== '') {
            const url = `${this.getSymbolUrl(false, true)}${strUrl}`;
            this.requestData(url)
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                            const res = data[i];
                            if (res) {
                                cw.emit('base.checkAndAddToDic', res);
                            }
                        }
                    }
                    cw.emit('base.getSymbolInfo');
                })
                .catch((error) => {
                    this.logDevice('info', `GET SYMBOL INFO ERROR - ${error}`);
                    cw.emit('base.getSymbolInfo');
                });
        } else {
            cw.emit('base.getSymbolInfo');
        }
    }
    // #endregion

    groupSymbolAsExchange(params) {
        const { listSymbol, symbolEquity } = params;
        const MAX_LENGTH_URL = 1000;
        const newObj = {};
        _.forEach(symbolEquity, (value, symbol) => {
            if (value.exchanges) {
                newObj[symbol] = value.exchanges[0];
            }
        });

        const result = {};
        _.forEach(listSymbol, (symbol) => {
            const exchange = newObj[symbol];
            if (!exchange) return;
            if (!result[exchange]) {
                result[exchange] = {
                    symbols: [],
                    symbolsAsUrl: []
                };
            }
            const { symbols } = result[exchange];
            if (!_.find(symbols, symbol)) {
                result[exchange].symbols.push(symbol);
            }
        });
        _.forEach(result, ({ symbols }, exchange) => {
            const listSymbolAsUrl = [];
            let stringUrl = '';
            _.forEach(symbols, (symbol) => {
                let cursymbol = symbol;

                if (exchange === 'ASX') {
                    cursymbol = `${cursymbol}.ASX`;
                }

                const newStringUrl =
                    stringUrl !== '' ? stringUrl + ',' + cursymbol : cursymbol;

                if (_.size(newStringUrl) < MAX_LENGTH_URL) {
                    stringUrl = newStringUrl;
                } else {
                    listSymbolAsUrl.push(stringUrl);
                    stringUrl = cursymbol;
                }
            });
            listSymbolAsUrl.push(stringUrl);

            result[exchange].symbolsAsUrl = listSymbolAsUrl;
        });
        cw.emit('base.groupSymbolAsExchange', result);
    }
}

base = new Base();
