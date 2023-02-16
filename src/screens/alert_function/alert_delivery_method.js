import React from 'react'
import {
    View, TextInput, Text, TouchableOpacity,
    ScrollView, Dimensions, Switch, ActivityIndicator
} from 'react-native'
// Redux
import { connect } from 'react-redux'
// Emitter
import * as Emitter from '@lib/vietnam-emitter'
import * as Channel from '../../streaming/channel'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Storage
import ENUM from '../../enum'
import * as Controller from '../../memory/controller'
// Util
import * as FunctionUtil from '../../lib/base/functionUtil'
// Component
import XComponent from '../../component/xComponent/xComponent'
import I18n from '../../modules/language/'
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Navigation } from 'react-native-navigation'
import SwitchButton from './components/SwitchButton'
import { TYPE } from './components/ButtonConfirm'
import TouchableOpacityOpt from '../../component/touchableOpacityOpt';
import { dataStorage, func } from '~/storage'
import { checkRoleByKey } from '../../roleUser';
const { ROLE_USER, ROLE_DETAIL } = ENUM;
const { width, height } = Dimensions.get('window')
const { DELIVERY_METHOD } = ENUM

export class DeliveryMethod extends XComponent {
    init() {
        const { isModify } = this.props
        this.dic = {
            userInfo: Controller.getUserInfo()
        }
        this.state = {
            isLoading: false,
            emailNotification: this.dic.userInfo.email_alert || this.dic.userInfo.email || this.dic.userInfo.user_login_id,
            switch: {
                deliveryMethodEmail: this.props.deliveryMethodEmail || false,
                deliveryMethodNotification: this.props.deliveryMethodNotification || false
            }
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.props.onRef && this.props.onRef(this)
        const channel = Channel.getChannelChangeEmailNotification()
        this.subOnPressConfirmAlert()
        Emitter.addListener(channel, this.id, ({ emailNotification }) => {
            this.setState({
                emailNotification
            })
        })
    }

    componentWillUnmount() {
        this.props.onRef && this.props.onRef(undefined)
        super.componentWillUnmount()
        this.unSubOnPressConfirmAlert()
    }

    loadDone() {
        Emitter.emit(Channel.getChannelLoadingConfirmAlert(), { isLoading: false })
    }

    beginLoading() {
        Emitter.emit(Channel.getChannelLoadingConfirmAlert(), { isLoading: true })
    }

    onConfirm() {
        this.beginLoading()
        const { isModify } = this.props
        return isModify
            ? this.onModifyAlert()
            : this.onCreateAlert()
    }
    subOnPressConfirmAlert = () => {
        dataStorage.onConfirmAlert = this.onConfirm
        // this.subOnPressButtonConfirm = Emitter.addListener(Channel.getChannelOnPressConfirmAlert(), this.id, () => {
        //     this.onConfirm()
        // })
    }
    unSubOnPressConfirmAlert = () => {
        this.subOnPressButtonConfirm && Emitter.deleteByIdEvent(this.subOnPressButtonConfirm);
    }
    onCreateAlert() {
        const cb = this.loadDone
        this.props.onCreateAlert && this.props.onCreateAlert(cb)
    }

    onModifyAlert() {
        const cb = this.loadDone
        this.props.onModifyAlert && this.props.onModifyAlert(cb)
    }

    onChange({ type, switchValue }) {
        const newSwitchValue = { ...this.state.switch }
        newSwitchValue[type] = switchValue
        this.setState({
            switch: newSwitchValue
        }, () => {
            this.props.updateDeliveryMethod({ type, switchValue })
            if (!this.state.switch[DELIVERY_METHOD.NOTIFICATION] && !this.state.switch[DELIVERY_METHOD.EMAIL]) {
                this.updateDisableButtonConfirm(true)
            } else {
                this.updateDisableButtonConfirm(false)
            }
        })
    }

    checkDisabled() {
        const { isModify } = this.props;
        const checkRole = isModify
            ? checkRoleByKey(ROLE_DETAIL.ROLE_PERFORM_MODIFY_ALERT_CONFIRM_BUTTON)
            : checkRoleByKey(ROLE_DETAIL.ROLE_PERFORM_CONFIRM_BUTTON)
        return (!this.state.switch[DELIVERY_METHOD.NOTIFICATION] && !this.state.switch[DELIVERY_METHOD.EMAIL]) ||
            !this.props.isConnected ||
            this.state.isLoading ||
            !checkRole
    }

    updateDisableButtonConfirm(disable) {
        if (disable === this.state.disable) return
        let status = disable ? TYPE.DISABLE : TYPE.SHOW
        if (!this.state.switch[DELIVERY_METHOD.NOTIFICATION] && !this.state.switch[DELIVERY_METHOD.EMAIL]) {
            status = TYPE.DISABLE
        }
        Emitter.emit(Channel.getChannelUpdateStatusButtonConfirmAlert(), { status: status })
    }

    renderTitle() {
        return <Text
            style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.fontSizeM,
                color: CommonStyle.fontColor
            }}>
            {I18n.t('deliveryMethod')}
        </Text>
    }
    handleShowModal = () => {
        Navigation.showModal({
            screen: 'equix.AlertModal',
            animationType: 'none',
            navigatorStyle: {
                statusBarColor: CommonStyle.statusBarColor,
                navBarHidden: true,
                statusBarTextColorScheme: CommonStyle.statusBarTextScheme,
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            }
        })
    }
    renderEmailNotification() {
        return <React.Fragment>
            <View style={{ backgroundColor: CommonStyle.backgroundColor, width, height: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignContent: 'center', flex: 1, paddingRight: 16 }}>
                    <Text numberOfLines={1} style={{ fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor, alignSelf: 'flex-end', flex: 1, lineHeight: CommonStyle.fontSizeXS * 2 }}>{`${I18n.t('email')}: ${this.state.emailNotification}`}</Text>
                    <TouchableOpacityOpt
                        timeDelay={ENUM.TIME_DELAY}
                        onPress={this.handleShowModal}
                        style={{}}>
                        <MaterialCommunityIcons name='pencil' size={24} color={CommonStyle.fontColor} style={{ marginLeft: 8 }} />
                    </TouchableOpacityOpt>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                    <SwitchButton
                        value={this.state.switch[DELIVERY_METHOD.EMAIL]}
                        onValueChange={switchValue => this.onChange({ type: DELIVERY_METHOD.EMAIL, switchValue })}
                        circleSize={24}
                        barHeight={30}
                        circleBorderWidth={0}
                        backgroundActive={CommonStyle.fontColorSwitchTrue}
                        backgroundInactive={CommonStyle.fontColorSwitchTrue}
                        circleActiveColor={CommonStyle.fontColorButtonSwitch}
                        circleInActiveColor={'#000000'}
                        changeValueImmediately={true}
                        // renderInsideCircle={() => <Text>ddd</Text>} // custom component to render inside the Switch circle (Text, Image, etc.)
                        changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                        innerCircleStyle={{ alignItems: 'center', justifyContent: 'center' }} // style for inner animated circle for what you (may) be rendering inside the circle
                        outerCircleStyle={{}} // style for outer animated circle
                        renderActiveText={false}
                        renderInActiveText={false}
                        switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                        switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                        switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                        switchBorderRadius={16} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                    />
                    {/* <Switch
                        style={{ right: 0 }}
                        tintColor={CommonStyle.fontBorderGray}
                        onValueChange={switchValue => this.onChange({ type: DELIVERY_METHOD.EMAIL, switchValue })}
                        value={this.state.switch[DELIVERY_METHOD.EMAIL]} /> */}
                </View>
            </View>
        </React.Fragment>
    }

    renderPushNotification() {
        return <React.Fragment>
            <View style={{ backgroundColor: CommonStyle.backgroundColor, width, height: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor, alignSelf: 'flex-end' }}>{I18n.t('pushNotification')}</Text>
                <SwitchButton
                    value={this.state.switch[DELIVERY_METHOD.NOTIFICATION]}
                    onValueChange={switchValue => this.onChange({ type: DELIVERY_METHOD.NOTIFICATION, switchValue })}
                    circleSize={24}
                    barHeight={30}
                    circleBorderWidth={0}
                    backgroundActive={CommonStyle.fontColorSwitchTrue}
                    backgroundInactive={CommonStyle.fontColorSwitchTrue}
                    circleActiveColor={CommonStyle.fontColorButtonSwitch}
                    circleInActiveColor={'#000000'}
                    changeValueImmediately={true}
                    // renderInsideCircle={() => <Text>ddd</Text>} // custom component to render inside the Switch circle (Text, Image, etc.)
                    changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                    innerCircleStyle={{ alignItems: 'center', justifyContent: 'center' }} // style for inner animated circle for what you (may) be rendering inside the circle
                    outerCircleStyle={{}} // style for outer animated circle
                    renderActiveText={false}
                    renderInActiveText={false}
                    switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                    switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                    switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                    switchBorderRadius={16} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                />
            </View>
        </React.Fragment>
    }

    renderButtonConfirm() {
        return null
        if (this.state.disable) {
            return <React.Fragment>
                <View style={{ backgroundColor: CommonStyle.backgroundColor, width, height: 24 }} />
                <TouchableOpacity
                    disabled={true}
                    onPress={this.onConfirm}
                    style={{
                        width: '100%',
                        backgroundColor: CommonStyle.btnOrderDisableBg,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 30,
                        height: 48
                    }}>
                    {
                        this.state.isLoading
                            ? <ActivityIndicator style={{ width: 30, height: 30 }} color={CommonStyle.fontBlack} />
                            : null
                    }
                    <Text style={{ fontFamily: CommonStyle.fontPoppinsBold, color: CommonStyle.fontBlack, fontSize: CommonStyle.fontSizeStandard }}>{I18n.t('confirmUpper')}</Text>
                </TouchableOpacity>
            </React.Fragment>
        }

        const disabled = this.checkDisabled();
        return <React.Fragment>
            <View style={{ backgroundColor: CommonStyle.backgroundColor, width, height: 24 }} />
            <TouchableOpacity
                disabled={disabled}
                onPress={this.onConfirm}
                style={{
                    width: '100%',
                    backgroundColor: disabled ? CommonStyle.btnOrderDisableBg : CommonStyle.colorbtnConfirm,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 30,
                    height: 48
                }}>
                {
                    this.state.isLoading
                        ? <ActivityIndicator style={{ width: 30, height: 30 }} color={disabled ? CommonStyle.fontBlack : CommonStyle.fontWhite} />
                        : null
                }
                <Text style={{ fontFamily: CommonStyle.fontPoppinsBold, color: CommonStyle.fontBlack, fontSize: CommonStyle.fontSizeM }}>{I18n.t('confirmUpper')}</Text>
            </TouchableOpacity>
        </React.Fragment>
    }

    render() {
        return (
            <React.Fragment>
                <View style={{ backgroundColor: CommonStyle.backgroundColor, width, height: 24 }} />
                {this.renderTitle()}
                {this.renderEmailNotification()}
                {this.renderPushNotification()}
                {this.renderButtonConfirm()}
            </React.Fragment>
        )
    }
}
function mapStateToProps(state, ownProps) {
    return {
        isConnected: state.app.isConnected
    };
}

export default connect(mapStateToProps)(DeliveryMethod)
