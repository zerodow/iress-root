import React from 'react';
import {
	View,
	ActivityIndicator,
	TouchableOpacity,
	Platform,
	StyleSheet,
	Text
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Common
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import * as Controller from '~/memory/controller';
import * as Business from '~/business'

export const DragIcon = () => (
	<View
		style={{
			backgroundColor:
				CommonStyle.navigatorSpecial.navBarBackgroundColor2,
			opacity: 0.98
		}}
	>
		<View
			style={[
				CommonStyle.dragHandlerNewOrder,
				{
					flexDirection: 'row',
					marginTop: Platform.OS === 'ios' ? 4 : 0,
					shadowColor: CommonStyle.fontColor,
					shadowOffset: {
						width: 0,
						height: -4
					},
					shadowOpacity: 0.1,
					backgroundColor:
						CommonStyle.navigatorSpecial.navBarBackgroundColor2
				}
			]}
		>
			<View style={CommonStyle.dragIcons} />
		</View>
	</View>
);

export const ReloadIcon = props => {
	const isStreamer = Controller.isPriceStreaming();

	if (!isStreamer) {
		let content = (
			<View style={{ paddingRight: 16 }}>
				<Icon
					name="ios-refresh"
					size={30}
					color={CommonStyle.fontColor}
				/>
			</View>
		);
		if (props.isLoading) {
			content = (
				<View style={{ paddingLeft: 16, paddingTop: 8 }}>
					<ActivityIndicator
						style={{ width: 18, height: 18 }}
						color={CommonStyle.fontColor}
					/>
				</View>
			);
		}
		return (
			<TouchableOpacity
				hitSlop={{
					top: 8,
					bottom: 8,
					left: 8,
					right: 8
				}}
				onPress={props.onPress}
			>
				{content}
			</TouchableOpacity>
		);
	}
	return null;
};

export const CloseIcon = props => {
	if (props.isLoading) return null;
	return (
		<TouchableOpacity
			onPress={props.onPress}
			hitSlop={{
				top: 8,
				bottom: 8,
				left: 8,
				right: 8
			}}
		>
			<Icon
				name="ios-close-circle"
				color={CommonStyle.fontColor}
				size={24}
			/>
		</TouchableOpacity>
	);
};
export const DisplayNameSymbol = ({ symbol }) => {
	if (!symbol) {
		return (
			<Text style={styles.symbolText}>
				{'--'}
			</Text>
		)
	}
	const displayName = Business.getSymbolName({ symbol })
	return (
		<Text style={styles.symbolText}>
			{displayName}
		</Text>
	)
}
const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
	symbolText: {
		fontFamily: CommonStyle.fontPoppinsBold,
		fontSize: CommonStyle.fontSizeXL,
		color: CommonStyle.fontColor
	}
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
