import React, { Component } from 'react';
import {
  TouchableOpacity, FlatList, Text, View, PixelRatio,
  Dimensions, ScrollView, Keyboard, InteractionManager, Platform, StatusBar,
  TouchableWithoutFeedback, Modal
} from 'react-native';
import { connect } from 'react-redux'
import { List, ListItem, Icon } from 'react-native-elements';
import DatePicker from '../../component/date_picker/date_picker'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { func, dataStorage } from '../../storage';
import deviceModel from '../../constants/device_model';
import * as Util from '../../util';
import Flag from '../../component/flags/flag'
import I18n from '../../modules/language/';
import * as DateTime from '../../lib/base/dateTime';
import * as Controller from '../../memory/controller'
import { getTimezoneByLocation, isIphoneXorAbove } from '../../lib/base/functionUtil';
import { BusinessLog } from '../business_log/business_log';
import * as Business from '../../business';
import * as Animatable from 'react-native-animatable'
import DebonceButton from '~/component/debounce_button'

const NewTouchableOpacity = DebonceButton(TouchableOpacity)

const { height, width } = Dimensions.get('window');
const languageFlags = ['GB', 'CN', 'VN']
export class ModalPicker extends Component {
  constructor(props) {
    super(props);
    this.listItem = this.props.listItem || [];
    this.keyboardDidShowListener = null;
    this.keyboardDidHideListener = null;
    this.deviceModel = dataStorage.deviceModel;
    this.state = {
      visible: this.props.visible,
      listData: [],
      scrollTo: -1,
      modalLimitStopPriceStatus: false,
      showDatePicker: false,
      fromDate: this.props.fromDate || new Date().getTime(),
      toDate: this.props.toDate || new Date().getTime()
    };
    this.isFlag = false
    this.location = Controller.getLocation().location
    this.timezone = getTimezoneByLocation(this.location)
    this.handleDatePicked = this.handleDatePicked.bind(this)
    this.showDatePicker = this.showDatePicker.bind(this)
    this.mapData = this.mapData.bind(this);
    this.showHideModal = this.showHideModal.bind(this)
    this.renderItem = this.renderItem.bind(this)
    this.renderDate = this.renderDate.bind(this)
    this.renderFromDate = this.renderFromDate.bind(this)
    this.renderToDate = this.renderToDate.bind(this)
    this.apply = this.apply.bind(this)
    this.props.registerShowHideModal && this.props.registerShowHideModal(this.showHideModal)
  }

  componentDidMount() {
    this.mapData();
    // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    // this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount() {
    // this.keyboardDidShowListener.remove();
    // this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    console.log('Keyboard Shown');
  }

  _keyboardDidHide() {
    // console.log('Keyboard Hidden');
  }

  showHideModal(isShow, successCallback) {
    this.setState({
      visible: isShow
    }, () => {
      setTimeout(() => {
        successCallback && successCallback()
      }, 100)
    })
  }

