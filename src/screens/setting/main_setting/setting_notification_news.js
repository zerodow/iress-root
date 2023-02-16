import React, { Component, PureComponent } from 'react';
import { View, Text, Dimensions, Animated } from 'react-native';
import I18n from '~/modules/language/index';
import SwitchButton from '~/screens/alert_function/components/SwitchButton';
import CommonStyle from '~/theme/theme_controller';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ENUM from '~/enum';
import TransitionView from '~/component/animation_component/transition_view'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable'
import * as Controller from '~/memory/controller';
import * as settingActions from '../setting.actions';
import * as loginActions from '~/screens/login/login.actions';

class SettingNotificationNews extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.props.setRefNewsNotification && this.props.setRefNewsNotification(this)
    }

    setRef = this.setRef.bind(this)
    setRef(ref) {
        const type = ENUM.TYPE_SETTING_NOTIFICATION_REF.NEWS
        this.props.setRef && this.props.setRef(type, ref)
    }

    renderSeperate() {
        return <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 40 }} />
    }

    _openNewsSetting = this._openNewsSetting.bind(this)
    _openNewsSetting() {
        const refNewsNoti = this.props.getRefNewsNotification()
        refNewsNoti && refNewsNoti.openScreenAnim()
    }

    setRefNewsNotification = this.setRefNewsNotification.bind(this)
    setRefNewsNotification(ref) {
        if (ref) {
            this.refAnimatable = ref
        }
    }

    fadeInDown = this.fadeInDown.bind(this)
    fadeInDown({ duration = 500 }) {
        const config = {
            0: {
                opacity: 0,
                translateY: -58 * 3
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
                translateY: -58 * 3
            }
        }
        this.refAnimatable && this.refAnimatable.animate(config, duration)
    }

    render() {
        const { lang } = this.props
        const defaultConfig = {
            0: {
                opacity: 0,
                translateY: -58 * 3
            },
            1: {
                opacity: 0,
                translateY: -58 * 3
            }
        }
        return <Animatable.View
            useNativeDriver={true}
            animation={defaultConfig}
            ref={this.setRefNewsNotification}>
            <TouchableOpacityOpt
                timeDelay={ENUM.TIME_DELAY}
                testID='newsNotiButton'
                onPress={this._openNewsSetting}
                style={[{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 40,
                    paddingRight: 16,
                    height: 57,
                    justifyContent: 'space-between'
                }]}>
                <Text style={CommonStyle.sectContentText}>{I18n.t('settingNewsNoti', { locale: lang })}</Text>
                <Ionicons name='ios-arrow-forward' size={24} color={CommonStyle.colorIconSettings} />
            </TouchableOpacityOpt>
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

export default connect(mapStateToProps, mapDispatchToProps)(SettingNotificationNews);
