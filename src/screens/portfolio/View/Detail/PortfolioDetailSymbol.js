import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import { getDisplayName } from '~/business';
import SvgIcon from '~s/watchlist/Component/Icon2';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import { handleShowAlertLog } from '~s/alertLog/Controller/SwitchController'

const DisplayName = ({ updateActiveStatus, symbol, exchange, navigator }) => {
	const displayName = useMemo(() => {
		if (!symbol && !exchange) return '';
		return getDisplayName({ symbol, exchange }) || `${symbol}.${exchange}`;
	}, [symbol, exchange]);

	const showSecDetail = useCallback(() => {
		updateActiveStatus && updateActiveStatus(false);
		navigator &&
			navigator.push({
				screen: 'equix.WatchlistDetail',
				overrideBackPress: true,
				animated: false,
				animationType: 'none',
				navigatorStyle: CommonStyle.navigatorSpecialNoHeader,
				passProps: {
					symbol,
					exchange
				}
			});
	}, [symbol, exchange]);

	return (
		<TouchableOpacityOpt onPress={showSecDetail}>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.font21,
					color: CommonStyle.color.modify,
					textDecorationLine: 'underline',
					textDecorationColor: CommonStyle.color.modify
				}}
			>
				{displayName}
			</Text>
		</TouchableOpacityOpt>
	);
};

const AddToWLButton = ({ showAddToWl, symbol, exchange }) => {
	const onPress = () => {
		showAddToWl({ symbol, exchange });
	};
	return (
		<TouchableOpacity onPress={onPress}>
			<CommonStyle.icons.add
				name={'add'}
				size={20}
				color={CommonStyle.color.modify}
				style={{ marginRight: 16 }}
			/>
		</TouchableOpacity>
	);
};

const AlertButton = ({ symbol, exchange }) => {
	const onCreateAlert = useCallback(() => {
		handleShowAlertLog({ symbol, exchange })
	}, [symbol, exchange])
	return (
		<TouchableOpacityOpt onPress={onCreateAlert}>
			<CommonStyle.icons.bell
				style={{ marginLeft: 16, opacity: 1 }}
				name={'newAlert'}
				size={20}
				color={CommonStyle.colorProduct}
			/>
		</TouchableOpacityOpt>
	);
};

const RightIcon = (props) => {
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center'
			}}
		>
			<AddToWLButton {...props} />
			<AlertButton {...props} />
		</View>
	);
};

const PortfolioDetailSymbol = ({
	updateActiveStatus,
	navigator,
	symbol,
	exchange,
	showAddToWl
}) => {
	return (
		<View
			style={{
				paddingTop: 8,
				paddingHorizontal: 16,
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}
		>
			<DisplayName
				updateActiveStatus={updateActiveStatus}
				navigator={navigator}
				symbol={symbol}
				exchange={exchange}
			/>
			<RightIcon
				symbol={symbol}
				exchange={exchange}
				showAddToWl={showAddToWl}
			/>
		</View>
	);
};

export default PortfolioDetailSymbol;
