import React, { Component } from 'react';
import { Text, View } from 'react-native';

import { func } from '../../storage';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Enum from '../../enum';
import styles from './style/trade';

export default class TradeHeader extends Component {
	getText(txt) {
		return I18n.t(txt);
	}

	renderPrice(isTop) {
		const title = isTop
			? this.getText('valueTradedUpper')
			: this.getText('priceUpper');
		return (
			<Text style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}>
				{title}
			</Text>
		);
	}

	renderQuantity(isTop) {
		let content = '';
		if (!isTop) {
			content = this.getText('quantityUpper');
		}
		return (
			<Text style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}>
				{content}
			</Text>
		);
	}

	render() {
		const isTopValuePriceboard = func.isCurrentPriceboardTopValue();
		const priceBoardId = func.getCurrentPriceboardId();
		const isTopASX = priceBoardId === Enum.WATCHLIST.TOP_ASX_INDEX;
		return (
			<View
				style={{
					backgroundColor: 'white',
					flexDirection: 'row',
					marginHorizontal: 16,
					height: 40,
					alignItems: 'center',
					borderBottomWidth: 1,
					borderBottomColor: '#0000001e'
				}}
			>
				<View style={styles.col1}>
					<Text style={CommonStyle.textMainHeader}>
						{this.getText('symbolUpper')}
					</Text>
					<Text style={CommonStyle.textSubHeader}>
						{this.getText('securityUpper')}
					</Text>
				</View>
				<View
					style={[
						styles.col2,
						{ paddingRight: isTopValuePriceboard ? 0 : 4 }
					]}
				>
					{this.renderPrice(isTopValuePriceboard)}
					{this.renderQuantity(isTopValuePriceboard || isTopASX)}
				</View>
				<View style={styles.col3}>
					<Text
						style={[
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('overviewChgP')}
					</Text>
					<Text
						style={[
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('chgUpper')}
					</Text>
				</View>
			</View>
		);
	}
}
