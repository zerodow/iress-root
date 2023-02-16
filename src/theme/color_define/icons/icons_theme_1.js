import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from 'react-native';
import showChart from '~/img/abasa/show-chart.png';
import viewList from '~/img/abasa/view-list.png';
import web from '~/img/abasa/web.png';
import swapVert from '~/img/abasa/swap-vert.png';
import newspaper from '~/img/abasa/newspaper.png';
import settings from '~/img/abasa/cogs.png';
import information from '~/img/abasa/alert-information.png';
import protect from '~/img/abasa/protect.png';
import logout from '~/img/abasa/log-out.png';
import eye from '~/img/abasa/eye.png';
import eyeoff from '~/img/abasa/eyeoff.png';
import pencil from '~/img/abasa/pencil.png';
import search from '~/img/abasa/search.png';
import filter from '~/img/abasa/filter.png';
import time from '~/img/abasa/time.png';
import newssource from '~/img/abasa/newssource.png';
import accountSearch from '~/img/abasa/account-search.png';
import tickRounded from '~/img/abasa/tickRounded.png';
import reviewOrder from '~/img/abasa/reviewOrder.png';
import closeX from '~/img/abasa/close-x.png';
import star from '~/img/abasa/star.png';
import bell from '~/img/abasa/bell.png';
import add from '~/img/abasa/add.png';
import SvgIcon from '~/component/svg_icon/SvgIcon';
import arDown from '~/img/abasa/arDown.png';
import arUp from '~/img/abasa/arUp.png';
import cheDown from '~/img/abasa/cheDown.png';
import plusR from '~/img/abasa/plusR.png';
import reviewOrder2 from '~/img/abasa/reviewOrder2.png';
import SvgIcon2 from '~/screens/watchlist/Component/Icon2';
import iconDelete from '~/img/abasa/iconDelete.png';
import newAlert from '~/img/abasa/newAlert.png';
import iconSelected from '~/img/abasa/iconSelected.png';
import iconUntick from '~/img/icon/Untick.png';
import iconGoToTop from '~/img/abasa/iconGoToTop.png';
import refreshed from '~/img/abasa/refreshed.png';
import searchWl from '~/img/abasa/searchWl.png';
import oval from '~/img/abasa/oval.png';
import backIcon from '~/img/abasa/oval.png';

const getStyleImg = ({ size, color, style = {} }) => [
	{
		height: size || 16,
		width: size || 16,
		resizeMode: 'contain',
		tintColor: color || '#ffffff'
	},
	...(Array.isArray(style) ? style : [style])
];
const img22 = {
	height: 22,
	width: 22,
	resizeMode: 'contain'
};

export default {
	tabBarMain: (props) => <Image style={getStyleImg(props)} source={plusR} />,
	showchart: (props) => <Image {...props} source={showChart} />,
	viewlist: (props) => <Image {...props} source={viewList} />,
	web: (props) => <Image {...props} source={web} />,
	swapvert: (props) => <Image {...props} source={swapVert} />,
	newspaper: (props) => <Image {...props} source={newspaper} />,
	settings: (props) => <Image {...props} source={settings} />,
	information: (props) => <Image {...props} source={information} />,
	protect: (props) => <Image {...props} source={protect} />,
	logout: () => <Image source={logout} style={img22} />,
	eyeoff: (props) => <Image style={getStyleImg(props)} source={eyeoff} />,
	eye: (props) => <Image style={getStyleImg(props)} source={eye} />,
	pencil: (props) => <Image style={getStyleImg(props)} source={pencil} />,
	search: (props) => (
		<Image
			resizeMode="contain"
			style={getStyleImg({ ...props, size: 22 })}
			source={search}
		/>
	),
	filter: (props) => <Image style={getStyleImg(props)} source={filter} />,
	time: (props) => <Image style={getStyleImg(props)} source={time} />,
	newssource: () => <Image style={img22} source={newssource} />,
	accountSearch: (props) => (
		<Image style={getStyleImg(props)} source={accountSearch} />
	),
	tickRounded: (props) => (
		<Image style={getStyleImg(props)} source={tickRounded} />
	),
	reviewOrder: (props) => (
		<Image style={getStyleImg(props)} source={reviewOrder} />
	),
	checkMarkCircle: (props) => (
		<Image style={getStyleImg(props)} source={tickRounded} />
	),
	closeIcon: (props) => <Image style={getStyleImg(props)} source={closeX} />,
	backIcon: (props) => <Image style={getStyleImg(props)} source={backIcon} />,
	closeIconR: (props) => <SvgIcon {...props} name="circleClose" />,
	bell: (props) => <Image style={getStyleImg(props)} source={bell} />,
	add: (props) => <Image style={getStyleImg(props)} source={add} />,
	arrowUp: (props) => <Image style={getStyleImg(props)} source={arUp} />,
	arrowDown: (props) => <Image style={getStyleImg(props)} source={arDown} />,
	cheDown: (props) => <Image style={getStyleImg(props)} source={cheDown} />,
	delayed: (props) => <SvgIcon2 {...props} name="delayed" size={20} />,
	reviewOrder2: (props) => (
		<Image style={getStyleImg(props)} source={reviewOrder2} />
	),
	newAlert: (props) => (
		<Image
			{...props}
			style={[...props.style, { width: 29, height: 29 }]}
			source={newAlert}
		/>
	),
	delete: (props) => <Image style={getStyleImg(props)} source={iconDelete} />,
	newOrder: (props) => <Image {...props} source={reviewOrder} />,
	searchSymbol: (props) => <Image {...props} source={add} />,
	deleteSvg: (props) => (
		<Image style={getStyleImg(props)} {...props} source={iconDelete} />
	),
	marketOpen: (props) => (
		<Image
			style={getStyleImg({ ...props, size: 14 })}
			source={iconSelected}
		/>
	),
	iconSelected: (props) => (
		<Image
			style={getStyleImg({ color: '#FFFFFF', size: 25 })}
			source={iconSelected}
		/>
	),
	iconUnTick: () => (
		<Image
			style={getStyleImg({ color: '#AF144B', size: 20 })}
			source={iconUntick}
		/>
	),
	iconGoToTop: (props) => (
		<Image
			style={[props.style, getStyleImg({ color: '#FFFFFF', size: 20 })]}
			source={iconGoToTop}
		/>
	),
	refreshed: (props) => (
		<Image style={getStyleImg(props)} {...props} source={refreshed} />
	),
	searchWl: (props) => (
		<Image
			resizeMode="contain"
			style={getStyleImg({ ...props, size: 22 })}
			source={searchWl}
		/>
	),
	oval: (props) => (
		<Image
			resizeMode="contain"
			style={getStyleImg({ ...props, size: 3 })}
			source={oval}
		/>
	),
	tick: (props) => <SvgIcon2 {...props} name="tick" size={24} />,
	unTick: (props) => <SvgIcon2 {...props} name="untick" size={24} />,
	addAlert: (props) => <Image style={getStyleImg(props)} source={add} />
};
