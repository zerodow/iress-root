import React, { Component } from 'react';
import {
    View,
    Text,
    Picker,
    TouchableOpacity,
    Platform,
    Dimensions,
    TimePickerAndroid,
    DatePickerIOS,
    PixelRatio
} from 'react-native';
import { iconsMap } from '../../../utils/AppIcons';
import I18n from '../../../modules/language/index';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { func, dataStorage } from '../../../storage';
import deviceModel from '../../../constants/device_model';
import TimePicker from '../../../component/ios_picker/ios_picker';
import { logDevice, isIphoneXorAbove } from '../../../lib/base/functionUtil';
import performanceEnum from '../../../constants/performance';
import Perf from '../../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../../lib/base/analytics';
import analyticsEnum from '../../../constants/analytics';

const { height, width } = Dimensions.get('window');
const CHANGE_TIME_FROM = 'CHANGE_TIME_FROM';
const CHANGE_TIME_TO = 'CHANGE_TIME_TO';

export default class ScheduleModal extends Component {
    constructor(props) {
        super(props)
        this.deviceModel = dataStorage.deviceModel;
        this.state = {
            isChangeFrom: true,
            fromHour: this.props.fromHour ? this.props.fromHour : 20,
            fromMinute: this.props.fromMinute ? this.props.fromMinute : 0,
            toHour: this.props.toHour ? this.props.toHour : 8,
            toMinute: this.props.toMinute ? this.props.toMinute : 0,
            minuteInterval: 5
        }
        this.majorVersionIOS = parseInt(Platform.Version, 10);
        this.perf = new Perf(performanceEnum.show_news_schedule);
    }

    componentWillMount() {
        setCurrentScreen(analyticsEnum.schedule);
        this.perf && this.perf.incrementCounter(performanceEnum.show_news_schedule);
    }

    _onValueChange = (hour, minute) => {
        if (this.state.isChangeFrom) {
            this.setState({ fromHour: hour, fromMinute: minute })
        } else {
            this.setState({ toHour: hour, toMinute: minute })
        }
    };
    componentDidMount() {
        this.setState({ minuteInterval: 15 });
    }

    checkFormatTime(time) {
        if (time < 10) {
            return '0' + time;
        }
        return time + '';
    }

    onChangeTime(hour) {
        // let hours = value.getHours();
        // let minutes = value.getMinutes();
        // if (this.state.isChangeFrom) {
        //     this.setState({ fromHour: hours, fromMinute: this.checkFormatTime(minutes) })
        // } else {
        //     this.setState({ toHour: hours, toMinute: this.checkFormatTime(minutes) })
        // }
    }

    onChangeFrom() {
        this.setState({ isChangeFrom: true }, () => {
            this.timePicker && this.timePicker.updateHourMinute(this.state.fromHour, this.state.fromMinute)
        });
    }

    async openTimePickerAndroid(type) {
        try {
            const { action, hour, minute } = await TimePickerAndroid.open({
                hour: type === CHANGE_TIME_FROM ? this.state.fromHour : this.state.toHour,
                minute: type === CHANGE_TIME_FROM ? this.state.fromMinute : this.state.toMinute,
                is24Hour: true,
                mode: 'spinner'
            });
            if (action === TimePickerAndroid.timeSetAction) {
                switch (type) {
                    case CHANGE_TIME_FROM:
                        this.setState({
                            fromHour: hour,
                            fromMinute: minute
                        });
                        break;
                    case CHANGE_TIME_TO:
                        this.setState({
                            toHour: hour,
                            toMinute: minute
                        });
                        break;
                }
            }
        } catch ({ code, message }) {
            // console.warn('Cannot open time picker', message);
        }
    }
    onChangeTo() {
        this.setState({ isChangeFrom: false }, () => {
            this.timePicker && this.timePicker.updateHourMinute(parseInt(this.state.toHour), parseInt(this.state.toMinute))
        });
    }

