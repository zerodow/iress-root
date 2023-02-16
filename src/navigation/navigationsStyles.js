import * as Enum from './screenEnum';
import config from '../config';

const styles = {};

styles[Enum.BUSY_BOX] = {
	navigatorStyle: {
		drawUnderNavBar: true,
		navBarHidden: true,
		navBarHideOnScroll: false,
		statusBarTextColorScheme: 'light',
		navBarNoBorder: true
	},
	appStyle: {
		orientation: 'portrait'
	},
	otherStyles: {
		animationType: 'none'
	}
};
styles[Enum.AUTO_LOGIN] = {
	navigatorStyle: {
		statusBarColor: config.background.statusBar,
		statusBarTextColorScheme: 'light',
		navBarHidden: true,
		screenBackgroundColor: 'transparent',
		modalPresentationStyle: 'overCurrentContext'
	},
	otherStyles: {
		animated: true,
		animationType: 'fade'
	}
};

module.exports = styles;
