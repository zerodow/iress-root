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
import * as individualActions from './individual_detail.actions';

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

export class Individual extends Component {
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
    let applicantDetail = null;
    let linkedCashAccount = null;
    let chessSponsorship = null;
    let tradingPlatform = null;
    let applicantToTrade = null;
    if (this.state.editMode) {
      applicantDetail = (
        this.props.applicant.map((e, i) => {
          let header = `APPLICANT ${i + 1} / DIRECTOR ${i + 1}`;
          return (
            <View style={{ width: '100%' }}>
              {this.renderSubHeader(header)}
              <View style={styles.contentEdit}>
                <SingleRowInput title={I18n.t('title')} data={e.title}
                  onChangeText={this.onChangeProperty.bind(this, 'applicant', 'title', i)} />
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
                <CheckboxHorizontal object={I18n.t('country')}
                  listCheck={listCheck}
                  fields={e.country}
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
            <SingleRow title={I18n.t('providerName')} data={this.props.linked.providerName} />
            <Icon name='md-arrow-dropdown' style={styles.iconPicker}
              onPress={this.onShowFilter.bind(this, 'providerName')} />
          </View>
          <DoubleRowInput title1={I18n.t('bsb')} data1={this.props.linked.bsb}
            onChangeText1={this.onChangeProperty.bind(this, 'linked', 'bsb')}
            title2={I18n.t('acno')} data2={this.props.linked.acno}
            onChangeText1={this.onChangeProperty.bind(this, 'linked', 'acno')} />
          <SingleRowCheckboxHorizontal bold title={I18n.t('incomeDirection')} data={this.props.linked.incomeDirection}
            onPressYes={this.onChangeProperty.bind(this, 'linked', 'incomeDirection', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'linked', 'incomeDirection', null, false)} />
        </View>
      );
      chessSponsorship = (
        <View style={{ width: '100%' }}>
          <View style={styles.contentEdit}>
            <View style={{ width: '100%', marginTop: 8 }}>
              <SingleRow title={I18n.t('chessRegistration')} data={this.props.chess.chessRegistration}
                onChangeText={this.onChangeProperty.bind(this, 'chess', 'chessRegistration')} />
              <Text style={styles.textExtra}>{I18n.t('mandatory')}</Text>
            </View>
            <View style={{ width: '100%' }}>
              {this.renderTitle(I18n.t('transferExistingHin'))}
              <Text style={[styles.textExtra, { top: 40 }]}>OPTIONAL</Text>
            </View>
            <DoubleRowInput title1={I18n.t('currentSpnsoring')} data1={this.props.chess.currentBroker}
              onChangeText1={this.onChangeProperty.bind(this, 'chess', 'currentBroker')}
              title2={I18n.t('brokerPID')} data2={this.props.chess.brokerPID}
              onChangeText2={this.onChangeProperty.bind(this, 'chess', 'brokerPID')} />
            <SingleRowInput title={I18n.t('accountName')} data={this.props.chess.accountName}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountName')} />
            <SingleRowInput title={I18n.t('accountDesign')} data={this.props.chess.accountDesign}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountDesign')} />
            <SingleRowInput title={I18n.t('registrationAddress')} data={this.props.chess.registrationAddress}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'accountDesign')} />
            <View style={{ width: '100%' }}>
              <SingleRowInput title={I18n.t('holderIdentification')} data={this.props.chess.holderIdentify}
                onChangeText={this.onChangeProperty.bind(this, `chess`, 'holderIdentify')} />
              <Text style={[styles.textExtra3]}>Max 11digits</Text>
            </View>
            <CheckboxVertical listCheck={listCheck3} data={this.props.chess.transfer}
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
            <SingleRowInput title={I18n.t('date')} data={this.props.chess.date}
              onChangeText={this.onChangeProperty.bind(this, `chess`, 'date')} />
            {this.renderTitle('OR')}
          </View>
          <View style={[styles.contentEdit, { backgroundColor: 'rgba(10, 167, 177, 0.3)', paddingBottom: 16 }]}>
            <View style={{ width: '100%', marginVertical: -8 }}>
              {this.renderTitle('SETTLE USING YOUR MARGIN LOAN')}
            </View>
            <View style={{ width: '100%', alignItems: 'flex-end', paddingBottom: 4 }}>
              <Text style={styles.orText}>OPTIONAL</Text>
            </View>
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.textExtra2}>Complete only if you wish to settle transactions through an existing margin loan. Please also complete the provider’s corresponding third party authority form.</Text>
            </View>
            <View style={{ width: '100%' }}>
              <SingleRowInput title='Name of Margin Lender (M/L)' data={''}
                onChangeText={this.onChangeProperty.bind(this, 'chess', '')} />
              <Text style={[styles.textExtra4]}>e.g. Leveraged</Text>
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
    } else {
      applicantDetail = (
        <ApplicantDetail data={this.props.applicant} listCheck={listCheck} />
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
    }
    return (
      <ScrollView style={{ marginTop: 14 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {this.renderHeader(I18n.t('applicantDetails'))}
        {applicantDetail}
        {this.renderHeader(I18n.t('linkedCashAccount'))}
        {linkedCashAccount}
        {this.renderHeader(I18n.t('tradingPlatform'))}
        {tradingPlatform}
        {this.renderHeader(I18n.t('applicantToTrade'))}
        {applicantToTrade}
        {this.renderHeader(I18n.t('chessSponsorship'))}
        {chessSponsorship}
      </ScrollView>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    applicant: state.individual.applicant,
    linked: state.individual.linked,
    applicantToTrade: state.individual.applicantToTrade,
    chess: state.individual.chess,
    trading: state.individual.trading
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(individualActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Individual);
