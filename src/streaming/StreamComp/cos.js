import { connect } from 'react-redux';
import _ from 'lodash';
import uuid from 'react-native-uuid';

import { StreamingAllMarket as AllMarket } from './allMarket';
import * as Api from '~/api';
import streamActions from './reducer';
import { mapDataLv1 } from '../all_market';

class CosStreaming extends AllMarket {
    constructor(props) {
        super(props);
        this.dicRealtime = {};
        // this.snapping = false;
        this.id = uuid.v4();
    }

    componentWillUnmount() {
        this.unSubAll();

        this.interRealtime && clearInterval(this.interRealtime);
    }

    async getSnapshot(props) {
        const { listSymbol } = props || this.props;
        if (_.isEmpty(listSymbol)) return;
        this.listChannelInfo = await this.groupSymbolAsExchange(listSymbol);
        this.getCosSnapshot();
    }

    getLv1Snapshot() {}
    getLv2Snapshot() {}

    getCosSnapshot() {
        this.onChangeLoadingState(true);
        super.getCosSnapshot(() => {
            this.onChangeLoadingState(false);
        });
    }

    onData(data) {
        if (!_.isEmpty(data)) {
            // const decodeQuote = mapDataLv1(data);
            // const { symbol } = decodeQuote;
            const { symbol, exchange } = data;
            const key = symbol + exchange;
            this.dicRealtime[key] = _.merge(
                this.dicRealtime && this.dicRealtime[key],
                data
            );
        }
    }

    async createConnect(props) {
        const { listSymbol } = props || this.props;
        if (_.isEmpty(listSymbol) || !listSymbol[0]) return;
        this.listChannelInfo = await this.groupSymbolAsExchange(listSymbol);

        const arrURL = this.getArrUrl(this.listChannelInfo);
        _.forEach(arrURL, (eachParam) => {
            const url = Api.getCosStreamingUrl1(`${eachParam}`);
            this.createNchanConnecter(url, Math.random());
        });

        this.interRealtime && clearInterval(this.interRealtime);
        this.interRealtime = setInterval(() => {
            if (this.snapping || _.isEmpty(this.dicRealtime)) return;
            this.props.changeTradesData(_.values(this.dicRealtime), true);
            this.dicRealtime = {};
        }, 1000);
    }
}

const mapDispatchToProps = (dispatch) => ({
    changeQuoteData: () => null,
    changeDepthData: () => null,
    changeTradesData: (...p) => dispatch(streamActions.changeTradesData(...p))
});

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(
    CosStreaming
);
