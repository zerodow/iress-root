import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { switchForm } from '../../lib/base/functionUtil';
import RowItem from './RowItem';
import CommonStyle, { register, changeTheme } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../storage';
import I18n from '../../modules/language';
import * as Controller from '../../memory/controller'
import * as ManageConnection from '../../manage/manageConnection';
import ENUM from '~/enum';

const { THEME } = ENUM;

export default class Themes extends React.PureComponent {
  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.state = {
      selected: dataStorage.currentTheme
    }
  }

  async componentDidMount() {
    this.setState({
      selected: await Controller.getThemeColor()
    })
  }

  onNavigatorEvent(event) {
    if (event.type === 'DeepLink') {
      switchForm(this.props.navigator, event)
    }
    if (event.type === 'NavBarButtonPress') {
      switch (event.id) {
        case 'menu_ios':
          this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true
          });
          break;
      }
    }
  }

  onSelectTheme = (themename) => {
    this.closeModalNew()
    changeTheme(themename);
    (Platform.OS === 'ios') && ManageConnection.reloadDrawer(themename);
    this.setState({ selected: themename });
    this.props.navigator.setStyle({
      navBarBackgroundColor: CommonStyle.statusBarBgColor,
      statusBarColor: CommonStyle.statusBarBgColor,
      statusBarTextColorScheme: themename === THEME.LIGHT ? 'dark' : 'light',
      navBarButtonColor: CommonStyle.btnColor,
      navBarTextColor: CommonStyle.fontColor
    })
  }

  closeModalNew() {
    this.props.navigator.dismissModal({
      animationType: 'none'
    })
  }

  render() {
    const { selected } = this.state;

    return (
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <View style={{ backgroundColor: CommonStyle.fontDefaultColor, marginLeft: 187, marginRight: 16, marginTop: 505, borderRadius: 8, borderWidth: 1 }}>
          <RowItem
            title={I18n.t('light')}
            onPress={() => this.onSelectTheme('light')}
            selected={selected === 'light'}
          />
          <RowItem
            title={I18n.t('dark')}
            onPress={() => this.onSelectTheme('dark')}
            selected={selected === 'dark'}
          />
        </View>
      </View>
    )
  }
};
