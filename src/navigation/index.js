import { Navigation } from 'react-native-navigation';
import _ from 'lodash';

import navigationStyles from './navigationsStyles';

export * from './screenEnum';

export function setRoot(nav, screenName, customStyles = {}) {
	if (!screenName) return;

	const navigation = nav || Navigation;

	const defaultStyles = navigationStyles[screenName];
	const { navigatorStyle, appStyle, otherStyles, passProps } = _.merge(
		defaultStyles,
		customStyles
	);

	navigation.startSingleScreenApp({
		screen: {
			screen: screenName,
			navigatorStyle
		},
		appStyle,
		passProps,
		...otherStyles
	});
}

export function showModal(nav = Navigation, screenName, customStyles = {}) {
	if (!screenName) return;

	const navigation = nav || Navigation;

	const defaultStyles = navigationStyles[screenName];
	const { navigatorStyle, appStyle, otherStyles, passProps } = _.merge(
		defaultStyles,
		customStyles
	);

	navigation.showModal({
		screen: screenName,
		navigatorStyle: {
			...navigatorStyle,
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps,
		...otherStyles
	});
}
