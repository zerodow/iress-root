import React, { Component, PureComponent } from 'react';
import { View, Text, Dimensions, Animated } from 'react-native';
import I18n from '~/modules/language/index';
import CommonStyle, { register, changeTheme } from '~/theme/theme_controller'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { dataStorage } from '~/storage'
import ENUM from '~/enum';
import TransitionView from '~/component/animation_component/transition_view'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Navigation } from 'react-native-navigation'
import { saveDataSetting } from '~/business'
import * as Controller from '~/memory/controller';
import * as settingActions from '../setting.actions';
import * as loginActions from '~/screens/login/login.actions';

const { FONT_SIZE_LIST, FONT_SIZE_INT } = ENUM

class SettingTextSize extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            theme: dataStorage.currentTheme
        }
    }

    _onLayout = this._onLayout.bind(this)
    _onLayout(event) {
        this.topModalTextSize = event.nativeEvent.layout.y + event.nativeEvent.layout.height
        this.topModalTextSizeOrigin = this.topModalTextSize
    }

    onDismissModal = this.onDismissModal.bind(this)
    onDismissModal() {
        Navigation.dismissModal({
            animation: true,
            animationType: 'none'
        })
    }

    onSelectTextSize = this.onSelectTextSize.bind(this)
    async onSelectTextSize(sizeText) {
        const size = FONT_SIZE_INT[sizeText]
        Controller.setFontSize(size)
        dataStorage.currentTheme = await Controller.getThemeColor();
        changeTheme(dataStorage.currentTheme);
        // Save fontSize to local
        if (Controller.getLoginStatus()) {
            saveDataSetting('textFontSize', size)
        } else {
            Controller.setFontSizeOfGuest(size)
            this.props.actions.setFontSize(size)
        }
        this.onDismissModal()
    }

    showModalTextSize = this.showModalTextSize.bind(this)
    showModalTextSize() {
        const selectedTextSize = this.getSize()
        this.textSizeRef && this.textSizeRef.measure && this.textSizeRef.measure((x, y, w, h, px, py) => {
            this.calMeasureTextSizeModal({ x, y, w, h, px, py })
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
                    listItem: FONT_SIZE_LIST,
                    onCancel: this.onDismissModal,
                    onPressBackdrop: this.onDismissModal,
                    onSelect: this.onSelectTextSize,
                    top: this.top,
                    height: this.height,
                    value: selectedTextSize
                }
            })
        })
    }

    getSize = this.getSize.bind(this)
    getSize() {
        switch (Controller.getFontSize()) {
            case FONT_SIZE_INT.Small:
                return 'Small';
            case FONT_SIZE_INT.Medium:
                return 'Medium';
            case FONT_SIZE_INT.Large:
                return 'Large';
            default:
                return 'Small'
        }
    }

    calMeasureTextSizeModal = this.calMeasureTextSizeModal.bind(this)
    calMeasureTextSizeModal({ x, y, w, h, px, py }) {
        this.measureSettingTextSize = {
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

    renderTextSize = this.renderTextSize.bind(this)
    renderTextSize() {
        const { lang } = this.props.setting
        return <React.Fragment>
            <TouchableOpacityOpt
                testID='' onPress={this.showModalTextSize}
                setRef={ref => {
                    if (ref) {
                        this.textSizeRef = ref
                    }
                }}
                onLayout={this._onLayout}
                style={[CommonStyle.sectContent, { justifyContent: 'space-between' }]}>
                <Text style={[CommonStyle.sectContentText, { width: '50%' }]}>
                    {I18n.t('textSizeSetting', { locale: lang })}
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
                        {this.getSize()}
                    </Text>
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
        return this.renderTextSize()
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

export default connect(mapStateToProps, mapDispatchToProps)(SettingTextSize);
