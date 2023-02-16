import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import * as FuncUtil from '~/lib/base/functionUtil';
import Enum from '~/enum';
import WatchListActions from '../reducers';
import CommonStyle from '~/theme/theme_controller';
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

const DEFAULT_COLOR = CommonStyle.fontSilver;
const UP_COLOR = CommonStyle.upColor;
const DOWN_COLOR = CommonStyle.downColor;

class ChangeInfo extends PureComponent {
	onPress = this.onPress.bind(this);
	getData(data) {
		if (_.isEmpty(data)) {
			return {
				color: DEFAULT_COLOR,
				changePoint: '--',
				changePercent: '--',
				quantity: '--'
			};
		}
		const {
			change_point: changePoint,
			change_percent: changePercent,
			trade_size: quantity
		} = data;
		const result = {
			color: DEFAULT_COLOR
		};
		if (changePoint || changePoint === 0) {
			result['color'] = +changePoint >= 0 ? UP_COLOR : DOWN_COLOR;
		}
		result['changePoint'] = FuncUtil.formatNumberNew2(
			changePoint,
			PRICE_DECIMAL.SPECIFIC_PRICE
		);

		result['changePercent'] = FuncUtil.formatNumberNew2(
			changePercent,
			PRICE_DECIMAL.PERCENT
		);
		result['quantity'] = FuncUtil.formatNumber(quantity) || '--';
		return result;
	}
	onPress() {
		this.props.changeInfoSelected();
	}

	formatValue({ value, length = 7, infoSelected }) {
		if (!value) return '';
		if (value === '--') return '--';
		const numberSlice =
			infoSelected === 'changePercent' ? length - 1 : length;
		if (value.length > numberSlice) {
			value = value.substring(0, numberSlice);
		}
		return infoSelected === 'changePercent' ? value + '%' : value;
	}

	render() {
		const { color, ...info } = this.getData(this.props.data);
		const { infoSelected, isLoadingGetSnapshot } = this.props;
		let value = info[infoSelected];
		const valueShow = isLoadingGetSnapshot
			? '--'
			: this.formatValue({ value, infoSelected });
		return (
			<TouchableOpacity onPress={this.onPress} style={{ width: '100%' }}>
				<View
					style={{
						height: 24,
						backgroundColor: color,
						borderRadius: 8,
						width: '100%',
						alignItems: 'flex-end',
						justifyContent: 'center',
						paddingHorizontal: 8
					}}
				>
					<Text

						numberOfLines={1}
						textAlign="right"
						style={{
							fontFamily: CommonStyle.fontPoppinsRegular,
							fontSize: CommonStyle.fontSizeXS,
							color: CommonStyle.fontWhite
						}}
					>
						{valueShow}
					</Text>
				</View>
			</TouchableOpacity>
		);
	}
}

const mapStateToProps = state => ({
	infoSelected: state.watchlist3.infoSelected,
	isLoadingGetSnapshot: state.streamMarket.isLoading
});

const mapDispatchToProps = dispatch => ({
	changeInfoSelected: (...p) =>
		dispatch(WatchListActions.watchListChangeInfoSelected(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChangeInfo);
