import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './style/account_detail';
import IconCheck from './icon_check';
import I18n from '../../modules/language';

export class SingleRowCheckboxHorizontal extends Component {
  render() {
    let extra = null;
    if (this.props.text) {
      extra = (
        <Text style={styles.textExtra}>{I18n.tEn('australianResidentsOnly')}</Text>
      );
    }
    return (
      <View style={styles.rowNoBorder}>
        <Text style={this.props.bold ? styles.title : styles.textField}>{this.props.title}</Text>
        {extra}
        <View style={{ flexDirection: 'row', paddingTop: 8 }}>
          <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
            <IconCheck data={this.props.data} onPress={this.props.onPressYes} />
            <Text style={[styles.yesNo, { paddingLeft: 12 }]}>{I18n.tEn('yes')}</Text>
          </View>
          <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
            <IconCheck data={!this.props.data} onPress={this.props.onPressNo} />
            <Text style={[styles.yesNo, { paddingLeft: 12 }]}>{I18n.tEn('no')}</Text>
          </View>
        </View>
      </View>
    );
  }
}

export default SingleRowCheckboxHorizontal;
