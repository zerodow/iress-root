import React, {
	useCallback,
	useMemo,
	useState,
	useRef,
	useImperativeHandle,
	useContext,
	useEffect
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import AddSymbolButton from './AddSymbolButton';
import DeleteSymbolButton from './DeleteSymbolButton';
import {
	getCompanyNameByKey,
	getCurrencyByKey,
	getFlagByCurrency,
	getDisplayNameByKey
} from '~/business';
import ExtraSvgIcon from '~/component/svg_icon/SvgIcon';
import SvgIcon from '~s/watchlist/Component/Icon2';
import ENUM from '~/enum';
import CommonStyle from '~/theme/theme_controller';
import _ from 'lodash';
import {
	updateListSymbolAdded,
	setDeleteButtonStatus,
	reRangerListSymbolAdded
} from '../Redux/actions';
import Shadow, { shadowOpt } from '~/component/shadow';
import SortableList from '~/component/sort_able/index';
import Entypo from 'react-native-vector-icons/Entypo';
import Animated from 'react-native-reanimated';
import { useTiming } from '~/component/custom_hook/';
import { CreatePriceBoardContext } from '~s/watchlist/Categories/View/CreatePriceBoard';
import IconGoToTop from '~/img/icon/noun_uploads.png';
const { Code, Clock, Value, createAnimatedComponent, block } = Animated;
const STATE_ANIM = {
	UNDETERMINE: 0,
	START: 1,
	STOP: 2
};
const TouchableOpacityAnim = createAnimatedComponent(TouchableOpacity);
const { FLAG, DELETE_BUTTON_STATUS } = ENUM;
const CHECKBOX_ROUNDED_STATUS = {
	UNTICK: false,
	TICK: true
};

const AnimationComp = React.forwardRef((props, ref) => {
	const { hoverCompTranslateYVal, distanceFromTop, onEndAnimation } = props;
	const dic = useRef({
		animClock: new Clock()
	});
	const stateAnim = useMemo(() => new Value(STATE_ANIM.UNDETERMINE), []);
	const blockTimingTranslateY = useMemo(
		() =>
			useTiming({
				clock: dic.current.animClock,
				value: hoverCompTranslateYVal,
				dest: distanceFromTop,
				stateAnim,
				onEndAnimation,
				duration: 300
			}),
		[hoverCompTranslateYVal]
	);
	const start = useCallback((distance) => {
		distanceFromTop.setValue(distance);
		stateAnim.setValue(STATE_ANIM.START);
	}, []);
	const stop = useCallback(() => {
		stateAnim.setValue(STATE_ANIM.STOP);
	}, []);
	useImperativeHandle(ref, () => ({
		start,
		stop
	}));
	return <Code exec={block([blockTimingTranslateY])} />;
});

const Footer = (props) => {
	const setting = {
		...shadowOpt,
		radius: 0,
		border: 3
	};
	return (
		<View>
			<Shadow setting={setting} />
			<View
				style={{
					paddingTop: 8,
					paddingBottom: 30,
					paddingHorizontal: 8,
					flexDirection: 'row',
					justifyContent: props.isEmpty ? 'center' : 'space-between'
				}}
			>
				<AddSymbolButton {...props} />
				<DeleteSymbolButton {...props} />
			</View>
		</View>
	);
};

const CheckBox = React.forwardRef((props, ref) => {
	const { onCheck: onCheckParent, item, checkHoverActive } = props;
	const defaultActive = checkHoverActive({ key: item });
	const [status, setStatus] = useState(defaultActive);
	const onCheck = useCallback(() => {
		onCheckParent && onCheckParent();
		setStatus((prevStatus) => !prevStatus);
	}, status);
	const IconCheck = useCallback(() => {
		switch (status) {
			case CHECKBOX_ROUNDED_STATUS.TICK:
				return <CommonStyle.icons.tick
					// color={CommonStyle.color.icon}
					style={{ textAlign: 'center', marginLeft: 8 }}
					size={24}
				/>
			default:
				return <CommonStyle.icons.unTick
					// color={CommonStyle.color.icon}
					style={{ textAlign: 'center', marginLeft: 8 }}
					size={24}
				/>
		}
	}, [status]);
	useImperativeHandle(ref, () => {
		return {
			onCheck
		};
	});
	return (
		<TouchableOpacity
			onPress={onCheck}
			style={{
				marginTop: 8,
				justifyContent: 'center',
				width: 24 + 8
			}}
		>

			{/* <CommonStyle.icons.closeIconR
				color={iconProperty.iconColor}
				style={{ textAlign: 'center' }}
				size={17}
			/> */}
			{/* <SvgIcon
				color={iconProperty.iconColor}
				name={iconProperty.iconName}
				size={24}
				style={{ paddingLeft: 8 }}
			/> */}
			<IconCheck />
		</TouchableOpacity>
	);
});

const DragIcon = (props) => {
	return <Entypo name={'menu'} color={CommonStyle.fontColor} size={15} />;
};

const GoToTopIcon = (props) => {
	const { getLayoutHeader, updateListAnimConfig } = useContext(
		CreatePriceBoardContext
	);
	const {
		item,
		index,
		showHoverComp,
		refRow,
		hideRow,
		drag,
		refDragableFlatList
	} = props;
	const dispatch = useDispatch();
	const firstIndex = useSelector((state) => state.categoriesWL.firstIndex);
	const isShowGoToTopIcon = useMemo(() => {
		return item !== firstIndex;
	}, [item, firstIndex]);
	// const {
	//     touchAbsolute, activeIndex, isHovering, panGestureState, hasMoved, activationDistance, disabled, state,
	//     spacerIndex
	// } = refDragableFlatList.current || {}
	// let sIndex = 3
	// let interval = null
	return isShowGoToTopIcon ? (
		<TouchableOpacity
			onPress={() => {
				dispatch(reRangerListSymbolAdded(item));
				refDragableFlatList.current.refFlatlist.current._component
					.scrollToIndex &&
					refDragableFlatList.current.refFlatlist.current._component.scrollToIndex(
						{ animated: true, index: 0 }
					);
			}}
		>
			<ExtraSvgIcon
				name={'nounUpload'}
				color={CommonStyle.fontColor}
				size={16}
				style={{ marginRight: 16 }}
			/>
		</TouchableOpacity>
	) : null;
};

const FlagIcon = (props) => {
	const { keyInfo } = props;
	const currency = getCurrencyByKey({ key: keyInfo });
	const flagIcon = getFlagByCurrency(currency);
	const iconName = flagIcon === FLAG.AU ? 'auFlag' : FLAG.US ? 'usFlag' : '';
	return (
		<ExtraSvgIcon name={iconName} size={18} style={{ marginRight: 8 }} />
	);
};

const SymbolInfo = (props) => {
	const { keyInfo } = props;
	const displayName = getDisplayNameByKey({ key: keyInfo });
	const company = getCompanyNameByKey({ key: keyInfo });
	return (
		<View style={{ flex: 1 }}>
			<Text
				style={{
					fontSize: CommonStyle.font15,
					fontFamily: CommonStyle.fontPoppinsBold,
					color: CommonStyle.fontColor
				}}
			>
				{displayName}
			</Text>
			<Text
				numberOfLines={1}
				style={{
					fontSize: CommonStyle.fontTiny,
					fontFamily: CommonStyle.fontPoppinsRegular,
					color: CommonStyle.fontColor,
					opacity: 0.5
				}}
			>
				{company}
			</Text>
		</View>
	);
};

const LeftComp = (props) => {
	const {
		item,
		index,
		onCheck,
		refCheckbox,
		isActive,
		checkHoverActive
	} = props;
	return (
		<CheckBox
			checkHoverActive={checkHoverActive}
			item={item}
			isActive={isActive}
			ref={refCheckbox}
			index={index}
			onCheck={onCheck}
		/>
	);
};
const ButtonGoToTop = ({ onPress }) => {
	return (
		<TouchableOpacity
			hitSlop={{
				top: 16,
				left: 16,
				right: 16,
				bottom: 16
			}}
			onPress={onPress}
		>
			<Image
				style={{
					width: 15,
					height: 15,
					marginRight: 16
				}}
				width={15}
				height={15}
				source={IconGoToTop}
			/>
		</TouchableOpacity>
	);
};
const RightComp = (props) => {
	const { item, dragGoToTop } = props;
	const firstIndex = useSelector((state) => state.categoriesWL.firstIndex);
	const isShowGoToTopIcon = useMemo(() => {
		return item !== firstIndex;
	}, [item, firstIndex]);
	return (
		<View
			style={{
				flex: 1,
				marginTop: 8,
				marginHorizontal: 8,
				paddingVertical: 8,
				paddingHorizontal: 16,
				borderRadius: 8,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				borderColor: CommonStyle.color.dusk_tabbar,
				borderWidth: 1
			}}
		>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					flex: 1.4
				}}
			>
				{/* <FlagIcon keyInfo={item} /> */}
				<SymbolInfo keyInfo={item} />
			</View>
			<View
				style={{
					flex: 0.6,
					flexDirection: 'row',
					justifyContent: 'flex-end'
				}}
			>
				{isShowGoToTopIcon && <ButtonGoToTop onPress={dragGoToTop} />}
				<DragIcon />
			</View>
		</View>
	);
};

