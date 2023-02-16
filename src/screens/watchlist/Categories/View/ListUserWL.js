import React, {
	useRef,
	useMemo,
	useImperativeHandle,
	useCallback,
	useEffect
} from 'react';
import { View, FlatList, Keyboard, Text } from 'react-native';
import { useSelector } from 'react-redux';
import Animated from 'react-native-reanimated';
import Row from './Row';
import TransformAnimation from '~s/watchlist/Animator/Animations';
import {
	getAniStyles,
	getAnimationType
} from '../Controller/AnimationController';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language';
import _ from 'lodash';
import { getActiveTabProperty } from '../Model/';
const { Value } = Animated;

const filterListUserWL = (priceBoard = {}, textSearch = '') => {
	// const favPriceBoard = priceBoard[WATCHLIST.USER_WATCHLIST]
	let listUserWL = [];
	Object.keys(priceBoard).map((item) => {
		try {
			const userWL = priceBoard[item] || {};
			const { watchlist_name: WLName = '' } = userWL || {};
			const isContainTextSearch = (WLName + '')
				.toUpperCase()
				.includes(textSearch.toUpperCase().trim());
			isContainTextSearch && listUserWL.push(userWL);
		} catch (error) {
			console.log(
				'FILTER LIST USER WL exception',
				error,
				item,
				priceBoard[item]
			);
		}
	});
	if (textSearch) {
		listUserWL = listUserWL.sort((a, b) => {
			const aLength = a.watchlist_name.length;
			const bLength = b.watchlist_name.length;
			return aLength - bLength;
		});
	}
	return listUserWL;
};

const ListUserWL = React.forwardRef(
	(
		{ changePriceBoardSelected, textSearch, priceBoardSelected, isIress },
		ref
	) => {
		const dic = useRef({
			init: true,
			timeout: null
		});
		const refAnimation = useRef({});
		const refTransformAnimation = useRef({});
		const priceBoard = useSelector(
			(state) => state.priceBoard.userPriceBoard
		);

		const timingValue = useMemo(() => {
			return new Value(0);
		}, []);
		const duration = 1000;
		const data = useMemo(() => {
			return filterListUserWL(priceBoard, textSearch);
		}, [priceBoard, textSearch]);
		useImperativeHandle(ref, () => {
			return {
				showCheckBox,
				hideCheckBox
			};
		});
		const showCheckBox = useCallback(() => {
			refAnimation.current.show && refAnimation.current.show();
		}, []);
		const hideCheckBox = useCallback(() => {
			refAnimation.current.hide && refAnimation.current.hide();
		}, []);
		const renderItem = useCallback(({ item, index }) => {
			const animationType = getAnimationType();
			const options = {
				duration,
				numberListDelay: 0, // after number list start ani
				itemDuration: 100,
				itemDelay: 50
			};
			let animStyles = {};
			if (index <= 12) {
				animStyles = getAniStyles(
					timingValue,
					animationType,
					index + 1,
					options
				);
			}

			const isFavorite = index === -1;
			return (
				<Row
					isIress={isIress}
					isFavorite={isFavorite}
					item={item}
					index={index}
					priceBoardSelected={priceBoardSelected}
					style={{
						marginTop: isFavorite || index === 0 ? 3 : 8,
						marginBottom: isFavorite ? 8 : 0
					}}
					animStyles={animStyles}
					changePriceBoardSelected={changePriceBoardSelected}
				/>
			);
		}, []);
		const renderFooter = () => {
			return (
				<View
					style={{
						width: '100%',
						height: 8,
						backgroundColor: CommonStyle.color.dark
					}}
				/>
			);
		};
		const start = () => {
			refTransformAnimation.current.start &&
				refTransformAnimation.current.start();
		};
		const _keyExtractor = (item) => `${item.watchlist}`;
		useEffect(() => {
			const { prevActiveTab, activeTab } = getActiveTabProperty();
			if (prevActiveTab === 1 && activeTab === 0) {
				// Nếu chuyển tab thì chạy lại animation do phần data lúc nào cũng có favorites
				dic.current.init && setTimeout(start, 0);
				dic.current.init = false;
			} else {
				if (dic.current.init) {
					// Chờ lấy all priceboard từ props
					dic.current.timeout && clearTimeout(dic.current.timeout);
					dic.current.timeout = setTimeout(start, 100);
					dic.current.init = false;
				}
			}
		}, [data]);
		const renderData = () => {
			if (_.isEmpty(data)) {
				return (
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text style={CommonStyle.textNoData}>
							{I18n.t('noData')}
						</Text>
					</View>
				);
			}

			return <FlatList
				onScrollBeginDrag={Keyboard.dismiss}
				keyboardShouldPersistTaps={'always'}
				data={data}
				extraData={textSearch}
				keyExtractor={_keyExtractor}
				renderItem={renderItem}
				ListFooterComponent={renderFooter}
			/>
		}

		return (
			<React.Fragment>
				<TransformAnimation
					ref={refTransformAnimation}
					value={timingValue}
					duration={duration}
				/>
				{/* {renderItem({
					item:
						priceBoard[WATCHLIST.USER_WATCHLIST] ||
						defaultFavourites,
					index: -1
				})} */}
				{/* <View style={{ height: 5 }} /> */}
				{renderData()}
			</React.Fragment>
		);
	}
);

export default ListUserWL;
