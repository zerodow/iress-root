import React, { Component, PureComponent } from 'react'
import { View, Text, Dimensions, Animated } from 'react-native'
import I18n from '~/modules/language/index';
import { connect } from 'react-redux';
import * as UserPriceSource from '~/userPriceSource'
import * as Controller from '~/memory/controller'
import CommonStyle from '~/theme/theme_controller'
import * as Emitter from '@lib/vietnam-emitter';
import Uuid from 'react-native-uuid'
import * as Channel from '~/streaming/channel'
class SettingMarketData extends PureComponent {
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

    renderSeperate() {
        return <View style={{
            height: 1,
            backgroundColor: CommonStyle.fontColorBorderNew,
            marginLeft: 16
        }} />
    }

    renderMarketData = this.renderMarketData.bind(this)
    renderMarketData() {
        const { lang } = this.props.setting
        if (!Controller.getLoginStatus()) return null
        return (
            <React.Fragment>
                <View style={CommonStyle.sectContent}>
                    <Text
                        style={[CommonStyle.sectContentText, { width: '40%' }]}>{I18n.t('marketData', { locale: lang })}</Text>
                    <View
                        disabled={!this.props.isConnected}
                        testID='settingsSelectPriceSource'
                        style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }]}>
                        <Text testID={'valuePicker'} style={[CommonStyle.langSelected, { marginRight: 0 }]}>
                            {UserPriceSource.getUserPriceSourceText()}
                        </Text>
                    </View>
                </View>
                {this.renderSeperate()}
            </React.Fragment>
        )
    }

    render() {
        return this.renderMarketData()
    }
}

function mapStateToProps(state) {
    return {
        setting: state.setting
    };
}

export default connect(mapStateToProps)(SettingMarketData);
