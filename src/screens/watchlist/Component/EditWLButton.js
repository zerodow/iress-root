import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import I18n from '~/modules/language/';
import { dataStorage } from '~/storage';
import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux'
let EditWLButton = ({ navigator, changeAllowUnmount }) => {
	const dic = useRef({ mount: true });
	const { isLoadingErrorSystem } = useLoadingErrorSystem()
	const openEditWatchlist = useCallback(() => {
		changeAllowUnmount && changeAllowUnmount(false)
		dataStorage.isReloading = false
		dataStorage &&
			dataStorage.functionSnapToClose &&
			dataStorage.functionSnapToClose();
		const nextScreenObj = {
			screen: 'equix.EditWatchList',
			backButtonTitle: ' ',
			animated: true,
			animationType: 'slide-horizontal',
			passProps: {},
			navigatorStyle: CommonStyle.navigatorSpecial
		};
		if (!dic.current.mount) return;
		dic.current.mount = false;
		return navigator.push(nextScreenObj);
	}, []);
	const onNavigatorEvent = useCallback((event) => {
		switch (event.id) {
			case 'willAppear':
				dic.current.mount = true;
				break;
			default:
				break;
		}
	});

	useEffect(() => {
		navigator && navigator.addOnNavigatorEvent(onNavigatorEvent);
	}, []);
	const color = isLoadingErrorSystem ? CommonStyle.fontNearLight6 : CommonStyle.color.modify
	return (
		<View style={{ marginRight: 16 }}>
			<TouchableOpacityOpt
				disabled={isLoadingErrorSystem}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 8,
					borderWidth: 1,
					borderColor: color,
					borderRadius: 8
				}}
				timeDelay={3000}
				hitSlop={{
					top: 8,
					left: 8,
					right: 8,
					bottom: 8
				}}
				onPress={openEditWatchlist}
			>
				<CommonStyle.icons.pencil
					name="pencil"
					size={24}
					color={color}
				/>
				<Text
					style={{
						marginLeft: 8,
						fontSize: CommonStyle.font13,
						color: color,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>
					{I18n.t('editWL')}
				</Text>
			</TouchableOpacityOpt>
		</View>
	);
};

EditWLButton = React.memo(EditWLButton);

export default EditWLButton;
