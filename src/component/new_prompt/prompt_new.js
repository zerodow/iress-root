import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, ActivityIndicator,
    Platform, StyleSheet, Linking, PixelRatio
} from 'react-native'
import Modal from 'react-native-modal'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import * as loginActions from '../../screens/login/login.actions'
import { VibrancyView, BlurView } from 'react-native-blur'
import { dataStorage } from '../../storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language/';
import * as Business from '~/business'
class PromptNew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            type: ''
        }
        this.logoutFunc = this.logoutFunc.bind(this)
        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
        this.isMount = false;
    }
    testLink() {
        console.log('a')
    }

    communication(param, type) {
        this.props.isHideModal !== undefined && this.props.isHideModal !== null && this.props.isHideModal && this.hideModal();
        setTimeout(() => {
            if (type === 'mail') {
                url = `mailto:${param}`
            } else if (type === 'tel') {
                url = `tel:${param}`
            }
            Linking.canOpenURL(url)
                .then(supported => {
                    if (supported) {
                        return Linking.openURL(url)
                            .then(() => {
                                console.log('linking success')
                            })
                            .catch(error => {
                                console.log('cant linking', error)
                            })
                    } else {
                        console.log('Not supported')
                    }
                })
                .catch(error => console.log('Cant Linking', error))
        }, 500)
    }
    showModal() {
        this.isMount && this.setState({
            isModalVisible: true
        })
    }
    hideModal(cb = null) {
        this.isMount && this.setState({
            isModalVisible: false
        }, () => {
            cb && typeof cb === 'function' && cb();
            this.props.hidePlacingOrderCb && this.props.hidePlacingOrderCb()
            this.props.reloadAfterLoginCallback && this.props.reloadAfterLoginCallback()
            this.props.realtimeLockFn && this.props.realtimeLockFn()
        })
    }
    logoutFunc() {
        // Clear last email when enter wrong pin 3 times
        this.props.actions.setLastEmail('')
        this.props.actions.logout(this.props.navigator, this.hideModal)
    }
    componentDidMount() {
        this.isMount = true
        this.props.onRef && this.props.onRef(this)
        this.props.isShow && this.showModal();
    }
    componentWillUnmount() {
        this.isMount = false
        this.props.onRef && this.props.onRef(undefined)
    }
    render() {
        const { textLink, textEmail, textDefault, textUnderline } = styles;
        const { isModalVisible } = this.state;
        const { touchIDType, type } = this.props;
        const lockText = touchIDType === '' || !touchIDType
            ? type === 'changedToken'
                ? I18n.t('changedTokenWarning', { locale: this.props.setting.lang })
                : I18n.t('wrongPinManyTimes', { locale: this.props.setting.lang })
            : touchIDType === 'notEnrolled'
                ? Platform.OS === 'ios' ? I18n.t('notEnrolledTouchIDIOS', { locale: this.props.setting.lang }) : I18n.t('notEnrolledTouchIDAndroid', { locale: this.props.setting.lang })
                : I18n.t('lockTouchID', { locale: this.props.setting.lang })
        return (
            <Modal
                onModalHide={() => {
                    Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarBgColor })
                }}
                onModalShow={() => {
                    Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarColor })
                }}
                isVisible={isModalVisible}
                backdropColor={CommonStyle.fontDefaultColorOpacity}
                style={{ flex: 1, position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {
                        // Platform.OS === 'ios'?
                        // <View style={{ borderRadius: 16 }}>
                        <View testID={this.props.type && this.props.type === 'reviewAccount' ? `reviewAccLoginSuccessModal` : ``} style={{ backgroundColor: CommonStyle.bgCircleDrawer, borderRadius: 16 }}>
                            {
                                this.props.type && (this.props.type === 'reviewAccount' || this.props.type === 'lockedAccount')
                                    ? this.props.type === 'reviewAccount'
                                        ? <View style={{ marginHorizontal: 6, marginTop: 15, marginBottom: 15 }}>
                                            <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
                                                <Text style={textDefault}>{I18n.t('lockedAccPopup1', { locale: this.props.setting.lang })}</Text>
                                                <Text style={[textDefault, { fontWeight: '700', color: 'black' }]}>{dataStorage.accountId || ''}</Text>
                                                <Text style={textDefault}>{` ${I18n.t('reviewAccPopup1', { locale: this.props.setting.lang })}`}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 15 }}>
                                                <Text style={textDefault}>{`${I18n.t('reviewAccPopup2', { locale: this.props.setting.lang })} `}</Text>
                                                <Text style={[textDefault, textLink]} onPress={() => this.communication('1300769433', 'tel')}>{`1300 769 433`}</Text>
                                                <Text style={textDefault}>{`, `}</Text>
                                                <Text style={[textDefault, textLink]} onPress={() => this.communication('+61381997700', 'tel')}>{`+61 3 81997700`}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 5 }}>
                                                <Text style={textDefault}>{`${I18n.t('reviewAccPopup3', { locale: this.props.setting.lang })}`}</Text>
                                                <Text onPress={() => this.communication('service@iress.com.au', 'mail')} style={[textDefault, textLink, textUnderline]}>{` ${I18n.t('reviewAccPopup4', { locale: this.props.setting.lang })}`}</Text>
                                                <Text style={textDefault}>{` ${I18n.t('reviewAccPopup5', { locale: this.props.setting.lang })}`}</Text>
                                            </View>
                                        </View>
                                        : <View style={{ marginHorizontal: 6, marginTop: 15, marginBottom: 15 }}>
                                            <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
                                                <Text style={textDefault}>{I18n.t('lockedAccPopup1', { locale: this.props.setting.lang })}</Text>
                                                <Text style={[textDefault, { fontWeight: '700', color: 'black' }]}>{dataStorage.accountId || ''}</Text>
                                                <Text style={textDefault}>{` ${I18n.t('lockedAccPopup2', { locale: this.props.setting.lang })}`}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                {/* <Text style={[textDefault, textEmail]}>{`${dataStorage.emailLogin ? (dataStorage.emailLogin + '').toLowerCase() : ''}`}</Text> */}
                                                {/* <Text style={textDefault}>{` ${I18n.t('reviewAccPopup1')}`}</Text> */}
                                            </View>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 15 }}>
                                                <Text style={textDefault}>{`${I18n.t('reviewAccPopup2', { locale: this.props.setting.lang })} `}</Text>
                                                <Text style={[textDefault, textLink]} onPress={() => this.communication('1300769433', 'tel')}>{`1300 769 433`}</Text>
                                                <Text style={textDefault}>{`, `}</Text>
                                                <Text style={[textDefault, textLink]} onPress={() => this.communication('+61381997700', 'tel')}>{`+61 3 81997700`}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 5 }}>
                                                <Text style={textDefault}>{`${I18n.t('reviewAccPopup3', { locale: this.props.setting.lang })}`}</Text>
                                                <Text onPress={() => this.communication('service@iress.com.au', 'mail')} style={[textDefault, textLink, textUnderline]}>{` ${I18n.t('reviewAccPopup4', { locale: this.props.setting.lang })}`}</Text>
                                                <Text style={textDefault}>{` ${I18n.t('reviewAccPopup5', { locale: this.props.setting.lang })}`}</Text>
                                            </View>
                                        </View>
                                    : <View style={{ marginHorizontal: 16, paddingTop: 32, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontWhite, fontFamily: CommonStyle.fontPoppinsRegular }]}>{I18n.t('notice')}</Text>
                                        <Text testID={`failPin`} style={[textDefault, { justifyContent: 'center', alignItems: 'center', textAlign: 'center', marginTop: 8, color: CommonStyle.fontWhite, fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeM - 2 }]}>{lockText}</Text>
                                    </View>
                            }
                            {/* <View style={{ height: 1, backgroundColor: '#0000001e' }}></View> */}
                            {
                                this.props.isLockedTouchID
                                    ? <View style={{ height: this.props.isLockedTouchID ? 45 : 24, marginTop: this.props.isLockedTouchID ? 32 : 11.5, marginBottom: this.props.isLockedTouchID ? 16 : 11.5, flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-around' }}>
                                        <TouchableOpacity onPress={this.hideModal} style={{
                                            borderWidth: 0.5,
                                            borderRadius: 100,
                                            borderColor: CommonStyle.fontColorButtonSwitch,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: '45%'
                                        }}>
                                            <Text style={[CommonStyle.fontLargeNormal, { color: CommonStyle.fontColorButtonSwitch, textAlign: 'center', fontSize: CommonStyle.fontSizeS }]}>{I18n.t('cancel', { locale: this.props.setting.lang })}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.props.linkAppSetting && this.props.linkAppSetting} style={{
                                            justifyContent: 'center',
                                            borderWidth: 0.5,
                                            borderRadius: 100,
                                            borderColor: CommonStyle.fontColorButtonSwitch,
                                            alignItems: 'center',
                                            width: '45%'
                                        }}>
                                            <Text style={[CommonStyle.fontLargeNormal, { color: CommonStyle.fontColorButtonSwitch, textAlign: 'center', fontSize: CommonStyle.fontSizeS }]}>{I18n.t('settings', { locale: this.props.setting.lang })}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    : <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }}>
                                        <TouchableOpacity onPress={(this.props.type && (this.props.type === 'reviewAccount' || this.props.type === 'lockedAccount')) ? this.hideModal : this.logoutFunc} style={{
                                            borderWidth: this.props.isLoading ? 0 : 0.5,
                                            borderRadius: 100,
                                            borderColor: CommonStyle.fontColorButtonSwitch,
                                            backgroundColor: this.props.isLoading ? CommonStyle.fontDisable : CommonStyle.fontColorButtonSwitch,
                                            width: '45%',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {
                                                this.props.isLoading
                                                    ? <ActivityIndicator style={{ width: 24, height: 24, paddingVertical: 8 }} color='black' />
                                                    : <Text testID={this.props.type && this.props.type === 'reviewAccount' ? `reviewAccLoginSuccessBtnConfirm` : ``} style={[CommonStyle.fontLargeNormal, { color: CommonStyle.fontDark, textAlign: 'center', fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeM - 2, paddingVertical: 8 }]}>{I18n.t('ok', { locale: this.props.setting.lang })}</Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                            }
                            {/* </View> */}
                        </View>
                    }
                </View>
            </Modal>
        )
    }
}

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        textLink: {
            color: '#007aff'
        },
        textEmail: {
            fontWeight: Platform.OS === 'ios' ? '700' : 'bold'
        },
        textDefault: {
            fontSize: CommonStyle.fontSizeM,
            fontFamily: CommonStyle.fontFamily,
            color: '#030303'
        },
        textUnderline: {
            textDecorationLine: 'underline'
        }
    })

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

function mapStateToProps(state) {
    return {
        isLoading: state.login.isLoading,
        setting: state.setting
    }
}
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(loginActions, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(PromptNew)
