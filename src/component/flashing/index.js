import React, { PureComponent } from 'react';
import { Text, Animated } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import * as Emitter from '@lib/vietnam-emitter';
import { formatNumberNew2, checkPropsStateShouldUpdate } from '~/lib/base/functionUtil'

const flashingState = {
  NONE: 0,
  UP: 1,
  DOWN: -1
}

const time = {
  FLASHING: 250,
  RESET: 50
}

const WhiteColor = '#ffffffff'

const color = {
  '1': CommonStyle.hightLightColorUp,
  '0': WhiteColor,
  '-1': CommonStyle.hightLightColorDown
}

export default class Flashing extends React.Component {
  constructor(props) {
    super(props)
    this.timeout = null
    this.id = null
    const initState = this.getInitialState()
    this.flashingState = initState
    this.opacity = new Animated.Value(Math.abs(initState))
    this.state = {
      value: props.value
    }
    this.forceFlashing = this.forceFlashing.bind(this)
    this.onValueChange = this.onValueChange.bind(this)
    this.flashing()
  }

  componentDidMount() {
    if (this.props.channel) {
      Emitter.addListener(this.props.channel, this.id, this.onValueChange);
    }
  }

  onValueChange({ data = {} }) {
    const value = this.props.field ? data[field] : data
    this.getFlashingState({
      nextValue: value,
      prevValue: this.prevValue
    })
    this.flashing()
    this.setState({ value }, () => this.prevValue = this.state.value)
  }

  getInitialState() {
    if (this.props.value > 0) {
      return flashingState.UP
    } else if (this.props.value < 0) {
      return flashingState.DOWN
    } else {
      return flashingState.NONE
    }
  }

  clearTimeoutFlashing() {
    this.timeout && clearTimeout(this.timeout)
  }

  flashing() {
    this.clearTimeoutFlashing()
    Animated.timing(this.opacity, {
      toValue: Math.abs(this.flashingState),
      duration: time.FLASHING,
      useNativeDriver: true
    }).start()
    this.timeout = setTimeout(() => {
      Animated.timing(this.opacity, {
        toValue: flashingState.NONE,
        duration: time.RESET,
        useNativeDriver: true
      }).start()
    }, time.FLASHING)
  }

  getFlashingState({ nextValue, prevValue = 0 }) {
    if (nextValue > prevValue) {
      this.flashingState = flashingState.UP
    } else if (nextValue < prevValue) {
      this.flashingState = flashingState.DOWN
    } else {
      this.flashingState = flashingState.NONE
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.getFlashingState({
        nextValue: nextProps.value,
        prevValue: this.prevValue
      })
      this.flashing()
      this.setState({ value: nextProps.value }, () => this.prevValue = this.state.value)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const listProps = ['value'];
    const listState = ['value'];
    const check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
    return check;
  }

  forceFlashing(value) {
    this.getFlashingState({
      nextValue: value,
      prevValue: this.prevValue
    })
    this.flashing()
    this.setState({ value }, () => this.prevValue = this.state.value)
  }

  getDisplayValue() {
    if (typeof this.state.value === 'number') {
      if (this.props.type) {
        return formatNumberNew2(this.state.value, this.props.type)
      }
    } else {
      return this.props.defaultValue
    }
  }

  render() {
    const mainStyle = {
      position: 'absolute',
      opacity: this.opacity.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0]
      })
    }
    const flashingStyle = {
      backgroundColor: color[this.flashingState],
      opacity: this.opacity
    }
    return (
      <React.Fragment>
        <Animated.View style={flashingStyle}>
          <Animated.Text style={{
            ...this.props.style,
            color: WhiteColor
          }}>{this.getDisplayValue()}</Animated.Text>
        </Animated.View>
        <Animated.View style={mainStyle}>
          <Text style={{
            ...this.props.style,
            color: color[this.flashingState]
          }}>{this.getDisplayValue()}</Text>
        </Animated.View>
      </React.Fragment>
    )
  }
}

Flashing.defaultProps = {
  defaultValue: '--',
  field: null
}
