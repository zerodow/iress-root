import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import NewAlertButton from '~s/watchlist/Detail/components/NewAlertButton';
import LastTradeInfo from '~s/watchlist/Detail/components/LastTradeInfo';
import BuySellButton from '~s/watchlist/Detail/components/BuySellButton';
import {
    Lv1 as StreamingLv1,
    Chart as ChartPrice
} from '~/streaming/StreamComp';
import CommonStyle, { register } from '~/theme/theme_controller';
import News from '~/screens/watchlist/handle_news_data';

export class PriceDetailHeader extends PureComponent {
    render() {
        const { symbol, exchange, navigator } = this.props;
        return (
            <React.Fragment>
                {this.props.isReady ? null : <StreamingLv1 listSymbol={[symbol]} />}
                {this.props.isReady ? null : <ChartPrice listSymbol={[symbol]} />}
                {
                    this.props.subNews ? <News listSymbol={[symbol]} /> : null
                }
                <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
                    <NewAlertButton navigator={navigator} symbol={symbol} exchange={exchange} />
                    <LastTradeInfo symbol={symbol} exchange={exchange} isLoading={this.props.isLoading} />
                </View>
                <View style={{ padding: 16, borderBottomColor: CommonStyle.borderColor, borderBottomWidth: 1 }}>
                    <BuySellButton
                        symbol={symbol}
                        exchange={exchange}
                        onAuth={this.props.onAuth}
                    />
                </View>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        isLoading: state.searchDetail.isLoading
    };
}

export default connect(
    mapStateToProps
)(PriceDetailHeader);
