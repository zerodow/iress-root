import React, { useCallback, useMemo } from 'react';
import { View, Text, Dimensions, Platform } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';
import isEqual from 'react-fast-compare';
import CommonStyle from '~/theme/theme_controller';

import ChangeNameComp from '~/screens/watchlist/Header/ChangeNameComp.js';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import I18n from '~/modules/language/';
import Enum from '~/enum';
import { calculateLineHeight } from '~/util';

let SubTitle = ({ showModal, closeModal }) => {
	const userPriceBoard = useSelector(
		(state) => state.priceBoard.userPriceBoard,
		isEqual
	);
	const staticPriceBoard = useSelector(
		(state) => state.priceBoard.staticPriceBoard,
		isEqual
	);
	const priceBoardSelected = useSelector(
		(state) => state.priceBoard.priceBoardSelected,
		isEqual
	);
	const displayName = useMemo(() => {
		if (priceBoardSelected === Enum.WATCHLIST.USER_WATCHLIST) {
			return I18n.t('mobileFavorite');
		} else {
			const priceBoardDetail =
				userPriceBoard[priceBoardSelected] ||
				staticPriceBoard[priceBoardSelected] ||
				{};
			const { watchlist, watchlist_name: watchlistName } =
				priceBoardDetail;

			return watchlistName || watchlist;
		}
	}, [userPriceBoard, staticPriceBoard, priceBoardSelected]);

	const onPressWatchlistName = useCallback(() => {
		showModal(() => <ChangeNameComp onCancel={closeModal} />);
	}, []);

	let extraStyles = {};
	if (Platform.OS !== 'ios') {
		extraStyles = {
			lineHeight: calculateLineHeight(CommonStyle.fontSizeM)
		};
	}

	return (
		<View style={{ paddingLeft: 16, paddingRight: 16, flex: 1 }}>
			<TouchableOpacityOpt
				onPress={onPressWatchlistName}
				disabled
				timeDelay={3000}
			>
				<Text
					numberOfLines={1}
					style={[
						{
							color: CommonStyle.fontColor,
							fontFamily: CommonStyle.fontPoppinsRegular,
							fontSize: CommonStyle.font13
						},
						extraStyles
					]}
				>
					{displayName}
				</Text>
			</TouchableOpacityOpt>
		</View>
	);
};

SubTitle = React.memo(SubTitle);

export default SubTitle;
