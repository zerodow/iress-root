import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform
} from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { func } from '~/storage'
import userType from '~/constants/user_type'
import I18n from '~/modules/language'
import { connect } from 'react-redux';
import * as Controller from '~/memory/controller'
import Ionicons from 'react-native-vector-icons/Ionicons'
import CustomIcon from '~/component/Icon'
import TransitionView from '~/component/animation_component/transition_view'
import ENUM from '~/enum'

const { TIMEOUT_HIDE_ERROR } = ENUM

// UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const CustomLayoutAnimation = {
  duration: 400,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity
  }
};

const { width: WIDTH_DEVICE } = Dimensions.get('screen')

export class FallHeader extends Component {
  constructor(props) {
    super(props)
    this.isDelay = func.getUserPriceSource() === userType.Delay
    // this.isDelay = true
    this.showError = this.showError.bind(this)
    this.hideError = this.hideError.bind(this)
    this.dic = {
      error: props.error || '',
      type: props.type || ''
    }
    this.state = {
      isShowConnecting: false,
      isShowError: false,
      isShowIcon: false
    }
  }

  calHeight() {
    const isStreaming = Controller.isPriceStreaming()
    return this.isDelay ? (this.props.isPullToRefresh && !isStreaming ? 24 : 32) : (this.props.isPullToRefresh && !isStreaming ? 0 : 8)
  }

  componentDidMount() {
    if (!this.props.isConnected) {
      this.timeoutDidmount && clearTimeout(this.timeoutDidmount)
      this.timeoutDidmount = setTimeout(() => {
        this.showError({
          type: 'network',
          error: `${I18n.t('connecting')}...`,
          isShowIcon: false
        })
      }, 1000)
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      isConnected
    } = nextProps;
    const isChangeNerworkState = this.props.isConnected !== isConnected
    this.isDelay = func.getUserPriceSource() === userType.Delay
    // this.isDelay = true
    if (isChangeNerworkState) {
      this.timeoutDidmount && clearTimeout(this.timeoutDidmount)
      if (isConnected) {
        this.hideError({ type: 'network' })
      } else {
        this.showError({
          type: 'network',
          error: `${I18n.t('connecting')}...`
        })
      }
    }
  }

