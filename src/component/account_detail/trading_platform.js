import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SingleRow from './single_row';
import DoubleRow from './double_row';
import CheckboxHorizontal from './checkbox_horizontal';
import styles from './style/account_detail';
import I18n from '../../modules/language';

export default class TradingPlatform extends Component {
  renderTitle(title) {
    return (
      <Text style={styles.title}>{title}</Text>
    );
  }

  render() {
    const data = this.props.data;
    return (
      <View style={styles.content}>
        {
          this.props.data.map((e, i) => {
            let header = `APPLICANT ${i + 1} / DIRECTOR ${i + 1}`;
            return (
              <View style={{ width: '100%' }}>
                {this.renderTitle(header)}
                <SingleRow title={I18n.tEn('platform')} data={e.platform} />
              </View>
            )
          })
        }
      </View>
    )
  }
}
