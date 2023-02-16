import React, { Component } from 'react';
import _ from 'lodash';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';

// Func
import { func, dataStorage } from '../../../storage';
import I18n from '~/modules/language';
import filterType from '~/constants/filter_type';
import CommonStyle from '~/theme/theme_controller';
import Enum from '../../../enum';
import * as Util from '../../../util';
import TouchableOpacityOpt from '../../../component/touchableOpacityOpt';
import * as Business from '../../../business';
import orderStateEnum from '../../../constants/order_state_enum';
import loginUserType from '../../../constants/login_user_type';
import * as RoleUser from '../../../roleUser';
import { bindActionCreators } from 'redux';
import * as authSettingActions from '../../setting/auth_setting/auth_setting.actions';
import { iconsMap } from '../../../utils/AppIcons';
import userType from '~/constants/user_type';
import orderTypeEnum from '~/constants/order_type';
import * as Controller from '../../../memory/controller';
import * as ManageAuth from '~/manage/manageAuth';
import originationEnum from '~/constants/origination';

const { SCREEN, ID_ELEMENT, ICON_NAME, ROLE_DETAIL } = Enum;
export class BtnModifyCancel extends Component {
	constructor(props) {
		super(props);
		this.init = this.init.bind(this);
		this.updateData = this.updateData.bind(this);
		this.checkTrigger = this.checkTrigger.bind(this);
		this.onCancelOrder = this.onCancelOrder.bind(this);
		this.onModifyOrder = this.onModifyOrder.bind(this);
		this.init();
		this.state = {
			data: props.data || {}
		};
		this.isMount = false;
	}
	init() {
		const { ordersTab } = this.props.data;
		this.dic = {
			ordersTab: ordersTab || filterType.WORKING
		};
	}
	updateData(props) {
		const { ordersTab } = props.data;
		this.updateOrdersTab(ordersTab);
		this.setState({
			data: props.data
		});
	}
	componentWillReceiveProps(props) {
		// console.log('recive ===================================>', props.data)
		this.updateData(props);
	}
	async onModifyOrder() {
		try {
			if (!Controller.getLoginStatus()) return;
			const { errorCode } = await ManageAuth.authentication({
				timeout: 800
			});
			if (errorCode !== 'SUCCESS') return;
			const { symbol } = this.state.data;
			const originOrderType = this.getOriginOrderType();
			const displayName = Business.getDisplayName({ symbol });
			this.props.navigator.push({
				animationType: 'slide-up',
				backButtonTitle: ' ',
				title: `${displayName} (--)`,
				screen: 'equix.ModifyOrder',
				passProps: {
					displayName: displayName,
					data: this.state.data,
					originOrderType
				},
				navigatorStyle: CommonStyle.navigatorSpecial
			});
		} catch (error) {
			console.log(
				'onModifyOrder listContent logAndReport exception: ',
				error
			);
		}
	}
	async onCancelOrder() {
		try {
			const { errorCode } = await ManageAuth.authentication({
				timeout: 800
			});
			if (errorCode !== 'SUCCESS') return;
			const screen = SCREEN.CONFIRM_CANCEL_ORDER;
			const accountInfo = dataStorage.currentAccount || {};
			const subtitle = `${accountInfo.account_name || ''} (${
				accountInfo.account_id || ''
			})`;
			this.props.navigator.showModal({
				screen,
				title: I18n.t('confirmCancelOrder'),
				subtitle,
				passProps: {
					actor: func.getUserLoginId(),
					oldOrdObj: this.state.data
				},
				animationType: 'slide-up',
				navigatorStyle: {
					...CommonStyle.navigatorSpecial,
					screenBackgroundColor: 'transparent',
					modalPresentationStyle: 'overCurrentContext'
				},
				navigatorButtons: {
					leftButtons: [
						{
							id: ID_ELEMENT.BTN_BACK_CONFIRM_ORDER,
							icon: Util.getValByPlatform(
								iconsMap[ICON_NAME.ARROW_BACK.IOS],
								iconsMap[ICON_NAME.ARROW_BACK.ANDROID]
							)
						}
					]
				}
			});
		} catch (error) {
			console.log(
				'showConfirmScreen listContent logAndReport exception: ',
				error
			);
		}
	}
	getOriginOrderType() {
		try {
			const {
				exchange,
				order_type: orderType,
				order_type_origin: orderTypeOrigin
			} = this.state.data;
			const type = (
				exchange === 'ASX' ? orderTypeOrigin : orderType + ''
			).toUpperCase();
			return orderTypeEnum[type];
		} catch (error) {
			console.log(
				'getOriginOrderType listContent logAndReport exception: ',
				error
			);
		}
	}
	getType(displayExchange) {
		const { order_type: orderType, order_type_origin: orderTypeOrigin } =
			this.state.data;
		if (displayExchange === 'ASX')
			return (orderTypeOrigin + '').toUpperCase();
		return (orderType + '').toUpperCase();
	}

	checkTrigger(passedState) {
		try {
			if (!passedState) return false;
			const triggerIndex = passedState.indexOf('TRIGGER');
			const includeTriggerState = triggerIndex > -1;
			return includeTriggerState;
		} catch (error) {
			console.log('checkTrigger', error);
			return false;
		}
	}

