import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '~/manage/manageLocalStorage';

import Enum from './enum';
import clone from 'clone';
import Big from 'big.js';
import * as api from '../src/api';
import * as settingActions from '../src/screens/setting/setting.actions';
import { dataStorage, func } from '../src/storage';
import config from '../src/config';
import * as appActions from '../src/app.actions';
import * as loginActions from '../src/screens/login/login.actions';
import { logDevice } from '../src/lib/base/functionUtil';
import loginUserType from '../src/constants/login_user_type';
import uuid from 'react-native-uuid';
import I18n from './modules/language';
import moment from 'moment';
import _ from 'lodash';
import * as Controller from './memory/controller';
import CryptoJS from 'crypto-js';
import DeviceInfo from 'react-native-device-info';
import * as fbemit from './emitter';
import HOME_SCREEN from '~/constants/home_screen.json';

const FORMAT_TIME = Enum.FORMAT_TIME;
const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
const TREND_VALUE = Enum.TREND_VALUE;
const TOTAL_MILISECOND_1D = 24 * 60 * 60 * 1000;
const { LIST_FILTER_ACTION } = Enum;

const colors = config.colors1;

export const getListOrderAfterRemoveDuplicate = (originalList) => {
    if (!originalList || originalList.length === 0) return [];
    const objAfterRemoveDuplicate = {};
    for (let i = 0; i < originalList.length; i++) {
        const element = originalList[i];
        const brokerID = element.broker_order_id;
        if (objAfterRemoveDuplicate.hasOwnProperty(brokerID)) continue;
        objAfterRemoveDuplicate[brokerID] = originalList[i];
    }
    const listAfterRemoveDuplicate = getValueObject(objAfterRemoveDuplicate);
    return listAfterRemoveDuplicate;
};

export const encrypt = (text, secretKey) => {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
};

