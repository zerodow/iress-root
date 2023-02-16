import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import { connect } from 'react-redux';

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Price from '../price/price.2';

export class ListPrice extends Component {
	constructor(props) {
		super(props);
		this.renderRow = this.renderRow.bind(this);
	}

	renderRow() {
		const { symbol } = item;
		const displayName = func.getDisplayNameSymbol(symbol) || symbol;
		const { isLoadingPrice, login, navigator } = this.props;
		return (
			<View testID={`${symbol}WatchListRowData`} key={`${symbol}view`}>
				<Price symbol={symbol} />
				<View style={CommonStyle.borderBelow} />
			</View>
		);
	}

	render() {
		const { listPrice } = this.props;
		if (_.isEmpty(listPrice)) return <View />;
		return (
			<FlatList
				data={listPrice}
				maxToRenderPerBatch={10}
				keyboardShouldPersistTaps="always"
				ListFooterComponent={<View style={{ height: CommonStyle.heightTabbar }} />}
				renderItem={this.renderRow}
			/>
		);
	}
}

const mapStateToProps = state => ({
	listPrice: state.watchlist.listPrice
});

const mapDispatchToProps = {};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ListPrice);
