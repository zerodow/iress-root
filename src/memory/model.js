import { Dimensions } from 'react-native'
import AsyncStorage from '~/manage/manageLocalStorage'
import * as PureFunc from '../utils/pure_func'
import Enum from '../enum'
import * as Emitter from '~/lib/base/vietnam-emitter'
import { getChannelForceRenderDrawer } from '~/streaming/channel'

const momentTimeZone = require('moment-timezone');
const THEME = Enum.THEME
const LANG = Enum.LANG
const { height } = Dimensions.get('window')
const FONT_SIZE = Enum.FONT_SIZES

const STORE = {
    AUTimeZone: Enum.TIMEZONE.AU,
    USTimeZone: Enum.TIMEZONE.US,
    Sound: null,
    UserInfo: {},
    Lang: LANG.EN,
    FontSize: FONT_SIZE[1].value,
    Vibrate: null,
    SequenceId: 0,
    Session: null,
    IsDemo: false,
    IsLogin: false,
    Priceboard: {},
    AccountId: null,
    ListAccount: [],
    SymbolEquity: {},
    RequestStatus: {},
    PortfolioData: {},
    GlobalStore: null,
    AccessToken: null,
    EnableIress: false,
    UserPriceSource: 0,
    CurrentScreen: null,
    ListFuncWaitRes: {},
    CurrentAccount: null,
    ThemeColor: THEME.LIGHT,
    CurrentPriceboardId: null,
    isShowingAlertChangeRole: false,
    isSearchAccount: null,
    location: {},
    baseUrl: null,
    baseStreamingUrl: null,
    baseVersion: null,
    region: null,
    fcmToken: '',
    listAlerts: [],
    realWindowHeight: height,
    isShouldSetDefault: true,
    statusModalCurrent: false,
    inApp: false
}

//  #region PORTFOLIO
export function setPortfolio(data = {}) {
    STORE.PortfolioData = data
}
export function getPortfolio() {
    return STORE.PortfolioData
}
export function updatePortfolio(data = {}) {
    const newData = PureFunc.merge(STORE.PortfolioData, data, true)
    setPortfolio(newData)
}
//  #endregion

//  #region REDUX
export function getDispathchFunc() {
    return STORE.GlobalStore
        ? STORE.GlobalStore.dispatch
        : PureFunc.emptyFunc
}
export function getGlobalState() {
    return STORE.GlobalStore
        ? STORE.GlobalStore.getState()
        : {}
}
export function setGlobalStore(store) {
    STORE.GlobalStore = store
}
//  #endregion

//  #region APP CONFIG
export function setIsDemo(isDemo) {
    STORE.IsDemo = isDemo
}
export function isDemo() {
    return STORE.IsDemo
}
export function startSession() {
    if (STORE.Session != null) return
    STORE.Session = PureFunc.getRandomString()
}
export function getSession() {
    return STORE.Session
}
export function increaseAndGetSequenceId() {
    STORE.SequenceId = STORE.SequenceId + 1
    return STORE.SequenceId
}
export function setSound(sound) {
    STORE.Sound = PureFunc.clone(sound)
}
export function getSound() {
    return PureFunc.clone(STORE.Sound)
}
export function setVibrate(vibrate) {
    STORE.Vibrate = PureFunc.clone(vibrate)
}
export function getVibrate() {
    return PureFunc.clone(STORE.Vibrate)
}
export function setLang(lang) {
    STORE.Lang = PureFunc.clone(lang)
}
export async function setLangGuest(lang) {
    await AsyncStorage.setItem('langGuest', lang || '');
}
export async function getLangGuest() {
    const result = await new Promise(resolve => {
        AsyncStorage.getItem('langGuest')
            .then(res => resolve(res))
            .catch(err => {
                console.log('getLangGuest err', err)
                resolve()
            })
    })
    return result;
}
export function getLang() {
    return PureFunc.clone(STORE.Lang)
}

