import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, PixelRatio } from 'react-native';
import SingleRow from './../../component/account_detail/single_row';
import IconCheck from './../../component/account_detail/icon_check';
import DoubleRow from './../../component/account_detail/double_row';
import DoubleRowInput from './../../component/account_detail/double_row_input';
import DoubleRowSpecial from './../../component/account_detail/double_row_special';
import SingleRowInput from './../../component/account_detail/single_row_input';
import SingleRowCheckboxHorizontal from './../../component/account_detail/single_row_checkbox_horizontal';
import SingleRowCheckboxVertical from './../../component/account_detail/single_row_checkbox_vertical';
import CheckboxHorizontal from './../../component/account_detail/checkbox_horizontal';
import CheckboxVertical from './../../component/account_detail/checkbox_vertical';
import styles from './style/trust';
import I18n from '../../modules/language';
import Icon from 'react-native-vector-icons/Ionicons';
import Picker from 'react-native-picker';
import ApplicantDetail from './../../component/account_detail/applicant_detail';
import LinkedCashAccount from './../../component/account_detail/linked_cash_account';
import TradingPlatform from './../../component/account_detail/trading_platform';
import ApplicantToTrade from './../../component/account_detail/applicant_to_trade';
import ChessSponsorship from './../../component/account_detail/chess_sponsorship';
import MultiTextbox from './../../component/account_detail/multi_textbox';
import InterestInAPublic from './../../component/account_detail/interest_in_a_public';
import CompanyDetail from './../../component/account_detail/company_detail';
import AdditionalDirectors from './../../component/account_detail/additional_directors';
import BeneficialOwnership from './../../component/account_detail/beneficial_ownership';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as trustActions from './trust_detail.actions';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const listData = {
  trustDetail: {
    trustType: 'Charitable',
    trustABN: 'Beli',
    purpose: 'Bond',
    fullName: 'Vietnam',
    companyName: '00000',
    country: '00000',
    tax: '000000',
    or: '00000',
    mainSource: 'Advisor',
    isOrganised: 'No',
    areAny: 'No',
    settlorName: 'Z',
    wasTheTrust: 'Yes'
  },
  applicantDetail: [
    {
      title: 'Mr.',
      givenName: 'Beli',
      surName: 'Bond',
      dob: '01/05/2001',
      gender: 'Male',
      residential: 'Australia',
      occupation: 'Developer',
      industry: 'Technology',
      mobile: '61 21 262 641',
      ortherPhone: '61 77  741 220',
      email: 'beli.bonds@gmail.com',
      country: [
        {
          title: 'Australia',
          citizen: false,
          residesIn: true,
          taxResident: true
        },
        {
          title: 'America',
          citizen: true,
          residesIn: false,
          taxResident: false
        }
      ],
      pep: 'No',
      consentTo: 'Yes',
      priviousAddress: 'Australia'
    },
    {
      title: 'Mr.',
      givenName: 'Beli',
      surName: 'Bond',
      dob: '01/05/2001',
      gender: 'Male',
      residential: 'Australia',
      occupation: 'Developer',
      industry: 'Technology',
      mobile: '61 21 262 641',
      ortherPhone: '61 77  741 220',
      email: 'beli.bonds@gmail.com',
      country: [
        {
          title: 'Australia',
          citizen: false,
          residesIn: true,
          taxResident: true
        },
        {
          title: 'America',
          citizen: true,
          residesIn: false,
          taxResident: false
        }
      ],
      pep: 'No',
      priviousAddress: 'Australia'
    }
  ],
  additionalDirectors: [
    { fullName: 'Beli Bond' },
    { fullName: 'Beli Bond' },
    { fullName: 'Beli Bond' },
    { fullName: 'Beli Bond' }
  ],
  beneficialOwnership: [
    {
      fullName: 'Beli Bond',
      residentialAddress: 'Australia',
      dob: '01/05/1988',
      isBeneficial: 'No',
      hasBeneficial: 'No'
    },
    {
      fullName: 'Beli Bond',
      residentialAddress: 'Australia',
      dob: '01/05/1988',
      isBeneficial: 'No',
      hasBeneficial: 'No'
    }
  ],
  linkedCashAccount: {
    providerName: 'Bank West',
    bsb: '00000',
    acno: '000001',
    incomeDirection: 'No'
  },
  chessSponsorship: {
    chessRegistration: 'A',
    currentBroker: '61 21 262 641',
    brokerPID: '61 77 741 220',
    accountName: 'beli.bonds@gmail.com',
    accountDesign: 'beli.bonds@gmail.com',
    registrationAddress: 'beli.bonds@gmail.com',
    holderIdentify: '123456789',
    likeToTransfer: {
      transferAll: false,
      transferSome: true
    },
    accountHolder: [
      '61 21 262 641',
      '61 21 262 641',
      '61 21 262 641'
    ],
    date: '05/01/2017'
  },
  tradingPlatform: [
    { platform: 'Iress trader' },
    { platform: 'Iress trader' }
  ],
  applicantToTrade: {
    likeToApply: 'No'
  },
  interestInAPuplic: {
    areYouOr: 'Yes',
    tickerSymbol: 'No',
    applicantName: 'D'
  }
}