  showError({ type = 'error', error = '', height = 0, isShowIcon = false }) {
    this.timeout && clearTimeout(this.timeout)
    const finalType = !['error', 'network'].includes(type) ? 'warning' : type
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        400,
        LayoutAnimation.Types.linear,
        LayoutAnimation.Properties.opacity
      )
    );
    if (type === 'error') {
      this.dic = {
        error,
        type: finalType
      }
    }
    let state = {}
    if (type === 'error') {
      state = { isShowError: true, isShowIcon }
    }
    if (type === 'network') {
      state = { isShowConnecting: true, isShowIcon }
    }
    this.setState(state)
    if (!['process', 'network'].includes(type)) {
      this.timeout = setTimeout(() => {
        this.hideError({ type })
      }, TIMEOUT_HIDE_ERROR)
    }
  }

  hideError({ type = 'error' } = {}) {
    this.timeout && clearTimeout(this.timeout)
    LayoutAnimation.configureNext(CustomLayoutAnimation);
    if (type === 'error') {
      this.dic = {
        error: '',
        type: ''
      }
    }
    let state = {}
    if (type === 'error') {
      state = { isShowError: false }
    }
    if (type === 'network') {
      state = { isShowConnecting: false }
    }
    this.setState(state)
  }

  setHeightHeaderCb({ nativeEvent: { layout } }) {
    const heightHeader = layout.height;
    this.props.onLayout && this.props.onLayout(heightHeader)
  }

  renderWarning() {
    return (
      <View style={{
        ...styles.error,
        borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
        backgroundColor: 'rgb(247, 220, 21)'
      }}>
        <View style={{ opacity: 0 }}>
          {this.props.renderHeader ? this.props.renderHeader() : this.props.header}
        </View>
        <Text style={[
          CommonStyle.textWarningDrawer,
          {
            paddingLeft: 16,
            paddingVertical: 2,
            fontFamily: CommonStyle.fontPoppinsRegular,
            textAlign: 'center',
            fontSize: CommonStyle.fontSizeXS
          }
        ]}>{I18n.t('delayWarning')}</Text>
      </View>
    )
  }

  renderTextDelay() {
    return (
      <React.Fragment>
        {this.isDelay ? <Text style={[
          CommonStyle.textWarningDrawer,
          {
            paddingLeft: 16,
            paddingVertical: 2,
            fontFamily: CommonStyle.fontPoppinsRegular,
            textAlign: 'center',
            fontSize: CommonStyle.fontSizeXS
          }
        ]}>{I18n.t('delayWarning')}</Text> : null}
      </React.Fragment>
    )
  }

  renderError() {
    const backgroundColor = this.dic.type ? CommonStyle.color[this.dic.type] : CommonStyle.backgroundColor
    return (
      <View style={{
        ...styles.error,
        borderBottomRightRadius: this.props.isNotBottomLine
          ? 0
          : CommonStyle.borderBottomRightRadius,
        backgroundColor
      }}>
        {this.renderTextDelay()}
        {this.renderTextConnecting()}
        <View style={{ opacity: 0 }}>
          {
            this.props.renderHeader
              ? this.props.renderHeader()
              : this.props.header
          }
        </View>
        {this.renderTextError()}
      </View>
    )
  }

  renderConnecting = this.renderConnecting.bind(this)
  renderConnecting() {
    const backgroundColor = CommonStyle.color.network
    return this.state.isShowConnecting
      ? <View style={{
        ...styles.error,
        borderBottomRightRadius: this.props.isNotBottomLine ? 0 : CommonStyle.borderBottomRightRadius,
        backgroundColor
      }}>
        {this.renderTextDelay()}
        <View style={{ opacity: 0 }}>
          {this.props.renderHeader ? this.props.renderHeader() : this.props.header}
        </View>
        {this.renderTextConnecting()}
      </View>
      : null
  }

  renderRealHeader() {
    const isReal = true
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        backgroundColor: 'transparent'
      }}>
        {this.props.renderHeader ? this.props.renderHeader(isReal) : this.props.header}
      </View>
    )
  }

  renderTextError() {
    return (
      <React.Fragment>
        <View style={{
          height: this.state.isShowError ? null : 0,
          width: '100%',
          alignItems: 'center',
          flexDirection: 'row',
          paddingHorizontal: 16
        }}>
          {
            this.state.isShowIcon ? <View style={{ height: '100%', paddingVertical: this.state.isShowIcon ? 8 : 4 }}>
              <CustomIcon color={CommonStyle.fontWhite} name='equix_alert' style={{ top: this.state.isShowIcon ? 2 : 0, fontSize: CommonStyle.fontSizeS, paddingRight: 16 }} />
            </View> : null
          }
          <Text style={[
            CommonStyle.textSubLightWhite,
            {
              flex: 1,
              paddingVertical: this.state.isShowIcon ? 8 : 4,
              color: ['error', 'network'].includes(this.dic.type) ? CommonStyle.fontWhite : CommonStyle.color.error,
              fontFamily: CommonStyle.fontPoppinsRegular,
              textAlign: this.state.isShowIcon ? 'left' : 'center',
              fontSize: CommonStyle.fontSizeXS
            }
          ]}>{this.dic.error}</Text>
        </View>
      </React.Fragment>
    )
  }

  renderTextConnecting = this.renderTextConnecting.bind(this)
  renderTextConnecting() {
    return this.state.isShowConnecting
      ? <React.Fragment>
        <View style={{
          width: '100%',
          alignItems: 'center',
          flexDirection: 'row',
          paddingHorizontal: 16
        }}>
          {
            this.state.isShowIcon ? <View style={{ height: '100%', paddingVertical: this.state.isShowIcon ? 8 : 4 }}>
              <CustomIcon color={CommonStyle.fontWhite} name='equix_alert' style={{ top: this.state.isShowIcon ? 2 : 0, fontSize: CommonStyle.fontSizeS, paddingRight: 16 }} />
            </View> : null
          }
          <Text style={[
            CommonStyle.textSubLightWhite,
            {
              flex: 1,
              paddingVertical: this.state.isShowIcon ? 8 : 4,
              color: CommonStyle.fontWhite,
              fontFamily: CommonStyle.fontPoppinsRegular,
              textAlign: this.state.isShowIcon ? 'left' : 'center',
              fontSize: CommonStyle.fontSizeXS
            }
          ]}>{`${I18n.t('connecting')}...`}</Text>
        </View>
      </React.Fragment>
      : null
  }

  pullToRefreshFake() {
    return (
      <React.Fragment>
        {this.renderTextDelay()}
        {this.renderTextConnecting()}
        {this.renderTextError()}
        {!this.props.isPullToRefresh ? [<View key='headerFake' style={{ opacity: 0 }}>
          {this.props.renderHeader ? this.props.renderHeader() : this.props.header}
        </View>,
        <View
          key='bottomLine'
          style={{
            width: WIDTH_DEVICE + 8,
            zIndex: 0,
            overflow: 'hidden',
            height: 500 + (this.props.isNotBottomLine ? 0 : 8),
            marginTop: -500,
            justifyContent: 'flex-end',
            borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
            backgroundColor: CommonStyle.fontDark3
          }}>
        </View>] : null}
      </React.Fragment>
    )
  }

  render() {
    const HeaderComponent = this.props.animation ? TransitionView : View
    return (
      <HeaderComponent
        setRef={this.props.setRef}
        animation={this.props.animation}
        style={[styles.wrapper, this.props.style]}>
        {this.renderError()}
        {this.renderConnecting()}
        {this.isDelay ? this.renderWarning() : null}
        {this.renderRealHeader()}
        {this.pullToRefreshFake()}
        {this.props.children}
      </HeaderComponent>
    );
  }
}

function mapStateToProps(state) {
  return {
    isConnected: state.app.isConnected,
    textFontSize: state.setting.textFontSize
  };
}
export default connect(mapStateToProps, {}, null, { forwardRef: true })(FallHeader);

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    backgroundColor: CommonStyle.color.bg,
    overflow: 'hidden'
  },
  container: {
  },
  error: {
    display: 'flex',
    zIndex: 1,
    position: 'absolute',
    justifyContent: 'flex-end',
    top: 0,
    width: WIDTH_DEVICE + 4,
    alignItems: 'center',
    overflow: 'hidden'
  }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
