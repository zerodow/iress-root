import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import { dataStorage, func } from '~/storage';
import RowComponent from './RowComponent';
import * as Business from '~/business';
import WatchListNameInput from '../EditWatchList/WatchListNameInput';
import CONFIG from '~/config';
import WatchListActions from '../reducers';

import Header from './header';

export class EditWL extends Component {
	constructor(props) {
		super(props);

		const { value } = props.priceBoardDetail || {};
		this.state = {
			data: value || [],
			isFirstLoad: true
		};
	}

	componentDidMount() {
		setTimeout(() => {
			this.setState({ isFirstLoad: false });
		}, 300);
	}

	componentWillReceiveProps(nextProps) {
		const { value } = nextProps.priceBoardDetail || {};
		this.state.data = value || [];
		console.log('DCM EDIT WATCHLIST componentWillReceiveProps', value);
	}

	onDeleteCode = this.onDeleteCode.bind(this);
	onDeleteCode(symbol, exchange) {
		const userId = 'iressuser';
		const rank = new Date().getTime();

		let newData = JSON.parse(JSON.stringify(this.props.priceBoardDetail));
		if (_.isEmpty(newData)) return;
		delete newData.init_time;

		const { watchlist: priceboardId } = newData || {};
		const param = {
			priceboardId,
			data: {
				...newData,
				user_id: userId,
				value: [
					{
						symbol,
						exchange,
						rank
					}
				]
			}
		};

		const successActions = (res) => {
			if (res && res.errorCode && res.errorCode === 'SUCCESS') {
				const { value: newDataValue } = newData || [];
				let newValue = [];
				newValue = _.remove(
					newDataValue,
					(p) => p.symbol !== symbol || p.exchange !== exchange
				);

				const obj = {};
				obj[priceboardId] = {
					...newData,
					user_id: userId,
					value: newValue
				};
				this.props.changePriceBoard(obj);
			}
		};
		Business.removeSymbolPriceBoard(param).then(successActions);
	}

	onDeletePress = this.onDeletePress.bind(this);
	onDeletePress(hideFunc) {
		this.preHideFunc && this.preHideFunc();
		this.preHideFunc = hideFunc;
	}

	renderItem = this.renderItem.bind(this);
	renderItem({ item }) {
		const { symbol, exchange } = item;
		const keySymbolInfo = `${symbol}#${exchange}`;
		let fullData = dataStorage.symbolEquity[keySymbolInfo];
		if (!fullData) {
			fullData = {
				symbol,
				exchanges: [exchange]
			};
		}
		return (
			<RowComponent
				data={fullData}
				onDeleteCode={this.onDeleteCode}
				onDeletePress={this.onDeletePress}
			/>
		);
	}

	renderHeader = this.renderHeader.bind(this);
	renderHeader() {
		const { navigator, isConnected } = this.props;
		return (
			<Header
				isShowWatchListNameInput={false}
				navigator={navigator}
				isConnected={isConnected}
			/>
		);
	}

	renderListFooter() {
		return <View style={{ height: 500 }} />;
	}

	setRefSortableList = this.setRefSortableList.bind(this);
	setRefSortableList(ref) {
		if (ref) {
			this.refSortableList = ref;
		}
	}

	renderSortableList() {
		if (!_.size(this.state.data) || this.state.isFirstLoad) return null;
		return (
			<FlatList
				style={{ flex: 1 }}
				data={_.values(this.state.data)}
				keyExtractor={(item) =>
					`draggable-item-${item.symbol}.${item.exchange}`
				}
				renderItem={this.renderItem}
				renderListFooter={this.renderListFooter}
			/>
		);
	}

	setRefTextInput = this.setRefTextInput.bind(this);
	setRefTextInput(ref) {
		if (ref) {
			this.refTextInPut = ref;
		}
	}

	blurTextInput = this.blurTextInput.bind(this);
	blurTextInput() {
		this.refTextInPut && this.refTextInPut.blurTextInput();
	}

	render() {
		return (
			// <TouchableWithoutFeedback onPress={this.blurTextInput}>
			<View style={{ flex: 1 }}>
				<View style={{ overflow: 'hidden' }}>
					{this.renderHeader()}
				</View>
				<WatchListNameInput setRefTextInput={this.setRefTextInput} />
				{this.renderSortableList()}
			</View>
			// </TouchableWithoutFeedback>
		);
	}
}

const mapStateToProps = (state) => {
	const { priceBoard, priceBoardSelected } = state.watchlist3;
	return {
		priceBoardDetail: priceBoard[priceBoardSelected] || {},
		isConnected: state.app.isConnected
	};
};

const mapDispatchToProps = (dispatch) => ({
	changePriceBoard: (...p) =>
		dispatch(WatchListActions.watchListChangePriceBoard(...p))
});

export default connect(mapStateToProps, mapDispatchToProps)(EditWL);
