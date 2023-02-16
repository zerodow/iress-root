import React, {
	useCallback,
	useRef,
	useMemo,
	useEffect,
	useLayoutEffect
} from 'react';
import { Text, View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import PropTypes from 'prop-types';
import HeaderNewOrder from './View/Header/HeaderPanel';
import Content from './View/Content/Content';
import BottomSheetBehavior, {
	useRefBottomSheet
} from '~/component/bottom_sheet_reanimated/index';
import KeyboardNewOrder from '~/screens/new_order/View/Keyboard/Keyboard.js';
import SearchAccountWrapper, {
	useRefSearchAccount
} from '~/component/search_account/SearchAccountWrapper';
import { reset as resetOrderInfo } from '~/screens/confirm_order/HandleGetInitialMargin';

import KeyboardAvoidView from '~/component/keyboard_avoid_view/index.js';
import HandleDisableTouchabled from '~/component/bottom_sheet_reanimated/HandleDisableTouchabled';
import { useDispatch } from 'react-redux';
import { getType } from '~/screens/new_order/Model/OrderEntryModel.js';
import { Navigation } from 'react-native-navigation';
import HandleDisabledButtonConfirm from '~/screens/new_order/HandleDisabledButtonConfirm.js';
import HandleFillDefaultLimitPriceFixedCo from '~/screens/new_order/HandleFillDefaultLimitPriceFixedCo.js';
import * as Business from '~/business';
import { dataStorage } from '~/storage';
import { getMarginTopDevice } from '~/lib/base/functionUtil';
import Enum from '~/enum';
import ScreenId from '~/constants/screen_id';
import * as InputModel from '~/screens/new_order/Model/InputModel.js';
import * as AttributeModel from '~/screens/new_order/Model/AttributeModel.js';

import {
	changeSymbolExchange,
	resetStateNewOrder
} from '~/screens/new_order/Redux/actions.js';
const { height: heightDevice } = Dimensions.get('window');
const { Value } = Animated;
const marginTopPanel = getMarginTopDevice() + 32;
const NewOrderWrapper = ({
	symbol,
	exchange,
	navigator,
	hideDetail,
	onHideAll,
	setSpaceTop
}) => {
	const { refBottomSheet, show, hide } = useRefBottomSheet();
	const {
		refSearchAccount,
		show: showSearchAccount,
		hide: hideSearchAccount
	} = useRefSearchAccount();
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(changeSymbolExchange({ symbol, exchange }));
		dataStorage.currentScreenId = ScreenId.ORDER;
		show && show();
		Business.showButtonConfirm();
		return () => {
			AttributeModel.detroy();
			InputModel.reset(); // Reset model when unmount new order
			dataStorage.isNeedSubSymbolOnNewOrder = true;
			dispatch(resetStateNewOrder());
			onHideAll && onHideAll();
		};
	}, []);
	useEffect(() => {
		resetOrderInfo();
	}, []);
	const { _scrollValue } = useMemo(() => {
		return {
			_scrollValue: new Value(0)
		};
	}, []);
	const handleHideNewOrder = useCallback(() => {
		Navigation.dismissModal({
			animated: false,
			animationType: 'none'
		});

		resetOrderInfo();
	}, []);
	const renderHeader = useCallback(() => {
		return (
			<HeaderNewOrder
				{...{ symbol, exchange, navigator, onClose: hide }}
			/>
		);
	}, [symbol, exchange]);
	const renderContent = useCallback(() => {
		return (
			<React.Fragment>
				{getType() !== Enum.AMEND_TYPE.DEFAULT && (
					<HandleDisabledButtonConfirm />
				)}
				{/* <HandleFillDefaultLimitPriceFixedCo symbol={symbol} exchange={exchange} /> */}
				<Content
					{...{
						symbol,
						_scrollValue,
						exchange,
						navigator,
						showSearchAccount
					}}
				/>
			</React.Fragment>
		);
	}, [symbol, exchange]);
	return (
		<KeyboardAvoidView
			style={{
				flex: 1,
				backgroundColor: 'transparent'
			}}
		>
			<BottomSheetBehavior
				keyExtractor={'NewOrder'}
				ref={refBottomSheet}
				onCloseEnd={handleHideNewOrder}
				// onOpenEnd={onShowDone}
				onCloseStart={() => console.info('onCloseStart')}
				onOpenStart={() => console.info('onOpenStart')}
				snapPoints={[heightDevice - marginTopPanel, -100]}
				// translateMaster={translateMaster}
				scrollValue={_scrollValue}
				renderContent={renderContent}
				renderHeader={renderHeader}
			/>
			<View
				pointerEvents={'box-none'}
				style={{
					zIndex: 9999,
					flex: 1
				}}
			>
				<KeyboardNewOrder navigator={navigator} />
			</View>
			<SearchAccountWrapper
				hideDetailPortfolio={hideDetail}
				setSpaceTop={setSpaceTop}
				style={{
					zIndex: 99999999
				}}
				ref={refSearchAccount}
			/>
			<HandleDisableTouchabled />
		</KeyboardAvoidView>
	);
};
NewOrderWrapper.propTypes = {};

export default NewOrderWrapper;
