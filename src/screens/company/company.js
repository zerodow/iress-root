import React, { Component } from 'react';
import { View, Text, TouchableOpacity, PixelRatio } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import styles from './style/company';
import I18n from '../../modules/language';
import Account from '../account/account';
import config from '../../config';
import { dataStorage } from '../../storage'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const listData = [
  {
    accountId: 'OPR004',
    company: 'A-CAP Resources Limited',
    type: 'Proprietary',
    industry: 'Retailing',
    status: 'inactive'
  },
  {
    accountId: 'OPR005',
    company: 'Ishared Core Cash ETF',
    type: 'Public',
    industry: 'Energy',
    status: 'active'
  },
  {
    accountId: 'OPR006',
    company: 'Sabre Resources Limited',
    type: 'Public',
    industry: 'Materials',
    status: 'active'
  }
];

export default class Company extends Component {
  constructor(props) {
    super(props);
    this.listData = listData;
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      switch (event.id) {
        case 'company_add':
          this.props.navigator.push({
            screen: 'equix.CreateCompanyAccount',
            title: I18n.t('companyTitle'),
            backButtonTitle: '',
            navigatorStyle: {
              statusBarColor: config.background.statusBar,
              statusBarTextColorScheme: 'light',
              navBarBackgroundColor: CommonStyle.statusBarBgColor,
              navBarTextColor: config.color.navigation,
              navBarHideOnScroll: false,
              navBarTextFontSize: 18,
              drawUnderNavBar: true,
              navBarButtonColor: config.button.navigation,
              navBarNoBorder: true,
              navBarSubtitleColor: 'white',
              navBarSubtitleFontFamily: 'HelveticaNeue'
            },
            navigatorButtons: {
              leftButtons: []
            }
          });
          break;
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

  showModal() {
    this.props.navigator.showModal({
      animationType: 'none',
      screen: 'equix.SearchCode',
      backButtonTitle: '',
      navigatorStyle: {
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        navBarHidden: true,
        navBarHideOnScroll: false,
        navBarTextFontSize: 18,
        drawUnderNavBar: true,
        navBarNoBorder: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overCurrentContext'
      }
    })
  }

  renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.textCol1}></View>
        <View style={styles.header}>
          <View style={styles.textCol2}>
            <Text style={styles.textMainHeader}>{I18n.t('accountIdUpper')}</Text>
            <Text style={styles.textSubHeader}>{I18n.t('securityUpper')}</Text>
          </View>
          <View style={styles.textCol3}>
            <Text style={[styles.textMainHeader, { textAlign: 'right' }]}>{I18n.t('typeUpper')}</Text>
            <Text style={[styles.textSubHeader, { textAlign: 'right' }]}>{I18n.t('industryUpper')}</Text>
          </View>
        </View>
      </View>
    );
  }

  renderSearchBar() {
    return (
      <View style={styles.searchBarContainer}>
        <TouchableOpacity style={styles.searchBar}
          onPress={this.showModal.bind(this)}>
          <Icon name='ios-search' style={styles.iconSearch} />
          <Text style={styles.searchPlaceHolder}>{I18n.t('searchForAccountId')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        {this.renderSearchBar()}
        {this.renderHeader()}
        {
          this.listData.map((e, i) =>
            <Account tab={'company'} accountId={e.accountId} name={e.company}
              type={e.type} status={e.status} value={e.industry} key={i}
              navigator={this.props.navigator} />
          )
        }
      </View>
    );
  }
}
