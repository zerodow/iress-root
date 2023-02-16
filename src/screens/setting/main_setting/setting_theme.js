import React, { Component, PureComponent } from 'react';
import { View, Text, Dimensions, Animated, Platform, StyleSheet } from 'react-native';
import I18n from '~/modules/language/index';
import SwitchButton from '~/screens/alert_function/components/SwitchButton';
import CommonStyle, { register, changeTheme } from '~/theme/theme_controller'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { dataStorage } from '~/storage'
import { Navigation } from 'react-native-navigation'
import ENUM from '~/enum';
import TransitionView from '~/component/animation_component/transition_view'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getKeyTranslate } from '~/invert_translate'
import * as Controller from '~/memory/controller';
import * as settingActions from '../setting.actions';
import * as loginActions from '~/screens/login/login.actions';
import * as ManageConnection from '~/manage/manageConnection'
import { showMainAppScreen } from '~/navigation/controller.1';
class SettingTheme extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            theme: dataStorage.currentTheme
        }
    }

    renderSeperate = this.renderSeperate.bind(this)
    renderSeperate() {
        return <View style={{
            height: 1,
            backgroundColor: CommonStyle.fontColorBorderNew,
            marginLeft: 16
        }} />
    }

    onDismissModal = this.onDismissModal.bind(this)
    onDismissModal() {
        Navigation.dismissModal({
            animation: true,
            animationType: 'none'
        })
    }

    onSelectTheme = this.onSelectTheme.bind(this)
    onSelectTheme(themeText) {
        const theme = themeText // getKeyTranslate(themeText)
        dataStorage.currentTheme = theme
        changeTheme(theme);
        Platform.OS === 'ios' && ManageConnection.reloadDrawer(theme)
        this.setState({ theme, isLoading: true })
        this.onDismissModal()
        // StatusBar.setBackgroundColor('blue')

        // showMainAppScreen({
        //     tabIndex: 1,
        //     activeTab: 1,
        //     originActiveTab: 1
        // })

        // this.props.navigator.setStyle({
        //     statusBarColor: 'red'
        // });

        setTimeout(() => {
            this.props.reRenderSetting()
        }, 1000);
    }

    showModalTheme = this.showModalTheme.bind(this)
    showModalTheme() {
        // const listTheme = [I18n.t('light'), I18n.t('dark')]
        const listTheme = ['dark', 'theme1']
        const selectedTheme = this.state.theme;
        // === ENUM.THEME.LIGHT
        //     ? I18n.t('light')
        //     : I18n.t('dark')
        this.themeRef.measure && this.themeRef.measure((x, y, w, h, px, py) => {
            this.calMeasureThemeModal({ x, y, w, h, px, py })
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
                    listItem: listTheme,
                    onCancel: this.onDismissModal,
                    onPressBackdrop: this.onDismissModal,
                    onSelect: this.onSelectTheme,
                    top: this.top,
                    height: this.height,
                    value: selectedTheme
                }
            })
        })
    }

    calMeasureThemeModal = this.calMeasureThemeModal.bind(this)
    calMeasureThemeModal({ x, y, w, h, px, py }) {
        this.measureTheme = {
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

    getValueThemes() {
        switch (this.state.theme) {
            case 'light':
                return 'Light'
            case 'dark':
                return 'Dark'
            case 'theme1':
                return 'Theme 1'
            default:
                return this.state.theme
        }
    }

    renderTheme = this.renderTheme.bind(this)
    renderTheme() {
        const { lang } = this.props.setting
        return <React.Fragment>
            <TouchableOpacityOpt
                testID=''
                onPress={this.showModalTheme}
                setRef={ref => {
                    if (ref) {
                        this.themeRef = ref
                    }
                }}
                style={[CommonStyle.sectContent, { justifyContent: 'space-between' }]}>
                <Text style={[CommonStyle.sectContentText, { width: '50%' }]}>
                    {I18n.t('themes', { locale: lang })}
                </Text>
                <View
                    style={[{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        width: '50%'
                    }]}
                >
                    <Text style={[CommonStyle.langSelected, { marginRight: 16, textAlign: 'right' }]}>
                        {this.getValueThemes()}
                    </Text>
                    {/* <Text style={[CommonStyle.langSelected, { textAlign: 'right' }]}>
                        {I18n.t('dark')}
                    </Text> */}
                    <Ionicons
                        name='ios-arrow-forward'
                        size={24}
                        color={CommonStyle.colorIconSettings} />
                </View>
            </TouchableOpacityOpt>
            {this.renderSeperate()}
        </React.Fragment>
    }

    render() {
        return this.renderTheme()
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

export default connect(mapStateToProps, mapDispatchToProps)(SettingTheme);
