import React, { Component } from 'react';
import { View, Text, Animated } from 'react-native';
import styles from './style/warning';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

export default class Warning extends Component {
  constructor(props) {
    super(props);
    this.state = {
      heightAnimation: new Animated.Value(24)
    }
    this.showHide = this.showHide.bind(this)
  }
  showHide(isShow) {
    Animated.timing(
      this.state.heightAnimation,
      {
        duration: 200,
        // useNativeDriver: true,
        toValue: isShow ? 24 : 0
      }
    ).start();
  }
  render() {
    return (
      <Animated.View
        style={[styles.warningContainer, { marginTop: this.props.isConnected ? 0 : 24, height: this.state.heightAnimation, zIndex: 9999 }]}>
        <Text style={CommonStyle.textSubRed}>{this.props.warningText}</Text>
      </Animated.View>
    );
  }
}
