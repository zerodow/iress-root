import React, {
	useMemo,
	useState,
	useCallback,
	useRef,
	useImperativeHandle,
	useEffect
} from 'react';
import { Dimensions, Keyboard, View } from 'react-native';
import uuid from 'react-native-uuid';
import Animated from 'react-native-reanimated';
import AddToWLDetail from '~s/portfolio/View/AddToWL/AddToWLDetail';
import { useSetTextSearch } from '~s/portfolio/Hook/';
import AddToWLHeader from '~s/portfolio/View/AddToWL/AddToWLHeader';
import { addSymbolToYourWL } from '~s/portfolio/Controller/AddToWLController';
import BottomSheet from '~/component/bottom_sheet_reanimated/index_fix_keyboard';
import KeyboardAvoidView from '~/component/keyboard_avoid_view/index.js';
import { useDispatch } from 'react-redux';
import { getMarginTopDevice } from '~/lib/base/functionUtil';
import { changeIsSelector } from '../../Redux/actions';
const PANEL_PADDING_TOP = 48;
const marginTopPanel = getMarginTopDevice() + 32
const { height: DEVICE_HEIGHT } = Dimensions.get('window');
const { Value } = Animated;
export const useRefFakeView = () => {
	const refFakeView = useRef()
	const show = useCallback(() => {
		try {
			refFakeView.current.showFakeView()
		} catch (error) {

		}
	}, [])
	const hide = useCallback(() => {
		try {
			refFakeView.current.hideFakeView()
		} catch (error) {

		}
	}, [])
	return { refFakeView, show, hide }
}
export const FakeView = React.forwardRef((props, ref) => {
	const [isShow, setShow] = useState(false)
	const showFakeView = useCallback(() => {
		setShow(true)
	}, [])
	const hideFakeView = useCallback(() => {
		setShow(false)
	}, [])
	useImperativeHandle(ref, () => ({
		showFakeView, hideFakeView
	}))
	return (
		isShow && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 1, borderColor: 'transparent' }} />
	)
})
const AddToWL = React.forwardRef(({ showHideTabbar, zIndex = 100 }, ref) => {
	const [firstLoad, setfirstLoad] = useState(true);
	const [symbolInfo, setSymbolInfo] = useState({});
	const scrollValue = useMemo(() => new Value(0), []);
	const dispatch = useDispatch();
	const refNested = useRef({});
	const refHeader = useRef({});
	const refFakeView = useRef()

	useEffect(() => {
		const timmer = setTimeout(() => {
			setfirstLoad(false);
		}, 10);
		return () => {
			timmer && clearTimeout(timmer)
		};
	}, []);

	const [refContent, setTextSearch] = useSetTextSearch();
	const show = useCallback(({ symbol, exchange }) => {
		refNested.current && refNested.current.show && refNested.current.show();
		setTimeout(() => {
			refHeader.current && refHeader.current.showKeyboard && refHeader.current.showKeyboard();
		}, 300);
		setTimeout(() => {
			const firstKey = uuid.v4();
			setSymbolInfo({ symbol, exchange, firstKey });
		}, 10);
		showHideTabbar && showHideTabbar(0);
	}, []);
	useImperativeHandle(ref, () => {
		return { show };
	});
	const renderHeaderPanner = useCallback(() => {
		return (
			<AddToWLHeader
				ref={refHeader}
				setTextSearch={setTextSearch}
				onDone={onDone}
			/>
		);
	}, []);
	const onCloseDetailByScroll = useCallback(() => {
		Keyboard.dismiss();
		refHeader.current &&
			refHeader.current.resetData &&
			refHeader.current.resetData();
		refFakeView.current.hideFakeView()
	}, []);
	const onCloseDetail = useCallback(() => {
		Keyboard.dismiss();
		refHeader.current &&
			refHeader.current.resetData &&
			refHeader.current.resetData();
		refNested.current && refNested.current.hide && refNested.current.hide();
	}, []);
	const onDone = useCallback(() => {
		dispatch(changeIsSelector(false));
		onCloseDetail();
		addSymbolToYourWL();
	}, []);
	const onOpenEnd = () => {
		refFakeView.current.showFakeView()
	}
	const renderContent = useCallback(() => {
		return (
			<AddToWLDetail
				refContent={refContent}
				symbol={symbolInfo.symbol}
				exchange={symbolInfo.exchange}
				navigator={navigator}
				firstKey={symbolInfo.firstKey}
				onClose={onCloseDetail}
			/>
		);
	});

	if (firstLoad) return null;

	return (
		<KeyboardAvoidView
			pointerEvents={'box-none'}
			style={{
				position: 'absolute',
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				backgroundColor: 'transparent',
				zIndex,
				flex: 0
			}}
		>
			<FakeView ref={refFakeView} />
			<BottomSheet
				top={marginTopPanel}
				keyExtractor={symbolInfo}
				ref={refNested}
				onCloseEnd={onCloseDetailByScroll}
				onOpenEnd={onOpenEnd}
				onCloseStart={Keyboard.dismiss}
				// onOpenStart={() => console.info('onOpenStart')}
				snapPoints={[DEVICE_HEIGHT, -100]}
				scrollValue={scrollValue}
				renderContent={renderContent}
				renderHeader={renderHeaderPanner}
			/>
		</KeyboardAvoidView>
	);
});

export default React.memo(AddToWL, () => true);
