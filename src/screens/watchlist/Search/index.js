import React from 'react';
import { View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';

import CommonStyle from '~/theme/theme_controller';
import { NewAlert } from '~s/alert_function/new_alert1';
import WatchListActions from '../reducers';
import * as settingAction from '~/screens/setting/setting.actions';
import * as Business from '~/business';
import SCREEN from '../screenEnum';
import CONFIG from '~/config';
import ResultSearch from './CustomSearchResult';
import SearchBarBase from '~s/alert_function/components/SearchBar';

class SearchBar extends SearchBarBase { }

class SearchWatchList extends NewAlert {
	componentDidMount() {
		global.watchlistSearchOnCancel = this.onCancel;
		global.watchlistSearchOnSearch = this.onSearch;
		super.componentDidMount();

		this.keyboardDidShowListener = {
			remove: () => null
		};

		this.keyboardDidHideListener = {
			remove: () => null
		};
	}
	componentWillUnmount() {
		delete global.watchlist_search_onCancel;
		delete global.watchlist_search_onSearch;
		super.componentWillUnmount();
	}

	xSetNavEventOnThisForm() {
		!this.xSetting.ignoreNavEvent &&
			this.props.navigator &&
			this.onNavigatorEvent &&
			this.props.navigator.addOnNavigatorEvent(this.onNavigatorEvent);
	}

	handleCancelSearch() {
		const { fromScreen } = this.props;
		this.props.setScreenActive(fromScreen);
	}

	onPressResultSearch = this.onPressResultSearch.bind(this);
	onPressResultSearch({ symbolInfo }) {
		super.onPressResultSearch({ symbolInfo });
		const { symbol, exchanges } = symbolInfo || {};
		const exchange = exchanges && exchanges[0] ? exchanges[0] : '';

		const { value = [] } = this.props.priceBoardDetail;
		const isSelected =
			_.findIndex(
				value,
				(item) => symbol === item.symbol && exchange === item.exchange
			) !== -1;

		const isFromWatchList = this.props.fromScreen === SCREEN.WATCHLIST;
		if (isFromWatchList) {
			setTimeout(() => {
				this.props.onRowPress &&
					this.props.onRowPress({ symbol, exchange });
			}, 100);
		} else {
			this.addAndRemoveSymbol(symbol, isSelected, exchange);
		}
	}
	addAndRemoveSymbol(symbol, isSelected, exchange) {
		const userId = 'iressuser';
		const rank = new Date().getTime();

		let newData = JSON.parse(JSON.stringify(this.props.priceBoardDetail));
		if (_.isEmpty(newData)) return;
		delete newData.init_time;

		let { watchlist: priceboardId, watchlist_name: WLName } = newData || {};
		if (!WLName) {
			WLName = priceboardId;
		}
		let data = {
			...newData,
			user_id: userId,
			watchlist_name: WLName,
			value: [
				{
					symbol,
					exchange,
					rank
				}
			]
		};
		if (!isSelected) {
			data.row_number = [0];
		}
		const param = {
			priceboardId,
			data
		};

		const successActions = (res) => {
			if (res && res.errorCode && res.errorCode === 'SUCCESS') {
				const { value: newDataValue } = newData || [];
				let newValue = [];
				if (isSelected) {
					newValue = _.remove(
						newDataValue,
						(p) => p.symbol !== symbol || p.exchange !== exchange
					);
				} else {
					newValue = [
						{
							symbol,
							exchange,
							rank
						},
						...newDataValue
					];
				}

				const obj = {};
				obj[priceboardId] = {
					...newData,
					user_id: userId,
					value: newValue
				};
				this.props.changePriceBoard(obj);
			}
		};

		if (isSelected) {
			Business.removeSymbolPriceBoard(param).then(successActions);
		} else {
			Business.addSymbolPriceBoard(param).then(successActions);
		}
	}

	renderHaveData() {
		return (
			<ResultSearch
				style={{ marginHorizontal: 0, flex: 1 }}
				ref={this.setRefResultSearch}
				data={this.state.dataSource}
				selectedClass={this.dic.selectedClass}
				textSearch={this.state.textSearch}
				isFromWatchList={this.props.fromScreen === SCREEN.WATCHLIST}
				onPressResultSearch={this.onPressResultSearch}
			/>
		);
	}

	setRefSymbolDetail = this.setRefSymbolDetail.bind(this);
	setRefSymbolDetail(sef) {
		if (sef) {
			this._detail = sef;
		}
	}

	renderResultSearchWrapper() {
		const content = (
			<View
				style={{
					backgroundColor: CommonStyle.backgroundColor1,
					width: '100%',
					flex: 1,
					paddingHorizontal: 16
				}}
			>
				{this.renderHistoryBar()}
				{this.renderResultSearch()}
			</View>
		);
		return (
			<TouchableWithoutFeedback isNested onPress={Keyboard.dismiss}>
				<View style={{ flex: 1 }}>
					{this.renderSearchBar2()}
					{!this.props.isFirstLoad && content}
				</View>
			</TouchableWithoutFeedback>
		);
	}

	renderSearchBar2 = this.renderSearchBar2.bind(this);
	renderSearchBar2() {
		return (
			<SearchBar
				setting={this.props.setting}
				isConnected={this.props.isConnected}
				ref={this.setRefSearchBar}
				navigator={this.props.navigator}
				setRefInput={this.setRefTextInputSearch}
				onChangeText={this.onSearch}
				onCancel={this.handleCancelSearch}
				textSearch={this.state.textSearch}
				onReset={this.onReset}
				listItem={this.dic.listSymbolClass}
				searchWrapperStyles={{
					flex: 1,
					width: undefined
				}}
				buttonCancelStyles={{
					flex: 0
				}}
			/>
		);
	}

	render() {
		return (
			<View
				// ref={this.setRefNested}
				style={{
					flex: 1,
					backgroundColor: CommonStyle.backgroundColor
				}}
			>
				{/* {this.renderSearchBar2()} */}
				{this.renderResultSearchWrapper()}
			</View>
		);
	}
}

function mapStateToProps(state) {
	const {
		screenParams,
		screenSelected,
		priceBoard,
		priceBoardSelected
	} = state.watchlist3;
	const params = screenParams[screenSelected] || {};
	return {
		priceBoardSelected,
		priceBoardDetail: priceBoard[priceBoardSelected] || {},
		fromScreen: params.fromScreen,
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

const mapDispatchToProps = (dispatch) => ({
	setScreenActive: (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p)),
	settingAction: bindActionCreators(settingAction, dispatch),
	changePriceBoard: (...p) =>
		dispatch(WatchListActions.watchListChangePriceBoard(...p))
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchWatchList);
