import { connect } from 'react-redux';
import _ from 'lodash';
import uuid from 'react-native-uuid';

import { StreamingAllMarket as AllMarket } from './allMarket';
import * as Api from '~/api';
import streamActions from './reducer';

class Lv1Streaming extends AllMarket {
    constructor(props) {
        super(props);
        this.dicRealtime = {};
        this.id = uuid.v4();
    }

    componentWillUnmount() {
        this.unSubAll();

        this.interRealtime && clearInterval(this.interRealtime);
    }

    async getSnapshot(props) {
        return new Promise(async resolve => {
            const { listSymbol } = props || this.props;
            if (_.isEmpty(listSymbol)) return resolve();
            console.log('DCM getSnapshot', listSymbol);
            this.listChannelInfo = await this.groupSymbolAsExchange(listSymbol);
            this.getLv1Snapshot(resolve);
        })
    }

    getLv1Snapshot(resolve) {
        this.snapping = true;
        this.onChangeLoadingState(true);
        super.getLv1Snapshot(() => {
            resolve && resolve()
            this.snapping = false;
            this.onChangeLoadingState(false);
        });
    }

    getLv2Snapshot() { }
    getCosSnapshot() { }

    onData(data) {
        if (!_.isEmpty(data)) {
            const { symbol, exchange } = data;
            // const { symbol } = data;
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
            const url = Api.getLv1StreamingUrl(`${eachParam}`);
            this.createNchanConnecter(url, Math.random());
        });

        this.interRealtime && clearInterval(this.interRealtime);
        this.interRealtime = setInterval(() => {
            if (this.snapping || _.isEmpty(this.dicRealtime)) return;
            this.props.changeQuoteData(_.values(this.dicRealtime), true);
            this.dicRealtime = {};
        }, 1000);
    }
}

const mapDispatchToProps = (dispatch) => ({
    changeQuoteData: (...p) => dispatch(streamActions.changeQuoteData(...p)),
    changeDepthData: () => null,
    changeTradesData: () => null
});

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(
    Lv1Streaming
);
