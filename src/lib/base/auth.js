import React, { Component } from 'react';
import { Platform, PixelRatio, AppState } from 'react-native';
import PasscodeAuth from 'react-native-passcode-auth';
import config from '../../config';
import firebase from '../../firebase';
import { func, dataStorage } from '../../storage';
import I18n from '../../modules/language/';
import { iconsMap } from '../../../src/utils/AppIcons';
import Prompt from '../../component/prompt_auth/prompt';
import { logFirebaseError, logDevice, saveItemInLocalStorage, touchIDComplete } from './functionUtil';
// import LocalAuth from 'react-native-local-auth';
// import Finger from 'react-native-touch-id-android'
import { postData, getAuthUrl } from '../../../src/api'
import authCode from '../../constants/authCode'
import loginUserType from '../../constants/login_user_type'
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as loginActions from '../../screens/login/login.actions'
import StateApp from '../../../src/lib/base/helper/appState'
import * as authSettingActions from '../../screens/setting/auth_setting/auth_setting.actions'
import * as Controller from '../../memory/controller'
import * as manageAppState from '../../manage/manageAppState'
import * as Business from '../../business'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

export default class Auth {
	constructor(nav, email, token, showFormLogin) {
		// logFirebaseError('init Auth');
		this.navigator = nav;
		this.email = email;
		this.successCallback = null;
		this.cancelCallback = null;
		this.showAndroidTouchIdCallback = null;
		this.hideAndroidTouchIdCallback = null;
		this.androidTouchIDFail = null;
		this.numberFingerFailAndroid = 0;
		this.showFormLogin = showFormLogin;
		this.params = null;
		this.token = token;
		this.auth = true;
		this.state = true;
		this.updateInfomation = this.updateInfomation.bind(this);
		this.authWithFBAccount = this.authWithFBAccount.bind(this)
		this.authWithFBToken = this.authWithFBToken.bind(this)
		this.authentication = this.authentication.bind(this);
		this.androidTouchID = this.androidTouchID.bind(this);
		this.checkAndroidTouchID = this.checkAndroidTouchID.bind(this);
		this.checkIosTouchID = this.checkIosTouchID.bind(this);
		this.loginTokenError = this.loginTokenError.bind(this);
		this.authPassCode = this.authPassCode.bind(this);
		this.loginSuccess = this.loginSuccess.bind(this);
		this.authTouchId = this.authTouchId.bind(this);
		this.authenticationAlways = this.authenticationAlways.bind(this);
		this.loginWithPassword = this.loginWithPassword.bind(this);
		this.showLoginForm = this.showLoginForm.bind(this);
		this.registerAppState = this.registerAppState.bind(this)
		this.removeAppState = this.removeAppState.bind(this)
		this.handleAppStateChange = this.handleAppStateChange.bind(this)
		// reenable touch id when app come from background
		const userId = func.getUserId();
		this.user = Controller.getUserInfo()
	}

	registerAppState() {
		// const params = {
		// 	type: 'auth',
		// 	screen,
		// 	handleFunction: this.handleAppStateChange
		// }
		// manageAppState.registerAppState(params)
		const type = 'auth'
		manageAppState.registerAppState(type, this.handleAppStateChange)
	}
	removeAppState() {
		// const params = {
		// 	type: 'auth',
		// 	screen
		// }
		// manageAppState.unRegisterAppState(params)
		const type = 'auth'
		manageAppState.unRegisterAppState(type)
	}

	handleAppStateChange(nextAppState) {
		if (nextAppState === 'active') {
			if (!this.state) {
				this.state = true;
				// this.androidTouchID(true);
				// check xem truoc do co popup touchID, Pin chua
				if (dataStorage.onAuthenticating) {
					this.androidTouchID(true);
				}
			}
		} else if (nextAppState === 'background' ||
			nextAppState === 'inactive') {
			this.state = false;
			// Finger.dismiss()
		}
	}
	updateInfomation(nav, email, token, showFormLogin) {
		this.navigator = nav;
		this.email = email;
		this.token = token;
		this.showFormLogin = showFormLogin;
	}