const Row = React.memo(
	(props) => {
		const {
			item,
			index,
			syncDicAdded,
			drag,
			showHoverComp,
			refDragableFlatList,
			isActive,
			checkHoverActive,
			dragGoToTop
		} = props; // Exp: BHP#ASX: true
		const refRow = useRef({});
		const refCheckbox = useRef({});
		const opacityValue = useMemo(() => new Value(1), []);
		const hideRow = useCallback(() => {
			opacityValue.setValue(0);
		}, []);
		const onCheck = useCallback(() => {
			syncDicAdded({ key: item });
		}, [item]);
		const onCheckRow = useCallback(() => {
			refCheckbox.current &&
				refCheckbox.current.onCheck &&
				refCheckbox.current.onCheck();
		}, []);
		return (
			<View
				style={{
					flex: 1,
					width: '100%',
					backgroundColor: CommonStyle.backgroundColor
				}}
				ref={refRow}
			>
				<TouchableOpacityAnim
					onPress={onCheckRow}
					onLongPress={drag}
					style={[{ flexDirection: 'row', opacity: opacityValue }]}
				>
					<LeftComp
						item={item}
						checkHoverActive={checkHoverActive}
						isActive={isActive}
						refCheckbox={refCheckbox}
						index={index}
						onCheck={onCheck}
					/>
					<RightComp
						item={item}
						index={index}
						dragGoToTop={dragGoToTop}
						drag={drag}
						refRow={refRow}
						hideRow={hideRow}
						refDragableFlatList={refDragableFlatList}
						showHoverComp={showHoverComp}
					/>
				</TouchableOpacityAnim>
			</View>
		);
	},
	(pre, next) => pre.item === next.item
);

