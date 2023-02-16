import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './style/account_detail';
import IconCheck from './icon_check';
import I18n from '../../modules/language';
import SingleRow from './single_row';

export default class SingleRowCheckboxVertical extends Component {
  render() {
    let status2 = true;
    return (
      <View style={styles.checkContainer}>
        {
          this.props.listCheck.map((e, i) => {
            let status = null;
            if (e.replace('*', '') === this.props.data) {
              status = true;
              status2 = false;
            } else {
              status = false;
            }
            return (
              <View style={styles.rowCheckVertical}>
                <View style={[styles.textCol1, { paddingRight: 8 }]}>
                  <IconCheck data={status} onPress={() => this.props.onEvent(e)} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.mainText2}>{e}</Text>
                </View>
              </View>
            );
          })
        }
        {
          this.props.other ? <View style={styles.rowCheckVertical}>
            <View style={[styles.textCol1, { paddingRight: 8 }]}>
              <IconCheck data={status2} onPress={() => this.props.onEvent('Advisor')} />
            </View>
            <SingleRow title={I18n.tEn('other')} data={'Advisor'} />
          </View> : null
        }
      </View>
    );
  }
}