	componentWillUnmount() {
		this.removeAppState()
	}

	_handleAppStateChange(nextAppState) {
		logDevice('info', `APP STATE `, nextAppState)
	}

	authenticationAlways(successFn, cancelCallback, ...params) {
		logFirebaseError('authenticationAlways');
		this.successCallback = successFn;
		this.cancelCallback = cancelCallback;
		this.params = params;
		// if (!this.auth) {
		//     if (this.successCallback) {
		//         this.successCallback(...params);
		//         return;
		//     }
		// }
		if (dataStorage.platform === 'ios') {
			// TouchID.isSupported()
			// 	.then(this.authTouchId)
			// 	.catch(error => {
			// 		logFirebaseError('Touch Id is not support');
			// 		console.log('Touch Id is not support');
			// 		PasscodeAuth.isSupported()
			// 			.then(this.authPassCode)
			// 			.catch(error => {
			// 				logFirebaseError('Touch Id is not support showFormLogin: ' + error);
			// 				this.showFormLogin && this.showFormLogin();
			// 			});
			// 	});
		} else {
			logFirebaseError(' this.showFormLogin && this.showFormLogin();');
			this.showFormLogin && this.showFormLogin();
		}
	}

	checkAndroidTouchID(isSetLoggedIn) {
		try {
			Finger
				.isSensorAvailable()
				.then(() => {
					logDevice('info', `ANDROID FINGERPRINT SUPPORTED`)
					this.registerAppState()
					// !dataStorage.isLockTouchID && this.showAndroidTouchIdCallback && this.showAndroidTouchIdCallback(this.params);
					this.authTouchId(isSetLoggedIn)
				})
				.catch(error => {
					logFirebaseError('Android Touch Id is not support');
					this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				})
		} catch (error) {
			console.log(error)
			this.hideAndroidTouchIdCallback && this.hideAndroidTouchIdCallback();
			this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
		}
	}
	checkIosTouchID(isSetLoggedIn) {
		// LocalAuth
		// 	.hasTouchID()
		// 	.then(this.authTouchId(isSetLoggedIn))
		// 	.catch(error => {
		// 		logFirebaseError('Ios Touch Id is not support');
		// 		logFirebaseError(error);
		// 		this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
		// 	});
	}
	androidTouchID(isSetLoggedIn) {
		logDevice('info', `ANDROID FINGER PRINT`)
		if (this.numberFingerFailAndroid >= 3) {
			logDevice('info', `ANDROID FINGER PRINT FAILED 3 TIMES -> SHOW PIN`)
			this.hideAndroidTouchIdCallback && this.hideAndroidTouchIdCallback();
			setTimeout(() => {
				this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
			}, 200)
			this.numberFingerFailAndroid = 0;
		} else {
			try {
				if (!dataStorage.isLockTouchID) {
					this.showAndroidTouchIdCallback && this.showAndroidTouchIdCallback(this.params)
					Finger
						.requestTouch()
						.then(success => {
							logDevice('info', `ANDROID FINGER PRINT AUTHEN SUCCESS`)
							// this.removeAppState()
							dataStorage.isLockTouchID = false;
							this.hideAndroidTouchIdCallback && this.hideAndroidTouchIdCallback();
							if (isSetLoggedIn) func.setLoginConfig(true)
							if (this.successCallback) {
								// this.successCallback(...this.params);
								touchIDComplete(this.successCallback, error => {
									const { errorCode } = error
									// if (errorCode === 'No internet connection') {
									//                                     logDevice('info', `ANDROID FINGER PRINT NOT INTERNET CONNECTION`)
									//                                     const alertContent = `There is no Internet connection.
									// Please check and try again!`
									//                                     const btnText = 'OK';
									//                                     this.cancelCallback && this.cancelCallback(alertContent, btnText, true) // Callback show network alert
									// }
								}, ...this.params)
							}
							logDevice('info', `ANDROID FINGER PRINT AUTHEN SUCCESS`)
							console.log('Authenticated Successfully');
						})
						.catch(error => {
							logDevice('info', `ANDROID FINGER PRINT AUTHEN FAIL - ERROR: ${error}`)
							if (error === 'LOCKED_OUT') {
								logDevice('info', `ANDROID FINGER PRINT IS LOCKED - ERROR: ${error}`)
								dataStorage.isLockTouchID = true;
								// Offsetting touch id on android
								const email = dataStorage.emailLogin.toLowerCase() ||
									dataStorage.userPin.email.toLowerCase() ||
									Controller.getUserLoginId().toLowerCase()
								const obj = {
									email,
									enableTouchID: false,
									numberFailEnterPin: dataStorage.userPin.numberFailEnterPin
								}
								saveItemInLocalStorage(
									email, obj, null,
									() => {
										dataStorage.userPin.enableTouchID = false;
										// Offsetting touch id on ios
										Controller.dispatch(authSettingActions.turnOffTouchID())
										this.hideAndroidTouchIdCallback && this.hideAndroidTouchIdCallback()
										setTimeout(() => {
											this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
										}, 200)
										this.numberFingerFailAndroid = 0;
									},
									() => console.log('save user pin info fail')
								)
							} else {
								logDevice('info', `ANDROID FINGER PRINT !== LOCKED_OUT: ${error}`)
								// Xác thực sai hoặc sai quá nhiều -> lock sensor
								// 1001 -> xac thuc sai
								// 9 -> lock sensor
								// 5 -> Keep your finger on the sensor a little longer
								// 1 -> Make sure your finger covers the entire sensor
								// 2 -> Make sure your finger covers the entire sensor
								const arrError = error.split('_');
								let errCode;
								let errMessage;
								if (arrError.length >= 2) {
									errCode = arrError[0];
									errMessage = arrError[1];

									switch (errCode) {
										case '9':
											dataStorage.isLockTouchID = true;
											console.log(`ANDROID FINGER PRINT IS LOCKED SENSOR - ERROR: ${error}`)
											logDevice('info', `ANDROID FINGER PRINT IS LOCKED SENSOR - ERROR: ${error}`)
											this.hideAndroidTouchIdCallback && this.hideAndroidTouchIdCallback()
											setTimeout(() => {
												this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
											}, 200)
											this.numberFingerFailAndroid = 0;
											break;
										// case '1':
										// case '2':
										// case '5':
										// case '1001':
										// case '1022':
										// 	logDevice('info', `ANDROID FINGER PRINT NOT RECOGNIZED - ERROR: ${error}`)
										// 	dataStorage.isLockTouchID = false;
										// 	this.numberFingerFailAndroid++;
										// 	this.androidTouchIDFail && this.androidTouchIDFail(this.androidTouchID(isSetLoggedIn), this.numberFingerFailAndroid);
										// 	break;
										default:
											logDevice('info', `ANDROID FINGER PRINT NOT RECOGNIZED - ERROR: ${error}`)
											dataStorage.isLockTouchID = false;
											this.numberFingerFailAndroid++;
											this.androidTouchIDFail && this.androidTouchIDFail(this.androidTouchID(isSetLoggedIn), this.numberFingerFailAndroid);
											break;
										// console.log(`ANDROID FINGER PRINT ERROR CODE DEFAULT - ERROR: ${error}`)
										// logDevice('info', `ANDROID FINGER PRINT ERROR CODE DEFAULT - ERROR: ${error}`)
										// this.hideAndroidTouchIdCallback && this.hideAndroidTouchIdCallback()
										// setTimeout(() => {
										// 	this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
										// }, 200)
										// this.numberFingerFailAndroid = 0;
										// break;
									}
								} else {
									console.log(`ANDROID FINGER PRINT UNKNOW ERROR: ${error}`)
									logDevice('info', `ANDROID FINGER PRINT UNKNOW ERROR: ${error}`)
									this.hideAndroidTouchIdCallback && this.hideAndroidTouchIdCallback()
									setTimeout(() => {
										this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
									}, 200)
									this.numberFingerFailAndroid = 0;
								}
							}
						})
				} else {
					logDevice('info', `ANDROID FINGER PRINT IS LOCKED -> SHOW PIN`)
					this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				}
			} catch (error) {
				logDevice('info', `ANDROID FINGER PRINT EXCEPTION - ERROR: ${error}`)
				this.hideAndroidTouchIdCallback && this.hideAndroidTouchIdCallback();
				setTimeout(() => {
					this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				}, 200)
			}
		}
	}

