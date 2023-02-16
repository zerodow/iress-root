import React from 'react';

import codePush from 'react-native-code-push';
import { Alert, Platform, Linking } from 'react-native';
import { Navigation } from 'react-native-navigation';
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
import RNFetchBlob from 'rn-fetch-blob';

import * as api from '../../api';
if (!global.fetch) {
	global.fetch = require('fetch').fetch;
}

// global.fetch = async (url, params = {}) => {
// 	try {
// 		const res = await RNFetchBlob.config({
// 			trusty: true
// 		}).fetch(
// 			params.method || 'GET',
// 			url,
// 			params.headers || {},
// 			JSON.stringify(params.body || {})
// 		);

// 		const info = await res.info();

// 		return {
// 			...res,
// 			...info
// 		};
// 	} catch (error) {
// 		return await
// 	}
// };

export default class CheckUpdate {
	constructor(handlerUpToDate, handlerUpdatedSuccess, showFn) {
		this.showFn = showFn;
		this.handlerUpdatedSuccess = handlerUpdatedSuccess;
		this.handlerUpToDate = handlerUpToDate;
		this.updateSoftware = this.updateSoftware.bind(this);
		this.exceptionHandler();
		this.checking = false;
	}

	exceptionHandler() {
		if (config.exceptionHanlder) {
			const resetApp = (errorMessage) => {
				const request = new XMLHttpRequest();
				request.open('POST', config.logChanel);
				request.setRequestHeader('Content-Type', 'application/json');
				request.send(JSON.stringify({ text: errorMessage }));
				logDevice('error', errorMessage);
				RNRestart.Restart();
			};
			const errorHandler = (e, isFatal) => {
				if (isFatal) {
					const content = `
                    Error: ${isFatal ? 'Fatal:' : ''} ${
						e ? e.name : 'UNKNOW_REASON_NAME'
					} ${e ? e.message : 'UNKNOW_REASON_MESSAGE'}
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
			};
			const nativeErrorCallback = (exceptionString) => {
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
			setJSExceptionHandler(errorHandler);
			setNativeExceptionHandler(nativeErrorCallback, false);
		} else {
		}
	}

	downloadProgressCallback(progress) {
		try {
			const recei = progress.receivedBytes || 0;
			const total = progress.totalBytes || 0;
			let percent = 0;
			if (total) {
				percent = Math.round((recei / total) * 100);
			}
			const downloadProgress = progress
				? `${progress.receivedBytes} of ${progress.totalBytes} bytes`
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

	checkSystemVersion() {
		try {
			const url = `${Controller.getBaseUrl(true)}/${Controller.getVersion(
				'version'
			)}/info`;
			return new Promise((resolve, reject) => {
				api.requestDataTimeoutCancel(url)
					.then((data) => {
						if (data) {
							// Set status for iress
							const iress =
								data.iress === undefined || data.iress === null
									? false
									: data.iress;
							Controller.setIressStatus(iress);
							const log = {
								isDemo: Controller.isDemo(),
								url,
								response: data,
								currentIosVersion: config.currentIosVersion,
								currentAndroidVersion:
									config.currentAndroidVersion
							};
							dataStorage.cachingVersion =
								Platform.OS === 'ios'
									? data.ios_caching || ''
									: data.android_caching || '';
							logDevice(
								'info',
								`${
									Platform.OS === 'ios'
										? 'IOS - '
										: 'ANDROID - '
								}GET SYMTEM VERSION RESPONSE: ${JSON.stringify(
									log
								)}`
							);
							if (Platform.OS === 'ios') {
								if (
									config.currentIosVersion <=
										data.ios_build &&
									config.currentIosVersion <=
										data.ios_next_build
								) {
									return resolve(true);
								}
								return resolve(false);
							} else {
								if (
									config.currentAndroidVersion <=
										data.android_build &&
									config.currentAndroidVersion <=
										data.android_next_build
								) {
									return resolve(true);
								}
								return resolve(false);
							}
						} else {
							return resolve(true);
						}
					})
					.catch((error) => {
						logDevice(
							'error',
							`checkSystemVersion ERROR - ${error}`
						);
						return resolve(false);
					});
			});
		} catch (error) {
			console.log(`checkSystemVersion EXCEPTION: ${error}`);
			logDevice('info', `checkSystemVersion EXCEPTION: ${error}`);
		}
	}

	timeout = (ms) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	showBusyBox() {
		Navigation.startSingleScreenApp({
			screen: {
				screen: 'equix.BusyBox',
				navigatorStyle: {
					drawUnderNavBar: true,
					navBarHidden: true,
					navBarHideOnScroll: false,
					statusBarTextColorScheme: 'light',
					navBarNoBorder: true
				},
				passProps: {
					isUpgrade: false,
					isUpdating: true
				},
				animationType: 'none'
			}
		});
	}

	async checkCodepushUpdate() {
		if (this.checking) return;
		this.checking = true;
		codePush.notifyAppReady();
		try {
			const remotePackage = await Promise.race([
				codePush.checkForUpdate(),
				this.timeout(10000)
			]);

			if (!remotePackage) {
				throw new Error('empty or timeout');
			}

			if (this.showFn) {
				SplashScreen.hide();
				this.showFn(true);
			} else {
				logDevice('info', 'CODEPUSH - UPDATING busy box screen');
				SplashScreen.hide();
				this.showBusyBox();
			}

			const LocalPackage = await remotePackage.download((progress) => {
				dataStorage.isByPassAuthen = true; // by pass auto login
				// Off touch alert android -> crash view decor view

				this.downloadProgressCallback(progress);
			});
			await LocalPackage.install(codePush.InstallMode.IMMEDIATE);
		} catch (error) {
			// continue
			this.handlerUpToDate && this.handlerUpToDate();
			this.handlerUpToDate = null;
			this.checking = false;
		}
	}

	updateSoftware(byPass = true) {
		try {
			if (byPass) {
				this.handlerUpToDate && this.handlerUpToDate();
				this.handlerUpToDate = null;
			} else {
				logFirebase('updateSoftware...');
				if (Platform.OS === 'ios') {
					VersionCheck.setAppID(config.appleStore.appId);
					VersionCheck.setAppName(config.appleStore.appName);
				}
				if (config.env !== 'dev') {
					VersionCheck.needUpdate().then(async (res) => {
						logDevice('info', `Need update app: ${res.isNeeded}`);
						if (res.isNeeded) {
							SplashScreen.hide();
							logDevice('info', `Go to store url`);
							Linking.openURL(await VersionCheck.getStoreUrl()); // open store if update is needed.
						} else {
							logDevice('info', 'CODE PUSH SYNC');
							this.checkCodepushUpdate();
						}
					});
				} else {
					logDevice('info', 'CODE PUSH SYNC DOWNLOAD PROGRESS');
					this.checkCodepushUpdate();
				}
			}
		} catch (error) {
			logDevice('info', `Update software error: ${error}`);
		}
	}
}
