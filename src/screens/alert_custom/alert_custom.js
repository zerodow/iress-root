import React, { Component } from 'react';
import {
  View, Text, Modal, Dimensions, TouchableOpacity, ActivityIndicator,
  Platform, PixelRatio, StatusBar
} from 'react-native';
import { VibrancyView, BlurView } from 'react-native-blur';
import I18n from '../../modules/language';
import { checkPropsStateShouldUpdate } from '../../lib/base/functionUtil';
import * as Animatable from 'react-native-animatable';
import ProgressBarLight from '../../modules/_global/ProgressBarLight';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { dataStorage } from '../../storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as Business from '../../business';
import * as Controller from '~/memory/controller';
const { width, height } = Dimensions.get('window');

export class AlertCustom extends Component {
  constructor(props) {
    super(props);
    this.signoutTimeout = null;
    this.state = {
      visible: this.props.visible || false,
      signingOut: false,
      cancelLogout: false,
      disabled: false,
      isConnected: this.props.isConnected || true
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.isConnected !== this.state.isConnected) {
      this.setState({ isConnected: nextProps.isConnected });
      nextProps.isConnected && this.signoutTimeout && this.logout();
    } else if (nextProps && nextProps.visible !== this.state.visible) {
      this.setState({ visible: nextProps.visible }, () => {
        // nextProps.visible && this.refs && this.refs.logoutPopup && this.refs.logoutPopup.fadeInUpBig(800);
        nextProps.visible && this.refs && this.refs.logoutPopup && this.refs.logoutPopup.fadeIn(200);
      });
    }
  }

  actionButtonCancel() {
    this.signoutTimeout && clearTimeout(this.signoutTimeout);
    // Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarBgColor })
    this.setState({ signingOut: false, cancelLogout: true }, () => {
      // this.refs && this.refs.logoutPopup && this.refs.logoutPopup.fadeOutDownBig(500);
      this.refs && this.refs.logoutPopup && this.refs.logoutPopup.fadeOut();
      // setTimeout(() => {
      //   this.props.close();
      // }, 500);
      this.props.close();
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const listProps = ['visible', { setting: ['lang', 'textFontSize'] }];
    const listState = ['visible', 'signingOut', 'cancelLogout'];
    const check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
    return check;
  }

  logout() {
    this.perf && this.perf.incrementCounter(performanceEnum.click_sign_out);
    this.timeoutLogout && clearTimeout(this.timeoutLogout)
    this.timeoutLogout = setTimeout(() => {
      this.setState({ signingOut: false, cancelLogout: true })
      this.props.logoutFunc();
    }, 50)
  }

  renderSignOutButton() {
    let { signingOut } = this.state;
    if (signingOut) {
      return (
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 0.5,
          borderRadius: 100,
          borderColor: CommonStyle.fontDisable,
          backgroundColor: CommonStyle.fontDisable,
          width: '45%'
        }}>
          <ActivityIndicator style={{ width: 24, height: 24 }} color={CommonStyle.fontWhite} />
        </View>
      )
    } else {
      return (
        <TouchableOpacity
          onPress={() => {
            if (this.props.title) {
              this.setState({ visible: false }, () => {
                this.props.close();
                this.props.onCancel();
              });
            } else {
              this.setState({ signingOut: true, cancelLogout: false }, this.logout)
            }
          }}
          style={{
            borderWidth: 0.5,
            borderRadius: 100,
            borderColor: CommonStyle.fontColorButtonSwitch,
            backgroundColor: CommonStyle.fontColorButtonSwitch,
            width: '45%'
          }}>
          <Text testID={`signOutAlert`} style={{
            fontSize: CommonStyle.fontSizeS,
            textAlign: 'center',
            fontFamily: CommonStyle.fontPoppinsRegular,
            color: CommonStyle.fontDark,
            paddingVertical: 8
          }}>{this.props.title ? I18n.t('ok', { locale: this.props.setting.lang }) : I18n.t('logout', { locale: this.props.setting.lang })}</Text>
        </TouchableOpacity>
      )
    }
  }

  setAnimationIn() {
    // this.refs && this.refs.logoutPopup && this.refs.logoutPopup.fadeInUpBig(800);
    this.refs && this.refs.logoutPopup && this.refs.logoutPopup.fadeIn(200);
  }

  render() {
    // fix bug crash when close modal on android
    /**
          * fix loi height sai tren mo vai thiet bi xiaomi, note 8
          */
    const realHeight = Controller.getRealWindowHeight()
    const deviceHeight = Platform.OS === 'ios'
      ? height
      : realHeight
    if (!this.state.visible) return <View></View>
    const loading = (
      <View style={{
        backgroundColor: 'transparent',
        width: width,
        height: height,
        zIndex: 999,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <View style={{
          backgroundColor: 'transparent',
          height: 40,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <ProgressBarLight />
        </View>
        <Text style={[CommonStyle.textMainNoColor, { color: '#FFF', marginBottom: 4, textAlign: 'center' }]}>{I18n.t('cancellingOrder', { locale: this.props.setting.lang })}</Text>
      </View>);
    return (
      <Modal
        // onShow={() => Business.setStatusBarBackgroundColor()}
        // onDismiss={() => Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarBgColor })}
        animationType="none"
        transparent={true}
        onRequestClose={() => console.log('on request close')}
        // onShow={this.setAnimationIn.bind(this)}
        visible={this.state.visible}>
        <View style={{ flex: 1, width, backgroundColor: CommonStyle.fontDefaultColorOpacity, position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, height: deviceHeight }}>
          <View style={{ flex: 1, marginHorizontal: 36, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ justifyContent: 'center', backgroundColor: CommonStyle.bgCircleDrawer, width: '100%', borderTopRightRadius: 12, borderTopLeftRadius: 12 }}>
              <Text style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontColor, paddingTop: 32, fontSize: CommonStyle.fontSizeM, textAlign: 'center' }]}>{this.props.header ? this.props.header : I18n.t('confirm')}</Text>
              <Text style={[CommonStyle.textDescDialog, { color: CommonStyle.fontColor, paddingTop: 16, fontSize: CommonStyle.fontSizeM - 2, textAlign: 'center' }]}>{this.props.title ? this.props.title : I18n.t('notiSignOut')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 32, width: '100%', paddingHorizontal: 24, backgroundColor: CommonStyle.bgCircleDrawer, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
              <TouchableOpacity
                disabled={this.state.disabled}
                onPress={() => this.actionButtonCancel()}
                style={{
                  borderWidth: 0.5,
                  borderRadius: 100,
                  borderColor: CommonStyle.fontColorButtonSwitch,
                  width: '45%'
                }}>
                <Text testID={`cancelAlert`} style={{
                  fontSize: CommonStyle.fontSizeS,
                  textAlign: 'center',
                  fontFamily: CommonStyle.fontPoppinsRegular,
                  color: CommonStyle.fontColorButtonSwitch,
                  paddingVertical: 8
                }}>{I18n.t('cancel')}</Text>
              </TouchableOpacity>
              {this.renderSignOutButton()}
            </View>
          </View>
        </View>
      </Modal >
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isConnected: state.app.isConnected,
    setting: state.setting
  };
}

export default connect(mapStateToProps, {})(AlertCustom);
