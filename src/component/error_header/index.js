import React, { PureComponent } from 'react';
import { View, StyleSheet, Platform, Text, Dimensions, Animated } from 'react-native';

import CommonStyle from '~/theme/theme_controller';

const { width } = Dimensions.get('screen')

export default class HeaderNavBar extends PureComponent {
  constructor(props) {
    super(props)
    this.translateAnim = new Animated.Value(0)
    this.showError = this.showError.bind(this)
    this.hideError = this.hideError.bind(this)
    this.state = {
      error: props.error || '',
      type: props.type || 'error'
    }
  }

  setRef = (ref) => {
    this.props.setRef && this.props.setRef(ref)
  }

  showError({ type = 'sell', error = '', height = 0 }) {
    this.timeout && clearTimeout(this.timeout)
    this.setState({ error, type }, () => {
      Animated.timing(this.translateAnim, {
        toValue: height,
        duration: 500
      }).start()
    })
    this.timeout = setTimeout(() => {
      Animated.timing(this.translateAnim, {
        toValue: 0,
        duration: 500
      }).start()
    }, 5000)
  }

  hideError() {
    this.timeout && clearTimeout(this.timeout)
    Animated.timing(this.translateAnim, {
      toValue: 0,
      duration: 500
    }).start()
  }

  setHeightHeaderCb({ nativeEvent: { layout } }) {
    const heightHeader = layout.height;
    this.props.onLayout && this.props.onLayout(heightHeader)
  }

  render() {
    return (
      <View onLayout={e => this.setHeightHeaderCb(e)} style={{ width, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, backgroundColor: CommonStyle.fontDark3, borderBottomRightRadius: CommonStyle.borderBottomRightRadius }}>
        <Animated.View style={{
          position: 'absolute',
          width: '100%',
          top: 0,
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 4,
          transform: [
            { translateY: this.translateAnim }
          ],
          backgroundColor: CommonStyle.color[this.state.type],
          zIndex: 2,
          borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
          ...this.props.style
        }}>
          <Text style={CommonStyle.textSubLightWhite}>{this.state.error}</Text>
        </Animated.View>
        <View style={{
          position: 'absolute',
          width: '100%',
          top: 0,
          zIndex: 2,
          backgroundColor: CommonStyle.fontDark3,
          borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
          ...this.props.style
        }} />
        <View style={{ zIndex: 3 }}>
          {this.props.children}
        </View>
      </View >
    );
  }
}
