import React, {
	useRef,
	useMemo,
	useImperativeHandle,
	useCallback,
	useState,
	useEffect
} from 'react';
import { View, Text, Keyboard, Dimensions, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import Animated, { Easing } from 'react-native-reanimated';
import ENUM from '~/enum';
import Row from './Row';
import _ from 'lodash';
import {
	RecyclerListView,
	DataProvider,
	LayoutProvider
} from 'recyclerlistview';
import I18n from '~/modules/language';
import TransformAnimation from '~s/watchlist/Animator/Animations';
import {
	getAniStyles,
	getAnimationType
} from '../Controller/AnimationController';
import CommonStyle from '~/theme/theme_controller';
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const { WATCHLIST } = ENUM;
const { Value } = Animated;

const filterListSystemWL = (priceBoard = {}) => {
	const listSystemWL = [];
	Object.keys(priceBoard).map((item) => {
		const systemWL = priceBoard[item] || {};
		listSystemWL.push(systemWL);
	});
	return listSystemWL;
};

const filterListSystemWLByTextSearch = (
	allListSystemWL = [],
	textSearch = ''
) => {
	let listSystemWL = [];
	if (!textSearch) {
		return allListSystemWL;
	} else {
		const filterListSystemWL = allListSystemWL.filter((item) => {
			const { watchlist_name: WLName, watchlist } = item;
			const isContainTextSearch =
				(WLName + '')
					.toUpperCase()
					.includes(textSearch.toUpperCase()) ||
				watchlist.toUpperCase().includes(textSearch.toUpperCase());
			return isContainTextSearch;
		});
		listSystemWL = filterListSystemWL.sort((a, b) => {
			const aLength = a.watchlist_name.length;
			const bLength = b.watchlist_name.length;
			return aLength - bLength;
		});
	}
	return listSystemWL;
};

const ListSystemWL = React.forwardRef(
	({ changePriceBoardSelected, textSearch, priceBoardSelected }, ref) => {
		const priceBoard = useSelector(
			(state) => state.priceBoard.staticPriceBoard
		);
		const refTransformAnimation = useRef({});
		const dic = useRef({ init: true });
		const allListSystemWL = useMemo(() => {
			return filterListSystemWL(priceBoard);
		}, []);
		const data = useMemo(() => {
			return filterListSystemWLByTextSearch(allListSystemWL, textSearch && textSearch.trim());
		}, [textSearch]);
		const timingValue = useMemo(() => {
			return new Value(0);
		}, []);
		const duration = 1000;
		const start = () => {
			refTransformAnimation.current.start &&
				refTransformAnimation.current.start();
		};
		const stop = () => {
			refTransformAnimation.current.reset &&
				refTransformAnimation.current.reset();
		};
		useEffect(() => {
			if (data && data.length && dic.current.init) {
				setTimeout(start, 0);
				dic.current.init = false;
			}
		}, [data]);

		const _keyExtractor = (item, index) => `${item.watchlist}`;

		const renderRow = useCallback(({ item, index }) => {
			const animationType = getAnimationType();
			const options = {
				duration,
				numberListDelay: 0, // after number list start ani
				itemDuration: 100,
				itemDelay: 50
			};
			const animStyles =
				index <= 12
					? getAniStyles(timingValue, animationType, index, options)
					: {};
			return (
				<Row
					isIress
					isSystemWL
					item={item}
					index={index}
					style={{
						paddingVertical: 8,
						paddingHorizontal: 16,
						marginTop: index === 0 ? 3 : 8
					}}
					animStyles={animStyles}
					priceBoardSelected={priceBoardSelected}
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
				renderItem={renderRow}
				ListFooterComponent={renderFooter}
			/>
		}

		return (
			<View style={{ flex: 1 }}>
				<TransformAnimation
					ref={refTransformAnimation}
					value={timingValue}
					duration={duration}
				/>
				{renderData()}
			</View>
		);
	}
);

export default ListSystemWL;
