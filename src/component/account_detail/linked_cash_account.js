import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SingleRow from './single_row';
import DoubleRow from './double_row';
import CheckboxHorizontal from './checkbox_horizontal';
import styles from './style/account_detail';
import I18n from '../../modules/language';

export default class LinkedCashAccount extends Component {
  renderTitle(title) {
    return (
      <Text style={styles.title}>{title}</Text>
    );
  }

  render() {
    const data = this.props.data;
    return (
      <View style={styles.content}>
        {this.renderTitle(I18n.tEn('existingCashAccount'))}
        <View style={{ width: '50%' }}>
          <SingleRow title={I18n.tEn('providerName')} data={data.providerName} />
        </View>
        <DoubleRow title1={I18n.tEn('bsb')} data1={data.bsb}
          title2={I18n.tEn('acno')} data2={data.acno} />
        {this.renderTitle(I18n.tEn('incomeDirection'))}
        <View style={{ height: 24, borderBottomWidth: 1, borderColor: '#0000001e' }}>
          <Text style={styles.mainText}>{data.incomeDirection}</Text>
        </View>
      </View>
    )
  }
}
