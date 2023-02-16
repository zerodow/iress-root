import React, { Component } from 'react';
import { View, Text, TouchableOpacity, PixelRatio, Dimensions, Platform } from 'react-native';
import { connect } from 'react-redux'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import {
	checkTradingHalt, logDevice, getSymbolInfoApi,
	formatNumberNew2, getAccountInfoApi, renderTime
} from '../../lib/base/functionUtil'
import I18n from '../../modules/language/';
import * as fbemit from '../../emitter';
import * as Business from '../../business';
import Flag from '../../component/flags/flag';
import { dataStorage } from '../../storage'
import * as Util from '../../util';
import styles from './style/business_log'
import orderTypeString from '../../constants/order_type_string'
import ORDERTYPE_ENUM from '../../constants/order_type'
import moment from 'moment'
import Enum from '../../enum'
import * as Controller from '../../memory/controller'
import WrapText from './wrap_text'

export class RowBusinessLog extends Component {
	constructor(props) {
		super(props);
		// Variable
		this.isMount = false;
		this.timeoutDeviceInfo = null
		this.timeoutDeviceIP = null
		// State
		this.state = {
			data: this.props.data || {},
			account: '',
			isRenderDeviceInfo: false,
			isRenderDeviceIP: false,
			isRenderLoginStatus: false,
			symbolInfo: {}
		};
		// Function
		this.checkRenderBusinessLog = this.checkRenderBusinessLog.bind(this)
		this.renderActionDetail = this.renderActionDetail.bind(this)
		this.renderHighLight = this.renderHighLight.bind(this)
		this.getAccountName = this.getAccountName.bind(this)
		// Place order
		this.renderPlaceOrder = this.renderPlaceOrder.bind(this)
		this.renderPlaceOrderAU = this.renderPlaceOrderAU.bind(this)
		this.renderPlaceOrderLimit = this.renderPlaceOrderLimit.bind(this)
		this.renderPlaceOrderMarket = this.renderPlaceOrderMarket.bind(this)
		this.renderPlaceOrderStopLimit = this.renderPlaceOrderStopLimit.bind(this)
		this.renderPlaceOrderStopLoss = this.renderPlaceOrderStopLoss.bind(this)
		this.renderPlaceOrderTrailingStopLimit = this.renderPlaceOrderTrailingStopLimit.bind(this)
		this.renderPlaceOrderUS = this.renderPlaceOrderUS.bind(this)
		this.renderPlaceOrderStop = this.renderPlaceOrderStop.bind(this)
		// Modify order
		this.renderModifyOrder = this.renderModifyOrder.bind(this)
		this.renderModifyOrderAU = this.renderModifyOrderAU.bind(this)
		this.renderModifyOrderUS = this.renderModifyOrderUS.bind(this)
		this.renderModifyOrderMarket = this.renderModifyOrderMarket.bind(this)
		this.renderModifyOrderLimit = this.renderModifyOrderLimit.bind(this)
		this.renderModifyOrderStopLimit = this.renderModifyOrderStopLimit.bind(this)
		this.renderModifyOrderStopLoss = this.renderModifyOrderStopLoss.bind(this)
		this.renderModifyOrderTrailingStopLimit = this.renderModifyOrderTrailingStopLimit.bind(this)
		// Cancel order
		this.renderCancelOrder = this.renderCancelOrder.bind(this)
		this.renderCancelOrderAU = this.renderCancelOrderAU.bind(this)
		this.renderCancelOrderUS = this.renderCancelOrderUS.bind(this)
		this.renderCancelOrderMarket = this.renderCancelOrderMarket.bind(this)
		this.renderCancelOrderLimit = this.renderCancelOrderLimit.bind(this)
		this.renderCancelOrderStopLimit = this.renderCancelOrderStopLimit.bind(this)
		this.renderCancelOrderStopLoss = this.renderCancelOrderStopLoss.bind(this)
		this.renderCancelOrderTrailingStopLimit = this.renderCancelOrderTrailingStopLimit.bind(this)
		this.renderCancelOrderStop = this.renderCancelOrderStop.bind(this)
		// Other action
		this.renderChangeNewsSource = this.renderChangeNewsSource.bind(this)
		this.renderChangeAO = this.renderChangeAO.bind(this)
		this.renderChangeStatus = this.renderChangeStatus.bind(this)
		this.renderResetPassword = this.renderResetPassword.bind(this)
		this.renderForgotPassword = this.renderForgotPassword.bind(this)
		this.renderLogin = this.renderLogin.bind(this)
		this.renderLogout = this.renderLogout.bind(this)
		this.renderUserWatchList = this.renderUserWatchList.bind(this)
		this.renderHoldingsReport = this.renderHoldingsReport.bind(this)
		this.renderCashReport = this.renderCashReport.bind(this)
		this.renderFinancialReport = this.renderFinancialReport.bind(this)
		this.renderTransactionReport = this.renderTransactionReport.bind(this)
		this.renderSetting = this.renderSetting.bind(this)
		this.renderUpdateSaxoAccount = this.renderUpdateSaxoAccount.bind(this)
		this.renderAddWatchList = this.renderAddWatchList.bind(this)
		this.renderRemoveWatchList = this.renderRemoveWatchList.bind(this)
		this.renderUpdateWatchList = this.renderUpdateWatchList.bind(this)
		this.renderEnterPin = this.renderEnterPin.bind(this)
		// Device Info
		this.renderDeviceInfo = this.renderDeviceInfo.bind(this)
		this.renderDeviceIP = this.renderDeviceIP.bind(this)
	}

