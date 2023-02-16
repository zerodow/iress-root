import React, { Component } from 'react'
import {
    View, Text, TouchableOpacity, TextInput, Keyboard, ActivityIndicator
} from 'react-native'
import I18n from '../../../../modules/language/index'
import { dataStorage, func } from '../../../../storage'
import Icon from 'react-native-vector-icons/Ionicons';
import * as Emitter from '@lib/vietnam-emitter'
// Api
import * as Api from '../../../../api'
// Redux
import * as loginActions from '../../../login/login.actions';
import * as authSettingActions from '../../../setting/auth_setting/auth_setting.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Style
import styles from '../../style/home_page'

// Component
import XComponent from '../../../../component/xComponent/xComponent'

class ContentForgotUsername extends XComponent {
    constructor(props) {
        super(props)

        this.init = this.init.bind(this)
        this.bindAllFunc = this.bindAllFunc.bind(this)
        this.bindAllFunc()
        this.init()
    }

    init() {
        this.state = {
            finish: false,
            email: '',
            confirmDisable: true,
            errorCode: '',
            showBusyBox: false
        }
    }

    bindAllFunc() {
        this.cancel = this.cancel.bind(this)
        this.confirmFn = this.confirmFn.bind(this)
        this.updateAction = this.updateAction.bind(this)
        this.clearEmail = this.clearEmail.bind(this)
        this._onChangeText = this._onChangeText.bind(this)
        this.renderContent = this.renderContent.bind(this)
        this.renderInput = this.renderInput.bind(this)
        this.requestSuccess = this.requestSuccess.bind(this)
        this.requestFail = this.requestFail.bind(this)
        this.showError = this.showError.bind(this)
        this.backWhenFinish = this.backWhenFinish.bind(this)
        this.requestForgotUsername = this.requestForgotUsername.bind(this)
        this.renderButtonCancel = this.renderButtonCancel.bind(this)
        this.renderContentFinish = this.renderContentFinish.bind(this)
        this.renderButtonConfirm = this.renderButtonConfirm.bind(this)
        this.renderButtonConfirmText = this.renderButtonConfirmText.bind(this)
        this.renderButtonConfirmBusybox = this.renderButtonConfirmBusybox.bind(this)
    }

    // ##ACTION##
    updateAction(finish) {
        this.setState({
            finish
        })
    }

    clearEmail() {
        this.setState({
            email: '',
            confirmDisable: true
        });
    }

    backWhenFinish() {
        this.cancel(true)
    }

    cancel(isRefresh = false) {
        this.props.cancelFn && this.props.cancelFn();
        if (isRefresh) {
            setTimeout(() => {
                this.setState({
                    finish: false
                })
            }, 400)
        }
    }

    confirmFn() {
        Keyboard.dismiss()
        this.setState({
            showBusyBox: true
        });
        this.requestForgotUsername()
    }

    requestForgotUsername(byPass = false) {
        const url = Api.getUrlForgotUsername()
        const data = {
            data: {
                email: (this.state.email + '').toLowerCase()
            }
        }
        Api.postData(url, data)
            .then(res => {
                if (res) {
                    if (res.errorCode) {
                        if (res.errorCode === 2060) {
                            return this.requestSuccess()
                        }
                        return this.requestFail(res.errorCode)
                    } else {
                        return this.requestSuccess()
                    }
                } else {
                    return this.requestFail({
                        errorCode: I18n.t('unknown_error')
                    })
                }
            })
            .catch(err => {
                console.log(err)
                return this.requestFail({
                    errorCode: I18n.t('unknown_error')
                })
            })
    }

    requestSuccess() {
        this.setState({
            confirmDisable: true,
            showBusyBox: false,
            finish: true
        });
        const { channelChangeHeader } = this.props
        const obj = {
            title: I18n.t('forgotUsername'),
            content: I18n.t('forgotUsernameRequest')
        }
        Emitter.emit(channelChangeHeader, obj)
    }

    requestFail(errorCode) {
        this.showError(errorCode)
        this.setState({
            confirmDisable: false,
            showBusyBox: false,
            finish: false
        });
    }

    showError(errorCode) {
        this.props.showError && this.props.showError(errorCode)
    }
    // ##END ACTION##