const listCheck = [
  { name: 'citizen', title: 'Citizen' },
  { name: 'residesIn', title: 'Resides in' },
  { name: 'taxResident', title: 'Tex Resident' }
]

const listCheck2 = [
  'Family',
  'Testamentary',
  'Discretionary',
  'Charitable*'
]

const listCheck3 = [
  'Employment',
  'Superannuation Savings',
  'Financial investments',
  'Inheritance / Gift'
]

const listCheck4 = [
  'Transfer my/our HIN and all its holdings',
  'Transfer only some of holdings from my/our HIN'
]

const companyTypes = [
  'Proprietary',
  'Public'
]

const providerNames = [
  'Bank West',
  'Bank East'
]

const platforms = [
  'Iress trader',
  'Iress trader 2'
]

export class TrustDetail extends Component {
  constructor(props) {
    super(props);
        this.listData = listData;
    this.state = {
      visible: false,
      editMode: false
    }
  }

  onEditButtonPress(header) {
    let state = this.state.editMode;
    this.setState({ editMode: !state });
  }

  renderHeader(header) {
    let icon = null;
    let edit = (
      <Icon name='ios-create-outline' style={[styles.iconHeader, { width: '10%' }]} size={30}
        onPress={this.onEditButtonPress.bind(this, header)} />
    );
    let done = (
      <TouchableOpacity
        onPress={this.onEditButtonPress.bind(this, header)}>
        <Text style={styles.textHeader}>Done</Text>
      </TouchableOpacity>
    );
    if (this.state.editMode) {
      icon = done;
    } else {
      icon = edit;
    }
    return (
      <View style={styles.headerDetail}>
        <Text style={[styles.textHeader, { width: '90%' }]}>{header}</Text>
        {icon}
      </View>
    );
  }

