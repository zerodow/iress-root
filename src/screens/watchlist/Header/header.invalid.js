import React, { useEffect, useState } from 'react';
import { Text, View, UIManager, StyleSheet } from 'react-native';
import _ from 'lodash';
import { useSelector } from 'react-redux';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import I18n from '~/modules/language';
import { animate } from '~/screens/news_v3/helper/animation.js';
import { INVALID } from '~s/watchlist/enum';

UIManager.setLayoutAnimationEnabledExperimental &&
	UIManager.setLayoutAnimationEnabledExperimental(true);

const HeaderMessage = () => {
	const error = useSelector((state) => {
		const {
			userPriceBoard,
			staticPriceBoard,
			priceBoardSelected
		} = state.priceBoard;
		const priceBoardDetail =
			userPriceBoard[priceBoardSelected] ||
			staticPriceBoard[priceBoardSelected] ||
			{};
		const { code } = priceBoardDetail || {};

		return code === INVALID.INVALID_WATCHLIST;
	});

	const [text, setText] = useState('');
	useEffect(() => {
		if (error) {
			animate();
			setText(`${I18n.t('invalidWatchlist')} (4)`);
		} else {
			setText('');
		}
	}, [error]);

	if (text === '') return null;
	return (
		<View style={styles.container}>
			<Text style={styles.message}>{text}</Text>
		</View>
	);
};

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({

	container: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		alignItems: 'center',
		backgroundColor: CommonStyle.color.error,
		marginTop: 8
	},
	message: {
		fontFamily: CommonStyle.fontPoppinsRegular,
		fontSize: CommonStyle.font11,
		color: CommonStyle.fontDark
	}
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

HeaderMessage.propTypes = {};
HeaderMessage.defaultProps = {};
export default HeaderMessage;
