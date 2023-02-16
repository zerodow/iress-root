import React, { PureComponent } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import CommonStyle from '~/theme/theme_controller'

const ANIV = 150

export default class BackDropComp extends PureComponent {
  render() {
    const { style, scrollValue } = this.props
    let opacity = 0;
    if (scrollValue) {
      opacity = scrollValue.interpolate({
        inputRange: [-1, 0, ANIV, ANIV + 1],
        outputRange: [0, 0, 0.85, 0.85]
      });
      translateY = scrollValue.interpolate({
        inputRange: [-1, 0, ANIV, ANIV + 1],
        outputRange: [0, 0, 0.85, 0.85]
      });
    }

    return (
      <Animated.View
        pointerEvents='none'
        style={{
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center',
          alignItems: 'center',
          opacity,
          zIndex: 99,
          backgroundColor: CommonStyle.backgroundColor
        }}>
        {/* <Animated.View style={{
          ...CommonStyle.dragIcon
          // transform: [
          //   {
          //     translateY: scrollValue
          //   }
          // ]
        }} /> */}
      </Animated.View>
    )
  }
}
