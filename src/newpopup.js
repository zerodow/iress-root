import React, { Component } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Animated
} from 'react-native'
import { BlurView } from 'react-native-blur'
import CommonStyle from '~/theme/theme_controller'
import { connect } from 'react-redux'
import * as Controller from '~/memory/controller'
import I18n from '~/modules/language/'
const { height, width } = Dimensions.get('window')

export class NewPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
        this.opacityAnim = new Animated.Value(0)
    }
    onCancel = () => {
        this.hideAnim()
        setTimeout(() => {
            this.props.navigator.dismissModal({ animationType: 'none' })
        }, 600)
    }
    onPress = () => {
        this.props.onAccept()
        this.onCancel()
    }

    showAnim = this.showAnim.bind(this)
    showAnim() {
        Animated.timing(
            this.opacityAnim,
            {
                toValue: 1,
                duration: 500
            }).start()
    }

    hideAnim = this.hideAnim.bind(this)
    hideAnim() {
        Animated.timing(
            this.opacityAnim,
            {
                toValue: 0,
                duration: 500
            }).start()
    }

    componentDidMount() {
        this.showAnim()
    }

    render() {
		/**
		 * fix loi height sai tren mo vai thiet bi xiaomi, note 8
		 */
        const realHeight = Controller.getRealWindowHeight();
        const deviceHeight = Platform.OS === 'ios'
            ? height
            : realHeight;

        return (
            <Animated.View style={{ flex: 1, backgroundColor: CommonStyle.fontDefaultColorOpacity, opacity: this.opacityAnim }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 21 }}>
                    {this.props.title ? <View style={{ paddingTop: 32, backgroundColor: CommonStyle.bgCircleDrawer, width: '100%', borderTopRightRadius: 12, borderTopLeftRadius: 12 }}>
                        <Text style={{ fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeM, color: CommonStyle.fontColor, textAlign: 'center' }}>
                            {this.props.title}
                        </Text>
                    </View> : null}
                    {this.props.titleChild ? <View style={{ paddingTop: 16, backgroundColor: CommonStyle.bgCircleDrawer, width: '100%' }}>
                        <Text style={{ fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeM - 2, color: CommonStyle.fontColor, textAlign: 'center' }}>{this.props.titleChild}</Text>
                    </View> : null}
                    <View style={{ flexDirection: 'row', justifyContent: this.props.isButtonCancel && this.props.isButtonOk ? 'space-between' : 'center', paddingVertical: 32, width: '100%', paddingHorizontal: 24, backgroundColor: CommonStyle.bgCircleDrawer, borderBottomRightRadius: 12, borderBottomLeftRadius: 12 }}>
                        {this.props.isButtonCancel ? < TouchableOpacity onPress={this.onCancel} style={{
                            borderWidth: 0.5,
                            borderRadius: 100,
                            borderColor: CommonStyle.fontColorButtonSwitch,
                            width: '45%'
                        }}>
                            <Text style={{
                                fontSize: CommonStyle.fontSizeS,
                                textAlign: 'center',
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                color: CommonStyle.fontColorButtonSwitch,
                                paddingVertical: 8
                            }}>{I18n.t('cancel')}</Text>
                        </TouchableOpacity> : null}
                        {this.props.isButtonOk ? <TouchableOpacity onPress={this.onPress}
                            style={{
                                borderWidth: 0.5,
                                borderRadius: 100,
                                borderColor: CommonStyle.fontColorButtonSwitch,
                                backgroundColor: CommonStyle.fontColorButtonSwitch,
                                width: '45%'
                            }}
                        >
                            <Text style={{
                                fontSize: CommonStyle.fontSizeS,
                                textAlign: 'center',
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                color: CommonStyle.fontDark,
                                paddingVertical: 8
                            }}>{this.props.buttonNameOk}</Text>
                        </TouchableOpacity> : null}
                    </View>
                </View >
            </Animated.View>
        );
    }
}
const mapStateToProps = state => {
    return {
        textFontSize: state.setting.textFontSize
    }
}
export default connect(mapStateToProps)(NewPopup)
