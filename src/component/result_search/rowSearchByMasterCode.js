import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Highlighter from 'react-native-highlight-words';
import { resultSearchNewOrderByMaster } from '../../lib/base/functionUtil';
import RnCollapsible from '../../component/rn-collapsible/rn-collapsible';
import AddCodeDetail from '../../screens/addcode/addcode.detail';
import Flag from '../../component/flags/flag';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as Business from '../../business';
import { func, dataStorage } from '../../storage';
import TouchableOpacityOpt from '../../component/touchableOpacityOpt';
import ENUM from '../../enum';
import XComponent from '../../component/xComponent/xComponent'
import _ from 'lodash';

const { height: HEIGHT, width: WIDTH } = Dimensions.get('window');
const { SCREEN: { SEARCH_CODE } } = ENUM;

export default class RowSearchByMasterCode extends XComponent {
  constructor(props) {
    super(props)
    this.state = {
      listData: [],
      isExpand: false,
      isOnPress: false
    }
    this.isOnPress = false
  }

  componentWillReceiveProps(nextProps) {
    const { selectedClass, textSearch } = this.props;
    const { selectedClass: nextClass, textSearch: nextTextSearch } = nextProps;
    if ((selectedClass !== nextClass) || textSearch !== nextTextSearch) this.setState({ isExpand: false });
  }

  _renderSectionTitle = () => {
    return (
      <View ></View>
    );
  };
  // set list data by master code and text search
  callbackSearch = listData => {
    listData && this.setState({ listData });
  }

  _renderEmpty = () => (<View style={{ alignItems: 'center' }}><Text>{'loading data ...'}</Text></View>);

  // button add code if screen is user_watch_list
  _renderButtonAddCode = ({ symbol, isParent, header, textSearch, isChild, masterCode, isOnPress }) => {
    const { nameScreen } = this.props;
    if (nameScreen === SEARCH_CODE) {
      return (
        <View style={styles.iconAddButton}>
          {!isParent ? <AddCodeDetail symbol={symbol} isParent={isParent} textSearch={textSearch} isChild={isChild} masterCode={masterCode} isOnPress={isOnPress} /> : <View style={{ width: 12 }} />}
        </View>
      )
    } else {
      return null;
    }
  }

