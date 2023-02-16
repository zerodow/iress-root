import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import CommonStyle from '~/theme/theme_controller';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import I18n from '~/modules/language/';
import SvgIcon from '~s/watchlist/Component/Icon2';

const OnModalButton = ({ onPress }) => (
	<TouchableOpacityOpt
		onPress={onPress}
		style={{
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: 13,
			paddingHorizontal: 16,
			borderWidth: 1,
			borderColor: CommonStyle.color.dusk_tabbar,
			borderRadius: 8
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
			{I18n.t('createNewWL')}
		</Text>
	</TouchableOpacityOpt>
);

const OnMainButton = ({ onPress }) => (
	<TouchableOpacityOpt
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
			{I18n.t('create1StWL')}
		</Text>
	</TouchableOpacityOpt>
);

const CreateNewWLButton = ({ navigator, isMainWatchlist, isEmpty }) => {
	const pushToCreatePriceBoard = useCallback(() => {
		const screen = 'equix.CreatePriceboard';
		navigator &&
			navigator.push({
				screen,
				navigatorStyle: {
					disabledBackGesture: true,
					...CommonStyle.navigatorSpecialNoHeader
				},
				passProps: {},
				animated: true,
				animationType: 'slide-horizontal'
			});
	}, []);

	if (isMainWatchlist) {
		return isEmpty ? (
			<OnMainButton onPress={pushToCreatePriceBoard} />
		) : null;
	}

	return <OnModalButton onPress={pushToCreatePriceBoard} />;
};

export default CreateNewWLButton;
