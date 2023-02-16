import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { connect } from 'react-redux'
import TransitionView from '~/component/animation_component/transition_view'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import * as Business from '~/business';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Flag from '~/component/flags/flag'
import I18n from '~/modules/language'
import Highlighter from 'react-native-highlight-words';
import { calculateLineHeight } from '~/util'
import { func, dataStorage } from '~/storage';

export class Row extends Component {
  constructor(props) {
    super(props)
    this.renderSymbol = this.renderSymbol.bind(this)
    this.renderCompanyName = this.renderCompanyName.bind(this)
    this.renderExchange = this.renderExchange.bind(this)
    this.renderClass = this.renderClass.bind(this)
    this.renderFlag = this.renderFlag.bind(this)
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
        style={[{
          fontFamily: CommonStyle.fontPoppinsRegular,
          fontSize: CommonStyle.fontSizeXS,
          color: CommonStyle.fontCompany
        }, Platform.OS === 'android'
          ? { lineHeight: calculateLineHeight(CommonStyle.fontSizeXS) }
          : {}]}
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
        {(classSymbol + '').toUpperCase()}
      </TextLoad>
    )
  }

  renderFlag(symbol) {
    const flagIcon = symbol ? Business.getFlag(symbol) : 'AU';
    return (
      <Flag type={'flat'} code={flagIcon} size={18.5} />
    )
  }

  render() {
    const { data: item, animation, index, isHistory } = this.props
    const symbol = item.symbol || ''
    const companyName = Business.getCompanyName({ symbol })
    const classSymbol = Business.getSymbolClassDisplay(item.class || item.classSymbol)
    return (
      <TransitionView
        animation={animation || 'fadeIn'}
        index={animation === 'fadeOut' ? index : null}
        style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity style={styles.rowContainer} onPress={() => this.props.cbSearch && this.props.cbSearch({ symbolInfo: item, isHistory })}>
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
        </TouchableOpacity>
      </TransitionView>
    )
  }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
  rowContainer: {
    width: '100%',
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
export default connect(mapStateToProps)(Row)