export function setFontSize(size) {
    if (size && typeof size === 'string') {
        size = parseInt(size)
    }
    STORE.FontSize = PureFunc.clone(size)
}
export function getFontSize() {
    return PureFunc.clone(STORE.FontSize) || 17
}
export async function setFontSizeOfGuest(size) {
    await AsyncStorage.setItem('fontSize', `${size}`)
}
export async function getFontSizeOfGuest() {
    const result = await new Promise(resolve => {
        AsyncStorage.getItem('fontSize')
            .then(res => resolve(res))
            .catch(err => {
                console.log('getFontSizeOfGuest', err)
                resolve()
            })
    })
    return result
        ? parseInt(result)
        : 17
}

export function setIsSearchAccount(isSearchAccount) {
    STORE.isSearchAccount = isSearchAccount
}

export function getIsSearchAccount() {
    return STORE.isSearchAccount
}
//  #endregion

//  #region TOKEN
export function setAccessToken(accessToken) {
    STORE.AccessToken = accessToken || null
}
export function getAccessToken() {
    return STORE.AccessToken
}
//  #endregion

//  #region ACCOUNT
export function setAccountId(accountId) {
    STORE.AccountId = accountId || null
}
export function getAccountId() {
    return STORE.AccountId
}
export function setListAccount(listAccount) {
    STORE.ListAccount = PureFunc.clone(listAccount)
}
export function getListAccount() {
    return PureFunc.clone(STORE.ListAccount || [])
}
export function setCurrentAccount(account) {
    STORE.CurrentAccount = PureFunc.clone(account)
}
export function getCurrentAccount() {
    return PureFunc.clone(STORE.CurrentAccount)
}
//  #endregion

//  #region SCREEN
export function getCurrentScreen() {
    return STORE.CurrentScreen
}
export function setCurrentScreen(screen) {
    STORE.CurrentScreen = screen
}
//  #endregion

//  #region REQUEST STATUS CONTROL
export function getReqStatus(key) {
    return STORE.RequestStatus[key]
}
export function setReqStatus(key, value) {
    STORE.RequestStatus[key] = value
}
export function getListFuncWaitRes(key) {
    return PureFunc.clone(STORE.ListFuncWaitRes[key] || [])
}
export function setListFuncWaitRes(key, listFunc) {
    STORE.ListFuncWaitRes[key] = PureFunc.clone(listFunc)
}
export function pushToListFuncWaitRes(key, resolve, reject) {
    if (!STORE.ListFuncWaitRes[key]) STORE.ListFuncWaitRes[key] = []
    STORE.ListFuncWaitRes[key].push({
        resolve,
        reject
    })
}
//  #endregion

//  #region USER INFO
export function setUserInfo(userinfo = {}) {
    STORE.UserInfo = PureFunc.clone(userinfo)
}
export function getUserInfo() {
    return PureFunc.clone(STORE.UserInfo)
}
//  #endregion

//  #region SETTING
export function setUserPriceSource(userPriceSource) {
    STORE.UserPriceSource = userPriceSource
}
export function getUserPriceSource() {
    return STORE.UserPriceSource
}
export function setLoginStatus(isLogin) {
    STORE.IsLogin = isLogin
    if (isLogin) {
        const channel = getChannelForceRenderDrawer()
        Emitter.emit(channel)
    }
}
export function getLoginStatus() {
    return STORE.IsLogin
}
export function getThemeColorFromStorage() {
    return STORE.ThemeColor
}
export async function getThemeColor() {
    try {
        const result = await new Promise(resolve => {
            AsyncStorage.getItem('currentTheme')
                .then(res => resolve(res))
                .catch(err => {
                    console.log('getThemeColor error', err)
                    resolve()
                })
        })
        // return STORE.ThemeColor
        return result || Enum.THEME.LIGHT;
    } catch (error) {
        console.log('getThemeColor', error)
    }
}
export async function setThemeColor(newTheme = Enum.THEME.LIGHT) {
    newTheme && await AsyncStorage.setItem('currentTheme', newTheme);
    STORE.ThemeColor = newTheme
    console.log('setThemeColor', newTheme)
    // STORE.ThemeColor = newTheme
}
export function setIsShowingAlertChangeRole(val) {
    STORE.isShowingAlertChangeRole = val
}
export function getIsShowingAlertChangeRole() {
    return STORE.isShowingAlertChangeRole
}
//  #endregion