	renderSymbol = this.renderSymbol.bind(this)
	renderSymbol() {
		const { symbol } = this.state.symbolInfo
		if (!symbol) return <Text>{' '}</Text>
		const flag = Business.getFlag(symbol)
		return <View style={{ flexDirection: 'row', marginHorizontal: 8, height: 24, alignItems: 'center' }}>
			<Text style={{
				fontSize: CommonStyle.fontSizeS,
				fontFamily: CommonStyle.fontPoppinsBold,
				color: CommonStyle.fontColor,
				marginRight: 2
			}}>
				{Business.getSymbolName({ symbol })}
			</Text>
			<Flag
				type={'flat'}
				code={flag}
				size={18}
				wrapperStyle={{ marginTop: -2 }}
			/>
		</View>
	}

	setSymbolInfo = this.setSymbolInfo.bind(this)
	setSymbolInfo() {
		const data = this.state.data
		const symbol = data.symbol;
		const symbolInfo = dataStorage.symbolEquity[symbol] || {}
		this.setState({ symbolInfo })
		console.log('DCM setSymbolInfo', symbolInfo)
	}

	getSymbolInfo = this.getSymbolInfo.bind(this)
	getSymbolInfo() {
		const data = this.state.data
		const symbol = data.symbol;
		if (!symbol || symbol === '#') return
		getSymbolInfoApi(symbol, this.setSymbolInfo)
	}

	getAccountName() {
		const data = this.props.data;
		const accountID = data.account_id;
		if (!accountID || accountID === '#') return Promise.resolve()
		return new Promise((resolve, reject) => {
			getAccountInfoApi(accountID)
				.then(accountName => {
					resolve()
					const account = `${accountName} (${accountID})`
					this.setState({
						account
					})
					this.timeoutDeviceInfo && clearTimeout(this.timeoutDeviceInfo)
					this.timeoutDeviceInfo = setTimeout(() => {
						this.setState({
							isRenderDeviceInfo: true
						})
					}, 1000)
					this.timeoutDeviceIP && clearTimeout(this.timeoutDeviceIP)
					this.timeoutDeviceIP = setTimeout(() => {
						this.setState({
							isRenderDeviceIP: true
						})
					}, 2000)
				})
				.catch(err => reject(err))
		})
	}

	componentDidMount() {
		this.isMount = true;
		const data = this.props.data;
		const accountID = data.account_id;
		if (!accountID || accountID === '#') {
			this.timeoutDeviceInfo && clearTimeout(this.timeoutDeviceInfo)
			this.timeoutDeviceInfo = setTimeout(() => {
				this.setState({
					isRenderDeviceInfo: true
				})
			}, 500)
			this.timeoutDeviceIP && clearTimeout(this.timeoutDeviceIP)
			this.timeoutDeviceIP = setTimeout(() => {
				this.setState({
					isRenderDeviceIP: true
				})
			}, 1500)
			this.timeoutLoginStatus && clearTimeout(this.timeoutLoginStatus)
			this.timeoutLoginStatus = setTimeout(() => {
				this.setState({
					isRenderLoginStatus: true
				})
			}, 2500)
		} else {
			this.props.progressApiQueue && this.props.progressApiQueue(this.getAccountName) // add queue to pass api rate limit
		}
		this.getSymbolInfo()
	}

	componentWillUnmount() {
		this.isMount = false;
		this.timeoutDeviceIP && clearTimeout(this.timeoutDeviceIP)
		this.timeoutDeviceInfo && clearTimeout(this.timeoutDeviceInfo)
		this.timeoutLoginStatus && clearTimeout(this.timeoutLoginStatus)
	}

	renderTime(style) {
		const data = this.state.data;
		const time = data.time
		const timeFormat = renderTime(time)
		return <Text style={[CommonStyle.textNormalTime, { opacity: 0.7 }]}>
			{
				timeFormat
			}
		</Text>
	}

	checkRenderBusinessLog() {
		const data = this.state.data
		const { action } = data
		switch (action) {
			case 'create_user':
			case 'update_user':
			case 'create_role_group':
			case 'update_role_group':
			case 'delete_role_group':
			case 'change_market_data':
			case 'update_vetting_rule':
			case 'change_news_source':
			case 'change_status':
			case 'change_AO':
			case 'reset_password':
			case 'forgot_password':
			case 'place_order':
			case 'modify_order':
			case 'cancel_order':
			case 'sign_in':
			case 'login':
			case 'sign_out':
			case 'logout':
			case 'save_balances':
			case 'query_cash_report':
			case 'export_cash_report':
			case 'query_holdings_report':
			case 'export_holdings_report':
			case 'query_financial_report':
			case 'export_financial_report':
			case 'query_transaction_report':
			case 'export_transaction_report':
			case 'click_news':
			case 'click_cnote':
			case 'enter_pin':
			case 'update_saxo_account':
			case 'add_symbol':
			case 'remove_symbol':
			case 'update_symbol':
			case 'update_setting':
				return true
			default:
				return false
		}
	}

