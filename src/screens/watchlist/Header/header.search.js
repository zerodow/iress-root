import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
	useImperativeHandle
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { cloneDeep, pickBy, map, values } from 'lodash';
import isEqual from 'react-fast-compare';

import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Platform,
	Dimensions,
	TouchableOpacity
} from 'react-native';
import I18n from '~/modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
import SvgIcon from '~s/watchlist/Component/Icon2';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js';
import * as PureFunc from '~/utils/pure_func';
import { Navigation } from 'react-native-navigation';
import * as FunctionUtil from '~/lib/base/functionUtil';
import ENUM from '~/enum';
import * as Controller from '~/memory/controller';
import WatchlistActions from '~s/watchlist/reducers';
import CONFIG from '~/config';
import * as Business from '~/business';
import * as ContentModel from '~/component/add_symbol/Models/Content.js';

const { TIME_DELAY, NAME_PANEL } = ENUM;
export function getLocalDataSelected({
	listSymbolExchange = { 'BHP#ASX': true }
}) {
	try {
		listSymbolExchange = pickBy(listSymbolExchange, (e) => {
			return e;
		});
		listSymbolExchange = Object.keys(listSymbolExchange).map((el, key) => {
			const [symbol, exchange] = el.split('#');
			return {
				symbol,
				exchange,
				rank: key
			};
		});

		return PriceBoardModel.extractObjectdata({
			value: listSymbolExchange
		});
	} catch (error) {
		return {};
	}
}

let SearchBar = (props, ref) => {
	const {
		userPriceBoard,
		staticPriceBoard,
		priceBoardSelected,
		typePriceBoard
	} = useSelector((state) => state.priceBoard, isEqual);

	const dispatch = useDispatch();

	const curPriceBoard =
		userPriceBoard[priceBoardSelected] ||
		staticPriceBoard[priceBoardSelected] ||
		{};

	const dicSymbolSelected =
		Object.keys(curPriceBoard).length > 0
			? PriceBoardModel.getDicSymbolSelected(curPriceBoard)
			: {};

	const { searchWrapperStyles, showDetail } = props;

	const onDone = useCallback((listSymbolExchange) => {
		const value = values(
			getLocalDataSelected({
				listSymbolExchange
			})
		);

		dispatch.priceBoard.updateSpecifyPriceBoard({
			value,
			isRecallApi: false
		});
	}, []);

	const onSelectedSymbol = useCallback(
		({ symbol, exchange }) => {
			showDetail &&
				showDetail({
					symbol,
					exchange,
					handleShowAddSymbol,
					priceBoardSelected
				});
			// Call api market-info/symbol to get market_cap / pe_ratio / yearlyend_dividend
			dispatch.marketInfo.getSymbolInfo({ symbol, exchange });
		},
		[dicSymbolSelected, priceBoardSelected]
	);
	const { searchWrapper, iconLeft, textInput } = styles;
	const { disabled } = useMemo(() => {
		return {
			disabled: typePriceBoard === ENUM.TYPE_PRICEBOARD.IRESS
		};
	}, [typePriceBoard]);
	const handleShowAddSymbol = useCallback(
		(isSyncDicSymbolSelected = false) => {
			// Khi show bằng navigation thì nó gán function với dependencies tại thời điểm đấy, nên khi vào sec detail add / remove favorites rồi done thì vẫn chưa update dic symbol mới
			const newDicSymbolSelected = isSyncDicSymbolSelected
				? ContentModel.getSymbolSelected()
				: dicSymbolSelected;
			Controller.setStatusModalCurrent(true);
			dispatch.subWatchlist.resetActions();
			Navigation.showModal({
				screen: 'equix.SingleBottomSheet',
				animated: false,
				animationType: 'none',
				navigatorStyle: {
					...CommonStyle.navigatorModalSpecialNoHeader,
					modalPresentationStyle: 'overCurrentContext'
				},
				overrideBackPress: true,
				passProps: {
					namePanel: NAME_PANEL.ADD_AND_SEARCH,
					isSwitchFromQuickButton: true,
					enabledGestureInteraction: false,
					onDone: onDone,
					dicSymbolSelected: { ...newDicSymbolSelected },
					onSelectedSymbol,
					disableSelected: disabled,
					priceBoardSelected
				}
			});
		},
		[dicSymbolSelected, priceBoardSelected]
	);
	useImperativeHandle(ref, () => {
		return { showSearch: handleShowAddSymbol }
	})
	return (
		<View style={{ width: '100%' }}>
			<TouchableOpacityOpt
				timeDelay={3000}
				hitSlop={{
					top: 8,
					left: 8,
					right: 8,
					bottom: 8
				}}
				onPress={handleShowAddSymbol}
			>
				<View style={[searchWrapper, searchWrapperStyles]}>
					<CommonStyle.icons.searchWl
						name={'search'}
						size={17}
						color={CommonStyle.fontColor}
						style={{ marginLeft: 8, marginRight: 8 }}
					/>
					<Text
						style={[
							textInput,
							{ color: CommonStyle.searchPlaceHolderColor }
						]}
					>
						{I18n.t('textSearchButton')}
					</Text>
				</View>
			</TouchableOpacityOpt>
		</View>
	);
};
const styles = {};

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		wrapper: {
			flexDirection: 'row',
			paddingTop:
				Platform.OS === 'ios'
					? FunctionUtil.isIphoneXorAbove()
						? 38
						: 16
					: 0,
			marginTop: 16,
			height:
				Platform.OS === 'ios'
					? FunctionUtil.isIphoneXorAbove()
						? 48 + 38
						: 64
					: 48,
			marginLeft: 32,
			marginRight: 16,
			marginBottom: 8
		},
		title: {
			fontFamily: CommonStyle.fontPoppinsBold,
			fontSize: CommonStyle.fontSizeXXL,
			color: CommonStyle.navigatorSpecial.navBarSubtitleColor
			// width: width * 0.7
		},
		searchWrapper: {
			flexDirection: 'row',
			backgroundColor: CommonStyle.backgroundNewSearchBar,
			borderRadius: 8,
			alignItems: 'center',
			marginHorizontal: 8,
			paddingVertical: 8
		},
		textInput: {
			width: '70%',
			color: CommonStyle.fontColor,
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeXS1
		},
		buttonCancel: {
			justifyContent: 'center',
			flex: 1,
			marginLeft: 16
		},
		textCancel: {
			textAlign: 'center',
			color: CommonStyle.fontColor,
			fontFamily: CommonStyle.fontPoppinsBold,
			fontSize: CommonStyle.fontSizeS
		},
		iconRight: {}
	});

	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

SearchBar = React.forwardRef(SearchBar)
SearchBar = React.memo(SearchBar);
export default SearchBar;
