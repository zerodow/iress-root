import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import I18n from '~/modules/language';
import { INVALID } from '~s/watchlist/enum';

const ErrorStatus = ({ title, status }) => {
	let mainTitle = '';

	if (status === INVALID.INVALID_CODE_EXCHANGES) {
		mainTitle = I18n.t('invalidCodeExchange');
	} else if (status === INVALID.INVALID_CODE) {
		mainTitle = I18n.t('invalidCode');
	} else if (status === INVALID.INVALID_EXCHANGES) {
		mainTitle = I18n.t('invalidExchanges');
	} else if (status === INVALID.INVALID_ACCESS) {
		mainTitle = I18n.t('invalidAccess');
	}

	return (
		<View style={{ alignItems: 'center', alignSelf: 'center' }}>
			<Text style={styles.note}>{`${I18n.t(
				'UnableToRetrieve'
			)} ${title}`}</Text>

			<Text style={styles.main}>{mainTitle}</Text>
		</View>
	);
};

export default ErrorStatus;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({

	note: {
		fontFamily: CommonStyle.fontPoppinsRegular,
		fontSize: CommonStyle.font11,
		color: CommonStyle.color.sell
	},
	main: {
		fontFamily: CommonStyle.fontPoppinsRegular,
		fontSize: CommonStyle.font19,
		color: CommonStyle.color.sell
	}
});
	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
