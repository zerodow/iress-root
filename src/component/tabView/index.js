import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import I18n from '~/modules/language'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import DebonceButton from '~/component/debounce_button'
import * as setTestId from '~/constants/testId'
import { dataStorage } from '~/storage'

const { width: WIDTH_DEVICE } = Dimensions.get('window')

const NewTouchableOpacity = DebonceButton(TouchableOpacity, 1000)

const Tabs = [
  {
    label: 'open'
  },
  {
    label: 'stopLoss'
  },
  {
    label: 'filled'
  },
  {
    label: 'cancelled'
  }
]

export default class TabView extends Component {
  constructor(props) {
    super(props);
    this.tabs = props.tabs || Tabs;
    this.translateAnim = new Animated.Value(0);
    this.tabWidth = [];
    this.textWidth = []
    this.emptyTabWidth = 0
    this.textFakeWidth = []
    this.textActiveWidth = []
    this.textNormalWidth = []
    this.isFirst = true;
    this.isReady = true;
    this.state = {
      activeTab: props.activeTab || 0
    };
    this.onTabPress = this.onTabPress.bind(this)
    this.props.registerOnchangeTab && this.props.registerOnchangeTab(this.onTabPress)
  }

  componentDidMount() {
    this.props.setRef && this.props.setRef(this)
  }

  calAnimValue(index) {
    try {
      let res = 0
      const { activeTab } = this.state
      this.isFirst = false
      this.isReady = false
      this.textNormalWidth = [...this.tabWidth]
      this.textNormalWidth[activeTab] = this.textFakeWidth[activeTab] || 0
      this.textActiveWidth = [...this.textFakeWidth]
      this.textActiveWidth[activeTab] = this.textWidth[activeTab] || 0
      // res += (this.tabWidth * index)
      for (let i = 0; i < index; i++) {
        const width = this.textNormalWidth[i]
        res += width
      }
      // if (index !== 0) {
      //   res += (this.tabWidth[] - this.textActiveWidth[index]) / 2
      // }
      res += (this.emptyTabWidth * index)
      return res
    } catch (error) {
      console.log('DCM calAnimValue error', error)
      return 0
    }
  }

  forceUpdateWhenChangeLanguageOrTextSize = this.forceUpdateWhenChangeLanguageOrTextSize.bind(this)
  forceUpdateWhenChangeLanguageOrTextSize() {
    if (dataStorage.isChangeSetting) {
      dataStorage.isChangeSetting = false
      setTimeout(() => {
        const toValue = this.calAnimValue(this.state.activeTab)
        Animated.timing(this.translateAnim, {
          duration: 350,
          toValue,
          easing: Easing.linear,
          useNativeDriver: true
        }).start()
      }, 500)
    }
  }

  onTabPress(index, timoutGetData = 0) {
    try {
      if (index === this.state.activeTab || this.isPressing) return
      const toValue = this.calAnimValue(index)
      this.props.changeGlobalAnimation && this.props.changeGlobalAnimation(this.state.activeTab, index)
      this.props.onChangeTab && this.props.onChangeTab(index, timoutGetData)
      this.isPressing = true
      Animated.timing(this.translateAnim, {
        duration: 350,
        toValue,
        easing: Easing.linear,
        useNativeDriver: true
      }).start(() => this.isPressing = false)
      this.setState({
        activeTab: index
      });
    } catch (error) {
      console.log('DCM onTabPress error', error)
    }
  }

  onTabLayout({ nativeEvent: { layout } }, index) {
    this.tabWidth[index] = layout.width;
  }

  onTextLayout({ nativeEvent: { layout } }, index) {
    this.textWidth[index] = layout.width;
    // if (this.isFirst && this.tabWidth && index === this.props.activeTab && this.props.activeTab !== 0) {
    //   this.isFirst = false
    //   const value = (this.tabWidth * index) + (this.tabWidth - layout.width) / 2
    //   this.translateAnim.setValue(value)
    // } else if (this.isFirst && this.tabWidth && index === this.props.activeTab && this.props.activeTab === 0) {
    //   this.isFirst = false
    // }
  }

  onTextFakeLayout({ nativeEvent: { layout } }, index) {
    this.textFakeWidth[index] = layout.width;
  }

  onEmptyTabLayout({ nativeEvent: { layout } }) {
    this.emptyTabWidth = layout.width;
  }

