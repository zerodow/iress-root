import React, { useCallback, useState } from 'react';
import Animated from 'react-native-reanimated';
import { Text, View } from 'react-native'
import { ItemContainer } from './Components';
import AnimatedScroll from './AnimatedScroll';
import {
	BOTTOM_TABBAR_HEIGHT,
	HEIGHT_SEPERATOR,
	NUMBER_LIST
} from '~s/watchlist/enum';
import Timing from '~s/watchlist/Animator/Timing';
import { HEIGHT_ROW } from '~s/watchlist/TradeList/tradeList.row';
import { DelayComp } from '~s/watchlist';
import I18n from '~/modules/language'
import Ionicons from 'react-native-vector-icons/Ionicons'
import CommonStyle from '~/theme/theme_controller'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import * as Business from '~/business'
import SvgIcon from '~s/watchlist/Component/Icon2';

const HEIGHT_EARCH_ROW = HEIGHT_ROW + HEIGHT_SEPERATOR;
const FOOTER_HEIGHT = 16
const Footer = ({ style, showSearch }) => {
	showDataDisclaimer = () => {
		Business.showThirdPartyTerms()
	}
	return <View style={{ width: '100%', alignItems: 'center' }}>
		<TouchableOpacityOpt
			onPress={showSearch}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				height: 31,
				paddingHorizontal: 16,
				marginBottom: 16,
				borderRadius: 8,
				backgroundColor: CommonStyle.color.dark
			}}
		>
			<CommonStyle.icons.add
				color={CommonStyle.color.modify}
				size={13}
				name={'add'}
				style={{
					marginRight: 8,
					opacity: 0.75,
					width: 13,
					height: 13
				}}
			/>
			<Text
				style={{
					color: CommonStyle.color.modify,
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					opacity: 0.75,
					paddingTop: 2
				}}
			>
				{I18n.t('addSymbolBtn')}
			</Text>
		</TouchableOpacityOpt>
		<TouchableOpacityOpt
			hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
			onPress={showDataDisclaimer}
			style={[{
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				height: FOOTER_HEIGHT,
				width: '100%',
				opacity: 0.7,
				marginBottom: FOOTER_HEIGHT
			}, style]}>
			<Text style={{
				textAlign: 'center',
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font7,
				color: CommonStyle.color.modify
			}}>
				{I18n.t('thirdPartyTerms')}
			</Text>
			<Ionicons
				name='ios-arrow-forward'
				size={10}
				color={CommonStyle.color.modify}
				style={{ top: 1, marginLeft: 2 }} />
		</TouchableOpacityOpt>
	</View>
}

const LazyList = ({
	_scroll,
	_scrollValue,
	sizeData,
	wrappedData,
	showSearch,
	isLoading: dataLoading,
	renderItem,
	heightRow = HEIGHT_EARCH_ROW
}) => {
	const [_timer] = useState(() => new Animated.Value(0));
	const [firstLoading, setFirstLoad] = useState(true);

	const onEnd = useCallback(() => setFirstLoad(false), []);

	const isLoading = dataLoading || firstLoading;
	let height = NUMBER_LIST * heightRow;
	if (!isLoading) {
		height = sizeData * heightRow + HEIGHT_SEPERATOR;
	}

	const content = [];
	for (let index = 0; index < NUMBER_LIST; index++) {
		const { _trans, marketData: item } = wrappedData[index] || {};

		content.push(
			<ItemContainer index={index} data={wrappedData}>
				{renderItem({
					index,
					item,
					isLoading,
					_trans,
					_timer
				})}
			</ItemContainer>
		);
	}
	return (
		<DelayComp>
			<AnimatedScroll
				ref={_scroll}
				_scrollValue={_scrollValue}
				decelerationRate={0.5}
			>
				<Timing
					_pos={_timer}
					duration={1000}
					toValue={1000}
					onEnd={onEnd}
					autoStart
				/>
				<Animated.View
					style={{
						height,
						marginTop: HEIGHT_SEPERATOR
					}}
				>
					{content}
				</Animated.View>
				<Footer
					style={{ marginBottom: BOTTOM_TABBAR_HEIGHT + FOOTER_HEIGHT }}
					showSearch={showSearch} />
			</AnimatedScroll>
		</DelayComp>
	);
};

export default LazyList;
