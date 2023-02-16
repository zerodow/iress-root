import React, { Component } from 'react';
import { Text, View } from 'react-native';

import * as Business from '~/business';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import Icon from '../Component/Icon2';
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import _ from 'lodash';

const ENUM = {
    OPEN: 'OPEN',
    CLOSE: 'CLOSE',
    TRADING_HALT: 'TRADING_HALT'
};

export default class SymbolStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: ENUM.CLOSE
        };
    }

    componentDidMount() {
        if (this.props.isPanel) return // Nếu là panel thì call khi thay đổi exchange
        if (this.props.exchange) {
            this.getExchangeStatus(this.props.exchange);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.exchange !== nextProps.exchange && nextProps.exchange) {
            this.getExchangeStatus(nextProps.exchange);
        }
    }

    async getExchangeStatus(exchange) {
        try {
            const result = await Business.getMarketExchangeInfo(exchange);
            const { market_status: status } = result;
            this.setState({
                status: ENUM[_.upperCase(status)]
            });
            // {
            //     "exchange": "ASX",
            //     "date": "2020-05-12T00:00:00",
            //     "time": "0001-01-01T14:20:23",
            //     "market_status": "OPEN"
            //   }
        } catch (error) { }
    }

    render() {
        if (this.props.isErrorSystem) {
            return (
                <ViewLoading isLoading={true}>
                    <Text style={{
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.font11,
                        color: CommonStyle.color.success
                    }}>Market Close</Text>
                </ViewLoading>
            )
        }
        if (this.state.status === ENUM.TRADING_HALT) {
            return (
                <View>
                    <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Text
                            style={{
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                fontSize: CommonStyle.font11,
                                color: CommonStyle.fontShadowRed
                            }}
                            numberOfLines={1}
                        >
                            {I18n.t('tradingHalt')}
                        </Text>
                        <Icon
                            style={{ paddingLeft: 8 }}
                            name={'tradingHaltTag'}
                            size={10}
                            color={CommonStyle.fontShadowRed}
                        />
                    </View>
                </View>
            );
        } else if (this.state.status === ENUM.OPEN) {
            return (
                <View>
                    <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Text
                            style={{
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                fontSize: CommonStyle.font11,
                                color: CommonStyle.color.success
                            }}
                            numberOfLines={1}
                        >
                            {this.props.isMPRC
                                ? I18n.t('preMarket')
                                : I18n.t('marketOpen')}
                        </Text>
                        <CommonStyle.icons.marketOpen
                            style={{ marginLeft: 8 }}
                            name={'marketOpen'}
                            size={11}
                            color={CommonStyle.color.success}
                        />
                    </View>
                </View>
            );
        } else {
            return (
                <View>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingTop: 4
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                fontSize: CommonStyle.font11,
                                color: CommonStyle.fontNearLight6
                            }}
                            numberOfLines={1}
                        >
                            {I18n.t('marketClosed')}
                        </Text>
                        <Icon
                            style={{ paddingLeft: 8 }}
                            name={'marketClosed'}
                            size={11}
                            color={CommonStyle.fontNearLight6}
                        />
                    </View>
                </View>
            );
        }
    }
}
