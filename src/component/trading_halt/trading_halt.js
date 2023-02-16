import React from 'react';
import { View, Text } from 'react-native'
import * as Emitter from '@lib/vietnam-emitter';
import * as StreamingBusiness from '../../streaming/streaming_business';
import { dataStorage } from '../../storage'
import { logDevice, checkTradingHalt } from '../../lib/base/functionUtil'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../xComponent/xComponent';

export default class TradingHalt extends XComponent {
    constructor(props) {
        super(props)
        Text.allowFontScale = false
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();
        this.init()
    }

    init() {
        this.state = {
            tradingHalt: false
        }
        this.dic = {
            channel: StreamingBusiness.getChannelHalt(this.props.symbol)
        }
    }

    bindAllFunc() {
        this.updateHalt = this.updateHalt.bind(this)
        this.updateRealtimeHalt = this.updateRealtimeHalt.bind(this)
    }

    updateHalt() {
        try {
            checkTradingHalt(this.props.symbol).then(snap => {
                const tradingHalt = snap
                this.setState({ tradingHalt }, () => {
                    logDevice('info', `Updated Halt of ${this.props.symbol}: ${tradingHalt}`)
                });
            }).catch(err => {
                logDevice('info', `PRICE UNIVERSAL TRADING HALT ERROR: ${err}`)
                console.log(err)
            })
        } catch (e) {
            console.log(e)
        }
    }

    updateRealtimeHalt(tradingHalt) {
        this.setState({ tradingHalt }, () => {
            logDevice('info', `Updated Halt of ${this.props.symbol}: ${tradingHalt}`)
        });
    }

    componentDidMount() {
        super.componentDidMount()
        this.updateHalt(this.props.symbol)
        Emitter.addListener(this.dic.channel, this.id, tradingHalt => {
            this.updateRealtimeHalt(tradingHalt)
        });
    }

    componentWillUnmount() {
        Emitter.deleteListener(this.dic.channel)
        super.componentWillUnmount()
    }

    render() {
        return (
            <View>
                <Text allowFontScaling={false} style={[CommonStyle.textMainRed]}>
                    {this.state.tradingHalt ? '! ' : ''}
                </Text>
            </View>
        )
    }
}
