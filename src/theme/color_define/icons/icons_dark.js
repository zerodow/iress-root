import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SvgIcon from '~/component/svg_icon/SvgIcon';
import CustomIcon from '~/component/Icon';
import Svg, { Path, G } from 'react-native-svg';
import SvgIcon2 from '~/screens/watchlist/Component/Icon2';
import { Image } from 'react-native';
import oval from '~/img/abasa/oval.png';

const img = {
	delete: require('~/img/delete.png'),
	newAlert: require('~/img/newAlert.png'),
	newOrder: require('~/img/newOrder.png'),
	searchSymbol: require('~/img/searchSymbol.png'),
	iconSelected: require('~/img/icon/Selected.png'),
	iconUnTick: require('~/img/icon/Untick.png'),
	iconGoToTop: require('~/img/icon/noun_uploads.png'),
	refreshed: require('~/img/abasa/refreshed.png'),
	searchWl: require('~/img/abasa/searchWl.png'),
	addAlert: require('~/img/icon/push.png'),
	backIcon: require('~/img/abasa/backIcon.png')
};

const IconSource = () => {
	return (
		<Svg width={24} height={22} viewBox="0 0 22 22">
			<G fill="#fff">
				<Path d="M.516 11.902a1.248 1.248 0 01-.516-.98c0-.36.156-.695.543-.875H.516C2.344 8.965 4.898 7.52 6.598 6.516v2.398c-.672.387-1.57.824-3.84 2.035l.027.024c1.211.543 2.602 1.367 3.813 2.09v2.421zm0 0M21.484 10.098c.309.207.516.617.516.98 0 .36-.156.695-.543.875h.027c-1.828 1.082-4.382 2.527-6.082 3.531v-2.398c.672-.387 1.57-.824 3.84-2.035l-.027-.024c-1.211-.543-2.602-1.367-3.813-2.09V6.517zm0 0M10.207 15.805H8.664l3.102-9.61h1.57zm0 0" />
			</G>
		</Svg>
	);
};

export default {
	tabBarMain: (props) => <SvgIcon2 {...props} name="equixLogo" />,
	showchart: (props) => <MaterialIcons {...props} name="show-chart" />,
	viewlist: (props) => <MaterialIcons {...props} name="view-list" />,
	web: (props) => <MaterialIcons {...props} name="web" />,
	swapvert: (props) => <MaterialIcons {...props} name="swap-vert" />,
	newspaper: (props) => (
		<MaterialCommunityIcons {...props} name="newspaper" />
	),
	settings: (props) => <MaterialIcons {...props} name="settings" />,
	information: (props) => (
		<Ionicons {...props} name="ios-information-circle-outline" />
	),
	protect: (props) => (
		<MaterialCommunityIcons {...props} name="shield-check-outline" />
	),
	logout: (props) => <SvgIcon {...props} name="noun_signout" />,
	eyeoff: (props) => <SvgIcon {...props} name="nounEyeCross" />,
	eye: (props) => <SvgIcon {...props} name="nounEye" />,
	pencil: (props) => <MaterialCommunityIcons {...props} name="pencil" />,
	search: (props) => <SvgIcon {...props} name="search" />,
	filter: (props) => <CustomIcon {...props} name="equix_filter" />,
	time: (props) => <CustomIcon {...props} name="equix_time" />,
	newssource: () => <IconSource />,
	accountSearch: (props) => (
		<MaterialCommunityIcons name={'account-search'} {...props} />
	),
	tickRounded: (props) => <SvgIcon2 {...props} name="tickRounded" />,
	reviewOrder: (props) => <Ionicons name={'md-send'} {...props} />,
	checkMarkCircle: (props) => (
		<Ionicons {...props} name={'ios-checkmark-circle'} />
	),
	closeIcon: (props) => <SvgIcon {...props} name="circleClose" />,
	closeIconR: (props) => <SvgIcon {...props} name="circleClose" />,
	bell: (props) => <SvgIcon2 {...props} name="newAlert" />,
	add: (props) => <SvgIcon2 {...props} name="add" />,
	arrowUp: (props) => <Ionicons {...props} name="md-arrow-dropup" />,
	arrowDown: (props) => <Ionicons {...props} name="md-arrow-dropdown" />,
	cheDown: (props) => <Ionicons {...props} name="md-arrow-dropdown" />,
	delayed: (props) => <SvgIcon2 {...props} name="delayed" size={20} />,
	reviewOrder2: (props) => <Ionicons name={'md-send'} {...props} />,
	newAlert: (props) => <Image {...props} source={img.newAlert} />,
	delete: (props) => <Image {...props} source={img.delete} />,
	newOrder: (props) => <Image {...props} source={img.newOrder} />,
	searchSymbol: (props) => <Image {...props} source={img.searchSymbol} />,
	deleteSvg: (props) => <SvgIcon {...props} name={'delete'} />,
	marketOpen: (props) => <SvgIcon2 {...props} name={'marketOpen'} />,
	iconSelected: () => (
		<Image
			resizeMode="contain"
			style={{ tintColor: 'rgb(87, 225, 241)', height: 22, width: 22 }}
			source={img.iconSelected}
		/>
	),
	iconGoToTop: (props) => <Image {...props} source={img.iconGoToTop} />,
	refreshed: (props) => <Ionicons name="md-refresh" {...props} size={20} />,
	searchWl: (props) => (
		<Image
			{...props}
			resizeMode="contain"
			style={{
				tintColor: '#FFFFFF',
				height: 22,
				width: 22,
				marginHorizontal: 8
			}}
			source={img.searchWl}
		/>
	),
	iconUnTick: () => (
		<Image
			resizeMode="contain"
			style={{ height: 22, width: 22 }}
			source={img.iconUnTick}
		/>
	),
	oval: (props) => (
		<Image
			resizeMode="contain"
			style={{ ...props, size: 3, marginHorizontal: 4 }}
			source={oval}
		/>
	),
	tick: (props) => <SvgIcon2 {...props} name="tickRounded" size={24} />,
	unTick: (props) => <SvgIcon2 {...props} name="untickRounded" size={24} />,
	addAlert: (props) => (
		<Image {...props} resizeMode="contain" source={img.addAlert} />
	),
	backIcon: (props) => (
		<Image {...props} resizeMode="contain" source={img.backIcon} />
	)
};
