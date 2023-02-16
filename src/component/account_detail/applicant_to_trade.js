import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SingleRow from './single_row';
import styles from './style/account_detail';
import I18n from '../../modules/language';

export default class ApplicantToTrade extends Component {
  render() {
    const data = this.props.data;
    return (
      <View style={styles.content}>
        <SingleRow title={I18n.tEn('wylta')} data={data.likeToApply} />
      </View>
    )
  }
}
