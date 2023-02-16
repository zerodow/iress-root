import React, { Component } from 'react';
import { View } from 'react-native';

export default class Circle extends Component {
  render() {
    return (
      <View style={{
        width: this.props.size,
        height: this.props.size,
        borderRadius: this.props.size / 2,
        marginRight: this.props.size / 2,
        backgroundColor: this.props.color
      }}>
      </View>
    );
  }
}
