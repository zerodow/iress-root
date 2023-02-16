import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as FunctionUtil from '~/lib/base/functionUtil';
import Flashing from '~/component/flashing/flashing.2';
import Enum from '~/enum';
import I18n from '@module/language/'

const { PRICE_DECIMAL, TYPE_FORM_REALTIME } = Enum;

export class LastTradeInfo extends PureComponent {
    renderTradePrice() {
        const { trade_price: tradePrice } = this.props.priceObject;
        return (
            <Flashing
                isFromWatchList
                isLoading={false}
                value={tradePrice}
                textStyle={{ fontSize: CommonStyle.fontSizeXS }}
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
                        fontSize: CommonStyle.fontSizeXS,
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
                        flex: 1,
                        marginLeft: -4,
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
                            fontSize: CommonStyle.fontSizeXS,
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
                        fontSize: CommonStyle.fontSizeXS,
                        fontWeight: 'bold',
                        color
                    }
                ]}
            >
                {` (${title})`}
            </Text>
        );
    }

    renderBidPrice() {
        const { bid_price: bidPrice } = this.props.priceObject;
        return (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={[CommonStyle.textAlert, { marginRight: 4 }]}>{I18n.t('bidPrice')}</Text>
                <View style={{ flex: 1 }}>
                    <Flashing
                        isFromWatchList
                        isLoading={false}
                        value={bidPrice}
                        textStyle={{ fontSize: CommonStyle.fontSizeXS }}
                        typeFormRealtime={TYPE_FORM_REALTIME.PRICE_SEARCH_DETAIL}
                    />
                </View>
            </View>
        );
    }

    renderAskPrice() {
        const { ask_price: askPrice } = this.props.priceObject;
        return (
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Text style={[CommonStyle.textAlert, { textAlign: 'right', marginRight: 8 }]}>{I18n.t('offerPrice')}</Text>
                <View>
                    <Flashing
                        isFromWatchList
                        isLoading={false}
                        value={askPrice}
                        textStyle={{ fontSize: CommonStyle.fontSizeXS }}
                        typeFormRealtime={TYPE_FORM_REALTIME.PRICE_SEARCH_DETAIL_2}
                    />
                </View>
            </View>
        );
    }

    render() {
        return <React.Fragment>
            <View style={{ flexDirection: 'row', marginTlop: 8 }}>
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    {this.renderLastTradeAndVolume()}
                </View>

                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    {this.renderChangePoint({ fontSize: CommonStyle.fontSizeXS })}
                    {this.renderChangePercent({ fontSize: CommonStyle.fontSizeXS })}
                </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {this.renderBidPrice()}
                {this.renderAskPrice()}
            </View>
        </React.Fragment>
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
