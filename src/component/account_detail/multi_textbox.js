import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './style/account_detail';
import I18n from '../../modules/language';

export default class MultiTextbox extends Component {
  render() {
    const data = this.props.data;
    return (
      <View style={styles.rowNoHeight}>
        <Text style={styles.textField}>{this.props.title}</Text>
        <View>
        </View>
      </View>
    )
  }
}
