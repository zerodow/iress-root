import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import CONFIG from '~/config';
import * as Business from '~/business';
import Icon from '~/component/headerNavBar/icon';
import CommonStyle from '~/theme/theme_controller';
import WatchListActions from '../reducers';

class CustomIcon extends Component {
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

	render() {
		const { priceBoardDetail, symbol, exchange } = this.props;
		const { value = [] } = priceBoardDetail || {};
		const isSelected =
			_.findIndex(
				value,
				(item) => symbol === item.symbol && exchange === item.exchange
			) !== -1;

		const iconName = isSelected ? 'equix_check' : 'md-add';

		const onPress = () =>
			this.addAndRemoveSymbol(symbol, isSelected, exchange);

		return (
			<TouchableOpacity
				onPress={onPress}
				style={{
					paddingRight: 16,
					justifyContent: 'center'
				}}
			>
				<View
					style={{
						justifyContent: 'center'
					}}
				>
					<Icon
						onPress={onPress}
						name={iconName}
						useCustomIcon={isSelected}
						size={isSelected ? 14 : 24}
						color={
							isSelected
								? CommonStyle.color.modify
								: CommonStyle.colorIconSettings
						}
					/>
				</View>
			</TouchableOpacity>
		);
	}
}

const mapStateToProps = (state) => {
	const { priceBoard, priceBoardSelected } = state.watchlist3;
	return {
		priceBoardDetail: priceBoard[priceBoardSelected] || {}
	};
};

const mapDispatchToProps = (dispatch) => ({
	changePriceBoard: (...p) =>
		dispatch(WatchListActions.watchListChangePriceBoard(...p))
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomIcon);
