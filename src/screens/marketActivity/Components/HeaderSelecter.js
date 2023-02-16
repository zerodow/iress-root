import React, {
	useRef,
	useState,
	useEffect,
	useCallback,
	forwardRef,
	useImperativeHandle,
	useLayoutEffect
} from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableWithoutFeedback,
	TouchableOpacity,
	ScrollView,
	Dimensions
} from 'react-native';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';

import { shallowEqual, useSelector } from 'react-redux';
import { useShadow } from '~/component/shadow/SvgShadow';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { useModal2 } from '~/component/Modal';

const { width: DEVICE_WIDTH } = Dimensions.get('window');
const DEFAULT_NUMBER_ROW = 9.5;
const DEFAULT_HEIGHT_ROW = 31;
const DEFAULT_MAX_HEIGHT = DEFAULT_NUMBER_ROW * DEFAULT_HEIGHT_ROW;

const Button = ({
	style,
	title,
	withIcon = false,
	onPress,
	containerStyles,
	onLayout,
	data
}) => {
	const { visiable } = useSelector((state) => {
		return {
			visiable: state.modalRematch.visiable
		};
	}, shallowEqual);
	return (
		<View style={style} onLayout={onLayout}>
			<TouchableWithoutFeedback
				onPress={onPress}
				disabled={data && withIcon}
			>
				<View
					style={[
						styles.buttonContainer,
						containerStyles,
						{
							backgroundColor: visiable
								? CommonStyle.color.bg
								: CommonStyle.color.dark
						}
					]}
				>
					<Text
						style={[
							styles.buttonTitle,
							{
								color: withIcon
									? CommonStyle.color.modify
									: CommonStyle.fontWhite
								// opacity: title ? 1 : 0 // Bug khong hien thi text tren android
							}
						]}
					>
						{title || ''}
					</Text>
					{withIcon && (
						<Icon
							name={data ? 'check' : 'caret-down'}
							size={8}
							color={CommonStyle.color.modify}
						/>
					)}
				</View>
			</TouchableWithoutFeedback>
		</View>
	);
};

const userMeasured = (node) => {
	const [curMeasure, setMeasure] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0
	});

	const onLayout = () => {
		const cb = (x, y, width, height, pageX, pageY) => {
			if (
				curMeasure.x !== x ||
				curMeasure.y !== y ||
				curMeasure.width !== width ||
				curMeasure.height !== height
			) {
				setMeasure({ x: pageX, y: pageY, width, height });
			}
		};
		node && node().measure(cb);
	};

	return [curMeasure, onLayout];
};

const ItemContainer = (props) => (
	<View
		style={[
			{
				position: 'absolute',
				top: props.y,
				left: props.x,
				width: props.width
			},
			props.style
		]}
	>
		{props.children}
	</View>
);

const ItemPopUp = ({
	x,
	y,
	width,
	height,
	data,
	onSelected,
	closeModal,
	itemSelected
}) => {
	const _scroll = useRef();
	useEffect(() => {
		console.log('itemSelected', itemSelected, height)
		_scroll.current &&
			_scroll.current.scrollTo({
				y: itemSelected * (height - 2),
				animated: false
			});
	}, [height, itemSelected]);

	const size = _.size(data);

	const content = _.map(data, (item, index) => {
		const style = { top: -8 * index, zIndex: index * -1 };
		if (index === itemSelected) {
			style.backgroundColor = 'rgb(37,41,58)';
			style.borderBottomLeftRadius = 8;
			style.borderBottomRightRadius = 8;
		}

		return (
			<Button
				data={data}
				withIcon={index === itemSelected}
				containerStyles={{ paddingTop: index ? 12 : undefined }}
				style={style}
				title={item}
				onPress={() => {
					onSelected && onSelected(index);
					closeModal && closeModal();
				}}
			/>
		);
	});

	if (size > 10) {
		return (
			<ItemContainer width={width} y={y} x={x}>
				<ScrollView
					ref={_scroll}
					showsVerticalScrollIndicator={false}
					bounces={false}
					style={{ maxHeight: DEFAULT_MAX_HEIGHT, marginBottom: 16 }}
					contentContainerStyle={{
						height: (height - 2) * size + height * 2
					}}
				>
					{content}
				</ScrollView>
			</ItemContainer>
		);
	} else {
		return (
			<ItemContainer width={width} y={y} x={x} style={{ zIndex: 101 }}>
				{content}
			</ItemContainer>
		);
	}
};

