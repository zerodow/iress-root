import React, { PureComponent } from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import styles from '@unis/style/universal_search';
import * as Controller from '~/memory/controller';
import { logDevice, getOrderIdByType } from '~/lib/base/functionUtil';
import OrderActions from './search_order.reducer';
import I18n from '~/modules/language';
import Enum from '~/enum';
import * as RoleUser from '~/roleUser';
import LoadingComp from '~/component/loadingComp';
import AppState from '~/lib/base/helper/appState2';

export class Header extends PureComponent {
	getText(text) {
		return I18n.t(text, {
			locale: this.props.language
		});
	}
	render() {
		return (
			<View
				style={{
					marginHorizontal: 14,
					alignItems: 'center',
					flexDirection: 'column',
					justifyContent: 'center',
					paddingVertical: 6,
					borderBottomWidth: 1,
					borderColor: CommonStyle.fontBorderGray
				}}
			>
				<View style={{ flexDirection: 'row' }}>
					<Text style={[styles.col21, CommonStyle.textMainHeader]}>
						{this.getText('symbolUpper')}
					</Text>
					<Text
						style={[
							styles.col22,
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('quantityUpper')}
					</Text>
					<Text
						style={[
							styles.col23,
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('limitPriceUpper')}
					</Text>
					<Text
						style={[
							styles.col24,
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('FilledPriceUpper')}
					</Text>
				</View>
				<View style={{ paddingTop: 1, flexDirection: 'row' }}>
					<Text style={[styles.col21, CommonStyle.textSubHeader]}>
						{this.getText('sideUpper')}
					</Text>
					<Text
						style={[
							styles.col22,
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('FilledUpper')}
					</Text>
					<Text
						style={[
							styles.col23,
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('stopPriceUpper')}
					</Text>
					<Text
						style={[
							styles.col24,
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('DurationUpper')}
					</Text>
				</View>
			</View>
		);
	}
}

class MoreComp extends PureComponent {
	constructor(props) {
		super(props);
		this.loadMore = this.loadMore.bind(this);
	}
	loadMore() {
		const { filterType, loadMoreOrderData } = this.props;
		loadMoreOrderData(filterType);
	}
	render() {
		const { isMore } = this.props;
		if (isMore) {
			return (
				<TouchableOpacity
					onPress={this.loadMore}
					style={[styles.rowExpandNews, { width: '100%', backgroundColor: CommonStyle.backgroundColor }]}
				>
					<Text
						style={{
							fontSize: CommonStyle.fontSizeS,
							color: CommonStyle.fontBlue
						}}
					>
						{I18n.t('more', {
							locale: this.props.language
						})}
					</Text>
				</TouchableOpacity>
			);
		}

		return <View style={{ height: 16 }} />;
	}
}

export const More = connect(
	(state, ownProps) => {
		const { filterType } = ownProps;
		const { listOrderData } = state.searchOrder;
		const { isMore } = listOrderData[filterType];
		return { isMore };
	},
	dispatch => ({
		loadMoreOrderData: (...p) =>
			dispatch(OrderActions.loadMoreOrderData(...p))
	})
)(MoreComp);

const lastCodeOrders = {};
const registerOrders = {};

class RowComp extends PureComponent {
	constructor(props) {
		super(props);
		this.changeIndexOrders = this.changeIndexOrders.bind(this);
		this.registerChangeOrders = this.registerChangeOrders.bind(this);
	}

	registerChangeOrders(code, cb) {
		const { filterType } = this.props;
		if (!registerOrders[filterType]) registerOrders[filterType] = {};
		registerOrders[filterType][code] = cb;
	}

	changeIndexOrders(code, isOpen) {
		try {
			const { filterType } = this.props;
			const cb = registerOrders[filterType][code];
			if (cb) {
				const preCode = lastCodeOrders[filterType];
				if (isOpen) {
					lastCodeOrders[filterType] = code;
				} else {
					lastCodeOrders[filterType] = '';
				}
				cb(isOpen);
				if (preCode !== code) {
					const preCb = registerOrders[filterType][preCode];
					if (preCb) preCb(false);
				}
			}
		} catch (error) {
			logDevice(
				'info',
				`Universal Search Detail changeIndex working exception ${error}`
			);
		}
	}

	render() {
		const { data, filterType, login, navigator } = this.props;
		const orderId = getOrderIdByType(data);
		return (
			<View style={{ width: '100%' }} key={orderId}>
			</View>
		);
	}
}

export const Row = connect(state => ({ login: state.login }))(RowComp);

export class SearchOrder extends PureComponent {
	constructor(props) {
		super(props);
		const { filterType: type } = this.props;
		lastCodeOrders[type] = '';
		registerOrders[type] = {};

		this.props.navigator.addOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);

		this.appState = new AppState(() => {
			this.props.getSnapshot(type);
		});
	}

	componentWillReceiveProps = nextProps => {
		const { isConnected, symbol, filterType } = nextProps;
		const changeNerworkState =
			this.props.isConnected === false && isConnected === true;
		const changeSymbol = this.props.symbol !== symbol;
		if (changeNerworkState || changeSymbol) {
			this.props.getSnapshot(filterType);
		}
		if (changeSymbol) {
			nextProps.resetData(filterType);
		}
	};

	componentDidMount = () => {
		const { filterType } = this.props;
		this.props.resetData(filterType);
		this.props.getSnapshot(filterType);
	};

	onNavigatorEvent(event) {
		const { filterType } = this.props;
		switch (event.id) {
			case 'search_refresh':
				this.props.getSnapshot(filterType);
				break;
			case 'willAppear':
				this.props.resetData(filterType);
				this.props.getSnapshot(filterType);
				break;
			case 'didAppear':
				this.appState.addListenerAppState();
				break;
			case 'didDisappear':
				this.appState.removeListenerAppState();
				break;
			default:
				break;
		}
	}

	renderContent() {
		const hasRole = RoleUser.checkRoleByKey(
			Enum.ROLE_DETAIL.VIEW_ORDERS_UNIVERSALSEARCH
		);

		const { filterType: type } = this.props;
		const isLogged = Controller.getLoginStatus();
		const { lang } = this.props.setting;

		const { listData } = this.props;
		if (isLogged && hasRole && !_.isEmpty(listData)) {
			return (
				<React.Fragment>
					<FlatList
						keyboardShouldPersistTaps={'always'}
						data={_.values(listData)}
						renderItem={({ item }) => (
							<Row
								filterType={type}
								data={item}
								navigator={this.props.navigator}
							/>
						)}
					/>
					<More filterType={type} language={lang} />
				</React.Fragment>
			);
		}
		return (
			<View
				style={{
					height: 50,
					paddingHorizontal: 16,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				{<Text style={{ color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>{I18n.t('noData')}</Text>}
			</View>
		);
	}

	render() {
		const { lang } = this.props.setting;
		return (
			<React.Fragment>
				<Header language={lang} />
				<LoadingComp isLoading={this.props.isLoading}>
					{this.renderContent()}
				</LoadingComp>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	const { filterType } = ownProps;
	const { listOrderData } = state.searchOrder;
	const { listData, isLoading } = listOrderData[filterType];
	return {
		isLoading,
		listData,
		setting: state.setting,
		isConnected: state.app.isConnected,
		symbol: state.searchDetail.symbol
	};
};

const mapDispatchToProps = dispatch => ({
	resetData: (...p) => dispatch(OrderActions.resetStateListOrder(...p)),
	getSnapshot: (...p) => dispatch(OrderActions.loadDataOrders(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SearchOrder);
