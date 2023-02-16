import React from 'react'
import { View, Text, Animated } from 'react-native'

/*
  For children is text
*/
export default class LoadingText extends React.PureComponent {
  constructor(props) {
    super(props)
    this.dic = {
      textOpacityAnim: new Animated.Value(this.props.isLoading ? 0 : 1)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.isLoading !== this.props.isLoading) {
      this.handleLoading(nextProps.isLoading)
    }
  }

  handleLoading(isLoading) {
    Animated.timing(this.dic.textOpacityAnim, {
      toValue: isLoading ? 0 : 1,
      duration: 50,
      useNativeDriver: true
    }).start()
  }

  render() {
    const {
      isLoading, children,
      wrapperStyle, containerStyle, style
    } = this.props
    const opacity = this.dic.textOpacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0]
    })
    if (isLoading === null || isLoading === undefined) {
      return <Text {...this.props}>{children || ''}</Text>
    }
    return (
      <View style={wrapperStyle}>
        <Animated.View style={[
          {
            position: 'absolute',
            alignSelf: 'flex-start',
            borderRadius: 4,
            backgroundColor: '#ffffff30',
            opacity
          },
          containerStyle
        ]}>
          <Text {...this.props} style={[
            style,
            {
              opacity: 0
            }
          ]}>
            {children || ''}
          </Text>
        </Animated.View>
        <View style={[
          {
            alignSelf: 'flex-start',
            borderRadius: 4,
            backgroundColor: '#ffffff00'
          },
          containerStyle
        ]}>
          <Animated.Text {...this.props} style={[
            style,
            {
              opacity: this.dic.textOpacityAnim
            }
          ]}>
            {children || ''}
          </Animated.Text>
        </View>
      </View>
    )
  }
}