	checkExternal(origination) {
		return origination === originationEnum[originationEnum[201]];
	}

	checkDisableModify = () => {
		try {
			const {
				origin_broker_order_id: parentOrderID,
				broker_order_id: orderID,
				order_status: orderStatus,
				symbol,
				exchange,
				passed_state: passedState,
				origination
			} = this.state.data;
			const isTriggered = this.checkTrigger(passedState);
			const displayExchange = Business.getDisplayExchange({
				exchange,
				symbol
			});
			const orderType = this.getType(displayExchange);
			const isExternalOrder = this.checkExternal(origination);
			if (
				isExternalOrder ||
				!func.isAccountActive() ||
				isTriggered ||
				orderStatus === orderStateEnum.PENDING_CANCEL ||
				orderStatus === orderStateEnum.PENDING_REPLACE ||
				orderType === orderTypeEnum.BEST ||
				orderType === orderTypeEnum.BEST_ORDER ||
				orderType === orderTypeEnum.REJECTED ||
				orderID !== parentOrderID ||
				!RoleUser.checkRoleByKey(
					ROLE_DETAIL.PERFORM_MODIFY_ORDER_BUTTON
				) ||
				this.dic.ordersTab === filterType.FILLED ||
				this.dic.ordersTab === filterType.CANCELLED
			) {
				return true;
			}
			return false;
		} catch (error) {
			console.log('error checkDisableModify contentSlide', error);
			return true;
		}
	};
	checkDisableCancel() {
		const {
			origin_broker_order_id: parentOrderID,
			broker_order_id: orderID,
			order_status: orderStatus,
			origination
		} = this.state.data;
		const isExternalOrder = this.checkExternal(origination);
		if (
			isExternalOrder ||
			!func.isAccountActive() ||
			orderStatus === orderStateEnum.PENDING_CANCEL ||
			orderStatus === orderStateEnum.REJECTED ||
			orderID !== parentOrderID ||
			!RoleUser.checkRoleByKey(ROLE_DETAIL.PERFORM_CANCEL_ORDER_BUTTON) ||
			this.dic.ordersTab === filterType.FILLED ||
			this.dic.ordersTab === filterType.CANCELLED
		) {
			return true;
		}
		return false;
	}
	updateOrdersTab(ordersTab) {
		this.dic.ordersTab = ordersTab;
	}
	render() {
		const isDisableModify = this.checkDisableModify();
		const isDisableCancel = this.checkDisableCancel();
		return (
			<View
				style={[
					CommonStyle.buttonExpand,
					{
						paddingTop:
							func.getUserPriceSource() !== userType.Streaming
								? -16
								: 16,
						backgroundColor: CommonStyle.backgroundColor
					}
				]}
			>
				<TouchableOpacityOpt
					onPress={this.onModifyOrder}
					disabled={
						isDisableModify ||
						!this.props.isConnected ||
						this.props.loginUserType === loginUserType.REVIEW
					}
					style={{
						width: '48%',
						justifyContent: 'center',
						alignItems: 'center',
						borderRadius: 6,
						paddingVertical: 8,
						backgroundColor:
							isDisableModify ||
							!this.props.isConnected ||
							this.props.loginUserType === loginUserType.REVIEW
								? CommonStyle.btnOrderDisableBg
								: CommonStyle.fontBlue
					}}
				>
					<Text
						style={[
							CommonStyle.textButtonColor,
							{
								color:
									!this.props.isConnected || isDisableModify
										? CommonStyle.fontBlack
										: CommonStyle.fontWhite,
								opacity: isDisableModify ? 0.54 : 1
							}
						]}
					>
						{I18n.t('modifyUpper')}
					</Text>
				</TouchableOpacityOpt>

				<View style={{ width: '4%' }} />

				<TouchableOpacityOpt
					onPress={this.onCancelOrder}
					disabled={
						isDisableCancel ||
						!this.props.isConnected ||
						this.props.loginUserType === loginUserType.REVIEW
					}
					style={{
						width: '48%',
						justifyContent: 'center',
						alignItems: 'center',
						borderRadius: 6,
						paddingVertical: 8,
						backgroundColor:
							isDisableCancel ||
							!this.props.isConnected ||
							this.props.loginUserType === loginUserType.REVIEW
								? CommonStyle.btnOrderDisableBg
								: CommonStyle.btnCancelBg
					}}
				>
					<Text
						style={[
							CommonStyle.textButtonColor,
							{
								color:
									!this.props.isConnected || isDisableCancel
										? CommonStyle.fontBlack
										: CommonStyle.fontWhite,
								opacity: isDisableCancel ? 0.54 : 1
							}
						]}
					>
						{I18n.t('cancelUpper')}
					</Text>
				</TouchableOpacityOpt>
			</View>
		);
	}
	componentDidMount() {
		this.props.setRef && this.props.setRef(this);
		this.isMount = true;
	}
	componentWillUnmount() {
		this.isMount = false;
	}
}
function mapStateToProps(state) {
	return {
		app: state.app,
		login: state.login,
		loginUserType: state.app.loginUserType,
		isConnected: state.app.isConnected
	};
}
function mapDispatchToProps(dispatch) {
	return {
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}
export default connect(mapStateToProps, mapDispatchToProps)(BtnModifyCancel);
