import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import { connect, useSelector, shallowEqual, useDispatch } from 'react-redux';

import SvgIcon from '~/component/svg_icon/SvgIcon.js';
import MainComp from '~/screens/watchlist/Component/DefaultMainHeader.js';
import Ionicons from 'react-native-vector-icons/Ionicons';

import IconDone from '~/img/icon/noun_done.png';
import IconBack from '~/img/icon/noun_cancel.png';

import * as ApiController from '~/screens/watchlist/EditWatchList/Controllers/ApiController.js';

import { styles as headerStyles } from '~/screens/watchlist/Component/DefaultHeader.js';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import Enum from '~/enum';
import I18n from '~/modules/language/index';
import { useShadow } from '~/component/shadow/SvgShadow';
import { dataStorage } from '~/storage';

const ButtonDoneEdit = ({ navigator, disabledButtonDone }) => {
	const isConnected = useSelector((state) => state.app.isConnected);
	const handleDoneEdit = useCallback(() => {
		ApiController.handleDoneEdit();
		navigator.pop({
			animated: true, // does the pop have transition animation or does it happen immediately (optional)
			animationType: 'slide-horizontal' // 'fade' (for both) / 'slide-horizontal' (for android) does the pop have different transition animation (optional)
		});
	}, []);
	const { isDisable, color } = useMemo(() => {
		if (disabledButtonDone) {
			return {
				isDisable: true,
				color: CommonStyle.fontNearLight6
			};
		} else {
			if (isConnected) {
				return {
					isDisable: false,
					color: CommonStyle.fontColor
				};
			} else {
				return {
					isDisable: true,
					color: CommonStyle.fontNearLight6
				};
			}
		}
	}, [disabledButtonDone, isConnected]);
	return (
		<TouchableOpacity disabled={isDisable} onPress={handleDoneEdit}>
			<Image
				source={IconDone}
				style={{
					height: 22,
					width: 22,
					opacity: isDisable ? 0.5 : 1
				}}
			/>
			{/* <Ionicons size={22} color={color} name={'md-checkmark'} /> */}
		</TouchableOpacity>
	);
};
const ButtonBack = ({ navigator }) => {
	const onPress = useCallback(() => {
		dataStorage.isReloading = false // off loading khi back ve screen watch list
		navigator.pop({
			animated: true, // does the pop have transition animation or does it happen immediately (optional)
			animationType: 'slide-horizontal' // 'fade' (for both) / 'slide-horizontal' (for android) does the pop have different transition animation (optional)
		});
	}, []);
	return (
		<TouchableOpacity onPress={onPress}>
			<Image
				source={IconBack}
				style={{
					height: 22,
					width: 22
				}}
			/>
			{/* <Ionicons size={22} color={CommonStyle.fontColor} name={'md-checkmark'} /> */}
		</TouchableOpacity>
	);
};
const TopHeader = ({ navigator, disabledButtonDone }) => {
	const { main, container, rightComp, textTitle } = styles;
	const typePriceBoard = useSelector(state => state.priceBoard.typePriceBoard)
	const [Shadow, onLayout] = useShadow();
	const title = useMemo(() => {
		return 'Edit Watchlist';
	}, []);
	return (
		<React.Fragment>
			<Shadow />
			<View onLayout={onLayout} style={main}>
				<View style={[container]}>
					<View style={{ paddingRight: 16 }}>
						<ButtonBack navigator={navigator} />
					</View>
					<View
						style={{
							flex: 1
						}}
					>
						<Text style={textTitle}>{title}</Text>
					</View>
					<View style={[rightComp]}>
						<ButtonDoneEdit
							disabledButtonDone={disabledButtonDone}
							navigator={navigator}
						/>
					</View>
				</View>
			</View>
		</React.Fragment>
	);
};
TopHeader.propTypes = {};
TopHeader.defaultProps = {};

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({

	container: {
		marginHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 12,
		flexDirection: 'row',
		alignItems: 'center'
	},
	rightComp: {
		alignItems: 'center',
		paddingLeft: 16
	},
	main: {
		backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor2
	},
	subHeader: {
		flexDirection: 'row',
		width: '100%',
		paddingVertical: 8,
		alignItems: 'center'
	},
	textTitle: {
		fontFamily: CommonStyle.fontPoppinsBold,
		fontSize: CommonStyle.fontSizeXXL,
		color: CommonStyle.fontColor,
		textAlign: 'center'
	}
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default TopHeader;
