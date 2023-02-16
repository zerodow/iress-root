import _ from 'lodash';
import { connect } from 'react-redux';

import * as Api from '~/api';
import { mapDataLv1 } from '../all_market';
import streamActions from './reducer';
import * as Business from '~/business';

import BaseConnecter from './baseConnect';

export class StreamingAllMarket extends BaseConnecter {
    onData(data) {
        const {
            quote = {},
            depth = {},
            trades = {},
            symbol = '',
            exchange = ''
        } = data || {};
        if (!_.isEmpty(quote)) {
            const decodeQuote = mapDataLv1(quote);
            this.props.changeQuoteData([decodeQuote]);
        }

        if (!_.isEmpty(depth)) {
            const obj = {
                symbol,
                exchange,
                updated: new Date().getTime(),
                Bid: depth.bid || depth.Bid || [],
                Ask: depth.ask || depth.Ask || []
            };
            this.props.changeDepthData([obj]);
        }
        if (!_.isEmpty(trades)) {
            const obj = {
                symbol,
                exchange,
                data: trades
            };
            this.props.changeTradesData([obj]);
        }

        this.props.onSuccess && this.props.onSuccess();
    }

    baseGetSnapshot(
        getUrl = () => '',
        onSuccess = () => null,
        onFailure = () => null
    ) {
        const listPromise = [];
        _.forEach(this.listChannelInfo, ({ symbolsAsUrl }, exchange) => {
            _.forEach(symbolsAsUrl, (str) => {
                const url = getUrl(exchange, str.replace(/\.ASX/g, ''));
                listPromise.push(
                    new Promise((resolve) => {
                        Api.requestData1(url)
                            .then(resolve)
                            .catch(() => resolve([]));
                    })
                );
            });
        });
        Promise.all(listPromise)
            .then((response) => {
                onSuccess(response);
            })
            .catch(onFailure);
    }

    getLv1Snapshot(cb) {
        const getUrl = (exchange, str) => Api.getLv1Snapshot(exchange, str);

        const onSuccess = (response) => {
            let listData = _.flatten(response);
            // Fake Favorites priceboard
            // listData.map((item, index) => {
            //     const { symbol, exchange } = item
            //     if (symbol === 'ANZ' && exchange === 'ASX') {
            //         listData[index] = Business.fakePrice()
            //     }
            // })
            this.props.changeQuoteData(listData);
            cb && cb();
        };
        this.baseGetSnapshot(getUrl, onSuccess);
    }

    getLv2Snapshot(cb) {
        const getUrl = (exchange, str) => {
            return Api.getLv2Snapshot(exchange, str);
        };
        const onSuccess = (response) => {
            const listData = [];
            _.forEach(
                response,
                (value) =>
                    value &&
                    value.symbol &&
                    listData.push({
                        symbol: value.symbol,
                        exchange: value.exchange,
                        updated: value.updated,
                        Bid: _.values(value.bid),
                        Ask: _.values(value.ask)
                    })
            );

            !_.isEmpty(listData) && this.props.changeDepthData(listData);
            cb && cb();
        };

        this.baseGetSnapshot(getUrl, onSuccess);
    }

    getCosSnapshot() {
        const getUrl = (exchange, str) => Api.getCosSnapshot(exchange, str);
        const onSuccess = (response) => {
            const listData = [];
            _.forEach(response, (value) => listData.push(value));

            this.props.changeTradesData(listData);
        };

        this.baseGetSnapshot(getUrl, onSuccess);
    }

    async getSnapshot(props) {
        const { listSymbol } = props || this.props;
        if (_.isEmpty(listSymbol) || !listSymbol[0]) return;
        this.listChannelInfo = await this.groupSymbolAsExchange(listSymbol);

        const getUrl = (exchange, str) =>
            Api.getPriceAOIUrl(exchange, listSymbol[0]);

        const onSuccess = (response) => {
            this.onData(response[0] && response[0][0]);
        };
        this.baseGetSnapshot(
            getUrl,
            onSuccess,
            this.props.onSuccess && this.props.onSuccess
        );
    }

    onConnect() {
        const nchanLength = _.size(this.nchanConnected);
        const listchannelLength = _.size(this.listChannelInfo);
        if (nchanLength === listchannelLength) {
            this.props.onOpen && this.props.onOpen();
        }
    }

    createConnect() {
        // _.forEach(
        //     this.listChannelInfo,
        //     ({ symbolsAsUrlWithExchange }, exchange) => {
        //         const url = Api.getAllStreamingMarketUrl(
        //             symbolsAsUrlWithExchange
        //         );
        //         this.createNchanConnecter(url, exchange);
        //     }
        // );

        const arrURL = this.getArrUrl(this.listChannelInfo);
        _.forEach(arrURL, (eachParam) => {
            const url = Api.getAllStreamingMarketUrl(`${eachParam}`);
            this.createNchanConnecter(url, Math.random());
        });
    }
}

const mapDispatchToProps = (dispatch) => ({
    changeQuoteData: (...p) => dispatch(streamActions.changeQuoteData(...p)),
    changeDepthData: (...p) => dispatch(streamActions.changeDepthData(...p)),
    changeTradesData: (...p) => dispatch(streamActions.changeTradesData(...p))
});

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(
    StreamingAllMarket
);
