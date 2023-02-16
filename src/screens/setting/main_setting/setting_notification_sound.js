import React, { Component, PureComponent } from 'react';
import { View, Text, Dimensions, Animated } from 'react-native';
import I18n from '~/modules/language/index';
import SwitchButton from '~/screens/alert_function/components/SwitchButton';
import CommonStyle from '~/theme/theme_controller';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ENUM from '~/enum';
import TransitionView from '~/component/animation_component/transition_view'
import DeviceInfo from 'react-native-device-info'
import { func } from '~/storage'
import { logDevice } from '~/lib/base/functionUtil'
import { getHoursMinutesUTC } from '~/util'
import { saveDataSetting } from '~/business'
import * as api from '~/api'
import * as PureFunc from '~/utils/pure_func'
import * as Controller from '~/memory/controller';
import * as Animatable from 'react-native-animatable'
import * as settingActions from '../setting.actions';
import * as loginActions from '~/screens/login/login.actions';

class SettingNotificationSound extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.props.setRefSoundNotification && this.props.setRefSoundNotification(this)
    }

    checkSameSetting = this.checkSameSetting.bind(this)
    checkSameSetting(currentSetting, newSetting) {
        // Chọn lại setting cũ thì không làm gì
        if (currentSetting === newSetting) return false;
        return true
    }

    onChangeNotiSoundPref = this.onChangeNotiSoundPref.bind(this)
    onChangeNotiSoundPref(data) {
        saveDataSetting('notiSound', data);
    }

    renderSeperate() {
        return <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 40 }} />
    }

    setRef = this.setRef.bind(this)
    setRef(ref) {
        const type = ENUM.TYPE_SETTING_NOTIFICATION_REF.SOUND
        this.props.setRef && this.props.setRef(type, ref)
    }

    setRefSoundNotification = this.setRefSoundNotification.bind(this)
    setRefSoundNotification(ref) {
        if (ref) {
            this.refAnimatable = ref
        }
    }

    fadeInDown = this.fadeInDown.bind(this)
    fadeInDown({ duration = 500 }) {
        const config = {
            0: {
                opacity: 0,
                translateY: -58 * 1
            },
            1: {
                opacity: 1,
                translateY: 0
            }
        }
        this.refAnimatable && this.refAnimatable.animate(config, duration)
    }

    fadeOutUp = this.fadeOutUp.bind(this)
    fadeOutUp({ duration = 500 }) {
        const config = {
            0: {
                opacity: 1,
                translateY: 0
            },
            1: {
                opacity: 0,
                translateY: -58 * 1
            }
        }
        this.refAnimatable && this.refAnimatable.animate(config, duration)
    }

    render() {
        const { lang, notiSound: sound, animation, duration, index } = this.props.setting
        const soundValue = sound === 'default'
        const defaultConfig = {
            0: {
                opacity: 0,
                translateY: -58 * 2
            },
            1: {
                opacity: 0,
                translateY: -58 * 2
            }
        }
        return <Animatable.View
            useNativeDriver={true}
            animation={defaultConfig}
            ref={this.setRefSoundNotification}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 40,
                paddingRight: 16,
                height: 57
            }}>
                <Text style={[CommonStyle.sectContentText]}>{I18n.t('settingNotiSound', { locale: lang })}</Text>
                <SwitchButton testID='settingNotiSound'
                    circleSize={24}
                    barHeight={30}
                    circleBorderWidth={0}
                    backgroundActive={CommonStyle.fontColorSwitchTrue}
                    backgroundInactive={CommonStyle.fontColorSwitchTrue}
                    circleActiveColor={CommonStyle.fontColorButtonSwitch}
                    circleInActiveColor={'#000000'}
                    changeValueImmediately={true}
                    changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                    innerCircleStyle={{ alignItems: 'center', justifyContent: 'center' }} // style for inner animated circle for what you (may) be rendering inside the circle
                    outerCircleStyle={{}} // style for outer animated circle
                    renderActiveText={false}
                    renderInActiveText={false}
                    switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                    switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                    switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                    switchBorderRadius={16}
                    onValueChange={this.onChangeNotiSoundPref}
                    value={soundValue}
                />
            </View>
            {this.renderSeperate()}
        </Animatable.View>
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

export default connect(mapStateToProps, mapDispatchToProps)(SettingNotificationSound);
