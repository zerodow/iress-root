import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SingleRowInput from './single_row_input';
import DoubleRow from './double_row';
import DoubleRowInput from './double_row_input';
import CheckboxHorizontal from './checkbox_horizontal';
import SingleRowCheckboxHorizontal from './single_row_checkbox_horizontal';
import styles from './style/account_detail';
import I18n from '../../modules/language';

export default class ApplicantDetailEdit extends Component {
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
                <View style={styles.contentEdit}>
                  <SingleRowInput title={I18n.tEn('title')} data={e.title}
                    onChangeText={this.onChangeText.bind(this, `applicant`, 'title', i)} />
                  <SingleRowInput title={I18n.tEn('givenName')} data={e.givenName}
                    onChangeText={this.onChangeText.bind(this, 'applicant', 'givenName', i)} />
                  <SingleRowInput title={I18n.tEn('surname')} data={e.surName}
                    onChangeText={this.onChangeText.bind(this, 'applicant', 'surName', i)} />
                  <DoubleRowSpecial data1={e.dob} data2={e.gender} index={i}
                    onShowFilter={this.onShowFilter.bind(this, 'gender', i)} />
                  <DoubleRow title1={I18n.tEn('DOB')} data1={e.dob}
                    title2={I18n.tEn('Gender')} data2={e.gender} />
                  <SingleRowInput title={I18n.tEn('residentialAddress')} data={e.residential}
                    onChangeText={this.onChangeText.bind(this, 'applicant', 'residential', i)} />
                  <DoubleRowInput title1={I18n.tEn('occupation')} data1={e.occupation}
                    onChangeText1={this.onChangeText.bind(this, 'applicant', 'occupation', i)}
                    title2={I18n.tEn('industry')} data2={e.industry}
                    onChangeText2={this.onChangeText.bind(this, 'applicant', 'industry', i)} />
                  <DoubleRowInput title1={I18n.tEn('mobile')} data1={e.mobile}
                    onChangeText1={this.onChangeText.bind(this, 'applicant', 'mobile', i)}
                    title2={I18n.tEn('otherPhone')} data2={e.ortherPhone}
                    onChangeText2={this.onChangeText.bind(this, 'applicant', 'ortherPhone', i)} />
                  <SingleRowInput title={I18n.tEn('email')} data={e.email}
                    onChangeText={this.onChangeText.bind(this, 'applicant', 'email', i)} />
                  {this.renderTitle(I18n.tEn('citizenshipResidency'))}
                  <CheckboxHorizontal object={I18n.tEn('country')}
                    listCheck={listCheck}
                    fields={e.country} />
                  <SingleRowCheckboxHorizontal title={I18n.tEn('areYou')} data={e.pep} />
                  <SingleRowCheckboxHorizontal bold text title={I18n.tEn('consentToElectronicVerification')} data={e.pep} />
                  <SingleRowInput title={I18n.tEn('previousAddress')} data={e.priviousAddress}
                    onChangeText={this.onChangeText.bind(this, 'applicant', 'priviousAddress', i)} />
                </View>
                {
                  i === data2.length - 1 ? (<View style={styles.add}>
                    <Text style={styles.title}>{I18n.tEn('addApplicant')}</Text>
                    <Icon name='ios-add-circle-outline' size={24} color='#10a8b2' style={{ paddingLeft: 16 }} />
                  </View>) : null
                }
              </View>
            )
          })
        }
      </View>
    )
  }
}
