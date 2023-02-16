import { useEffect } from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { getLoginStatus } from '~/memory/controller'
import { useAppState, useConnect } from './TradeList/tradelist.hook';

export default () => {
	const dispatch = useDispatch();

	const getUserPriceBoard = () => dispatch.priceBoard.getUserPriceBoard();
	const getStaticPriceBoard = () => dispatch.priceBoard.getStaticPriceBoard();

	// sub appstate change
	useAppState(getUserPriceBoard);
	// sub connect change
	useConnect(getUserPriceBoard);

	useEffect(() => {
		const isLogin = getLoginStatus()
		if (!isLogin) return
		getUserPriceBoard();
		getStaticPriceBoard();
	}, []);

	return null;
};