export const decrypt = (text, secretKey) => {
    const bytes = CryptoJS.AES.decrypt(text, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
};

export const getPinOriginal = (loginObj) => {
    const pin = loginObj.pin;
    const encryptPinStatus = loginObj.encryptPinStatus;
    if (encryptPinStatus) {
        return decrypt(pin, Enum.SECRET_KEY_ENCRYPT);
    }
    return pin;
};

export const getPriceMapKeyFromValue = (value) => {
    const priceMapKey = Enum.PRICE_MAP_KEY;
    let key = '';
    Object.keys(priceMapKey).map((e) => {
        const priceValue = priceMapKey[e];
        if (priceValue === value) {
            key = e;
        }
    });
    return key;
};

export const convertObjToArray = (obj) => {
    if (!obj) return [];
    const newArray = [];
    Object.keys(obj).map((e) => {
        const item = obj[e];
        item.code = e;
        newArray.push(item);
    });
    return newArray;
};

export const getFilterActionDisplay = (filterAction) => {
    switch (filterAction) {
        case 'sign':
            return LIST_FILTER_ACTION.signInSignOut;
        case 'enter_pin':
            return LIST_FILTER_ACTION.enterPin;
        case 'symbol':
            return LIST_FILTER_ACTION.updateWatchList;
        case 'place_order':
            return LIST_FILTER_ACTION.placeOrder;
        case 'modify_order':
            return LIST_FILTER_ACTION.modifyOrder;
        case 'cancel_order':
            return LIST_FILTER_ACTION.cancelOrder;
        case 'query':
            return LIST_FILTER_ACTION.queryReport;
        case 'update_setting':
            return LIST_FILTER_ACTION.updateSetting;
        case 'saxo':
            return LIST_FILTER_ACTION.updateSCM;
        case 'change_news_source':
            return LIST_FILTER_ACTION.changeNewsSource;
        case 'change_status':
            return LIST_FILTER_ACTION.changeStatus;
        case 'change_AO':
            return LIST_FILTER_ACTION.changeao;
        case 'reset_password':
            return LIST_FILTER_ACTION.resetPasswordLower;
        case 'forgot_password':
            return LIST_FILTER_ACTION.forgotPasswordLower;
        case 'create_user':
            return LIST_FILTER_ACTION.createUser;
        case 'update_user':
            return LIST_FILTER_ACTION.updateUser;
        case 'create_role_group':
            return LIST_FILTER_ACTION.createRoleGroup;
        case 'update_role_group':
            return LIST_FILTER_ACTION.updateRoleGroup;
        case 'delete_role_group':
            return LIST_FILTER_ACTION.deleteRoleGroup;
        case 'change_market_data':
            return LIST_FILTER_ACTION.changeMarketData;
        case 'update_vetting_rule':
            return LIST_FILTER_ACTION.updateVettingRule;
        default:
            return LIST_FILTER_ACTION.all;
    }
};

export const getListSymbolObject = (stringQuery) => {
    const arrStringQuery = stringQuery.split(',');
    const listSymbolObject = [];
    for (let s = 0; s < arrStringQuery.length; s++) {
        const symbol = arrStringQuery[s];
        const exchange =
            dataStorage.symbolEquity[symbol] &&
                dataStorage.symbolEquity[symbol].exchanges
                ? dataStorage.symbolEquity[symbol].exchanges[0]
                : 'ASX';
        const symbolObject = {
            symbol,
            exchange
        };
        listSymbolObject.push(symbolObject);
    }
    return listSymbolObject;
};

export const getRandomKey = () => uuid.v4();

export const convertTimeToUTC = (time, timeZone = getCurrentTimezone()) => {
    return time - timeZone * 60 * 60 * 1000;
};

export const getEndTimeSession = (timeEnd, timeEndSession) => {
    if (timeEnd >= timeEndSession) {
        return timeEndSession;
    }
    return timeEnd;
};

export const calculateNumberBar = (
    timeStart,
    timeEnd,
    interval = 5 * 60 * 1000
) => {
    const start = timeStart || 0;
    const end = timeEnd || 0;
    return (end - start) / interval;
};

export const getSessionTime = (
    time,
    hour = 0,
    minute = 0,
    second = 0,
    milisecond = 0,
    timezone = getCurrentTimezone()
) => {
    const localTimeFollowExchange = getTimezoneCustom(
        time,
        hour,
        minute,
        second,
        milisecond,
        timezone
    );
    const localTime = convertToLocalTimeStamp(
        localTimeFollowExchange,
        timezone
    );
    return localTime;
};

export const subBarChart = (dataChart, symbol, interval = 5 * 60 * 1000) => {
    let bars = {};
    const isAuSymbol = isAuBySymbol(symbol);
    if (dataChart && Object.keys(dataChart).length > 0) {
        const firstKey = parseInt(Object.keys(dataChart)[0]);
        let startSessionTime;
        let endSessionTime;
        if (isAuSymbol) {
            // AU session: 10h - 16h10
            // Get start session time
            startSessionTime = getSessionTime(
                firstKey,
                Enum.OPEN_SESSION_AU_TIME.HOUR,
                Enum.OPEN_SESSION_AU_TIME.MINUTE,
                0,
                0,
                Controller.getTimeZoneAU()
            );
            // Get start session time
            endSessionTime = getSessionTime(
                firstKey,
                Enum.CLOSE_SESSION_AU_TIME.HOUR,
                Enum.CLOSE_SESSION_AU_TIME.MINUTE,
                0,
                0,
                Controller.getTimeZoneAU()
            );
        } else {
            // US session: 9h30 - 16
            startSessionTime = getSessionTime(
                firstKey,
                Enum.OPEN_SESSION_US_TIME.HOUR,
                Enum.OPEN_SESSION_US_TIME.MINUTE,
                0,
                0,
                Controller.getTimeZoneUS()
            );
            // Get start session time
            endSessionTime = getSessionTime(
                firstKey,
                Enum.CLOSE_SESSION_US_TIME.HOUR,
                Enum.CLOSE_SESSION_US_TIME.MINUTE,
                0,
                0,
                Controller.getTimeZoneUS()
            );
        }
        bars = subBarWithBlank(
            dataChart,
            startSessionTime,
            endSessionTime,
            interval
        );
    }
    return bars;
};

export const subBarWithBlank = (
    dataChart,
    startSessionTime,
    endSessionTime,
    interval = 5 * 60 * 1000
) => {
    const now = new Date().getTime();
    const start = startSessionTime;
    const end = getEndTimeSession(now, endSessionTime);
    const bars = {};
    const data = dataChart ? { ...dataChart } : {};
    let key = startSessionTime;
    const lengthBar = calculateNumberBar(start, end, interval);
    for (let i = 0; i < lengthBar; i++) {
        if (data[key]) {
            bars[key] = data[key];
        } else {
            const fakeData = {
                open: 0,
                close: 0,
                high: 0,
                low: 0,
                updated: key,
                volume: 0
            };
            bars[key] = fakeData;
        }
        key += interval;
    }
    return bars;
};

export const saveLastAccount = (userID, accountInfo = {}) => {
    const { status = 'active' } = accountInfo;
    if (status === 'inactive') return;
    const key = `${Controller.isDemo() ? 'demo' : 'prod'
        }_last_account_${userID}`;
    AsyncStorage.setItem(key, JSON.stringify(accountInfo))
        .then(() => {
            console.log(`Save last account success`);
        })
        .catch((error) => {
            console.log(`Save last account error: ${error}`);
        });
};

export const checkExitInListAccounts = (currentAccountID, listAccounts) => {
    if (listAccounts && listAccounts.length) {
        let isAccountExit = false;
        for (let i = 0; i < listAccounts.length; i++) {
            const element = listAccounts[i] || {};
            const accountID = element.account_id;
            if (currentAccountID === accountID) {
                isAccountExit = true;
                break;
            }
        }
        return isAccountExit;
    }
    return false;
};

export function checkLastAccountAdvisor(lastAccountInfo, resolve) {
    let isInside = false;
    const lastAccountID = lastAccountInfo.account_id;
    const url = api.getApiCheckAccountMapping(lastAccountID);
    api.requestData(url)
        .then((res) => {
            if (res) {
                isInside = true;
            }
            return resolve(isInside);
        })
        .catch((err) => {
            console.log(err);
            return resolve(false);
        });
}

export function checkListAccountAvailabelOperator(listAccount, resolve) {
    const listPromises = [];
    const listAccountAvailable = [];
    listAccount.map((account) => {
        const lastAccountID = account.account_id;
        const url = api.getApiCheckAccountMapping(lastAccountID);
        const promiseCheck = api.requestData(url);
        listPromises.push(promiseCheck);
    });
    Promise.all(listPromises).then((arrayAccount) => {
        arrayAccount.map((account) => {
            if (account) listAccountAvailable.push(account);
        });
        resolve(listAccountAvailable);
    });
}

export function checkLastAccountOperator(lastAccountInfo, resolve) {
    let isInside = false;
    const lastAccountID = lastAccountInfo.account_id;
    const url = api.getApiCheckAccountMapping(lastAccountID);
    api.requestData(url)
        .then((res) => {
            if (res) {
                isInside = true;
            }
            return resolve(isInside);
        })
        .catch((err) => {
            console.log(err);
            return resolve(false);
        });
}

export function checkLastAccountRetail(lastAccountInfo, params, resolve) {
    let isInside = false;
    const lastAccountID = lastAccountInfo.account_id;
    for (let i = 0; i < params.length; i++) {
        const accountIDMapping = params[i].account_id;
        if (lastAccountID === accountIDMapping) {
            isInside = true;
            break;
        }
    }
    if (resolve) return resolve(isInside);
    return isInside;
}

export const checkLastAccountExitOnListMappingAccount = (
    lastAccountInfo,
    params
) => {
    return new Promise((resolve) => {
        const userType = Controller.getUserType();
        if (userType === Enum.USER_TYPE.OPERATOR) {
            // Operator
            checkLastAccountOperator(lastAccountInfo, resolve);
        } else if (userType === Enum.USER_TYPE.ADVISOR) {
            // Advisor
            checkLastAccountAdvisor(lastAccountInfo, resolve);
        } else {
            // Retail
            if (!params || params.length < 1) {
                return resolve(false);
            }
            checkLastAccountRetail(lastAccountInfo, params, resolve);
        }
    });
};

export function checkLastAccountIsInactive(accountInfo, params) {
    const { status = 'active' } = accountInfo;
    return status === 'inactive';
}

const loadLastAccountOperator = ({ successCb, errorCb }) => {
    try {
        const key = `${Controller.isDemo() ? 'demo' : 'prod'
            }_last_account_${Controller.getUserId()}`;
        AsyncStorage.getItem(key)
            .then((data) => {
                if (data) {
                    let accountInfo = JSON.parse(data);
                    const isInactive = checkLastAccountIsInactive(accountInfo);
                    if (isInactive) {
                        errorCb && errorCb();
                    } else {
                        checkLastAccountExitOnListMappingAccount(
                            accountInfo,
                            []
                        ).then((lastAccountInsideMapping) => {
                            if (lastAccountInsideMapping) {
                                logDevice(
                                    'info',
                                    `LOAD LAST ACCOUNT - INFO: ${JSON.stringify(
                                        accountInfo
                                    )}`
                                );
                                Controller.setAllListAccount([accountInfo]);
                                setLoginUserType(accountInfo);
                                func.setAccountId(accountInfo.account_id);
                                dataStorage.currentAccount = accountInfo;
                                Controller.setCurrentAccount(accountInfo);
                                Controller.dispatch(
                                    loginActions.setAccountId(
                                        accountInfo.account_id
                                    )
                                );
                                successCb && successCb();
                            } else {
                                logDevice(
                                    'info',
                                    `LOAD LAST ACCOUNT - LAST ACCOUNT NOT INSIDE LIST MAPPING ACCOUNT`
                                );
                                errorCb && errorCb();
                            }
                        });
                    }
                } else {
                    logDevice('info', `LOAD LAST ACCOUNT - DATA IS NULL`);
                    errorCb && errorCb();
                }
            })
            .catch((error) => {
                logDevice('info', `GET LAST ACCOUNT ERROR: ${error}`);
                errorCb && errorCb();
            });
    } catch (error) {
        logDevice('info', `GET LAST ACCOUNT EXCEPTION: ${error}`);
        errorCb && errorCb();
    }
};

const loadLastAccount = ({ successCb, errorCb, params = {}, alwaysManage }) => {
    const key = `${Controller.isDemo() ? 'demo' : 'prod'
        }_last_account_${Controller.getUserId()}`;
    AsyncStorage.getItem(key)
        .then((data) => {
            if (data) {
                let accountInfo = JSON.parse(data);
                const isInactive = checkLastAccountIsInactive(
                    accountInfo,
                    params
                );
                if (isInactive) {
                    errorCb && errorCb();
                } else {
                    checkLastAccountExitOnListMappingAccount(
                        accountInfo,
                        params
                    ).then((lastAccountInsideMapping) => {
                        if (lastAccountInsideMapping) {
                            if (params.length > 0) {
                                const newAccountData = params.filter(
                                    (acc) =>
                                        acc.account_id ===
                                        accountInfo.account_id
                                );
                                if (
                                    Array.isArray(newAccountData) &&
                                    newAccountData.length > 0
                                ) {
                                    accountInfo = newAccountData[0];
                                }
                            }
                            logDevice(
                                'info',
                                `LOAD LAST ACCOUNT - INFO: ${JSON.stringify(
                                    accountInfo
                                )}`
                            );
                            setLoginUserType(accountInfo);
                            func.setAccountId(accountInfo.account_id);
                            dataStorage.currentAccount = accountInfo;
                            Controller.setCurrentAccount(accountInfo);
                            Controller.dispatch(
                                loginActions.setAccountId(
                                    accountInfo.account_id
                                )
                            );
                            successCb && successCb();
                        } else {
                            logDevice(
                                'info',
                                `LOAD LAST ACCOUNT - LAST ACCOUNT NOT INSIDE LIST MAPPING ACCOUNT`
                            );
                            errorCb && errorCb();
                        }
                    });
                }
            } else {
                logDevice('info', `LOAD LAST ACCOUNT - DATA IS NULL`);
                errorCb && errorCb();
            }
        })
        .catch((error) => {
            logDevice('info', `GET LAST ACCOUNT ERROR: ${error}`);
            errorCb && errorCb();
        });
};

export const setLoginUserType = (accountInfo) => {
    const k = accountInfo;
    if (k.status === 'inactive') {
        // Tài khoản bị khoá
        dataStorage.isLockedAccount = true;
        Controller.dispatch(appActions.setLoginUserType(loginUserType.LOCKED));
    } else {
        // Tài khoản member
        dataStorage.isLockedAccount = false;
        Controller.dispatch(appActions.setLoginUserType(loginUserType.MEMBER));
    }
};

export const subListAccount = ({
    listAccounts,
    isLoadLastAccount = true,
    isCheckFirstAccount = true,
    loadLastAccountCb,
    alwaysManage
}) => {
    const listTmp = [];
    let firstAccountId = null;
    if (listAccounts && listAccounts.length) {
        for (let i = 0; i < listAccounts.length; i++) {
            const tmp = parseInt(i % 21);
            const element = listAccounts[i] || {};
            const colorIndex = i < 21 ? i : tmp;
            element.color = colors[colorIndex];
            listTmp.push(element);
            if (!firstAccountId && isCheckFirstAccount) {
                // Check tài khoản đầu tiên vào là tài khoản đặc biệt
                setLoginUserType(element);
                firstAccountId = element.account_id;
                dataStorage.currentAccount = element;
                Controller.setCurrentAccount(element);
            }
        }

        const successCb = () => {
            console.log('load last account success');
            logDevice('info', 'load last account success');
            loadLastAccountCb && loadLastAccountCb();
        };
        const errorCb = () => {
            logDevice('info', 'load last account error -> set first account');
            func.setAccountId(firstAccountId);
            Controller.dispatch(loginActions.setAccountId(firstAccountId));
            loadLastAccountCb && loadLastAccountCb();
        };
        const params = listTmp;

        isLoadLastAccount &&
            loadLastAccount({ successCb, errorCb, params, alwaysManage });
        listTmp.sort((a, b) => {
            let aName = a.account_name || a.account_id;
            let bName = b.account_name || b.account_id;
            aName = aName + ''.toLowerCase();
            bName = bName + ''.toLowerCase();
            if (aName > bName) {
                return 1;
            } else if (aName < bName) {
                return -1;
            }
            return 0;
        });
        Controller.setAllListAccount(listTmp);
        dataStorage.isNotHaveAccount = false;
    } else {
        const userType = Controller.getUserType();
        if (
            userType === Enum.USER_TYPE.RETAIL ||
            userType === Enum.USER_TYPE.ADVISOR
        ) {
            // khong duoc map voi account nao
            Controller.setAllListAccount([]);
            func.setAccountId('');
            dataStorage.isNotHaveAccount = true;
            // dataStorage.currentAccount = {
            // 	account_name: '',
            // 	email: dataStorage.emailLogin
            // }
            // Controller.setCurrentAccount({
            // 	account_name: '',
            // 	email: dataStorage.emailLogin
            // })
            loadLastAccountCb && loadLastAccountCb();
        } else {
            // operator hoặc advisor 6 account đầu tiền get đều là inactive
            const successCb = () => {
                console.log('load last account success');
                logDevice('info', 'load last account success');
                loadLastAccountCb && loadLastAccountCb();
            };
            const errorCb = () => {
                logDevice(
                    'info',
                    'load last account error -> set first account'
                );
                func.setAccountId(firstAccountId);
                Controller.dispatch(loginActions.setAccountId(firstAccountId));
                loadLastAccountCb && loadLastAccountCb();
            };
            loadLastAccountOperator({ successCb, errorCb });
        }
    }
};

export const getLanguageDeviceCode = () => {
    let systemLanguage = 'en';
    if (Platform.OS === 'android') {
        systemLanguage = NativeModules.I18nManager.localeIdentifier;
    } else {
        systemLanguage = NativeModules.SettingsManager.settings.AppleLocale;
    }

    if (!systemLanguage && Platform.OS === 'ios') {
        systemLanguage =
            NativeModules.SettingsManager.settings.AppleLanguages[0];
    }
    const languageCode = systemLanguage ? systemLanguage.substring(0, 2) : 'en';
    return languageCode;
};

export const choseLanguage = () => {
    const languageDevice = getLanguageDeviceCode();

    if (languageDevice === 'zh') return 'cn';
    if (languageDevice === 'vi' || languageDevice === 'cn') {
        return languageDevice;
    }

    return 'en';
};

export const setDefaultSetting = (userID) => {
    // Chưa có setting -> post setting default
    const { hour: fromHour, minute: fromMinute } = getHoursMinutesUTC(20, 0);
    const { hour: toHour, minute: toMinute } = getHoursMinutesUTC(8, 0);
    const urlPost = api.getUrlUserSettingByUserId(userID, 'post');
    const deviceId = dataStorage.deviceId;
    const setting = {
        noti: true,
        vibration: true,
        sound: 'default',
        textFontSize: 17,
        lang: choseLanguage(), // Lấy ngôn ngữ máy
        news: {
            annoucement: false,
            priceSensitive: true,
            allRelated: false,
            scheduled: true,
            reset: null,
            fromHour: 20,
            fromMinute: 0,
            toHour: 8,
            toMinute: 0
        },
        order: {
            user_place: false,
            on_market: true,
            partial_fill: false,
            filled: true,
            amend: true,
            reject_amend: true,
            reject_cancel: true,
            cancelled: true,
            rejected: true,
            expired: true,
            reset: null
        },
        homeScreen: 1,
        pinSetting: 0,
        userPriceSource: 0
    };
    // Setting db -> convert to UTC
    const data = {
        deviceId,
        noti: true,
        vibration: true,
        sound: 'default',
        lang: choseLanguage(), // Lấy ngôn ngữ máy
        news: {
            annoucement: false,
            priceSensitive: true,
            allRelated: false,
            scheduled: true,
            reset: null,
            fromHour,
            fromMinute,
            toHour,
            toMinute
        },
        order: {
            user_place: false,
            on_market: true,
            partial_fill: false,
            filled: true,
            amend: true,
            reject_amend: true,
            reject_cancel: true,
            cancelled: true,
            rejected: true,
            expired: true,
            reset: null
        },
        homeScreen: 1,
        pinSetting: 0,
        userPriceSource: 0,
        textFontSize: 17
    };
    const bodyData = {
        data
    };
    api.postData(urlPost, bodyData)
        .then((data) => {
            console.log('create new setting success');
        })
        .catch((error) => {
            logDevice(
                'error',
                `CREATE NEW SETTING FOR UID: ${userID} ERROR ${error}`
            );
        });
    Controller.dispatch(settingActions.settingResponse(setting, userID));
    Controller.dispatch(settingActions.setLang(choseLanguage()));
    Controller.setLang(choseLanguage());
    Controller.setFontSize(data.textFontSize);
    Controller.setSound('default');
    Controller.setVibrate(true);
    func.setHomeScreen(HOME_SCREEN[0]);
    Controller.setUserPriceSource(0);
    func.setPinSetting(0);
    func.setPinSettingSession(0); // Setting trên db cho lần vào app, sẽ được dùng cho đến khi kill app đi, có realtime setting cũng không ảnh hưởng
    func.setMenuSelected(1);
};

export const setDefaultTimeZoneSetting = (userID, data) => {
    const urlPost = api.getUrlUserSettingByUserId(userID, 'post');
    const bodyData = {
        data
    };
    api.postData(urlPost, bodyData)
        .then((data) => {
            console.log('create new setting Time Zone success');
        })
        .catch((error) => {
            logDevice(
                'error',
                `CREATE NEW SETTING FOR UID: ${userID} ERROR ${error}`
            );
        });
};
export const encodeSymbol = (str) => {
    // const strOrigin = str;
    // const encodeSplash = encodeURIComponent('/');
    // const encodeHash = encodeURIComponent('#');
    // let encodeStr = strOrigin.replace(/\//g, encodeSplash); // replace / -> %2F
    // encodeStr = encodeStr.replace(/#/g, encodeHash); // replace # -> %2F
    str = encodeURIComponent(str); // replace # -> %2F
    return str;
};

export const getTimestampUTCNoneDMY = (dateStr) => {
    const dateStrArr = dateStr.split('/');
    const day = parseInt(dateStrArr[0], 10);
    const month = parseInt(dateStrArr[1], 10);
    const year = parseInt(dateStrArr[2], 10);
    const utcTime = Date.UTC(year, month - 1, day);
    return utcTime;
};

export const getStartPreviousDay = (timeStamp, numberOfDay = 1) => {
    const date = new Date(timeStamp);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const miliSecond = date.getMilliseconds();
    const timeStampOneDay = numberOfDay * 24 * 60 * 60 * 1000;
    const hourToZero = hour * 60 * 60 * 1000;
    const minuteToZero = minute * 60 * 1000;
    const secondToZero = second * 1000;
    const timeStampToZero =
        hourToZero + minuteToZero + secondToZero + miliSecond;

    return timeStamp - timeStampOneDay - timeStampToZero;
};

export const getTabLabel = (key) => {
    return Enum.PRICE_LIST_TAB_LABEL[key];
};

export const checkOpenSessionByTime = (
    timeByExchange,
    totalMinuteCompareByExchane
) => {
    const hour = new Date(timeByExchange).getHours();
    const minute = new Date(timeByExchange).getMinutes();
    const totalMinuteCompare = hour * 60 + minute;
    if (totalMinuteCompare >= totalMinuteCompareByExchane) {
        return true;
    }
    return false;
};

export const checkCloseSessionByTime = (
    timeByExchange,
    totalMinuteCompareByExchane
) => {
    const hour = new Date(timeByExchange).getHours();
    const minute = new Date(timeByExchange).getMinutes();
    const totalMinuteCompare = hour * 60 + minute;
    if (totalMinuteCompare >= totalMinuteCompareByExchane) {
        return true;
    }
    return false;
};

export const checkOpenSessionBySymbol = (symbol) => {
    const now = new Date().getTime();
    const isAuSymbol = isAuBySymbol(symbol);
    if (isAuSymbol) {
        // Chuyển về giờ Úc
        const timeAU = convertToCustomTimezone(now, Controller.getTimeZoneAU());
        const totalMinuteAU =
            Enum.OPEN_SESSION_AU_TIME.HOUR * 60 +
            Enum.OPEN_SESSION_AU_TIME.MINUTE;
        return checkOpenSessionByTime(timeAU, totalMinuteAU);
    } else {
        // Chuyển về giờ Mỹ
        const timeUS = convertToCustomTimezone(now, Controller.getTimeZoneUS());
        const totalMinuteUS =
            Enum.OPEN_SESSION_US_TIME.HOUR * 60 +
            Enum.OPEN_SESSION_US_TIME.MINUTE;
        return checkOpenSessionByTime(timeUS, totalMinuteUS);
    }
};

export const checkCloseSessionBySymbol = (now, isAuSymbol = true) => {
    if (isAuSymbol) {
        // Chuyển về giờ Úc
        const timeAU = convertToCustomTimezone(now, Controller.getTimeZoneAU());
        // Chưa vào phiên cũng fill full ngày trước
        const totalOpenMinuteAU =
            Enum.OPEN_SESSION_AU_TIME.HOUR * 60 +
            Enum.OPEN_SESSION_AU_TIME.MINUTE;
        const isOpenSession = checkOpenSessionByTime(timeAU, totalOpenMinuteAU);
        if (!isOpenSession) {
            return true;
        }

        const totalMinuteAU =
            Enum.CLOSE_SESSION_AU_TIME.HOUR * 60 +
            Enum.CLOSE_SESSION_AU_TIME.MINUTE;
        return checkCloseSessionByTime(timeAU, totalMinuteAU);
    } else {
        // Chuyển về giờ Mỹ
        const timeUS = convertToCustomTimezone(now, Controller.getTimeZoneUS());
        // Chưa vào phiên cũng fill full ngày trước
        const totalOpenMinuteUS =
            Enum.OPEN_SESSION_US_TIME.HOUR * 60 +
            Enum.OPEN_SESSION_US_TIME.MINUTE;
        const isOpenSession = checkOpenSessionByTime(timeUS, totalOpenMinuteUS);
        if (!isOpenSession) {
            return true;
        }
        // Vào phiên so sánh với giờ đóng phiên
        const totalMinuteUS =
            Enum.CLOSE_SESSION_US_TIME.HOUR * 60 +
            Enum.CLOSE_SESSION_US_TIME.MINUTE;
        return checkCloseSessionByTime(timeUS, totalMinuteUS);
    }
};

export const checkDrawBarChartNow = (timeChart, timePrice) => {
    const dateChart = new Date(timeChart);
    const datePrice = new Date(timePrice);

    const chartDay = dateChart.getDate();
    const chartMonth = dateChart.getMonth();
    const chartYear = dateChart.getFullYear();

    const priceDay = datePrice.getDate();
    const priceMonth = datePrice.getMonth();
    const priceYear = datePrice.getFullYear();

    // Ngày hiện tại trùng với bản ghi cuối cùng -> false -> không vẽ bar ngày hiện tại
    if (
        priceDay === chartDay &&
        priceMonth === chartMonth &&
        priceYear === chartYear
    ) {
        return false;
    }
    return true;
};

export const calculate = (numberOne, numberTwo, operator) => {
    try {
        const n1 = new Big(numberOne);
        const n2 = new Big(numberTwo);

        if (operator === '+') {
            return parseFloat(n1.plus(n2).toString());
        } else if (operator === '-') {
            return parseFloat(n1.minus(n2).toString());
        } else if (operator === '*') {
            return parseFloat(n1.times(n2).toString());
        } else if (operator === '/') {
            return parseFloat(n1.div(n2).toString());
        } else if (operator === '%') {
            return numberOne % numberTwo;
        }
        return 0;
    } catch (e) {
        console.warn(
            `error ${numberOne},${numberTwo},${operator} with error ${e}`
        );
    }
    return 0;
};

const START_DAY = {
    HOUR: 8,
    MINUTE: 30
};

const END_DAY = {
    HOUR: 8,
    MINUTE: 29,
    SECOND: 59,
    MILISECOND: 999
};

export const unListener = (listen) => {
    listen && listen.remove && listen.remove();
    listen = null;
};

export const json = {
    parse: (str) => {
        try {
            return JSON.parse(str);
        } catch (err) {
            return null;
        }
    },
    stringify: (obj) => {
        try {
            return JSON.stringify(obj);
        } catch (err) {
            return null;
        }
    }
};

export const getValByPlatform = (iosVal, otherVal) =>
    Platform.OS === 'ios' ? iosVal : otherVal;

export const isIOS = () => Platform.OS === 'ios';

export const isAndroid = () => Platform.OS === 'android';

export const getUTCTime = ({
    hour = 0,
    minute = 0,
    second = 0,
    milisecond = 0,
    date = 0,
    month = 0,
    year = 0,
    timezone = 0
}) => {
    const current = new Date();
    current.setUTCHours(hour);
    current.setUTCMinutes(minute);
    current.setUTCSeconds(second);
    current.setUTCMilliseconds(milisecond);
    current.setUTCDate(date);
    current.setUTCMonth(month - 1);
    current.setUTCFullYear(year);
    return current.getTime() - timezone * 60 * 60 * 1000;
};

export const addDay = (time, days) => {
    return time + days * 24 * 60 * 60 * 1000;
};

export const getStartDay = (timeStr, timezone) => {
    try {
        const lstFrom = timeStr.split('/');
        const optFrom = {
            hour: START_DAY.HOUR,
            minute: START_DAY.MINUTE,
            date: parseInt(lstFrom[0], 10),
            month: parseInt(lstFrom[1], 10),
            year: parseInt(lstFrom[2]),
            timezone
        };
        return getUTCTime(optFrom);
    } catch (err) {
        console.warn(`Error get start day with err: ${err}`);
        return 0;
    }
};

export const getEndDay = (timeStr, timezone, numberDayAdded = 1) => {
    try {
        const lstTo = timeStr.split('/');
        const optTo = {
            hour: END_DAY.HOUR,
            minute: END_DAY.MINUTE,
            second: END_DAY.SECOND,
            milisecond: END_DAY.MILISECOND,
            date: parseInt(lstTo[0], 10),
            month: parseInt(lstTo[1], 10),
            year: parseInt(lstTo[2]),
            timezone
        };
        return addDay(getUTCTime(optTo), numberDayAdded);
    } catch (err) {
        console.warn(`Error get end day with err: ${err}`);
        return 0;
    }
};

export const checkDrawChartCurrentDay = (timeFilter) => {
    const dateAU = new Date(timeFilter);

    const hoursAU = dateAU.getHours();
    const minutesAU = dateAU.getMinutes();
    const totalMinutesAU = hoursAU * 60 + minutesAU;

    if (totalMinutesAU >= 8 * 60 + 30 && totalMinutesAU <= 23 * 60 + 59) {
        // >= 8h30 && <= 23h59 -> Vẽ ngày hiện tại
        return true;
    } else if (totalMinutesAU >= 0 && totalMinutesAU < 8 * 60 + 30) {
        // >= 0 && < 8h30 -> Vẽ ngày trước đấy
        return false;
    }
};

export const checkCustomWeekend = (time = new Date().getTime(), timezone) => {
    const customTime = convertToCustomTimezone(time, timezone);
    const day = new Date(customTime).getDay();
    return {
        isWeekend: !(day !== 6 && day !== 0),
        day
    };
};

export const isAuBySymbol = (symbol) => {
    if (!symbol) return true;
    const currency =
        symbol &&
            dataStorage.symbolEquity[symbol] &&
            dataStorage.symbolEquity[symbol].currency
            ? dataStorage.symbolEquity[symbol].currency
            : Enum.CURRENCY.AUD;
    return currency === Enum.CURRENCY.AUD;
};

export const getHoursMinutesLocal = (hourUTC, minuteUTC) => {
    const currentTimezone = getCurrentTimezone();
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    const yearUTC = date.getUTCFullYear();
    const monthUTC = date.getUTCMonth() + 1;
    const dayUTC = date.getUTCDate();
    const secondUTC = date.getUTCSeconds();
    const milisecondUTC = date.getUTCMilliseconds();
    const localTime = Date.UTC(
        yearUTC,
        monthUTC,
        dayUTC,
        hourUTC,
        minuteUTC,
        secondUTC,
        milisecondUTC
    );
    const hour = new Date(localTime).getHours();
    const minute = new Date(localTime).getMinutes();
    return {
        hour,
        minute
    };
};

export const getHoursMinutesUTC = (hour, minute) => {
    const currentTimezone = getCurrentTimezone();
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);
    date.setMilliseconds(0);
    const timeDate = date.getTime();
    const timeToUTC = timeDate - currentTimezone * 60 * 60 * 1000;
    const hourUTC = new Date(timeToUTC).getHours();
    const minuteUTC = new Date(timeToUTC).getMinutes();
    return {
        hour: hourUTC,
        minute: minuteUTC
    };
};

