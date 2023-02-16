import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Animated
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import ENUM from '~/enum';
import * as api from '../../api';
import {
  logDevice
} from '../../lib/base/functionUtil';
import * as Emitter from '@lib/vietnam-emitter';
import * as NewsBusiness from '../../streaming/news';
import * as Controller from '../../memory/controller';
import * as Channel from '../../streaming/channel';
import { connect } from 'react-redux';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '~/modules/language/'

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const paddingHorizontalWrapper = 22
const paddingHorizontalContent = 22
const paddingCenter = 16
const widthButton = (DEVICE_WIDTH - paddingHorizontalContent * 2 - paddingHorizontalWrapper * 2 - 16) / 2
class AlertModal extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      emailValue: '',
      isErr: false,
      widthTextInput: 300
    }
  }

  onCancel = () => {
    this.props.showTabbarQuick && this.props.showTabbarQuick()
    this.refAnimationView && this.refAnimationView.fadeOut(500).then(() => {
      this.props.navigator.dismissModal({
        animationType: 'none'
      });
    })
  }

  onSubmit = () => {
    const userInfo = Controller.getUserInfo()
    const { user_id: userId } = userInfo;
    const emailNotifUrl = api.getEmailNotificationUrl(userId);
    const data = {
      data: {
        email_alert: this.state.emailValue.trim()
      }
    }

    api.httpPut(emailNotifUrl, data).then(data => {
      const { errorCode } = data;
      if (errorCode) {
        this.setState({
          isErr: true
        }, () => {
          this.refContentAnimationView && this.refContentAnimationView.shake()
        })
      } else {
        this.setState({
          isErr: false
        }, () => {
          const channelName = NewsBusiness.getChannelUserInfoNew()
          const channelChangeEmailNotification = Channel.getChannelChangeEmailNotification()
          Emitter.emit(channelName, { email_alert: this.state.emailValue.trim() })
          Emitter.emit(channelChangeEmailNotification, { emailNotification: this.state.emailValue.trim() })
          Controller.setUserInfo({
            ...userInfo,
            ...{ email_alert: this.state.emailValue.trim() }
          });
          this.props.showTabbarQuick && this.props.showTabbarQuick()
          this.refAnimationView && this.refAnimationView.fadeOut().then(() => {
            this.props.navigator.dismissModal({
              animationType: 'none'
            });
          })
        })
      }
    }).catch(err => {
      logDevice('error', `PUT email notification ERROR - URL: ${emailNotifUrl} - err: ${err}`)
    })
  }
  handleOnLayoutContainer = (event) => {
    const width = event.nativeEvent.layout.width
    this.setState({
      widthTextInput: width - 48
    })
  }
  setRef = (ref) => {
    this.refAnimationView = ref
  }
  setRefContent = this.setRefContent.bind(this)
  setRefContent(ref) {
    this.refContentAnimationView = ref
  }
  render() {
    let { isErr } = this.state;
    const isConnected = this.props.isConnected;
    const WrapperComponent = Platform.OS === 'ios'
      ? Animated.View
      : KeyboardAvoidingView
    let orderProps = {
      testID: 'orderScreen',
      style: {
        flex: 1
        // width: DEVICE_WIDTH,
        // height: DEVICE_HEIGHT,
        // // backgroundColor: 'rgba(58, 66, 94, 0.7)',
        // justifyContent: 'center',
        // alignItems: 'center'
      }
    }
    if (Platform.OS === 'android') {
      orderProps.enabled = false
      orderProps.behavior = 'height'
    }
    return (
      <WrapperComponent {...orderProps}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animatable.View onAnimationEnd={() => {
            this.refTextInput && this.refTextInput.focus()
          }} ref={this.setRef} animation={'fadeIn'} delay={500} duration={500} style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: paddingHorizontalWrapper,
            alignItems: 'center',
            backgroundColor: 'rgba(58, 66, 94, 0.7)'
          }}>
            <KeyboardAvoidingView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }} behavior="padding" enabled>
              <Animatable.View
                ref={this.setRefContent}
                onLayout={this.handleOnLayoutContainer}
                style={styles.container}>
                <View style={styles.wrapContentTop}>
                  <Text style={styles.txtTitle}>{I18n.t('changeEmailNotification')}</Text>
                  <Text style={styles.txtContent}>{I18n.t('enterYourNewEmail')}</Text>
                </View>
                <View style={[styles.wrapTxtInput, isErr ? { borderWidth: 1, borderColor: CommonStyle.fontNewRed } : {}]}>
                  <TextInput
                    // selectionColor={CommonStyle.fontColor}
                    ref={ref => this.refTextInput = ref}
                    underlineColorAndroid={'transparent'}
                    // autoFocus
                    value={this.state.emailValue}
                    placeholderTextColor='rgba(255, 255, 255, 0.6)'
                    style={[styles.txtImputStyle, { width: '100%' }]}
                    placeholder={I18n.t('email')}
                    onChangeText={text => this.setState({ emailValue: text, isErr: false })}
                  />
                </View>
                {
                  isErr
                    ? <Text style={[styles.errMessage, { paddingTop: 0, marginTop: 16 }]}>{I18n.t('emailContactFormatNotRecognize')}</Text>
                    : null
                }
                <View style={{
                  marginTop: !isErr ? 40 : 16,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignSelf: 'baseline'
                }}>
                  <TouchableOpacityOpt
                    timeDelay={ENUM.TIME_DELAY}
                    onPress={this.onCancel}
                    style={{
                      width: widthButton,
                      // paddingHorizontal: 36,
                      borderRadius: 100,
                      borderWidth: 2,
                      borderColor: CommonStyle.fontBlue1,
                      paddingVertical: 8,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={styles.txtBtn}>Cancel</Text>
                  </TouchableOpacityOpt>
                  <View style={{ width: 16 }} />
                  <TouchableOpacityOpt
                    timeDelay={ENUM.TIME_DELAY}
                    onPress={() => {
                      if (!isConnected) return;
                      this.onSubmit()
                    }}
                    disabled={this.state.emailValue === ''}
                    style={{
                      width: widthButton,
                      // paddingHorizontal: 36,
                      borderRadius: 100,
                      borderColor: CommonStyle.fontBlue1,
                      paddingVertical: 8,
                      alignItems: 'center',
                      backgroundColor: this.state.emailValue === '' || !isConnected ? CommonStyle.fontNearLight2 : CommonStyle.fontBlue1
                    }}
                  >
                    <View style={[styles.buttonLeft, {
                      opacity: 0
                    }]}>
                      <Text style={[styles.txtBtn, { color: CommonStyle.fontDark }]}>{I18n.t('cancel')}</Text>
                    </View>
                    <View style={[styles.buttonLeft, { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }]}>
                      <Text style={[styles.txtBtn, { color: CommonStyle.fontDark }]}>{I18n.t('ok')}</Text>
                    </View>
                  </TouchableOpacityOpt>
                </View>
              </Animatable.View>
            </KeyboardAvoidingView>
          </Animatable.View>
        </TouchableWithoutFeedback>
      </WrapperComponent >
    )
  }
}
function mapStateToProps(state) {
  return {
    isConnected: state.app.isConnected,
    textFontSize: state.setting.textFontSize
  };
}

