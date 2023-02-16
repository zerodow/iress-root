import React, { Component, PureComponent } from 'react'
import { View, Text, Dimensions, Animated } from 'react-native'
import I18n from '~/modules/language/index';
import SwitchButton from '~/screens/alert_function/components/SwitchButton'
import CommonStyle from '~/theme/theme_controller'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { func } from '~/storage'
import DeviceInfo from 'react-native-device-info'
import SETTING_TYPE from '~/constants/setting_type'
import { subcribleChannel, unRegisterReceiverNoti, logDevice } from '~/lib/base/functionUtil'
import { saveDataSetting } from '~/business'
import * as PureFunc from '~/utils/pure_func'
import * as Controller from '~/memory/controller'
import * as settingActions from '../setting.actions';
import * as loginActions from '~/screens/login/login.actions';
import * as api from '~/api'
import * as Util from '~/util'
import SettingNotificationSound from './setting_notification_sound'
import SettingNotificationVibrate from './setting_notification_vibrate'
import SettingNotificationNews from './setting_notification_news'
import SettingNotificationOrder from './setting_notification_order'

const duration = 300
const delay = 100

class SettingNotification extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
        this.refSoundNotifcation = null
        this.refVibrateNotification = null
        this.refNewsNotification = null
        this.refOrderNotification = null
        this.heightNotiAnim = new Animated.Value(0)
        this.timeout = null
    }

    componentDidMount() {
        const { noti } = this.props.setting
        if (noti) {
            this.timeout && clearTimeout(this.timeout)
            this.timeout = setTimeout(() => {
                Animated.timing(this.heightNotiAnim, {
                    toValue: 58 * 4,
                    duration
                }).start()
                this.fadeInDown()
            }, 500)
        }
    }

    componentWillUnmount() {
        this.timeout && clearTimeout(this.timeout)
    }

    componentWillReceiveProps(nextProps) {
        const { noti: currentNoti } = this.props.setting
        const { noti: nextNoti } = nextProps.setting
        if (currentNoti !== nextNoti) {
            if (nextNoti) {
                Animated.timing(this.heightNotiAnim, {
                    toValue: 58 * 4,
                    duration
                }).start()
                this.fadeInDown()
            } else {
                this.fadeOutUp()
                Animated.timing(this.heightNotiAnim, {
                    toValue: 0,
                    duration
                }).start()
            }
        }
    }

    fadeInDown = this.fadeInDown.bind(this)
    fadeInDown() {
        this.refSoundNotifcation && this.refSoundNotifcation.fadeInDown({ duration: 400 })
        this.refVibrateNotification && this.refVibrateNotification.fadeInDown({ duration: 300 })
        this.refNewsNotification && this.refNewsNotification.fadeInDown({ duration: 200 })
        this.refOrderNotification && this.refOrderNotification.fadeInDown({ duration: 100 })
    }

    fadeOutUp = this.fadeOutUp.bind(this)
    fadeOutUp() {
        this.refSoundNotifcation && this.refSoundNotifcation.fadeOutUp({ duration: 400 })
        this.refVibrateNotification && this.refVibrateNotification.fadeOutUp({ duration: 300 })
        this.refNewsNotification && this.refNewsNotification.fadeOutUp({ duration: 200 })
        this.refOrderNotification && this.refOrderNotification.fadeOutUp({ duration: 100 })
    }

    setRefVibrateNotification = this.setRefVibrateNotification.bind(this)
    setRefVibrateNotification(ref) {
        this.refVibrateNotification = ref
    }

    setRefSoundNotification = this.setRefSoundNotification.bind(this)
    setRefSoundNotification(ref) {
        this.refSoundNotifcation = ref
    }

    setRefNewsNotification = this.setRefNewsNotification.bind(this)
    setRefNewsNotification(ref) {
        this.refNewsNotification = ref
    }

    setRefOrderNotification = this.setRefOrderNotification.bind(this)
    setRefOrderNotification(ref) {
        this.refOrderNotification = ref
    }

    renderSeperate = this.renderSeperate.bind(this)
    renderSeperate() {
        return <View style={{
            height: 1,
            backgroundColor: CommonStyle.fontColorBorderNew,
            marginLeft: 16
        }} />
    }

    onChangeNotiPref = this.onChangeNotiPref.bind(this)
    onChangeNotiPref(data) {
        saveDataSetting('noti', data);
    }

    checkSameSetting = this.checkSameSetting.bind(this)
    checkSameSetting(currentSetting, newSetting) {
        // Chọn lại setting cũ thì không làm gì
        if (currentSetting === newSetting) return false;
        return true
    }

    renderNotification = this.renderNotification.bind(this)
    renderNotification() {
        const { lang, noti } = this.props.setting
        if (!Controller.getLoginStatus()) return null
        return (
            <React.Fragment>
                <View style={CommonStyle.sectContent}>
                    <Text style={CommonStyle.sectContentText}>{I18n.t('settingNoti', { locale: lang })}</Text>
                    <SwitchButton testID='settingNoti'
                        circleSize={24}
                        barHeight={30}
                        circleBorderWidth={0}
                        backgroundActive={CommonStyle.fontColorSwitchTrue}
                        backgroundInactive={CommonStyle.fontColorSwitchTrue}
                        circleActiveColor={CommonStyle.fontColorButtonSwitch}
                        circleInActiveColor={'#000000'}
                        changeValueImmediately={true}
                        onValueChange={this.onChangeNotiPref}
                        value={noti}
                        changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                        innerCircleStyle={{ alignItems: 'center', justifyContent: 'center' }} // style for inner animated circle for what you (may) be rendering inside the circle
                        outerCircleStyle={{}} // style for outer animated circle
                        renderActiveText={false}
                        renderInActiveText={false}
                        switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                        switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                        switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                        switchBorderRadius={16}
                    />
                </View>
                {this.renderSeperate()}
                <Animated.View style={{ height: this.heightNotiAnim, overflow: 'hidden' }}>
                    <SettingNotificationSound
                        setRefSoundNotification={this.setRefSoundNotification}
                        getRefSoundNotification={this.getRefSoundNotification} />
                    <SettingNotificationVibrate
                        setRefVibrateNotification={this.setRefVibrateNotification}
                        getRefVibrateNotification={this.getRefVibrateNotification} />
                    <SettingNotificationNews
                        setRefNewsNotification={this.setRefNewsNotification}
                        getRefNewsNotification={this.props.getRefNewsNotification} />
                    <SettingNotificationOrder
                        setRefOrderNotification={this.setRefOrderNotification}
                        getRefOrderNotification={this.props.getRefOrderNotification} />
                </Animated.View>
            </React.Fragment>
        )
    }

    render() {
        return this.renderNotification()
    }
}
function mapStateToProps(state) {
    return {
        setting: state.setting,
        tokenLogin: state.login.token,
        emailLogin: state.login.email,
        isConnected: state.app.isConnected
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(settingActions, dispatch),
        loginActions: bindActionCreators(loginActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingNotification);