	dismissFinger(hideFn) {
		return () => {
			// Finger.dismiss()
			hideFn && hideFn()
			this.removeAppState && this.removeAppState()
		}
	}

	authentication(successFn, cancelCallback, objAndroidTouchIDFn, ...params) {
		logFirebaseError('authentication');
		this.successCallback = successFn;
		this.cancelCallback = cancelCallback;
		if (objAndroidTouchIDFn) {
			if (objAndroidTouchIDFn.hasOwnProperty('showAndroidTouchID')) {
				this.showAndroidTouchIdCallback = objAndroidTouchIDFn.showAndroidTouchID;
			}
			if (objAndroidTouchIDFn.hasOwnProperty('hideAndroidTouchID')) {
				this.hideAndroidTouchIdCallback = this.dismissFinger(objAndroidTouchIDFn.hideAndroidTouchID);
			}
			if (objAndroidTouchIDFn.hasOwnProperty('androidTouchIDFail')) {
				this.androidTouchIDFail = objAndroidTouchIDFn.androidTouchIDFail
			}
		}
		// if (Platform.OS === 'android') {
		// 	this.registerAppState()
		// }
		this.params = params;
		logDevice('info', `AUTHENTICATION PARAMS: ${JSON.stringify(this.params)}`)
		let isForgotPin = false;
		let isSetLoggedIn = true;
		// TH bật touch id, nhưng đã sign out không có pin trong local storage -> Nhập pin xác thực cho lần đầu
		if (this.params.length && this.params[0].usePin) {
			this.auth = false // su dung xac thuc pin
		} else {
			this.auth = dataStorage.userPin.enableTouchID;
		}
		if (this.params.length > 0 && this.params[0].isForgotPin) isForgotPin = true
		if (this.params.length > 0 && Object.keys(this.params[0])[0] === 'isSetLoggedIn' && this.params[0].isSetLoggedIn === false) isSetLoggedIn = false;
		if (isForgotPin) {
			this.showFormLogin && this.showFormLogin(this.successCallback, ...this.params);
		} else {
			const isConfirm = func.getLoginConfig();
			if (!this.auth || isConfirm) {
				if (isConfirm) {
					if (isSetLoggedIn) {
						logDevice('info', `AUTHENTICATION NO CONFIRM -> SUCCESS CALLBACK`)
						logFirebaseError('ko can confirm');
						if (this.successCallback) {
							this.successCallback(...params);
						}
					} else if (!this.auth) {
						logDevice('info', `AUTHENTICATION USE PIN`)
						this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
					} else {
						logDevice('info', `AUTHENTICATION USE TOUCHID/FINGERPRINT`)
						if (Platform.OS === 'ios') {
							this.checkIosTouchID(isSetLoggedIn);
						} else {
							this.checkAndroidTouchID(isSetLoggedIn)
						}
					}
				} else {
					this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				}
			} else if (Platform.OS === 'ios') {
				this.checkIosTouchID(isSetLoggedIn);
			} else {
				this.checkAndroidTouchID(isSetLoggedIn)
			}
		}
	}

