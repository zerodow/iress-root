import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import { ACTIONS_WIDTH } from './ListActions';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import Enum from '~/enum';
import { HEIGHT_SEPERATOR } from '~s/watchlist/enum';

import WatchListActions from '~s/watchlist/reducers';
import Icon from '~s/watchlist/Component/Icon2';

import CONFIG from '~/config';
import * as Business from '~/business';

const { USER_WATCHLIST } = Enum.WATCHLIST || {};

const SearchSymbol = ({ onAddToWl }) => (
	<Icon
		name="searchSymbol"
		size={20}
		color={CommonStyle.color.dark}
		style={styles.item}
		onPress={onAddToWl}
		disabled
	/>
);

const NewOrder = (props) => (
	<Icon
		name="newOrder"
		size={22}
		color={CommonStyle.color.dark}
		style={styles.item}
		disabled={true}
	/>
);

const NewAlert = (props) => (
	<Icon
		name="newAlert"
		size={22}
		color={CommonStyle.color.dark}
		style={styles.item}
		disabled={true}
	/>
);

const LeftInteractable = ({
	height = 0,
	_deltaX,
	symbol,
	exchange,
	onAddToWl
}) => {
	return (
		<Animated.View
			style={[
				styles.container,
				{
					minWidth: ACTIONS_WIDTH + 16,
					height: Math.max(height - 3 - HEIGHT_SEPERATOR, 0),
					width: Animated.add(16, _deltaX)
				}
			]}
		>
			<View
				style={[
					styles.row,
					{
						borderBottomWidth: 0.5,
						borderColor: CommonStyle.fontNearDark2
					}
				]}
			>
				<View style={styles.horizontalLine} />
				<SearchSymbol onAddToWl={onAddToWl} />
			</View>
			<View style={styles.row}>
				<NewOrder />
				<View style={styles.horizontalLine} />
				<NewAlert />
			</View>
		</Animated.View>
	);
};

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
		justifyContent: 'center'
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		// justifyContent: 'space-around',
		flex: 1
	},
	horizontalLine: {
		height: '100%',
		borderLeftWidth: 0.5,
		borderColor: CommonStyle.fontNearDark2
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

export default LeftInteractable;
