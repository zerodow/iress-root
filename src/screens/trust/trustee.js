import React, { Component } from 'react';
import { View, Text, TouchableOpacity, PixelRatio } from 'react-native';
import I18n from '../../modules/language';
import Icon from 'react-native-vector-icons/Ionicons'
import styles from './style/trust';
import Account from '../account/account';

const listData = [
  {
    accountId: 'OPR007',
    name: 'Jame Bond',
    type: 'Unregulated trust',
    occupation: 'Invester',
    status: 'active'
  },
  {
    accountId: 'OPR005',
    name: 'John Smith',
    type: 'Regulated trus',
    occupation: 'Developer ',
    status: 'active'
  },
  {
    accountId: 'OPR006',
    name: 'Madison Williams',
    type: 'Regulated trus',
    occupation: 'Student ',
    status: 'inactive'
  }
];

const listData2 = [
  {
    accountId: 'OPR0010',
    name: 'ACB Limited',
    type: 'Proprietary',
    occupation: 'Financials',
    status: 'active'
  },
  {
    accountId: 'OPR0011',
    name: 'Betashares Global Healthcare ETF',
    type: 'Public',
    occupation: 'Retailing',
    status: 'active'
  },
  {
    accountId: 'OPR0012',
    name: 'Eastern Iron Limited',
    type: 'Public',
    occupation: 'Energy',
    status: 'inactive'
  }
];

export default class Trustee extends Component {
  constructor(props) {
    super(props);
    this.listData = this.props.type === 'individual_trustee' ? listData : listData2;
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      switch (event.id) {
        default:
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

  renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.textCol1}></View>
        <View style={styles.header}>
          <View style={styles.textCol2}>
            <Text style={styles.textMainHeader}>{I18n.t('accountIdUpper')}</Text>
            <Text style={styles.textSubHeader}>{I18n.t('nameUpper')}</Text>
          </View>
          <View style={styles.textCol3}>
            <Text style={[styles.textMainHeader, { textAlign: 'right' }]}>{I18n.t('typeUpper')}</Text>
            <Text style={[styles.textSubHeader, { textAlign: 'right' }]}>{I18n.t('occupationUpper')}</Text>
          </View>
        </View>
      </View>
    );
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
        navBarTextFontSize: 18,
        navBarHideOnScroll: false,
        drawUnderNavBar: true,
        navBarNoBorder: true,
        modalPresentationStyle: 'overCurrentContext'
      }
    })
  }

  renderSearchBar() {
    return (
      <View style={[styles.searchBarContainer, { marginTop: 4 }]}>
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
            <Account tab={'trust'} tabType={this.props.type} accountId={e.accountId} name={e.name}
              type={e.type} status={e.status} value={e.occupation} key={i}
              navigator={this.props.navigator} />
          )
        }
      </View>
    );
  }
}
