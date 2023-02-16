import React, { Component } from 'react'
import { Text, View, Keyboard, KeyboardAvoidingView, StyleSheet, FlatList, Dimensions, ScrollView, TouchableWithoutFeedback } from 'react-native'
import { searchResponse, getClassQuery, checkParent, checkPropsStateShouldUpdate } from '~/lib/base/functionUtil'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Flag from '~/component/flags/flag'
import I18n from '~/modules/language'
import * as Business from '~/business';
import TransitionView from '~/component/animation_component/transition_view'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import { dataStorage } from '~/storage';
import Row from './row'
import RowParent from './row_parent'
import KeyboardPushCenter from '~/component/keyboard_smart/keyboard_push_center_space.js'
import Enum from '~/enum'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as setTestId from '~/constants/testId';
const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window')
const { SYMBOL_CLASS } = Enum;

const FAKE_DATA = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default class SearchResult extends Component {
  constructor(props) {
    super(props)
    this.renderRow = this.renderRow.bind(this)
    this.renderRowLoading = this.renderRowLoading.bind(this)
    this.renderFooter = this.renderFooter.bind(this)
  }

  renderFooter() {
    return (
      <View style={{ height: 200 }} />
    )
  }

  closeRow() {
    if (this.saveRowExpand) {
      this.saveRowExpand(true)
      this.saveRowExpand = null
    }
  }

  clearRow() {
    if (this.saveRowExpand) {
      this.saveRowExpand = null
    }
  }

  renderRow({ item = {}, index }) {
    let idx = index
    if (this.props.textSearch === '' && !this.props.isHistory) {
      if (this.props.data.length > 10) {
        idx = index < 10 ? 10 - index : 0
      } else {
        idx = this.props.data.length - index
      }
    }
    if (checkParent(item)) {
      return (
        <RowParent
          isHistory={this.props.isHistory}
          cbSearch={this.props.cbSearch}
          closeRow={this.closeRow.bind(this)}
          clearRow={this.clearRow.bind(this)}
          registerExpandRow={fn => fn && (this.saveRowExpand = fn)}
          textSearch={this.props.textSearch}
          data={item}
          animation={this.props.textSearch === '' && !this.props.isHistory ? 'fadeOut' : 'fadeIn'}
          index={idx}
        />
      )
    }
    return (
      <Row
        isHistory={this.props.isHistory}
        cbSearch={this.props.cbSearch}
        textSearch={this.props.textSearch}
        data={item}
        animation={this.props.textSearch === '' && !this.props.isHistory ? 'fadeOut' : 'fadeIn'}
        index={idx}
      />
    )
  }

  renderRowLoading({ animation, index }) {
    const isLoading = true
    return (
      <TransitionView
        animation={animation}
        index={animation === 'fadeOut' ? null : index}
        style={styles.rowContainer}>
        <View style={styles.rowChildren}>
          <View style={styles.col1}>
            <TextLoad
              isLoading={isLoading}
              style={{
                fontFamily: CommonStyle.fontPoppinsBold,
                fontSize: CommonStyle.fontSizeL,
                color: CommonStyle.fontColor
              }}
              numberOfLines={1}
            >
              {'symbol'}
            </TextLoad>
          </View>
          <View style={styles.col2}>
            <ViewLoad isLoading={isLoading}>
              <Flag type={'flat'} code={'AU'} size={18.5} />
              <View style={{ width: 8 }} />
              <Text
                style={{
                  fontFamily: CommonStyle.fontPoppinsBold,
                  fontSize: CommonStyle.fontSizeL,
                  color: CommonStyle.fontColor,
                  textAlign: 'right'
                }}
                numberOfLines={1}
              >
                {'ASX'}
              </Text>
            </ViewLoad>
          </View>
        </View>
        <View style={{ height: 4 }}></View>
        <View style={styles.rowChildren}>
          <View style={styles.col1}>
            <TextLoad
              isLoading={isLoading}
              numberOfLines={1}
              style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.fontSizeXS,
                color: CommonStyle.fontCompany
              }}
            >
              {'companyName company'}
            </TextLoad>
          </View>
          <View style={styles.col2}>
            <TextLoad
              isLoading={isLoading}
              numberOfLines={1}
              style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.fontSizeXS,
                color: CommonStyle.fontCompany,
                textAlign: 'right'
              }}
            >
              {'equity'}
            </TextLoad>
          </View>
        </View>
      </TransitionView>
    )
  }

  renderSeparator() {
    return (
      <View style={{ height: 8 }} />
    )
  }

  renderHistoryBar = this.renderHistoryBar.bind(this)
  renderHistoryBar() {
    return (
      this.props.isHistory
        ? <View style={{ alignItems: 'center', flexDirection: 'row', marginVertical: 8, paddingLeft: 16, width: '100%' }}>
          <MaterialIcon name='history' size={24} style={{ color: CommonStyle.fontColor, paddingRight: 8 }} />
          <Text {...setTestId.testProp(`Id_test_history_bar`, `Label_test_history_bar`)} style={CommonStyle.textSub}>{I18n.t('History')}</Text>
        </View>
        : <View style={{ height: 8 }} />
    )
  }

  renderData() {
    if (!this.props.isLoading && this.props.data.length === 0) {
      return <React.Fragment>
        {this.renderHistoryBar()}
        <View style={{ flex: 1 }}>
          <TransitionView
            animation='fadeIn'
            index={3}
            {...setTestId.testProp(`Id_test_search_result_nodata`, `Label_test_search_result_nodata`)}
            style={{ flex: 1, height: HEIGHT_DEVICE - 130, justifyContent: 'center', alignItems: 'center' }}>
            <KeyboardPushCenter>
              <Text style={CommonStyle.textNoData}>{I18n.t('noData')}</Text>
            </KeyboardPushCenter>
          </TransitionView>
        </View>
      </React.Fragment>
    }
    return <React.Fragment>
      {this.renderHistoryBar()}
      <FlatList
        {...setTestId.testProp(`Id_test_search_result_wrapper`, `Label_test_search_result_wrapper`)}
        ItemSeparatorComponent={this.renderSeparator}
        data={this.props.data}
        renderItem={this.renderRow}
        keyExtractor={(item, index) => `${item.symbol}${index}`}
        ListFooterComponent={this.renderFooter}
        keyboardShouldPersistTaps="always"
        style={{ width: WIDTH_DEVICE }}
      />
    </React.Fragment>
  }

  renderLoading(animation) {
    return <React.Fragment>
      {this.renderHistoryBar()}
      <FlatList
        ItemSeparatorComponent={this.renderSeparator}
        data={FAKE_DATA}
        renderItem={e => this.renderRowLoading({ animation, index: e.index })}
        keyExtractor={item => item.symbol}
        ListFooterComponent={this.renderFooter}
        keyboardShouldPersistTaps="always"
        style={{
          ...StyleSheet.absoluteFillObject,
          ...{
            width: WIDTH_DEVICE,
            padding: 16
          }
        }}
      />
    </React.Fragment>
  }

  shouldComponentUpdate(nextProps, nextState) {
    const listProps = ['isLoading', 'isHistory', 'textSearch', 'data'];
    const listState = [];
    const check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
    return check;
  }

  dismissKeyboard() {
    Keyboard.dismiss()
  }

  render() {
    return (
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={this.dismissKeyboard}>
        <View style={{ flex: 1 }}>
          {this.props.isLoading && this.renderLoading(this.props.isLoading ? dataStorage.animationSearch : 'fadeOut')}
          {this.renderData()}
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
  rowContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor2,
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
  }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
