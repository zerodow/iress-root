import React, { Component, PureComponent } from 'react';
import { View, Text, Dimensions, Animated } from 'react-native';
import I18n from '~/modules/language/index';
import SwitchButton from '~/screens/alert_function/components/SwitchButton';
import CommonStyle from '~/theme/theme_controller';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ENUM from '~/enum';
import TransitionView from '~/component/animation_component/transition_view'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Navigation } from 'react-native-navigation'
import { getInvertTranslate, getListInvertTranslate, translateCustomLang } from '~/invert_translate'
import SETTING_TYPE from '~/constants/setting_type'
import * as Controller from '~/memory/controller';
import * as settingActions from '../setting.actions';
import * as loginActions from '~/screens/login/login.actions';
import WatchListActions from '~/screens/watchlist/reducers'
import { getKeyObjectFromValue } from '~/util'
import { saveDataSetting, getWatchlistTitle, updateLanguageDrawer } from '~/business'

const mapLang = {
    en: 'English',
    cn: '中文',
    vi: 'Tiếng Việt'
}

class SettingLanguage extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    renderSeperate = this.renderSeperate.bind(this)
    renderSeperate() {
        return <View style={{
            height: 1,
            backgroundColor: CommonStyle.fontColorBorderNew,
            marginLeft: 16
        }} />
    }

    calMeasureLanguageModal = this.calMeasureLanguageModal.bind(this)
    calMeasureLanguageModal({ x, y, w, h, px, py }) {
        this.measureSettingLanguage = {
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

    onDismissModal = this.onDismissModal.bind(this)
    onDismissModal() {
        Navigation.dismissModal({
            animation: true,
            animationType: 'none'
        })
    }

    onSelectLanguage = this.onSelectLanguage.bind(this)
    async onSelectLanguage(data) {
        const lang = getKeyObjectFromValue(ENUM.mapLang, data)
        // Save language to local
        if (Controller.getLoginStatus()) {
            saveDataSetting(SETTING_TYPE.LANG, lang)
        } else {
            Controller.setLang(lang)
            Controller.setLangGuest(lang)
            this.props.actions.setLang(lang)
        }
        // Change language bottom tabbar
        this.props.changeLanguageBottomTabBar && this.props.changeLanguageBottomTabBar()
        this.onDismissModal()
        const { subTitle, title } = await getWatchlistTitle() // update watchlist title when change language\
        Controller.dispatch(WatchListActions.watchListSetTitle(
            subTitle,
            title
        ))
    }

    showModalLanguage = this.showModalLanguage.bind(this)
    showModalLanguage() {
        const { lang } = this.props.setting;
        const languageSelected = ENUM.mapLang[lang]
        this.languageRef.measure && this.languageRef.measure((x, y, w, h, px, py) => {
            this.calMeasureLanguageModal({ x, y, w, h, px, py })
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
                    listItem: [ENUM.mapLang.en, ENUM.mapLang.cn, ENUM.mapLang.vi],
                    isFlag: true,
                    onCancel: this.onDismissModal,
                    onPressBackdrop: this.onDismissModal,
                    onSelect: this.onSelectLanguage,
                    top: this.top,
                    height: this.height,
                    value: languageSelected
                }
            })
        })
    }

    renderLanguage = this.renderLanguage.bind(this)
    renderLanguage() {
        const { lang } = this.props.setting;
        return <React.Fragment>
            <TouchableOpacityOpt
                setRef={ref => {
                    if (ref) {
                        this.languageRef = ref
                    }
                }}
                onPress={this.showModalLanguage}
                onLayout={this._onLayout}
                style={[CommonStyle.sectContent, { justifyContent: 'space-between' }]}>
                <Text style={[CommonStyle.sectContentText, { width: '30%' }]}>
                    {I18n.t('language', { locale: lang })}
                </Text>
                <View
                    style={[{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        width: '70%'
                    }]}
                >
                    <Text style={[CommonStyle.langSelected, { marginRight: 16, textAlign: 'right' }]}>
                        {mapLang[lang]}
                    </Text>
                    <Ionicons name='ios-arrow-forward' size={24} color={CommonStyle.colorIconSettings} />
                </View>
            </TouchableOpacityOpt>
            {this.renderSeperate()}
        </React.Fragment>
    }

    render() {
        return this.renderLanguage()
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

export default connect(mapStateToProps, mapDispatchToProps)(SettingLanguage);