export const getCurrentTimezone = () => {
    return (-1 * new Date().getTimezoneOffset()) / 60;
};

export const convertToCustomTimezone = (
    time,
    timezone = getCurrentTimezone()
) => {
    const currentTimezone = getCurrentTimezone();
    return time + (timezone - currentTimezone) * 60 * 60 * 1000;
};

export const convertToCustomTimezoneMaximumDate = (
    time,
    timezone = getCurrentTimezone()
) => {
    const currentTimezone = getCurrentTimezone();
    return (
        time +
        (timezone - currentTimezone) * 60 * 60 * 1000 +
        24 * 60 * 60 * 1000
    );
};

export const addCustomTimeToTime = (
    time,
    { miliSecond, second, minute, hour, day, month, year }
) => {
    const dateTime = new Date(time);
    if (miliSecond) {
        dateTime.setMilliseconds(dateTime.getMilliseconds() + miliSecond);
    }
    if (second) dateTime.setSeconds(dateTime.getSeconds() + second);
    if (minute) dateTime.setMinutes(dateTime.getMinutes() + minute);
    if (hour) dateTime.setHours(dateTime.getHours() + hour);
    if (day) dateTime.setDate(dateTime.getDate() + day);
    if (month) dateTime.setMonth(dateTime.getMonth() + month);
    if (year) dateTime.setFullYear(dateTime.getFullYear() + year);
    return dateTime.getTime();
};

