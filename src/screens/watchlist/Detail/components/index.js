import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import * as Controller from '~/memory/controller';
import CustomButton from '~/component/custom_button/custom_button_watchlist';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';

import CommonStyle, { register } from '~/theme/theme_controller';

export const LoadingIcon = (props) => (
	<CustomButton
		style={{ alignItems: 'center', justifyContent: 'center' }}
		iconStyle={{ height: 32, width: 32, right: -14 }}
	/>
);

export const RefreshIcon = (props) => (
	<TouchableOpacityOpt testID="PortfolioC2R" onPress={props.onPress}>
		<Ionicons
			color={CommonStyle.fontWhite}
			size={21}
			style={{ top: -2 }}
			name={'ios-refresh'}
		/>
	</TouchableOpacityOpt>
);

export const CloseIcon = (props) => (
	<TouchableOpacityOpt
		onPress={props.onPress}
		style={{
			paddingHorizontal: 16,
			// height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			minWidth: 50
		}}
	>
		<CommonStyle.icons.closeIcon
			color={CommonStyle.fontWhite}
			style={{ textAlign: 'center' }}
			size={20}
		/>
	</TouchableOpacityOpt>
);
