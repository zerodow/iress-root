import React, { Component } from 'react';
import {
  View, Text, ScrollView, Platform
} from 'react-native';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as userActions from './user.actions';
import { logDevice, switchForm, firstCharacterCapitalize, setRefTabbar } from '../../lib/base/functionUtil';
import { dataStorage, func } from '../../storage';
import Picker from 'react-native-picker';
import { setCurrentScreen } from '../../lib/base/analytics';
import I18n from '../../modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller'
import loginUserType from '../../constants/login_user_type'
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import ScreenId from '../../constants/screen_id';
import Perf from '../../lib/base/performance_monitor';
import * as Controller from '../../memory/controller'
import Header from '../../../src/component/headerNavBar/index';
import BottomTabBar from '~/component/tabbar'
import Icons from '../../../src/component/headerNavBar/icon';
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import TransitionView from '~/component/animation_component/transition_view'
import ItemView from './itemView'
import FallHeader from '~/component/fall_header'

export class UserInfo extends Component {
  constructor(props) {
    super(props);
    this.userInfo = Controller.getUserInfo()
    if (!this.userInfo) this.userInfo = {};
    this.labelAnim = 'fadeInLeft'
    this.contentAnim = 'fadeInRightBig'
    this.error = '';
    this.state = {
      editMode: false,
      name: this.userInfo.display,
      birthDay: new Date().toDateString(),
      gender: 'Male',
      driverLicense: '',
      phone: '',
      address: '',
      isDateTimePickerVisible: false,
      errorAddress: '',
      errorDriver: '',
      errorName: '',
      errorPhone: '',
      errorPostcode: '',
      isShowKeyboard: false,
      displayAddress: '',
      userCanceled: false,
      animationLogin: ''
    }
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.perf = new Perf(performanceEnum.show_form_user_info);
    this.accountId = dataStorage.accountId;
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
        case 'willAppear':
          setCurrentScreen(analyticsEnum.userInfo);
          this.perf && this.perf.incrementCounter(performanceEnum.show_form_user_info)
          break;
        case 'didAppear':
          setRefTabbar(this.tabbar)
          func.setCurrentScreenId(ScreenId.USER_INFO)
          break;
        case 'willDisappear':
          Picker.hide();
          break;
        case 'didDisappear':
          break;
        default:
          break;
      }
    }
  }

  componentDidMount() {
    this.props.actions.loadDataFrom();
  }

  componentWillUnmount() {
    dataStorage.timeoutUserInfo && clearTimeout(dataStorage.timeoutUserInfo)
  }

  convertDateString(date) {
    if (!date) return '';
    const returnData = moment(date).format('MM/DD/YYYY');
    return returnData;
  }

  convertGender(code) {
    switch (code) {
      case 1:
        return 'Male';
      case 2:
        return 'Female';
      default:
        return null;
    }
  }

  renderUser() {
    const { userInfo } = this.props.user || {};
    const { isLoading } = this.props.user
    return (
      <ScrollView
        testID={`userInfoScrollView`}
        style={{ flex: 1, backgroundColor: CommonStyle.backgroundColorNews }}
        showsVerticalScrollIndicator={false}
        indicatorStyle={CommonStyle.scrollBarIndicatorStyle}>
        <ItemView
          isLoading={this.props.user.isLoading}
          label={I18n.t('accountId', { locale: this.props.setting.lang })}
          value={
            dataStorage.loginUserType === loginUserType.REVIEW
              ? dataStorage.accountId
              : dataStorage.accountId} />
        <ItemView
          isLoading={this.props.user.isLoading}
          label={I18n.t('fullName', { locale: this.props.setting.lang })}
          value={
            dataStorage.loginUserType === loginUserType.REVIEW
              ? ''
              : (userInfo.account_name || '')} />
        <ItemView
          isLoading={this.props.user.isLoading}
          label={I18n.t('HINNumber', { locale: this.props.setting.lang })}
          value={
            dataStorage.loginUserType === loginUserType.REVIEW
              ? ''
              : (userInfo.hin || '')} />
        <View style={{ width: '100%', flexDirection: 'row' }}>
          <View style={{ width: '50%' }}>
            <ItemView
              isLoading={this.props.user.isLoading}
              label={I18n.t('workPhone', { locale: this.props.setting.lang })}
              value={
                dataStorage.loginUserType === loginUserType.REVIEW
                  ? ' '
                  : (userInfo.work_phone || ' ')} />
          </View>
          <View style={{ width: '50%' }}>
            <ItemView
              style={{ marginLeft: 0, paddingLeft: 16 }}
              isLoading={this.props.user.isLoading}
              label={I18n.t('homePhone', { locale: this.props.setting.lang })}
              value={
                dataStorage.loginUserType === loginUserType.REVIEW
                  ? ' '
                  : (userInfo.home_phone || ' ')} />
          </View>
        </View>
        <ItemView
          isLoading={this.props.user.isLoading}
          label={I18n.t('faxNumber', { locale: this.props.setting.lang })}
          value={
            dataStorage.loginUserType === loginUserType.REVIEW
              ? ' '
              : (userInfo.fax || '')} />
        <ItemView
          isLoading={this.props.user.isLoading}
          label={I18n.t('email', { locale: this.props.setting.lang })}
          value={
            dataStorage.loginUserType === loginUserType.REVIEW
              ? ' '
              : (userInfo.email || '')} />
        <ItemView
          isLoading={this.props.user.isLoading}
          label={I18n.t('Address', { locale: this.props.setting.lang })}
          value={
            dataStorage.loginUserType === loginUserType.REVIEW
              ? ' '
              : (userInfo.address || '')} />
        <View style={{ borderBottomWidth: 1, borderBottomColor: CommonStyle.fontBorderNewsUi, backgroundColor: 'transparent', marginLeft: 16, paddingVertical: 6 }}>
          <TransitionView animation={this.labelAnim}>
            <Text style={CommonStyle.textFloatingLabel2}>
              {I18n.t('products', { locale: this.props.setting.lang })}
            </Text>
          </TransitionView>
          <TransitionView animation={this.contentAnim}>
            {
              dataStorage.loginUserType === loginUserType.REVIEW
                ? <View style={{ marginTop: 10, width: '100%' }}>
                  <Text></Text>
                </View>
                : <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 1 }}>
                  <ViewLoading
                    isLoading={isLoading}
                    containerStyle={[{
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'center',
                      marginRight: 8
                    }]}>
                    <View style={{ backgroundColor: CommonStyle.colorProduct, marginRight: 16, paddingHorizontal: 8, marginBottom: 4, borderRadius: 8 }}>
                      <Text style={CommonStyle.tagLabel}>{I18n.t('equityLowerCase', { locale: this.props.setting.lang })}</Text>
                    </View>
                  </ViewLoading>
                  <ViewLoading
                    isLoading={isLoading}
                    containerStyle={[{
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'center',
                      marginRight: 8
                    }]}>
                    {
                      userInfo.warrants_trading ? <View style={{ backgroundColor: CommonStyle.colorProduct, marginRight: 16, paddingHorizontal: 8, marginBottom: 4, borderRadius: 8 }}>
                        <Text style={[CommonStyle.tagLabel]}>{I18n.t('warrantLower', { locale: this.props.setting.lang })}</Text>
                      </View> : null
                    }
                  </ViewLoading>
                  <ViewLoading
                    isLoading={isLoading}
                    containerStyle={[{
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'center'
                    }]}>
                    {
                      userInfo.options_trading ? <View style={{ backgroundColor: CommonStyle.colorProduct, paddingHorizontal: 8, marginBottom: 4, borderRadius: 8 }}>
                        <Text style={CommonStyle.tagLabel}>{I18n.t('options', { locale: this.props.setting.lang })}</Text>
                      </View> : null
                    }
                  </ViewLoading>
                </View>
            }
          </TransitionView>
        </View>
        <ItemView
          isLoading={this.props.user.isLoading}
          label={I18n.t('userType', { locale: this.props.setting.lang })}
          value={
            dataStorage.loginUserType === loginUserType.REVIEW
              ? ''
              : firstCharacterCapitalize(this.props.user.userInfo && this.props.user.userInfo.account_type
                ? this.props.user.userInfo.account_type
                : '')} />
        <ItemView
          isLoading={this.props.user.isLoading}
          label={I18n.t('advisorName', { locale: this.props.setting.lang })}
          value={
            dataStorage.loginUserType === loginUserType.REVIEW
              ? ''
              : this.props.user.userInfo
                ? this.props.user.userInfo.advisor_name
                  ? `${this.props.user.userInfo.advisor_code} (${this.props.user.userInfo.advisor_name})`
                  : this.props.user.userInfo.advisor_code : ''} />
        <ItemView
          style={{ borderBottomWidth: 0 }}
          isLoading={this.props.user.isLoading}
          label={I18n.t('baseCurrency', { locale: this.props.setting.lang })}
          value={
            (
              this.props.user &&
              this.props.user.userInfo &&
              this.props.user.userInfo.currency
            ) || '--'} />
        <View style={{ height: 100 }}></View>
      </ScrollView >
    );
  }

  renderLeftComp = () => {
    return (
      <React.Fragment>
        <View style={{ left: -14 }}>
          <Icons styles={{ paddingRight: 16 }} name='ios-menu' onPress={this.openMenu} size={32} />
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
      title="Account"
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

  render() {
    return <FallHeader
      style={{ backgroundColor: CommonStyle.backgroundColorNews }}
      header={this.renderHeader()}
    >
      <View testID='ViewUserInfo' style={{ flex: 1 }}>
        {this.renderUser()}
        {
          Platform.OS === 'ios'
            ? <View />
            : <View style={{
              height: 32,
              backgroundColor: CommonStyle.backgroundColor
            }} />
        }
      </View>
      <BottomTabBar navigator={this.props.navigator} ref={ref => {
        this.tabbar = ref
        setRefTabbar(ref)
      }} />
    </FallHeader>
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    isConnected: state.app.isConnected,
    setting: state.setting
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserInfo);
