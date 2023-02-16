import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SingleRowInput from './single_row_input';
import DoubleRow from './double_row';
import SingleRow from './single_row';
import DoubleRowInput from './double_row_input';
import CheckboxVertical from './checkbox_vertical';
import styles from './style/account_detail';
import I18n from '../../modules/language';

const listCheck = [
  'Transfer my/our HIN and all its holdings',
  'Transfer only some of holdings from my/our HIN'
]

export default class ChessSponsorship extends Component {
  renderHeader(header) {
    return (
      <View style={styles.subHeader}>
        <Text style={styles.textHeader}>{header}</Text>
      </View>
    );
  }

  renderTitle(title) {
    return (
      <Text style={styles.title}>{title}</Text>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <View style={styles.content}>
        <SingleRow title={I18n.tEn('chessRegistration')} data={data.chessRegistration} />
        {this.renderTitle(I18n.tEn('transferExistingHin'))}
        <DoubleRow title1={I18n.tEn('currentSpnsoring')} data1={data.currentBroker}
          title2={I18n.tEn('brokerPID')} data2={data.brokerPID} />
        <SingleRow title={I18n.tEn('accountName')} data={data.accountName} />
        <SingleRow title={I18n.tEn('accountDesign')} data={data.accountDesign} />
        <SingleRow title={I18n.tEn('registrationAddress')} data={data.registrationAddress} />
        <SingleRow title={I18n.tEn('holderIdentification')} data={data.holderIdentify} />
        <CheckboxVertical listCheck={listCheck} data={data.transfer} />
        {this.renderTitle(I18n.tEn('authorisation'))}
        {
          data.accountHolder.map((e, i) => {
            let printName = `Account Holder ${i + 1} (Print Name)`;
            return (
              <SingleRow title={printName} data={e} />
            )
          })
        }
        <SingleRow title={I18n.tEn('date')} data={data.date} />
      </View>
    )
  }
}
