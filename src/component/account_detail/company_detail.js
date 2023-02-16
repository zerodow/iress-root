import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SingleRow from './single_row';
import DoubleRow from './double_row';
import CheckboxHorizontal from './checkbox_horizontal';
import styles from './style/account_detail';
import I18n from '../../modules/language';

export default class CompanyDetail extends Component {
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
      <View style={[styles.content, { marginTop: 8 }]}>
        <SingleRow title={I18n.tEn('companyType')} data={data.companyType} />
        <SingleRow title={I18n.tEn('companyName2')} data={data.companyName} />
        <SingleRow title={I18n.tEn('industryType')} data={data.industryType} />
        <SingleRow title={I18n.tEn('country2')} data={data.country} />
        <DoubleRow title1={`                                              ${I18n.tEn('ACNARBN')}`} data1={data.acn}
          title2={I18n.tEn('ORforeign')} data2={data.or} />
        <DoubleRow title1={I18n.tEn('companyTaxFileNumber')} data1={data.companyTax}
          title2={I18n.tEn('orExemptionCode')} data2={data.or} />
        <SingleRow title={I18n.tEn('companyAddress')} data={data.companyAddress} />
        <SingleRow title={I18n.tEn('physicalPlace')} data={data.physicalPlace} />
        <SingleRow title={I18n.tEn('sameAsAbove')} data={data.companyAddress} />
        <SingleRow title={I18n.tEn('isOrganised')} data={data.isOrganised} />
        <SingleRow title={I18n.tEn('isFinancial')} data={data.isFinancial} />
        {this.renderTitle(I18n.tEn('mainSources'))}
        <View style={{ width: '100%', height: 24, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#0000001e' }}>
          <Text style={styles.mainText}>{data.mainSource}</Text>
        </View>
        {this.renderTitle(I18n.tEn('regulatory'))}
        <SingleRow title={I18n.tEn('regulatorName')} data={data.regulatorName} />
        <SingleRow title={I18n.tEn('licenseNumber')} data={data.licenseNumber} />
        <Text style={[styles.mainText, { paddingTop: 20, paddingBottom: 8 }]}>{I18n.tEn('australianListedCompany')}</Text>
        <SingleRow title={I18n.tEn('marketAndExchange')} data={data.exchange} />
        <Text style={[styles.mainText, { paddingTop: 20, paddingBottom: 8 }]}>{I18n.tEn('majorityOwned')}</Text>
        <SingleRow title={I18n.tEn('companyName3')} data={data.companyName} />
        <SingleRow title={I18n.tEn('marketAndExchange')} data={data.exchange} />
        <Text style={[styles.mainText, { paddingTop: 20, paddingBottom: 8 }]}>{I18n.tEn('foreignCompany')}</Text>
        <SingleRow title={I18n.tEn('foreignRegisteredAuthority')} data={data.foreign} />
      </View>
    )
  }
}
