import React, { useCallback, useMemo } from 'react';
import { View, Text, Keyboard } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import { updateListSymbolAdded } from '~s/watchlist/Categories/Redux/actions';
import CommonStyle from '~/theme/theme_controller';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import I18n from '~/modules/language/';
import SvgIcon from '~s/watchlist/Component/Icon2';
import ENUM from '~/enum';
const { NAME_PANEL } = ENUM;

const FooterButton = ({ disabled, onPress }) => (
	<TouchableOpacityOpt
		disabled={disabled}
		onPress={onPress}
		style={{
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: 13,
			paddingHorizontal: 16,
			borderWidth: 1,
			borderColor: CommonStyle.color.dusk_tabbar,
			borderRadius: 8,
			opacity: disabled ? 0.5 : 1
		}}
	>
		<CommonStyle.icons.add
			color={CommonStyle.fontBorderRadius}
			size={24}
			style={{
				marginRight: 8
			}}
		/>
		<Text
			style={{
				color: CommonStyle.fontColor,
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font11,
				paddingTop: 2
			}}
		>
			{I18n.t('addSymbolBtn')}
		</Text>
	</TouchableOpacityOpt>
);

const MainButton = ({ disabled, onPress }) => {
	return (
		<TouchableOpacityOpt
			disabled={disabled}
			onPress={onPress}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				marginTop: 32,
				marginHorizontal: 16,
				borderWidth: 1,
				borderColor: CommonStyle.color.turquoiseBlue,
				borderRadius: 8,
				opacity: disabled ? 0.5 : 1,
				paddingVertical: 16
			}}
		>
			<SimpleLineIcons
				name="plus"
				color={CommonStyle.color.turquoiseBlue}
				size={36}
				style={{
					marginRight: 16
				}}
			/>
			<Text
				style={{
					color: CommonStyle.color.turquoiseBlue,
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font13
				}}
			>
				{I18n.t('addSymbolBtn')}
			</Text>
		</TouchableOpacityOpt>
	);
};

const AddSymbolButton = ({ navigator, isOnMain, isEmpty, showHide }) => {
	const dispatch = useDispatch();
	const dicSymbolAdded = useSelector(
		(state) => state.categoriesWL.dicSymbolAdded
	);
	const disabled = useSelector((state) => !state.app.isConnected);

	const onDone = useCallback((dic) => {
		setTimeout(() => {
			showHide && showHide(true);
		}, 100);
		setTimeout(() => {
			showHide && showHide(false);
		}, 300);
		setTimeout(() => {
			dispatch(updateListSymbolAdded(dic));
		}, 100);
	}, []);

	const onPress = useCallback(() => {
		showHide && showHide(false);
		navigator &&
			navigator.showModal({
				screen: 'equix.SingleBottomSheet',
				animated: false,
				animationType: 'none',
				navigatorStyle: {
					...CommonStyle.navigatorModalSpecialNoHeader,
					modalPresentationStyle: 'overCurrentContext'
				},
				passProps: {
					namePanel: NAME_PANEL.ADD_AND_SEARCH,
					isSwitchFromQuickButton: true,
					enabledGestureInteraction: false,
					dicSymbolSelected: dicSymbolAdded,
					onDone,
					addOnOutside: true
				}
			});
	}, [dicSymbolAdded]);

	if (isOnMain) {
		return isEmpty ? (
			<MainButton disabled={disabled} onPress={onPress} />
		) : null;
	}

	return isEmpty ? null : (
		<FooterButton disabled={disabled} onPress={onPress} />
	);
};

export default AddSymbolButton;