  // render row master code by text search
  _header = () => {
    const { isExpand: isActive } = this.state;
    const {
      data,
      textSearch, nameScreen
    } = this.props;
    // insert data history or search
    const section = !_.isEmpty(func.getSymbolObj(data.symbol)) ? func.getSymbolObj(data.symbol) : data
    const {
      trading_halt: tradingHalt,
      symbol,
      class: classItem,
      master_code: masterCode,
      has_child: hasChild
    } = section
    const displayName = section.display_name || section.symbol
    if (!displayName) {
      return <View />
    }
    const securityName = section.company_name || section.company || section.security_name
    const flagIcon = Business.getFlag(symbol)
    const colorIcon = CommonStyle.colorIconSettings
    let UpOrDown = null
    const isParent = !!(masterCode === null && classItem === 'future' && !hasChild)
    if (isParent) {
      UpOrDown = isActive ? <Icon name="chevron-down" size={12} color={colorIcon} /> : <Icon name="chevron-right" size={12} color={colorIcon} />
    }
    // a
    return (
      <View style={[CommonStyle.containerHeaderNoBoder, styles.styleRows]}>
        {this._renderButtonAddCode({ symbol, textSearch, isParent, header: true })}
        <View style={{ flexDirection: 'row', alignItems: 'center', width: 12, marginLeft: nameScreen === SEARCH_CODE ? 0 : 16 }}>
          {UpOrDown}
        </View>
        <View style={{ flex: 1, marginLeft: 8 }} >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {
              tradingHalt
                ? <Text style={[CommonStyle.textMainRed]}>{'! '}</Text>
                : null
            }
            <Text numberOfLines={1} ellipsizeMode="tail" style={CommonStyle.textStyleHeader}>
              <Highlighter
                highlightStyle={textSearch ? styles.colorHighlight : CommonStyle.fontWhite}
                searchWords={[textSearch]}
                textToHighlight={displayName}
                style={{ opacity: 1 }}
              />
            </Text>
            <Flag
              type={'flat'}
              code={flagIcon}
              size={18}
              style={{ marginRight: WIDTH / 3 }}
            />
          </View>
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[CommonStyle.textTimeInsights, CommonStyle.textStyleHeader, { fontSize: CommonStyle.fontSizeS }]}>
              <Highlighter
                highlightStyle={textSearch ? styles.colorHighlight : CommonStyle.fontWhite}
                searchWords={[textSearch]}
                textToHighlight={securityName}
                style={{ opacity: 1 }}
              />
            </Text>
          </View>
        </View>
      </View>
    );
  }
  _renderHeader = () => {
    const {
      data,
      nameScreen,
      onPressFn
    } = this.props;
    if (!data.symbol) return null;
    const section = func.getSymbolObj(data.symbol) || data;
    const {
      symbol, class: classItem, master_code: masterCode, has_child: hasChild
    } = section;
    const company = section.company_name || section.company || section.security_name || '';
    // insert data history or search
    if (masterCode === null && classItem === 'future' && !hasChild) {
      return this._header();
    } else {
      return <TouchableOpacityOpt
        key={`${symbol}_orderHistory`}
        testID={`${symbol}_orderHistory`}
        onPress={() => {
          if (nameScreen !== SEARCH_CODE) onPressFn && onPressFn({ symbolInfo: section })
          else this._addAndRemoveSymbol(symbol);
        }}
        timeDelay={ENUM.TIME_DELAY}
      >
        {this._header()}
      </TouchableOpacityOpt >
    }
  };
  // add and remove symbol
  _addAndRemoveSymbol = symbol => {
    const currentPriceboardId = func.getCurrentPriceboardId();
    const isCheckStatus = func.checkSymbolInPriceboard(currentPriceboardId, symbol);
    const userId = dataStorage.user_id;
    if (!isCheckStatus) {
      Business.addSymbolToPriceboard(currentPriceboardId, userId, symbol, true);
    } else if (isCheckStatus) {
      Business.removeSymbolInPriceboard(currentPriceboardId, userId, symbol, true);
    }
  }
  // render row list data by master code and text search
  _renderRowConten = ({ item }) => {
    const {
      data: { symbol, class: classItem },
      textSearch,
      nameScreen,
      onPressFn
    } = this.props;
    const flagIcon = Business.getFlag(symbol);
    const company = item.company_name || item.company || item.security_name || '';
    return (
      <TouchableOpacityOpt
        key={`${symbol}_orderHistory`}
        testID={`${symbol}_orderHistory`}
        onPress={() => {
          const { isOnPress: nextIsOnPress } = this.state;
          console.log('$$$isOnPress', nextIsOnPress);
          this.isOnPress = !this.isOnPress;
          if (nameScreen !== SEARCH_CODE) onPressFn && onPressFn({ symbolInfo: item })
          else this._addAndRemoveSymbol(item.symbol);
        }}
        style={{
          // borderTopColor: CommonStyle.fontBorderGray,
          // borderTopWidth: 1,
          paddingVertical: 4,
          marginHorizontal: 8
        }}
        timeDelay={ENUM.TIME_DELAY}
      >
        <View style={styles.content}>
          {this._renderButtonAddCode({ symbol: item.symbol, isChild: true, masterCode: symbol, textSearch, isOnPress: this.isOnPress })}
          <View style={styles.detailCode}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[CommonStyle.textStyleContent1, { fontSize: CommonStyle.fontSizeM }]} numberOfLines={1} ellipsizeMode="tail" >
                <Highlighter
                  highlightStyle={textSearch ? styles.colorHighlight : CommonStyle.fontWhite}
                  searchWords={[textSearch]}
                  textToHighlight={item.display_name}
                  style={{ flex: 1, opacity: 1 }}
                />
              </Text>
              <Flag
                type={'flat'}
                code={flagIcon}
                size={18}
                style={{ marginLeft: WIDTH / 4 }}
              />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[[CommonStyle.textTimeInsights, CommonStyle.textStyleContent]]} numberOfLines={1} ellipsizeMode="tail" >
                <Highlighter
                  highlightStyle={textSearch ? styles.colorHighlight : CommonStyle.fontColor}
                  searchWords={[textSearch]}
                  textToHighlight={item.security_name}
                  style={{ flex: 1, opacity: 1 }}
                />
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacityOpt >
    )
  }

  _renderContent = () => {
    const { listData } = this.state;
    if (listData.length === 0) return null;
    return (
      <FlatList
        data={listData}
        extraData={this.state}
        renderItem={this._renderRowConten}
        keyExtractor={item => item.symbol}
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={this._renderEmpty}
      />
    );
  };
  //  get list data by master code and text search
  loadData(changed) {
    const { textSearch, data } = this.props
    const section = func.getSymbolObj(data.symbol) || data;
    cosnt = {
      display_name: displayName,
      symbol,
      class: classItem,
      master_code: masterCode,
      has_child: hasChild,
      security_name: securityName
    } = section

    if (changed) {
      if (masterCode === null && classItem === 'future' && !hasChild) {
        this.setState({ isExpand: true }, () => {
          const cb = this.callbackSearch
          let isPointTextSearch = false;
          if (textSearch.includes('.')) {
            classItem.includes(textSearch) ? isPointTextSearch = true : isPointTextSearch = false;
          } else {
            isPointTextSearch = true;
          }
          if (textSearch === null || textSearch === '') isPointTextSearch = false;
          resultSearchNewOrderByMaster({ masterCode: symbol, textSearch, isPointTextSearch, cb });
        })
      } else {
        this.setState({
          isExpand: false
        })
      }
    } else {
      this.setState({
        isExpand: false
      })
    }
  }

  render() {
    return (
      <RnCollapsible
        onChange={this.loadData.bind(this)}
        isExpand={this.state.isExpand}
        renderHeader={this._renderHeader}
        duration={150}
        renderContent={this._renderContent}>
      </RnCollapsible>
    );
  }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({

  containerHeader: {
    flexDirection: 'row',
    borderBottomColor: '#rgba(0, 0, 0, 0.12);',
    borderBottomWidth: 0.5,
    marginVertical: 10,
    marginHorizontal: 8
  },
  content: {
    marginLeft: 54,
    flexDirection: 'row',
    backgroundColor: CommonStyle.ColorTabNews,
    borderRadius: 8,
    marginRight: 8,
    paddingVertical: 10,
    paddingLeft: 16
  },
  containerHeaderActive: {
    height: HEIGHT / 14,
    flexDirection: 'row',
    marginTop: HEIGHT / 30
  },
  detailCode: {
    marginLeft: 5
  },
  textStyleContent: {
    fontSize: CommonStyle.fontSizeS,
    fontFamily: 'HelveticaNeue-Medium',
    fontWeight: '500',
    color: '#000000'
  },
  textColorSymbolContent: {
    color: '#000000'
  },
  textColorNameContent: {
    color: '#000000'
  },
  textStyleHeader: {
    fontSize: CommonStyle.fontSizeM,
    fontFamily: 'HelveticaNeue-Medium',
    fontWeight: '500',
    flex: 1,
    color: '#000000'
  },
  textStyleHeaderActive: {
    fontSize: CommonStyle.fontSizeM,
    fontFamily: 'HelveticaNeue-Medium',
    fontWeight: '500',
    flex: 1,
    color: '#359ee4'
  },
  colorHighlight: {
    color: '#18bdc9',
    opacity: 1
  },
  iconAddButton: {
    paddingLeft: 17,
    paddingVertical: 10,
    alignItems: 'center'
  },
  styleRows: {
    backgroundColor: CommonStyle.ColorTabNews,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 8
  }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
