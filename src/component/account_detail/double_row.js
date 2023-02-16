import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './style/account_detail';

export default class DoubleRow extends Component {
  render() {
    return (
      <View style={styles.row2}>
        <View style={{ width: '50%', paddingRight: 8 }}>
          <View style={styles.rowNoHeight}>
            <Text style={styles.textField}>{this.props.title1}</Text>
            <Text style={styles.mainText}>{this.props.data1}</Text>
          </View>
        </View>
        <View style={{ width: '50%', paddingLeft: 8 }}>
          <View style={styles.rowNoHeight}>
            <Text style={styles.textField}>{this.props.title2}</Text>
            <Text style={styles.mainText}>{this.props.data2}</Text>
          </View>
        </View>
      </View>
    );
  }
}
