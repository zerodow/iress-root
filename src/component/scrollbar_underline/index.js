import React, { Component } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, Animated, Easing, ScrollView, Dimensions } from 'react-native';
import { dataStorage } from '../../storage'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as FunctionUtil from '~/lib/base/functionUtil';
import DebonceButton from '~/component/debounce_button'
import * as setTestId from '~/constants/testId';
const NewTouchableOpacity = DebonceButton(TouchableOpacity)

const { width: WIDTH_DEVICE } = Dimensions.get('window')

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
    this.translateAnim = new Animated.Value(16);
    this.tabWidth = [24]; // if init tab when not cal  width tab first
    this.tabWidthNormal = [];
    this.tabWidthActive = [];
    this.tabActiveWidth = [];
    this.isFirst = true
    this.fixedIndex = props.activeTab || 0
    this.state = {
      activeTab: props.activeTab || 0
    };
    this.onTabPress = this.onTabPress.bind(this)
    this.resetPage = this.resetPage.bind(this)
  }

  getTranslateAnimValue(index) {
    let res = 0
    if (this.isFirst) {
      this.isFirst = false
      this.tabWidthNormal = [...this.tabWidth]
      this.tabWidthNormal[0] = this.tabActiveWidth[0]
      this.tabWidthActive = [...this.tabActiveWidth]
      this.tabWidthActive[0] = this.tabWidth[0]
    }
    for (let i = 0; i < index; i++) {
      let width = this.tabWidthNormal[i]
      res += width
    }
    res += 16
    return res
  }

  onTabPress(index, isReset) {
    const toValue = this.getTranslateAnimValue(index)
    if (index === this.state.activeTab || this.isPressing) return
    FunctionUtil.changeAnimationSearch({ from: this.state.activeTab, to: index })
    this.isPressing = true
    Animated.timing(this.translateAnim, {
      duration: isReset ? 0 : 350,
      toValue,
      easing: Easing.linear,
      useNativeDriver: true
    }).start(() => {
      this.isPressing = false
      this.handlerAutoScroll(this.pageX, index)
    })
    const { action, id } = this.tabs[index];
    action && action(id);
    this.setState({ activeTab: index });
  }

  onTabLayout({ nativeEvent: { layout } }, index) {
    this.tabWidth[index] = layout.width;
    if (this.tabWidth.length === this.props.tabs.length && this.isFirst) {
      console.log('DCM onTabLayout')
      this.forceUpdate()
    }
  }

  onTabLayoutFake({ nativeEvent: { layout } }, index) {
    this.tabActiveWidth[index] = layout.width;
    if (this.tabActiveWidth.length === this.props.tabs.length && !this.isFirst) {
      console.log('DCM onTabLayoutFake')
      this.forceUpdate()
    }
  }

  handlerAutoScroll(pageX, index) {
    if (pageX > this.tabWidth[index]) pageX -= this.tabWidth[index]
    else pageX = 0
    this.scroll && this.scroll.scrollTo({ x: pageX, animated: true })
  }

  resetPage() {
    this.onTabPress(0, true)
    this.scroll && this.scroll.scrollTo({ x: 0, animated: false })
  }

  renderTab({ tabInfo, index }) {
    const { activeTab } = this.state;
    return (
      <NewTouchableOpacity key={`tabs_${index}`} style={[styles.tab, this.props.tabStyle]}
        hitSlop={{
          top: 10,
          bottom: 10
        }}
        onPress={e => {
          this.pageX = e && e.nativeEvent && e.nativeEvent.pageX
          this.onTabPress(index)
        }}
        {...setTestId.testProp(`Id_test_${tabInfo.label}`, `Label_test_${tabInfo.label}`)}
        onLayout={e => this.onTabLayout(e, index)}>
        {
          <Text style={[
            index === activeTab
              ? styles.tabLabelActive
              : styles.tabLabel,
            index === this.tabs.length - 1
              ? { paddingLeft: 16, marginRight: 32 }
              : { paddingHorizontal: 16 },
            { fontSize: CommonStyle.fontSizeXS1 }
          ]}>
            {tabInfo.label}
          </Text>
        }
      </NewTouchableOpacity>
    );
  }

  renderUnderline() {
    const width = this.isFirst ? this.tabWidth[this.state.activeTab] : this.tabWidthActive[this.state.activeTab]
    return (
      <Animated.View style={[styles.activeMark, {
        transform: [
          { translateX: this.translateAnim }
        ],
        width: (width - 32) || 1
      }]}>
      </Animated.View>
    )
  }

  renderTabs() {
    return this.tabs.map((e, i) => this.renderTab({ tabInfo: e, index: i }))
  }

  renderTabFake({ tabInfo, index }) {
    return (
      <View
        pointerEvents='none'
        key={`tabs_${index}`} style={[styles.tabFake, this.props.tabStyle]}
        onLayout={e => this.onTabLayoutFake(e, index)}>
        {
          <Text style={[index === 0 ? styles.tabLabel : styles.tabLabelActive, { paddingHorizontal: 16, opacity: 0 }, { fontSize: CommonStyle.fontSizeXS1 }]}>{tabInfo.label}</Text>
        }
      </View>
    );
  }

  renderTabsFake() {
    return this.tabs.map((e, i) => this.renderTabFake({ tabInfo: e, index: i }))
  }

  render() {
    return (
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        horizontal
        style={[styles.wrapper, this.props.style]}
        ref={ref => this.scroll = ref}
        {...setTestId.testProp(`Id_test_header_tab_wrapper`, `Label_test_header_tab_wrapper`)}
        showsHorizontalScrollIndicator={false}>
        {this.renderTabs()}
        {this.renderTabsFake()}
        {this.renderUnderline()}
      </ScrollView>
    );
  }
}

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    wrapper: {
      width: WIDTH_DEVICE,
      overflow: 'hidden'
    },
    container: {
      flex: 1
    },
    tabContainer: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: 16
    },
    tab: {
      zIndex: 10,
      justifyContent: 'center',
      overflow: 'visible',
      position: 'relative'
    },
    tabFake: {
      opacity: 0,
      zIndex: 0,
      left: 0,
      justifyContent: 'center',
      overflow: 'visible',
      position: 'absolute'
    },
    tabLabel: {
      fontSize: CommonStyle.fontSizeXS,
      fontFamily: CommonStyle.fontPoppinsRegular,
      color: CommonStyle.fontColor,
      opacity: 0.7
    },
    tabLabelActive: {
      fontSize: CommonStyle.fontSizeXS,
      fontFamily: CommonStyle.fontPoppinsBold,
      color: CommonStyle.color.modify
    },
    activeMark: {
      zIndex: 9,
      left: 0,
      position: 'absolute',
      bottom: 0,
      height: 4,
      borderRadius: 2,
      backgroundColor: CommonStyle.color.turquoiseBlue
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
