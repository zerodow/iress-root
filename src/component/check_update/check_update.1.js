import codePush from 'react-native-code-push';
import { Alert, Platform, Linking } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import {
	logFirebase,
	logDevice,
	logAndReport
} from '../../lib/base/functionUtil';
import * as Controller from '../../memory/controller';
import VersionCheck from 'react-native-version-check';
import config from '../../config';
import { dataStorage } from '../../storage';
import {
	setJSExceptionHandler,
	setNativeExceptionHandler
} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as api from '../../api';

import { showBusyBoxScreen } from '../../navigation/controller';

const codePushOptions = {
	updateDialog: false,
	installMode: codePush.InstallMode.IMMEDIATE
	// installMode: Platform.OS === 'ios' ? codePush.InstallMode.ON_NEXT_RESTART : codePush.InstallMode.IMMEDIATE
};

// #region checkSystemVersion
async function getAndCheckVersion(resolve) {
	const url = `${Controller.getBaseUrl(true)}/${Controller.getVersion('version')}/info`;

	try {
		const data = await api.requestDataTimeoutCancel(url);
		if (!data) return resolve(true);
		const {
			iress,
			ios_caching: iosCache = '',
			android_caching: androidCache = '',
			ios_build: iosBuild,
			ios_next_build: iosNextBuild,
			android_build: androidBuild,
			android_next_build: androidNextBuild
		} = data;
		Controller.setIressStatus(iress || false);

		// Log
		const log = {
			isDemo: Controller.isDemo(),
			url,
			response: data,
			currentIosVersion: config.currentIosVersion,
			currentAndroidVersion: config.currentAndroidVersion
		};
		logDevice(
			'info',
			`${Platform.OS === 'ios' ? 'IOS - ' : 'ANDROID - '
			}GET SYMTEM VERSION RESPONSE: ${JSON.stringify(log)}`
		);

		const isIos = Platform.OS === 'ios';

		// cache
		dataStorage.cachingVersion = isIos ? iosCache : androidCache;

		// Check Version
		if (
			isIos &&
			config.currentIosVersion !== iosBuild &&
			config.currentIosVersion !== iosNextBuild
		) {
			return resolve(true);
		}
		if (
			!isIos &&
			config.currentAndroidVersion !== androidBuild &&
			config.currentAndroidVersion !== androidNextBuild
		) {
			return resolve(true);
		}

		return resolve(false);
	} catch (error) {
		logDevice('error', `GET APP INFO ERROR - ${error}`);
		return resolve(false);
	}
}

export function checkSystemVersion() {
	try {
		return new Promise(resolve => getAndCheckVersion(resolve));
	} catch (error) {
		console.log(`checkSystemVersion error: ${error}`);
		logDevice('info', `checkSystemVersion error: ${error}`);
		return new Promise((resolve, reject) => {
			resolve(false);
		});
	}
}

// #endregion

// #region exceptionHandler

function resetApp(errorMsg) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', config.logChanel);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({ text: errorMsg }));

	logDevice('error', errorMsg);
	RNRestart.Restart();
}

function errorHandler(e, isFatal) {
	if (isFatal) {
		const {
			name = 'UNKNOW_REASON_NAME',
			message = 'UNKNOW_REASON_MESSAGE'
		} = e || {};
		const fatalString = isFatal ? 'Fatal:' : '';
		const content = `
			Error: ${fatalString} ${name} ${message}
			We will need to restart the app.
			`;

		Alert.alert('Unexpected error occurred', content, [
			{
				text: 'Restart',
				onPress: () => {
					resetApp(content);
				}
			}
		]);
	} else {
		console.log(e); // So that we can see it in the ADB logs in case of Android if needed
	}
}

const nativeErrorCallback = exceptionString => {
	console.log(
		'exceptionHandler CheckUpdate logAndReport exception: ',
		exceptionString
	);
	logAndReport(
		'throw nativeErrorCallback',
		exceptionString,
		'nativeErrorCallback'
	);
	logDevice('error', `nativeErrorCallback: ${exceptionString}`);
	const content = `
		Error: ${exceptionString}
		We will need to restart the app.
		`;

	Alert.alert('Unexpected error occurred', content, [
		{
			text: 'Restart',
			onPress: () => {
				resetApp(content);
			}
		}
	]);
};

export function exceptionHandler() {
	if (!config.exceptionHanlder) return;
	setJSExceptionHandler(errorHandler);
	setNativeExceptionHandler(nativeErrorCallback, false);
}

// #endregion