	renderActionDetail() {
		const data = this.state.data
		const { action } = data
		const symbol = data.symbol;
		let displayName = symbol;
		if (symbol && symbol !== '#') {
			if (dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].display_name) {
				displayName = dataStorage.symbolEquity[symbol].display_name
			}
		}
		switch (action) {
			case 'create_user':
				return this.renderCreateUser(data)
			case 'update_user':
				return this.renderUpdateUser(data)
			case 'create_role_group':
				return this.renderCreateRoleGroup(data)
			case 'update_role_group':
				return this.renderUpdateRoleGroup(data)
			case 'delete_role_group':
				return this.renderDeleteRoleGroup(data)
			case 'change_market_data':
				return this.renderChangeMarketData(data)
			case 'update_vetting_rule':
				return this.renderUpdateVettingRule(data)
			case 'change_news_source':
				return this.renderChangeNewsSource(data)
			case 'change_status':
				return this.renderChangeStatus(data)
			case 'change_AO':
				return this.renderChangeAO(data)
			case 'reset_password':
				return this.renderResetPassword(data)
			case 'forgot_password':
				return this.renderForgotPassword(data)
			case 'place_order':
				return this.renderPlaceOrder(data, displayName)
			case 'modify_order':
				return this.renderModifyOrder(data, displayName)
			case 'cancel_order':
				return this.renderCancelOrder(data, displayName)
			case 'sign_in':
			case 'login':
				return this.renderLogin(data)
			case 'sign_out':
			case 'logout':
				return this.renderLogout(data)
			case 'save_balances':
				return <View />
			case 'query_cash_report':
			case 'export_cash_report':
				return this.renderCashReport(data)
			case 'query_holdings_report':
			case 'export_holdings_report':
				return this.renderHoldingsReport(data)
			case 'query_financial_report':
			case 'export_financial_report':
				return this.renderFinancialReport(data)
			case 'query_transaction_report':
			case 'export_transaction_report':
				return this.renderTransactionReport(data)
			case 'click_news':
				return <View />
			case 'click_cnote':
				return <View />
			case 'enter_pin':
				return this.renderEnterPin(data)
			case 'update_saxo_account':
				return this.renderUpdateSaxoAccount(data)
			case 'add_symbol':
				return this.renderAddWatchList(data)
			case 'remove_symbol':
				return this.renderRemoveWatchList(data)
			case 'update_symbol':
				return this.renderUpdateWatchList(data)
			case 'update_setting':
				return this.renderSetting(data)
			default:
				return <View />
		}
	}

	renderCreateUser(response = {}) {
		try {
			const { textNormal, businessPart } = styles
			const { action_details: actionDetailsJson } = response
			const actionDetails = JSON.parse(actionDetailsJson) || {}
			const { data } = actionDetails
			const userLoginID = data.user_login_id || ''

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('createUser')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${userLoginID} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderUpdateUser(response = {}) {
		try {
			const { textNormal, businessPart } = styles
			const { action_details: actionDetailsJson } = response
			const actionDetails = JSON.parse(actionDetailsJson) || {}
			const { data } = actionDetails
			const userLoginID = data.user_login_id || ''

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('updateUser')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${userLoginID} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View >
		} catch (error) {
			console.log(error)
		}
	}

	renderCreateRoleGroup(response = {}) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const groupName = (data.role_group_name + '').toUpperCase()

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('createRoleGroup')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${groupName} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderUpdateRoleGroup(response = {}) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const groupName = (data.role_group_name + '').toUpperCase()

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('updateRoleGroup')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${groupName} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderDeleteRoleGroup(response = {}) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const groupName = (data.role_group_name + '').toUpperCase()

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('deleteRoleGroup')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${groupName} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View >
		} catch (error) {
			console.log(error)
		}
	}

	renderChangeMarketData(response = {}) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const userLoginID = data.user_login_id || ''

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('changeMarketData')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${userLoginID} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View >
		} catch (error) {
			console.log(error)
		}
	}

	renderUpdateVettingRule(response = {}) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const branchName = data.branch_name

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('updateVettingRule')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${branchName} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderEnterPin(response) {
		try {
			const { textNormal } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const resData = actionDetails.res_data || {}
			const errorCode = resData.errorCode
			const status = errorCode && errorCode === 'SUCCESSFUL' ? 'CORRECT' : 'INCORRECT'
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				{
					this.preRenderHighLight('ENTER PIN')
				}
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
				{
					this.renderDeviceInfo(response)
				}
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
				{this.renderDeviceIP(response)}
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('is')}`}
				</Text>
				{
					this.preRenderHighLight(status)
				}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderRemoveWatchList(response) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const displayName = data.display_name || ''
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('removeSymbol')}`)
					}
				</View>
				<View style={businessPart}>
					{
						this.renderSymbol()
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('fromLower')}`}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('personalWatchList')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderAddWatchList(response) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const displayName = data.display_name || ''
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('addSymbol')}`)
					}
				</View>
				<View style={businessPart}>
					{
						this.renderSymbol()
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('into')}`}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('personalWatchList')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderUpdateWatchList(response) {
		try {
			const { textNormal, businessPart } = styles
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('updateUpper')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('personalWatchList')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderUpdateSaxoAccount(response) {
		try {
			const { textNormal, businessPart } = styles
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('updateScmUpper')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	getDeviceInfoDescription = this.getDeviceInfoDescription.bind(this)
	getDeviceInfoDescription(response) {
		const deviceInfo = JSON.parse(response.device_info) || {}
		const os = deviceInfo.os && deviceInfo.os.name ? deviceInfo.os.name : ''
		const browser = deviceInfo.browser && deviceInfo.browser.name ? deviceInfo.browser.name : ''
		const osUpperCase = os ? os.toUpperCase() : '';
		const model = deviceInfo.device && deviceInfo.device.model ? deviceInfo.device.model : ''
		const vendor = deviceInfo.device && deviceInfo.device.vendor ? deviceInfo.device.vendor : ''
		let deviceInfoShow = `${I18n.t('equixWebOn')} ${browser.toUpperCase()} ${I18n.t('browserUpper')} (${I18n.t('desktopUpper')})`
		if (os && Enum.LIST_DEVICE_APP.indexOf(osUpperCase) >= 0) {
			if (vendor && model) {
				deviceInfoShow = `${I18n.t('equixAppOn')} ${vendor.toUpperCase()} ${model.toUpperCase()} (${I18n.t('mobileUpper')})`
			} else {
				deviceInfoShow = `${I18n.t('equixAppOn')} ${os.toUpperCase()} (${I18n.t('mobileUpper')})`
			}
			return os
				? deviceInfoShow
				: `${I18n.t('unknownDevice')}`
		}
		return browser
			? deviceInfoShow
			: `${I18n.t('unknownDevice')}`
	}

	renderLoginStatus = this.renderLoginStatus.bind(this)
	renderLoginStatus(errorCode) {
		if (!this.state.isRenderLoginStatus) return null
		return errorCode && errorCode === Enum.LOGIN_RESPONSE.SUCCESSFUL
			? <WrapText splitWhenStart={true}>{`${I18n.t('successfullyUpper')}`}</WrapText>
			: <WrapText splitWhenStart={true}>{`${I18n.t('unsuccessfullyUpper')}`}</WrapText>
	}

	renderDeviceInfo(response, isRender = true) {
		if (!this.state.isRenderDeviceInfo) return null
		const deviceInfoDescription = this.getDeviceInfoDescription(response)
		return <WrapText>{deviceInfoDescription}</WrapText>
	}

	renderDeviceIP(response, isRender = true) {
		if (!this.state.isRenderDeviceIP) return null
		const ipAddress = response.ip_address
		const deviceIpDescription = `${I18n.t('ipAddress')} ${ipAddress}`
		return ipAddress
			? <WrapText keyTest={'renderDeviceIP'}>{deviceIpDescription}</WrapText>
			: null
	}

	renderSetting(response) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = response.action_details || {}
			const type = actionDetails.type;
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('updateSettingUpper')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderAccount = this.renderAccount.bind(this)
	renderAccount() {
		if (!this.state.account) return null
		return <WrapText keyTest={'renderAccount'}>{this.state.account}</WrapText>
	}

	renderFinancialReport(response) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const accountID = response.account_id
			const accountName = Business.getAccountName(accountID)
			const account = `${accountName} (${accountID})`
			const from = data.from || new Date().getTime();
			const to = data.to || new Date().getTime();
			const fromFormat = renderTime(from, 'DD MMM YYYY')
			const toFormat = renderTime(to, 'DD MMM YYYY')
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('requestUpper')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('financial')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('summary')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('report')}`}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('fromLower')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${fromFormat}`}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('toLower')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${toFormat}`}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('of')}`}
					</Text>
				</View>
				{
					this.renderAccount()
				}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response, false)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response, false)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderHoldingsReport(response) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const accountID = response.account_id
			const accountName = Business.getAccountName(accountID)
			const account = `${accountName} (${accountID})`
			const from = data.from || new Date().getTime();
			const to = data.to || new Date().getTime();
			const fromFormat = renderTime(from, 'DD MMM YYYY')
			const toFormat = renderTime(to, 'DD MMM YYYY')
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('requestUpper')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('holding')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('valuation')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('report')}`}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('fromLower')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{fromFormat}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('toLower')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{toFormat}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('of')}`}
					</Text>
				</View>
				{
					this.renderAccount()
				}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response, false)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response, false)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderCashReport(response) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const accountID = response.account_id
			const accountName = Business.getAccountName(accountID)
			const account = `${accountName} (${accountID})`
			const from = data.from || new Date().getTime();
			const to = data.to || new Date().getTime();
			const fromFormat = renderTime(from, 'DD MMM YYYY')
			const toFormat = renderTime(to, 'DD MMM YYYY')
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('requestUpper')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('cash')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('account')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('summary')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('report')}`}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('fromLower')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{fromFormat}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('toLower')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{toFormat}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('of')}`}
					</Text>
				</View>
				{
					this.renderAccount()
				}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response, false)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response, false)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderTransactionReport(response) {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const data = actionDetails.data || {}
			const accountID = response.account_id
			const accountName = Business.getAccountName(accountID)
			const account = `${accountName} (${accountID})`
			const from = data.from || new Date().getTime();
			const to = data.to || new Date().getTime();
			const fromFormat = renderTime(from, 'DD MMM YYYY')
			const toFormat = renderTime(to, 'DD MMM YYYY')
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('requestUpper')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('transaction')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('summary')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('report')}`}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('fromLower')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{fromFormat}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('toLower')} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{toFormat}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('of')}`}
					</Text>
				</View>
				{
					this.renderAccount()
				}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response, false)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response, false)}
			</View>
		} catch (error) {
			console.log(error)
		}
	}

	renderUserWatchList(response, displayName, type = 'add') {
		try {
			const { textNormal, businessPart } = styles
			const actionDetails = JSON.parse(response.action_details) || {}
			const dataRes = actionDetails.data_res || {}
			const status = dataRes.status
			const actionText = type === 'add' ? `${I18n.t('addSymbol')}` : `${I18n.t('removeSymbol')}`
			if (status === 'Sucessful') {
				return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
					<View style={businessPart}>
						{
							this.preRenderHighLight(actionText)
						}
					</View>
					<Text>
						{` `}
					</Text>
					<View style={businessPart}>
						{
							this.renderSymbol()
						}
					</View>
					<View style={businessPart}>
						<Text style={CommonStyle.textNormal}>{` ${type === 'add' ? I18n.t('into') : I18n.t('fromLower')} ${I18n.t('personalWatchList')} `}</Text>
					</View>
					<View style={businessPart}>
						<Text style={CommonStyle.textNormal}>
							{`${I18n.t('on')}`}
						</Text>
					</View>
					{this.renderDeviceInfo(response)}
					<View style={businessPart}>
						<Text style={CommonStyle.textNormal}>
							{`${I18n.t('with')}`}
						</Text>
					</View>
					{this.renderDeviceIP(response)}
				</View>
			}
			return <View />
		} catch (error) {
			console.log(error)
		}
	}

	renderModifyOrder(response, displayName) {
		try {
			const symbol = response.symbol || response.code || ''
			const isAuSymbol = Util.isAuBySymbol(symbol)
			const accountID = response.account_id
			if (isAuSymbol) {
				return this.renderModifyOrderAU(accountID, response, displayName)
			} else {
				return this.renderModifyOrderUS(accountID, response, displayName)
			}
		} catch (error) {
			console.log(error)
		}
	}

	renderModifyOrderAU(accountID, response, displayName) {
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const orderType = data.from.order_type || data.to.order_type

		switch (orderType.toUpperCase()) {
			case ORDERTYPE_ENUM.MARKETTOLIMIT_ORDER:
				return this.renderModifyOrderMarket(accountID, response, displayName)
			case ORDERTYPE_ENUM.LIMIT_ORDER:
				return this.renderModifyOrderLimit(accountID, response, displayName)
			case ORDERTYPE_ENUM.STOPLOSS_ORDER:
				return this.renderModifyOrderStopLoss(accountID, response, displayName)
			case ORDERTYPE_ENUM.STOPLIMIT_ORDER:
				return this.renderModifyOrderStopLimit(accountID, response, displayName)
			case ORDERTYPE_ENUM.TRAILINGSTOPLIMIT_ORDER:
				return this.renderModifyOrderTrailingStopLimit(accountID, response, displayName)
		}
	}

	renderModifyOrderUS(accountID, response, displayName) {
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const orderType = data.from.order_type || data.to.order_type

		switch (orderType.toUpperCase()) {
			case ORDERTYPE_ENUM.MARKETTOLIMIT_ORDER:
				return this.renderModifyOrderMarket(accountID, response, displayName)
			case ORDERTYPE_ENUM.LIMIT_ORDER:
				return this.renderModifyOrderLimit(accountID, response, displayName)
			case ORDERTYPE_ENUM.STOP_ORDER:
			case ORDERTYPE_ENUM.STOPLIMIT_ORDER:
			case ORDERTYPE_ENUM.STOPLOSS_ORDER:
			case ORDERTYPE_ENUM.STOPLOSS:
				return this.renderModifyOrderStopLoss(accountID, response, displayName)
		}
	}

	renderModifyOrderMarket(accountID, response, displayName) {
		const { textNormal, businessPart } = styles
		const type = 'modify'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		// from order
		const fromOrder = data.from || {}
		const fOrderQuantity = fromOrder.quantity || fromOrder.volume || 0;
		// to order
		const toOrder = data.to || {}
		const tOrderQuantity = toOrder.quantity || toOrder.volume || 0
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('fromLower')} `}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${fOrderQuantity} `}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('marketPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{` ${I18n.t('toLower')} `}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${tOrderQuantity} `}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('marketPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderModifyOrderLimit(accountID, response, displayName) {
		const { textNormal, businessPart } = styles
		const type = 'modify'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		// from order
		const fromOrder = data.from || {}
		const fOrderQuantity = fromOrder.quantity || fromOrder.volume || 0;
		const fLimitPrice = fromOrder.limit_price || 0;
		// to order
		const toOrder = data.to || {}
		const tOrderQuantity = toOrder.quantity || toOrder.volume || 0
		const tLimitPrice = toOrder.limit_price || 0;
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('fromLower')} `}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${fOrderQuantity} `}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('limitPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${formatNumberNew2(fLimitPrice, 4)}`}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{` ${I18n.t('toLower')} `}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${tOrderQuantity} `}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('limitPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${formatNumberNew2(tLimitPrice, 4)}`}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{` ${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderModifyOrderStopLoss(accountID, response, displayName) {
		const { textNormal, businessPart } = styles
		const type = 'modify'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		// from order
		const fromOrder = data.from || {}
		const fOrderQuantity = fromOrder.quantity || fromOrder.volume || 0;
		const fStopPrice = fromOrder.stop_price || 0;
		// to order
		const toOrder = data.to || {}
		const tOrderQuantity = toOrder.quantity || toOrder.volume || 0
		const tStopPrice = toOrder.stop_price || 0;
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('fromLower')} `}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${fOrderQuantity} `}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('marketPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`, ${I18n.t('triggerAt')}  `}
				</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('stopPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(fStopPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{` ${I18n.t('toLower')} `}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${tOrderQuantity} `}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('marketPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`, ${I18n.t('triggerAt')}  `}
				</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('stopPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(tStopPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{` ${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderModifyOrderStopLimit(accountID, response, displayName) {
		const { textNormal, businessPart } = styles
		const type = 'modify'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		// from order
		const fromOrder = data.from || {}
		const fOrderQuantity = fromOrder.quantity || fromOrder.volume || 0;
		const fStopPrice = fromOrder.stop_price || 0;
		const fLimitPrice = fromOrder.limit_price || 0;
		// to order
		const toOrder = data.to || {}
		const tOrderQuantity = toOrder.quantity || toOrder.volume || 0
		const tStopPrice = toOrder.stop_price || 0;
		const tLimitPrice = toOrder.limit_price || 0;
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('fromLower')} `}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${fOrderQuantity} `}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('limitPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(fLimitPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`, ${I18n.t('triggerAt')}  `}
				</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('stopPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(fStopPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{` ${I18n.t('toLower')} `}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${tOrderQuantity} `}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('limitPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(tLimitPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`, ${I18n.t('triggerAt')}  `}
				</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('stopPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(tStopPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{` ${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderModifyOrderTrailingStopLimit() {

	}

	renderCancelOrder(response, displayName) {
		try {
			const symbol = response.symbol || ''
			const isAuSymbol = Util.isAuBySymbol(symbol)
			const accountID = response.account_id
			if (isAuSymbol) {
				return this.renderCancelOrderAU(accountID, response, displayName)
			} else {
				return this.renderCancelOrderUS(accountID, response, displayName)
			}
		} catch (error) {
			console.log('renderCancelOrder error', error)
		}
	}

	renderCancelOrderAU(accountID, response, displayName) {
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const orderType = data.order_type
		switch (orderType.toUpperCase()) {
			case ORDERTYPE_ENUM.MARKETTOLIMIT_ORDER:
				return this.renderCancelOrderMarket(accountID, response, displayName)
			case ORDERTYPE_ENUM.LIMIT_ORDER:
				return this.renderCancelOrderLimit(accountID, response, displayName)
			case ORDERTYPE_ENUM.STOP_ORDER:
			case ORDERTYPE_ENUM.STOPLIMIT_ORDER:
			case ORDERTYPE_ENUM.STOPLOSS_ORDER:
			case ORDERTYPE_ENUM.STOPLOSS:
				return this.renderCancelOrderStop(accountID, response, displayName)
			case ORDERTYPE_ENUM.TRAILINGSTOPLIMIT_ORDER:
				return this.renderCancelOrderTrailingStopLimit(accountID, response, displayName)
		}
	}

	renderCancelOrderUS(accountID, response, displayName) {
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const orderType = data.order_type
		switch (orderType.toUpperCase()) {
			case ORDERTYPE_ENUM.MARKET_ORDER:
				return this.renderCancelOrderMarket(accountID, response, displayName)
			case ORDERTYPE_ENUM.LIMIT_ORDER:
				return this.renderCancelOrderLimit(accountID, response, displayName)
			case ORDERTYPE_ENUM.STOP_ORDER:
			case ORDERTYPE_ENUM.STOPLIMIT_ORDER:
			case ORDERTYPE_ENUM.STOPLOSS_ORDER:
			case ORDERTYPE_ENUM.STOPLOSS:
				return this.renderCancelOrderStopLoss(accountID, response, displayName)
		}
	}

	renderCancelOrderStop(accountID, response, displayName) {
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const limitPrice = data.limit_price;
		if (limitPrice) {
			return this.renderCancelOrderStopLimit(accountID, response, displayName)
		}
		return this.renderCancelOrderStopLoss(accountID, response, displayName)
	}

	renderCancelOrderMarket(accountID, response, displayName) {
		const { textNormal, businessPart } = styles;
		const type = 'cancel'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const quantity = data.quantity || data.volume || 0
		const filledQuantity = data.filled_quantity || 0;
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		const orderState = data.order_state
		let quantityShow = 0;
		if (orderState.toUpperCase() === 'PARTIALLY_FILLED' || orderState.toUpperCase() === 'PARTIALFILL') {
			quantityShow = quantity - filledQuantity
		} else {
			quantityShow = quantity
		}
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${quantityShow} ${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('marketPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderCancelOrderLimit(accountID, response, displayName) {
		const { textNormal, businessPart } = styles
		const type = 'cancel'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const quantity = data.quantity || data.volume || 0
		const filledQuantity = data.filled_quantity || 0
		const limitPrice = data.limit_price || 0
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		const orderState = data.order_state
		let quantityShow = 0;
		if (orderState.toUpperCase() === 'PARTIALLY_FILLED' || orderState.toUpperCase() === 'PARTIALFILL') {
			quantityShow = quantity - filledQuantity
		} else {
			quantityShow = quantity
		}
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${quantityShow} ${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('limitPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${formatNumberNew2(limitPrice, 4)}`}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{` ${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderCancelOrderStopLoss(accountID, response, displayName) {
		const { textNormal, businessPart } = styles
		const type = 'cancel'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const quantity = data.quantity || data.volume || 0
		const filledQuantity = data.filled_quantity || 0
		const stopPrice = data.stop_price || 0
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		const orderState = data.order_state
		let quantityShow = 0;
		if (orderState.toUpperCase() === 'PARTIALLY_FILLED' || orderState.toUpperCase() === 'PARTIALFILL') {
			quantityShow = quantity - filledQuantity
		} else {
			quantityShow = quantity
		}
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${quantityShow} ${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('marketPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`, ${I18n.t('triggerAt')}  `}
				</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('stopPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(stopPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{` ${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderCancelOrderStopLimit(accountID, response, displayName) {
		const { textNormal, businessPart } = styles;
		const type = 'cancel'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const quantity = data.quantity || data.volume || 0
		const filledQuantity = data.filled_quantity || 0
		const limitPrice = data.limit_price || 0
		const stopPrice = data.stop_price || 0
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		const orderState = data.order_state
		let quantityShow = 0;
		if (orderState.toUpperCase() === 'PARTIALLY_FILLED' || orderState.toUpperCase() === 'PARTIALFILL') {
			quantityShow = quantity - filledQuantity
		} else {
			quantityShow = quantity
		}
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${quantityShow} ${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('limitPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(limitPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`, ${I18n.t('triggerAt')}  `}
				</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('stopPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(stopPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{` ${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderCancelOrderTrailingStopLimit(accountID, actionDetails, displayName) {
		return <View>
			<Text>Trailing stop limit</Text>
		</View>
	}

	renderChangeNewsSource(response = {}) {
		try {
			const { textNormal, businessPart } = styles

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('changeNewsSourceUpper')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log('renderChangeNewsSource error', error)
		}
	}

	renderChangeAO(response = {}) {
		try {
			const { textNormal, businessPart } = styles

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('changeAO')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log('renderChangeAO error', error)
		}
	}

	getUserStatusText(status) {
		switch (status) {
			case Enum.USER_STATUS.INACTIVE:
				return I18n.t('inactive')
			case Enum.USER_STATUS.PENDING_EMAIL:
				return I18n.t('pendingEmail')
			case Enum.USER_STATUS.ACTIVE:
				return I18n.t('active')
			case Enum.USER_STATUS.CLOSED:
				return I18n.t('closed')
			case Enum.USER_STATUS.ADMIN_BLOCKED:
				return I18n.t('adminBlocked')
			case Enum.USER_STATUS.SECURITY_BLOCKED:
				return I18n.t('securityBlocked')
			default:
				return ''
		}
	}

	renderChangeStatus(response = {}) {
		try {
			const { textNormal, businessPart } = styles
			const { action_details: actionDetailsJson } = response
			const actionDetails = JSON.parse(actionDetailsJson) || {}
			const { data } = actionDetails
			const { from, to } = data
			const fromStatus = this.getUserStatusText(from)
			const toStatus = this.getUserStatusText(to)

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('changeStatusUpper')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('fromLower')} `}
					</Text>
				</View>
				<View style={businessPart}>
					{
						this.preRenderHighLight(fromStatus)
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('toLower')} `}
					</Text>
				</View>
				<View style={businessPart}>
					{
						this.preRenderHighLight(toStatus)
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{` ${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log('renderChangeStatus error', error)
		}
	}

	renderResetPassword(response = {}) {
		try {
			const { textNormal, businessPart } = styles
			const { action_details: actionDetailsJson } = response
			const actionDetails = JSON.parse(actionDetailsJson) || {}
			const { data } = actionDetails
			let userLoginID = data.user_login_id
			if (!userLoginID) {
				const dataPlus = data.data || {}
				userLoginID = dataPlus.user_login_id || ''
			}
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('resetPassword')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${userLoginID} `}
					</Text>
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log('renderResetPassword error', error)
		}
	}

	renderForgotPassword(response = {}) {
		try {
			const { textNormal, businessPart } = styles

			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('forgotPasswordUpper')}`, { marginRight: 8 })
					}
				</View>
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('on')}`}
					</Text>
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log('renderForgotPassword error', error)
		}
	}

	renderLogin(response = {}) {
		try {
			const { textNormal, businessPart } = styles
			const { action_details: actionDetailsJson } = response
			const actionDetails = JSON.parse(actionDetailsJson) || {}
			const { res_data: resData } = actionDetails
			const { errorCode } = resData
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{this.preRenderHighLight(`${I18n.t('signInUpper')}`)}
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
				{this.renderLoginStatus(errorCode)}
			</View>
		} catch (error) {
			console.log('renderLogin error', error)
		}
	}

	renderLogout(response) {
		try {
			const { textNormal, businessPart } = styles
			return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
				<View style={businessPart}>
					{
						this.preRenderHighLight(`${I18n.t('signOutUpper')}`)
					}
				</View>
				{this.renderDeviceInfo(response)}
				<View style={businessPart}>
					<Text style={CommonStyle.textNormal}>
						{`${I18n.t('with')}`}
					</Text>
				</View>
				{this.renderDeviceIP(response)}
			</View>
		} catch (error) {
			console.log('renderLogout erorr', error)
		}
	}

	renderPlaceOrder(response, displayName) {
		try {
			const symbol = response.symbol || ''
			const isAuSymbol = Util.isAuBySymbol(symbol)
			const accountID = response.account_id
			if (isAuSymbol) {
				return this.renderPlaceOrderAU(accountID, response, displayName)
			} else {
				return this.renderPlaceOrderUS(accountID, response, displayName)
			}
		} catch (error) {
			console.log(error)
		}
	}

	renderPlaceOrderAU(accountID, response, displayName) {
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const orderType = data.order_type
		switch (orderType.toUpperCase()) {
			case ORDERTYPE_ENUM.MARKETTOLIMIT_ORDER:
				return this.renderPlaceOrderMarket(accountID, response, displayName)
			case ORDERTYPE_ENUM.LIMIT_ORDER:
				return this.renderPlaceOrderLimit(accountID, response, displayName)
			case ORDERTYPE_ENUM.STOP_ORDER:
			case ORDERTYPE_ENUM.STOPLIMIT_ORDER:
			case ORDERTYPE_ENUM.STOPLOSS_ORDER:
			case ORDERTYPE_ENUM.STOPLOSS:
				return this.renderPlaceOrderStop(accountID, response, displayName)
			case ORDERTYPE_ENUM.TRAILINGSTOPLIMIT_ORDER:
				return this.renderPlaceOrderTrailingStopLimit(accountID, response, displayName)
		}
	}

	renderPlaceOrderStop(accountID, response, displayName) {
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const limitPrice = data.limit_price
		if (limitPrice) {
			return this.renderPlaceOrderStopLimit(accountID, response, displayName)
		}
		return this.renderPlaceOrderStopLoss(accountID, response, displayName)
	}

	renderPlaceOrderUS(accountID, response, displayName) {
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const orderType = data.order_type
		switch (orderType.toUpperCase()) {
			case ORDERTYPE_ENUM.MARKET_ORDER:
				return this.renderPlaceOrderMarket(accountID, response, displayName)
			case ORDERTYPE_ENUM.LIMIT_ORDER:
				return this.renderPlaceOrderLimit(accountID, response, displayName)
			case ORDERTYPE_ENUM.STOP_ORDER:
			case ORDERTYPE_ENUM.STOPLIMIT_ORDER:
			case ORDERTYPE_ENUM.STOPLOSS_ORDER:
			case ORDERTYPE_ENUM.STOPLOSS:
				return this.renderPlaceOrderStopLoss(accountID, response, displayName)
		}
	}

	// PARITECT - AU
	renderPlaceOrderMarket(accountID, response, displayName) {
		const { textNormal, businessPart } = styles;
		const type = 'place'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const quantity = data.quantity || data.volume
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${quantity} ${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('marketPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderPlaceOrderLimit(accountID, response, displayName) {
		const { textNormal, businessPart } = styles
		const type = 'place'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const quantity = data.quantity || data.volume
		const limitPrice = data.limit_price || 0
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${quantity} ${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('limitPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${formatNumberNew2(limitPrice, 4)}`}</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{` ${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderPlaceOrderStopLoss(accountID, response, displayName) {
		const { textNormal, businessPart } = styles;
		const type = 'place'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const quantity = data.quantity || data.volume
		const stopPrice = data.stop_price || 0
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${quantity} ${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('marketPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`, ${I18n.t('triggerAt')}  `}
				</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('stopPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(stopPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{` ${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderPlaceOrderStopLimit(accountID, response, displayName) {
		const { textNormal, businessPart } = styles
		const type = 'place'
		const actionDetails = JSON.parse(response.action_details) || {}
		const data = actionDetails.data || {}
		const quantity = data.quantity || data.volume
		const limitPrice = data.limit_price || 0
		const stopPrice = data.stop_price || 0
		const accountName = Business.getAccountName(accountID)
		const account = `${accountName} (${accountID})`
		return <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
			<View style={businessPart}>
				{
					this.preRenderHighLightOrder(type, data)
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${quantity} ${I18n.t('unitsOf')}`}</Text>
			</View>
			<View style={businessPart}>
				{
					this.renderSymbol()
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{`${I18n.t('at')}  `}</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('limitPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(limitPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`, ${I18n.t('triggerAt')}  `}
				</Text>
			</View>
			<View style={businessPart}>
				{
					this.preRenderHighLight(`${I18n.t('stopPriceUpper')}`, { marginRight: 8 })
				}
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${formatNumberNew2(stopPrice, 4)}`}
				</Text>
			</View>
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>{` ${I18n.t('for')}`}</Text>
			</View>
			{
				this.renderAccount()
			}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('on')}`}
				</Text>
			</View>
			{this.renderDeviceInfo(response, false)}
			<View style={businessPart}>
				<Text style={CommonStyle.textNormal}>
					{`${I18n.t('with')}`}
				</Text>
			</View>
			{this.renderDeviceIP(response, false)}
		</View>
	}

	renderPlaceOrderTrailingStopLimit(accountID, response, displayName) {
		return <View>
			<Text>Trailing stop limit</Text>
		</View>
	}

	preRenderHighLightOrder(type = 'place', actionDetails) {
		const typeShow = type === 'place' ? I18n.t('placeUpper') : type === 'modify' ? I18n.t('modifyUpper') : I18n.t('cancelUpper')
		const isBuy = type === 'modify' ? actionDetails.from.is_buy : actionDetails.is_buy;
		const backgroundColor = type === 'cancel'
			? CommonStyle.disableBtnSellBorderColor
			: isBuy
				? CommonStyle.disableBtnBuyBorderColor
				: CommonStyle.disableBtnSellBorderColor
		const side = isBuy ? I18n.t('buyUpper') : I18n.t('sellUpper')
		const text = `${typeShow} ${side} ${I18n.t('order_txtUpper')}`
		return this.renderHighLight(backgroundColor, text, { marginRight: 8 })
	}

	preRenderHighLight(text, style = {}) {
		const backgroundColor = CommonStyle.colorTag1
		if (!text) return null
		return this.renderHighLight(backgroundColor, text, style)
	}

	renderHighLight(backgroundColor, text, style = {}) {
		const { textHighLight, viewTextHighLight } = styles
		return <View style={[viewTextHighLight, { backgroundColor, flexWrap: 'wrap' }, style]}>
			<Text style={[textHighLight]}>
				{text}
			</Text>
		</View>
	}

	componentWillReceiveProps(nextProps) {
	}

	render() {
		if (!this.checkRenderBusinessLog()) return <View />
		const { time, actor } = styles
		return (
			<View style={{
				marginHorizontal: 16,
				backgroundColor: CommonStyle.bgCircleDrawer,
				justifyContent: 'center',
				paddingTop: 12,
				paddingRight: 8,
				paddingLeft: 16,
				paddingBottom: 8,
				borderRadius: 8,
				marginBottom: 8
			}}>
				<View>
					{
						this.renderTime(time)
					}
				</View>

				<View style={{ paddingTop: 4, paddingBottom: 10 }}>
					<Text style={CommonStyle.textNormalUser}>
						{dataStorage.emailLogin}
					</Text>
				</View>
				{
					this.renderActionDetail()
				}
			</View>
		);
	}
}
const mapStateToProps = state => {
	return {
		textFontSize: state.setting.textFontSize
	}
}
export default connect(mapStateToProps)(RowBusinessLog)
