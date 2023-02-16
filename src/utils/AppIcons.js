/* eslint-disable new-cap */
import { PixelRatio } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { colorIcon } from '../config'
const navIconSize = (__DEV__ === false && Platform.OS === 'android') ? PixelRatio.getPixelSizeForLayoutSize(40) : 40; // eslint-disable-line
const replaceSuffixPattern = /--(active|big|small|very-big)/g;
const icons = {
	'ios-film-outline': ['Ionicons', 30],
	'ios-film': ['Ionicons', 30],
	'ios-albums-outline': ['Ionicons', 24],
	'ios-desktop-outline': ['Ionicons', 24],
	'ios-share-outline': ['Ionicons', 24],
	'ios-list-box-outline': ['Ionicons', 24],
	'ios-list-box': ['Ionicons', 24],
	'ios-stats-outline': ['Ionicons', 24],
	'ios-stats': ['Ionicons', 24],
	'ios-desktop': ['Ionicons', 24],
	'ios-albums': ['Ionicons', 24],
	'ios-share': ['Ionicons', 24],
	'md-add': ['Ionicons', 30],
	'ios-add': ['Ionicons', 30],
	'md-refresh': ['Ionicons', 24],
	'ios-refresh-outline': ['Ionicons', 30],
	'ios-add-outline': ['Ionicons', 30, '#10a8b2'],
	'md-checkmark': ['Ionicons', 24],
	'md-close': ['Ionicons', 24],
	'md-search': ['Ionicons', 24],
	'ios-funnel-outline': ['Ionicons', 24, '#ffffff'],
	'ios-browsers-outline': ['Ionicons', 24],
	'md-menu': ['Ionicons', 30],
	'md-create': ['Ionicons', 24],
	'ios-create-outline': ['Ionicons', 30],
	'md-calendar': ['Ionicons', 24],
	'ios-arrow-round-down': ['Ionicons', navIconSize],
	'ios-arrow-back': ['Ionicons', 30],
	'md-arrow-back': ['Ionicons', 30],
	'ios-close': ['Ionicons', 40],
	'ios-more': ['Ionicons', 24],
	'ios-more-outline': ['Ionicons', 24],
	'ios-paper': ['Ionicons', 24],
	'ios-paper-outline': ['Ionicons', 24],
	'filter': ['FontAwesome', 24, '#FFFF'],
	'ios-add-circle-outline': ['Ionicons', 24, '#FFFF'],
	'eye': ['FontAwesome', 24, '#FFFF'],
	'eye-slash': ['FontAwesome', 24, '#FFFF']
};

const iconsMap = {};
const iconsLoaded = new Promise((resolve, reject) => {
	new Promise.all(
		Object.keys(icons).map(iconName => icons[iconName][0] === 'Ionicons' ? Ionicons.getImageSource(
			iconName.replace(replaceSuffixPattern, ''),
			icons[iconName][1],
			icons[iconName][2]
		) : FontAwesome.getImageSource(
			iconName.replace(replaceSuffixPattern, ''),
			icons[iconName][1],
			icons[iconName][2]
		))
	).then(sources => {
		Object.keys(icons)
			.forEach((iconName, idx) => (iconsMap[iconName] = sources[idx]));

		// Call resolve (and we are done)
		resolve(true);
	});
});

export {
	iconsMap,
	iconsLoaded
};
