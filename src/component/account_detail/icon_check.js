import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './style/account_detail';
import Icon from 'react-native-vector-icons/Ionicons';

export default class IconCheck extends Component {
  render() {
    if (this.props.data) {
      return (
        <Icon name='ios-checkmark-circle' size={24} color='#10a8b2'
          style={{ textAlign: 'center' }}
          onPress={this.props.onPress} />
      );
    } else {
      return (
        <Icon name='ios-radio-button-off-outline' size={24} color='#00000078'
          style={{ textAlign: 'center' }}
          onPress={this.props.onPress} />
      );
    }
  }
}
