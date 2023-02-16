import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { dataStorage, func } from '../../storage'
import styles from '../../screens/order/style/order';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import firebase from '../../firebase';
import Icon from 'react-native-vector-icons/Ionicons';
import { checkTradingHalt, getDisplayName, logDevice } from '../../lib/base/functionUtil';
import * as emitter from '../../emitter';
import Flag from '../../component/flags/flag'
import * as Business from '../../business';
import XComponent from '../../component/xComponent/xComponent';
import * as Emitter from '@lib/vietnam-emitter';
import * as StreamingBusiness from '../../streaming/streaming_business';

export default class ResultSearch extends XComponent {
    constructor(props) {
        super(props)
        this.state = {
            tradingHalt: false,
            symbol: this.props.data.symbol || null
        }
        this.isMount = false;
        this.updateHaltFromSymbolInfo = this.updateHaltFromSymbolInfo.bind(this)
        this.updateHaltRealtime = this.updateHaltRealtime.bind(this)
    }

    updateHaltFromSymbolInfo(symbol) {
        if (dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].trading_halt !== undefined && dataStorage.symbolEquity[symbol].trading_halt !== null) {
            this.setState({
                tradingHalt: dataStorage.symbolEquity[symbol].trading_halt
            })
        }
    }

    updateHaltRealtime(tradingHalt) {
        if (tradingHalt !== this.state.tradingHalt) {
            this.setState({
                tradingHalt
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data.symbol !== this.state.symbol) {
            this.setState({
                symbol: nextProps.data.symbol
            }, () => {
                this.updateHaltFromSymbolInfo(nextProps.data.symbol)
            })
        }
    }

    componentWillUnmount() {
        this.isMount = false;
        super.componentWillUnmount();
    }

    componentDidMount() {
        this.isMount = true;
        const channel = StreamingBusiness.getChannelHalt(this.state.symbol);
        Emitter.addListener(channel, this.id, tradingHalt => {
            this.updateHaltRealtime(tradingHalt)
        });
        this.updateHaltFromSymbolInfo(this.state.symbol)
    }

    render() {
        const { data } = this.props;
        const displayName = getDisplayName(data.symbol);
        const flagIcon = Business.getFlag(data.symbol)
        return (
            <TouchableOpacity key={`${data.symbol}_orderHistory`} testID={`${data.symbol}_orderHistory`} style={[CommonStyle.rowSearch, { borderBottomWidth: this.props.isNoneBorderBottom && !this.props.isHistory ? 0 : 1 }]}
                onPress={() => {
                    this.props.onPressFn && this.props.onPressFn(data.symbol, data.company, data.class);
                }}>
                <View style={{ width: '100%', flexDirection: 'row' }}>
                    {
                        this.props.isHistory ? <Icon name='ios-timer-outline' size={24} style={{ top: 5, marginRight: 16 }} /> : <View />
                    }
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <Text style={[CommonStyle.textMainRed]}>{this.state.tradingHalt ? '! ' : ''}</Text>
                                <Text style={CommonStyle.textNameInsights} numberOfLines={1}>{displayName || ''}</Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <Flag
                                    type={'flat'}
                                    code={flagIcon}
                                    size={18}
                                />
                            </View>
                        </View>
                        <Text style={CommonStyle.textTimeInsights}>{dataStorage.symbolEquity[data.symbol] ? (dataStorage.symbolEquity[data.symbol].company_name || dataStorage.symbolEquity[data.symbol].company || '').toUpperCase() : ''}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
