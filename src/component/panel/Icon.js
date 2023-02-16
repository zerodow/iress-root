import React, { Component } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import * as Controller from '~/memory/controller';
import CustomButton from '~/component/custom_button/custom_button_watchlist';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import UiIndicator from './IndicatorUi'

import CommonStyle, { register } from '~/theme/theme_controller';

export const RefreshIcon = (props) => (
	<TouchableOpacityOpt disabled={props.disabled} style={props.style} testID="PortfolioC2R" onPress={props.onPress}>
		<Ionicons
			color={props.color}
			style={[{ top: -2 }, props.iconStyle]}
			size={props.size || 21}
			name={'ios-refresh'}
		/>
	</TouchableOpacityOpt>
);
export const CloseIcon2 = (props) => (
	<TouchableOpacityOpt
		onPress={props.onPress}
		style={[{
			// height: '100%',
			alignItems: 'center',
			justifyContent: 'center'
		}, props.style]}
	>
		<CommonStyle.icons.closeIconR
			color={CommonStyle.color.icon}
			style={{ textAlign: 'center' }}
			size={17}
		/>
	</TouchableOpacityOpt>
);
export const CloseIcon = (props) => (
	<TouchableOpacityOpt
		onPress={props.onPress}
		style={[{
			alignItems: 'center',
			justifyContent: 'center'
		}, props.style]}
	>
		<CommonStyle.icons.closeIcon
			color={CommonStyle.fontWhite}
			style={{ textAlign: 'center' }}
			size={20}
		/>
	</TouchableOpacityOpt>
);
export const IconClickToRefresh = ({ isLoading, onClickToRefresh, color = CommonStyle.fontWhite, disabled = false }) => {
	const isStreaming = false;
	return (
		<View
			style={{
				opacity: isStreaming ? 0 : 1,
				transform: [{
					translateX: isStreaming ? 10000 : 0
				}]
			}}
		>
			{isLoading ? <UiIndicator color={color} size={18} /> : <RefreshIcon disabled={disabled} color={color} style={{ width: 18 }} iconStyle={{ left: 2, top: 0 }} size={20} onPress={onClickToRefresh} />}
		</View>
	)
}
