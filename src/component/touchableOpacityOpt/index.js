import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import ENUM from '~/enum'

export default class TouchableOpacityOpt extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.isMount = false;
    this.isPressing = false
    this.state = { activeOpacity: 0.5 }
  }

  componentDidMount() {
    this.isMount = true;
  }

  componentWillUnmount() {
    this.isMount = false;
  }

  delayOnPress = () => {
    const { onPress, timeDelay } = this.props;
    if (this.isPressing) {
      this.isMount && this.setState({ activeOpacity: 1 });
      return;
    }
    onPress && onPress();
    this.isPressing = true;
    setTimeout(() => {
      this.isPressing = false
      this.isMount && this.setState({ activeOpacity: 0.5 });
    }, timeDelay || ENUM.TIME_DELAY)
  }

  render() {
    const { activeOpacity } = this.state
    return (
      <TouchableOpacity
        ref={ref => ref && this.props.setRef && this.props.setRef(ref)}
        hitSlop={{
          top: 16,
          left: 16,
          bottom: 16,
          right: 16
        }}
        activeOpacity={activeOpacity}
        {...this.props}
        onPress={this.delayOnPress}>
        {this.props.children}
      </TouchableOpacity>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  }
})