	authPassCode(isSetLoggedIn) {
		logFirebaseError('authPassCode');
		PasscodeAuth.authenticate(I18n.t('loginQuestion'))
			.then((success) => {
				logFirebaseError('Authenticated Successfully');
				console.log('Authenticated Successfully');
				if (isSetLoggedIn) func.setLoginConfig(true)
				if (this.successCallback) {
					this.successCallback(...this.params);
				}
			})
			.catch((error) => {
				logFirebaseError('authPassCode LAErrorUserCancel: ' + error.message);
				if (!error || !error.message || error.name === 'PasscodeAuthUnknownError') {
					logFirebaseError('error passcode and this.showFormLogin && this.showFormLogin()');
					this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				}
				if (error.message !== 'LAErrorUserCancel') {
					if (this.cancelCallback) {
						logFirebaseError('cancelCallback: ' + error.message);
						this.cancelCallback();
					} else {
						logFirebaseError('loginTokenError: ' + error.message);
						this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
					}
				}
			});
	}

	loginTokenError(error) {
		console.log('error login token: ', error);
		this.loginWithPassword();
	}

	loginSuccess() {
		console.log('Success');
	}

	authWithFBAccount(email, password, submitSuccessCallback, forgotPinSuccessCallBack, submitErrorCallback, closeCb, errorCb, isForgotPin) {
		firebase.auth().signInWithEmailAndPassword(email, password)
			.then((user) => {
				if (!isForgotPin) {
					func.setLoginConfig(true);
					if (this.successCallback) {
						this.successCallback(...this.params);
					}
					if (submitSuccessCallback) {
						submitSuccessCallback();
					}
				} else if (forgotPinSuccessCallBack) {
					setTimeout(() => {
						closeCb && closeCb();
						setTimeout(() => {
							forgotPinSuccessCallBack();
						}, 500);
					}, 800);
				}
			})
			.catch((error) => {
				if (submitErrorCallback) {
					submitErrorCallback();
					setTimeout(() => {
						errorCb && errorCb();
					}, 500);
				}
			});
	}

