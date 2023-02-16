import React, { Component } from 'react';
import { View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { dataStorage } from '~/storage'

const DURATION = 600
const DURATION_DEFAULT = 500

export default class TransitionView extends Component {
  setRef = (ref) => {
    this.view = ref
    this.props.setRef && this.props.setRef(ref)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.animation !== this.props.animation) {
      if (typeof nextProps.animation === 'object') {
        // Fix bug crash khi truyen animation dang custom object
        return
      }
      const { index } = nextProps
      const timeDelay = index !== null && index !== undefined && typeof index === 'number' && index < 12 ? (index === 0 ? 0 : ((index + 1) * DURATION) / 5) : 0
      const duration = nextProps.animation === 'fadeOut' ? 200 : (this.props.duration || DURATION_DEFAULT)
      setTimeout(() => {
        this.view && this.view[nextProps.animation](duration)
      }, timeDelay)
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.animation !== this.props.animation) return false
    return true
    // return false
  }

  render() {
    const { animation, duration, index, ...rest } = this.props;
    return (
      <Animatable.View
        ref={this.setRef}
        animation={animation || dataStorage.animationHoldings || 'fadeIn'}
        duration={duration || DURATION_DEFAULT}
        delay={index !== null && index !== undefined && typeof index === 'number' && index < 12 ? (index === 0 ? 0 : ((index + 1) * DURATION) / 5) : 0}
        useNativeDriver={true}
        {...rest}
      />
    );
  }
}
