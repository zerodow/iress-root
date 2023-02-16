import React, { Component } from 'react';
import _ from 'lodash';

import { func, dataStorage } from '~/storage';
import Nchan from '~/nchan.1';
import * as StreamingBusiness from '../streaming_business';
import * as Controller from '../../memory/controller';
import { getSymbolInfoApi } from '~/lib/base/functionUtil';

const FAKE = false;
export const MAX_LENGTH_URL = 1000;

export default class Connect extends Component {
    constructor(props) {
        super(props);
        this.nchanConnected = {};
        this.onChangeNetwork = this.onChangeNetwork.bind(this);
        this.onData = this.onData.bind(this);
        this.onError = this.onError.bind(this);
        this.getSnapshot = this.getSnapshot.bind(this);
        this.dicNchanConnected = {};
        // if (!!props.listSymbol && !!props.listSymbol[0]) {
        //     this.onChangeLoadingState(true);
        // } else {
        //     this.onChangeLoadingState(false);
        // }
        this.sub(props);
    }

    componentWillReceiveProps(nextProps) {
        if (_.isEqual(this.props.listSymbol, nextProps.listSymbol)) return;
        this.unSubAll();
        this.sub(nextProps);
    }

    componentWillUnmount() {
        console.log('DCM BASE CONNECT UNMOUNT');
        this.unSubAll();
    }

    getSymbolInfo(listSymbol) {
        return new Promise((resolve) => {
            let stringQuery = '';
            _.forEach(listSymbol, ({ symbol, exchange }) => {
                const strCheck = symbol + '#' + exchange;
                if (!dataStorage.symbolEquity[strCheck]) {
                    stringQuery += symbol + '.' + exchange + ',';
                }
            });
            if (stringQuery) {
                stringQuery = stringQuery.replace(/.$/, '');
            }
            getSymbolInfoApi(stringQuery, resolve);
        });
    }

    async groupSymbolAsExchange(listSymbol) {
        const result = {};

        await this.getSymbolInfo(listSymbol);
        _.forEach(listSymbol, ({ symbol, exchange }) => {
            if (!exchange || !symbol) return;
            if (!result[exchange]) {
                result[exchange] = {
                    symbols: [],
                    symbolsAsUrl: [],
                    symbolsAsUrlWithExchange: []
                };
            }
            const { symbols } = result[exchange];
            if (!_.find(symbols, symbol)) {
                result[exchange].symbols.push(symbol);
            }
        });
        _.forEach(result, ({ symbols }, exchange) => {
            const listSymbolAsUrl = [];
            const listSymbolAsUrlWithExchange = [];

            let stringUrl = '';
            let stringUrlWithExchange = '';
            _.forEach(symbols, (symbol) => {
                let cursymbol = symbol;
                let cursymbolWithExchange = symbol;

                // if (exchange === 'ASX') {
                //     cursymbolWithExchange = `${cursymbol}.ASX`;
                // }
                cursymbolWithExchange = `${cursymbol}.${exchange}`;

                const newStringUrl =
                    stringUrl !== '' ? stringUrl + ',' + cursymbol : cursymbol;

                const newStringUrlWithExchange =
                    stringUrlWithExchange !== ''
                        ? stringUrlWithExchange + ',' + cursymbolWithExchange
                        : cursymbolWithExchange;

                if (_.size(newStringUrl) < MAX_LENGTH_URL) {
                    stringUrl = newStringUrl;
                } else {
                    listSymbolAsUrl.push(stringUrl);
                    stringUrl = cursymbol;
                }

                if (_.size(newStringUrlWithExchange) < MAX_LENGTH_URL) {
                    stringUrlWithExchange = newStringUrlWithExchange;
                } else {
                    listSymbolAsUrlWithExchange.push(stringUrlWithExchange);
                    stringUrlWithExchange = cursymbolWithExchange;
                }
            });

            listSymbolAsUrl.push(stringUrl);
            listSymbolAsUrlWithExchange.push(stringUrlWithExchange);

            result[exchange].symbolsAsUrl = listSymbolAsUrl;
            // eslint-disable-next-line standard/computed-property-even-spacing
            result[
                exchange
            ].symbolsAsUrlWithExchange = listSymbolAsUrlWithExchange;
        });

        return result;
    }

    onChangeNetwork(isConnected) {
        isConnected && this.getSnapshot(this.props);
    }

    fakeData() {
        this.props.onOpen && this.props.onOpen();

        setTimeout(() => {
            setInterval(() => {
                const result = this.createFakeData();
                this.onData(result);
            }, 100);
        }, 3000);
    }

    sub = this.sub.bind(this);
    async sub(props = this.props) {
        await this.getSnapshot(props);

        const isStreaming = Controller.isPriceStreaming();
        if (!isStreaming) return;

        if (FAKE) {
            this.fakeData(props);
        } else {
            this.createConnect(props);
        }
    }

    unSubAll = this.unSubAll.bind(this);
    unSubAll() {
        _.forEach(this.nchanConnected, (value, key) => {
            this.unSubWithKey(key);
        });
        listSymbolSub = {};
    }

    unSubWithKey(key) {
        if (this.nchanConnected[key]) {
            this.nchanConnected[key].close();
            this.nchanConnected[key] = null;
        }
    }

    createNchanConnecter(url, key) {
        const onConnect = () => {
            this.nchanConnected[key] = newChan;
            this.onConnect();
        };

        const newChan = new Nchan({
            url,
            fnGetOption: StreamingBusiness.getOptionStream,
            onData: this.onData,
            timeout: 20000,
            reconnectTime: 1000,
            onConnect,
            onError: this.onError,
            onChangeNetwork: this.onChangeNetwork
        });
        return newChan;
    }

    getArrUrl(listChannelInfo) {
        const arrUrl = [];
        let curStr = '';
        _.forEach(listChannelInfo, ({ symbolsAsUrlWithExchange }) => {
            _.forEach(symbolsAsUrlWithExchange, (item) => {
                let newStr = '';
                if (curStr) {
                    newStr = curStr + ',' + item;
                } else {
                    newStr = item;
                }

                if (_.size(newStr) > MAX_LENGTH_URL) {
                    arrUrl.push(curStr);
                    curStr = item;
                } else {
                    curStr = newStr;
                }
            });
        });

        if (curStr) {
            arrUrl.push(curStr);
        }

        return arrUrl;
    }

    getSnapshot() {
        // get all snap when reconnected or new sub
    }
    createFakeData() {
        // use fake data instead data get from server
    }
    onData() {
        // handle data response from nchan callback
    }
    onConnect() {
        // handle data on all nchan connected
    }
    onError() { }

    createConnect = this.createConnect.bind(this);
    createConnect() {
        // custom connection
    }

    onChangeLoadingState(state) {
        this.props.onChangeLoadingState &&
            this.props.onChangeLoadingState(state);
    }

    render() {
        return null;
    }
}
