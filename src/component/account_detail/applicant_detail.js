import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SingleRow from './single_row';
import DoubleRow from './double_row';
import CheckboxHorizontal from './checkbox_horizontal';
import styles from './style/account_detail';
import I18n from '../../modules/language';

export default class ApplicantDetail extends Component {
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
    return (
      <View style={{ width: '100%' }}>
        {
          this.props.data.map((e, i) => {
            let header = `APPLICANT ${i + 1} / DIRECTOR ${i + 1}`;
            return (
              <View style={{ width: '100%' }}>
                {this.renderHeader(header)}
                <View style={styles.content}>
                  <SingleRow title={I18n.tEn('title')} data={e.title} />
                  <SingleRow title={I18n.tEn('givenName')} data={e.givenName} />
                  <SingleRow title={I18n.tEn('surname')} data={e.surName} />
                  <DoubleRow title1={I18n.tEn('DOB')} data1={e.dob}
                    title2={I18n.tEn('Gender')} data2={e.gender} />
                  <SingleRow title={I18n.tEn('residentialAddress')} data={e.residential} />
                  <DoubleRow title1={I18n.tEn('occupation')} data1={e.occupation}
                    title2={I18n.tEn('industry')} data2={e.industry} />
                  <DoubleRow title1={I18n.tEn('mobile')} data1={e.mobile}
                    title2={I18n.tEn('otherPhone')} data2={e.ortherPhone} />
                  <SingleRow title={I18n.tEn('email')} data={e.email} />
                  {this.renderTitle(I18n.tEn('citizenshipResidency'))}
                  <CheckboxHorizontal object={I18n.tEn('country')}
                    listCheck={this.props.listCheck}
                    fields={e.country} />
                  <SingleRow title={I18n.tEn('areYou')} data={e.pep} />
                  {this.renderTitle(I18n.tEn('consentToElectronicVerification'))}
                  <View style={{ height: 24, borderBottomWidth: 1, borderColor: '#0000001e' }}>
                    <Text style={styles.mainText}>Yes</Text>
                  </View>
                  <SingleRow title={I18n.tEn('previousAddress')} data={e.priviousAddress} />
                </View>
              </View>
            );
          })
        }
      </View>
    )
  }
}