  mapData() {
    let listData = [];
    this.listItem.map((el, i) => {
      const value = el && el.value ? el.value : el;
      const label = el && el.label ? el.label : el;
      let obj = {};
      obj.value = (typeof label !== 'string') ? label : label.toString();
      obj.onPress = this.selectItem.bind(this, value);
      listData.push(obj);
    });
    this.setState({ listData })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && (nextProps.listItem !== this.state.listData || nextProps.visible !== this.state.visible)) {
      if ((nextProps.name === 'Limit Price' || nextProps.name === 'Stop Price') && nextProps.visible) {
        this.findSelectedItem(nextProps.listItem, nextProps.selectedItem)
      }
      if (this.props.customDate) {
        const fromDate = nextProps.fromDate || new Date().getTime()
        const toDate = nextProps.toDate || new Date().getTime()
        this.setState({
          fromDate,
          toDate
        })
      }
      if (nextProps && nextProps.isFlag) {
        this.isFlag = true
      }
      this.listItem = nextProps.listItem;
      if (nextProps.selectedItem === I18n.t('custom')) {
        this.setState({ visible: nextProps.visible, showDatePicker: true }, this.mapData());
      } else {
        this.setState({ visible: nextProps.visible, showDatePicker: false }, this.mapData());
      }
    }
  }

  selectItem(value) {
    if (this.checkHideChevron(this.props.selectedItem, value)) return
    this.setState({ showDatePicker: false })
    this.view && this.view.fadeOut(500).then(() => this.props.onSelected && this.props.onSelected(value))
  }

  onClose() {
    this.setState({ scrollTo: -1 }, () => {
      this.props.onClose();
      Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarBgColor })
    })
  }

  renderHeader() {
    return (
      <View
        style={{
          backgroundColor: CommonStyle.colorHeader,
          height: 54,
          marginTop: isIphoneXorAbove() ? 24 : 0,
          justifyContent: Util.getValByPlatform('center', 'flex-start'),
          alignItems: 'center',
          width: '100%',
          paddingLeft: Util.getValByPlatform(0, 70),
          flexDirection: 'row'
        }}>
        <Ionicons onPress={this.onClose.bind(this)}
          testID='backModalPickerIcon'
          name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
          style={{ color: CommonStyle.btnColor, left: 16, position: 'absolute', bottom: 10, width: 30, height: 30 }} size={Platform.OS === 'ios' ? 36 : 28} />
        <Text
          style={[
            CommonStyle.textMain,
            {
              color: CommonStyle.fontColor,
              marginTop: Platform.OS === 'ios' ? 10 : 0,
              textAlign: Util.getValByPlatform('center', 'left'),
              opacity: 1,
              fontSize: CommonStyle.fontSizeL
            }
          ]}>
          {this.props.title}
        </Text>
        {this.props.customDate && this.state.showDatePicker
          ? <View style={{ position: 'absolute', right: 16 }}>
            <NewTouchableOpacity onPress={this.apply}>
              <Text
                style={[
                  CommonStyle.textMain,
                  {
                    color: CommonStyle.fontHeader,
                    marginTop: Platform.OS === 'ios' ? 20 : 10,
                    textAlign: 'right',
                    opacity: 1,
                    fontSize: CommonStyle.fontSizeL
                  }
                ]}>
                {I18n.t('apply')}
              </Text>
            </NewTouchableOpacity>
          </View>
          : null}
      </View>
    );
  }
  apply() {
    const customDuration = {
      isCustom: true,
      fromDate: this.state.fromDate,
      toDate: this.state.toDate
    }
    const value = I18n.t('custom')
    this.props.onSelected(value, customDuration)
  }

  _keyExtractor(item, i) {
    return i.toString();
  };

  // Find selected index limit price
  findSelectedItem(data, selectedValue) {
    for (var key in data) {
      if (parseFloat(data[key]) === parseFloat(selectedValue)) {
        var index = key - 6;
        this.setState({ scrollTo: index, modalLimitStopPriceStatus: true })
      }
    }
  }

  checkHideChevron(selectedItem, flatListValue) {
    var modalLimitStopPriceStatus = this.state.modalLimitStopPriceStatus;
    if (modalLimitStopPriceStatus) {
      if (parseFloat(selectedItem) === parseFloat(flatListValue)) {
        return true
      }
      return false
    } else {
      let typeOfSelectedItem = typeof (selectedItem);
      if (typeOfSelectedItem === 'string') {
        if (selectedItem === flatListValue) {
          return true
        }
        return false
      } else if (typeOfSelectedItem === 'number') {
        if (parseFloat(selectedItem) === parseFloat(flatListValue)) {
          return true
        }
        return false
      }
    }
  }

  componentDidUpdate() {
    if (this.state.scrollTo > -1) {
      setTimeout(() => {
        if (this.state.visible) {
          this.flatlist && this.flatlist.scrollToIndex && this.flatlist.scrollToIndex({ index: this.state.scrollTo })
        }
      }, 1000)
    }
  }

  getFlagIcon() {

  }

  handleDatePicked(date, callback) {
    const type = this.type
    this.activeDuration = ''
    if (type === 'from') {
      if (this.checkGetReportAfterCompareFromTo(date, this.state.toDate)) {
        // this.fromDate = new Date(date)
        callback && callback(true)
        return this.setState({
          fromDate: date
        })
      }
      return callback && callback(false)
    } else if (type === 'to') {
      if (this.checkGetReportAfterCompareFromTo(this.state.fromDate, date)) {
        // this.toDate = new Date(date)
        callback && callback(true)
        return this.setState({ toDate: date })
      }
      return callback && callback(false)
    }
  }

  checkGetReportAfterCompareFromTo(fromDate, toDate) {
    const fromDateStartDay = DateTime.getTimeStartDay(fromDate)
    const toDateStartDay = DateTime.getTimeStartDay(toDate)
    if (fromDateStartDay <= toDateStartDay) return true;
    return false
  }

  showDatePicker(type) {
    let dateRef = this.fromDatePickerRef
    this.type = 'from'
    if (type === 'to') {
      this.type = 'to'
      dateRef = this.toDatePickerRef
    }
    dateRef && dateRef.showDatePicker()
  }

  renderItem(item, index) {
    if (item.value !== I18n.t('custom')) {
      return (
        <View>
          <NewTouchableOpacity
            style={{ paddingHorizontal: 16 }}
            onPress={() => item.onPress && item.onPress()}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
              {
                this.isFlag ? <View style={{ flex: 1 }}>
                  <Flag
                    type="flat"
                    code={item.value === 'English' ? 'GB'
                      : item.value === 'Tiếng Việt' ? 'VN' : 'CN'}
                    size={18}
                  />
                </View> : null
              }
              <Text testID={`${item.value}`} style={[{ fontSize: CommonStyle.fontSizeS, fontFamily: CommonStyle.fontPoppinsRegular, flex: 8, color: this.checkHideChevron(this.props.selectedItem, item.value) && !this.state.showDatePicker ? CommonStyle.fontBlue : CommonStyle.fontColor }, this.props.disableCapitalize ? {} : { textTransform: 'capitalize' }]}>{item.value}</Text>
              {
                this.checkHideChevron(this.props.selectedItem, item.value) && !this.state.showDatePicker ? <Ionicons testID={`${item.value}`} size={24} name='md-checkmark' color={CommonStyle.fontBlue} /> : null
              }
            </View>
            <View style={{ height: 1, backgroundColor: CommonStyle.fontWhite, opacity: 0.05 }}></View>
          </NewTouchableOpacity>
        </View>
      )
    } else {
      return (this.props.customDate
        ? <View>
          <NewTouchableOpacity
            style={{ paddingHorizontal: 16 }}
            onPress={() => this.setState({ scrollTo: -1 }, item.onPress, this.checkDate())}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
              <Text testID={`${item.value}`} style={{ fontSize: CommonStyle.fontSizeS, fontFamily: CommonStyle.fontPoppinsRegular, flex: 8, color: this.state.showDatePicker ? CommonStyle.fontBlue : CommonStyle.fontColor, textTransform: 'capitalize' }}>{item.value}</Text>
              {
                this.state.showDatePicker ? <Ionicons testID={`${item.value}`} size={24} name='md-checkmark' color={CommonStyle.fontBlue} /> : null
              }
            </View>
          </NewTouchableOpacity>
          {/* {this.renderDate()} */}
        </View > : null)
    }
  }

  checkDate = () => {
    this.props.checkDate && this.props.checkDate(true)
  }

  renderDate() {
    return (this.state.showDatePicker ? <View
      style={{
        flexDirection: 'row',
        marginVertical: 8,
        marginHorizontal: 16
      }}>
      {this.renderFromDate()}
      {this.renderToDate()}
    </View> : <View />)
  }

  renderFromDate() {
    const maximumDate = Util.convertToCustomTimezone(new Date().getTime(), this.timezone)
    const fromDate = Util.convertToCustomTimezone(this.state.fromDate, this.timezone)
    return <View style={{ flex: 1, marginRight: 8, borderBottomWidth: 1, borderBottomColor: CommonStyle.fontBorderGray }}>
      <Text style={[
        CommonStyle.textFloatingLabel
      ]}>
        {I18n.t('from')}
      </Text>
      <NewTouchableOpacity
        onPress={() => this.showDatePicker('from')}
        style={{}}>
        <DatePicker
          date={this.state.fromDate}
          ref={ref => this.fromDatePickerRef = ref}
          handleDatePicked={this.handleDatePicked}
          maximumDate={new Date(maximumDate)}
          wrapperTextStyle={{
            flex: 1,
            alignItems: 'flex-start'
          }} />
      </NewTouchableOpacity>
    </View>
  }

  renderToDate() {
    const maximumDate = Util.convertToCustomTimezone(new Date().getTime(), this.timezone)
    const toDate = Util.convertToCustomTimezone(this.state.toDate, this.timezone)
    return <View style={{ flex: 1, marginLeft: 8, borderBottomWidth: 1, borderBottomColor: CommonStyle.fontBorderGray }}>
      <Text style={[
        CommonStyle.textFloatingLabel
      ]}>
        {I18n.t('to')}
      </Text>
      <NewTouchableOpacity
        onPress={() => this.showDatePicker('to')}
        style={{}}>
        <DatePicker
          date={this.state.toDate}
          ref={ref => this.toDatePickerRef = ref}
          handleDatePicked={this.handleDatePicked}
          maximumDate={new Date(maximumDate)}
          wrapperTextStyle={{
            flex: 1,
            alignItems: 'flex-start'
          }} />
      </NewTouchableOpacity>
    </View>
  }
  onDismiss = () => {
    this.view && this.view.fadeOut(800).then(() => this.props.onClose && this.props.onClose())
  }

  render() {
    if (!this.state.visible) return <View></View>
    const position = this.props.position || {};
    return (
      <Animatable.View
        animation='fadeIn'
        duration={500}
        ref={ref => this.view = ref}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'transparent', zIndex: 99 }}
      >
        <TouchableWithoutFeedback onPress={this.onDismiss}>
          <View style={{
            backgroundColor: CommonStyle.fontDefaultColorOpacity,
            flex: 1
          }}>
          </View>
        </TouchableWithoutFeedback>
        <View style={[{
          backgroundColor: CommonStyle.backgroundNewSearchBar,
          width: width * 0.7,
          position: 'absolute',
          right: position.px ? (width - position.px - position.width || 0) : width * 0.15,
          // left: width * 0.15,
          top: position.py ? (position.py + 8 + position.height || 0) : 78,
          borderRadius: 8
        }, this.props.style]}>
          <FlatList
            indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
            ref={(ref) => this.flatlist = ref}
            data={this.state.listData}
            renderItem={({ item, i }) => this.renderItem(item, i)}
            keyExtractor={this._keyExtractor}
            extraData={{
              showDatePicker: this.state.showDatePicker,
              setting: {
                textFontSize: this.props.textFontSize
              }
            }}
          />
        </View>
      </Animatable.View>
    );
  }
}

// export default ModalPicker;
export default connect(state => {
  return {
    textFontSize: state.setting.textFontSize
  }
})(ModalPicker)