export default connect(mapStateToProps)(AlertModal);

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    container: {
      paddingVertical: 32,
      backgroundColor: CommonStyle.bgCircleDrawer,
      borderRadius: 8,
      // marginHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: paddingHorizontalContent

    },
    wrapContentTop: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    footerStyle: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-around',
      flexDirection: 'row',
      height: 40,
      // paddingHorizontal: 16,
      marginTop: 32
    },
    txtTitle: {
      fontSize: CommonStyle.fontSizeM,
      fontFamily: CommonStyle.fontPoppinsRegular,
      color: CommonStyle.fontWhite,
      paddingBottom: 8
    },
    txtContent: {
      paddingBottom: 16,
      fontFamily: CommonStyle.fontPoppinsRegular,
      color: CommonStyle.fontWhite,
      fontSize: CommonStyle.fontSizeXS,
      opacity: 0.87
    },
    wrapTxtInput: {
      flexDirection: 'row',
      // marginHorizontal: 16,
      backgroundColor: CommonStyle.fontColorSwitchTrue,
      paddingHorizontal: 8,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center'
    },
    txtImputStyle: {
      // paddingHorizontal: 8,
      // marginHorizontal: 4,
      height: 48,
      fontFamily: CommonStyle.fontPoppinsRegular,
      fontSize: Platform.OS === 'ios' ? CommonStyle.fontSizeM : CommonStyle.fontSizeM,
      color: CommonStyle.fontWhite
    },
    buttonLeft: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      alignContent: 'center'
    },
    buttonRight: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8
    },
    txtBtnLeft: {
      color: CommonStyle.fontBlue1,
      fontSize: CommonStyle.font13,
      fontFamily: CommonStyle.fontPoppinsRegular
    },
    txtBtn: {
      color: CommonStyle.fontBlue1,
      fontSize: CommonStyle.font13,
      fontFamily: CommonStyle.fontPoppinsRegular
    },
    errMessage: {
      color: CommonStyle.fontNewRed,
      fontSize: CommonStyle.font13,
      fontWeight: '300',
      fontFamily: 'HelveticaNeue-Light',
      paddingTop: 8
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
