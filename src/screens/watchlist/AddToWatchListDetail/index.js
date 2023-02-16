import React, { Component } from 'react';
import { FlatList, View, Text } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import Item from './Item';
import CONFIG from '~/config';
import * as Business from '~/business';
import WatchListActions from '../reducers';
import I18n from '~/modules/language';
import CommonStyle from '~/theme/theme_controller';
import ENUM from '~/enum';

const { WATCHLIST } = ENUM;

export class AddToWatchList extends Component {
	state = {
		textSearch: '',
		symbol: '',
		exchange: ''
	};

	onChangeText = this.onChangeText.bind(this);
	onChangeText(t) {
		this.setState({ textSearch: t });
	}

	onAddSymbol = this.onAddSymbol.bind(this);
	onAddSymbol({ symbol, exchange }) {
		this.setState({ symbol, exchange });
	}

	onItemPress = this.onItemPress.bind(this);
	onItemPress({ symbol, exchange, watchlistId, isInclude: isDelete }) {
		this.props.addOrRemoveSymbol({
			symbol,
			exchange,
			isDelete,
			priceboardId: watchlistId
		});
	}

	renderItem = this.renderItem.bind(this);
	renderItem({ item }) {
		const { symbol, exchange } = this.state;
		return (
			<Item
				symbol={symbol}
				exchange={exchange}
				data={item}
				key={item.watchlist}
				onPress={this.onItemPress}
			/>
		);
	}

	renderListEmptyComponent() {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<Text
					style={{
						color: CommonStyle.fontColor,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>
					{I18n.t('noData')}
				</Text>
			</View>
		);
	}

	render() {
		const data = [];

		const { priceBoard } = this.props;

		_.forEach(priceBoard, (item, key) => {
			const { watchlist_name: watchlistName, watchlist } = item;
			if (
				_.includes(watchlistName, this.state.textSearch) &&
				watchlist !== WATCHLIST.USER_WATCHLIST
			) {
				data.push(item);
			}
		});

		return (
			<FlatList
				scrollEnabled={false}
				contentContainerStyle={{ flex: 1 }}
				data={data}
				renderItem={this.renderItem}
				ListEmptyComponent={this.renderListEmptyComponent}
			/>
		);
	}
}

const mapStateToProps = (state) => {
	const { priceBoard } = state.watchlist3;
	const obj = {};
	_.forEach(priceBoard, (item, key) => {
		!item.isIress && (obj[key] = item);
	});
	return {
		priceBoard: obj
	};
};

const mapDispatchToProps = (dispatch) => ({
	addOrRemoveSymbol: (...p) => dispatch.priceBoard.addOrRemoveSymbol(...p)
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
	forwardRef: true
})(AddToWatchList);