const HoverComp = React.forwardRef((props, ref) => {
	const dic = useRef({});
	const refAnimation = useRef({});
	const {
		renderItem,
		translateYValue = new Value(0),
		distanceFromTop = new Value(0)
	} = props;
	const [isShow, setShow] = useState(false);
	const dispatch = useDispatch();
	useImperativeHandle(ref, () => ({ show, hide }));
	const show = useCallback(({ item, index, style, distanceFromTop }) => {
		dic.current = { ...dic.current, item, index, style, distanceFromTop };
		setShow(true);
	}, []);
	const hide = useCallback(() => {
		setShow(false);
	}, []);
	const onEndAnimation = useCallback(() => {
		hide();
		dispatch(reRangerListSymbolAdded(dic.current.item));
	}, []);
	useEffect(() => {
		if (isShow) {
			refAnimation.current.start &&
				refAnimation.current.start(dic.current.distanceFromTop);
		} else {
			// Reset animation
			translateYValue.setValue(0);
			distanceFromTop.setValue(0);
		}
	}, [isShow]);
	return (
		<React.Fragment>
			<AnimationComp
				ref={refAnimation}
				onEndAnimation={onEndAnimation}
				distanceFromTop={distanceFromTop}
				hoverCompTranslateYVal={translateYValue}
			/>
			{isShow ? (
				<Animated.View
					pointerEvents={'none'}
					style={[
						{
							transform: [{ translateY: translateYValue }],
							position: 'absolute',
							top: 0, // Optinal when click to index
							right: 0,
							left: 0
						},
						dic.current.style
					]}
				>
					{renderItem({
						item: dic.current.item,
						index: dic.current.index
					})}
				</Animated.View>
			) : null}
		</React.Fragment>
	);
});

