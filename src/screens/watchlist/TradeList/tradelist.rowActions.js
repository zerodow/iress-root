import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import Icon from '../Component/Icon2';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import { ACTIONS_WIDTH } from './tradelist.actions';
import { HEIGHT_ROW } from './tradeList.row';

const RowActions = () => {
	return (
		<View
			style={[
				styles.container,
				{ minWidth: ACTIONS_WIDTH + 8, height: HEIGHT_ROW - 3 }
			]}
		>
			<Icon
				name="searchSymbol"
				size={20}
				color={CommonStyle.color.dark}
				style={styles.item}
				disabled={true}
				// onPress={onAddToWl}
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
		</View>
	);
};

export default RowActions;

const styles = {}
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
		item: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			height: '100%'
		},
		horizontalLine: {
			height: '100%',
			borderRightWidth: 1,
			borderColor: CommonStyle.color.dusk
		}
	});
	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