    convertToUTC(hour) {
        const UTCtime = new Date();
        UTCtime.setHours(hour);

        return UTCtime.getUTCHours();
    }

    saveUserSettings() {
        const { fromHour, fromMinute, toHour, toMinute } = this.state;
        const scheduledObj = { fromHour, fromMinute, toHour, toMinute };
        this.saveSetting('scheduledData', scheduledObj)
    }

    // formatHours(hours) {
    //     hours = parseInt(hours);
    //     if (hours > 12) {
    //         hours = hours - 12;
    //         if (hours < 10) {
    //             return '0' + hours;
    //         } else return hours;
    //     } else if (hours < 10) {
    //         return '0' + hours;
    //     } else return hours;
    // }

    formatHours(hours) {
        // if (hours > 12) {
        //     hours = hours - 12;
        //     if (hours < 10) {
        //         return '0' + hours;
        //     } else return hours;
        // } else
        if (hours < 10) {
            if (Platform.OS === 'ios') {
                return '0' + hours;
            } else {
                return hours
            }
        } else return hours;
    }

    formatMinutes(minutes) {
        if (typeof minutes === 'number' && minutes < 10) {
            return '0' + minutes;
        } else return minutes;
    }

    renderContent() {
        const { isChangeFrom, fromHour, toHour, fromMinute, toMinute } = this.state;
        const _date = new Date();
        _date.setHours(isChangeFrom ? fromHour : toHour);
        _date.setMinutes(isChangeFrom ? fromMinute : toMinute);
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity testID='setTimeFrom'
                    onPress={() => {
                        this.onChangeFrom()
                        this.openTimePickerAndroid(CHANGE_TIME_FROM)
                    }}
                    style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 18 }}>
                    <Text style={{ color: isChangeFrom ? CommonStyle.timePickerColor : CommonStyle.colorTextTimepicker, marginLeft: 8 }}>
                        {`${I18n.t('from')} ${this.checkFormatTime(fromHour)}:${this.checkFormatTime(fromMinute)}`}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity testID='setTimeTo'
                    onPress={() => {
                        this.onChangeTo()
                        this.openTimePickerAndroid(CHANGE_TIME_TO)
                    }}
                    style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 18 }}>
                    <Text style={{ color: !isChangeFrom ? CommonStyle.timePickerColor : CommonStyle.colorTextTimepicker, marginRight: 8 }}>
                        {`${I18n.t('to')} ${this.checkFormatTime(toHour)}:${this.checkFormatTime(toMinute)}`}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        const { isChangeFrom, fromHour, toHour, fromMinute, toMinute } = this.state;
        const _date = new Date();
        _date.setHours(isChangeFrom ? fromHour : toHour);
        _date.setMinutes(isChangeFrom ? fromMinute : toMinute);
        return (
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                <View style={{ backgroundColor: CommonStyle.fontDefaultColor, marginLeft: 150, marginRight: 16, marginTop: 452, borderRadius: 12, borderWidth: 1 }}>
                    <View style={{ marginTop: 4 }}>
                        {
                            this.renderContent()
                        }
                    </View>
                    <View style={{ marginTop: 16, height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginHorizontal: 16 }} />
                    <View style={{ marginTop: 18, justifyContent: 'space-between', backgroundColor: CommonStyle.fontDefaultColor }}>
                        {
                            Platform.OS === 'ios'
                                ? <TimePicker
                                    ref={ref => this.timePicker = ref}
                                    selectedHour={this.state.isChangeFrom ? fromHour : toHour}
                                    selectedMinute={this.state.isChangeFrom ? fromMinute : toMinute}
                                    minuteInterval={this.state.minuteInterval}
                                    onValueChange={this._onValueChange}
                                    loop={true} />
                                : <View style={{ backgroundColor: CommonStyle.fontBorderGray, flex: 1 }} />
                        }
                    </View>
                </View>
            </View>
        )
    }
}
