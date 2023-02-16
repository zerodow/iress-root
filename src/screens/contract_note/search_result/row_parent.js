import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList } from 'react-native'
import { connect } from 'react-redux'
import TransitionView from '~/component/animation_component/transition_view'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import * as Business from '~/business';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Flag from '~/component/flags/flag'
import I18n from '~/modules/language'
import Ionicons from 'react-native-vector-icons/Ionicons';
import PureCollapsible from '@component/rn-collapsible/pure-collapsible';
import ProgressBar from '@module/_global/ProgressBar';
import Highlighter from 'react-native-highlight-words';
import { resultSearchNewOrderByMaster } from '~/lib/base/functionUtil'
import { func, dataStorage } from '~/storage';
import Row from './row'

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons)

export class RowParent extends Component {
  constructor(props) {
    super(props)
    this.renderRow = this.renderRow.bind(this)
    this.renderSymbol = this.renderSymbol.bind(this)
    this.renderCompanyName = this.renderCompanyName.bind(this)
    this.renderExchange = this.renderExchange.bind(this)
    this.renderClass = this.renderClass.bind(this)
    this.renderFlag = this.renderFlag.bind(this)
    this.iconRotate = new Animated.Value(0)
    this.state = {
      isExpand: false
    }
  }

  renderSymbol(symbol) {
    const istradingHalt = dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].trading_halt
    const symbolName = Business.getSymbolName({ symbol })
    return (
      <TextLoad
        isLoading={this.props.isLoading}
        style={{
          fontFamily: CommonStyle.fontPoppinsBold,
          fontSize: CommonStyle.fontSizeL,
          color: CommonStyle.fontColor
        }}
        numberOfLines={1}
      >
        <Text style={[CommonStyle.textMainRed, {
          fontFamily: CommonStyle.fontPoppinsBold,
          fontSize: CommonStyle.fontSizeL
        }]}>{istradingHalt ? '! ' : ''}</Text>
        <Highlighter
          highlightStyle={[styles.colorHighlight, this.props.isHistory
            ? { color: CommonStyle.fontWhite }
            : {}]}
          searchWords={[this.props.textSearch]}
          textToHighlight={symbolName}
          style={{ opacity: 1 }}
        />
      </TextLoad>
    )
  }

  renderCompanyName(companyName) {
    return (
      <TextLoad
        isLoading={this.props.isLoading}
        numberOfLines={1}
        style={{
          fontFamily: CommonStyle.fontPoppinsRegular,
          fontSize: CommonStyle.fontSizeXS,
          color: CommonStyle.fontCompany
        }}
      >
        <Highlighter
          highlightStyle={[styles.colorHighlight, this.props.isHistory
            ? { color: CommonStyle.fontCompany }
            : {}]}
          searchWords={[this.props.textSearch]}
          textToHighlight={companyName}
          style={{ opacity: 1 }}
        />
      </TextLoad>
    )
  }

  renderExchange(symbol) {
    const exchanges = symbol ? Business.getDisplayExchange({ symbol }) : 'ASX';
    return (
      <Text
        style={{
          fontFamily: CommonStyle.fontPoppinsBold,
          fontSize: CommonStyle.fontSizeL,
          color: CommonStyle.fontColor,
          textAlign: 'right'
        }}
        numberOfLines={1}
      >
        {exchanges}
      </Text>
    )
  }
  renderClass(classSymbol) {
    return (
      <TextLoad
        isLoading={this.props.isLoading}
        numberOfLines={1}
        style={{
          fontFamily: CommonStyle.fontPoppinsRegular,
          fontSize: CommonStyle.fontSizeXS,
          color: CommonStyle.fontCompany,
          textAlign: 'right'
        }}
      >
        {classSymbol}
      </TextLoad>
    )
  }

  renderFlag(symbol) {
    const flagIcon = symbol ? Business.getFlag(symbol) : 'AU';
    return (
      <Flag type={'flat'} code={flagIcon} size={18.5} />
    )
  }

  renderSeparator() {
    return (
      <View style={{ height: 8 }} />
    )
  }

  renderRow({ item = {}, index }) {
    let idx = index
    if (!this.state.isExpand) {
      if (this.state.listData.length > 10) {
        idx = index < 10 ? 10 - index : 0
      } else {
        idx = this.state.listData.length - index
      }
    }
    return (
      <Row
        isHistory={this.props.isHistory}
        cbSearch={this.props.cbSearch}
        textSearch={this.props.textSearch}
        animation={this.state.isExpand ? 'fadeIn' : 'fadeOut'}
        data={item}
        index={idx}
      />
    )
  }

  renderContent() {
    if (this.state.isLoadingChildren) {
      return <View style={{ display: 'flex', padding: 16, justifyContent: 'center', alignItems: 'center' }}>
        <ProgressBar />
      </View>
    }
    return (
      <FlatList
        ItemSeparatorComponent={this.renderSeparator}
        data={this.state.listData}
        renderItem={this.renderRow}
        ListHeaderComponent={() => <View style={{ height: 8 }} />}
        ListFooterComponent={() => <View style={{ height: 8 }} />}
        keyExtractor={item => item.symbol}
        keyboardShouldPersistTaps="always"
        style={{ paddingLeft: 36 }}
      />
    )
  }

  onChangeExpandStatus(isExpand) {
    if (!isExpand) {
      rotate = 0
    } else {
      rotate = 1
    }
    this.iconRotate.setValue(rotate)
    if (isExpand) {
      this.getListChildrenSymbol()
      this.props.closeRow && this.props.closeRow()
      this.props.registerExpandRow && this.props.registerExpandRow(this.actionExpand)
    } else {
      this.setState({ isExpand: false })
    }
  }

  getListChildrenSymbol() {
    this.setState({ isLoadingChildren: true, isExpand: true })
    const { data, textSearch } = this.props
    const section = func.getSymbolObj(data.symbol) || data;
    cosnt = {
      symbol,
      class: classItem,
      master_code: masterCode
    } = section;
    let isPointTextSearch = false;
    if (textSearch.includes('.')) {
      classItem.includes(textSearch)
        ? (isPointTextSearch = true)
        : (isPointTextSearch = false);
    } else {
      isPointTextSearch = true;
    }
    if (textSearch === null || textSearch === '') {
      isPointTextSearch = false;
    }

    const cb = listData => this.callbackSearch(listData);

    resultSearchNewOrderByMaster({
      masterCode: symbol,
      textSearch,
      isPointTextSearch,
      cb
    });
  }

  callbackSearch(listData) {
    this.setState({
      isLoadingChildren: false,
      listData
    })
  }

  renderHeader() {
    const { data: item, animation, index } = this.props
    const symbol = item.symbol || ''
    const companyName = item.company_name || item.company || item.security_name;
    const classSymbol = Business.getSymbolClassDisplay(item.class)
    return (
      <TransitionView
        animation={animation || 'fadeIn'}
        index={animation === 'fadeOut' ? index : null}
        style={{ paddingRight: 16 }}>
        <View style={styles.wrapper}>
          <View style={styles.iconLeft}>
            <AnimatedIcon
              style={{
                transform: [{
                  rotate: this.iconRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg']
                  })
                }]
              }}
              name='ios-arrow-forward'
              size={18}
              color={CommonStyle.fontColor} />
          </View>
          <View style={styles.rowContainer}>
            <View style={styles.rowChildren}>
              <View style={styles.col1}>
                {this.renderSymbol(symbol)}
              </View>
              <View style={styles.col2}>
                {this.renderFlag(symbol)}
                <View style={{ width: 8 }} />
                {this.renderExchange(symbol)}
              </View>
            </View>
            <View style={{ height: 4 }}></View>
            <View style={styles.rowChildren}>
              <View style={styles.col1}>
                {this.renderCompanyName(companyName)}
              </View>
              <View style={styles.col2}>
                {this.renderClass(classSymbol)}
              </View>
            </View>
          </View>
        </View>
      </TransitionView>
    )
  }

  render() {
    return (
      <PureCollapsible
        ref={ref => this.pureCollapsible = ref}
        duration={150}
        timeout={1500}
        renderHeader={this.renderHeader.bind(this)}
        renderContent={this.renderContent.bind(this)}
        onChange={this.onChangeExpandStatus.bind(this)} />
    )
  }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    backgroundColor: 'transparent',
    justifyContent: 'space-between'
  },
  iconLeft: {
    overflow: 'visible',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  rowContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: CommonStyle.color.dark,
    borderRadius: 8
  },
  rowChildren: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  col1: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center'
  },
  col2: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  colorHighlight: {
    color: CommonStyle.color.modify,
    opacity: 1
  }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle);

const mapStateToProps = state => {
  return {
    textFontSize: state.setting.textFontSize
  }
}
export default connect(mapStateToProps)(RowParent)