export const getStartDayTimezone = (time, timezone = getCurrentTimezone()) => {
    const newTime = convertToCustomTimezone(time, timezone);
    const newDate = new Date(newTime);
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate.getTime();
};

export const getEndDayTimezone = (time, timezone = getCurrentTimezone()) => {
    return getStartDayTimezone(time, timezone) + TOTAL_MILISECOND_1D - 1;
};

export const convertToLocalTimeStamp = (
    timeExchange,
    timezone = getCurrentTimezone()
) => {
    const distance = (timezone - getCurrentTimezone()) * 60 * 60 * 1000;
    return timeExchange - distance;
};

export const convertToLocationTimeStamp = (
    timeExchange,
    timezone = getCurrentTimezone()
) => {
    const distance = (timezone - getCurrentTimezone()) * 60 * 60 * 1000;
    return timeExchange + distance;
};

export const checkIntervalMarkerLabelTimeFormat = (filterType) => {
    switch (filterType) {
        case PRICE_FILL_TYPE._1D:
        case PRICE_FILL_TYPE._1W:
        case PRICE_FILL_TYPE._1M:
            return 'DD MMM YYYY HH:mm';
        case PRICE_FILL_TYPE._3M:
        case PRICE_FILL_TYPE._6M:
        case PRICE_FILL_TYPE._1Y:
        case PRICE_FILL_TYPE._3Y:
        case PRICE_FILL_TYPE._YTD:
        case PRICE_FILL_TYPE._5Y:
        case PRICE_FILL_TYPE._10Y:
        case PRICE_FILL_TYPE._ALL:
            return 'DD MMM YYYY';
    }
};

