import React, { Fragment } from 'react'
import { Text, TouchableOpacity, View, Platform } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment'
import DateTimePicker from 'react-native-modal-datetime-picker';
import IconCustom from '~/screens/watchlist/Component/Icon2.js'
import I18n from '../../modules/language/index'
import XComponent from '../xComponent/xComponent'
import * as Controller from '../../memory/controller'
export default class DatePicker extends XComponent {
	constructor(props) {
		super(props);
		this.init = this.init.bind(this);
		this.bindAllFunc = this.bindAllFunc.bind(this);
		this.bindAllFunc();
		this.init()
	}

	init() {
		this.dic = {
			defaultWrapperTextStyle: {
				justifyContent: 'center',
				flex: 1
			},
			defaultTextStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.fontSizeS,
				color: CommonStyle.colorProduct,
				alignSelf: 'center',
				flex: 1,
				textAlign: 'center'
			},
			defaultWrapperIconStyle: {},
			timeLocale: Controller.getLang(),
			confirmTextIOS: I18n.t('confirm'),
			cancelTextIOS: I18n.t('cancel'),
			titleIOS: I18n.t('pickADate')
		};
		this.state = {
			isVisible: false,
			date: this.props.date ? new Date(this.props.date).getTime() : this.props.minimumDate
		}
	}

	bindAllFunc() {
		this.showDatePicker = this.showDatePicker.bind(this);
		this.renderDateTime = this.renderDateTime.bind(this);
		this._onConfirm = this._onConfirm.bind(this);
		this.getLocale = this.getLocale.bind(this);
		this._onCancel = this._onCancel.bind(this);
		this.setDate = this.setDate.bind(this)
	}

	componentWillMount() {
		this.getLocale(Controller.getLang())
	}

	getLocale(locale) {
		switch (locale) {
			case 'vi':
				this.dic.timeLocale = 'vi';
				break;
			case 'cn':
				this.dic.timeLocale = 'zh-cn';
				break;
			default:
				this.dic.timeLocale = 'en';
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
		const date = new Date(this.state.date);
		const d = date.getDate();
		const m = date.getMonth() + 1;
		const y = date.getFullYear();
		return `${d > 9 ? d : '0' + d}/${m > 9 ? m : '0' + m}/${y}`;
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
				};
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
		return (
			<TouchableOpacity onPress={this.showDatePicker} style={[
				{
					flex: 1,
					flexDirection: 'row',
					alignItems: 'center'
				}, this.props.styleWrapper
			]}>
				{
					this.props.renderIconCalendar ? this.props.renderIconCalendar() : <Ionicons
						color={CommonStyle.colorProduct}
						size={20}
						name={'ios-calendar'}
					/>
				}
				<Text
					style={[this.dic.defaultTextStyle, this.props.textStyle || {}]}>{this.renderDateTime()}</Text>
				<View>
					<DateTimePicker
						locale={this.dic.timeLocale}
						minimumDate={this.props.minimumDate}
						maximumDate={this.props.maximumDate}
						date={new Date(this.props.date)}
						isVisible={this.state.isVisible}
						onConfirm={this._onConfirm}
						onCancel={this._onCancel}
						datePickerModeAndroid={Platform.OS === 'android' ? 'calendar' : 'spinner'}
						titleIOS={this.dic.titleIOS}
						confirmTextIOS={this.dic.confirmTextIOS}
						cancelTextIOS={this.dic.cancelTextIOS}
					/>
				</View>
			</TouchableOpacity>
		)
	}
}
