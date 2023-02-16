import React, { PureComponent } from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { func, dataStorage } from '../../storage';
import { logAndReport } from '../../lib/base/functionUtil';
import CommonStyle from '~/theme/theme_controller';
import * as Business from '../../business';

export default class AddCodeDetail extends PureComponent {
	render() {
		const { isSelected } = this.props;

		if (isSelected) {
			return (
				<View>
					<Icon
						testID={`${this.props.symbol}added`}
						name="md-checkmark"
						style={CommonStyle.iconCheck}
					/>
				</View>
			);
		} else {
			return (
				<View>
					<Icon
						testID={`${this.props.symbol}removed`}
						name="md-add"
						style={CommonStyle.iconAdd}
					/>
				</View>
			);
		}
	}
}