export const getTimezoneCustom = (
    time,
    hour = 0,
    minute = 0,
    second = 0,
    miliSecond = 0,
    timezone = getCurrentTimezone()
) => {
    const timeExchange = convertToCustomTimezone(time, timezone);
    const dateExchange = new Date(timeExchange);
    dateExchange.setHours(hour);
    dateExchange.setMinutes(minute);
    dateExchange.setSeconds(second);
    dateExchange.setMilliseconds(miliSecond);
    return new Date(dateExchange).getTime();
};

export const getFormatInt = (str = '', numChar = 0) => {
    const numStr = str + '';
    if (numChar < 2) return numStr;

    const lostZero = numChar - numStr.length;
    switch (lostZero) {
        case 1:
            return `0${numStr}`;
        case 2:
            return `00${numStr}`;
        case 3:
            return `000${numStr}`;
        case 4:
            return `0000${numStr}`;
        case 5:
            return `00000${numStr}`;
        default:
            return numStr;
    }
};

export const getStartDayBusinessTimezone = (
    time,
    timezone = getCurrentTimezone()
) => {
    const newTime = convertToCustomTimezone(time, timezone);
    const newDate = new Date(newTime);
    newDate.setHours(8);
    newDate.setMinutes(30);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate.getTime();
};

export const getEndDayBusinessTimezone = (
    time,
    timezone = getCurrentTimezone()
) => {
    return (
        getStartDayBusinessTimezone(time, timezone) + TOTAL_MILISECOND_1D - 1
    );
};

export const formatTimeLocal = (time, format) => {
    const dateTime = new Date(time);
    const year = getFormatInt(dateTime.getFullYear(), 2);
    const shortYear = getFormatInt(year % 100, 2);
    const month = getFormatInt(dateTime.getMonth() + 1, 2);
    const date = getFormatInt(dateTime.getDate(), 2);
    const minute = getFormatInt(dateTime.getMinutes(), 2);
    const hour = getFormatInt(dateTime.getHours(), 2);
    const second = getFormatInt(dateTime.getSeconds(), 2);
    const milisecond = getFormatInt(dateTime.getMilliseconds(), 2);

    switch (format) {
        case FORMAT_TIME['DD/MM/YY']:
            return `${date}/${month}/${year}`;
        case FORMAT_TIME['DD/MM/yy']:
            return `${date}/${month}/${shortYear}`;
        case FORMAT_TIME['DD/MM/YY hh:mm:ss.ms']:
            return `${date}/${month}/${year} ${hour}:${minute}:${second}.${milisecond}`;
        default:
            return `${date}/${month}/${year} ${hour}:${minute}:${second}.${milisecond}`;
    }
};

export const formatTimeUTC = (time, format) => {
    const dateTime = new Date(time);
    const year = getFormatInt(dateTime.getUTCFullYear(), 2);
    const shortYear = getFormatInt(year % 100, 2);
    const month = getFormatInt(dateTime.getUTCMonth() + 1, 2);
    const date = getFormatInt(dateTime.getUTCDate(), 2);
    const minute = getFormatInt(dateTime.getUTCMinutes(), 2);
    const hour = getFormatInt(dateTime.getUTCHours(), 2);
    const second = getFormatInt(dateTime.getUTCSeconds(), 2);
    const milisecond = getFormatInt(dateTime.getUTCMilliseconds(), 3);

    switch (format) {
        case FORMAT_TIME['DD/MM/YY']:
            return `${date}/${month}/${year}`;
        case FORMAT_TIME['DD/MM/yy']:
            return `${date}/${month}/${shortYear}`;
        case FORMAT_TIME['DD/MM/YY hh:mm:ss.ms']:
            return `${date}/${month}/${year}-${hour}:${minute}:${second}.${milisecond}`;
        case FORMAT_TIME['DD/MM/yy hh:mm:ss.ms']:
            return `${date}/${month}/${shortYear}-${hour}:${minute}:${second}.${milisecond}`;
        case FORMAT_TIME['DD/MM/yy hh:mm']:
            return `${date}/${month}/${shortYear}-${hour}:${minute}`;
        default:
            return `${date}/${month}/${year}-${hour}:${minute}:${second}.${milisecond}`;
    }
};

export const arrayHasItem = (array) => {
    return array && Array.isArray(array) && array.length > 0;
};

export const getNullableFunc = (func) => {
    return func || (() => { });
};

export const getValueObject = (obj = {}) =>
    Object.keys(obj).map((key) => obj[key]);

export const getKeyObject = (obj = {}) => Object.keys(obj).map((key) => key);

export const getKeyObjectFromValue = (object = {}, value) =>
    Object.keys(object).find((key) => object[key] === value);

export const getProp = (obj, lstProp) => {
    if (arrayHasItem(lstProp) === false) return obj;
    if (!obj) return null;

    const val = obj[lstProp[0]] || null;
    lstProp.splice(0, 1);
    return lstProp.length > 0 ? getProp(val, lstProp) : val;
};

export const getValProp = (data, prop) => {
    if (prop == null) return data;
    if (typeof prop !== 'string') return null;

    const obj = { ...data };
    if (!obj) return null;
    const lstProp = prop.split('.');
    return getProp(obj, lstProp);
};

export const getStringable = (obj, prop) => {
    return getValProp(obj, prop) || '';
};

export const getNumberable = (obj, prop) => {
    return getValProp(obj, prop) || 0;
};

export const getArrayable = (obj, prop) => {
    return getValProp(obj, prop) || [];
};

export const getObjectable = (obj, prop) => {
    return getValProp(obj, prop) || {};
};

export const getBooleanable = (value, def = true) => {
    return value != null ? value : def;
};

export const getNullable = (val) => (val == null ? null : val);

export const getNullableReal = (val) => (!val ? null : val);

export const isPositiveNumber = (num) => num > 0;

export const getTypeNotify = (title = '') => {
    // ORDER_DETAIL#INSERT#00000000_0000_0000_bb71_5b03b4f20071
    const listSplit = title.split('#');
    if (listSplit.length > 0) return (listSplit[0] + '').toUpperCase();
    return '';
};

export const compareObject = (obj1, obj2) => {
    const type1 = Object.prototype.toString.call(obj1);
    const type2 = Object.prototype.toString.call(obj2);
    if (type1 !== type2) return false;
    if (
        type1 === '[object String]' ||
        type1 === '[object Number]' ||
        type1 === '[object Boolean]' ||
        type1 === '[object Null]' ||
        type1 === '[object Undefined]'
    ) {
        return obj1 === obj2;
    }
    if (type1 === '[object Object]') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (const key in obj1) {
            if (!obj2.hasOwnProperty(key)) return false;
            const val1 = obj1[key];
            const val2 = obj2[key];
            if (!compareObject(val1, val2)) return false;
        }
    }
    if (type1 === '[object Array]') {
        if (obj1.length !== obj2.length) return false;
        for (let i = 0; i < obj1.length; i++) {
            const val1 = obj1[i];
            const val2 = obj2[i];
            if (!compareObject(val1, val2)) return false;
        }
    }
    return true;
};

