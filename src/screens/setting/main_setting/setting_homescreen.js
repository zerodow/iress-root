import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import I18n from '~/modules/language/index';
import CommonStyle from '~/theme/theme_controller';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import Ionicons from 'react-native-vector-icons/Ionicons';
import HOME_SCREEN from '~/constants/home_screen.json'
import { getInvertTranslate, getListInvertTranslate, translateCustomLang } from '~/invert_translate'
import SETTING_TYPE from '~/constants/setting_type'
import { Navigation } from 'react-native-navigation'
import * as Controller from '~/memory/controller';
import * as settingActions from '../setting.actions';
import * as loginActions from '~/screens/login/login.actions';
import { saveDataSetting } from '~/business'
import { checkDisableScreenByRole } from '~/lib/base/functionUtil'
import Enum from '~/enum'

const { ROLE_USER } = Enum

const listHomeScreen = [];
HOME_SCREEN.map(e => {
    if (e.screenName === 'Watchlist' || e.screenName === 'Portfolio Performance') {
        return
    }
    listHomeScreen.push(e.screenName)
});

class SettingHomeScreen extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isShowModal: false
        }
        this.disableHomeScreen = this.checkDisableHomeScreen()
    }

    checkDisableHomeScreen = this.checkDisableHomeScreen.bind(this)
    checkDisableHomeScreen() {
        return true
    }

    _onLayout = this._onLayout.bind(this)
    _onLayout(event) {
        this.topModalHomeScreen = event.nativeEvent.layout.y + event.nativeEvent.layout.height
        this.topModalHomeScreenOrigin = this.topModalHomeScreen;
        console.log('DCM SettingHomeScreen onlayout', this.topModalHomeScreen)
    }

    onDismissModal = this.onDismissModal.bind(this)
    onDismissModal() {
        Navigation.dismissModal({
            animation: true,
            animationType: 'none'
        })
    }

    showModalHomeScreen = this.showModalHomeScreen.bind(this)
    showModalHomeScreen() {
        const { homeScreen } = this.props.setting;
        const homeScreenDisplay = this.getHomeScreenDisplay(homeScreen);
        this.displayHomeScreen = getListInvertTranslate(listHomeScreen)
        const listItemDisable = []
        if (checkDisableScreenByRole(ROLE_USER.ROLE_MARKET_OVERVIEW)) listItemDisable.push(2)
        if (checkDisableScreenByRole(ROLE_USER.ROLE_PORTFOLIO_HOLDING_PERFORMANCE)) listItemDisable.push(0, 1)
        this.homeScreenRef.measure && this.homeScreenRef.measure((x, y, w, h, px, py) => {
            this.calMeasureHomeScreenModal({ x, y, w, h, px, py })
            Navigation.showModal({
                screen: 'equix.PickerBottomV2',
                animated: true,
                animationType: 'none',
                navigatorStyle: {
                    ...CommonStyle.navigatorSpecialNoHeader,
                    statusBarTextColorScheme: CommonStyle.statusBarTextScheme,
                    screenBackgroundColor: 'transparent',
                    modalPresentationStyle: 'overCurrentContext'
                },
                passProps: {
                    title: '',
                    textBtnCancel: '',
                    listItem: this.displayHomeScreen,
                    listItemDisable,
                    onCancel: this.onDismissModal,
                    onPressBackdrop: this.onDismissModal,
                    onSelect: this.onSelectHomeScreen,
                    top: this.top,
                    height: this.height,
                    value: homeScreenDisplay
                }
            })
        })
    }

    getHomeScreenDisplay = this.getHomeScreenDisplay.bind(this)
    getHomeScreenDisplay(homeScreen) {
        if (HOME_SCREEN[homeScreen] && HOME_SCREEN[homeScreen].screenName && homeScreen !== -1) {
            let screenName = HOME_SCREEN[homeScreen].screenName
            if (screenName === 'Portfolio Performance') {
                screenName = 'Holdings'
            }
            return getInvertTranslate(screenName)
        } else {
            let screenName = HOME_SCREEN[dataStorage.homeScreen].screenName
            if (screenName === 'Portfolio Performance') {
                screenName = 'Holdings'
            }
            return getInvertTranslate(HOME_SCREEN[dataStorage.homeScreen].screenName)
        }
    }

    onSelectHomeScreen = this.onSelectHomeScreen.bind(this)
    onSelectHomeScreen(data) {
        let trans = translateCustomLang(data)
        // Fix bug crash khi chon home screen là overview o tieng trung, chung key cn.json -> Future check theo key
        if ((trans + '').toUpperCase() === 'OVERVIEW') {
            trans = 'Market Overview'
        }
        const tabSelected = HOME_SCREEN.find(e => {
            return e.screenName === trans
        })
        saveDataSetting(SETTING_TYPE.HOME_SCREEN, tabSelected.id || 0)
        this.onDismissModal()
    }

    calMeasureHomeScreenModal = this.calMeasureHomeScreenModal.bind(this)
    calMeasureHomeScreenModal({ x, y, w, h, px, py }) {
        this.measureSettingHomeScreen = {
            x,
            y,
            w,
            h,
            px,
            py
        }
        this.top = h + py
        this.height = h
    }

    renderSeperate = this.renderSeperate.bind(this)
    renderSeperate() {
        return <View style={{
            height: 1,
            backgroundColor: CommonStyle.fontColorBorderNew,
            marginLeft: 16
        }} />
    }

    renderHomeScreen = this.renderHomeScreen.bind(this)
    renderHomeScreen() {
        if (!Controller.getLoginStatus()) return null
        const { lang, homeScreen } = this.props.setting;
        const homeScreenDisplay = this.getHomeScreenDisplay(homeScreen);
        return <React.Fragment>
            <TouchableOpacityOpt
                testID='homeScreenButton'
                onPress={this.showModalHomeScreen}
                setRef={ref => {
                    if (ref) {
                        this.homeScreenRef = ref
                    }
                }}
                style={[
                    CommonStyle.sectContent,
                    { justifyContent: 'space-between' }
                ]}>
                <Text style={[CommonStyle.sectContentText, { width: '50%' }]}>
                    {I18n.t('homeScreenTitle', { locale: lang })}
                </Text>
                <View
                    style={[{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        width: '50%'
                    }]}
                >
                    {/* <Text style={[CommonStyle.langSelected, { marginRight: 16, textAlign: 'right' }]}>
                        {homeScreenDisplay}
                    </Text>
                    <Ionicons
                        name='ios-arrow-forward'
                        size={24}
                        color={CommonStyle.colorIconSettings} /> */}
                    <Text style={[CommonStyle.langSelected, { textAlign: 'right' }]}>
                        {homeScreenDisplay}
                    </Text>
                </View>
            </TouchableOpacityOpt>
            {this.renderSeperate()}
        </React.Fragment>
    }

    render() {
        return this.renderHomeScreen()
    }
}

function mapStateToProps(state) {
    return {
        setting: state.setting,
        tokenLogin: state.login.token,
        emailLogin: state.login.email,
        isConnected: state.app.isConnected
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(settingActions, dispatch),
        loginActions: bindActionCreators(loginActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingHomeScreen);
