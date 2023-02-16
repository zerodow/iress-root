import React, { Component } from 'react';
import { View, Text, TextInput } from 'react-native';
import styles from './style/account_detail';

export default class SingleRowInput extends Component {
  render() {
    return (
      <View style={styles.rowNoHeight}>
        <Text style={styles.textField}>{this.props.title}</Text>
        <TextInput style={styles.mainText}
          value={this.props.data}
          onChangeText={this.props.onChangeText} />
      </View>
    );
  }
}