export const getNumberFromString = (str) => {
    try {
        const newStr = str.replace(/,/g, '');
        const newNumber = parseFloat(newStr, 10);
        return isNaN(newNumber) ? 0 : newNumber;
    } catch (error) {
        return 0;
    }
};

export const numberValidFloat = (
    value,
    { maxLenInt, maxLenFloat, maxLenAll }
) => {
    try {
        if (!value) return false;
        const newStr = value.replace(/,/g, '');
        if (maxLenAll && newStr.length > maxLenAll) return false;

        let pattern = '';
        pattern += maxLenInt ? `\\d{0,${maxLenInt}}` : `\\d*`;
        pattern += maxLenFloat ? `(\\.\\d{0,${maxLenFloat}})?` : '';
        return newStr.match(new RegExp(`^${pattern}$`)) != null;
    } catch (error) {
        return false;
    }
};

export const trimZeroStart = (value = '') => {
    try {
        const newStr = value.replace(/^0+/, '');
        return newStr[0] === '.' ? `0${newStr}` : newStr;
    } catch (error) {
        return value;
    }
};

export const convertLineStringToObject = (listLine = []) => {
    try {
        const listObject = [];
        const listFieldFistLine = listLine[0].split(',');

        for (let i = 1; i < listLine.length; i++) {
            const listValue = listLine[i].split(',');
            if (listValue.length !== listFieldFistLine.length) continue;
            const item = {};
            for (let j = 0; j < listValue.length; j++) {
                const key = listFieldFistLine[j];
                const value = listValue[j];
                item[key] = value;
            }
            listObject.push(item);
        }
        return listObject;
    } catch (error) {
        return {};
    }
};

export const convertCsvToObject = (csvString, { startLine, endLine }) => {
    if (!csvString || startLine < endLine || startLine < 1) return null;
    const listLine = csvString.split('\n');
    const startPosition = startLine ? startLine - 1 : 0;
    const endPosition = endLine || listLine.length;
    const listLineResul = listLine.slice(startPosition, endPosition);
    return convertLineStringToObject(listLineResul);
};

export const convertTimeStringToTimestamp = (str = '') => {
    try {
        const split1 = str.split('-');
        const dateStr = split1[0] || '';
        const timeStr = split1[1] || '';

        const splitDate = dateStr.split('/');
        const date = splitDate[0] || '0';
        const month = splitDate[1] || '0';
        const year = splitDate[2] || '0';

        const splitTime = timeStr.split(':');
        const hour = splitTime[0] || '0';
        const minute = splitTime[1] || '0';

        const splitSecond = splitTime[2].split('.');
        const second = splitSecond[0] || '0';
        const milisecond = splitSecond[1] || '0';

        const newDate = new Date();
        newDate.setUTCFullYear(year);
        newDate.setUTCFullYear(newDate.getUTCFullYear() + 2000);
        newDate.setUTCMonth(month - 1);
        newDate.setUTCDate(date);
        newDate.setUTCHours(hour);
        newDate.setUTCMinutes(minute);
        newDate.setUTCSeconds(second);
        newDate.setUTCMilliseconds(milisecond);

        return newDate.getTime();
    } catch (error) {
        console.info(
            `Error convertTimeStringToObject str: ${str}, error: ${json.stringify(
                error
            )}`
        );
        return null;
    }
};

export const objHasKeys = (obj = {}) => {
    try {
        return Object.keys(obj).length > 0;
    } catch (error) {
        return false;
    }
};

export const OBJ = {
    getVal: (obj = {}, listProps = []) => {
        let currentVal = obj;
        for (const props of listProps) {
            if (currentVal == null || currentVal[props] == null) return null;
            currentVal = currentVal[props];
        }
        return currentVal;
    },
    getValPreLast: (obj = {}, listProps = []) => {
        if (listProps.length < 2) return obj;
        let currentVal = obj;
        for (let i = 0; i < listProps.length - 1; i++) {
            const prop = listProps[i];
            if (currentVal == null || currentVal[prop] == null) return null;
            currentVal = currentVal[prop];
        }
        return currentVal;
    },
    setObjectable: (obj, props, def = {}) => {
        if (props) obj[props] = obj[props] || def;
        else obj = obj || def;
    },
    setArrayable: (obj, props, def = []) => {
        if (props) obj[props] = obj[props] || def;
        else obj = obj || def;
    },
    clearIfArrayEmpty: (obj, props = []) => {
        if (props.length === 0) return;
        const listItem = OBJ.getVal(obj, props);
        const objPre = OBJ.getValPreLast(obj, props);
        if (listItem && listItem.length === 0) {
            delete objPre[props[props.length - 1]];
        }
    },
    clearIfObjEmpty: (obj, props = []) => {
        if (props.length === 0) return;
        const listItem = OBJ.getVal(obj, props);
        const objPre = OBJ.getValPreLast(obj, props);
        if (listItem && Object.keys(listItem).length === 0) {
            delete objPre[props[props.length - 1]];
        }
    },
    clearLastProp: (obj, props = []) => {
        if (props.length === 0) return;
        const listItem = OBJ.getVal(obj, props);
        const objPre = OBJ.getValPreLast(obj, props);
        if (listItem) delete objPre[props[props.length - 1]];
    }
};

export const getInfoNoti = (title = '') => {
    const listInfo = title.split('#');
    return {
        type: listInfo[0] || '',
        action: listInfo[1] || ''
    };
};

export const getTrendCompareWithZero = (value = 0) => {
    if (value > 0) return TREND_VALUE.UP;
    else if (value === 0) return TREND_VALUE.NONE;
    else return TREND_VALUE.DOWN;
};

export const getTrendCompareWithOld = (currentValue = 0, oldValue = 0) => {
    const difference = currentValue - oldValue;
    if (difference > 0) return TREND_VALUE.UP;
    else if (difference === 0) return TREND_VALUE.NONE;
    else return TREND_VALUE.DOWN;
};

export const randomInteger = (min = 1, max, obj, field, rate, isNegative) => {
    const rateOption = Math.floor(Math.random() * rate + 1);
    if (rateOption !== 1) return obj;
    let negative = 1;
    if (isNegative && Math.floor(Math.random() * 2 + 1) === 2) negative = -1;
    const value = Math.floor(Math.random() * max + min);
    obj[field] = value * negative;
    return obj;
};

export const randomTrend = (obj, field) => {
    const lstValue = ['None', 'Up', 'Down'];
    obj[field] = lstValue[Math.random() * 3 + 1 - 1];
};

export const randomBidOrAsk = () => {
    const lstValue = ['bid', 'ask'];
    return lstValue[_.random(1)];
};

// export const fakeOrderDetail = () => {
// 	const notiUserAmend = {
// 		account_id: "182756",
// 		account_name: "QUANT EDGE PTY LTD",
// 		actor_changed: "equix.operation@quant-edge.com",
// 		advisor_code: "OMR",
// 		avg_price: null,
// 		broker_order_id: "31900",
// 		client_order_id: "182756_e89e4828b4544351967cd2e2c",
// 		company_name: "SOUTH32 FPO",
// 		condition_name: null,
// 		current_brokerage: 18.95,
// 		current_tax: 0,
// 		current_value: 0,
// 		device_info: "{'ua':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36','browser':{'name':'Chrome','version':'75.0.3770.142','major':'75'},'engine':{'name':'Blink'},'os':{'name':'Windows','version':'10'},'device':{},'cpu':{'architecture':'amd64'}}",
// 		display_order_id: "31900",
// 		duration: "GTC",
// 		estimated_brokerage: 18.95,
// 		estimated_tax: 0,
// 		estimated_value: 25,
// 		exchange: "ASX",
// 		exchange_updated: 1566169370460,
// 		filled_quantity: null,
// 		init_time: 1566169370460,
// 		is_buy: 1,
// 		is_stoploss: 0,
// 		leave_quantity: 10,
// 		limit_price: 2.5,
// 		order_action: "{'action_name':'request_orders','action_status':'Success','note':'{\'order_type\':\'LIMIT\',\'order_state\':\'UserAmend\',\'modify_action\':\'ADD\',\'data\':{\'side\':\'BUY\',\'volume_old\':10,\'volume\':11,\'stop_price\':0,\'limit_price\':2.5,\'limit_price_old\':2.5}}','estimated_brokerage':12.681818181818182,'estimated_value':27.5,'estimated_tax':1.268181818181818,'order_amount':27.5,'order_amount_convert':27.5,'estimated_fees':13.95,'total':41.45,'total_convert':41.45,'rate':1,'price':2.5}",
// 		order_state: "UserAmend",
// 		order_status: 16,
// 		order_tag: "open",
// 		order_type: "LIMIT_ORDER",
// 		order_type_origin: "Limit",
// 		order_value: 0,
// 		origin_broker_order_id: "31900",
// 		origination: 131,
// 		seq_num: 1566169370592,
// 		symbol: "S32",
// 		trading_market: "ASX:ASX",
// 		updated: 1566169370552,
// 		volume: 10
// 	}