//  #region WATCHLIST
export function getPriceboard() {
    return PureFunc.clone(STORE.Priceboard)
}
export function setPriceboard(data) {
    STORE.Priceboard = PureFunc.clone(data)
}
export function getCurrentPriceboardId() {
    return STORE.CurrentPriceboardId
}
export function setCurrentPriceboardId(id) {
    STORE.CurrentPriceboardId = id
}
//  #endregion

//  #region ORDER
export function getIressStatus() {
    return STORE.EnableIress
}
export function setIressStatus(status) {
    STORE.EnableIress = status
}
//  #endregion

//  #region NEWS
export function getLiveNewStatus() {
    const userDetails = getUserInfo()
    return userDetails.live_news
        ? userDetails.live_news
        : 0
}
//  #endregion

//  #region SYMBOL
export function setSymbolEquity(obj) {
    STORE.SymbolEquity[obj.symbol] = obj
}
export function getSymbolEquity(symbol) {
    return PureFunc.clone(STORE.SymbolEquity[symbol] || null)
}
//  #endregion

// #region USER PRICE SOURCE
export function getMarketDataAU() {
    if (!getLoginStatus()) return Enum.PRICE_SOURCE.delayed
    const userDetails = getUserInfo()
    return userDetails.market_data_au
        ? userDetails.market_data_au
        : 0
}

export function getMarketDataUS() {
    if (!getLoginStatus()) return Enum.PRICE_SOURCE.delayed
    const userDetails = getUserInfo()
    return userDetails.market_data_us
        ? userDetails.market_data_us
        : 0
}
// #endregion

// #region TIMEZONE
export function setTimeZoneAU(timezone) {
    STORE.AUTimeZone = timezone
}

export function setTimeZoneUS(timezone) {
    STORE.USTimeZone = timezone
}

export function getTimeZoneAU() {
    return STORE.AUTimeZone
}

export function getTimeZoneUS() {
    return STORE.USTimeZone
}

export function setLocation(location) {
    STORE.location = PureFunc.clone(location)
}

export function getLocation() {
    return PureFunc.clone(STORE.location)
}

export function setBaseUrl(baseUrl) {
    if (baseUrl) {
        STORE.baseUrl = `https://${baseUrl}`
    } else {
        STORE.baseUrl = null
    }
}

export function getBaseUrl() {
    return STORE.baseUrl
}

export function setBaseStreamingUrl(streamingUrl) {
    if (streamingUrl) {
        STORE.baseStreamingUrl = `https://${streamingUrl}`
    } else {
        STORE.baseStreamingUrl = null
    }
}

export function getBaseStreamingUrl() {
    return STORE.baseStreamingUrl
}

export function setRegion(region) {
    if (region) {
        STORE.region = region
    } else {
        STORE.region = null
    }
}

export function getRegion() {
    return STORE.region
}

export function getBaseVersion() {
    return STORE.baseVersion
}

export function setBaseVersion(baseVersion) {
    if (baseVersion) {
        STORE.baseVersion = baseVersion
    } else {
        STORE.baseVersion = null
    }
}
// #endregion

/* #region FCM */
export function setFCMToken(fcmToken) {
    STORE.fcmToken = fcmToken
}

export function getFCMToken() {
    return PureFunc.clone(STORE.fcmToken)
}
/* #endregion */
export function setListAlerts(listAlerts) {
    STORE.listAlerts = PureFunc.clone(listAlerts)
}

export function getListAlerts() {
    return PureFunc.clone(STORE.listAlerts)
}

export function setRealWindowHeight(height) {
    STORE.realWindowHeight = height
}

export function getRealWindowHeight() {
    return STORE.realWindowHeight
}

export function setStatusModalCurrent(status) {
    STORE.statusModalCurrent = status
}

export function getStatusModalCurrent() {
    return STORE.statusModalCurrent
}

export function setShouldSetDefault(status) {
    return STORE.isShouldSetDefault = status;
}

export function getShouldSetDefault() {
    return STORE.isShouldSetDefault
}

export function setInAppStatus(status) {
    STORE.inApp = status
}

export function getInAppStatus() {
    return STORE.inApp
}
