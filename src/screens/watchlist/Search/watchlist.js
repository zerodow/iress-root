import React, { Component } from 'react';
import { View, TouchableOpacity, Keyboard } from 'react-native';
import { connect } from 'react-redux';

import { SearchCode } from '~s/addcode/addcode.search.2';
import ENUM from '~/enum';
import Row, {
	Row as RowBase
} from '~/component/result_search/rowSearchByMasterCode.1';
import WatchListActions from '../reducers';
import SCREEN from '../screenEnum';
import { func } from '~/storage';
import { checkParent } from '~/lib/base/functionUtil'

const {
	SCREEN: { SEARCH_CODE }
} = ENUM;

export class RowSearchByMasterCode extends Row {
	_addAndRemoveSymbol() { }
	_renderRowContent = ({ item }) => {
		return <View style={{ marginLeft: 32 }}>{this._header(item)}</View>;
	};

	_header(data) {
		const section = func.getSymbolObj(data.symbol) || data;
		const { textSearch } = this.props;
		return (
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'center',
					width: '100%'
				}}
			>
				{this.renderLeftIcon(section)}
				<View style={{ flex: 1 }}>
					<TouchableOpacity
						onPress={() => {
							Keyboard.dismiss();
							this.props.addAndRemoveSymbol(data.symbol);
						}}
					>
						<RowBase data={data} textSearch={textSearch} />
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	renderLeftIcon(section) {
		const isParent = checkParent(section);
		const { isExpand: isActive } = this.state;

		if (isParent) {
			return (
				<View
					style={{
						paddingRight: 16,
						justifyContent: 'center'
					}}
				>
					{this.renderArrowButton(isActive)}
				</View>
			);
		}
		return null;
	}
}

class SearchWatchList extends SearchCode {
	closeModal() {
		this.props.setScreenActive(SCREEN.WATCHLIST);
	}

	renderItem({ item }) {
		return (
			<RowSearchByMasterCode
				selectedClass={this.dic.selectedClass}
				data={item}
				isSelected={item.isSelected}
				textSearch={this.dic.textSearch}
				nameScreen={SEARCH_CODE}
				addAndRemoveSymbol={this.props.onRowPress}
			/>
		);
	}
}

function mapStateToProps(state, ownProps) {
	const { priceBoardSelected, priceBoard } = state.watchlist3;
	return {
		priceBoardDetail: priceBoard[priceBoardSelected] || {},
		isConnected: state.app.isConnected,
		priceBoardSelected,
		setting: state.setting
	};
}

const mapDispatchToProps = dispatch => ({
	setScreenActive: (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SearchWatchList);
