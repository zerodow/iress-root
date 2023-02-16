import React, { Component } from 'react';
import { View, Text, TouchableOpacity, PixelRatio } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import styles from './style/individual';
import I18n from '../../modules/language';
import Account from '../account/account';

const listData = [
  {
    accountId: 'OPR001',
    name: 'Jame Bond',
    type: 'Individual',
    occupation: 'Invester',
    status: 'inactive'
  },
  {
    accountId: 'OPR002',
    name: 'John Smith',
    type: 'Joint',
    occupation: 'Developer',
    status: 'active'
  },
  {
    accountId: 'OPR003',
    name: 'Madison Williams',
    type: 'Minor',
    occupation: 'Student',
    status: 'active'
  }
];

export default class Individual extends Component {
  constructor(props) {
    super(props);
    this.listData = listData;
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      switch (event.id) {
        case 'add-circle':
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
        navBarTextFontSize: 18,
        navBarHideOnScroll: false,
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
            <Account accountId={e.accountId} name={e.name}
              type={e.type} status={e.status} value={e.occupation} key={i}
              navigator={this.props.navigator} />
          )
        }
      </View>
    );
  }
}
