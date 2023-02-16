import React, { Fragment } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment'
import DateTimePicker from 'react-native-modal-datetime-picker';
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
				height: 32,
				justifyContent: 'center',
				opacity: 0.87
			},
			defaultTextStyle: {
				fontFamily: CommonStyle.fontPoppinsBold,
				fontSize: CommonStyle.fontSizeXS,
				color: CommonStyle.colorProduct,
				opacity: 0.87
			},
			defaultWrapperIconStyle: { height: 32, justifyContent: 'center', alignItems: 'flex-end' },
			defaultIconStyle: { color: CommonStyle.colorProduct, opacity: 0.87 },
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
			<View style={{
				flexDirection: 'row',
				height: 32
			}}>
				{
					this.props.isDatePickerUsed
						? <Fragment>
							<TouchableOpacity
								onPress={this.showDatePicker}>
								<View style={[this.dic.defaultWrapperTextStyle, this.props.wrapperTextStyle || {}]}>
									<Text
										style={[this.dic.defaultTextStyle, this.props.textStyle || {}]}>{this.renderDateTime()}</Text>
								</View>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={this.props.switchToDatePeriod}>
								<View style={[this.dic.defaultWrapperIconStyle, this.props.wrapperIconStyle || {}]}>
									<Icon
										style={[this.dic.defaultIconStyle, this.props.iconStyle || {}]}
										name={'md-create'}
										color={CommonStyle.colorProduct}
										size={18}/>
								</View>
							</TouchableOpacity>
						</Fragment>
						: <View style={[this.dic.defaultWrapperIconStyle, this.props.wrapperIconStyle || {}]}>
							<Icon
								style={[this.dic.defaultIconStyle, this.props.iconStyle || {}]}
								name={'md-calendar'}
								color={CommonStyle.colorProduct}
								size={18}/>
						</View>
				}
				<View>
					<DateTimePicker
						locale={this.dic.timeLocale}
						minimumDate={this.props.minimumDate}
						maximumDate={this.props.maximumDate}
						date={new Date(this.props.date)}
						isVisible={this.state.isVisible}
						onConfirm={this._onConfirm}
						onCancel={this._onCancel}
						datePickerModeAndroid={'spinner'}
						titleIOS={this.dic.titleIOS}
						confirmTextIOS={this.dic.confirmTextIOS}
						cancelTextIOS={this.dic.cancelTextIOS}
					/>
				</View>
			</View>
		)
	}
}
