import React, { Component } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, PixelRatio } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './../account/style/account';
import I18n from '../../modules/language';
import accountDetailString from '../../constants/account_detail_string';
import Picker from 'react-native-picker';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
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
import ApplicantDetail from './../../component/account_detail/applicant_detail';
import ApplicantDetailEdit from './../../component/account_detail/applicant_detail_edit';
import LinkedCashAccount from './../../component/account_detail/linked_cash_account';
import TradingPlatform from './../../component/account_detail/trading_platform';
import ApplicantToTrade from './../../component/account_detail/applicant_to_trade';
import ChessSponsorship from './../../component/account_detail/chess_sponsorship';
import CompanyDetail from './../../component/account_detail/company_detail';
import AdditionalDirectors from './../../component/account_detail/additional_directors';
import BeneficialOwnership from './../../component/account_detail/beneficial_ownership';
import * as accountActions from './company_detail.actions';

const listData = {
  companyDetail: {
    companyType: 'Proprietary',
    companyName: 'Beli',
    industryType: 'Bond',
    country: 'Vietnam',
    acn: '00000',
    or: '00000',
    companyTax: '000000',
    orExemption: '00000',
    companyAddress: 'Level 38, 123 Eagle, Brisbane, Australia',
    physicalPlace: '110 Stiring highway, Nedlands, WA, Australia',
    mainSource: 'Advisor',
    isOrganised: false,
    isFinancial: true,
    regulatorName: 'Bond',
    licenseNumber: '01/05/2011',
    exchange: 'ASX',
    foreign: 'Z'
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
    incomeDirection: false
  },
  chessSponsorship: {
    chessRegistration: 'A',
    currentBroker: '61 21 262 641',
    brokerPID: '61 77 741 220',
    accountName: 'beli.bonds@gmail.com',
    accountDesign: 'beli.bonds@gmail.com',
    registrationAddress: 'beli.bonds@gmail.com',
    holderIdentify: '123456789',
    transfer: 'Transfer my/our HIN and all its holdings',
    accountHolders: [
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
  'Employment',
  'Savings',
  'Financial investments',
  'Inheritance / Gift'
]

const listCheck3 = [
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

export class AccountDetail extends Component {
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
        <Text style={styles.textHeader}>{I18n.t('done', { locale: this.props.setting.lang })}</Text>
      </TouchableOpacity>
    );
    if (this.state.editMode) {
      icon = done;
    } else {
      icon = edit;
    }
    return (
      <View style={styles.header}>
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

  componentDidMount() {
    this.listData = listData;
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
      });
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
              this.props.actions.changedProperty('company', 'companyType', null, data[0]);
              break;
            case 'providerName':
              this.props.actions.changedProperty('linked', 'providerName', null, data[0]);
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
    let companyDetail = null;
    let applicantDetail = null;
    let additionalDirectors = null;
    let beneficialOwnership = null;
    let linkedCashAccount = null;
    let chessSponsorship = null;
    let tradingPlatform = null;
    let applicantToTrade = null;
    let interestInAPublic = null;
    if (this.state.editMode) {
      companyDetail = (
        <View style={[styles.contentEdit, { marginTop: 8 }]}>
          <View style={{ width: '100%' }}>
            <SingleRow title={I18n.t('companyType', { locale: this.props.setting.lang })} data={this.props.company.companyType} />
            <Text style={styles.textExtra}>{I18n.t('mandatory', { locale: this.props.setting.lang })}</Text>
            <Icon name='md-arrow-dropdown' style={styles.iconPicker}
              onPress={this.onShowFilter.bind(this, 'companyType')} />
          </View>
          <SingleRowInput title={I18n.t('companyName2', { locale: this.props.setting.lang })} data={this.props.company.companyName}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'companyName', null)} />
          <SingleRowInput title={I18n.t('industryType', { locale: this.props.setting.lang })} data={this.props.company.industryType}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'industryType', null)} />
          <SingleRowInput title={I18n.t('country2', { locale: this.props.setting.lang })} data={this.props.company.country}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'country', null)} />
          <DoubleRowInput title1={`                                              ${I18n.t('ACNARBN', { locale: this.props.setting.lang })}`} data1={this.props.company.acn}
            onChangeText1={this.onChangeProperty.bind(this, 'company', 'acn', null)}
            title2={I18n.t('ORforeign', { locale: this.props.setting.lang })} data2={this.props.company.or}
            onChangeText2={this.onChangeProperty.bind(this, 'company', 'or', null)} />
          <DoubleRowInput title1={I18n.t('companyTaxFileNumber', { locale: this.props.setting.lang })} data1={this.props.company.companyTax}
            onChangeText1={this.onChangeProperty.bind(this, 'company', 'companyTax', null)}
            title2={I18n.t('orExemptionCode', { locale: this.props.setting.lang })} data2={this.props.company.or}
            onChangeText2={this.onChangeProperty.bind(this, 'company', 'or', null)} />
          <SingleRowInput title={I18n.t('companyAddress', { locale: this.props.setting.lang })} data={this.props.company.companyAddress}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'companyAddress', null)} />
          <SingleRowInput title={I18n.t('physicalPlace', { locale: this.props.setting.lang })} data={this.props.company.physicalPlace}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'physicalPlace', null)} />
          <SingleRowInput title={I18n.t('sameAsAbove', { locale: this.props.setting.lang })} data={this.props.company.companyAddress}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'companyAddress', null)} />
          <SingleRowCheckboxHorizontal title={I18n.t('isOrganised', { locale: this.props.setting.lang })} data={this.props.company.isOrganised}
            onPressYes={this.onChangeProperty.bind(this, 'company', 'isOrganised', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'company', 'isOrganised', null, false)} />
          <SingleRowCheckboxHorizontal title={I18n.t('isFinancial', { locale: this.props.setting.lang })} data={this.props.company.isFinancial}
            onPressYes={this.onChangeProperty.bind(this, 'company', 'isFinancial', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'company', 'isFinancial', null, false)} />
          {this.renderTitle(I18n.t('mainSources', { locale: this.props.setting.lang }))}
          <SingleRowCheckboxVertical listCheck={listCheck2} data={this.props.company.mainSource} other
            onEvent={this.choose.bind(this, 'company', 'mainSource', null)} />
          {this.renderTitle(I18n.t('regulatory', { locale: this.props.setting.lang }))}
          <View style={{ width: '100%' }}>
            <SingleRowInput title={I18n.t('regulatorName', { locale: this.props.setting.lang })} data={this.props.company.regulatorName} />
            <Text style={styles.textExtra}>{I18n.t('ifApplicable', { locale: this.props.setting.lang })}</Text>
          </View>
          <SingleRowInput title={I18n.t('licenseNumber', { locale: this.props.setting.lang })} data={this.props.company.licenseNumber}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'licenseNumber')} />
          <Text style={[styles.mainText, { paddingTop: 20, paddingBottom: 8 }]}>{I18n.t('australianListedCompany', { locale: this.props.setting.lang })}</Text>
          <SingleRowInput title={I18n.t('marketAndExchange', { locale: this.props.setting.lang })} data={this.props.company.exchange}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'exchange')} />
          <Text style={[styles.mainText, { paddingTop: 20, paddingBottom: 8 }]}>{I18n.t('majorityOwned', { locale: this.props.setting.lang })}</Text>
          <SingleRowInput title={I18n.t('companyName3', { locale: this.props.setting.lang })} data={this.props.company.companyName}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'companyName')} />
          <SingleRowInput title={I18n.t('marketAndExchange', { locale: this.props.setting.lang })} data={this.props.company.exchange}
            onChangeText={this.onChangeProperty.bind(this, 'company', 'exchange')} />
          <Text style={[styles.mainText, { paddingTop: 20, paddingBottom: 8 }]}>{I18n.t('foreignCompany', { locale: this.props.setting.lang })}</Text>
          <SingleRowInput title={I18n.t('foreignRegisteredAuthority', { locale: this.props.setting.lang })} data={this.props.company.foreign}
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
                <SingleRowInput title={I18n.t('title', { locale: this.props.setting.lang })} data={e.title}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'title', i)} />
                <SingleRowInput title={I18n.t('givenName', { locale: this.props.setting.lang })} data={e.givenName}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'givenName', i)} />
                <SingleRowInput title={I18n.t('surname', { locale: this.props.setting.lang })} data={e.surName}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'surName', i)} />
                <DoubleRowSpecial data1={e.dob} data2={e.gender} index={i}
                  onShowFilter={this.onShowFilter.bind(this, 'gender', i)} />
                <DoubleRow title1={I18n.t('DOB', { locale: this.props.setting.lang })} data1={e.dob}
                  title2={I18n.t('Gender', { locale: this.props.setting.lang })} data2={e.gender} />
                <SingleRowInput title={I18n.t('residentialAddress', { locale: this.props.setting.lang })} data={e.residential}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'residential', i)} />
                <DoubleRowInput title1={I18n.t('occupation', { locale: this.props.setting.lang })} data1={e.occupation}
                  onChangeText1={this.onChangeProperty.bind(this, 'applicant', 'occupation', i)}
                  title2={I18n.t('industry', { locale: this.props.setting.lang })} data2={e.industry}
                  onChangeText2={this.onChangeProperty.bind(this, 'applicant', 'industry', i)} />
                <DoubleRowInput title1={I18n.t('mobile', { locale: this.props.setting.lang })} data1={e.mobile}
                  onChangeText1={this.onChangeProperty.bind(this, 'applicant', 'mobile', i)}
                  title2={I18n.t('otherPhone', { locale: this.props.setting.lang })} data2={e.ortherPhone}
                  onChangeText2={this.onChangeProperty.bind(this, 'applicant', 'ortherPhone', i)} />
                <SingleRowInput title={I18n.t('email', { locale: this.props.setting.lang })} data={e.email}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'email', i)} />
                {this.renderTitle(I18n.t('citizenshipResidency', { locale: this.props.setting.lang }))}
                <CheckboxHorizontal object={I18n.t('country', { locale: this.props.setting.lang })}
                  listCheck={listCheck}
                  fields={e.country}
                  onPress={this.tickCountry.bind(this, i)} />
                <SingleRowCheckboxHorizontal title={I18n.t('areYou', { locale: this.props.setting.lang })} data={e.areYou}
                  onPressYes={this.onChangeProperty.bind(this, 'applicant', 'areYou', i, true)}
                  onPressNo={this.onChangeProperty.bind(this, 'applicant', 'areYou', i, false)} />
                <SingleRowCheckboxHorizontal bold text title={I18n.t('consentToElectronicVerification', { locale: this.props.setting.lang })} data={e.consent}
                  onPressYes={this.onChangeProperty.bind(this, 'applicant', 'consent', i, true)}
                  onPressNo={this.onChangeProperty.bind(this, 'applicant', 'consent', i, false)} />
                <SingleRowInput title={I18n.t('previousAddress', { locale: this.props.setting.lang })} data={e.priviousAddress}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'priviousAddress', i)} />
              </View>
              {
                i === this.props.applicant.length - 1 ? (<View style={styles.add}>
                  <Text style={styles.title}>{I18n.t('addApplicant', { locale: this.props.setting.lang })}</Text>
                  <Icon name='ios-add-circle-outline' size={24} color='#10a8b2' style={{ paddingLeft: 16 }} />
                </View>) : null
              }
            </View>
          )
        })
      );
      additionalDirectors = (
        <View style={styles.contentEdit}>
          {
            this.props.additional.map((e, i) =>
              <SingleRowInput title={` ${i + 1}. ${I18n.t('fullName', { locale: this.props.setting.lang })}`} data={e.fullName}
                onChangeText={this.onChangeProperty.bind(this, `additional`, 'fullName', i)} />
            )
          }
        </View>
      );
      beneficialOwnership = (
        this.props.beneficial.map((e, i) => {
          let person = `BENEFICIAL OWNER ${i + 1}`;
          let sample = `Same as Applicant ${i + 1}`
          return (
            <View style={{ width: '100%', paddingRight: 16 }}>
              {
                i === 0 ? (
                  <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
                    <Text style={styles.textExtra2}>{I18n.t('proprietaryCompaniesOnly', { locale: this.props.setting.lang })}</Text>
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
              <SingleRowInput title={I18n.t('fullName', { locale: this.props.setting.lang })} data={e.fullName}
                onChangeText={this.onChangeProperty.bind(this, `additional`, 'fullName', i)} />
              <SingleRowInput title={I18n.t('residentialAddress2', { locale: this.props.setting.lang })} data={e.residentialAddress}
                onChangeText={this.onChangeProperty.bind(this, `additional`, 'residentialAddress', i)} />
              <SingleRowInput title={I18n.t('DOB2', { locale: this.props.setting.lang })} data={e.dob}
                onChangeText={this.onChangeProperty.bind(this, `additional`, 'dob', i)} />
              <SingleRowCheckboxHorizontal title={I18n.t('isBeneficial', { locale: this.props.setting.lang })} data={e.isBeneficial}
                onPressYes={this.onChangeProperty.bind(this, 'beneficial', 'isBeneficial', i, true)}
                onPressNo={this.onChangeProperty.bind(this, 'beneficial', 'isBeneficial', i, false)} />
              <SingleRowCheckboxHorizontal title={I18n.t('hasBeneficial', { locale: this.props.setting.lang })} data={e.hasBeneficial}
                onPressYes={this.onChangeProperty.bind(this, 'beneficial', 'hasBeneficial', i, true)}
                onPressNo={this.onChangeProperty.bind(this, 'beneficial', 'hasBeneficial', i, false)} />
            </View>
          );
        })
      );
      linkedCashAccount = (
        <View style={styles.contentEdit}>
          {this.renderTitle(I18n.t('existingCashAccount', { locale: this.props.setting.lang }))}
          <View style={{ width: '50%' }}>
            <SingleRow title={I18n.t('providerName', { locale: this.props.setting.lang })} data={this.props.linked.providerName} />
            <Icon name='md-arrow-dropdown' style={styles.iconPicker}
              onPress={this.onShowFilter.bind(this, 'providerName')} />
          </View>
          <DoubleRowInput title1={I18n.t('bsb', { locale: this.props.setting.lang })} data1={this.props.linked.bsb}
            onChangeText1={this.onChangeProperty.bind(this, 'linked', 'bsb')}
            title2={I18n.t('acno', { locale: this.props.setting.lang })} data2={this.props.linked.acno}
            onChangeText1={this.onChangeProperty.bind(this, 'linked', 'acno')} />
          <SingleRowCheckboxHorizontal bold title={I18n.t('incomeDirection', { locale: this.props.setting.lang })} data={this.props.linked.incomeDirection}
            onPressYes={this.onChangeProperty.bind(this, 'linked', 'incomeDirection', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'linked', 'incomeDirection', null, false)} />
        </View>
      );
      chessSponsorship = (
        <View style={{ width: '100%' }}>
          <View style={styles.contentEdit}>
            <View style={{ width: '100%', marginTop: 8 }}>
              <SingleRow title={I18n.t('chessRegistration', { locale: this.props.setting.lang })} data={this.props.chess.chessRegistration}
                onChangeText={this.onChangeProperty.bind(this, 'chess', 'chessRegistration')} />
              <Text style={styles.textExtra}>{I18n.t('mandatory', { locale: this.props.setting.lang })}</Text>
            </View>
            <View style={{ width: '100%' }}>
              {this.renderTitle(I18n.t('transferExistingHin', { locale: this.props.setting.lang }))}
              <Text style={[styles.textExtra, { top: 40 }]}>{I18n.t('optional', { locale: this.props.setting.lang })}</Text>
            </View>
            <DoubleRowInput title1={I18n.t('currentSpnsoring', { locale: this.props.setting.lang })} data1={this.props.chess.currentBroker}
              onChangeText1={this.onChangeProperty.bind(this, 'chess', 'currentBroker')}
              title2={I18n.t('brokerPID', { locale: this.props.setting.lang })} data2={this.props.chess.brokerPID}
              onChangeText2={this.onChangeProperty.bind(this, 'chess', 'brokerPID')} />
            <SingleRowInput title={I18n.t('accountName', { locale: this.props.setting.lang })} data={this.props.chess.accountName}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountName')} />
            <SingleRowInput title={I18n.t('accountDesign', { locale: this.props.setting.lang })} data={this.props.chess.accountDesign}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountDesign')} />
            <SingleRowInput title={I18n.t('registrationAddress', { locale: this.props.setting.lang })} data={this.props.chess.registrationAddress}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountDesign')} />
            <View style={{ width: '100%' }}>
              <SingleRowInput title={I18n.t('holderIdentification', { locale: this.props.setting.lang })} data={this.props.chess.holderIdentify}
                onChangeText={this.onChangeProperty.bind(this, `chess`, 'holderIdentify')} />
              <Text style={[styles.textExtra3]}>{I18n.t('max11Digits', { locale: this.props.setting.lang })}</Text>
            </View>
            <CheckboxVertical listCheck={listCheck3} data={this.props.chess.transfer}
              onPress={this.choose.bind(this, 'chess', 'transfer', null)} />
            {this.renderTitle(I18n.t('authorisation', { locale: this.props.setting.lang }))}
            {
              this.props.chess.accountHolder.map((e, i) => {
                let printName = `Account Holder ${i + 1} (Print Name)`;
                return (
                  <SingleRowInput title={printName} data={e}
                    onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountHolders', i)} />
                )
              })
            }
            <SingleRowInput title={I18n.t('date', { locale: this.props.setting.lang })} data={this.props.chess.date}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'date')} />
            {this.renderTitle('OR')}
          </View>
          <View style={[styles.contentEdit, { backgroundColor: 'rgba(10, 167, 177, 0.3)', paddingBottom: 16 }]}>
            <View style={{ width: '100%', marginVertical: -8 }}>
              {this.renderTitle('SETTLE USING YOUR MARGIN LOAN')}
            </View>
            <View style={{ width: '100%', alignItems: 'flex-end', paddingBottom: 4 }}>
              <Text style={styles.orText}>{I18n.t('optional', { locale: this.props.setting.lang })}</Text>
            </View>
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.textExtra2}>Complete only if you wish to settle transactions through an existing margin loan. Please also complete the provider’s corresponding third party authority form.</Text>
            </View>
            <View style={{ width: '100%' }}>
              <SingleRowInput title='Name of Margin Lender (M/L)' data={''}
                onChangeText={this.onChangeProperty.bind(this, 'chess', '')} />
              <Text style={[styles.textExtra4]}>{I18n.t('leveraged', { locale: this.props.setting.lang })}</Text>
            </View>
            <SingleRowInput title='M/L Account Name' data={''}
              onChangeText={this.onChangeProperty.bind(this, 'chess', '')} />
            <DoubleRowInput title1='M/L Facility No.' data1={''}
              onChangeText1={this.onChangeProperty.bind(this, 'chess', 'currentBroker')}
              title2='M/L HIN (if applicable)' data2={''}
              onChangeText2={this.onChangeProperty.bind(this, 'chess', 'brokerPID')} />
          </View>
        </View>
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
                        <Text style={styles.orText}>{I18n.t('mandatory', { locale: this.props.setting.lang })}</Text>
                      </View>
                    ) : null
                  }
                  {this.renderTitle(header)}
                  <View style={{ width: '100%' }}>
                    <SingleRow title={I18n.t('platform', { locale: this.props.setting.lang })} data={e.platform} />
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
          <SingleRowCheckboxHorizontal title={I18n.t('wylta', { locale: this.props.setting.lang })} data={this.props.applicantToTrade.likeToApply}
            onPressYes={this.onChangeProperty.bind(this, 'applicantToTrade', 'likeToApply', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'applicantToTrade', 'likeToApply', null, false)} />
        </View>
      );
      interestInAPublic = (
        <View style={styles.contentEdit}>
          <SingleRowCheckboxHorizontal title={I18n.t('areYouOr', { locale: this.props.setting.lang })} data={this.props.interest.areYouOr}
            onPressYes={this.onChangeProperty.bind(this, 'interest', 'areYouOr', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'interest', 'areYouOr', null, false)} />
          <SingleRowInput title={I18n.t('tickerSymbol', { locale: this.props.setting.lang })} data={this.props.interest.tickerSymbol}
            onChangeText={this.onChangeProperty.bind(this, 'interest', 'tickerSymbol')} />
          <SingleRowInput title={I18n.t('applicantName', { locale: this.props.setting.lang })} data={this.props.interest.applicantName}
            onChangeText={this.onChangeProperty.bind(this, 'interest', 'applicantName')} />
        </View>
      );
    } else {
      companyDetail = (
        <CompanyDetail data={this.props.company} />
      );
      applicantDetail = (
        <ApplicantDetail data={this.props.applicant} listCheck={listCheck} />
      );
      additionalDirectors = (
        <AdditionalDirectors data={this.props.additional} />
      );
      beneficialOwnership = (
        <BeneficialOwnership data={this.props.beneficial} />
      );
      linkedCashAccount = (
        <LinkedCashAccount data={this.props.linked} />
      );
      chessSponsorship = (
        <ChessSponsorship data={this.props.chess} />
      );
      tradingPlatform = (
        <TradingPlatform data={this.props.trading} />
      );
      applicantToTrade = (
        <ApplicantToTrade data={this.props.applicantToTrade} />
      );
      interestInAPublic = (
        <View style={styles.content}>
          <SingleRow title={I18n.t('areYouOr', { locale: this.props.setting.lang })} data={this.props.interest.areYouOr} />
          <SingleRow title={I18n.t('tickerSymbol', { locale: this.props.setting.lang })} data={this.props.interest.tickerSymbol} />
          <SingleRow title={I18n.t('applicantName', { locale: this.props.setting.lang })} data={this.props.interest.applicantName} />
        </View>
      );
    }

    return (
      <ScrollView style={{ marginTop: 14 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {this.renderHeader(I18n.t('companyDetailsUpper', { locale: this.props.setting.lang }))}
        {companyDetail}
        {this.renderHeader(I18n.t('applicantDetails', { locale: this.props.setting.lang }))}
        {applicantDetail}
        {this.renderHeader(I18n.t('additionalDirectors', { locale: this.props.setting.lang }))}
        {additionalDirectors}
        {this.renderHeader(I18n.t('beneficialOwnership', { locale: this.props.setting.lang }))}
        <View style={styles.content}>
          {beneficialOwnership}
        </View>
        {this.renderHeader(I18n.t('linkedCashAccount', { locale: this.props.setting.lang }))}
        {linkedCashAccount}
        {this.renderHeader(I18n.t('chessSponsorship', { locale: this.props.setting.lang }))}
        {chessSponsorship}
        {this.renderHeader(I18n.t('tradingPlatform', { locale: this.props.setting.lang }))}
        {tradingPlatform}
        {this.renderHeader(I18n.t('applicantToTrade', { locale: this.props.setting.lang }))}
        {applicantToTrade}
        {this.renderHeader(I18n.t('interestInAPublic', { locale: this.props.setting.lang }))}
        {interestInAPublic}
      </ScrollView>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    company: state.company.company,
    applicant: state.company.applicant,
    additional: state.company.additional,
    linked: state.company.linked,
    applicantToTrade: state.company.applicantToTrade,
    chess: state.company.chess,
    trading: state.company.trading,
    interest: state.company.interest,
    beneficial: state.company.beneficial,
    setting: state.setting
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(accountActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountDetail);