  renderSubHeader(header) {
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

  onShowFilter(type, index) {
    let listData = [];
    let selectedValue = null;
    switch (type) {
      case 'gender':
        listData = ['Male', 'Female'];
        selectedValue = this.props.applicant[index].gender;
        break;
      case 'companyType':
        listData = companyTypes;
        selectedValue = this.props.company.companyType;
        break;
      case 'providerName':
        listData = providerNames;
        selectedValue = this.props.linked.providerName;
        break;
      case 'platform':
        listData = platforms;
        selectedValue = this.props.trading[index].platform;
        break;
    }
    const visible = this.state.visible;
    if (visible) {
      this.setState({ visible: false })
      Picker.hide()
    } else {
      this.setState({
        visible: true
      }, this.pickerVisible);
      Picker.init({
        pickerConfirmBtnText: 'Confirm',
        pickerCancelBtnText: 'Cancel',
        pickerTitleText: 'Select',
        pickerBg: [255, 255, 255, 1],
        pickerFontColor: [0, 0, 0, 1],
        selectedValue: [selectedValue],
        pickerData: listData,
        onPickerConfirm: data => {
          switch (type) {
            case 'gender':
              this.props.actions.changedProperty('applicant', 'gender', index, data[0]);
              break;
            case 'companyType':
              this.props.actions.changedProperty('company', 'companyType', data[0]);
              break;
            case 'providerName':
              this.props.actions.changedProperty('linked', 'providerName', data[0]);
              break;
            case 'platform':
              this.props.actions.changedProperty('trading', 'platform', index, data[0]);
              break;
          }
        },
        onPickerCancel: data => {
          this.setState({ visible: false })
        },
        onPickerSelect: data => {
          this.setState({ visible: false })
        }
      });
      Picker.show()
    }
  }

  onChangeProperty(type, field, index, value) {
    this.props.actions.changedProperty(type, field, index, value);
  }

  choose(type, field, index, value) {
    this.props.actions.changedProperty(type, field, index, value);
  }

  tickCountry(index, order, value) {
    let country = null;
    switch (value) {
      case 0:
        country = 'citizen'
        break;
      case 1:
        country = 'residesIn'
        break;
      case 2:
        country = 'taxResident'
        break;
    }
    this.props.actions.changedApplicantCountry(index, order, country);
  }

  render() {
    let trustDetail = null;
    let applicantDetail = null;
    let linkedCashAccount = null;
    let tradingPlatform = null;
    let applicantToTrade = null;
    let chessSponsorship = null;
    let interestInAPublic = null;
    let beneficialOwership = null;
    let companyDetail = null;
    let additionalDirectors = null;
    if (this.state.editMode) {
      trustDetail = (
        <View style={[styles.content, { marginTop: 8 }]}>
          <Text style={styles.textField}>{I18n.t('trustType')}</Text>
          <View style={{ marginLeft: 16 }}>
            <Text style={[CommonStyle.textMainHeaderOpacity2, { paddingTop: 10 }]}>{I18n.t('unregulatedTrust')}</Text>
            <View style={{ marginLeft: 16 }}>
              <SingleRowCheckboxVertical listCheck={listCheck2} data={this.props.trust.trustType}
                onEvent={this.choose.bind(this, 'trust', 'trustType', null)} />
              <SingleRowInput title={I18n.t('trustABNIfAny')} data={this.props.trust.trustABN}
                onChangeText={this.onChangeProperty.bind(this, 'trust', 'trustABN')} />
              <SingleRowInput title={I18n.t('ifACharity')} data={this.props.trust.purpose}
                onChangeText={this.onChangeProperty.bind(this, 'trust', 'purpose')} />
            </View>
            <Text style={[CommonStyle.textMainHeaderOpacity2, { paddingTop: 16 }]}>{I18n.t('regulatedTrust')}</Text>
            <View style={{ marginLeft: 16 }}>
              <SingleRowCheckboxVertical listCheck={['Self-Managed Super Fund']} data={this.props.trust.regulatedTrust}
                onEvent={this.choose.bind(this, 'trust', 'regulatedTrust', null)} />
              <SingleRowInput title={I18n.t('SMSFABN')} data={this.props.trust.trustABN}
                onChangeText={this.onChangeProperty.bind(this, 'trust', 'trustABN')} />
              <SingleRowCheckboxVertical
                listCheck={['Registered Managed Investment Scheme']}
                data={this.props.trust.trustType} />
              <SingleRowInput title={I18n.t('ARSN')} data={this.props.trust.trustABN}
                onChangeText={this.onChangeProperty.bind(this, 'trust', 'trustABN')} />
              <SingleRowCheckboxVertical
                listCheck={['Government superannuation fund']}
                data={this.props.trust.trustType} />
              <SingleRowInput title={I18n.t('legislationEstablishing')} data={this.props.trust.trustABN}
                onChangeText={this.onChangeProperty.bind(this, 'trust', 'trustABN')} />
              <SingleRowCheckboxVertical
                listCheck={['Other regulated trust']}
                data={this.props.trust.trustType} />
              <SingleRowInput title={I18n.t('regulatorName2')} data={this.props.trust.trustABN}
                onChangeText={this.onChangeProperty.bind(this, 'trust', 'trustABN')} />
              <SingleRowInput title={I18n.t('trustABNor')} data={this.props.trust.trustABN}
                onChangeText={this.onChangeProperty.bind(this, 'trust', 'trustABN')} />
            </View>
          </View>
          <SingleRowInput title={I18n.t('fullNameOfTrust')} data={this.props.trust.trustABN}
            onChangeText={this.onChangeProperty.bind(this, 'trust', 'trustABN')} />
          <SingleRowInput title={I18n.t('companyNameTrust')} data={this.props.trust.trustABN}
            onChangeText={this.onChangeProperty.bind(this, 'trust', 'trustABN')} />
          <SingleRowInput title={I18n.t('countryTrust')} data={this.props.trust.trustABN}
            onChangeText={this.onChangeProperty.bind(this, 'trust', 'trustABN')} />
          <DoubleRowInput title1={I18n.t('taxFileNumber')} data1={this.props.trust.fullName}
            onChangeText1={this.onChangeProperty.bind(this, 'trust', 'fullName')}
            title2={I18n.t('orExemptionCode')} data2={this.props.trust.companyName}
            onChangeText2={this.onChangeProperty.bind(this, 'trust', 'companyName')} />
          <SingleRowCheckboxHorizontal title={I18n.t('isTheTrustOrganised')} data={this.props.trust.isOrganised}
            onPressYes={this.onChangeProperty.bind(this, 'trust', 'isOrganised', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'trust', 'isOrganised', null, false)} />
          <SingleRowCheckboxHorizontal title={I18n.t('areAnyOfTheTrust')} data={this.props.trust.areAny}
            onPressYes={this.onChangeProperty.bind(this, 'trust', 'areAny', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'trust', 'areAny', null, false)} />
          {this.renderTitle(I18n.t('mainSources'))}
          <SingleRowCheckboxVertical other listCheck={listCheck3} data={this.props.trust.mainSource}
            onEvent={this.choose.bind(this, 'trust', 'mainSource', null)} />
          {this.renderTitle(I18n.t('settlorOfTheTrust'))}
          <SingleRowCheckboxHorizontal title={I18n.t('wasTheTrustEstablished')} data={this.props.trust.wasTheTrust}
            onPressYes={this.onChangeProperty.bind(this, 'trust', 'wasTheTrust', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'trust', 'wasTheTrust', null, false)} />
          <SingleRowInput title={I18n.t('fullNameOfSettlor')} data={this.props.trust.settlorName}
            onChangeText={this.onChangeProperty.bind(this, 'trust', 'settlorName')} />
        </View>
      );
      companyDetail = this.props.type === 'individual_trustee' ? null : (
        <View style={[styles.contentEdit, { marginTop: 8 }]}>
          <View style={{ width: '100%' }}>
            <SingleRow title={I18n.t('companyType')} data={this.props.company.companyType} />
            <Text style={styles.textExtra}>{I18n.t('mandatory')}</Text>
            <Icon name='md-arrow-dropdown' style={styles.iconPicker}
              onPress={this.onShowFilter.bind(this, 'companyType')} />
          </View>
          <SingleRowInput title={I18n.t('companyName2')} data={this.props.company.companyName}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'companyName', null)} />
          <SingleRowInput title={I18n.t('industryType')} data={this.props.company.industryType}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'industryType', null)} />
          <SingleRowInput title={I18n.t('country2')} data={this.props.company.country}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'country', null)} />
          <DoubleRowInput title1={`                                              ${I18n.t('ACNARBN')}`} data1={this.props.company.acn}
            onChangeText1={this.onChangeProperty.bind(this, 'company', 'acn', null)}
            title2={I18n.t('ORforeign')} data2={this.props.company.or}
            onChangeText2={this.onChangeProperty.bind(this, 'company', 'or', null)} />
          <DoubleRowInput title1={I18n.t('companyTaxFileNumber')} data1={this.props.company.companyTax}
            onChangeText1={this.onChangeProperty.bind(this, 'company', 'companyTax', null)}
            title2={I18n.t('orExemptionCode')} data2={this.props.company.or}
            onChangeText2={this.onChangeProperty.bind(this, 'company', 'or', null)} />
          <SingleRowInput title={I18n.t('companyAddress')} data={this.props.company.companyAddress}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'companyAddress', null)} />
          <SingleRowInput title={I18n.t('physicalPlace')} data={this.props.company.physicalPlace}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'physicalPlace', null)} />
          <SingleRowInput title={I18n.t('sameAsAbove')} data={this.props.company.companyAddress}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'companyAddress', null)} />
          <SingleRowCheckboxHorizontal title={I18n.t('isOrganised')} data={this.props.company.isOrganised}
            onPressYes={this.onChangeProperty.bind(this, 'company', 'isOrganised', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'company', 'isOrganised', null, false)} />
          <SingleRowCheckboxHorizontal title={I18n.t('isFinancial')} data={this.props.company.isFinancial}
            onPressYes={this.onChangeProperty.bind(this, 'company', 'isFinancial', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'company', 'isFinancial', null, false)} />
          {this.renderTitle(I18n.t('mainSources'))}
          <SingleRowCheckboxVertical listCheck={listCheck2} data={this.props.company.mainSource} other
            onEvent={this.choose.bind(this, 'company', 'mainSource', null)} />
          {this.renderTitle(I18n.t('regulatory'))}
          <View style={{ width: '100%' }}>
            <SingleRowInput title={I18n.t('regulatorName')} data={this.props.company.regulatorName} />
            <Text style={styles.textExtra}>{I18n.t('ifApplicable')}</Text>
          </View>
          <SingleRowInput title={I18n.t('licenseNumber')} data={this.props.company.licenseNumber}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'licenseNumber')} />
          <Text style={[styles.mainText, { paddingTop: 20, paddingBottom: 8 }]}>{I18n.t('australianListedCompany')}</Text>
          <SingleRowInput title={I18n.t('marketAndExchange')} data={this.props.company.exchange}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'exchange')} />
          <Text style={[styles.mainText, { paddingTop: 20, paddingBottom: 8 }]}>{I18n.t('majorityOwned')}</Text>
          <SingleRowInput title={I18n.t('companyName3')} data={this.props.company.companyName}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'companyName')} />
          <SingleRowInput title={I18n.t('marketAndExchange')} data={this.props.company.exchange}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'exchange')} />
          <Text style={[styles.mainText, { paddingTop: 20, paddingBottom: 8 }]}>{I18n.t('foreignCompany')}</Text>
          <SingleRowInput title={I18n.t('foreignRegisteredAuthority')} data={this.props.company.foreign}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'foreign')} />
        </View>
      );
      applicantDetail = (
        this.props.applicant.map((e, i) => {
          let header = `APPLICANT ${i + 1} / DIRECTOR ${i + 1}`;
          return (
            <View style={{ width: '100%' }}>
              {this.renderSubHeader(header)}
              <View style={styles.contentEdit}>
                <SingleRowInput title={I18n.t('title')} data={e.title}
                  onChangeText={this.onChangeProperty.bind(this, `applicant`, 'title', i)} />
                <SingleRowInput title={I18n.t('givenName')} data={e.givenName}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'givenName', i)} />
                <SingleRowInput title={I18n.t('surname')} data={e.surName}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'surName', i)} />
                <DoubleRowSpecial data1={e.dob} data2={e.gender} index={i}
                  onShowFilter={this.onShowFilter.bind(this, 'gender', i)} />
                <DoubleRow title1={I18n.t('DOB')} data1={e.dob}
                  title2={I18n.t('Gender')} data2={e.gender} />
                <SingleRowInput title={I18n.t('residentialAddress')} data={e.residential}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'residential', i)} />
                <DoubleRowInput title1={I18n.t('occupation')} data1={e.occupation}
                  onChangeText1={this.onChangeProperty.bind(this, 'applicant', 'occupation', i)}
                  title2={I18n.t('industry')} data2={e.industry}
                  onChangeText2={this.onChangeProperty.bind(this, 'applicant', 'industry', i)} />
                <DoubleRowInput title1={I18n.t('mobile')} data1={e.mobile}
                  onChangeText1={this.onChangeProperty.bind(this, 'applicant', 'mobile', i)}
                  title2={I18n.t('otherPhone')} data2={e.ortherPhone}
                  onChangeText2={this.onChangeProperty.bind(this, 'applicant', 'ortherPhone', i)} />
                <SingleRowInput title={I18n.t('email')} data={e.email}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'email', i)} />
                {this.renderTitle(I18n.t('citizenshipResidency'))}
                <CheckboxHorizontal object={I18n.t('country')} listCheck={listCheck} fields={e.country}
                  onPress={this.tickCountry.bind(this, i)} />
                <SingleRowCheckboxHorizontal title={I18n.t('areYou')} data={e.areYou}
                  onPressYes={this.onChangeProperty.bind(this, 'applicant', 'areYou', i, true)}
                  onPressNo={this.onChangeProperty.bind(this, 'applicant', 'areYou', i, false)} />
                <SingleRowCheckboxHorizontal bold text title={I18n.t('consentToElectronicVerification')} data={e.consent}
                  onPressYes={this.onChangeProperty.bind(this, 'applicant', 'consent', i, true)}
                  onPressNo={this.onChangeProperty.bind(this, 'applicant', 'consent', i, false)} />
                <SingleRowInput title={I18n.t('previousAddress')} data={e.priviousAddress}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'priviousAddress', i)} />
              </View>
              {
                i === this.props.applicant.length - 1 ? (<View style={styles.add}>
                  <Text style={styles.title}>{I18n.t('addApplicant')}</Text>
                  <Icon name='ios-add-circle-outline' size={24} color='#10a8b2' style={{ paddingLeft: 16 }} />
                </View>) : null
              }
            </View>
          )
        })
      );
      linkedCashAccount = (
        <View style={styles.contentEdit}>
          {this.renderTitle(I18n.t('existingCashAccount'))}
          <View style={{ width: '50%' }}>
            <SingleRow title={I18n.t('providerName')} data={this.props.linkedproviderName} />
            <Icon name='md-arrow-dropdown' style={styles.iconPicker}
              onPress={this.onShowFilter.bind(this, 'providerName')} />
          </View>
          <DoubleRowInput title1={I18n.t('bsb')} data1={this.props.linkedbsb}
            onChangeText1={this.onChangeProperty.bind(this, 'linked', 'bsb')}
            title2={I18n.t('acno')} data2={this.props.linkedacno}
            onChangeText1={this.onChangeProperty.bind(this, 'linked', 'acno')} />
          <SingleRowCheckboxHorizontal bold title={I18n.t('incomeDirection')} data={this.props.linked.incomeDirection}
            onPressYes={this.onChangeProperty.bind(this, 'linked', 'incomeDirection', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'linked', 'incomeDirection', null, false)} />
        </View>
      );
      additionalDirectors = this.props.type === 'individual_trustee' ? null : (
        <View style={styles.contentEdit}>
          {
            this.props.additional.map((e, i) =>
              <SingleRowInput title={` ${i + 1}. ${I18n.t('fullName')}`} data={e.fullName}
                onChangeText={this.onChangeProperty.bind(this, `additional`, 'fullName', i)} />
            )
          }
        </View>
      );
      beneficialOwership = this.props.type === 'individual_trustee' ? null : (
        this.props.beneficial.map((e, i) => {
          let person = `BENEFICIAL OWNER ${i + 1}`;
          let sample = `Same as Applicant ${i + 1}`
          return (
            <View style={{ width: '100%', paddingLeft: 16 }}>
              {
                i === 0 ? (
                  <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
                    <Text style={styles.textExtra2}>PROPRIETARY COMPANIES ONLY</Text>
                  </View>
                ) : null
              }
              {this.renderTitle(person)}
              <View style={[styles.rowCheckVertical, { marginTop: -16 }]}>
                <View style={[styles.textCol1, { paddingRight: 8 }]}>
                  <IconCheck data={false} onPress={this.props.onPress} />
                </View>
                <View style={styles.rowContentNoBorder}>
                  <Text style={styles.mainText2}>{sample}</Text>
                </View>
              </View>
              <SingleRowInput title={I18n.t('fullName')} data={e.fullName}
                onChangeText={this.onChangeProperty.bind(this, `additional`, 'fullName', i)} />
              <SingleRowInput title={I18n.t('residentialAddress2')} data={e.residentialAddress}
                onChangeText={this.onChangeProperty.bind(this, `additional`, 'residentialAddress', i)} />
              <SingleRowInput title={I18n.t('DOB2')} data={e.dob}
                onChangeText={this.onChangeProperty.bind(this, `additional`, 'dob', i)} />
              <SingleRowCheckboxHorizontal title={I18n.t('isBeneficial')} data={e.isBeneficial}
                onPressYes={this.onChangeProperty.bind(this, 'beneficial', 'isBeneficial', i, true)}
                onPressNo={this.onChangeProperty.bind(this, 'beneficial', 'isBeneficial', i, false)} />
              <SingleRowCheckboxHorizontal title={I18n.t('hasBeneficial')} data={e.hasBeneficial}
                onPressYes={this.onChangeProperty.bind(this, 'beneficial', 'hasBeneficial', i, true)}
                onPressNo={this.onChangeProperty.bind(this, 'beneficial', 'hasBeneficial', i, false)} />
            </View>
          );
        })
      );
      tradingPlatform = (
        <View style={styles.content}>
          {
            this.props.trading.map((e, i) => {
              let header = `APPLICANT ${i + 1} / DIRECTOR ${i + 1}`;
              return (
                <View style={{ width: '100%', paddingRight: 16 }}>
                  {
                    i === 0 ? (
                      <View style={{ width: '100%', alignItems: 'flex-end', paddingTop: 8 }}>
                        <Text style={styles.orText}>{I18n.t('mandatory')}</Text>
                      </View>
                    ) : null
                  }
                  {this.renderTitle(header)}
                  <View style={{ width: '100%' }}>
                    <SingleRow title={I18n.t('platform')} data={e.platform} />
                    <Icon name='md-arrow-dropdown' style={styles.iconPicker}
                      onPress={this.onShowFilter.bind(this, 'platform', i)} />
                  </View>
                </View>
              )
            })
          }
        </View>
      );
      applicantToTrade = (
        <View style={styles.contentEdit}>
          <SingleRowCheckboxHorizontal title={I18n.t('wylta')} data={this.props.applicantToTrade.likeToApply}
            onPressYes={this.onChangeProperty.bind(this, 'applicantToTrade', 'likeToApply', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'applicantToTrade', 'likeToApply', null, false)} />
        </View>
      );
      chessSponsorship = (
        <View style={{ width: '100%' }}>
          <View style={styles.contentEdit}>
            <View style={{ width: '100%', marginTop: 8 }}>
              <SingleRow title={I18n.t('chessRegistration')} data={this.props.chesschessRegistration}
                onChangeText={this.onChangeProperty.bind(this, 'chess', 'chessRegistration')} />
              <Text style={styles.textExtra}>{I18n.t('mandatory')}</Text>
            </View>
            <View style={{ width: '100%' }}>
              {this.renderTitle(I18n.t('transferExistingHin'))}
              <Text style={[styles.textExtra, { top: 40 }]}>OPTIONAL</Text>
            </View>
            <DoubleRowInput title1={I18n.t('currentSpnsoring')} data1={this.props.chesscurrentBroker}
              onChangeText1={this.onChangeProperty.bind(this, 'chess', 'currentBroker')}
              title2={I18n.t('brokerPID')} data2={this.props.chessbrokerPID}
              onChangeText2={this.onChangeProperty.bind(this, 'chess', 'brokerPID')} />
            <SingleRowInput title={I18n.t('accountName')} data={this.props.chessaccountName}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountName')} />
            <SingleRowInput title={I18n.t('accountDesign')} data={this.props.chessaccountDesign}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountDesign')} />
            <SingleRowInput title={I18n.t('registrationAddress')} data={this.props.chessregistrationAddress}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountDesign')} />
            <View style={{ width: '100%' }}>
              <SingleRowInput title={I18n.t('holderIdentification')} data={this.props.chessholderIdentify}
                onChangeText={this.onChangeProperty.bind(this, `chess`, 'holderIdentify')} />
              <Text style={[styles.textExtra3]}>Max 11digits</Text>
            </View>
            <CheckboxVertical listCheck={listCheck4} data={this.props.chess.transfer}
              onPress={this.choose.bind(this, 'chess', 'transfer', null)} />
            {this.renderTitle(I18n.t('authorisation'))}
            {
              this.props.chess.accountHolder.map((e, i) => {
                let printName = `Account Holder ${i + 1} (Print Name)`;
                return (
                  <SingleRowInput title={printName} data={e}
                    onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountHolders', i)} />
                )
              })
            }
            <SingleRowInput title={I18n.t('date')} data={this.props.chessdate}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'date')} />

          </View>
        </View>
      );
      interestInAPublic = (
        <View style={styles.contentEdit}>
          <SingleRowCheckboxHorizontal title={I18n.t('areYouOr')} data={this.props.interest.areYouOr}
            onPressYes={this.onChangeProperty.bind(this, 'interest', 'areYouOr', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'interest', 'areYouOr', null, false)} />
          <SingleRowInput title={I18n.t('tickerSymbol')} data={this.props.interesttickerSymbol}
            onChangeText={this.onChangeProperty.bind(this, 'interest', 'tickerSymbol')} />
          <SingleRowInput title={I18n.t('applicantName')} data={this.props.interestapplicantName}
            onChangeText={this.onChangeProperty.bind(this, 'interest', 'applicantName')} />
        </View>
      );
    } else {
      trustDetail = (
        <View style={[styles.content, { marginTop: 8 }]}>
          <SingleRow title={I18n.t('trustType')} data={this.props.trust.trustType} />
          <SingleRow title={I18n.t('trustABN')} data={this.props.trust.trustABN} />
          <SingleRow title={I18n.t('purpose')} data={this.props.trust.purpose} />
          <SingleRow title={I18n.t('fullNameOfTrust')} data={this.props.trust.funnName} />
          <SingleRow title={I18n.t('companyNameTrust')} data={this.props.trust.companyName} />
          <SingleRow title={I18n.t('countryTrust')} data={this.props.trust.country} />
          <DoubleRow title1={I18n.t('taxFileNumber')} data1={this.props.trust.tax}
            title2={I18n.t('orExemptionCode')} data2={this.props.trust.or} />
          <MultiTextbox title={I18n.t('anAbbrevationTrust')} />
          <SingleRow title={I18n.t('isTheTrustOrganised')} data={this.props.trust.isOrganised} />
          <SingleRow title={I18n.t('areAnyOfTheTrust')} data={this.props.trust.areAny} />
          {this.renderTitle(I18n.t('mainSources'))}
          <View style={{ width: '100%', height: 24, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#0000001e' }}>
            <Text style={styles.mainText}>{this.props.trust.mainSource}</Text>
          </View>
          {this.renderTitle(I18n.t('settlorOfTheTrust'))}
          <SingleRow title={I18n.t('wasTheTrustEstablished')} data={this.props.trust.wasTheTrust} />
          <SingleRow title={I18n.t('fullNameOfSettlor')} data={this.props.trust.settlorName} />
        </View>
      );
      companyDetail = this.props.type === 'company_trustee' ? <CompanyDetail data={this.props.company} /> : null
      applicantDetail = (
        <ApplicantDetail data={this.props.applicant} listCheck={listCheck} />
      );
      beneficialOwership = this.props.type === 'company_trustee' ? <BeneficialOwnership data={this.props.beneficial} /> : null
      additionalDirectors = this.props.type === 'company_trustee' ? <AdditionalDirectors data={this.props.additional} /> : null
      linkedCashAccount = (
        <LinkedCashAccount data={this.props.linked} />
      );
      tradingPlatform = (
        <TradingPlatform data={this.props.trading} />
      );
      applicantToTrade = (
        <ApplicantToTrade data={this.props.applicantToTrade} />
      );
      chessSponsorship = (
        <ChessSponsorship data={this.props.chess} listCheck={listCheck4} />
      );
      interestInAPublic = (
        <InterestInAPublic data={this.props.interest} />
      );
    }
    return (
      <ScrollView style={{ marginTop: 14 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {this.renderHeader(I18n.t('trustDetailsUpper'))}
        {trustDetail}
        {this.props.type === 'company_trustee' ? this.renderHeader(I18n.t('companyDetailsUpper')) : null}
        {companyDetail}
        {this.renderHeader(I18n.t('applicantDetails'))}
        {applicantDetail}
        {this.renderHeader(I18n.t('additionalDirectors'))}
        {additionalDirectors}
        {this.renderHeader(I18n.t('beneficialOwnership'))}
        {beneficialOwership}
        {this.renderHeader(I18n.t('linkedCashAccount'))}
        {linkedCashAccount}
        {this.renderHeader(I18n.t('tradingPlatform'))}
        {tradingPlatform}
        {this.renderHeader(I18n.t('applicantToTrade'))}
        {applicantToTrade}
        {this.renderHeader(I18n.t('chessSponsorship'))}
        {chessSponsorship}
        {this.renderHeader(I18n.t('interestInAPublic'))}
        {interestInAPublic}
      </ScrollView>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    trust: state.trust.trust,
    company: state.trust.company,
    additional: state.trust.additional,
    beneficial: state.trust.beneficial,
    applicant: state.trust.applicant,
    linked: state.trust.linked,
    chess: state.trust.chess,
    trading: state.trust.trading,
    interest: state.trust.interest,
    applicantToTrade: state.trust.applicantToTrade
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(trustActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TrustDetail);