// 	const notiPendingReplace = {
// 		account_id: "182756",
// 		account_name: "QUANT EDGE PTY LTD",
// 		actor_changed: "ASX",
// 		advisor_code: "OMR",
// 		avg_price: null,
// 		broker_order_id: "31900",
// 		client_order_id: "182756_e89e4828b4544351967cd2e2c",
// 		company_name: "SOUTH32 FPO",
// 		condition_name: null,
// 		current_brokerage: 18.95,
// 		current_tax: 0,
// 		current_value: 0,
// 		device_info: "{'ua':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36','browser':{'name':'Chrome','version':'75.0.3770.142','major':'75'},'engine':{'name':'Blink'},'os':{'name':'Windows','version':'10'},'device':{},'cpu':{'architecture':'amd64'}}",
// 		display_order_id: "31900",
// 		duration: "GTC",
// 		estimated_brokerage: 18.95,
// 		estimated_tax: 0,
// 		estimated_value: 25,
// 		exchange: "ASX",
// 		exchange_updated: 1566169370460,
// 		filled_quantity: null,
// 		init_time: 1566169370460,
// 		is_buy: 1,
// 		is_stoploss: 0,
// 		leave_quantity: 10,
// 		limit_price: 2.5,
// 		order_action: "{'estimated_brokerage':12.681818181818182,'estimated_value':27.5,'estimated_tax':1.268181818181818,'order_amount':27.5,'order_amount_convert':27.5,'estimated_fees':13.95,'total':41.45,'total_convert':41.45,'rate':1,'price':2.5,'note':'{\'order_type\':\'LIMIT\',\'order_state\':\'UserAmend\',\'modify_action\':\'ADD\',\'data\':{\'side\':\'BUY\',\'volume_old\':10,\'volume\':11,\'stop_price\':0,\'limit_price\':2.5,\'limit_price_old\':2.5}}'}",
// 		order_state: "PENDING_REPLACE",
// 		order_status: 14,
// 		order_tag: "open",
// 		order_type: "LIMIT_ORDER",
// 		order_type_origin: "Limit",
// 		order_value: 0,
// 		origin_broker_order_id: "31900",
// 		origination: 131,
// 		seq_num: 1566169370593,
// 		symbol: "S32",
// 		trading_market: "ASX:ASX",
// 		updated: 1566169370554,
// 		volume: 10
// 	}

// 	const notiApproveReplace = {
// 		account_id: "182756",
// 		account_name: "QUANT EDGE PTY LTD",
// 		actor_changed: "DTR",
// 		advisor_code: "OMR",
// 		avg_price: null,
// 		broker_order_id: "31900",
// 		client_order_id: "182756_e89e4828b4544351967cd2e2c",
// 		company_name: "SOUTH32 FPO",
// 		condition_name: null,
// 		current_brokerage: 18.95,
// 		current_tax: 0,
// 		current_value: 0,
// 		device_info: "{'ua':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36','browser':{'name':'Chrome','version':'75.0.3770.142','major':'75'},'engine':{'name':'Blink'},'os':{'name':'Windows','version':'10'},'device':{},'cpu':{'architecture':'amd64'}}",
// 		display_order_id: "31900",
// 		duration: "GTC",
// 		estimated_brokerage: 18.95,
// 		estimated_tax: 0,
// 		estimated_value: 27.5,
// 		exchange: "ASX",
// 		exchange_updated: 1566169370476,
// 		filled_quantity: null,
// 		init_time: 1566169370460,
// 		is_buy: 1,
// 		is_stoploss: 0,
// 		leave_quantity: 11,
// 		limit_price: 2.5,
// 		order_action: "{'estimated_brokerage':12.681818181818182,'estimated_value':27.5,'estimated_tax':1.268181818181818,'order_amount':27.5,'order_amount_convert':27.5,'estimated_fees':13.95,'total':41.45,'total_convert':41.45,'rate':1,'price':2.5,'note':'{\'order_type\':\'LIMIT\',\'order_state\':\'UserAmend\',\'modify_action\':\'ADD\',\'data\':{\'side\':\'BUY\',\'volume_old\':10,\'volume\':11,\'stop_price\':0,\'limit_price\':2.5,\'limit_price_old\':2.5}}'}",
// 		order_state: "ApproveActionReplace",
// 		order_status: 26,
// 		order_tag: "open",
// 		order_type: "LIMIT_ORDER",
// 		order_type_origin: "Limit",
// 		order_value: 0,
// 		origin_broker_order_id: "31900",
// 		origination: 131,
// 		seq_num: 1566169370643,
// 		symbol: "S32",
// 		trading_market: "ASX:ASX",
// 		updated: 1566169370598,
// 		volume: 11
// 	}

// 	const notiNewAmend = {
// 		account_id: "182756",
// 		account_name: "QUANT EDGE PTY LTD",
// 		actor_changed: "ASX",
// 		advisor_code: "OMR",
// 		avg_price: null,
// 		broker_order_id: "31900",
// 		client_order_id: "182756_e89e4828b4544351967cd2e2c",
// 		company_name: "SOUTH32 FPO",
// 		condition_name: null,
// 		current_brokerage: 18.95,
// 		current_tax: 0,
// 		current_value: 0,
// 		device_info: "{'ua':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36','browser':{'name':'Chrome','version':'75.0.3770.142','major':'75'},'engine':{'name':'Blink'},'os':{'name':'Windows','version':'10'},'device':{},'cpu':{'architecture':'amd64'}}",
// 		display_order_id: "31900",
// 		duration: "GTC",
// 		estimated_brokerage: 18.95,
// 		estimated_tax: 0,
// 		estimated_value: 27.5,
// 		exchange: "ASX",
// 		exchange_updated: 1566169370476,
// 		filled_quantity: null,
// 		init_time: 1566169370460,
// 		is_buy: 1,
// 		is_stoploss: 0,
// 		leave_quantity: 11,
// 		limit_price: 2.5,
// 		order_action: '{'estimated_brokerage':12.681818181818182,'estimated_value':27.5,'estimated_tax':1.268181818181818,'order_amount':27.5,'order_amount_convert':27.5,'estimated_fees':13.95,'total':41.45,'total_convert':41.45,'rate':1,'price':2.5,'note':'{\'order_type\':\'LIMIT\',\'order_state\':\'UserAmend\',\'modify_action\':\'ADD\',\'data\':{\'side\':\'BUY\',\'volume_old\':10,\'volume\':11,\'stop_price\':0,\'limit_price\':2.5,\'limit_price_old\':2.5}}'}",
// 		order_state: "NEW",
// 		order_status: 0,
// 		order_tag: "open",
// 		order_type: "LIMIT_ORDER",
// 		order_type_origin: "Limit",
// 		order_value: 0,
// 		origin_broker_order_id: "31900",
// 		origination: 131,
// 		seq_num: 1566169370644,
// 		symbol: "S32",
// 		trading_market: "ASX:ASX",
// 		updated: 1566169370599,
// 		volume: 11
// 	}
// 	const listOrders = [
// 		notiUserAmend,
// 		notiPendingReplace,
// 		notiApproveReplace,
// 		notiNewAmend
// 	]

// 	for (let i = 0; i < listOrders.length; i++) {
// 		const obj = listOrders[i]
// 		const { broker_order_id: orderId } = obj
// 		fbemit.emit('orders_detail', orderId, obj);
// 		console.log('FAKE ORDER DETAIL - PUB DATA', obj)
// 	}
// }

