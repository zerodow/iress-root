import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import CommonStyle from '~/theme/theme_controller';
import * as FunctionUtil from '~/lib/base/functionUtil';
import Flashing from '~s/watchlist/Animator/Flashing';
import Enum from '~/enum';
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'

const { PRICE_DECIMAL, TYPE_FORM_REALTIME } = Enum;

export class LastTradeInfo extends PureComponent {
    renderTradePrice() {
        const { trade_price: tradePrice } = this.props.priceObject;
        // const value = this.props.isLoading ? '--' : tradePrice
        return (
            <ViewLoading
                isLoading={this.props.isLoading}
                forceStyle={{ alignSelf: 'center' }}
            >
                <Flashing
                    isFromWatchList
                    keyExtra={this.props.symbol}
                    isLoading={false}
                    value={tradePrice}
                    textStyle={{ fontSize: CommonStyle.fontSizeM }}
                    typeFormRealtime={TYPE_FORM_REALTIME.PRICE_SEARCH_DETAIL}
                />
            </ViewLoading>
        );
    }
    renderTradeSize() {
        const { isLoading } = this.props
        const { trade_size: tradeSide } = this.props.priceObject;
        let title = '--';
        if (tradeSide) {
            title = FunctionUtil.formatNumber(tradeSide, PRICE_DECIMAL.IRESS_PRICE);
        }
        return (
            <TextLoading
                isLoading={isLoading}
                style={[
                    CommonStyle.textSubNumber,
                    {
                        fontSize: CommonStyle.fontSizeM,
                        fontWeight: 'bold'
                    }
                ]}
            >
                {title}
            </TextLoading >
        );
    }

    renderChangePoint() {
        const { isLoading } = this.props
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
                        {
                            color: CommonStyle.fontGreen,
                            marginRight: 5,
                            alignSelf: 'center'
                        }
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
                            marginRight: 2,
                            alignSelf: 'center'
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
                PRICE_DECIMAL.IRESS_PRICE
            );
        }

        if (isLoading) {
            content = null;
        }

        return (
            <View style={{ flexDirection: 'row' }}>
                {content}
                <TextLoading
                    isLoading={isLoading}
                    style={[
                        CommonStyle.textSubNumber,
                        {
                            fontSize: CommonStyle.fontSizeS,
                            color,
                            fontFamily: CommonStyle.fontPoppinsRegular
                        }
                    ]}
                >
                    {title}
                </TextLoading>
            </View>
        );
    }

    renderChangePercent() {
        const {
            change_percent: changePercent,
            trade_price: tradePrice
        } = this.props.priceObject;
        const { isLoading } = this.props
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
            <TextLoading
                isLoading={isLoading}
                testID={`newOrderSearchBarText`}
                containerStyle={{
                    marginLeft: isLoading ? 8 : undefined
                }}
                containerStyle={{
                    alignSelf: 'center'
                }}
                style={[
                    CommonStyle.textSubNumber,
                    {
                        fontSize: CommonStyle.fontSizeS,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        color
                    }
                ]}
            >
                {` (${title})`}
            </TextLoading>
        );
    }

    render() {
        return (
            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    flex: 1
                }}
            >
                {this.renderTradePrice()}
                <View style={{ flexDirection: 'row', flex: 1, paddingLeft: 8 }}>
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
    const isLoading = state.watchlist3.detailLoading
    return {
        priceObject: quote,
        isLoading
    };
};

export default connect(mapStateToProps)(LastTradeInfo);

export class LastTradeInfo2 extends LastTradeInfo {
    render() {
        return (
            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    flex: 1
                }}
            >
                <View style={{ width: 8 }} />
                {this.renderTradePrice()}
                <View style={{ width: 8 }} />
                {this.renderChangePoint()}
                {this.renderChangePercent()}
            </View>
        );
    }
}

export const MiniLastTradeInfo =
    connect((state, { symbol, exchange }) => {
        if (!symbol || !exchange) return { priceObject: {} };

        const { marketData } = state.streamMarket;
        const { quote = {} } =
            (
                marketData &&
                marketData[exchange] &&
                marketData[exchange][symbol]
            ) || {};
        const isLoading = state.watchlist3.detailLoading
        return {
            priceObject: quote,
            isLoading
        };
    })(LastTradeInfo2);
