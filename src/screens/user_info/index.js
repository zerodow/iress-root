import React from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, Text, ScrollView, StatusBar } from 'react-native';
import * as Emitter from '@lib/vietnam-emitter';
import * as NewsBusiness from '../../streaming/news';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as Util from '../../util';
import ItemView from './ItemView';
import {
  logDevice,
  switchForm,
  setRefTabbar
} from '../../lib/base/functionUtil';
import NetworkWarning from '../../component/network_warning/network_warning';
import * as Controller from '../../memory/controller';
import * as RoleUser from '../../roleUser';
import * as api from '../../api';
import * as Channel from '~/streaming/channel';
import Header from '../../../src/component/headerNavBar/index';
import BottomTabBar from '~/component/tabbar'
import Icons from '../../../src/component/headerNavBar/icon';
import FallHeader from '~/component/fall_header'
import { func } from '~/storage';
import ScreenId from '~/constants/screen_id'

class UserInfo extends React.PureComponent {
  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    const {
      full_name: fullName,
      user_login_id: userLogin,
      phone,
      email: emailContact,
      email_alert: emailAlert,
      user_type: userType,
      organisation_code: organisationCode,
      branch_code: branchCode,
      advisor_code: advisorCode
    } = Controller.getUserInfo();

    this.state = {
      isLoading: true,
      accountList: [],
      fullName,
      userLogin,
      phone,
      emailContact,
      emailAlert,
      userType,
      organisationCode,
      branchCode,
      advisorCode
    }
    this.id = Util.getRandomKey()
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
    } else {
      switch (event.id) {
        case 'didAppear': setRefTabbar(this.refBottomTabBar)
          func.setCurrentScreenId(ScreenId.USER_INFO)
          break
      }
    }
  }

  subChangeEmailNotification = this.subChangeEmailNotification.bind(this)
  subChangeEmailNotification() {
    const channelChangeEmailNotification = Channel.getChannelChangeEmailNotification()
    Emitter.addListener(channelChangeEmailNotification, this.id, ({ emailNotification }) => {
      this.setState({
        emailAlert: emailNotification
      })
    })
  }

  subChangeUserInfo = this.subChangeUserInfo.bind(this)
  subChangeUserInfo() {
    const channelName = NewsBusiness.getChannelUserInfoNew()
    Emitter.addListener(channelName, this.id, (data) => {
      this.setState({
        fullName: data.full_name ? data.full_name : this.state.fullName,
        userLogin: data.user_login_id ? data.user_login_id : this.state.userLogin,
        phone: data.phone ? data.phone : this.state.phone,
        emailContact: data.email ? data.email : this.state.emailContact,
        emailAlert: data.email_alert ? data.email_alert : this.state.emailAlert,
        userType: data.user_type ? data.user_type : this.state.userType,
        organisationCode: data.organisation_code ? data.organisation_code : this.state.organisationCode,
        branchCode: data.branch_code ? data.branchCode : this.state.branchCode,
        advisorCode: data.advisor_code ? data.advisor_code : this.state.advisorCode
      })
    })
  }

  componentDidMount() {
    this.subChangeEmailNotification()
    this.subChangeUserInfo()
    const { list_mapping: listMapping } = Controller.getUserInfo();
    if (!listMapping) {
      this.timeoutAccountMapping && clearTimeout(this.timeoutAccountMapping)
      this.timeoutAccountMapping = setTimeout(() => {
        this.setState({
          isLoading: false,
          accountList: []
        })
      }, 600)
      return
    }
    const urlListAccount = api.getListAccountInfo(listMapping && listMapping !== '' ? listMapping.replace(/\s/g, '') : '');

    api.requestData(urlListAccount, true).then(data => {
      this.setState({
        isLoading: false,
        accountList: data || []
      })
    }).catch(err => {
      logDevice('error', `GET DataRoleUser ERROR - URL: ${urlListAccount} - err: ${err}`)
      this.setState({
        isLoading: false,
        accountList: []
      })
    })
  }

  componentWillUnmount() {
    this.timeoutAccountMapping && clearTimeout(this.timeoutAccountMapping)
    const channelName = NewsBusiness.getChannelUserInfoNew();
    Emitter.deleteListener(channelName);
  }

  renderManagement() {
    const style = { borderBottomWidth: 0 }
    const {
      accountList,
      userType,
      organisationCode,
      branchCode,
      advisorCode,
      isLoading
    } = this.state;
    let contentRender = null;

    switch (userType) {
      case 'operation':
        contentRender = <ItemView
          style={style}
          isLoading={isLoading}
          title={'Management'}
          value={'All Account'} />
        break;
      case 'advisor':
        contentRender = (<View>
          <ItemView
            isLoading={isLoading}
            title={'Organisation Code Management'}
            value={organisationCode && organisationCode !== null ? organisationCode.split(',').filter(e => e !== '') : []}
          />
          <ItemView
            isLoading={isLoading}
            title={'Branch Code Management'}
            value={branchCode && branchCode !== null ? branchCode.split(',').filter(e => e !== '') : []}
          />
          <ItemView
            isLoading={isLoading}
            title={'Advisor Code Management'}
            value={advisorCode && advisorCode !== null ? advisorCode.split(',').filter(e => e !== '') : []}
          />
          <ItemView
            style={style}
            isLoading={isLoading}
            title={'Account Management'}
            value={accountList} />
        </View>);
        break;
      case 'retail':
        contentRender = <ItemView
          style={style}
          isLoading={isLoading}
          title={'Account Management'}
          value={accountList} />
        break;
      default:
        break;
    }

    return contentRender;
  }
  renderRightComp() {
    return (
      <React.Fragment>
        <Icon styles={{ paddingRight: 8 }} name="ios-create" />
        <Icon styles={{ paddingHorizontal: 8 }} name="ios-add-circle" />
        <Icon styles={{ paddingLeft: 8 }} name="ios-search" />
      </React.Fragment>
    );
  }
  renderLeftComp = () => {
    return (
      <React.Fragment>
        <View style={{ left: -14 }}>
          <Icons styles={{ paddingRight: 16 }} name='ios-menu' onPress={this.openMenu} size={34} />
        </View>
      </React.Fragment>
    );
  }
  openMenu = () => {
    const { navigator } = this.props;
    if (navigator) {
      navigator.toggleDrawer({
        side: 'left',
        animated: true
      });
    }
  }

  renderHeader = this.renderHeader.bind(this)
  renderHeader() {
    return <Header
      leftIcon={'ios-menu'}
      title="User Info"
      renderLeftComp={this.renderLeftComp}
      containerStyle={{
        borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
        overflow: 'hidden'
      }}
      firstChildStyles={{ minHeight: 18 }}
      style={{ paddingTop: 16 }}
    >
      <View />
    </Header>
  }

  setRefBottomTabBar = this.setRefBottomTabBar.bind(this)
  setRefBottomTabBar(ref) {
    setRefTabbar(ref)
    this.refBottomTabBar = ref
  }
  showTabbarQuick = this.showTabbarQuick.bind(this)
  showTabbarQuick() {
    this.refBottomTabBar && this.refBottomTabBar.showTabbarQuick()
  }
  hideTabbarQuick = this.hideTabbarQuick.bind(this)
  hideTabbarQuick() {
    this.refBottomTabBar && this.refBottomTabBar.hideTabbarQuick()
  }

  render() {
    const {
      fullName,
      userLogin,
      phone,
      emailContact,
      emailAlert
    } = this.state;

    return <FallHeader
      style={{ backgroundColor: CommonStyle.backgroundColorNews }}
      header={this.renderHeader()}
    >
      <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColorNews }}>
        <ScrollView
          contentContainerStyle={[styles.scrollViewStyle, { backgroundColor: CommonStyle.backgroundColorNews }]}
          showsVerticalScrollIndicator={false}
        >
          <ItemView
            title={'Full Name'}
            value={fullName}
            isLoading={this.state.isLoading} />
          <ItemView
            title={'User Login'}
            value={userLogin}
            isLoading={this.state.isLoading} />
          <ItemView
            title={'Role'}
            value={RoleUser.getRoleGroupName()}
            isLoading={this.state.isLoading} />
          <ItemView
            title={'Phone Number'}
            value={phone || ' '}
            isLoading={this.state.isLoading} />
          <ItemView
            title={'Email Contact'}
            value={emailContact || ' '}
            isLoading={this.state.isLoading} />
          <ItemView
            style={{ flexDirection: 'row', alignItems: 'center' }}
            title={'Email Notifications'}
            value={emailAlert || ' '}
            isEmailNotif={true}
            showTabbarQuick={this.showTabbarQuick}
            hideTabbarQuick={this.hideTabbarQuick}
            navigator={this.props.navigator}
            isLoading={this.state.isLoading} />
          {this.renderManagement()}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
      <BottomTabBar
        setRef={this.setRefBottomTabBar}
        navigator={this.props.navigator} />
    </FallHeader>
  }
}

const styles = StyleSheet.create({
  scrollViewStyle: {
    paddingLeft: 16
  }
});

function mapStateToProps(state) {
  return {
    isConnected: state.app.isConnected,
    textFontSize: state.setting.textFontSize
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserInfo);
