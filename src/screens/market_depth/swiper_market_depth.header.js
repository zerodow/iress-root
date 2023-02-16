import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

import I18n from '../../modules/language';
import styles from './style/market_depth';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

export default class Header extends PureComponent {
	getText(text) {
		return I18n.t(text);
	}

	render() {
		return (
			<View
				testID="marketDeepthOrderHeader"
				style={[
					styles.header,
					{
						borderBottomWidth: 1,
						borderColor: CommonStyle.fontBorderGray
					}
				]}
			>
				<View style={[CommonStyle.headerLeft, { paddingVertical: 9 }]}>
					<Text
						style={[
							CommonStyle.textMainHeader,
							styles.col3,
							{ textAlign: 'left' }
						]}
					>
						{this.getText('numberOfTrades')}
					</Text>
					<Text
						style={[
							CommonStyle.textMainHeader,
							styles.col1,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('volUpper')}
					</Text>
					<Text
						style={[
							CommonStyle.textMainHeader,
							styles.col2,
							{ paddingRight: 12, textAlign: 'right' }
						]}
					>
						{this.getText('bidUpper')}
					</Text>
				</View>
				<View style={[styles.headerRight, { paddingVertical: 9 }]}>
					<Text
						style={[
							CommonStyle.textMainHeader,
							styles.col2,
							{ paddingLeft: 12 }
						]}
					>
						{this.getText('offerUpper')}
					</Text>
					<Text style={[CommonStyle.textMainHeader, styles.col1]}>
						{this.getText('volUpper')}
					</Text>
					<Text
						style={[
							CommonStyle.textMainHeader,
							styles.col3,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('numberOfTrades')}
					</Text>
				</View>
			</View>
		);
	}
}
