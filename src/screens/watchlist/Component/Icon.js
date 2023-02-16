import React, { PureComponent } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import _ from 'lodash';

import CommonStyle from '~/theme/theme_controller';

export class Icon extends PureComponent {
	render() {
		const { onPress, name, title, isDisable, ...props } = this.props;
		if (!name && !title) return null;

		const content = [];
		if (name) {
			content.push(
				<Ionicons
					key={name}
					color={CommonStyle.navigatorSpecial.navBarButtonColor}
					size={32}
					name={name}
					{...props}
				/>
			);
		}
		if (title) {
			content.push(
				<View style={{ justifyContent: 'center' }} key={title}>
					<Text
						style={{
							color:
								CommonStyle.navigatorSpecial.navBarButtonColor,
							fontSize: CommonStyle.fontSizeM,
							paddingLeft: 8
						}}
					>
						{title}
					</Text>
				</View>
			);
		}

		if (_.isEmpty(content)) return null;

		return (
			<TouchableOpacityOpt
				onPress={onPress}
				disabled={isDisable}
				hitSlop={CommonStyle.hitSlop}
			>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						opacity: isDisable ? 0.54 : 1
					}}
				>
					{content}
				</View>
			</TouchableOpacityOpt>
		);
	}
}
