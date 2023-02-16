import { connect } from 'react-redux';
import _ from 'lodash';

import { StreamingAllMarket as AllMarket } from './allMarket';
import streamActions from './reducer';
import * as Api from '~/api'

class Lv2Streaming extends AllMarket {
    constructor(props) {
        super(props);
        this.dicRealtime = {};
    }

    async getSnapshot(props) {
        const { listSymbol } = props || this.props;
        if (_.isEmpty(listSymbol)) return;
        this.listChannelInfo = await this.groupSymbolAsExchange(listSymbol);
        this.getLv2Snapshot();
    }

    getLv1Snapshot() { }

    getLv2Snapshot() {
        this.onChangeLoadingState(true);
        super.getLv2Snapshot(() => {
            this.onChangeLoadingState(false);
        });
    }
    getCosSnapshot() { }

    onData(data) {
        if (!_.isEmpty(data)) {
            const { symbol, exchange } = data;
            const key = symbol + exchange;
            this.dicRealtime[key] = data
        }
    }

    async createConnect(props) {
        const { listSymbol } = props || this.props;
        if (_.isEmpty(listSymbol) || !listSymbol[0]) return;
        this.listChannelInfo = await this.groupSymbolAsExchange(listSymbol);

        const arrURL = this.getArrUrl(this.listChannelInfo);
        _.forEach(arrURL, (eachParam) => {
            const url = Api.getLv2StreamingUrl1(`${eachParam}`);
            this.createNchanConnecter(url, Math.random());
        });

        this.interRealtime && clearInterval(this.interRealtime);
        this.interRealtime = setInterval(() => {
            if (this.snapping || _.isEmpty(this.dicRealtime)) return;
            const listData = []
            _.forEach(
                this.dicRealtime,
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
            this.props.changeDepthData(listData);
            this.dicRealtime = {};
        }, 1000);
    }
}

const mapDispatchToProps = (dispatch) => ({
    changeQuoteData: () => null,
    changeDepthData: (...p) => dispatch(streamActions.changeDepthData(...p)),
    changeTradesData: () => null
});

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(
    Lv2Streaming
);
