import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Keyboard,
    Platform
} from 'react-native'
import config from '../../config'
import { dataStorage, func } from '../../storage'
import { List, ListItem, Icon } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import deviceModel from '../../constants/device_model';
import * as Util from '../../util';
import I18n from '../../modules/language/index'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as InvertTranslate from '../../invert_translate'
import DatePicker from '../../component/date_picker/date_picker'
import * as DateTime from '../../lib/base/dateTime';
import { getTimezoneByLocation } from '../../lib/base/functionUtil';
import * as Controller from '../../memory/controller'

export default class BusinessLogFilterTime extends Component {
    constructor(props) {
        super(props)
        this.listItem = this.props.listItem || [];
        this.state = {
            selectedItem: this.props.selectedItem,
            showDatePicker: false,
            fromDate: this.props.customDuration.fromDate || new Date().getTime(),
            toDate: this.props.customDuration.toDate || new Date().getTime()
        }
        this.location = Controller.getLocation().location
        this.timezone = getTimezoneByLocation(this.location)
        this.mapData = this.mapData.bind(this)
        this.selectItem = this.selectItem.bind(this)
        this.checkHideChevron = this.checkHideChevron.bind(this)
        this.handleDatePicked = this.handleDatePicked.bind(this)
        this.showDatePicker = this.showDatePicker.bind(this)
        this.renderItem = this.renderItem.bind(this)
        this.renderDate = this.renderDate.bind(this)
        this.renderFromDate = this.renderFromDate.bind(this)
        this.renderToDate = this.renderToDate.bind(this)
        this.apply = this.apply.bind(this)
    }

    checkHideChevron(selectedItem, value) {
        const enValue = InvertTranslate.translateCustomLang(value)
        if (selectedItem.toLowerCase() === enValue.toLowerCase()) {
            return true
        }
        return false
    }

    selectItem(value) {
        enValue = InvertTranslate.translateCustomLang(value)
        if (value !== I18n.t('custom')) {
            this.props.onSelected && this.props.onSelected(enValue.toLowerCase());
            this.setState({
                selectedItem: enValue
            })
        } else {
            const duration = {
                        isCustom: true,
                        fromDate: this.state.fromDate,
                        toDate: this.state.toDate
                    }
            this.props.onSelected && this.props.onSelected(enValue.toLowerCase(), duration);
            this.setState({
                selectedItem: enValue
            })
        }
    }

    mapData() {
        let listData = [];
        this.listItem.map((e, i) => {
            let obj = {};
            obj.value = (typeof e !== 'string') ? e : e.toString();
            obj.onPress = this.selectItem.bind(this, e);
            listData.push(obj);
        });
        this.setState({ listData })
    }

    componentDidMount() {
        this.mapData();
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

    handleDatePicked(date, callback) {
        const type = this.type
        this.activeDuration = ''
        if (type === 'from') {
            if (this.checkGetReportAfterCompareFromTo(date, this.state.toDate)) {
                // this.fromDate = new Date(date)
                callback && callback(true)
                return this.setState({
                    fromDate: date
                }, () => this.selectItem(I18n.t('custom')))
            }
            return callback && callback(false)
        } else if (type === 'to') {
            if (this.checkGetReportAfterCompareFromTo(this.state.fromDate, date)) {
                // this.toDate = new Date(date)
                callback && callback(true)
                return this.setState({ toDate: date }, () => this.selectItem(I18n.t('custom')))
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

    apply() {
        const value = {
            isCustom: true,
            fromDate: this.state.fromDate,
            toDate: this.state.toDate
        }
        this.props.onSelected(value)
    }

    renderItem(item, index) {
       const isSelected = this.checkHideChevron(this.state.selectedItem, item.value)
        if (item.value !== 'Custom') {
            return (
                <TouchableOpacity
                    style={{ paddingHorizontal: 16 }}
                    onPress={() => this.setState({ scrollTo: -1 }, item.onPress)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
                            <Text style={{ color: isSelected ? CommonStyle.fontBlue : CommonStyle.fontColor }}>{item.value}</Text>
                            {
                                isSelected ? <Ionicons size={24} name='md-checkmark' color= {CommonStyle.fontBlue} /> : null
                            }
                        </View>
                    <View style={{ height: 1, backgroundColor: CommonStyle.fontBorderGray }}></View>
                </TouchableOpacity>
            )
        } else {
            return <View>
            <TouchableOpacity
                style={{ paddingHorizontal: 16 }}
                onPress={() => this.setState({ scrollTo: -1 }, item.onPress)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
                    <Text testID={`${item.value}`} style={{ flex: 8, color: isSelected ? CommonStyle.fontBlue : CommonStyle.fontColor }}>{item.value}</Text>
                        {
                            isSelected ? <Ionicons testID={`${item.value}`} size={24} name='md-checkmark' color= {CommonStyle.fontBlue} /> : null
                        }
                </View>
                <View style={{ height: 1, backgroundColor: CommonStyle.fontBorderGray }}></View>
            </TouchableOpacity>
            {this.renderDate(isSelected)}
        </View>
        }
    }

    renderDate(isSelected) {
        return (isSelected ? <View
            style={{
                flexDirection: 'row',
                marginVertical: 8,
                marginHorizontal: 16
            }}>
            {this.renderFromDate()}
            {this.renderToDate()}
        </View> : <View/>)
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
            <TouchableOpacity
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
            </TouchableOpacity>
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
            <TouchableOpacity
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
            </TouchableOpacity>
        </View>
    }

    render() {
        return (
            <View style={{ backgroundColor: CommonStyle.backgroundColor, flex: 1 }}>
                <List containerStyle={{ borderTopWidth: 0, flex: 1, backgroundColor: CommonStyle.backgroundColor, marginTop: 0 }}>
                    <FlatList
                        ref={(ref) => this.flatlist = ref}
                        data={this.state.listData}
                        extraData={this.state.selectedItem}
                        renderItem={({ item, i }) => (
                            this.renderItem(item, i)
                        )}
                        keyExtractor={this._keyExtractor}
                    />
                </List>
            </View>
        )
    }
}
