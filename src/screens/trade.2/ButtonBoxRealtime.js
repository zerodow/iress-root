import { connect } from 'react-redux';
import { func, dataStorage } from '../../storage';
import { View, Text, PixelRatio } from 'react-native';
import { formatNumber, checkPropsStateShouldUpdate, roundFloat, formatNumberNew2ClearZero } from '../../lib/base/functionUtil';
import * as Util from '../../util';
import * as Emitter from '@lib/vietnam-emitter';
import * as RoleUser from '../../roleUser';
import * as Controller from '../../memory/controller';
import ENUM from '../../enum';
import config from '../../config'
import PropTypes from 'prop-types';
import PricePieces from './price_pieces'
import styles from './styles/ButtonBox';
import React, { Component } from 'react';
import I18n from '../../modules/language/'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent';
import TouchableOpacityOpt from '../../component/touchableOpacityOpt';

class PriceText extends PricePieces {
    static propTypes = {
        data: PropTypes.object,
        field: PropTypes.string,
        formatValue: PropTypes.func,
        loadingInfo: PropTypes.object,
        allowRenderInfo: PropTypes.shape({
            fnGetAllowRender: PropTypes.func,
            channelAllowRender: PropTypes.string
        }),
        style: PropTypes.any,
        indexInList: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }

    isChange(currentPrice = {}, newPrice = {}) {
        return newPrice[this.props.field] !== currentPrice[this.props.field]
    }

    render() {
        const symbol = this.dic.data.symbol
        return (
            <Text
                style={this.props.style || {}}
                testID={`${symbol}wlO`}
            // numberOfLines={1}
            >
                {
                    this.dic.isLoading
                        ? '--'
                        : this.props.formatValue(this.dic.data)
                }
            </Text>
        )
    }
}

export default class ButtonBoxRealtime extends XComponent {
    static propTypes = {
        isBuy: PropTypes.bool.isRequired,
        data: PropTypes.object.isRequired,
        onPress: PropTypes.func.isRequired,
        loadingInfo: PropTypes.object,
        allowRenderInfo: PropTypes.shape({
            fnGetAllowRender: PropTypes.func,
            channelAllowRender: PropTypes.string
        }),
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        indexInList: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }

    init() {
        const loadingInfo = this.props.loadingInfo

        this.dic = {
            channelLoading: loadingInfo.channelLoading,
            isLoading: PureFunc.getBooleanable(loadingInfo.isLoading, false)
        }
    }

    componentDidMount() {
        super.componentDidMount()

        this.xSubConnectionChange()
        this.subChannelLoading()
    }

    onConnectionChange() {
        this.setState()
    }

    isDisable() {
        const user = Controller.getUserInfo()
        const login = Controller.getLoginObj()

        return dataStorage.isNotHaveAccount ||
            !login.isLogin ||
            (user && (user.email === config.username)) ||
            !this.isConnected ||
            dataStorage.loginUserType === 'REVIEW' ||
            !RoleUser.checkRoleByKey(ENUM.ROLE_DETAIL.PERFORM_BUY_SELL_BUTTON) ||
            !func.isAccountActive()
    }

    subChannelLoading() {
        this.dic.channelLoading &&
            Emitter.addListener(this.dic.channelLoading, this.id, isLoading => {
                if (this.dic.isLoading === isLoading) return
                this.dic.isLoading = isLoading
                this.setState()
            })
    }

    render() {
        const isDisable = this.isDisable() || this.dic.isLoading
        const stylePrice1 = isDisable
            ? {
                // width: this.props.isBuy ? '40%' : '60%',
                color: 'white',
                fontFamily: CommonStyle.fontMedium,
                opacity: 1,
                lineHeight: 20,
                fontSize: this.props.isBuy ? CommonStyle.fontSizeS : CommonStyle.fontSizeM
            }
            : [
                styles.whiteText,
                {
                    lineHeight: 20,
                    // width: this.props.isBuy ? '40%' : '60%',
                    fontSize: this.props.isBuy ? 14 : 16
                }
            ]
        const stylePrice2 = isDisable
            ? {
                opacity: 1,
                // width: this.props.isBuy ? '60%' : '40%',
                color: 'white',
                lineHeight: 20,
                textAlign: 'right',
                fontFamily: CommonStyle.fontMedium,
                fontSize: this.props.isBuy ? CommonStyle.fontSizeM : CommonStyle.fontSizeS
            }
            : [
                styles.whiteText,
                {
                    lineHeight: 20,
                    // width: this.props.isBuy ? '60%' : '40%',
                    textAlign: 'right',

                    fontSize: this.props.isBuy ? CommonStyle.fontSizeM : CommonStyle.fontSizeS
                }
            ]

        return (
            <TouchableOpacityOpt
                style={[
                    this.isDisable()
                        ? CommonStyle.btnRectDisable
                        : this.props.isBuy
                            ? CommonStyle.btnRectBuy
                            : CommonStyle.btnRectSell,
                    {
                        flex: 1,
                        paddingTop: 10,
                        paddingLeft: 15,
                        paddingRight: 15,
                        paddingBottom: 10,
                        width: this.props.width
                    }
                ]}
                testID={'ButtonBoxRealtime'}
                onPress={this.props.onPress}
                disabled={isDisable}
                timeDelay={ENUM.TIME_DELAY} >
                <View testID={'ButtonBoxRealtime-View'} style={{ width: '100%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text
                            testID={`'ButtonBoxRealtime'-leftRow1`}
                            style={[
                                styles.whiteText,
                                {
                                    // justifyContent: 'flex-end',
                                    fontSize: this.props.isBuy ? 14 : 16
                                }]} >
                            {this.props.isBuy
                                ? I18n.t('bidVol')
                                : I18n.t('sellUpper')}
                        </Text>
                        <Text
                            testID={`'ButtonBoxRealtime'-rightRow1`}
                            style={[
                                styles.whiteText,
                                {
                                    // justifyContent: 'flex-end',
                                    textAlign: 'right',
                                    fontSize: this.props.isBuy
                                        ? CommonStyle.fontSizeM
                                        : CommonStyle.fontSizeS
                                }
                            ]} >
                            {this.props.isBuy
                                ? I18n.t('buyUpper')
                                : I18n.t('askVol')}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <PriceText
                            testID={`'ButtonBoxRealtime'-leftRow2`}
                            style={stylePrice1}
                            data={this.props.data}
                            autoControlRender={true}
                            field={this.props.field1}
                            formatValue={this.props.formatValue1}
                            loadingInfo={this.props.loadingInfo}
                            indexInList={this.props.indexInList}
                            allowRenderInfo={this.props.allowRenderInfo}
                        />
                        <PriceText
                            testID={`'ButtonBoxRealtime'-rightRow2`}
                            style={stylePrice2}
                            data={this.props.data}
                            autoControlRender={true}
                            field={this.props.field2}
                            loadingInfo={this.props.loadingInfo}
                            indexInList={this.props.indexInList}
                            formatValue={this.props.formatValue2}
                            allowRenderInfo={this.props.allowRenderInfo}
                        />
                    </View>
                </View>
            </TouchableOpacityOpt>
        );
    }
}
