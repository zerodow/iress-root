import React, { Component } from 'react';

import CommonStyle from '~/theme/theme_controller'
import { View, Text, Animated, Dimensions } from 'react-native'
import * as Animatable from 'react-native-animatable'
const { height } = Dimensions.get('window')

class AlertCommon extends Component {
    onDissmisModal = () => {
        this.view && this.view.fadeOut(800).then(() => this.props.navigator.dismissModal({ animationType: 'none' }))
    }
    render() {
        const styleWrapper = this.props.styleWrapper || {}
        return (
            <Animatable.View
                animation='fadeIn'
                duration={500}
                ref={ref => this.view = ref}
                style={[{
                    flex: 1,
                    justifyContent: 'center',
                    alignContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }, styleWrapper]}>
                {this.props.renderContent ? this.props.renderContent({ onDissmisModal: this.onDissmisModal }) : null}
            </Animatable.View>
        )
    }
}
export default AlertCommon
