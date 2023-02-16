import React, { useState, useEffect, useRef, useCallback } from 'react';
import _, { debounce } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native';
import isEqual from 'react-fast-compare';

import CreateNewWLButton from '../Categories/View/CreateNewWLButton';
import ListContent from './ListContent';
import { useNavigator, useAppState } from './tradelist.hook';
import { DelayComp } from '~s/watchlist';
import * as Controller from '~/memory/controller';

const usePriceBoardData = () => {
	const [isStateChanged, changeState] = useState(0);
	useAppState(() => changeState((p) => p + 1));

	const dispatch = useDispatch();
	const isConnected = useSelector((state) => state.app.isConnected);

	const getUserPriceBoard = () => dispatch.priceBoard.getUserPriceBoard();
	const getStaticPriceBoard = () => dispatch.priceBoard.getStaticPriceBoard();

	useEffect(() => {
		const isLogin = Controller.getLoginStatus();
		isLogin && getStaticPriceBoard();
	}, []);

	useEffect(() => {
		const isLogin = Controller.getLoginStatus();
		isConnected && isLogin && getUserPriceBoard();
	}, [isConnected, isStateChanged]);
};

let dicListSymbol = [];

export const useSubData = (navigator) => {
	const dispatch = useDispatch();

	const listSymbol = useSelector((state) => {
		const { userPriceBoard, staticPriceBoard, priceBoardSelected } =
			state.priceBoard;
		const { value = [] } =
			userPriceBoard[priceBoardSelected] ||
			staticPriceBoard[priceBoardSelected] ||
			{};

		return value;
	}, isEqual);

	const unSub = debounce(
		() => {
			dispatch.quotes.unSubMultiply({
				listSymbol: dicListSymbol
			});
		},
		300,
		{ leading: false }
	);

	const sub = debounce(
		(symbols) => {
			dispatch.quotes.subMultiply({
				listSymbol: symbols || dicListSymbol
			});
		},
		300,
		{ leading: false }
	);

	const getAndSub = debounce(
		() =>
			dispatch.quotes.getSnapshot({
				listSymbol: dicListSymbol,
				cb: sub
			}),
		500,
		{ leading: false }
	);

	useEffect(() => {
		if (!_.isEqual(dicListSymbol, listSymbol)) {
			unSub();
			dicListSymbol = listSymbol;
			getAndSub();
		}
	}, [listSymbol]);

	useEffect(() => unSub, []);

	return {
		unSub,
		getAndSub
	};
};

let TradeList = ({
	navigator,
	onAddToWl,
	onRowPress,
	onOpenNewOrder,
	showSearch
}) => {
	usePriceBoardData();
	// useLv1Data();

	// useEffect(() => {
	// 	setTimeout(() => {
	// 		console.log('vo day 1');
	// 		setfirstLoad(false);
	// 	}, 1000);

	// 	// return () => {
	// 	// 	console.info('vo day');
	// 	// 	timmer && clearTimeout(timmer);
	// 	// };
	// }, []);
	const isEmpty = useSelector((state) => {
		const { userPriceBoard, staticPriceBoard, priceBoardSelected } =
			state.priceBoard;
		const noUserPriceboard = _.isEmpty(userPriceBoard);
		const isStaticPriceboard = staticPriceBoard[priceBoardSelected];

		return noUserPriceboard && !isStaticPriceboard;
	});

	// else if (typePriceBoard === ENUM.TYPE_PRICEBOARD.IRESS || !isEmpty) {
	// 	content = (
	// 		<ListContent
	// 			onAddToWl={onAddToWl}
	// 			onRowPress={onRowPress}
	// 			onOpenNewOrder={onOpenNewOrder}
	// 		/>
	// 	);
	// } else {
	// 	content = (
	// 		<CreateNewWLButton
	// 			isMainWatchlist
	// 			navigator={navigator}
	// 			isEmpty={isEmpty}
	// 		/>
	// 	);
	// }
	if (isEmpty) {
		return (
			<CreateNewWLButton
				isMainWatchlist
				navigator={navigator}
				isEmpty={isEmpty}
			/>
		);
	}
	return (
		<View style={{ zIndex: -9, flex: 1 }}>
			<DelayComp>
				<ListContent
					onAddToWl={onAddToWl}
					onRowPress={onRowPress}
					onOpenNewOrder={onOpenNewOrder}
					showSearch={showSearch}
				/>
			</DelayComp>
		</View>
	);
};

export default TradeList;
