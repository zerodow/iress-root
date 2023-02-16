import React, { Component } from 'react';
import { Text, View, TouchableOpacity, ScrollView, PixelRatio } from 'react-native';
import { iconsMap } from '../../utils/AppIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import styles from './style/create_company_account';
import SingleRow from './../../component/account_detail/single_row';
import SingleRowInput from './../../component/account_detail/single_row_input';
import DoubleRowInput from './../../component/account_detail/double_row_input';
import SingleRowCheckboxVertical from './../../component/account_detail/single_row_checkbox_vertical';
import SingleRowCheckboxHorizontal from './../../component/account_detail/single_row_checkbox_horizontal';
import IconCheck from './../../component/account_detail/icon_check';
import Picker from 'react-native-picker';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as companyActions from './create_company_account.actions';
import { dataStorage } from '../../storage'

const listCompanyType = [
  'Proprietary',
  'Public'
]

const listCheck2 = [
  'Employment',
  'Savings',
  'Financial investments',
  'Inheritance / Gift'
]

export class CreateCompanyAccount extends Component {
  constructor(props) {
    super(props);
        this.state = {
      visible: false
    }
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
	Picker.hide();
    if (event.type === 'NavBarButtonPress') {
      switch (event.id) {
      }
    } else {
      switch (event.id) {
        case 'willAppear':
          break;
        case 'didAppear':
          break;
        case 'willDisappear':
          break;
        case 'didDisappear':
          break;
        default:
          break;
      }
    }
  }

  onShowFilter() {
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
        selectedValue: this.props.company.companyType,
        pickerData: listCompanyType,
        onPickerConfirm: data => { },
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

  renderTitle(title) {
    return (
      <Text style={styles.title}>{title}</Text>
    );
  }

  onChangeProperty(type, field, index, value) {
    this.props.actions.changedProperty(type, field, index, value);
  }

  choose(type, field, index, value) {
    this.props.actions.changedProperty(type, field, index, value);
  }

  render() {
    return (
      <ScrollView style={{ width: '100%', paddingLeft: 16 }}>
        <View style={[{ paddingVertical: 20 }, CommonStyle.borderBottom]}>
          <Text style={CommonStyle.giantText}>{`SECTION 1 - ${I18n.t('companyDetailsUpper')}`}</Text>
        </View>
        <View style={{ marginTop: 8, paddingRight: 16 }}>
          <Text style={[CommonStyle.textExtra, { textAlign: 'right' }]}>{I18n.t('mandatory')}</Text>
          <SingleRow title={I18n.t('companyType')} data={this.props.company.companyType} />
          <Icon name='md-arrow-dropdown' style={styles.iconPicker}
            onPress={this.onShowFilter.bind(this)} />
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
          <View style={styles.rowCheckVertical}>
            <View style={[styles.textCol1, { paddingRight: 8 }]}>
              <IconCheck data={false} onPress={() => console.log('icon check on press')} />
            </View>
            <View style={styles.rowContentNoBorder}>
              <Text style={styles.mainText2}>{I18n.t('sameAsAbove')}</Text>
            </View>
          </View>
          <SingleRowCheckboxHorizontal title={I18n.t('isOrganised')} data={this.props.company.isOrganised}
            onPressYes={this.onChangeProperty.bind(this, 'company', 'isOrganised', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'company', 'isOrganised', null, false)} />
          <SingleRowCheckboxHorizontal title={I18n.t('isFinancial')} data={this.props.company.isFinancial}
            onPressYes={this.onChangeProperty.bind(this, 'company', 'isFinancial', null, true)}
            onPressNo={this.onChangeProperty.bind(this, 'company', 'isFinancial', null, false)} />
          <View style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={CommonStyle.textExtraOpacity}>{`${I18n.t('ifYouHaveAnswered')} `}</Text>
              <Text style={CommonStyle.textTinyMedium}>{`${I18n.t('yes')} `}</Text>
              <Text style={CommonStyle.textExtraOpacity}>{I18n.t('mustAlsoText')}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={CommonStyle.textExtraOpacity}>{`${I18n.t('complete')} `}</Text>
              <Text style={[CommonStyle.textExtraNoColor, { color: '#0000ff' }]}>{`${I18n.t('facaSupplementary')} `}</Text>
              <Text style={CommonStyle.textExtraOpacity}>available at</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[CommonStyle.textExtraNoColor, { color: '#0000ff' }]}>openmarkets.com.au/form-library </Text>
              <Text style={CommonStyle.textExtraOpacity}>{I18n.t('attachToThisApplication')}</Text>
            </View>
          </View>
          {this.renderTitle(I18n.t('mainSources'))}
          <SingleRowCheckboxVertical listCheck={listCheck2} data={this.props.company.mainSource} other
            onEvent={this.choose.bind(this, 'company', 'mainSource', null)} />
          {this.renderTitle(I18n.t('regulatory'))}
          <Text style={[CommonStyle.textExtra, { textAlign: 'right' }]}>{I18n.t('ifApplicable')}</Text>
          <SingleRowInput title={I18n.t('regulatorName')} data={this.props.company.regulatorName} />
        </View>
      </ScrollView>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    company: state.company
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(companyActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCompanyAccount);
