import React from 'react'
import { View, Animated } from 'react-native'

/*
  For children is component
*/
export default class LoadingView extends React.PureComponent {
  constructor(props) {
    super(props)
    this.dic = {
      opacityAnim: new Animated.Value(this.props.isLoading ? 0 : 1)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.isLoading !== this.props.isLoading) {
      this.handleLoading(nextProps.isLoading)
    }
  }

  handleLoading(isLoading) {
    Animated.timing(this.dic.opacityAnim, {
      toValue: isLoading ? 0 : 1,
      duration: 50,
      useNativeDriver: true
    }).start()
  }

  render() {
    const opacity = this.dic.opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0]
    })
    return (
      <View style={this.props.wrapperStyle}>
        <Animated.View style={[
          this.props.containerStyle,
          {
            position: 'absolute',
            flexDirection: 'row',
            alignSelf: 'flex-start',
            alignItems: 'center',
            borderRadius: 4,
            backgroundColor: '#ffffff30',
            opacity
          },
          this.props.forceStyle]}>
          <View style={[
            this.props.style,
            {
              flexDirection: 'row',
              alignItems: 'center',
              opacity: 0
            },
            this.props.childrenStyle]}>
            {this.props.children || null}
          </View>
        </Animated.View>
        <View style={[
          this.props.containerStyle,
          {
            flexDirection: 'row',
            alignSelf: 'flex-start',
            alignItems: 'center',
            borderRadius: 4,
            backgroundColor: '#ffffff00'
          },
          this.props.forceStyle]}>
          <Animated.View style={[
            this.props.style,
            {
              flexDirection: 'row',
              alignItems: 'center',
              opacity: this.dic.opacityAnim
            },
            this.props.childrenStyle]}>
            {this.props.children || null}
          </Animated.View>
        </View>
      </View>
    )
  }
}
