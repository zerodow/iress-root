import React, { PureComponent } from 'react'
import {
    View, TouchableWithoutFeedback, TouchableOpacity, Text, Platform,
    Animated, Dimensions
} from 'react-native'
import { connect } from 'react-redux'
import TimePicker from '@component/ios_picker/ios_picker';
import CommonStyle, { register } from '~/theme/theme_controller'
import I18n from '~/modules/language/index';

const { width, height } = Dimensions.get('window')

export class NewsSettingScheduleModal extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isChangeFrom: true,
            minuteInterval: 5,
            fromHour: this.props.fromHour ? this.props.fromHour : 20,
            fromMinute: this.props.fromMinute ? this.props.fromMinute : 0,
            toHour: this.props.toHour ? this.props.toHour : 8,
            toMinute: this.props.toMinute ? this.props.toMinute : 0
        }
        this.opacityWrapperAnim = new Animated.Value(0)
        this.topAnim = new Animated.Value(this.props.top || 0)
        this.timeoutShowModal = null
        this.timeoutHideModal = null
    }

    componentDidMount() {
        try {
            this.timeoutShowModal && clearTimeout(this.timeoutShowModal)
            this.timeoutShowModal = setTimeout(() => {
                const { top, heightSchedule } = this.props
                const { height: heightModal } = this.measureContent
                if (heightModal > height - top) {
                    const newTop = top - heightSchedule - heightModal
                    this.topAnim.setValue(newTop)
                }
                this.fadeInAnim()
            }, 500)
        } catch (error) {
            console.log('componentDidMount error', error)
        }
    }

    componentWillUnmount() {
        this.timeoutShowModal && clearTimeout(this.timeoutShowModal)
        this.timeoutHideModal && clearTimeout(this.timeoutHideModal)
    }

    _onValueChange = this._onValueChange.bind(this)
    _onValueChange(hour, minute) {
        if (this.state.isChangeFrom) {
            this.setState({ fromHour: hour, fromMinute: minute })
        } else {
            this.setState({ toHour: hour, toMinute: minute })
        }
    }

    saveUserSettings = this.saveUserSettings.bind(this)
    saveUserSettings() {
        const { fromHour, fromMinute, toHour, toMinute } = this.state;
        const scheduledObj = { fromHour, fromMinute, toHour, toMinute };
        this.saveDataSetting(scheduledObj)
    }

    saveDataSetting = this.saveDataSetting.bind(this)
    saveDataSetting(scheduledObj) {
        this.props.saveDataSetting && this.props.saveDataSetting('scheduledData', scheduledObj)
    }

    onChangeFrom = this.onChangeFrom.bind(this)
    onChangeFrom() {
        this.setState({ isChangeFrom: true }, () => {
            this.timePicker && this.timePicker.updateHourMinute(this.state.fromHour, this.state.fromMinute)
        });
    }

    onChangeTo = this.onChangeTo.bind(this)
    onChangeTo() {
        this.setState({ isChangeFrom: false }, () => {
            this.timePicker && this.timePicker.updateHourMinute(parseInt(this.state.toHour), parseInt(this.state.toMinute))
        });
    }

    checkFormatTime = this.checkFormatTime.bind(this)
    checkFormatTime(time) {
        if (time < 10) {
            return '0' + time;
        }
        return time + '';
    }

    renderContent = this.renderContent.bind(this)
    renderContent() {
        const { isChangeFrom, fromHour, toHour, fromMinute, toMinute } = this.state;
        const _date = new Date();
        _date.setHours(isChangeFrom ? fromHour : toHour);
        _date.setMinutes(isChangeFrom ? fromMinute : toMinute);
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity testID='setTimeFrom'
                    onPress={this.onChangeFrom}
                    style={{ paddingLeft: 16, paddingVertical: 20, flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Text style={{ color: isChangeFrom ? CommonStyle.fontColorButtonSwitch : CommonStyle.colorTextTimepicker, fontSize: CommonStyle.fontSizeS }}>
                        {`${I18n.t('from')} ${this.checkFormatTime(fromHour)}:${this.checkFormatTime(fromMinute)}`}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity testID='setTimeTo'
                    onPress={this.onChangeTo}
                    style={{ paddingRight: 16, paddingVertical: 20, flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                    <Text style={{ color: !isChangeFrom ? CommonStyle.fontColorButtonSwitch : CommonStyle.colorTextTimepicker, fontSize: CommonStyle.fontSizeS }}>
                        {`${I18n.t('to')} ${this.checkFormatTime(toHour)}:${this.checkFormatTime(toMinute)}`}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    fadeInAnim = this.fadeInAnim.bind(this)
    fadeInAnim() {
        Animated.timing(
            this.opacityWrapperAnim,
            {
                toValue: 1,
                duration: 500
            }
        ).start()
    }

    fadeOutAnim = this.fadeOutAnim.bind(this)
    fadeOutAnim() {
        Animated.timing(
            this.opacityWrapperAnim,
            {
                toValue: 0,
                duration: 500
            }
        ).start()
    }

    dismissModalScheduled = this.dismissModalScheduled.bind(this)
    dismissModalScheduled() {
        this.fadeOutAnim()
        this.saveUserSettings()
        this.timeoutHideModal && clearTimeout(this.timeoutHideModal)
        this.timeoutHideModal = setTimeout(() => {
            this.props.navigator.dismissModal({
                animated: false,
                animationType: 'none'
            })
        }, 500)
    }

    render() {
        const { isChangeFrom, fromHour, toHour, fromMinute, toMinute } = this.state;
        const _date = new Date();
        _date.setHours(isChangeFrom ? fromHour : toHour);
        _date.setMinutes(isChangeFrom ? fromMinute : toMinute);
        return <TouchableWithoutFeedback onPress={this.dismissModalScheduled}>
            <Animated.View style={{ opacity: this.opacityWrapperAnim, position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: CommonStyle.backgroundColorPopup }}>
                <Animated.View style={{ position: 'absolute', top: this.topAnim, right: 16, alignItems: 'flex-end' }}>
                    <View
                        collapsable={false}
                        ref={ref => {
                            if (ref) {
                                this.contentRef = ref
                            }
                        }}
                        onLayout={(event) => {
                            this.measureContent = event.nativeEvent.layout
                        }}
                        style={{ backgroundColor: CommonStyle.fontColorSwitchTrue, borderRadius: 12, width: 230 }}>
                        <View style={{ marginTop: 4 }}>
                            {
                                this.renderContent()
                            }
                        </View>
                        <View style={{ height: 1, backgroundColor: CommonStyle.fontWhite, opacity: 0.05, marginHorizontal: 16 }} />
                        <TouchableOpacity activeOpacity={1} style={{ backgroundColor: CommonStyle.fontColorSwitchTrue, borderBottomRightRadius: 12, borderBottomLeftRadius: 12 }}>
                            <TimePicker
                                ref={ref => this.timePicker = ref}
                                selectedHour={this.state.isChangeFrom ? fromHour : toHour}
                                selectedMinute={this.state.isChangeFrom ? fromMinute : toMinute}
                                minuteInterval={this.state.minuteInterval}
                                onValueChange={this._onValueChange}
                                loop={true} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </TouchableWithoutFeedback>
    }
}
const mapStateToProps = state => {
    return {
        textFontSize: state.setting.textFontSize
    }
}
export default connect(mapStateToProps)(NewsSettingScheduleModal)