    _onChangeText(email) {
        const disabled = email === '';
        this.setState({ email, confirmDisable: disabled, errorCode: '' });
    }

    // ##RENDER JSX##
    renderButtonConfirm() {
        const { homePageRegister } = styles
        return <TouchableOpacity
            testID={`confirmButtonBtn`}
            style={[
                homePageRegister,
                { height: 48, marginHorizontal: 48 }
            ]}
            disabled={
                this.props.isConnected
                    ? this.state.confirmDisable
                    : true
            }
            onPress={this.confirmFn}
            testId={`confirm`}
        >
            {
                this.state.showBusyBox
                    ? this.renderButtonConfirmBusybox()
                    : this.renderButtonConfirmText()
            }
        </TouchableOpacity>
    }

    renderButtonConfirmBusybox() {
        return <ActivityIndicator
            testID={`progressBarSignIn`}
            style={{ width: 24, height: 24 }}
            color="white"
        />
    }

    renderButtonConfirmText() {
        const { homePageDescriptionText } = styles
        return <Text
            style={[
                homePageDescriptionText,
                {
                    color: '#FFFFFF',
                    opacity: this.props.isConnected ? (this.state.confirmDisable ? 0.7 : 1) : 0.7
				}
            ]}
        >
            {I18n.t('sendEmail')}
        </Text>
    }

    renderContentFinish() {
        const { homePageRegister, homePageDescriptionText } = styles
        return (
            <View style={{ marginVertical: 112 }}>
                <TouchableOpacity
                    testID={`okBtn`}
                    style={[
                        homePageRegister,
                        { height: 48, marginHorizontal: 48 }
                    ]}
                    onPress={this.backWhenFinish}
                >
                    <Text
                        style={[
                            homePageDescriptionText,
                            { color: '#FFFFFF' }
                        ]}
                    >
                        {I18n.t('ok')}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderButtonCancel() {
        const { homePageRegister, homePageDescriptionText } = styles
        return <TouchableOpacity
            testID={`cancelBtn`}
            style={[
                homePageRegister,
                {
                    marginBottom: 56,
                    marginTop: 16,
                    height: 48,
                    borderColor: '#979797',
                    borderWidth: 1,
                    backgroundColor: 'transparent',
                    marginHorizontal: 48
                }
            ]}
            onPress={this.cancel}
        >
            <Text
                style={[
                    homePageDescriptionText,
                    { color: '#FFFFFF' }
                ]}
            >
                {I18n.t('cancel')}
            </Text>
        </TouchableOpacity>
    }

    renderInput() {
        const { dialogInputClone, rightIcon } = styles
        return <View style={{ flexDirection: 'row' }}>
            <TextInput
                ref={ref => (this.emailInput = ref)}
                placeholder={I18n.t('email')}
                placeholderTextColor="rgba(239,239,239,0.7)"
                underlineColorAndroid="rgba(0,0,0,0)"
                // selectionColor="#FFF"
                onChangeText={value => {
                    this._onChangeText(value);
                }}
                value={this.state.email}
                style={[
                    dialogInputClone,
                    { color: '#FFF', marginVertical: 32 }
                ]}
            />
            <TouchableOpacity
                style={[rightIcon, { marginVertical: 32 }]}
                activeOpacity={1}
                onPress={this.clearEmail}
            >
                <Icon
                    style={[{ opacity: 1, color: '#FFF' }]}
                    name={'md-close'}
                    size={16}
                />
            </TouchableOpacity>
        </View>
    }

    renderContent() {
        return (
            <View>
                <View style={{ marginHorizontal: 48 }}>
                    {
                        this.renderInput()
                    }
                </View>
                <View>
                    {
                        this.renderButtonConfirm()
                    }
                    {
                        this.renderButtonCancel()
                    }
                </View>
            </View>
        )
    }
    // ##END RENDER JSX##

    render() {
        return (
            this.state.finish
                ? this.renderContentFinish()
                : this.renderContent()
        )
    }
}

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected,
        login: state.login
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(loginActions, dispatch),
        authSettingActions: bindActionCreators(authSettingActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentForgotUsername);
