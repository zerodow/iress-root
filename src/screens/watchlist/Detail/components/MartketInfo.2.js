import React, {
	useState,
	useImperativeHandle,
	forwardRef,
	useRef
} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import _ from 'lodash';

import I18n from '~/modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import { useShadow } from '~/component/shadow/SvgShadow';
import Shadow from '~/component/shadow';
import ShadowTop from '~/component/shadow/index.js'

import Depths from '../martketDepth.2';
import Cos from '../courseOfSales.2';
import News from '~s/universal_search/detail/new/watchList_search_new.2';
const { width: widthDevices, height: heightDevices } = Dimensions.get('window')

const TABS = {
	DEPTH: {
		label: I18n.t('marketDepth')
	},
	NEWS: {
		label: I18n.t('News')
	},
	COS: {
		label: I18n.t('courseOfSales')
	}
};

const Ticker = ({ isSelected }) =>
	isSelected ? <View style={styles.ticker} /> : null;

const TabItem = ({ onPress, selected, label }) => {
	return (
		<TouchableOpacity onPress={onPress} style={{ paddingVertical: 8 }}>
			<Text
				style={{
					fontFamily: selected
						? CommonStyle.fontPoppinsBold
						: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: selected
						? CommonStyle.color.turquoiseBlueHex
						: CommonStyle.fontColor,
					opacity: selected ? 1 : 0.7
					// textAlign: 'center'
				}}
			>
				{label}
			</Text>
			<Ticker isSelected={selected} />
		</TouchableOpacity>
	);
};

let Tabs = ({ onChange }, ref) => {
	const [itemSelected, setItemSelected] = useState('NEWS');
	const [ShadowView, onLayout] = useShadow();
	// const dic = useRef({
	//     timeout: null
	// })

	useImperativeHandle(ref, () => ({
		reset: () => {
			setItemSelected('NEWS');
		}
	}));

	const content = _.map(TABS, ({ label }, key) => {
		const onPress = () => {
			onChange(key);
			setItemSelected(key);
			// dic.current.timeout && clearTimeout(dic.current.timeout)
			// dic.current.timeout = setTimeout(() => {
			//     const { active, inactive } = getActiveScreenByKey(key)
			//     setActiveScreen(active)
			//     setInactiveScreen(inactive)
			//     doActiveScreen(active)
			//     doInactiveScreen(inactive)
			// }, 1000)
		};
		const selected = key === itemSelected;

		return <TabItem label={label} onPress={onPress} selected={selected} />;
	});

	return (
		<View style={{
			zIndex: 9999,
			justifyContent: 'center'
		}}>
			<ShadowTop setting={{
				radius: 0
			}} />
			<View
				onLayout={onLayout}
				style={{
					paddingHorizontal: 16,
					flexDirection: 'row',
					justifyContent: 'space-between',
					zIndex: 99999,
					alignItems: 'center',
					backgroundColor: CommonStyle.color.dark
				}}
			>
				{content}
			</View>
			<View style={{ marginTop: 8 }}>
				<Shadow setting={{
					width: widthDevices,
					height: 0,
					color: CommonStyle.color.shadow,
					border: 3,
					radius: 0,
					opacity: 0.5,
					x: 0,
					y: 0,
					style: {
						zIndex: 9,
						position: 'absolute',
						backgroundColor: CommonStyle.backgroundColor,
						top: 0,
						left: 0,
						right: 0
					}
				}} />
			</View>

		</View>
	);
};

Tabs = forwardRef(Tabs);

let MartketInfo = (
	{ symbol, exchange, isDisableShowNewDetail, navigator, changeAllowUnmount, reset },
	ref
) => {
	const _tabs = useRef();
	const [itemSelected, setItemSelected] = useState('NEWS');
	const [ShadowView, onLayout] = useShadow();
	useImperativeHandle(ref, () => ({
		reset: () => {
			_tabs.current && _tabs.current.reset();
			setItemSelected('NEWS');
		}
	}));

	let content = null;
	if (itemSelected === 'DEPTH') {
		content = (
			<Depths
				tabIndex={0}
				tabLabel={_.upperCase(TABS.DEPTH.label)}
				symbol={symbol}
				exchange={exchange}
			/>
		);
	} else if (itemSelected === 'NEWS') {
		content = (
			<News
				reset={reset}
				changeAllowUnmount={changeAllowUnmount}
				style={{
					backgroundColor: CommonStyle.backgroundColor1,
					paddingBottom: 8
				}}
				isDisableShowNewDetail={isDisableShowNewDetail}
				symbol={symbol}
				navigator={navigator}
			/>
		);
	} else {
		content = <Cos symbol={symbol} exchange={exchange} />;
	}
	return (
		<View
			style={{
				backgroundColor: CommonStyle.color.dark
			}} >
			<Tabs ref={_tabs} onChange={setItemSelected} />
			{content}
		</View>
	);
};

MartketInfo = forwardRef(MartketInfo);
MartketInfo = React.memo(MartketInfo);

export default MartketInfo;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
	ticker: {
		alignSelf: 'center',
		width: '120%',
		position: 'absolute',
		height: 5,
		borderRadius: 8,
		backgroundColor: CommonStyle.color.turquoiseBlueHex,
		bottom: -8
	}
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
