import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './style/account_detail';

export default class SingleRow extends Component {
  render() {
    let value = '';
    if (typeof (this.props.data) === 'boolean') {
      if (this.props.data) {
        value = 'Yes';
      } else {
        value = 'No'
      }
    } else {
      value = this.props.data;
    }
    return (
      <View style={styles.rowNoHeight}>
        <Text style={styles.textField}>{this.props.title}</Text>
        <Text style={styles.mainText}>{value}</Text>
      </View>
    );
  }
}
