import React, {
	useCallback,
	useState,
	useRef,
	useImperativeHandle,
	forwardRef,
	useEffect
} from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import Animated from 'react-native-reanimated';

import Item from './Item';
import LazyList from './LazyList';
import HandleDataWithScroll from './HandleDataWithScroll';
import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux';
import { DelayComp } from '~s/watchlist';
import { handleShowAlertLog } from '~s/alertLog/Controller/SwitchController'

let MainList = (props, ref) => {
	const _scroll = useRef();
	const _listData = useRef();
	const { isLoadingErrorSystem } = useLoadingErrorSystem();
	const [_scrollValue] = useState(() => new Animated.Value(0));
	const [sizeMarketData, setSize] = useState(0);
	const [isLoadingState, setLoading] = useState(false);

	const [wrappedData, setData] = useState([]);
	const dicData = useRef([]);
	dicData.current = wrappedData;

	const dispatch = useDispatch();

	const getDataFromIndex = (index) => {
		const { marketData } = dicData.current[index] || {};
		const { symbol, exchange } = marketData;
		return { symbol, exchange };
	};

	const onDelete = useCallback(
		(index) => {
			// fix -> add callback when ended
			_listData.current &&
				_listData.current.onDelete(index, () => {
					dispatch.priceBoard.addOrRemoveSymbol(
						getDataFromIndex(index)
					);
				});
		},
		[_listData.current]
	);

	const onRowPress = useCallback((index) => {
		props.onRowPress && props.onRowPress(getDataFromIndex(index));
	}, []);
	// console.info(wrappedData, 'wrappedData')
	const onAddToWl = useCallback((index) => {
		props.onAddToWl && props.onAddToWl(getDataFromIndex(index));
	}, []);
	const onOpenNewOrder = useCallback((index) => {
		props.onOpenNewOrder &&
			props.onOpenNewOrder(getDataFromIndex(index));
	}, []);
	const onNewAlertLog = useCallback((index) => {
		const { symbol, exchange } = getDataFromIndex(index)
		handleShowAlertLog({ symbol, exchange })
	}, []);
	useImperativeHandle(ref, () => ({
		reset: () => {
			_scroll.current && _scroll.current.reset();
			_listData.current && _listData.current.reset();
		}
	}));

	useEffect(() => {
		!!_scroll.current &&
			!!_listData.current &&
			dispatch.subWatchlist.setResetListContent({
				func: () => {
					_scroll.current && _scroll.current.reset();
					_listData.current && _listData.current.reset();
				}
			});
	}, [!!_scroll.current, !!_listData.current]);

	const isLoading = isLoadingState || isLoadingErrorSystem;

	return (
		<React.Fragment>
			<DelayComp>
				<HandleDataWithScroll
					ref={_listData}
					_scrollValue={_scrollValue}
					setData={setData}
					setSize={setSize}
					setLoading={setLoading}
				/>
			</DelayComp>

			<DelayComp timeout={1000}>
				<LazyList
					_scroll={_scroll}
					_scrollValue={_scrollValue}
					sizeData={sizeMarketData}
					showSearch={props.showSearch}
					wrappedData={wrappedData}
					renderItem={(p) => (
						<DelayComp>
							<Item
								{...p}
								onDelete={onDelete}
								onRowPress={onRowPress}
								onAddToWl={onAddToWl}
								onPressNewOrder={onOpenNewOrder}
								onNewAlertLog={onNewAlertLog}
							/>
						</DelayComp>
					)} //  them props tu lazyList
					isLoading={isLoading}
				/>
			</DelayComp>
		</React.Fragment>
	);
};

MainList = forwardRef(MainList);
// MainList = React.memo(MainList);

export default MainList;
