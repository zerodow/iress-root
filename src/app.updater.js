import {
	checkSystemVersion,
	updateSoftware
} from './component/check_update/check_update.1';
import { showUpdateMeScreen, showBusyBoxScreen } from './navigation/controller';
import { dataStorage, func } from './storage';
import * as Controller from './memory/controller';
import { checkNetworkConnection1 } from './lib/base/functionUtil';
import * as appActions from './app.actions';

export async function checkUpdateApp(byPass = true, callback, store) {
	try {
		const { startAppAfterLoadStore: startApp } = dataStorage;
		if (!byPass) {
			const isNeedUpdate = await checkSystemVersion();
			if (isNeedUpdate) {
				showUpdateMeScreen();
			} else {
				callback && callback();
				updateSoftware(byPass, startApp);
				handleAppStateChange(store);
			}
		}

		checkConnection(isConnected => {
			checkCnnCb(byPass, callback, store);
			store.dispatch(appActions.changeConnection(isConnected));
		});
	} catch (error) {
		logDevice('info', `checkUpdateApp error: ${error}`);
	}
}

// #region checkConnection

let isReady = true;
function handlerConenction(isConnected, cb) {
	Emitter.emit(Channel.getChannelConnectionChange(), isConnected);
	logDevice(
		'info',
		`IOS => handlerConenction called - isConnected: ${isConnected}`
	);
	// let isConnected = (snap.val() === true || snap.val() === 1);
	if (!isConnected && isReady) {
		showBusyBoxScreen({
			isUpgrade: false,
			isUpdating: false
		});
	} else {
		isConnected && isReady && cb && cb(isConnected);
		isReady = false;
	}
}

function showMaintainModal() {
	const { preState, currentState } = dataStorage.maintain;
	if (preState === currentState) {
		return;
	}
	const stateNtoF = preState === null && currentState === false;
	const inverted = preState === false && currentState === null;
	if (stateNtoF || inverted) {
		dataStorage.maintain.preState = currentState;
		return;
	}
	// reload App when maintain done
	const stateTtoFalse = preState === true && currentState === false;
	const stateTtoNull = preState === true && currentState === null;
	if (stateTtoFalse || stateTtoNull) {
		dataStorage.maintain.preState = currentState;
		dataStorage.isLocked = true;
		dataStorage.startAppAfterLoadStore &&
			dataStorage.startAppAfterLoadStore();
	}
	// maintain App
	if (preState !== true && currentState === true) {
		dataStorage.maintain.preState = currentState;
		showBusyBoxScreen({
			isUpgrade: true
		});
	}
}

let prevNetworkConnection = null;
function checkNetwork(cbFn, setSignoutFlag) {
	const url = `${Controller.getBaseUrl(true)}/${Controller.getVersion('version')}/info`;
	checkNetworkConnection1(url, cn => {
		showMaintainModal();
		if (prevNetworkConnection === null || prevNetworkConnection !== cn) {
			setSignoutFlag && cn && (dataStorage.isSignOut = false);
			handlerConenction(cn, cbFn);
			prevNetworkConnection = cn;
		}
	});
}

let interVal = null;
function checkConnection(cbFn) {
	try {
		if (!interVal) {
			// check network connection first time
			checkNetwork(cbFn);
		} else {
			// clear setInterval if have
			clearInterval(interVal);
		}
		interVal = setInterval(() => {
			checkNetwork(cbFn, true);
		}, 3000);
	} catch (error) {
		logDevice('error', `App IOS Check connection error: ${error}`);
		logAndReport(`App IOS Check connection error: ${error}`);
	}
}

// #endregion

async function checkCnnCb(byPass, callback, store) {
	const { startAppAfterLoadStore: startApp } = dataStorage;
	if (byPass) {
		updateSoftware(byPass, startApp);
	} else {
		const isNeedUpdate = await checkSystemVersion();
		if (isNeedUpdate) {
			showUpdateMeScreen();
		} else {
			calback && callback();
			updateSoftware(byPass, startApp);
			handleAppStateChange(store);
		}
	}
}

// #region handleAppStateChange
async function handleTabShowed() {
	const isNeedUpdate = await checkSystemVersion();
	if (isNeedUpdate) {
		showUpdateMeScreen();
	} else {
		updateSoftware(byPass, dataStorage.startAppAfterLoadStore);
	}
}

let alreadyShowReauthenPopUp = false;
function handleAfterDiffTime(store) {
	const hadPin = dataStorage.pinSetting !== 0;
	const { login } = store.getState() || {};
	const { email, loginObj } = login || {};
	const { accessToken, refreshToken, pin } = loginObj || {};
	if (!hadPin || !email || !accessToken || !refreshToken || !pin) return;

	dataStorage.pin = Util.getPinOriginal(loginObj);
	dataStorage.reAuthen = true;

	if (Controller.getLoginStatus() && !alreadyShowReauthenPopUp) {
		alreadyShowReauthenPopUp = true;
		showAutoLogin({
			callback: () => {
				setTimeout(() => {
					func.setLoginConfig(true);
					Navigation.dismissModal();
				}, 200);
				setTimeout(() => {
					alreadyShowReauthenPopUp = false;
				}, 4 * 60 * 1000);
			},
			byPassAuthenFn: () => null,
			isModal: true,
			token: refreshToken
		});
	}
}

function stateChange(nextAppState, store) {
	try {
		switch (nextAppState) {
			case 'active':
				if (dataStorage.tabShowed) {
					handleTabShowed();
				}
				if (func.getDiffTimeBackground()) {
					handleAfterDiffTime(store);
				}
				break;
			case 'background':
			case 'inactive':
				func.setInactiveTime();
				break;
			default:
				break;
		}
	} catch (error) {
		logDevice('error', `_handleAppStateChange EXCEPTION - ${error}`);
	}
}

function handleAppStateChange(store) {
	AppState.removeEventListener('change', state => stateChange(state, store));
	AppState.addEventListener('change', state => stateChange(state, store));
}
// #endregion