  renderTab({ tabInfo, index }) {
    const { activeTab, width } = this.state;
    const { isFirstTabFake } = this.props
    let indexInit = 0
    if (this.isFirst) {
      indexInit = this.props.activeTab
    }
    return <React.Fragment
      key={`tabs_${index}`}>
      {
        index === this.tabs.length - 1
          ? null
          : isFirstTabFake
            ? <View style={{ width: 48 }} />
            : null
      }
      <NewTouchableOpacity key={`tabs_${index}`} style={styles.tab}
        {...setTestId.testProp(`ID_Tab_View_${index}`, `Label_Tab_View_${index}`)}
        onLayout={e => this.onTabLayout(e, index)}
        onPress={() => this.onTabPress(index)}>
        {
          <Text
            onLayout={e => this.onTextLayout(e, index)}
            style={[{ paddingBottom: 16 }, index === activeTab ? styles.tabLabelActive : styles.tabLabel]}>{I18n.t(tabInfo.label)}</Text>
        }
        {
          index === indexInit ? <View pointerEvents='none' style={{ width: WIDTH_DEVICE, position: 'absolute', left: 0, bottom: 0, backgroundColor: 'transparent' }}>
            <Animated.View pointerEvents='none'
              style={[styles.activeMark, {
                transform: [
                  {
                    translateX: this.translateAnim
                  }
                ]
              }]}>
              <Text style={[styles.tabLabelActive, { opacity: 0 }]}>{I18n.t(this.tabs[this.state.activeTab].label)}</Text>
            </Animated.View></View> : null
        }
      </NewTouchableOpacity>
      {
        index === this.tabs.length - 1
          ? isFirstTabFake
            ? <View style={{ width: 48 }} />
            : null
          : <View style={{ flex: 1, opacity: 0, backgroundColor: 'transparent', overflow: 'visible' }} onLayout={e => this.onEmptyTabLayout(e)} />
      }
    </React.Fragment>
  }

  renderTabs() {
    return this.tabs.map((e, i) => this.renderTab({ tabInfo: e, index: i }))
  }

  renderTabFake({ tabInfo, index }) {
    return (
      <View key={`tabs_${index}`} style={[styles.tabFake, this.props.styleTab || {}]} pointerEvents='none'>
        <Text
          onLayout={e => this.onTextFakeLayout(e, index)}
          style={[index === this.state.activeTab ? styles.tabLabel : styles.tabLabelActive, { opacity: 0 }]}>{I18n.t(tabInfo.label)}</Text>
      </View>
    );
  }

  renderTabsFake() {
    return <View pointerEvents='none' style={{ opacity: 0, position: 'absolute', backgroundColor: 'transparent' }}>
      {this.tabs.map((e, i) => this.renderTabFake({ tabInfo: e, index: i }))}
    </View>
  }

  renderScrollbar() {
    return (
      <View style={[styles.tabContainer, this.props.style]}>
        {this.renderTabs()}
        {this.renderTabsFake()}
      </View>
    );
  }

  render() {
    this.props.isReal && (dataStorage.tabIndexSelected === this.props.tabId) && this.forceUpdateWhenChangeLanguageOrTextSize()
    return this.renderScrollbar()
  }
}

TabView.defaultProps = {
  activeTab: 0,
  isReal: true
}

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    container: {
      flex: 1
    },
    tabContainer: {
      flex: 1,
      flexDirection: 'row',
      paddingLeft: 32,
      paddingTop: 10
    },
    tab: {
      justifyContent: 'space-between'
    },
    tabFake: {
      flex: 1,
      opacity: 0,
      justifyContent: 'center',
      backgroundColor: 'transparent',
      alignItems: 'center'
    },
    tabLabel: {
      fontSize: CommonStyle.fontSizeS,
      fontFamily: CommonStyle.fontPoppinsRegular,
      color: 'rgb(255, 255, 255)'
    },
    tabLabelActive: {
      fontSize: CommonStyle.fontSizeS,
      fontFamily: CommonStyle.fontPoppinsBold,
      color: CommonStyle.color.modify
    },
    activeMark: {
      // left: 0,
      alignSelf: 'flex-start',
      overflow: 'visible',
      zIndex: 9,
      position: 'absolute',
      bottom: -2,
      height: 4,
      borderRadius: 2,
      backgroundColor: CommonStyle.color.turquoiseBlue
    }
  })

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
