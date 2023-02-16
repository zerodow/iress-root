import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import Chart from '~s/watchlist/DetailChart';
import Info from '~s/watchlist/Detail/components/TradeInfo';
import {
    Lv1 as StreamingLv1,
    Chart as ChartPrice
} from '~/streaming/StreamComp';
import CommonStyle, { register } from '~/theme/theme_controller';

export class PriceDetail extends PureComponent {
    render() {
        const { symbol, exchange, navigator } = this.props;
        return (
            <React.Fragment>
                <Chart
                    symbol={symbol}
                    exchange={exchange}
                />
                <View style={{ paddingLeft: 16 }}>
                    <Info symbol={symbol} exchange={exchange} />
                </View>
            </React.Fragment>
        );
    }
}

export default PriceDetail;
