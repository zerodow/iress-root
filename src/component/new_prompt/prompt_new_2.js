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

class PromptNew extends Component {
    constructor(props) {
        super(props);
        Text.allowFontScaling = !(PixelRatio.getFontScale() > 1.4);
        this.state = {
            isModalVisible: false,
            type: ''
        }
        this.logoutFunc = this.logoutFunc.bind(this)
        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
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
        this.setState({
            isModalVisible: true
        })
    }
    hideModal() {
        this.setState({
            isModalVisible: false
        }, () => {
            this.props.hidePlacingOrderCb && this.props.hidePlacingOrderCb()
            this.props.reloadAfterLoginCallback && this.props.reloadAfterLoginCallback()
            this.props.realtimeLockFn && this.props.realtimeLockFn()
        })
    }
    logoutFunc() {
        this.props.actions.logout(this.props.navigator)
    }
    componentDidMount() {
        this.props.onRef && this.props.onRef(this)
        this.props.isShow && this.showModal();
    }
    componentWillUnmount() {
        this.props.onRef && this.props.onRef(undefined)
    }
    render() {
        const { textLink, textEmail, textDefault, textUnderline } = styles;
        const { isModalVisible } = this.state;
        const { touchIDType } = this.props;
        let lockText = touchIDType === '' || !touchIDType
            ? I18n.t('wrongPinManyTimes', { locale: this.props.setting.lang })
            : touchIDType === 'notEnrolled'
                ? Platform.OS === 'ios' ? I18n.t('notEnrolledTouchIDIOS', { locale: this.props.setting.lang }) : I18n.t('notEnrolledTouchIDAndroid', { locale: this.props.setting.lang })
                : I18n.t('lockTouchID', { locale: this.props.setting.lang })
        return (
            <Modal
                isVisible={isModalVisible}
                animationIn={'fadeIn'}
                animationInTiming={300}
                animationOut={'fadeOut'}
                animationOutTiming={100}
                backdropColor={'rgba(0, 0, 0, 0.3)'}
                style={{ flex: 1, position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 16 }}>
                    {
                        Platform.OS === 'ios'
                            ? <BlurView blurType="xlight" style={{ borderRadius: 12 }}>
                                <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontBlack }]}>{I18n.t('notice')}</Text>
                                    </View>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                        <Text style={[textDefault, { fontWeight: '700' }]}>{dataStorage.emailLogin}</Text>
                                        <Text style={textDefault}>{` ${I18n.t('doesNotHaveLinked')}`}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {/* <Text style={[textDefault, textEmail]}>{`${dataStorage.emailLogin ? (dataStorage.emailLogin + '').toLowerCase() : ''}`}</Text> */}
                                        {/* <Text style={textDefault}>{` ${I18n.t('reviewAccPopup1', { locale: this.props.setting.lang })}`}</Text> */}
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 15 }}>
                                        <Text style={textDefault}>{`${I18n.t('reviewAccPopup2', { locale: this.props.setting.lang })} `}</Text>
                                        <Text style={[textDefault, textLink]} onPress={() => this.communication('1300769433', 'tel')}>{`1300 769 433`}</Text>
                                        <Text style={textDefault}>{`, `}</Text>
                                        <Text style={[textDefault, textLink]} onPress={() => this.communication('+61381997700', 'tel')}>{`+61 3 81997700`}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 5 }}>
                                        <Text style={textDefault}>{`${I18n.t('reviewAccPopup3', { locale: this.props.setting.lang })}`}</Text>
                                        <Text onPress={() => this.communication('service@iress.com.au', 'mail')} style={[textDefault, textLink, textUnderline]}>{` ${I18n.t('reviewAccPopup4')}`}</Text>
                                        <Text style={textDefault}>{` ${I18n.t('reviewAccPopup5', { locale: this.props.setting.lang })}`}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.1)' }} />
                                <TouchableOpacity onPress={() => this.hideModal()} style={{ height: 24, marginTop: 11.5, marginBottom: 11.5, justifyContent: 'center', alignItems: 'center' }}>
                                    {
                                        this.props.isLoading
                                            ? <ActivityIndicator style={{ width: 24, height: 24 }} color='black' />
                                            : <Text testID={this.props.type && this.props.type === 'reviewAccount' ? `reviewAccLoginSuccessBtnConfirm` : ``} style={[CommonStyle.fontLargeNormal, { color: '#007aff', textAlign: 'center' }]}>{I18n.t('ok')}</Text>
                                    }
                                </TouchableOpacity>
                            </BlurView>
                            : <View style={{ backgroundColor: 'white', borderRadius: 12 }}>
                                <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={[CommonStyle.textTitleDialog]}>{I18n.t('notice')}</Text>
                                    </View>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                        <Text style={[textDefault, { fontWeight: '700' }]}>{dataStorage.emailLogin}</Text>
                                        <Text style={textDefault}>{` ${I18n.t('doesNotHaveLinked')}`}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {/* <Text style={[textDefault, textEmail]}>{`${dataStorage.emailLogin ? (dataStorage.emailLogin + '').toLowerCase() : ''}`}</Text> */}
                                        {/* <Text style={textDefault}>{` ${I18n.t('reviewAccPopup1', { locale: this.props.setting.lang })}`}</Text> */}
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 15 }}>
                                        <Text style={textDefault}>{`${I18n.t('reviewAccPopup2')} `}</Text>
                                        <Text style={[textDefault, textLink]} onPress={() => this.communication('1300769433', 'tel')}>{`1300 769 433`}</Text>
                                        <Text style={textDefault}>{`, `}</Text>
                                        <Text style={[textDefault, textLink]} onPress={() => this.communication('+61381997700', 'tel')}>{`+61 3 81997700`}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 5 }}>
                                        <Text style={textDefault}>{`${I18n.t('reviewAccPopup3')}`}</Text>
                                        <Text onPress={() => this.communication('service@iress.com.au', 'mail')} style={[textDefault, textLink, textUnderline]}>{` ${I18n.t('reviewAccPopup4')}`}</Text>
                                        <Text style={textDefault}>{` ${I18n.t('reviewAccPopup5')}`}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.1)' }} />
                                <TouchableOpacity onPress={() => this.hideModal()} style={{ height: 24, marginTop: 11.5, marginBottom: 11.5, justifyContent: 'center', alignItems: 'center' }}>
                                    {
                                        this.props.isLoading
                                            ? <ActivityIndicator style={{ width: 24, height: 24 }} color='black' />
                                            : <Text testID={this.props.type && this.props.type === 'reviewAccount' ? `reviewAccLoginSuccessBtnConfirm` : ``} style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontApple, textAlign: 'center' }]}>{I18n.t('ok')}</Text>
                                    }
                                </TouchableOpacity>
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
