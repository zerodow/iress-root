import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { connect } from 'react-redux';
import _ from 'lodash';

import { DELETE_WIDTH } from './tradelist.actions';
import { HEIGHT_ROW } from './tradeList.row';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import Icon from '../Component/Icon2';

import Enum from '~/enum';

import WatchListActions from '../reducers';

import CONFIG from '~/config';
import * as Business from '~/business';

const { USER_WATCHLIST } = Enum.WATCHLIST || {};

class RightInteractable extends Component {
	onDeleteCode = this.onDeleteCode.bind(this);
	onDeleteCode() {
		const { symbol, exchange } = this.props;
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

		successActions({ errorCode: 'SUCCESS' });
		Business.removeSymbolPriceBoard(param);
	}

	onTouchDelete = this.onTouchDelete.bind(this);
	onTouchDelete() {
		const { onDelete } = this.props;
		onDelete && onDelete({ cb: this.onDeleteCode });
	}

	render() {
		const {
			iressTag,
			isConnected,
			_deltaX = new Animated.Value(0)
		} = this.props;
		if (iressTag) {
			return (
				<Animated.View
					style={[
						styles.container,
						{
							right: 15,
							top: -1,
							minWidth: DELETE_WIDTH + 16,
							height: HEIGHT_ROW + 2,
							width: Animated.sub(16, _deltaX),
							backgroundColor: CommonStyle.backgroundColor1
							// opacity: Animated.cond(
							//     Animated.greaterThan(_deltaX, 10),
							//     0,
							//     1
							// )
						}
					]}
				/>
			);
		}

		return (
			<Animated.View
				style={[
					styles.container,
					{
						minWidth: DELETE_WIDTH + 16,
						height: HEIGHT_ROW - 3,
						width: Animated.sub(16, _deltaX),
						opacity: Animated.cond(
							Animated.greaterThan(_deltaX, 10),
							0,
							1
						)
					}
				]}
			>
				<TouchableOpacity
					onPress={this.onTouchDelete}
					disabled={!isConnected}
					style={{
						width: '100%',
						height: '100%',
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Icon
						name="delete"
						size={24}
						color={CommonStyle.color.dark}
						style={{ transform: [{ rotate: '337.5deg' }] }}
					/>
				</TouchableOpacity>
			</Animated.View>
		);
	}
}

export const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		container: {
			position: 'absolute',
			right: 17,
			top: 1,
			paddingLeft: 16,
			borderRadius: 8,
			backgroundColor: CommonStyle.color.sell
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

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	null
)(RightInteractable);
