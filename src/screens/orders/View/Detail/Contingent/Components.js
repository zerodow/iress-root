import { StyleSheet, Text, View, Platform } from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import CommonStyle from '~/theme/theme_controller';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import I18n from '~/modules/language/';

export const Circle = ({ color, style }) => {
	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor: CommonStyle.color.dark
				},
				style
			]}
		>
			<View
				style={[
					styles.innerCircle,
					{
						backgroundColor: color
					}
				]}
			/>

			<View
				style={[
					styles.outnerCircle,
					{
						backgroundColor: color,
						borderColor: CommonStyle.fontBlack
					}
				]}
			/>
		</View>
	);
};

export const AmendButton = ({ visiabled = true, ...props }) => {
	if (!visiabled) return null;
	return (
		<TouchableOpacityOpt
			{...props}
			style={[
				styles.amendButton,
				{
					borderColor: CommonStyle.color.dusk_tabbar,
					opacity: props.disabled ? 1 : 0.5
				},
				props.style
			]}
		>
			<MaterialCommunityIcons
				name="pencil"
				size={12}
				color={CommonStyle.color.modify}
			/>
			<Text
				style={{
					fontSize: CommonStyle.font11,
					color: CommonStyle.color.modify,
					fontFamily: CommonStyle.fontPoppinsRegular
				}}
			>
				{I18n.t('amend')}
			</Text>
		</TouchableOpacityOpt>
	);
};

export const CancelButton = ({ visiabled = true, ...props }) => {
	return (
		<TouchableOpacityOpt
			{...props}
			style={[
				styles.amendButton,
				{
					borderColor: CommonStyle.color.dusk_tabbar,
					opacity: props.disabled ? 1 : 0.5
				},
				props.style
			]}
		>
			<FontAwesome
				name="close"
				size={12}
				color={CommonStyle.color.sell}
			/>
			<Text
				style={{
					paddingTop: Platform.OS === 'ios' ? 2 : 0.5,
					fontSize: CommonStyle.font11,
					color: CommonStyle.color.sell,
					fontFamily: CommonStyle.fontPoppinsRegular
				}}
			>
				{I18n.t('cancel')}
			</Text>
		</TouchableOpacityOpt>
	);
};

const styles = StyleSheet.create({
	container: { width: 16, height: 16 },
	innerCircle: {
		width: 16,
		height: 16,
		borderRadius: 8
	},
	outnerCircle: {
		width: 12,
		height: 12,
		borderRadius: 6,
		top: 2,
		left: 2,
		borderWidth: 1,
		position: 'absolute'
	},
	amendButton: {
		borderRadius: 4,
		borderWidth: 1,
		width: 93,
		paddingVertical: 4,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row'
	}
});
