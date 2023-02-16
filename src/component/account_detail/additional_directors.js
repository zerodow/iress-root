import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SingleRow from './single_row';
import styles from './style/account_detail';
import I18n from '../../modules/language';

export default class AdditionalDirectors extends Component {
  render() {
    return (
      <View style={styles.content}>
        {
          this.props.data.map((e, i) =>
            <SingleRow title={` ${i + 1}. ${I18n.tEn('fullName')}`} data={e.fullName} />
          )
        }
      </View>
    )
  }
}
