import React, { Component } from 'react';
import { View, Text, TextInput } from 'react-native';
import styles from './style/account_detail';

export default class DoubleRowInput extends Component {
  render() {
    return (
      <View style={styles.row2}>
        <View style={{ width: '50%', paddingRight: 8 }}>
          <View style={styles.rowNoHeight}>
            <Text style={styles.textField}>{this.props.title1}</Text>
            <TextInput style={styles.mainText} value={this.props.data1}
              onChangeText={this.props.onChangeText1} />
          </View>
        </View>
        <View style={{ width: '50%', paddingLeft: 8 }}>
          <View style={styles.rowNoHeight}>
            <Text style={styles.textField}>{this.props.title2}</Text>
            <TextInput style={styles.mainText} value={this.props.data2}
              onChangeText={this.props.onChangeText2} />
          </View>
        </View>
      </View>
    );
  }
}
