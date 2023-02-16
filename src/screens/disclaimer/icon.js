import React, { PureComponent } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import _ from 'lodash';

import CommonStyle from '~/theme/theme_controller';

export default class Icon extends PureComponent {
	render() {
		const {
			onPress,
			name,
			title,
			isDisable,
			styles,
			...props
		} = this.props;
		if (!name && !title) return null;

		const content = [];
		if (name) {
			content.push(
				<Ionicons
					key={name}
					color={CommonStyle.navigatorSpecial.navBarButtonColor1}
					size={24}
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
								CommonStyle.navigatorSpecial.navBarButtonColor1,
							fontSize: CommonStyle.fontSizeS,
							paddingLeft: 8,
							fontFamily: CommonStyle.fontPoppinsBold
						}}
					>
						{title}
					</Text>
				</View>
			);
		}

		if (_.isEmpty(content)) return null;

		return (
			<TouchableOpacity
				onPressOut={onPress}
				disabled={isDisable}
				hitSlop={{
					top: 8,
					left: 8,
					bottom: 8,
					right: 8
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						opacity: isDisable ? 0.54 : 1,
						...styles
					}}
				>
					{content}
				</View>
			</TouchableOpacity>
		);
	}
}
