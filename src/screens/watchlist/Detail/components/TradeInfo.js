import React from 'react';
import { View, Text } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';

import SecurityDetails from '~s/alert_function/alert_security_details';
import * as Business from '~/business';
import CommonStyle from '~/theme/theme_controller';
import * as FunctionUtil from '~/lib/base/functionUtil';
import Base from '~/component/loading_component/text.1';
import ENUM from '~/enum';
import { ScrollView } from 'react-native-gesture-handler';

const { PRICE_DECIMAL } = ENUM;

class TextLoading extends Base {
    render() {
        if (this.props.isLoading) {
            return this.renderLoadingState();
        }

        return (
            <View>
                <Text {...this.props} />
            </View>
        );
    }
}

class TradeInfo extends SecurityDetails {
    formatText({ value, isLoading, keyObj, label }) {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Text style={CommonStyle.textAlert}>{label}</Text>
                <TextLoading
                    isLoading={this.dic.isLoading}
                    styleViewLoading={{
                        alignSelf: 'flex-start',
                        marginBottom: 4
                    }}
                    formatTextAbs={'00.0000'}
                    style={[
                        CommonStyle.textSubDark,
                        {
                            fontSize: CommonStyle.font11,
                            color: CommonStyle.fontWhite
                        }
                    ]}
                >
                    {this.dic.isLoading
                        ? '00.0000'
                        : value === undefined || value === null
                            ? '--'
                            : value}
                </TextLoading>
            </View>
        );
    }

    formatPrice({ value, isLoading, keyObj, label, isLargeValue = false, decimal = PRICE_DECIMAL.IRESS_PRICE }) {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Text
                    style={[
                        CommonStyle.textAlert,
                        { fontSize: CommonStyle.font11 }
                    ]}
                >
                    {label}
                </Text>
                <TextLoading
                    isLoading={isLoading}
                    styleViewLoading={{
                        alignSelf: 'flex-start',
                        marginBottom: 4
                    }}
                    formatTextAbs={'00.0000'}
                    style={[
                        CommonStyle.textnumberNewAlert,
                        {
                            fontSize: CommonStyle.font11,
                            color: CommonStyle.fontWhite
                        }
                    ]}
                >
                    {isLoading
                        ? ''
                        : value[keyObj] === undefined || value[keyObj] === null
                            ? '--'
                            : isLargeValue
                                ? `${FunctionUtil.largeValue(value[keyObj])}`
                                : `${FunctionUtil.formatNumberNew2(
                                    value[keyObj],
                                    decimal
                                )}`}
                </TextLoading>
            </View>
        );
    }

    componentWillReceiveProps(nextProps) {
        const { symbol: curSymbol, exchange: curExchange } = this.props;
        const { symbol, exchange } = nextProps;
        if (
            !_.isEqual(this.props.quote, nextProps.quote) ||
            !_.isEqual(this.props.symbolClass, nextProps.symbolClass) ||
            !_.isEqual(this.props.displayName, nextProps.displayName)
        ) {
            const quote = nextProps.quote || {};
            this.dic.priceObject = {
                ...quote,
                symbolClass: nextProps.symbolClass,
                displayName: nextProps.displayName
            };
        }

        if (!_.isEqual(this.props.isLoading, nextProps.isLoading)) {
            this.dic.isLoading = nextProps.isLoading;
        }

        // Chuyển symbol thì reset scroll
        if (!_.isEqual(`${exchange}${symbol}`, `${curExchange}${curSymbol}`)) {
            this.scrollToTop && this.scrollToTop();
        }
    }

    render() {
        return (
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColor
                }}
            >
                <ScrollView
                    ref={this.setScrollRef}
                    waitFor={this.props.refVerticalScroll}
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    style={{
                        paddingLeft: 8
                    }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        {this.renderPart1()}
                        {this.renderPart2()}
                        {this.renderPart3()}
                        {this.renderPart4()}
                        {this.renderPart5()}
                        <View style={{ width: 8 }} />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state, { symbol, exchange }) => {
    if (!symbol || !exchange) return {};

    const { marketData } = state.streamMarket;
    const { quote } =
        (marketData && marketData[exchange] && marketData[exchange][symbol]) ||
        {};

    const { class: symbolClass = '', display_name: displayName = '' } =
        Business.getSymbolInfo({ symbol }) || {};
    return {
        quote,
        symbolClass,
        displayName
    };
};

export default connect(mapStateToProps)(TradeInfo);
