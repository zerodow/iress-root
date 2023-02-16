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
import I18n from '../../modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

class PromptExpireToken extends Component {
    constructor(props) {
        super(props);
                this.state = {
            isLoading: false
        }
        this.backToSetPin = this.backToSetPin.bind(this)
    }
    backToSetPin() {
        this.setState({
            isLoading: true
        })
        setTimeout(() => {
            this.props.backToSetPin()
        }, 500)
        // this.props.actions.logout(this.props.navigator, this.props.callback) // callback hidemodal in app.ios.js/app.android.js when sign out success
    }
    render() {
        const { textLink, textEmail, textDefault, textUnderline } = styles;
        const lockText = I18n.t('tokenPinExpired')
        return (
            <View
                style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}
            >
                <View style={{ marginHorizontal: 32 }}>
                    {
                        Platform.OS === 'ios'
                            ? <BlurView blurType="xlight" style={{ borderRadius: 12 }}>
                                <View style={{ backgroundColor: 'transparent' }}>
                                    <View style={{ marginHorizontal: 20, marginVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={[CommonStyle.textTitleDialog, { marginBottom: 8 }]}>{I18n.t('notice')}</Text>
                                        <Text style={[CommonStyle.textDescDialog, { justifyContent: 'center', alignItems: 'center', textAlign: 'center' }]}>{lockText}</Text>
                                    </View>

                                    <View style={{ height: 1, backgroundColor: '#0000001e' }}></View>

                                    <TouchableOpacity onPress={this.backToSetPin} style={{ marginVertical: 8, justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            this.state.isLoading
                                                ? <ActivityIndicator style={{ width: 24, height: 24 }} color='black' />
                                                : <Text style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontApple, textAlign: 'center' }]}>{I18n.t('ok')}</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                            : <View style={{ backgroundColor: 'white', borderRadius: 12 }}>
                                <View style={{ backgroundColor: 'transparent' }}>
                                    <View style={{ marginHorizontal: 20, marginVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={[CommonStyle.textTitleDialog, { marginBottom: 8 }]}>{I18n.t('notice')}</Text>
                                        <Text style={[CommonStyle.textDescDialog, { justifyContent: 'center', alignItems: 'center', textAlign: 'center' }]}>{lockText}</Text>
                                    </View>

                                    <View style={{ height: 1, backgroundColor: '#0000001e' }}></View>
                                    <TouchableOpacity onPress={this.backToSetPin} style={{ marginVertical: 8, justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            this.state.isLoading
                                                ? <ActivityIndicator style={{ width: 24, height: 24 }} color='black' />
                                                : <Text style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontApple, textAlign: 'center' }]}>{I18n.t('ok')}</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                    }
                </View>
            </View>
        )
    }
}

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        textLink: {
            color: CommonStyle.fontApple
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
        setting: state.setting
    }
}
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(loginActions, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(PromptExpireToken)
