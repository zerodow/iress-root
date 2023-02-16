import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { connect } from 'react-redux';
import _ from 'lodash';

import { ACTIONS_WIDTH } from './tradelist.actions';
import { HEIGHT_ROW } from './tradeList.row';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import Enum from '~/enum';

import WatchListActions from '../reducers';
import Icon from '../Component/Icon2';

const { USER_WATCHLIST } = Enum.WATCHLIST || {};

class LeftInteractable extends Component {
	getStatus() {
		const { symbol, exchange, priceBoardDetail } = this.props;
		const { value } = priceBoardDetail || {};
		const isFavorite = !!_.find(
			value,
			(p = {}) => p.symbol === symbol && p.exchange === exchange
		);
		return isFavorite;
	}

	render() {
		const { onAddToWl, _deltaX = new Animated.Value(0) } = this.props;
		return (
			<Animated.View
				style={[
					styles.container,
					{
						minWidth: ACTIONS_WIDTH + 8,
						height: HEIGHT_ROW - 3,
						width: Animated.add(16, _deltaX)
					}
				]}
			>
				<Icon
					name="searchSymbol"
					size={20}
					color={CommonStyle.color.dark}
					style={styles.item}
					onPress={onAddToWl}
				/>
				<View style={styles.horizontalLine} />
				<Icon
					name="newOrder"
					size={22}
					color={CommonStyle.color.dark}
					style={styles.item}
					disabled={true}
				/>
				<View style={styles.horizontalLine} />
				<Icon
					name="newAlert"
					size={22}
					color={CommonStyle.color.dark}
					style={styles.item}
					disabled={true}
				/>
			</Animated.View>
		);
	}
}

export const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
	container: {
		position: 'absolute',
		left: 17,
		top: 1,
		paddingRight: 16,
		borderRadius: 8,
		backgroundColor: CommonStyle.color.turquoiseBlue,
		justifyContent: 'center',
		flexDirection: 'row'
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		// justifyContent: 'space-around',
		flex: 1
	},
	horizontalLine: {
		height: '100%',
		borderRightWidth: 1,
		borderColor: CommonStyle.color.dusk
	},
	item: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%'
	}
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

const mapStateToProps = (state) => {
	const { priceBoard } = state.watchlist3;
	return {
		isConnected: state.app.isConnected,
		priceBoardDetail: priceBoard[USER_WATCHLIST] || {}
	};
};

const mapDispatchToProps = (dispatch) => ({
	changePriceBoard: (...p) =>
		dispatch(WatchListActions.watchListChangePriceBoard(...p))
});

export default connect(mapStateToProps, mapDispatchToProps)(LeftInteractable);
