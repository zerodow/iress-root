import React, { PureComponent } from 'react';
import { View, Text, Animated, TouchableWithoutFeedback } from 'react-native'
import { connect } from 'react-redux'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import { translateCustomLang, getListInvertTranslate, getInvertTranslate } from '~/invert_translate';
import RowItem from './RowItem'
import PIN_SETTING from '~/constants/pin_setting.json'
import CommonStyle, { register } from '~/theme/theme_controller'

const listItem = [];
PIN_SETTING.map(e => {
    listItem.push(e.text)
});

export class AuthRequireModal extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
        this.displayItem = getListInvertTranslate(listItem)
        this.opacityWrapperAnim = new Animated.Value(0)
    }

    componentDidMount() {
        this.fadeInAnim()
    }

    fadeInAnim() {
        Animated.timing(
            this.opacityWrapperAnim,
            {
                toValue: 1,
                duration: 500
            }).start()
    }

    fadeOutAnim() {
        Animated.timing(
            this.opacityWrapperAnim,
            {
                toValue: 0,
                duration: 500
            }).start()
    }

    getPinSettingDisplay = this.getPinSettingDisplay.bind(this)
    getPinSettingDisplay(pinSetting) {
        if (PIN_SETTING[pinSetting] && PIN_SETTING[pinSetting].text) {
            return getInvertTranslate(PIN_SETTING[pinSetting].text)
        }
        return getInvertTranslate(PIN_SETTING[dataStorage.pinSetting].text)
    }

    confirmData = this.confirmData.bind(this)
    confirmData(data) {
        this.fadeOutAnim()
        setTimeout(() => {
            this.props.confirmData && this.props.confirmData(data)
            this.props.navigator.dismissModal({
                animated: false,
                animationType: 'none'
            })
        }, 400)
    }

    dismissModal = this.dismissModal.bind(this)
    dismissModal() {
        this.fadeOutAnim()
        setTimeout(() => {
            this.props.navigator.dismissModal({
                animated: false,
                animationType: 'none'
            })
        }, 400)
    }

    render() {
        const { pinSetting } = this.props;
        const pinSettingDisplay = this.getPinSettingDisplay(pinSetting)
        return <TouchableWithoutFeedback onPress={this.dismissModal}>
            <Animated.View style={{ opacity: this.opacityWrapperAnim, position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: CommonStyle.backgroundColorPopup }}>
                <View
                    style={{
                        position: 'absolute',
                        top: this.props.top,
                        right: 16,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        backgroundColor: CommonStyle.fontColorSwitchTrue
                    }}
                >
                    {
                        this.displayItem.map((item, index) => {
                            if (index === this.displayItem.length - 1) {
                                return <RowItem
                                    key={item}
                                    title={item}
                                    onPress={() => this.confirmData(item)}
                                    selected={item === pinSettingDisplay}
                                />
                            } else {
                                return <View>
                                    <RowItem
                                        key={item}
                                        title={item}
                                        onPress={() => this.confirmData(item)}
                                        selected={item === pinSettingDisplay}
                                    />
                                    <View style={{ height: 1, backgroundColor: CommonStyle.fontWhite, paddingHorizontal: 16, opacity: 0.05 }} />
                                </View>
                            }
                        })
                    }
                </View>
            </Animated.View>
        </TouchableWithoutFeedback>
    }
}
const mapStateToProps = state => {
    return {
        textFontSize: state.setting.textFontSize
    }
}
export default connect(mapStateToProps)(AuthRequireModal)