	authWithFBToken(token, submitSuccessCallback, forgotPinSuccessCallBack, submitErrorCallback, closeCb, errorCb, isForgotPin) {
		firebase.auth().signInWithCustomToken(token).then((user) => {
			if (!isForgotPin) {
				func.setLoginConfig(true);
				if (this.successCallback) {
					this.successCallback(...this.params);
				}
				if (submitSuccessCallback) {
					submitSuccessCallback();
				}
			} else if (forgotPinSuccessCallBack) {
				setTimeout(() => {
					closeCb && closeCb();
					setTimeout(() => {
						forgotPinSuccessCallBack();
					}, 500);
				}, 800);
			}
		}).catch(error => {
			if (submitErrorCallback) {
				submitErrorCallback();
				setTimeout(() => {
					errorCb && errorCb();
				}, 500);
			}
		})
	}
	showLoginForm(isShow, title, subtitle, animation = '', endAnimation, cancelCallback, submitErrorCallback, submitSuccessCallback, forgotPinSuccessCallBack, setDisable, isDisable, isError, isForgotPin = false) {
		const listData1 = [{
			placeholder: I18n.t('password'),
			defaultValue: '',
			secureTextEntry: true,
			id: 'password',
			rightIcon: 'md-eye'
		}];
		const emailAuth = dataStorage.emailLogin
		if (isShow) {
			return (
				<Prompt
					title={title || 'Authentification'}
					subtitle={subtitle || emailAuth}
					cancelText={I18n.t('cancel')}
					submitText={I18n.t('ok')}
					onEndAnimation={() => {
						if (endAnimation) {
							endAnimation();
						}
					}}
					isError={isError}
					errorText={isError ? 'Authentication failed!' : ''}
					listInput={listData1}
					visible={isShow}
					onCancel={() => {
						if (cancelCallback) {
							cancelCallback();
						}
					}}
					submitDisabled={isDisable}
					animation={animation}
					easing={''}
					onSubmit={(value, closeCb, errorCb) => {
						if (setDisable) {
							setDisable();
						}
						if (!value) {
							if (submitErrorCallback) submitErrorCallback();
						}
						if (!value.password) if (submitErrorCallback) submitErrorCallback();
						const password = value.password;
						if (config.useParitechAccount) {
							logDevice('info', `SHOW LOGIN FROM - isDemo: ${Controller.isDemo()} - EMAIL: ${(emailAuth + '').toLocaleLowerCase()}`)
							const authUri = getAuthUrl();
							Business.getEncryptText(password)
								.then(res => {
									const { encryptText, sessionID } = res
									postData(
										authUri,
										{
											data:
											{
												username: (emailAuth + '').toLocaleLowerCase(),
												password: encryptText,
												session_id: password === encryptText ? null : sessionID,
												provider: Controller.isDemo() ? 'quantedge' : 'paritech'
											}
										}).then((data) => {
											if (data.errorCode) {
												const errorCode = data.errorCode;
												if (errorCode === authCode.INVALID_MAPPING) {
													this.authWithFBAccount(config.reviewAccount.usernameDefault, config.isProductVersion ? config.reviewAccount.passwordProduct : config.reviewAccount.passwordDefault, submitSuccessCallback, forgotPinSuccessCallBack, submitErrorCallback, closeCb, errorCb, isForgotPin);
												} else if (submitErrorCallback) {
													submitErrorCallback();
													setTimeout(() => {
														errorCb && errorCb();
													}, 500);
												}
											} else {
												const token = data ? data.accessToken : ''
												// this.authWithFBToken(token, submitSuccessCallback, forgotPinSuccessCallBack, submitErrorCallback, closeCb, errorCb, isForgotPin)
												if (!isForgotPin) {
													func.setLoginConfig(true);
													if (this.successCallback) {
														this.successCallback(...this.params);
													}
													if (submitSuccessCallback) {
														submitSuccessCallback();
													}
												} else if (forgotPinSuccessCallBack) {
													closeCb && closeCb();
													setTimeout(() => {
														forgotPinSuccessCallBack(token);
													}, 300);
												}
											}
										}).catch(() => {
											if (submitErrorCallback) {
												submitErrorCallback();
												setTimeout(() => {
													errorCb && errorCb();
												}, 500);
											}
										});
								})
						} else {
							// this.authWithFBAccount(emailAuth, password, submitSuccessCallback, forgotPinSuccessCallBack, submitErrorCallback, closeCb, errorCb, isForgotPin)
							if (!isForgotPin) {
								func.setLoginConfig(true);
								if (this.successCallback) {
									this.successCallback(...this.params);
								}
								if (submitSuccessCallback) {
									submitSuccessCallback();
								}
							} else if (forgotPinSuccessCallBack) {
								setTimeout(() => {
									closeCb && closeCb();
									setTimeout(() => {
										forgotPinSuccessCallBack();
									}, 500);
								}, 800);
							}
						}
					}} />
			);
		} else {
			return null
		}
	}

