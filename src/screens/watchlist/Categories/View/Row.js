import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { updateCheckUserWLStatus } from '../Model/';
import { syncManageWLButtonStatus } from '../Controller/';
import CommonStyle from '~/theme/theme_controller';
import SvgIcon from '~s/watchlist/Component/Icon2';
import ENUM from '~/enum';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import I18n from '~/modules/language/';
import { useShadow } from '~/component/shadow/SvgShadow';
import { func } from '~/storage';
import CONFIG from '~/config';
import { getFlagByCountryCode } from '~/business';
import Flag from '~/component/flags/flagIress';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
const { WATCHLIST } = ENUM;
const CHECKBOX_ROUNDED_STATUS = {
	UNTICK: 0,
	TICK: 1,
	CHECKED: 2
};
const { Value, createAnimatedComponent } = Animated;
const TouchableOpacityAnim = createAnimatedComponent(TouchableOpacity);

const CheckBox = (props) => {
	const {
		widthAnim = new Value(0),
		onCheck: syncDicUserWLChecked,
		style
	} = props;
	const [status, setStatus] = useState(CHECKBOX_ROUNDED_STATUS.UNTICK);
	const onCheck = useCallback(() => {
		syncDicUserWLChecked && syncDicUserWLChecked(); // Update dic checked
		setStatus((prevStatus) => {
			if (
				prevStatus === CHECKBOX_ROUNDED_STATUS.CHECKED ||
				prevStatus === CHECKBOX_ROUNDED_STATUS.TICK
			) {
				return CHECKBOX_ROUNDED_STATUS.UNTICK;
			}
			return CHECKBOX_ROUNDED_STATUS.TICK;
		});
	}, status);
	const iconName = useMemo(() => {
		switch (status) {
			case CHECKBOX_ROUNDED_STATUS.TICK:
				return 'tickRounded';
			case CHECKBOX_ROUNDED_STATUS.CHECKED:
				return 'selectedRounded';
			default:
				return 'untickRounded';
		}
	}, [status]);
	const iconColor = useMemo(() => {
		switch (status) {
			case CHECKBOX_ROUNDED_STATUS.TICK:
				return 'none';
			case CHECKBOX_ROUNDED_STATUS.CHECKED:
				return 'none';
			default:
				return 'none';
		}
	}, [status]);
	return (
		<TouchableOpacityAnim
			onPress={onCheck}
			style={[
				{
					justifyContent: 'center',
					width: widthAnim,
					overflow: 'hidden'
				},
				style
			]}
		>
			<SvgIcon
				color={iconColor}
				name={iconName}
				size={24}
				style={{ paddingLeft: 8 }}
			/>
		</TouchableOpacityAnim>
	);
};

const WatchlistInfoLeftIcon = ({ isFavorite, isIress, countryCode }) => {
	return isFavorite ? (
		<SvgIcon
			name={'favouriteStar'}
			size={18}
			color={'#f0d351'}
			style={{ marginRight: 8 }}
		/>
	// ) : isIress ? (
	// 	<Flag countryCode={countryCode} />
	) : (
		<View />
	);
};

const WatchlistInfo = ({
	isFavorite,
	isIress,
	watchlist,
	WLName,
	WLCode,
	countryCode
}) => {
	const WLNameComp = (
		<React.Fragment>
			<Text
				numberOfLines={1}
				style={{
					fontSize: CommonStyle.font13,
					fontFamily: CommonStyle.fontPoppinsRegular,
					color: CommonStyle.fontColor,
					paddingTop: isFavorite ? 2 : 0
				}}
			>
				{WLName}
			</Text>
			<Text
				numberOfLines={1}
				style={{
					fontSize: CommonStyle.fontTiny,
					fontFamily: CommonStyle.fontPoppinsRegular,
					color: CommonStyle.fontColor,
					flexDirection: 'row',
					marginTop: 3
				}}
			>
				<Text style={{ opacity: 0.5 }}>
					{`${I18n.t('watchlistCode')}: `}
				</Text>
				<Text style={{ color: CommonStyle.color.modify }}>
					{watchlist}
				</Text>
			</Text>
		</React.Fragment>
	);

	const WLCodeComp = (
		<Text
			numberOfLines={1}
			style={{
				fontSize: CommonStyle.font13,
				fontFamily: CommonStyle.fontPoppinsRegular,
				color: CommonStyle.fontColor,
				paddingTop: isFavorite ? 2 : 0,
				minHeight: 18
			}}
		>
			{WLName || WLCode}
		</Text>
	);

	let content = null;
	if (isIress && watchlist) {
		content = WLNameComp;
	} else {
		content = WLCodeComp;
	}

	return (
		<View
			style={{
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center'
			}}
		>
			<WatchlistInfoLeftIcon
				countryCode={countryCode}
				isFavorite={isFavorite}
				isIress={isIress}
			/>
			<View style={{ justifyContent: 'center', flex: 1 }}>{content}</View>
		</View>
	);
};

const CheckedIcon = (props) => {
	const { active } = props;
	return active ? (
		<SvgIcon
			name={'rowSelected'}
			color={CommonStyle.color.modify}
			size={18}
		/>
	) : (
		<View />
	);
};

const Row = ({
	item,
	index,
	isFavorite,
	animStyles,
	changePriceBoardSelected,
	style,
	priceBoardSelected,
	isIress
}) => {
	const { watchlist, country_code: countryCode } = item || {};
	const WLCode =
		watchlist === WATCHLIST.USER_WATCHLIST
			? I18n.t('mobileFavorite')
			: item.watchlist || '';
	const WLName = item.watchlist_name || '';
	const active = useMemo(() => {
		if (isIress) {
			return priceBoardSelected === watchlist;
		} else {
			return priceBoardSelected === WATCHLIST.PREFIX + watchlist;
		}
	}, [priceBoardSelected, isIress, watchlist]);
	const [Shadow, onLayout] = useShadow();
	const onPress = useCallback(() => {
		const isRender = !active;
		changePriceBoardSelected &&
			changePriceBoardSelected(
				isIress ? watchlist : WATCHLIST.PREFIX + watchlist,
				isRender
			);
	}, [watchlist, active]);
	const extraProps = isFavorite ? { onLayout } : {};
	const WrapperComp = index <= 12 ? Animated.View : View;
	return (
		<WrapperComp
			style={[{ backgroundColor: CommonStyle.color.dark }, animStyles]}
		>
			{isFavorite ? <Shadow /> : null}
			<View {...extraProps} style={{ flexDirection: 'row' }}>
				<TouchableOpacityOpt
					onPress={onPress}
					style={[
						{
							flex: 1,
							marginTop: 8,
							marginBottom: 0,
							marginHorizontal: 8,
							paddingVertical: 16,
							paddingHorizontal: 16,
							borderRadius: 8,
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
							borderColor: active
								? CommonStyle.color.modify
								: CommonStyle.color.dusk_tabbar,
							borderWidth: 1
						},
						style
					]}
				>
					<WatchlistInfo
						countryCode={countryCode}
						isFavorite={isFavorite}
						isIress={isIress}
						watchlist={watchlist}
						WLName={WLName}
						WLCode={WLCode}
					/>
					<CheckedIcon active={active} />
				</TouchableOpacityOpt>
			</View>
		</WrapperComp>
	);
};

function shouldUpdate(prevProps, nextProps) {
	const { watchlist_name: prevWL } = prevProps;
	const { watchlist_name: currentWL } = nextProps;
	return prevWL === currentWL;
}

export default React.memo(Row, shouldUpdate);
