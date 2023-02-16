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
import * as Controller from '~/memory/controller';
import * as settingActions from '../setting.actions';
import * as Emitter from '@lib/vietnam-emitter';
import Uuid from 'react-native-uuid'
import * as Channel from '~/streaming/channel'
class SettingSecurity extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
        this.idEvent = Uuid.v4()
    }

    componentDidMount() {
		Emitter.addListener(Channel.getChannelChangeTheme(), this.idEvent, () => this.forceUpdate())
    }
    componentWillUnmount() {
		Emitter.deleteListener(Channel.getChannelChangeTheme(), this.idEvent)
    }

    openAuthSetting = this.openAuthSetting.bind(this)
    openAuthSetting() {
        const refSecurity = this.props.getRefSecurity()
        refSecurity && refSecurity.openScreenAnim()
    }

    renderSeperate = this.renderSeperate.bind(this)
    renderSeperate() {
        return <View style={{
            height: 1,
            backgroundColor: CommonStyle.fontColorBorderNew,
            marginLeft: 16
        }} />
    }

    renderSecurity = this.renderSecurity.bind(this)
    renderSecurity() {
        const { lang } = this.props.setting
        if (!Controller.getLoginStatus()) return null
        return (
            <React.Fragment>
                <TouchableOpacityOpt
                    timeDelay={ENUM.TIME_DELAY}
                    onPress={this.openAuthSetting}
                    style={[
                        CommonStyle.sectContent,
                        { justifyContent: 'space-between' }
                    ]}>
                    <Text style={CommonStyle.sectContentText}>
                        {I18n.t('security', { locale: lang })}
                    </Text>
                    <Ionicons
                        name='ios-arrow-forward'
                        size={24}
                        color={CommonStyle.colorIconSettings} />
                </TouchableOpacityOpt>
                {this.renderSeperate()}
            </React.Fragment>
        )
    }

    render() {
        return this.renderSecurity()
    }
}

function mapStateToProps(state) {
    return {
        setting: state.setting
    };
}

export default connect(mapStateToProps)(SettingSecurity);
