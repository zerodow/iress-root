import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './style/account_detail';
import IconCheck from './icon_check';
import I18n from '../../modules/language';

export default class CheckboxVertical extends Component {
  render() {
    return (
      <View style={styles.checkContainer}>
        <View style={styles.rowNoBorder}>
          <Text style={styles.textField}>{I18n.tEn('wwyltt')}</Text>
        </View>
        {
          this.props.listCheck.map((e, i) => {
            let status = null;
            if (e.replace('*', '') === this.props.data) {
              status = true;
            } else {
              status = false;
            }
            return (<View style={styles.rowCheckVertical}>
              <View style={styles.textCol1}>
                <IconCheck data={status} onPress={() => this.props.onPress(e)} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.mainText2}>{e}</Text>
              </View>
            </View>
            );
          })
        }
      </View>
    );
  }
}