	loginWithPassword() {
		this.navigator.showModal({
			screen: 'equix.Login',
			backButtonTitle: '',
			title: I18n.t('Login'),
			navigatorStyle: {
				navBarHideOnScroll: false,
				statusBarColor: config.background.statusBar,
				statusBarTextColorScheme: 'light',
				navBarBackgroundColor: CommonStyle.statusBarBgColor,
				navBarTextColor: config.color.navigation,
				drawUnderNavBar: true,
				navBarTextFontSize: 18,
				navBarHidden: true,
				navBarButtonColor: config.button.navigation,
				navBarNoBorder: true,
				navBarSubtitleColor: 'white',
				navBarSubtitleFontFamily: 'HelveticaNeue',
				modalPresentationStyle: 'overCurrentContext'
			},
			passProps: {
				successFn: this.successCallback,
				params: this.params
			},
			navigatorButtons: {
				leftButtons: [
					{
						title: I18n.t('More'),
						icon: iconsMap['ios-arrow-back'],
						id: 'back_more'
					}
				]
			}
		});
	}

	authTouchId(isSetLoggedIn) {
		try {
			logFirebaseError('authTouchId: ');
			if (Platform.OS === 'ios') {
				// return LocalAuth
				// 	.authenticate({
				// 		reason: `${I18n.t('loginQuestion')} User Login: ${dataStorage.emailLogin ? dataStorage.emailLogin.toLowerCase() : ''}`,
				// 		falbackToPasscode: false,
				// 		suppressEnterPassword: false
				// 	})

				// 	.then(() => {
				// 		logDevice('info', `IOS TOUCHID SUCCESS`)
				// 		logFirebaseError('authTouchId: success');
				// 		if (isSetLoggedIn) func.setLoginConfig(true)
				// 		if (this.successCallback) {
				// 			// this.successCallback(...this.params);
				// 			touchIDComplete(this.successCallback, error => {
				// 				//                                 const { errorCode } = error
				// 				//                                 if (errorCode === 'No internet connection') {
				// 				//                                     const alertContent = `There is no Internet connection.
				// 				// Please check and try again!`
				// 				//                                     const btnText = 'OK';
				// 				//                                     this.cancelCallback && this.cancelCallback(alertContent, btnText, true) // Callback show network alert
				// 				//                                 }
				// 			}, ...this.params)
				// 		}
				// 		console.log('Authenticated Successfully');
				// 	})
				// 	.catch((error) => {
				// 		console.log(error)
				// 		// error.name = 'LAErrorSystemCancel';
				// 		logFirebaseError('authTouchId error: ' + error);
				// 		logFirebaseError(error);
				// 		logDevice('error', `TOUCH ID ERROR - ${error && error.name ? JSON.stringify(error) : error}`)
				// 		if (!error || !error.name || error.name === 'RCTTouchIDUnknownError') {
				// 			logFirebaseError('error TouchId and this.showFormLogin && this.showFormLogin()');
				// 			logDevice('error', `TOUCH ID ERROR: RCTTouchIDUnknownError`)
				// 			if (error.name === 'RCTTouchIDUnknownError') {
				// 				logFirebaseError('error TouchId RCTTouchIDUnknownError');
				// 				// this.authPassCode(isSetLoggedIn);
				// 				this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				// 			} else {
				// 				this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				// 			}
				// 		} else if (error.name === 'LAErrorUserCancel') {
				// 			try {
				// 				logDevice('error', `TOUCH ID CANCEL BY USER: LAErrorUserFallback`)
				// 				const byPass = this.params[0].byPass;
				// 				if (byPass === false) {
				// 					this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				// 				}
				// 			} catch (error) {
				// 				console.log(error)
				// 			}
				// 		} else if (error.name === 'LAErrorUserFallback' || error.name === 'LAErrorAuthenticationFailed') {
				// 			logFirebaseError('LAErrorUserFallback: authPassCode');
				// 			logDevice('error', `TOUCH ID ERROR: LAErrorUserFallback`)
				// 			console.log('this.params', this.params);
				// 			this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				// 		} else if (error.name === 'LAErrorTouchIDLockout') {
				// 			logDevice('error', `TOUCH ID ERROR: LAErrorTouchIDLockout`)
				// 			dataStorage.isLockTouchID = true;
				// 			const email = dataStorage.emailLogin.toLowerCase() ||
				// 				dataStorage.userPin.email.toLowerCase() ||
				// 				Controller.getUserLoginId().toLowerCase()
				// 			const obj = {
				// 				email,
				// 				enableTouchID: false,
				// 				numberFailEnterPin: dataStorage.userPin.numberFailEnterPin
				// 			}
				// 			saveItemInLocalStorage(
				// 				email, obj, null,
				// 				() => {
				// 					dataStorage.userPin.enableTouchID = false;
				// 					// Offsetting touch id on ios
				// 					Controller.dispatch(authSettingActions.turnOffTouchID())
				// 				},
				// 				() => console.log('save user pin info fail')
				// 			)
				// 			this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				// 		} else {
				// 			logDevice('error', `TOUCH ID OTHER ERROR`)
				// 			this.showFormLogin && this.successCallback && this.showFormLogin(this.successCallback, ...this.params);
				// 		}
				// 	});
			} else {
				this.androidTouchID(isSetLoggedIn)
			}
		} catch (error) {
			console.log(error)
			logFirebaseError('error authTouchId: ' + error);
		}
	}
}
