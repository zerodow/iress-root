import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './style/account_detail';
import IconCheck from './icon_check';

export default class CheckboxHorizontal extends Component {
  getStyle(i) {
    switch (i) {
      case 0:
        return styles.col2;
      case 1:
        return styles.col3;
      case 2:
        return styles.col4
    }
  }

  render() {
    return (
      <View style={styles.checkContainer}>
        <View style={{ width: '100%', flexDirection: 'row' }}>
          <Text style={[styles.col1, styles.textField]}>{this.props.object}</Text>
          {
            this.props.listCheck.map((e, i) =>
              <Text key={i} style={[this.getStyle(i), styles.textField, { textAlign: 'center' }]}>{e.title}</Text>
            )
          }
        </View>
        {
          this.props.fields.map((e, i) => {
            return (
              <View style={{ width: '100%', flexDirection: 'row', marginBottom: 16 }} key={i}>
                <View style={[styles.col1, { height: 24, borderBottomWidth: 1, borderColor: '#0000001e' }]}>
                  <Text style={styles.mainText}>{e.title}</Text>
                </View>
                <View style={styles.col2}>
                  <IconCheck data={e[this.props.listCheck[0].name]} onPress={() => this.props.onPress(i, 0)} />
                </View>
                <View style={styles.col3}>
                  <IconCheck data={e[this.props.listCheck[1].name]} onPress={() => this.props.onPress(i, 1)} />
                </View>
                <View style={styles.col4}>
                  <IconCheck data={e[this.props.listCheck[2].name]} onPress={() => this.props.onPress(i, 2)} />
                </View>
              </View>
            );
          })
        }
      </View>
    );
  }
}
