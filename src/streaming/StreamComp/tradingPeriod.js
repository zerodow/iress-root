import { connect } from 'react-redux';
import _ from 'lodash';
import uuid from 'react-native-uuid';

import { StreamingAllMarket as AllMarket } from './allMarket';
import * as Api from '~/api';
import streamActions from './reducer';

class TradingPeriod extends AllMarket {
    async getSnapshot(props) {
        const { listSymbol, changeTradingPeriodData } = props || this.props;
        if (_.isEmpty(listSymbol)) return;
        const objExchange = {};
        _.forEach(listSymbol, ({ symbol, exchange }) => {
            objExchange[exchange] = symbol;
        });

        const listPromise = [];
        _.forEach(objExchange, (symbol, exchange) => {
            const url = Api.getUrlTradingPeriod(exchange, symbol);
            listPromise.push(
                new Promise((resolve) => {
                    Api.requestData1(url)
                        .then(resolve)
                        .catch(() => resolve([]));
                })
            );
        });
        Promise.all(listPromise).then((response) => {
            changeTradingPeriodData(response);
        });
    }

    getLv1Snapshot() {}
    getLv2Snapshot() {}
    getCosSnapshot() {}

    async createConnect(props) {}
}

const mapDispatchToProps = (dispatch) => ({
    changeTradingPeriodData: (...p) =>
        dispatch(streamActions.changeTradingPeriodData(...p))
});

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(
    TradingPeriod
);
