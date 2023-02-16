import React, { useState, useEffect, Component } from 'react'
import { View, Text, ActivityIndicator, Keyboard, Dimensions, Platform } from 'react-native'
import Animated from 'react-native-reanimated'
// Components
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';

import CommonStyle from '~/theme/theme_controller'
import * as RoleUser from '~/roleUser';
import Enum from '~/enum';
import I18n from '~/modules/language';
import styles from '../style/order';
import { dataStorage } from '~/storage';
const { Value } = Animated
const { width, height: heightDevices } = Dimensions.get('window')
export default class ButtonConfirmPlace extends Component {
    constructor(props) {
        super(props)
        const isBuy = this.props.isBuy === undefined || this.props.isBuy === null
            ? true
            : this.props.isBuy
        this.state = {
            isShow: true,
            isCheckVetting: false,
            isBuy,
            cashAvailable: null,
            dataAndNote: null
        }
        this.showContent = this.showContent.bind(this)
        this.hideContent = this.hideContent.bind(this)
        this.handleKeyboardShow = this.handleKeyboardShow.bind(this);
        this.handleKeyboardHide = this.handleKeyboardHide.bind(this);
        this.translateYWithKeyBoard = new Value(0)
        dataStorage.hideButtonConfirm = this.hideContent
    }

    showContent() {
        this.setState({ isShow: true })
    }

    hideContent() {
        this.setState({ isShow: false })
    }

    componentDidMount() {
        const showListener = Platform.OS === 'android' ? 'keyboardWillChangeFrame' : 'keyboardWillShow';
        const hideListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
        this._listeners = [
            Keyboard.addListener(showListener, this.handleKeyboardShow),
            Keyboard.addListener(hideListener, this.handleKeyboardHide)
        ];
    }
    componentWillUnmount() {
        this._listeners.forEach(listener => listener.remove());
        dataStorage.hideButtonConfirm = null
    }
    handleKeyboardShow(event) {
        this.isShowKeyBoard = true
        this.hideContent()
    }
    handleKeyboardHide(event) {
        this.isShowKeyBoard = false
        this.showContent()
    }
    componentWillReceiveProps(nextProps) {
    }
    setCashAvailable(cashAvailable) {
        this.setState({
            cashAvailable
        })
    }
    setClearDataAndNote(dataAndNote) {
        this.setState({
            dataAndNote
        })
    }
    renderClearDataNote = () => {
        return this.state.dataAndNote
    }
    setIsBuy = (isBuy) => {
        this.setState({
            isBuy
        })
    }
    updateCheckVetting = (isCheckVetting) => {
        this.setState({
            isCheckVetting
        })
    }
    render() {
        const { isCheckVetting, isBuy, cashAvailable, dataAndNote } = this.state
        const translateYAni = Animated.interpolate(this.props._scrollValue, {
            inputRange: [heightDevices - 101, heightDevices - 100, heightDevices - 50, heightDevices, heightDevices + 1],
            outputRange: [0, 0, 400, 400, 400]
        })
        if (!this.state.isShow) return null
        return (
            <Animated.View style={{
                width: '100%',
                backgroundColor: CommonStyle.fontColorModal,
                borderTopWidth: 1,
                borderTopColor: CommonStyle.borderColorTopButtonConfrim,
                transform: [{
                    translateY: translateYAni
                }],
                alignItems: 'center'
            }}>
                <TouchableOpacityOpt
                    testID={'orderButton_submit'}
                    disabled={!this.props.isConnected || isCheckVetting || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PLACE_BUY_SELL_NEW_ORDER)}
                    onPress={this.props.onPress}
                    style={[
                        styles.buttonSellBuy,
                        {
                            backgroundColor: isBuy
                                ? (!this.props.isConnected || isCheckVetting || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PLACE_BUY_SELL_NEW_ORDER) ? CommonStyle.btnDisableBg : CommonStyle.addIconColor)
                                : (!this.props.isConnected || isCheckVetting || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PLACE_BUY_SELL_NEW_ORDER) ? CommonStyle.btnDisableBg : CommonStyle.addIconColorRed)
                        }, {
                            borderRadius: 30
                        }
                    ]}>
                    <View
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 16
                        }}>
                        <View style={{
                            flexDirection: 'row', width: '100%', paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center'
                        }}>
                            {
                                isCheckVetting
                                    ? <ActivityIndicator style={{ width: 18, height: 18, marginBottom: 6, marginRight: 6 }} color={CommonStyle.fontWhite} />
                                    : <View />
                            }
                            <Text
                                testID={`submitButtonTradingType`}
                                style={[
                                    CommonStyle.textButtonColor,
                                    { marginBottom: 6, color: isBuy ? CommonStyle.fontBlack : CommonStyle.fontWhite }
                                ]}>
                                {`${I18n.t('place')} ${isBuy ? I18n.t('stopLimitBuy') : I18n.t('sell')} ${I18n.t('order_txt')}`}
                            </Text>
                        </View>

                        <Text
                            testID={`submitButtonInfo`}
                            style={[CommonStyle.textButtonColorS, {
                                textAlign: 'center',
                                fontSize: CommonStyle.fontSizeXS,
                                color: isBuy ? CommonStyle.fontBlack : CommonStyle.fontWhite
                            }]}>
                            {cashAvailable}
                        </Text>
                    </View>
                </TouchableOpacityOpt>
                {this.renderClearDataNote()}
            </Animated.View >
        )
    }
}