export const fakeLv1 = (listSymbolObj, processData) => {
    let side = 'S';
    let index = 0;
    setTimeout(() => {
        setInterval(() => {
            let result = {};
            const curArr = _.sampleSize(listSymbolObj, 50);
            curArr.map((item) => {
                // fake quote
                const aa = Math.floor(Math.random() * 10 + 1);
                if (aa % 3 === 0) return;
                result = {
                    symbol: item.symbol,
                    exchange: item.exchange
                };
                const quote = {
                    symbol: item.symbol,
                    exchange: item.exchange
                };
                randomInteger(1, 50, quote, 'trade_price', 4);
                randomInteger(1, 50, quote, 'ask_price', 4);
                randomInteger(1, 50, quote, 'bid_price', 4);
                randomInteger(1, 50, quote, 'ask_size', 4);
                randomInteger(1, 50, quote, 'bid_size', 4);
                randomInteger(1, 50, quote, 'change_percent', 4, true);
                randomInteger(1, 50, quote, 'change_point', 4, true);
                randomTrend(1, 50, quote, 'trend', 4);
                randomInteger(1, 50, quote, 'close', 4);
                randomInteger(1, 50, quote, 'high', 4);
                randomInteger(1, 50, quote, 'low', 4);
                randomInteger(1, 50, quote, 'open', 4);
                randomInteger(1, 50, quote, 'trade_size', 4);
                randomInteger(1, 500, quote, 'volume', 4);
                randomInteger(1, 500, quote, 'previous_close', 4);
                randomInteger(1, 500, quote, 'value_traded', 4);
                randomInteger(1, 500, quote, 'indicative_price', 4);
                randomInteger(1, 500, quote, 'surplus_volume', 4);
                // if (index === 3) {
                // 	quote.indicative_price = null
                // 	quote.surplus_volume = null
                // 	index = 0
                // } else {
                // 	randomInteger(1, 500, quote, 'indicative_price', 4);
                // 	randomInteger(1, 500, quote, 'surplus_volume', 4);
                // }
                const newSide = side === 'S' ? 'B' : 'S';
                side = newSide;
                quote.side = newSide;
                quote.updated = new Date().getTime();
                result.quote = quote;

                // fake depth
                const data = [];
                const ask = {};
                const bid = {};
                for (i = 0; i < 10; i++) {
                    ask[i] = fakeDataBidAsk(item.exchange, item.symbol, 'Ask');
                    bid[i] = fakeDataBidAsk(item.exchange, item.symbol, 'Bid');
                }
                const depth = {
                    ask,
                    bid
                };
                result.depth = depth;

                //	fake trades
                const trades = {
                    symbol: item.symbol,
                    exchange: item.exchange,
                    time: new Date().getTime(),
                    id: new Date().getTime() + 300
                };
                randomInteger(1, 50, trades, 'price', 2);
                randomInteger(1, 200, trades, 'quantity', 0);
                result.trades = trades;
                processData(result);
                // index++
            });
        }, 1000);
    }, 3000);
};

export const fakeDataBidAsk = (exchange) => {
    const obj = {};
    randomInteger(1, 200, obj, 'quantity', 0);
    randomInteger(1, 100, obj, 'price', 1);
    randomInteger(1, 2, obj, 'number_of_trades', 0);
    obj.exchanges = [exchange];
    return obj;
};
export const fakeLv2 = (listSymbolObj, processData) => {
    setTimeout(() => {
        setInterval(() => {
            listSymbolObj.map((item) => {
                const data = [];
                for (i = 0; i < 25; i++) {
                    data.push(fakeDataBidAsk(item.exchange));
                }
                const obj = randomBidOrAsk();
                processData(obj);
            });
        }, 200);
    }, 3000);
};

export const fakeCos = (listSymbolObj, processData) => {
    setTimeout(() => {
        setInterval(() => {
            listSymbolObj.map((item) => {
                const obj = {
                    symbol: item.symbol,
                    exchange: item.exchange,
                    time: new Date().getTime(),
                    id: _.random(1942605654413, 1942605654423)
                };
                randomInteger(1, 50, obj, 'price', 2);
                randomInteger(1, 200, obj, 'quantity', 0);
                processData({
                    trades: obj
                });
            });
        }, 200);
    }, 3000);
};

export const fakeHistorical = (listSymbolObj, processData) => {
    setTimeout(() => {
        setInterval(() => {
            listSymbolObj.map((item) => {
                const aa = Math.floor(Math.random() * 10 + 1);
                if (aa % 4 !== 0) return;
                const obj = {
                    symbol: item.symbol,
                    exchange: item.exchange,
                    interval: item.interval
                };
                randomInteger(1, 5, obj, 'low', 1);
                randomInteger(400, 700, obj, 'volume', 1);
                randomInteger(1, 5, obj, 'close', 1);
                randomInteger(1, 5, obj, 'high', 1);
                randomInteger(1, 5, obj, 'open', 1);

                const time = new Date().getTime();
                obj.time = time + 300000 - (time % 300000);
                processData([obj]);
            });
        }, 200);
    }, 3000);
};

export const getReduxSetting = (key) => {
    const globalState = Controller.getGlobalState();
    const setting = globalState.setting || {};
    return setting[key] || null;
};

export const addToDicRelatedSymbol = (symbol) => {
    if (
        dataStorage.dicRelatedSymbol.indexOf(symbol) < 0 &&
        dataStorage.dicRelatedSymbol.length
    ) {
        dataStorage.dicRelatedSymbol = [
            symbol,
            ...dataStorage.dicRelatedSymbol
        ];
    }
};

export const removeSymbolDicRelatedSymbol = (symbol) => {
    if (
        dataStorage.dicRelatedSymbol.indexOf(symbol) > -1 &&
        dataStorage.dicRelatedSymbol.length
    ) {
        dataStorage.dicRelatedSymbol = dataStorage.dicRelatedSymbol.filter(
            (e) => {
                return e !== symbol;
            }
        );
    }
};

export const updateDicNewsInday = (listNewsInday) => {
    dataStorage.dicNewsInday = {};
    if (listNewsInday.length) {
        for (let i = 0; i < listNewsInday.length; i++) {
            const element = listNewsInday[i];
            const newID = element.news_id;
            dataStorage.dicNewsInday[newID] = element;
        }
    }
};

export const updateDicNewsReaded = (listNewsReaded) => {
    dataStorage.dicNewsReaded = {};
    if (listNewsReaded.length) {
        for (let i = 0; i < listNewsReaded.length; i++) {
            const element = listNewsReaded[i];
            const newID = element.news_id;
            dataStorage.dicNewsReaded[newID] = element;
        }
    }
};

export const cloneFn = (params) => {
    return clone(params);
};

export function formatByCurrency({ icon, value, currency }) {
    return `${icon}${value} ${currency}`;
}
export const renderCurBaseOnAccountCur = (curAccountCurrency) => {
    try {
        if (!curAccountCurrency) {
            curAccountCurrency =
                (dataStorage &&
                    dataStorage.currentAccount &&
                    dataStorage.currentAccount.currency) ||
                Enum.CURRENCY.AUD;
        }
        let curIcon;
        let curSymbol;
        switch (curAccountCurrency) {
            case Enum.CURRENCY.AUD:
                curSymbol = Enum.CURRENCY.AUD;
                curIcon = '$';
                break;
            case Enum.CURRENCY.USD:
                curSymbol = Enum.CURRENCY.USD;
                curIcon = '$';
                break;
            case Enum.CURRENCY.VND:
                curSymbol = Enum.CURRENCY.VND;
                curIcon = '';
                break;
            default:
                curSymbol = Enum.CURRENCY.AUD;
                curIcon = '$';
                break;
        }
        return {
            currency: curSymbol,
            symbolCur: curIcon
        };
    } catch (error) {
        console.log('error at render currency base on account', error);
    }
};
export const checkCurrency = (curSymbol, curAccount) => {
    if (!curSymbol || !curAccount) return true;
    if (curSymbol.toUpperCase() === curAccount.toUpperCase()) {
        return true;
    } else {
        return false;
    }
};

export const removeZeroCharacterAtStart = (str) => {
    if (typeof str === 'number') str = str + '';
    const regex = /^0([0-9]|-).*$/;
    if (str.match(regex)) {
        str = str.substr(1, str.length);
    }
    return str;
};
export const removeZeroCharacterAtEnd = (str) => {
    if (typeof str === 'number') {
        str = str.toString();
    }
    return str.replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1');
};
export const removeZeroCharacterAtEnd2 = (str, decimal) => {
    if (typeof str === 'number') {
        str = str.toString();
    }
    return (+str).toFixed(decimal).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
};
export const removeCommaCharacter = (str) => {
    return str.replace(/,/g, '.');
};
export const clearCommaCharacter = (str) => {
    return str.replace(/,/g, '');
};
export const clearDotCharacter = (str) => {
    return str.replace('.', '');
};
export const removeSpaces = (str) => {
    return str.replace(/\s/g, '');
};
export const removeSpecialCharacters = (str) => {
    if (typeof str === 'number') {
        str = str.toString();
    }
    // eslint-disable-next-line no-useless-escape
    return str.replace(/[&\/\\#,+()$~%=@!`'"“’:;*?<>{}^]/g, '');
}
export const insertCommaToString = (x) => {
    if (!x || !x.length) return '';
    const positon = x.indexOf('.');
    if (positon > 0) {
        const pre = x.slice(0, positon);
        const suff = x.slice(positon, x.length);
        const newPre = pre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return newPre.concat(suff);
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const calculateLineHeight = (fontSize) => {
    // const multiplier = (fontSize > 20) ? 1.5 : 1;
    const multiplier = 1.5;
    const lineHeight = parseInt(fontSize * multiplier, 10);
    return lineHeight;
};

export function checkErrorCodeKickOut(responseText) {
    return (
        responseText.includes('"code":25022') ||
        responseText.includes('"code":25026') ||
        responseText.includes('"code":25014') ||
        responseText.includes('"code": 8999') ||
        responseText.includes('"code":8999') ||
        responseText.includes('token expired')
    );
}