const ListSymbol = (props) => {
	const { navigator, showHide } = props;
	const dic = useRef({
		dicRemoved: {}
	});
	const refHoverComp = useRef({});
	const refDragableFlatList = useRef({});
	const checkHoverActive = ({ key }) => {
		console.info('DCM checkHoverActive', key, dic.current.dicRemoved);
		if (dic.current.dicRemoved[key]) {
			return true;
		}
		return false;
	};
	const syncDeleteButtonStatus = () => {
		let deleteButtonStatus = DELETE_BUTTON_STATUS.DELETE_ALL;
		for (const key in dic.current.dicRemoved) {
			if (dic.current.dicRemoved[key]) {
				deleteButtonStatus = DELETE_BUTTON_STATUS.DELETE;
				break;
			}
		}
		dispatch(setDeleteButtonStatus(deleteButtonStatus)); // Change to delete all
	};
	const clearDicRemovedLocal = () => {
		dic.current.dicRemoved = {};
	};
	const dispatch = useDispatch();
	const dicSymbolAdded = useSelector(
		(state) => state.categoriesWL.dicSymbolAdded
	);
	const onDelete = useCallback(
		(isDeleteAll) => {
			let newDicSymbolAdded = {};
			if (!isDeleteAll) {
				const dicSymbolRemoved = _.pickBy(
					dic.current.dicRemoved,
					(value, key) => {
						return value;
					}
				);
				newDicSymbolAdded = _.pickBy(dicSymbolAdded, (value, key) => {
					return !dicSymbolRemoved[key];
				});
			}
			clearDicRemovedLocal();
			dispatch(setDeleteButtonStatus(DELETE_BUTTON_STATUS.DELETE_ALL)); // Change to delete all
			dispatch(updateListSymbolAdded(newDicSymbolAdded));
		},
		[dicSymbolAdded]
	);
	const syncDicAdded = useCallback(({ key }) => {
		// Update dic added
		let newStatus = false;
		if (!dic.current.dicRemoved[key]) {
			newStatus = true;
		}
		dic.current.dicRemoved[key] = newStatus;
		syncDeleteButtonStatus();
	}, []);
	const showHoverComp = useCallback(
		({ item, index, style, distanceFromTop }) => {
			refHoverComp.current.show &&
				refHoverComp.current.show({
					item,
					index,
					style,
					distanceFromTop
				});
		},
		[]
	);
	const hideHoverComp = useCallback(() => {
		refHoverComp.current.hide && refHoverComp.current.hide();
	}, []);
	const data = useMemo(() => Object.keys(dicSymbolAdded), [dicSymbolAdded]);
	const translateYValue = useMemo(() => new Value(0), []);
	const distanceFromTop = useMemo(() => new Value(0), []);
	const activeIndex = useMemo(() => new Value(-1), []);
	const renderItem = useCallback(
		({
			item,
			index,
			isActive,
			isHover = false,
			onDrag = () => { },
			dragGoToTop
		}) => {
			return (
				<Row
					checkHoverActive={checkHoverActive}
					translateYValue={translateYValue}
					isHover={isHover}
					isActive={isActive}
					refDragableFlatList={refDragableFlatList}
					showHoverComp={showHoverComp}
					hideHoverComp={hideHoverComp}
					drag={onDrag}
					dragGoToTop={dragGoToTop}
					item={item.data}
					index={index}
					syncDicAdded={syncDicAdded}
				/>
			);
		},
		[data.length]
	);
	const onDragEnd = useCallback((data) => {
		const newDicSymbolAdded = {};
		data.map((item, index) => {
			newDicSymbolAdded[item.data] = true;
		});
		dispatch(updateListSymbolAdded(newDicSymbolAdded));
	}, []);
	const handleUpdateTopIndex = useCallback(
		({ newData = [], keyTopIndex, itemTop }) => {
			const newDicSymbolAdded = {};
			newData.map((item, index) => {
				newDicSymbolAdded[item.data] = true;
			});
			dispatch(updateListSymbolAdded(newDicSymbolAdded));
		},
		[]
	);
	const keyExtractor = useCallback(
		(item) => `draggable-item-${item.data}`,
		[]
	);
	const unmount = () => {
		console.info('CREATE NEW WL unmount');
		clearDicRemovedLocal();
		dispatch(setDeleteButtonStatus(DELETE_BUTTON_STATUS.DELETE_ALL)); // Change to delete all
		dispatch(updateListSymbolAdded({}));
	};
	useEffect(() => {
		console.info('CREATE NEW WL didmount');
		return unmount;
	}, []);
	const extraData = data.map((el) => ({
		data: el,
		key: keyExtractor({ data: el })
	}));
	const isEmpty = _.size(extraData) < 1;
	return (
		<React.Fragment>
			<View style={{ flex: 1 }}>
				<AddSymbolButton
					isOnMain
					navigator={navigator}
					isEmpty={isEmpty}
					showHide={showHide}
				/>
				<SortableList
					keyExtractor={keyExtractor}
					data={extraData}
					renderItem={renderItem}
					onDragEnd={onDragEnd}
					onChangeKeyTopIndex={handleUpdateTopIndex}
				/>
				<Footer
					navigator={navigator}
					onDelete={onDelete}
					isEmpty={isEmpty}
				/>
			</View>
		</React.Fragment>
	);
};

ListSymbol.defaultProps = {
	duration: 300
};

export default ListSymbol;
