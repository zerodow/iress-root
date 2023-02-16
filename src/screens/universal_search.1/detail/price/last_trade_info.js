import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as FunctionUtil from '~/lib/base/functionUtil';
import Flashing from '~/component/flashing/flashing.2';
import Enum from '~/enum';

const { PRICE_DECIMAL, TYPE_FORM_REALTIME } = Enum;

export class LastTradeInfo extends PureComponent {
    renderTradePrice() {
        const { trade_price: tradePrice } = this.props.priceObject;
        return (
            <Flashing
                isFromWatchList
                isLoading={false}
                value={tradePrice}
                textStyle={{ fontSize: CommonStyle.fontSizeM }}
                typeFormRealtime={TYPE_FORM_REALTIME.PRICE_SEARCH_DETAIL}
            />
        );
    }
    renderTradeSize() {
        // const { trade_size: tradeSide } = this.props.priceObject;
        const { trade_size: tradeSide } = this.props.priceObject;
        let title = '--';
        if (tradeSide) {
            title = FunctionUtil.formatNumber(tradeSide, PRICE_DECIMAL.PRICE);
        }
        return (
            <Text
                style={[
                    CommonStyle.textSubNumber,
                    {
                        marginRight: -4,
                        fontSize: CommonStyle.fontSizeM,
                        fontWeight: 'bold'
                    }
                ]}
            >
                {title}
            </Text>
        );
    }

    renderLastTradeAndVolume() {
        const { trade_price: tradePrice } = this.props.priceObject;
        return (
            <View
                style={[
                    {
                        marginLeft: -4,
                        flex: 1,
                        flexDirection: 'row'
                    }
                ]}
            >
                {this.renderTradePrice()}
                <Text
                    style={{
                        color: CommonStyle.fontColor,
                        paddingLeft: tradePrice ? 4 : 0,
                        fontWeight: 'bold'
                    }}
                >{` @ `}</Text>
                {this.renderTradeSize()}
            </View>
        );
    }

    renderChangePoint() {
        const {
            change_point: changePoint,
            trade_price: tradePrice
        } = this.props.priceObject;

        let content = null;
        let color = CommonStyle.todayChangeEqualTextColor;
        if (changePoint > 0) {
            content = (
                <CommonStyle.icons.arrowUp
                    name="md-arrow-dropup"
                    color={CommonStyle.fontGreen}
                    style={[
                        CommonStyle.iconPickerUp,
                        { color: CommonStyle.fontGreen, marginRight: 5 }
                    ]}
                />
            );
            color = CommonStyle.todayChangeUpTextColor;
        }
        if (changePoint < 0) {
            content = (
                <CommonStyle.icons.arrowDown
                    name="md-arrow-dropdown"
                    color={CommonStyle.fontRed}
                    style={[
                        CommonStyle.iconPickerDown,
                        {
                            color: CommonStyle.fontRed,
                            marginRight: 2
                        }
                    ]}
                />
            );
            color = CommonStyle.todayChangeDownTextColor;
        }

        let title = '--';
        if (tradePrice) {
            title = FunctionUtil.formatNumberNew2(
                changePoint,
                PRICE_DECIMAL.PRICE
            );
        }

        return (
            <View style={{ flexDirection: 'row' }}>
                {content}
                <Text
                    style={[
                        CommonStyle.textSubNumber,
                        {
                            fontSize: CommonStyle.fontSizeS,
                            fontWeight: 'bold',
                            color
                        }
                    ]}
                >
                    {title}
                </Text>
            </View>
        );
    }

    renderChangePercent() {
        const {
            change_percent: changePercent,
            trade_price: tradePrice
        } = this.props.priceObject;
        let color = CommonStyle.todayChangeEqualTextColor;
        if (changePercent > 0) {
            color = CommonStyle.todayChangeUpTextColor;
        }
        if (changePercent < 0) {
            color = CommonStyle.todayChangeDownTextColor;
        }

        let title = '--';
        if (tradePrice) {
            title = `${FunctionUtil.formatNumberNew2(
                changePercent,
                PRICE_DECIMAL.PERCENT
            )}%`;
        }
        return (
            <Text
                testID={`newOrderSearchBarText`}
                style={[
                    CommonStyle.textSubNumber,
                    {
                        fontSize: CommonStyle.fontSizeS,
                        fontWeight: 'bold',
                        color
                    }
                ]}
            >
                {` (${title})`}
            </Text>
        );
    }

    render() {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                {this.renderLastTradeAndVolume()}
                <View style={{ flexDirection: 'row' }}>
                    {this.renderChangePoint()}
                    {this.renderChangePercent()}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state, { symbol, exchange }) => {
    if (!symbol || !exchange) return { priceObject: {} };

    const { marketData } = state.streamMarket;
    const { quote = {} } =
        (marketData && marketData[exchange] && marketData[exchange][symbol]) ||
        {};
    return {
        priceObject: quote
    };
};

export default connect(mapStateToProps)(LastTradeInfo);
