import React, {
	useImperativeHandle,
	forwardRef,
	useRef,
	useState,
	useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import isEqual from 'react-fast-compare';

import StreamingLv1 from '~/streaming/StreamComp/lv1';
import TradingPeriod from '~/streaming/StreamComp/tradingPeriod';

import watchListActions from './reducers';
import { switchForm } from '~/lib/base/functionUtil';
import PriceBoard from './handle_priceBoard_data';
import { useAppState, useNavigatorCallback } from './TradeList/tradelist.hook';

let HandleData = ({ setTimeUpdate, navigator, listSymbol: arrSymbol }, ref) => {
	const _lv1 = useRef();
	const _period = useRef();
	const [isLoading, setLoading] = useState(false);
	const dispatch = useDispatch();

	const changeLoadingState = (...p) =>
		dispatch(watchListActions.watchListChangeDetailLoadingState(...p));

	const getSnapshot = () => {
		setLoading(true);
		_lv1.current && _lv1.current.getSnapshot();
		_period.current && _period.current.getSnapshot();
	};

	// handle appstate change
	const appState = useAppState(() => {
		changeLoadingState(true, true);
		getSnapshot();
		setTimeUpdate && setTimeUpdate();
	});

	// handle change screen
	useNavigatorCallback(navigator, (e) => {
		if (e.type === 'DeepLink') {
			switchForm(navigator, e);
		}

		switch (e.id) {
			case 'didAppear':
				appState.addListener();
				break;
			case 'didDisappear':
				appState.removeListener();
				break;
			default:
				break;
		}
	});
	// handle loading
	const reduxLoad = useSelector((state) => state.watchlist3.isLoading);
	useEffect(() => {
		if (isLoading && !reduxLoad) {
			changeLoadingState(true);
		}
		if (!isLoading && reduxLoad) {
			changeLoadingState(false, true);
			setTimeUpdate && setTimeUpdate();
		}
	}, [isLoading, reduxLoad]);

	// handle data
	const value = useSelector((state) => {
		const {
			userPriceBoard,
			staticPriceBoard,
			priceBoardSelected
		} = state.priceBoard;
		const { value } =
			userPriceBoard[priceBoardSelected] ||
			staticPriceBoard[priceBoardSelected] ||
			{};

		return value;
	}, isEqual);
	const listSymbol = arrSymbol || value;

	// forward ref
	useImperativeHandle(ref, () => ({
		getSnapshot
	}));

	return (
		<React.Fragment>
			<PriceBoard />
			<StreamingLv1
				onChangeLoadingState={setLoading}
				ref={_lv1}
				listSymbol={listSymbol}
			/>
			<TradingPeriod ref={_period} listSymbol={listSymbol} />
		</React.Fragment>
	);
};

HandleData = forwardRef(HandleData);
HandleData = React.memo(HandleData);

export default HandleData;