let ItemSelected = ({ data, style, onSelected: onSelectedProps }, ref) => {
	const mainRef = useRef();
	const [itemSelected, setItemSelected] = useState(0);
	const [showModal, closeModal] = useModal2();
	const [curMeasure, onLayout] = userMeasured(() => mainRef.current);

	const onSelected = (p) => {
		onSelectedProps && onSelectedProps(p);
		setItemSelected(p);
	};

	const curData = _.map(data, (item) =>
		item.group_description ? item.group_description : item.exchange
	);

	const ModalContent = () => (
		<ItemPopUp
			{...curMeasure}
			data={curData}
			itemSelected={itemSelected}
			onSelected={onSelected}
			closeModal={closeModal}
		/>
	);
	useImperativeHandle(ref, () => ({ measureItem: onLayout }));
	return (
		<View style={style}>
			<View
				ref={mainRef}
				style={{
					borderWidth: 1,
					borderColor: 'transparent'
				}}
			>
				<Button
					withIcon
					title={curData[itemSelected]}
					onPress={() => showModal(ModalContent)}
				/>
			</View>
		</View>
	);
};

ItemSelected = forwardRef(ItemSelected);
ItemSelected = React.memo(ItemSelected);

let HeaderSelecter = ({ onSelected }, ref) => {
	const _item1 = useRef();
	const _item2 = useRef();

	const [Shadow, onLayout] = useShadow();

	const { exchanges, marketGroup: defaultMarketGroup } = useSelector(
		(state) => {
			return {
				exchanges: state.marketActivity.exchanges,
				marketGroup: state.marketActivity.marketGroup
			};
		},
		shallowEqual
	);
	const [group, setGroup] = useState([]);

	const groupFunc = (item) => item.group_name === 'Group';

	useEffect(() => {
		setGroup(_.groupBy(defaultMarketGroup, groupFunc)['true'] || []);
	}, [defaultMarketGroup]);

	// handle onSelect
	const [exchangeSelected, setExchangeSelected] = useState(
		exchanges && exchanges[0]
	);
	const [marketGroup, setMarketGroup] = useState(group && group[0]);

	useEffect(() => {
		!exchangeSelected && setExchangeSelected(exchanges && exchanges[0]);
		!marketGroup && setMarketGroup(group && group[0]);
	}, [exchanges, group]);

	useLayoutEffect(() => {
		onSelected &&
			onSelected({
				exchange: exchangeSelected,
				marketGroup
			});
	}, [exchangeSelected, marketGroup]);

	// memoized function
	const onSelectExchange = useCallback(
		(i) => setExchangeSelected(exchanges[i]),
		[exchanges]
	);

	const onSelectGroup = useCallback((i) => setMarketGroup(group[i]), [group]);

	// measureItem
	useImperativeHandle(ref, () => ({
		measureItem: () => {
			_item1.current && _item1.current.measureItem();
			_item2.current && _item2.current.measureItem();
		}
	}));

	return (
		<View
			style={{
				zIndex: 9999999
			}}
		>
			<Shadow />
			<View
				onLayout={onLayout}
				style={{
					paddingHorizontal: 16,
					paddingVertical: 8,
					flexDirection: 'row',
					backgroundColor: CommonStyle.color.dark,
					zIndex: 9
				}}
			>
				<ItemSelected
					ref={_item1}
					onSelected={onSelectExchange}
					style={styles.selectedExchange}
					data={exchanges}
				/>
				<ItemSelected
					ref={_item2}
					isGroup
					onSelected={onSelectGroup}
					style={styles.selectedGroup}
					data={group}
				/>
			</View>
		</View>
	);
};

HeaderSelecter = forwardRef(HeaderSelecter);

export default HeaderSelecter;

const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		buttonContainer: {
			borderWidth: 1,
			borderColor: CommonStyle.color.dusk,
			backgroundColor: CommonStyle.color.dark,
			paddingVertical: 4,
			paddingHorizontal: 16,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center'
		},
		buttonTitle: {
			flex: 1,
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.font13,
			color: CommonStyle.color.modify,
			textAlign: 'center'
		},
		selectedExchange: { flex: 1, paddingRight: 8 },
		selectedGroup: { flex: 3 }
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
