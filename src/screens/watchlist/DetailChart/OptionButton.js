import React, { useCallback, useState } from 'react';
import {
	StyleSheet,
	ScrollView,
	View,
	TouchableOpacity,
	Text
} from 'react-native';
import _ from 'lodash';

import Enum from '~/enum';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import I18n from '~/modules/language/';
import { SvgShadow } from '~/component/shadow/SvgShadowCustom';
import { DEVICE_WIDTH } from '~s/watchlist/enum';

const { PRICE_FILL_TYPE } = Enum;

const Ticker = ({ isSelected }) =>
	isSelected ? <View style={styles.ticker} /> : null;

let Item = ({ onPress, isSelected, item }) => {
	return (
		<View style={styles.item}>
			<TouchableOpacity
				onLayout={this.calHeightPerButton}
				onPress={() => onPress && onPress(item)}
			>
				<Text
					style={{
						fontSize: CommonStyle.font11,
						color: isSelected
							? CommonStyle.color.turquoiseBlue
							: CommonStyle.fontTextChart,
						fontFamily: isSelected
							? CommonStyle.fontPoppinsBold
							: CommonStyle.fontPoppinsRegular
					}}
				>
					{I18n.t(item)}
				</Text>
			</TouchableOpacity>
			<Ticker isSelected={isSelected} />
		</View>
	);
};

Item = React.memo(Item);

const OptionButton = ({ onChange }) => {
	const [timeSelected, setTime] = useState(PRICE_FILL_TYPE._6M);
	// const [ShadowView, onLayout] = useShadow();

	const onPress = useCallback(
		(item) => {
			setTime(item);
			onChange && onChange(item);
		},
		[onChange]
	);

	const [layout, setLayout] = useState({ width: 0 });

	const onLayout = useCallback((event) => {
		setLayout(event.nativeEvent.layout);
	}, []);

	const data = _.values(PRICE_FILL_TYPE);
	if (layout.width <= DEVICE_WIDTH) {
		const isUnLoad = !layout.width;
		return (
			<View
				style={{ opacity: isUnLoad ? 0 : 1, alignItems: 'flex-start' }}
			>
				{!isUnLoad && (
					<SvgShadow
						position={0}
						options={{ blur: 5, x: 0, y: 0, rx: 0, ry: 0 }}
						layout={{
							...layout,
							width: DEVICE_WIDTH
						}}
					/>
				)}
				<View
					onLayout={isUnLoad ? onLayout : undefined}
					style={[
						styles.chartOption,
						{
							width: isUnLoad ? undefined : DEVICE_WIDTH,
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center'
						}
					]}
				>
					{_.map(data, (item) => (
						<Item
							key={item}
							item={item}
							onPress={onPress}
							isSelected={item === timeSelected}
						/>
					))}
				</View>
			</View>
		);
	}

	return (
		<View>
			<SvgShadow
				position={0}
				options={{ blur: 5, x: 0, y: 0, rx: 0, ry: 0 }}
				layout={{
					...layout,
					width: DEVICE_WIDTH
				}}
			/>
			<ScrollView
				style={[styles.chartOption, { paddingRight: 16 }]}
				contentContainerStyle={{ alignItems: 'center' }}
				horizontal
			>
				{_.map(data, (item) => (
					<Item
						key={item}
						item={item}
						onPress={onPress}
						isSelected={item === timeSelected}
					/>
				))}
			</ScrollView>
		</View>
	);
};

export default OptionButton;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
	ticker: {
		// transform: [{ translateY: -15 }],
		width: 20,
		position: 'absolute',
		height: 2,
		borderRadius: 1,
		backgroundColor: CommonStyle.color.turquoiseBlueHex,
		bottom: 0
	},
	item: {
		justifyContent: 'center',
		alignItems: 'center',
		marginHorizontal: 8,
		height: 30
		// paddingHorizontal: index === 0 ? 4 : 0
	},
	chartOption: {
		// alignItems: 'center',
		backgroundColor: CommonStyle.color.dark,
		// flexDirection: 'row',
		zIndex: 10
		// paddingRight: 16
		// height: 30
	}
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
