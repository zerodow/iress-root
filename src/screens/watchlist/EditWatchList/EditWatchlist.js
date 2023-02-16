import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { cloneDeep } from 'lodash';
import { View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Content from './Views/Content/Content';
import Footer from './Views/Footer';
import Header from './Views/Header/Header';
import ConfirmDelete from '~/screens/watchlist/EditWatchList/Views/ConfirmDelete.js';
import KeyboardAvoidView from '~/component/keyboard_avoid_view/index.js';
import SafeArea from '~/component/safe_area/index.js';
import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js';
import * as ApiController from '~/screens/watchlist/EditWatchList/Controllers/ApiController.js';
import CommonStyle from '~/theme/theme_controller';
import {
	initialState,
	resetState
} from '~/screens/watchlist/EditWatchList/Redux/actions.js';

const EditWatchlist = ({ navigator }) => {
	const dispatch = useDispatch();
	const userWatchlist = useSelector(
		(state) => state.priceBoard.userPriceBoard
	);
	const systemWatchlist = useSelector(
		(state) => state.priceBoard.staticPriceBoard
	);
	let priceBoardSelected = useSelector(
		(state) => state.priceBoard.priceBoardSelected
	);
	const typePriceBoard = useSelector(
		(state) => state.priceBoard.typePriceBoard
	);
	const priceBoards = { ...userWatchlist, ...systemWatchlist };

	const curPriceBoard =
		userWatchlist[priceBoardSelected] ||
		systemWatchlist[priceBoardSelected] ||
		{};
	useMemo(() => {
		const tmp = cloneDeep(curPriceBoard);
		if (!tmp.value) tmp.value = [];
		curPriceBoard &&
			PriceBoardModel.initData({
				priceBoards: priceBoards,
				priceBoardSelected,
				priceBoard: tmp,
				typePriceBoard
			});

		const currentPriceBoardModel = PriceBoardModel.getPriceBoardCurrentPriceBoard();
		curPriceBoard &&
			dispatch(
				initialState({
					priceBoard: currentPriceBoardModel,
					keyTopIndex:
						currentPriceBoardModel &&
						currentPriceBoardModel.value &&
						currentPriceBoardModel.value[0]
							? `${currentPriceBoardModel.value[0]['exchange']}#${currentPriceBoardModel.value[0]['symbol']}`
							: null
					// keyTopIndex: 'ASX#XJO'
				})
			);
	}, [priceBoards, curPriceBoard]);

	const dic = useRef({
		updateRedux: null,
		isDeleted: false
	});
	const refConfirmDelete = useRef();

	const handleConfirmDeleteWatchlist = useCallback(() => {
		ApiController.deleteUserWL(({ updateRedux }) => {
			handleHideConfirm();
			dic.current.updateRedux = updateRedux;
			dic.current.isDeleted = true;
		});
	}, []);
	const handleShowConfirm = useCallback(() => {
		refConfirmDelete &&
			refConfirmDelete.current &&
			refConfirmDelete.current.show &&
			refConfirmDelete.current.show();
	}, []);
	const handleHideConfirm = useCallback(() => {
		navigator && navigator.pop();
		refConfirmDelete &&
			refConfirmDelete.current &&
			refConfirmDelete.current.show &&
			refConfirmDelete.current.hide();
	}, []);
	useEffect(() => {
		return () => {
			dic.current.isDeleted &&
				dic.current.updateRedux &&
				dic.current.updateRedux(); // Cho no un mount roi moi update state redux. Bug a few hook
			dispatch(resetState());
			PriceBoardModel.resetModel();
		};
	}, []);
	return (
		<SafeArea>
			<KeyboardAvoidView>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View
						style={{
							flex: 1,
							backgroundColor: CommonStyle.backgroundColor
						}}
					>
						<Header navigator={navigator} />
						<Content />
						<Footer
							onShowConfirmDeleteWatchlist={handleShowConfirm}
						/>
						<ConfirmDelete
							ref={refConfirmDelete}
							onConfirm={handleConfirmDeleteWatchlist}
						/>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidView>
		</SafeArea>
	);
};
EditWatchlist.propTypes = {};
EditWatchlist.defaultProps = {};

export default EditWatchlist;
