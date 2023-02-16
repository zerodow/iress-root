import React, { useCallback } from 'react';
import { View, Text, Keyboard } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useShadow } from '~/component/shadow/SvgShadow';
import { func } from '~/storage';
import { useSelector } from 'react-redux';

const CloseIcon = ({ onClose, disable }) => {
	const handleClose = useCallback(() => {
		Keyboard.dismiss();
		func.clearRegionSelected();
		func.setCacheLoginSuccess(false);
		onClose && onClose();
	});
	return (
		<TouchableOpacityOpt
			disabled={disable}
			onPress={handleClose}
			style={{
				position: 'absolute',
				left: 16,
				alignSelf: 'center',
				justifyContent: 'center',
				minWidth: 50
			}}
		>
			<CommonStyle.icons.backIcon
				style={{
					opacity: disable ? 0.5 : 1,
					width: 20,
					height: 20,
					tintColor: CommonStyle.fontWhite
				}}
			/>
		</TouchableOpacityOpt>
	);
};

const RegionHeader = ({ title, onClose, hideShowRegion }) => {
	const [Shadow, onLayout] = useShadow();

	const isLoading = useSelector((state) => state.login.isLoading);

	return (
		<View
			style={{
				zIndex: 99999
			}}
		>
			<Shadow />
			<View
				onLayout={onLayout}
				style={{
					zIndex: 10,
					height: 49,
					width: '100%',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Text
					style={{
						fontSize: CommonStyle.font23,
						color: CommonStyle.fontWhite,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>
					{title}
				</Text>
				{onClose && !hideShowRegion ? (
					<CloseIcon onClose={onClose} disable={isLoading} />
				) : (
					<View />
				)}
			</View>
		</View>
	);
};

export default RegionHeader;
