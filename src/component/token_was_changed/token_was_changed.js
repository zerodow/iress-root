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

class TokenWasChanged extends Component {
    constructor(props) {
        super(props);
                this.logoutFunc = this.logoutFunc.bind(this)
    }
    logoutFunc() {
        this.props.actions.logout(this.props.navigator, this.props.callback)
    }
    render() {
        const { textLink, textEmail, textDefault, textUnderline } = styles;
        const lockText = I18n.t('changedTokenWarning', { locale: this.props.setting.lang })
        return (
            <View
                style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
            >
                <View style={{ marginHorizontal: 32 }}>
                    {
                        Platform.OS === 'ios'
                            ? <BlurView blurType="xlight" style={{ borderRadius: 12 }}>
                                <View style={{ backgroundColor: 'transparent' }}>
                                    <View style={{ marginHorizontal: 20, marginVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={[CommonStyle.textTitleDialog, { marginBottom: 8, color: CommonStyle.fontDark }]}>{I18n.t('notice')}</Text>
                                        <Text style={[CommonStyle.textDescDialog, { textAlign: 'center', justifyContent: 'center', alignItems: 'center', color: CommonStyle.fontDark }]}>{lockText}</Text>
                                    </View>

                                    <View style={{ height: 1, backgroundColor: '#0000001e' }}></View>

                                    <TouchableOpacity onPress={this.logoutFunc} style={{ marginVertical: 12, justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            this.props.isLoading
                                                ? <ActivityIndicator style={{ width: 24, height: 24 }} color='black' />
                                                : <Text style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontApple, textAlign: 'center' }]}>{I18n.t('ok')}</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                            : <View style={{ backgroundColor: 'white', borderRadius: 12 }}>
                                <View style={{ backgroundColor: 'transparent' }}>
                                    <View style={{ marginHorizontal: 20, marginVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={[CommonStyle.textTitleDialog, { marginBottom: 8, color: CommonStyle.fontDark }]}>{I18n.t('notice')}</Text>
                                        <Text style={[CommonStyle.textDescDialog, { textAlign: 'center', color: CommonStyle.fontDark }]}>{lockText}</Text>
                                    </View>

                                    <View style={{ height: 1, backgroundColor: '#0000001e' }}></View>
                                    <TouchableOpacity onPress={this.logoutFunc} style={{ marginVertical: 12, justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            this.props.isLoading
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
export default connect(mapStateToProps, mapDispatchToProps)(TokenWasChanged)