// #region updateSoftware
let handledUTD = false;
export function updateSoftware(
	byPass = true,
	handlerUpToDate = () => null,
	showDownloadingComp = () => null
) {
	try {
		if (byPass) {
			!handledUTD && handlerUpToDate();
			handledUTD = true;
			return;
		}

		logFirebase('updateSoftware...');
		const {
			env,
			appleStore: { appId, appName }
		} = config;

		if (Platform.OS === 'ios') {
			VersionCheck.setAppID(appId);
			VersionCheck.setAppName(appName);
		}

		const isDev = env === 'dev';

		// is Dev
		if (isDev) {
			logDevice('info', 'CODE PUSH SYNC DOWNLOAD PROGRESS');
			codePush.sync(
				codePushOptions,
				syncStatus =>
					changStateCodePush(
						syncStatus,
						handlerUpToDate,
						showDownloadingComp
					),
				downloadProgressCallback
			);
			return;
		}

		// is Prod
		VersionCheck.needUpdate().then(async res => {
			logDevice('info', `Need update app: ${res.isNeeded}`);
			if (res.isNeeded) {
				logDevice('info', `Go to store url`);
				SplashScreen.hide();
				Linking.openURL(await VersionCheck.getStoreUrl()); // open store if update is needed.
			} else {
				logDevice('info', 'CODE PUSH SYNC');
				codePush.sync(codePushOptions, syncStatus =>
					changStateCodePush(
						syncStatus,
						handlerUpToDate,
						showDownloadingComp
					)
				);
			}
		});
	} catch (error) {
		logDevice('info', `Update software error: ${error}`);
	}
}

const {
	CHECKING_FOR_UPDATE,
	DOWNLOADING_PACKAGE,
	INSTALLING_UPDATE,
	UNKNOWN_ERROR,
	UPDATE_INSTALLED,
	UP_TO_DATE
} = codePush.SyncStatus;

let timeOutId = null;
function checkingForUpdate(handlerUpToDate) {
	// go to app after 2000ms timeout
	timeOutId = setTimeout(() => {
		!handledUTD && handlerUpToDate();
		handledUTD = true;
	}, 2000);
}

function downloadingPackage(showDownloadingComp) {
	dataStorage.isByPassAuthen = true; // by pass auto login

	logDevice('info', `BYPASS AUTHEN = ${dataStorage.isByPassAuthen}`);

	// Off touch alert android -> crash view decor view
	if (showDownloadingComp) {
		SplashScreen.hide();
		showDownloadingComp(true);
		return;
	}
	logDevice('info', 'CODEPUSH - UPDATING busy box screen');
	showBusyBoxScreen({
		isUpgrade: false,
		isUpdating: true
	});
}

function downloadProgressCallback(progress) {
	try {
		const { receivedBytes = 0, totalBytes = 0 } = progress;
		let percent = 0;
		if (totalBytes) {
			percent = Math.round((receivedBytes / totalBytes) * 10000) / 100;
		}
		const downloadProgress = progress
			? `${receivedBytes} of ${totalBytes} bytes`
			: 'Caculating...';
		dataStorage.callbackDownload &&
			dataStorage.callbackDownload(downloadProgress, percent);
	} catch (error) {
		logDevice(
			'info',
			`NATIVE - downloadProgressCallback exception with ${error}`
		);
	}
}

function changStateCodePush(syncStatus, handlerUpToDate, showDownloadingComp) {
	try {
		console.log('syncStatus: ', syncStatus);
		logDevice('info', 'NATIVE syncStatus...' + syncStatus);

		// if have delay to go to app before , clear it
		if (timeOutId) {
			clearTimeout(timeOutId);
			timeOutId = null;
		}

		switch (syncStatus) {
			case CHECKING_FOR_UPDATE:
				checkingForUpdate(handlerUpToDate);
				break;
			case DOWNLOADING_PACKAGE:
				downloadingPackage(showDownloadingComp);
				break;
			case INSTALLING_UPDATE:
				logDevice(
					'info',
					'NATIVE - CODE PUSH INSTALLING_UPDATE: ' + syncStatus
				);
				break;
			case UP_TO_DATE:
				logDevice(
					'info',
					'NATIVE - CODE PUSH UP_TO_DATE: ' + syncStatus
				);
				!handledUTD && handlerUpToDate();
				handledUTD = true;
				break;
			case UPDATE_INSTALLED:
				logDevice(
					'info',
					'NATIVE - CODE PUSH UPDATE INSTALLED ' + syncStatus
				);
				break;
			case UNKNOWN_ERROR:
				logDevice(
					'info',
					'NATIVE - CODE PUSH UNKOWN ERROR ' + syncStatus
				);
				!handledUTD && handlerUpToDate();
				handledUTD = true;
				break;
			default:
				logDevice(
					'info',
					'NATIVE - CODE PUSH DEFAULT HANDLE' + syncStatus
				);
				!handledUTD && handlerUpToDate();
				handledUTD = true;
				break;
		}
	} catch (error) {
		logDevice(
			'error',
			`NATIVE - CODE PUSH changStateCodePush exception - error: ${error}`
		);
	}
}

// #endregion
