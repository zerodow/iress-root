/* eslint-disable no-unused-vars */
import { Provider } from 'react-redux';
import { registerScreens } from './screens';
import I18n from './modules/language/';
import persistStore from './store/persistStore';
import configureStore from './store/configureStore';
import { dataStorage, func } from './storage';
import config from './config';
import SplashScreen from 'react-native-splash-screen';
import { buildStyle } from './build_style';
import * as Util from '../src/util';
import * as Controller from '../src/memory/controller';
import * as AppController from './app.controller';

import { showBusyBoxScreen } from './navigation/controller';

import {
	clearAllItemFromLocalStorage,
	checkTouchIdSupport,
	logDevice
} from './lib/base/functionUtil';
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from './streaming/channel';

//  START SESSION
AppController.initApp();

// Todo: Create a splashscreen show CodePush update progresss,
const store = configureStore();
Controller.setGlobalStore(store);
dataStorage.platform = 'ios';
buildStyle();
registerScreens(store, Provider);

class App {
	constructor() {
		AppController.configDataStorage(store);
		SplashScreen.hide();
		logDevice(
			'info',
			`===========> START APP <============= UPDATE VERSION: ${I18n.tEn(
				'version'
			)}`
		);
		persistStore(store, dataStorage.checkUpdateApp);
		showBusyBoxScreen({
			isUpgrade: false,
			isUpdating: false
		});
		checkTouchIdSupport();
		if (config.clearLocalStorage) {
			clearAllItemFromLocalStorage();
		}
		// subForceReloadUser
		const channelName = Channel.getChannelForceReload();
		Emitter.addListener(channelName, Util.getRandomKey(), this.startApp);

		AppController.handleEventApp();
		AppController.getDefaultTimeZone();
		// AppController.initNotiListener(autoLogin);
	}
}

export default App;
