import React, { Component } from 'react'
import { View, Text, Animated, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native'
import { isIphoneXorAbove } from '~/lib/base/functionUtil'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Ionicons from 'react-native-vector-icons/Ionicons'
import I18n from '~/modules/language'
// import { ScrollBarUndelineCustom } from '~s/order/search_bar'
import ScrollBarUndelineCustom from '~/component/scrollbar_underline'
import Enum from '~/enum.js';
import CustomDate from '~/component/customDate'
import * as timeUtils from '~/lib/base/dateTime';

const { width: WIDTH_DEVICE } = Dimensions.get('window')
const { CNOTE_FILTER_TYPE, CNOTE_PAGE_SIZE, SYMBOL_CLASS, SYMBOL_CLASS_QUERY } = Enum;

const TouchableOpacityAnim = Animated.createAnimatedComponent(TouchableOpacity)

export default class Header extends Component {
  constructor(props) {
    super(props)
    this.heightHeader = 0
    this.translateAnim = new Animated.Value(0)
    this.opacityAnim = new Animated.Value(1)
    this.opacityOverlay = new Animated.Value(0)
    this.heightDateAnim = new Animated.Value(props.isShowDate ? 56 : 0)
    this.applyDate = this.applyDate.bind(this)
    this.hideHeader = this.hideHeader.bind(this)
    this.showCustomDate = this.showCustomDate.bind(this)
    this.changeOverlay = this.changeOverlay.bind(this)
    this.hideCustomDate = this.hideCustomDate.bind(this)
    this.showHeader = this.showHeader.bind(this)
    this.showError = this.showError.bind(this)
    this.hideError = this.hideError.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)
    this.onSelectSymbolClass = this.onSelectSymbolClass.bind(this)
    this.state = {
      fromDate: props.initialDate && props.initialDate.fromDate ? props.initialDate.fromDate : timeUtils.convertLocationToStartDaySettingTime(+new Date()),
      toDate: props.initialDate && props.initialDate.toDate ? props.initialDate.toDate : timeUtils.convertLocationToEndDaySettingTime(+new Date()),
      error: props.error || '',
      type: props.type || 'error'
    }
    this.listSymbolClass = [
      {
        id: SYMBOL_CLASS.ALL_TYPES,
        label: I18n.t(SYMBOL_CLASS.ALL_TYPES),
        action: this.onSelectSymbolClass
      },
      {
        id: SYMBOL_CLASS.EQUITY,
        label: I18n.t(SYMBOL_CLASS.EQUITY),
        action: this.onSelectSymbolClass
      },
      {
        id: SYMBOL_CLASS.ETFS,
        label: I18n.t(SYMBOL_CLASS.ETFS),
        action: this.onSelectSymbolClass
      },
      {
        id: SYMBOL_CLASS.MF,
        label: I18n.t(SYMBOL_CLASS.MF),
        action: this.onSelectSymbolClass
      },
      {
        id: SYMBOL_CLASS.WARRANT,
        label: I18n.t(SYMBOL_CLASS.WARRANT),
        action: this.onSelectSymbolClass
      },
      {
        id: SYMBOL_CLASS.FUTURE,
        label: I18n.t(SYMBOL_CLASS.FUTURE),
        action: this.onSelectSymbolClass
      },
      {
        id: SYMBOL_CLASS.OPTION,
        label: I18n.t(SYMBOL_CLASS.OPTION),
        action: this.onSelectSymbolClass
      }
    ]
  }

  onSelectSymbolClass(classSymbol) {
    this.props.changeClass && this.props.changeClass(classSymbol)
  }

  toggleDrawer() {
    // this.props.onLeftPress && this.props.onLeftPress()
    this.props.navigator &&
      this.props.navigator.toggleDrawer({
        side: 'left',
        animated: true
      });
  }

  renderLeftComponent() {
    return (
      <TouchableOpacityAnim
        onPress={this.toggleDrawer}
        style={{
          display: 'flex',
          width: 36,
          justifyContent: 'center',
          opacity: this.opacityAnim
        }}>
        <Ionicons
          color={CommonStyle.navigatorSpecial.navBarButtonColor1}
          style={{ marginLeft: -14 }}
          size={34}
          name={'ios-menu'}
        />
      </TouchableOpacityAnim>
    )
  }

  renderContent() {
    return (
      <View style={{
        display: 'flex',
        justifyContent: 'center',
        width: WIDTH_DEVICE * 0.7
      }}>
        <Text style={styles.mainTitle}>{I18n.t(this.props.title)}</Text>
      </View>
    )
  }

  hideHeader() {
    Animated.parallel([Animated.timing(this.opacityAnim, {
      toValue: 0,
      duration: 300
    }),
    Animated.timing(this.opacityOverlay, {
      toValue: 0.68,
      duration: 300
    }),
    Animated.timing(this.heightDateAnim, {
      toValue: 0,
      duration: 300
    })]).start()
  }

  resetScrollTabbar() {
    this.refScrollTabbar && this.refScrollTabbar.resetPage && this.refScrollTabbar.resetPage()
  }

  renderRightComponent() {
    return this.props.renderRightComp ? this.props.renderRightComp() : null
  }

  renderMainHeader(opacity) {
    const height = this.opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 48]
    })
    return (
      <Animated.View style={{
        ...styles.mainHeader,
        opacity: opacity !== null && typeof opacity === 'number' ? opacity : this.opacityAnim,
        height
      }}>
        {this.renderLeftComponent()}
        {this.renderContent()}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          {this.renderRightComponent()}
        </View>
      </Animated.View>
    )
  }

  cancelEvent() {
    this.props.cancelEvent && this.props.cancelEvent()
  }

  showHeader(textSearch, cb) {
    if (this.isShowDate) {
      Animated.parallel([
        Animated.timing(this.opacityAnim, {
          toValue: 1,
          duration: 300
        }),
        Animated.timing(this.opacityOverlay, {
          toValue: 0,
          duration: 300
        }),
        Animated.timing(this.heightDateAnim, {
          toValue: 56,
          duration: 300
        })]).start()
    } else {
      Animated.parallel([
        Animated.timing(this.opacityAnim, {
          toValue: 1,
          duration: 300
        }),
        Animated.timing(this.opacityOverlay, {
          toValue: 0,
          duration: 300
        })
      ]).start(() => {
        if (textSearch === '') {
          this.resetScrollTabbar()
        }
        cb && cb()
      })
    }
  }

  renderContentHeader(opacity = 1) {
    const opacityAnimReverse = this.opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0]
    })
    const translateX = this.opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 20]
    })
    return (
      <Animated.View style={{
        ...styles.contentHeader,
        opacity
      }}>
        <Animated.View
          style={{
            display: 'flex',
            height: 20,
            width: 16,
            justifyContent: 'center'
          }} />
        <Animated.View style={{
          display: 'flex',
          flex: 1,
          paddingRight: 16,
          transform: [
            {
              translateX
            }
          ],
          justifyContent: 'center'
        }}>
          {this.props.children}
        </Animated.View>
        <TouchableOpacity
          onPress={() => this.cancelEvent()}
          style={{ width: 72, alignItems: 'flex-end', paddingRight: 16 }}>
          <Animated.Text style={{
            ...CommonStyle.rightTextBold,
            opacity: opacityAnimReverse
          }}>{I18n.t('cancel')}</Animated.Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  changeOverlay(isSearch) {
    Animated.timing(this.opacityOverlay, {
      toValue: isSearch ? 1 : 0.68,
      duration: 300
    }).start()
  }

  renderOverlay() {
    const backgroundColor = this.opacityOverlay.interpolate({
      inputRange: [0, 0.68, 1],
      outputRange: ['transparent', 'black', CommonStyle.backgroundColor]
    })
    return (
      <Animated.View
        pointerEvents='box-none'
        style={{
          ...StyleSheet.absoluteFillObject,
          width: WIDTH_DEVICE,
          backgroundColor,
          opacity: this.opacityOverlay
        }}>
      </Animated.View>
    )
  }

  renderClass(opacity) {
    const opacityAnim = this.opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0]
    })
    const height = this.opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [47, 0]
    })
    return (
      <Animated.View style={{
        opacity: typeof opacity === 'number' ? opacity : opacityAnim,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        height
      }}>
        <ScrollBarUndelineCustom
          isNotFake={true}
          ref={ref => this.refScrollTabbar = ref}
          tabs={this.listSymbolClass} />
      </Animated.View>
    )
  }

  showCustomDate() {
    this.isShowDate = true
    if (this.isShowError) {
      Animated.sequence([
        Animated.timing(this.heightDateAnim, {
          toValue: 56,
          duration: 300
        }),
        Animated.timing(this.translateAnim, {
          toValue: 24 + 56,
          duration: 300
          // useNativeDriver: true
        })
      ]).start()
    } else {
      Animated.timing(this.heightDateAnim, {
        toValue: 56,
        duration: 300
      }).start()
    }
  }

  hideCustomDate() {
    this.isShowDate = false
    if (this.isShowError) {
      Animated.parallel([
        Animated.timing(this.translateAnim, {
          toValue: 24 + 0,
          duration: 300
          // useNativeDriver: true
        }),
        Animated.timing(this.heightDateAnim, {
          toValue: 0,
          duration: 300
        })
      ]).start()
    } else {
      Animated.timing(this.heightDateAnim, {
        toValue: 0,
        duration: 300
      }).start()
    }
  }

  applyDate(fromDate, toDate) {
    this.props.applyDate && this.props.applyDate(fromDate, toDate)
    this.setState({
      fromDate,
      toDate
    })
  }

  renderCustomDate(opacity) {
    const { fromDate, toDate } = this.state
    return (
      <Animated.View style={{
        opacity: opacity !== null && typeof opacity === 'number' ? opacity : this.opacityAnim,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        height: this.heightDateAnim
      }}>
        <View style={{ width: 36 }} />
        <View style={{ width: WIDTH_DEVICE - 36 - 72, paddingBottom: 14 }}>
          <CustomDate
            fromDate={fromDate}
            toDate={toDate}
            applyDate={this.applyDate}
          />
        </View>
      </Animated.View>
    )
  }

  showError({ error, type }) {
    this.isShowError = true
    this.timeout && clearTimeout(this.timeout)
    this.setState({ error, type }, () => {
      Animated.timing(this.translateAnim, {
        toValue: 24,
        duration: 300
        // useNativeDriver: true
      }).start()
    })
    // this.timeout = setTimeout(() => {
    //   Animated.timing(this.translateAnim, {
    //     toValue: 0,
    //     duration: 300
    //   }).start()
    // }, 5000)
  }

  hideError() {
    this.isShowError = false
    this.setState({ error: '' })
    this.timeout && clearTimeout(this.timeout)
    Animated.timing(this.translateAnim, {
      toValue: 0,
      duration: 300
      // useNativeDriver: true
    }).start()
  }

  renderError() {
    const opacity = this.translateAnim.interpolate({
      inputRange: [0, 24],
      outputRange: [0, 1]
    })
    const borderBottomRightRadius = this.opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, CommonStyle.borderBottomRightRadius]
    })
    const extraHeight = this.opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [this.heightHeader, this.heightHeader - 8]
    })
    return (
      <Animated.View style={{
        position: 'absolute',
        zIndex: 1,
        width: WIDTH_DEVICE,
        top: 0,
        left: 0,
        right: 0,
        height: this.heightHeader,
        justifyContent: 'flex-end',
        alignItems: 'center',
        transform: [
          { translateY: this.translateAnim }
        ],
        opacity,
        backgroundColor: CommonStyle.fontDark3,
        borderBottomRightRadius
      }}>
        <Animated.View style={{
          position: 'absolute',
          zIndex: 1,
          width: WIDTH_DEVICE,
          top: 0,
          left: 0,
          right: 0,
          height: extraHeight,
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 4,
          // transform: [
          //   { translateY: this.translateAnim }
          // ],
          opacity,
          backgroundColor: CommonStyle.color[this.state.type],
          borderBottomRightRadius
        }}>
          <Text style={CommonStyle.textSubLightWhite}>{this.state.error}</Text>
        </Animated.View>
      </Animated.View>
    )
  }

  onLayout({ nativeEvent: { layout } }) {
    this.heightHeader = layout.height
  }

  render() {
    const height = this.opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 8]
    })
    const borderBottomRightRadius = this.opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, CommonStyle.borderBottomRightRadius]
    })
    return (
      <View>
        <Animated.View style={{
          ...styles.headerContainer,
          backgroundColor: CommonStyle.fontDark3,
          borderBottomRightRadius,
          overflow: 'hidden'
        }}
          onLayout={l => this.onLayout(l)}>
          {this.renderMainHeader(0)}
          {this.renderContentHeader(0)}
          {this.renderCustomDate(0)}
          {this.renderClass(0)}
          <Animated.View style={{ backgroundColor: CommonStyle.fontDark3, height, borderBottomRightRadius: CommonStyle.borderBottomRightRadius }} />
        </Animated.View>
        {this.renderError()}
        <Animated.View style={{
          ...styles.headerContainer,
          borderBottomRightRadius,
          zIndex: 3,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: CommonStyle.backgroundColor
        }}>
          {this.renderMainHeader()}
          {this.renderContentHeader(0)}
          {this.renderCustomDate(0)}
          {this.renderClass(0)}
          {this.renderOverlay()}
          <View
            // pointerEvents='box-none'
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'transparent'
            }}>
            {this.renderMainHeader(0)}
            {this.renderContentHeader()}
            {this.renderCustomDate()}
            {this.renderClass()}
          </View>
        </Animated.View>
      </View>
    )
  }
}

const isIphone = Platform.OS === 'ios';
const isIphoneX = isIphoneXorAbove();
let marginTop = 0;
if (isIphone && isIphoneX) marginTop = 46;
if (isIphone && !isIphoneX) marginTop = 16;

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    headerContainer: {
      width: WIDTH_DEVICE
    },
    mainHeader: {
      marginTop,
      backgroundColor: 'transparent',
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center'
    },
    contentHeader: {
      paddingTop: 8,
      paddingBottom: 16,
      backgroundColor: 'transparent',
      overflow: 'hidden',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    mainTitle: {
      fontFamily: CommonStyle.fontPoppinsBold,
      fontSize: CommonStyle.fontSizeXXL,
      color: CommonStyle.navigatorSpecial.navBarSubtitleColor
    }
  })

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
