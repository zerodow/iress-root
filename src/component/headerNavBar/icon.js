import React, { PureComponent } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomIcon from '~/component/Icon';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import _ from 'lodash';
import ENUM from '~/enum';
import CommonStyle from '~/theme/theme_controller';
import * as setTestId from '~/constants/testId';
export default class Icon extends PureComponent {
	render() {
		const {
			onPress,
			name,
			title,
			isDisable,
			styles,
			useCustomIcon,
			size = 24,
			...props
		} = this.props;
		if (!name && !title) return null;

		const content = [];
		const Icon = useCustomIcon ? CustomIcon : Ionicons;
		if (name) {
			content.push(
				<Icon
					key={name}
					color={CommonStyle.navigatorSpecial.navBarButtonColor1}
					size={size}
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
			<TouchableOpacityOpt
				timeDelay={ENUM.TIME_DELAY}
				onPressOut={onPress}
				disabled={isDisable}
				hitSlop={{
					top: 16,
					left: 16,
					bottom: 16,
					right: 16
				}}
				{...setTestId.testProp(`Id_test_${name}`, `Label_test_${name}`)}
			// {...this.props}
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
			</TouchableOpacityOpt>
		);
	}
}
