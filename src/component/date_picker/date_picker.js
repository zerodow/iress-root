import React, { Component } from 'react'
import {
    View, Text, Dimensions
} from 'react-native'

// Storage
import { dataStorage, func } from '../../storage'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
// Lib
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment'
import DateTimePicker from 'react-native-modal-datetime-picker';
import I18n from '../../modules/language/index'
// Component
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import XComponent from '../xComponent/xComponent'
import * as Controller from '../../memory/controller'
import CustomIcon from '~/component/Icon'
import _ from 'lodash';
import ENUM from '~/enum'

const { width, height } = Dimensions.get('screen')
export default class DatePicker extends XComponent {
    constructor(props) {
        super(props)
        this.init = this.init.bind(this)
        this.bindAllFunc = this.bindAllFunc.bind(this)
        this.bindAllFunc()
        this.init()
    }

    init() {
        this.dic = {
            defaultWrapperTextStyle: { height: 32, justifyContent: 'center' },
            defaultTextStyle: CommonStyle.textMain,
            defaultWrapperIconStyle: { height: 32, justifyContent: 'center', alignItems: 'flex-end' },
            defaultIconStyle: { color: CommonStyle.fontColor, opacity: CommonStyle.opacity2 },
            timeLocale: Controller.getLang(),
            confirmTextIOS: I18n.t('confirm'),
            cancelTextIOS: I18n.t('cancel'),
            titleIOS: I18n.t('pickADate')
        }
        this.state = {
            isVisible: false,
            date: this.props.date ? new Date(this.props.date).getTime() : this.props.minimumDate
        }
    }

    bindAllFunc() {
        this.showDatePicker = this.showDatePicker.bind(this)
        this.renderDateTime = this.renderDateTime.bind(this)
        this._onConfirm = this._onConfirm.bind(this)
        this.getLocale = this.getLocale.bind(this)
        this._onCancel = this._onCancel.bind(this)
        this.setDate = this.setDate.bind(this)
    }

    componentWillMount() {
        this.getLocale(Controller.getLang())
    }

    getLocale(locale) {
        switch (locale) {
            case 'vi':
                this.dic.timeLocale = 'vi'
                break
            case 'cn':
                this.dic.timeLocale = 'zh-cn'
                break
            default:
                this.dic.timeLocale = 'en'
                break
        }
        return this.dic.timeLocale
    }
    showDatePicker() {
        this.setState({
            isVisible: true
        })
    }

    renderDateTime() {
        return moment(new Date(this.state.date)).format('DD/MM/YYYY')
    }

    _onConfirm(date) {
        this.props.handleDatePicked && this.props.handleDatePicked(new Date(date).getTime(), isUpdate => {
            const state = isUpdate
                ? {
                    date: new Date(date).getTime(),
                    isVisible: false
                }
                : {
                    isVisible: false
                }
            this.setState(state)
        })
    }

    setDate(date) {
        this.setState({
            date: new Date(date).getTime()
        })
    }

    _onCancel() {
        this.setState({
            isVisible: false
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.date && new Date(nextProps.date).getTime() !== this.state.date) {
            this.setState({ date: new Date(nextProps.date).getTime() })
        }
    }

    render() {
        const { check } = this.props
        return (
            <View>
                <View style={[{ flexDirection: 'row', height: 32, paddingRight: 24 }]}>
                    <View style={{
                        justifyContent: 'center',
                        marginRight: 17,
                        alignItems: 'stretch'
                    }}>
                        <Text style={
                            {
                                color: 'white',
                                fontSize: 12,
                                fontFamily: CommonStyle.fontPoppinsRegular
                            }}>{this.renderDateTime()}</Text>
                        <View style={{ height: 3, borderRadius: 1.5, backgroundColor: CommonStyle.colorProduct }} />
                    </View>

                    <View style={[this.dic.defaultWrapperIconStyle, this.props.wrapperIconStyle || {}, { justifyContent: 'center' }]}>
                        <TouchableOpacityOpt
                            timeDelay={ENUM.TIME_DELAY}
                            hitSlop={{
                                top: 8,
                                left: 8,
                                right: 8,
                                bottom: 8
                            }}
                            onPress={this.showDatePicker}>
                            <CustomIcon
                                testID='iconFromDateReports'
                                style={CommonStyle.iconCustomDate}
                                name='equix_calendar' />
                        </TouchableOpacityOpt>
                    </View>
                </View >
                <View>
                    <DateTimePicker
                        minimumDate={this.props.minimumDate}
                        maximumDate={this.props.maximumDate}
                        date={new Date(this.state.date)}
                        isVisible={this.state.isVisible}
                        onConfirm={this._onConfirm}
                        onCancel={this._onCancel}
                        datePickerModeAndroid='spinner'
                        titleIOS={this.dic.titleIOS}
                        confirmTextIOS={this.dic.confirmTextIOS}
                        cancelTextIOS={this.dic.cancelTextIOS}
                    />
                </View>
            </View>
        )
    }
}
