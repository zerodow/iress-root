import React, { Component } from 'react';
import { View, Text, TouchableOpacity, PixelRatio } from 'react-native';
import styles from './style/account';
import Circle from '../circle/circle';
import config from './../../config';
import { iconsMap, iconsLoaded } from '../../utils/AppIcons';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

export default class Account extends Component {
  renderContent() {
    let status = null;
    if (this.props.status === 'active') {
      status = (
        <Circle size={20} color={'#00b800'} />
      );
    } else {
      status = (
        <Circle size={20} color={'#df0000'} />
      );
    }
    return (
      <View style={styles.rowContainer}>
        <View style={styles.textCol1}>
          {status}
        </View>
        <View style={styles.rowContent}>
          <View style={styles.textCol2}>
            <Text style={styles.mainText}>{this.props.accountId}</Text>
            <Text style={styles.subText} numberOfLines={1}>{this.props.name}</Text>
          </View>
          <View style={styles.textCol3}>
            <Text style={[styles.mainText, { textAlign: 'right' }]} numberOfLines={1}>{this.props.type}</Text>
            <Text style={[styles.subText, { textAlign: 'right' }]}>{this.props.value}</Text>
          </View>
        </View>
      </View>
    );
  }

  showAccountDetail() {
    let screen = '';
    switch (this.props.tab) {
      case 'trust':
        screen = 'equix.TrustDetail';
        break;
      case 'company':
        screen = 'equix.CompanyDetail';
        break;
      case 'individual':
        screen = 'equix.IndividualDetail';
        break;
      default: screen = 'equix.IndividualDetail';
    }
    this.props.navigator.push({
      screen: screen,
      backButtonTitle: '',
      title: this.props.accountId,
      navigatorStyle: {
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        navBarBackgroundColor: CommonStyle.statusBarBgColor,
        navBarTextColor: config.color.navigation,
        drawUnderNavBar: true,
        navBarTextFontSize: 18,
        navBarHideOnScroll: false,
        navBarButtonColor: config.button.navigation,
        navBarNoBorder: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
      },
      passProps: {
        accountId: this.props.accountId,
        type: this.props.tabType
      }
    });
  }

  render() {
    return (
      <TouchableOpacity style={{ width: '100%' }}
        onPress={this.showAccountDetail.bind(this)}>
        {this.renderContent()}
      </TouchableOpacity>
    );
  }
}
