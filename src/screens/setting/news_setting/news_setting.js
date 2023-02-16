import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    View, TouchableNativeFeedback, Text, TouchableOpacity, Switch, Platform, ScrollView,
    PixelRatio, Alert, TouchableWithoutFeedback, TimePickerAndroid, UIManager, LayoutAnimation,
    Animated, Dimensions, Easing
} from 'react-native';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import styles from '../style/setting.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetworkWarning from '../../../component/network_warning/network_warning';
import * as settingActions from '../setting.actions';
import * as loginActions from '../../login/login.actions';
import I18n from '../../../modules/language/index';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import {
    logAndReport, log, setStyleNavigation, convertToUTC,
    convertToLocalTime, logDevice, clone
} from '../../../lib/base/functionUtil';
import firebase from '../../../firebase';
import TimePicker from '../../../component/ios_picker/ios_picker';
import { func, dataStorage } from '../../../storage';
import { setCurrentScreen } from '../../../lib/base/analytics';
import analyticsEnum from '../../../constants/analytics';
import ENUM from '~/enum'
import Auth from '../../../lib/base/auth';
import { iconsMap } from '../../../utils/AppIcons';
import { List, ListItem } from 'react-native-elements';
import config from '../../../config';
import performanceEnum from '../../../constants/performance';
import Perf from '../../../lib/base/performance_monitor';
import * as api from '../../../api';
import * as Util from '../../../util'
import DeviceInfo from 'react-native-device-info'
import * as Controller from '../../../memory/controller'
import * as Animatable from 'react-native-animatable'
import Header from '../../../../src/component/headerNavBar/index'
import Icon from '../../../../src/component/headerNavBar/icon'
// import Picker from 'react-native-wheel-picker'
import SwitchButton from '~/screens/alert_function/components/SwitchButton'
import BottomTabBar from '~/component/tabbar'
import { Navigation } from 'react-native-navigation'
import FallHeader from '~/component/fall_header'

const { width: WIDTH_DEVICE, height } = Dimensions.get('window')
const DURATION = 150

class CollapseContent extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isExpand: this.props.isExpand || false
        }
        this.heightHeader = 0
        this.wrapperHeightAnim = new Animated.Value(0)
        this.measureAbsView = {}
    }

    componentDidMount() {
        this.props.setRef && this.props.setRef(this)
    }

    componentWillReceiveProps(nextProps) {
        const { scheduled: currentScheduled } = this.props
        const { scheduled: nextScheduled } = nextProps
        if (currentScheduled !== nextScheduled) {
            if (nextScheduled) {
                this.collapseAnim(true, 300)
                return this.fadeInDown({ duration: 400 })
            }
            this.collapseAnim(false, 300)
            return this.fadeOutUp({ duration: 400 })
        }
    }

    collapseAnim = this.collapseAnim.bind(this)
    collapseAnim(status, duration = 500) {
        // status = true ? mo : dong
        const { h } = this.measureAbsView
        if (status) {
            Animated.timing(
                this.wrapperHeightAnim,
                {
                    toValue: 98,
                    duration
                }).start()
        } else {
            Animated.timing(
                this.wrapperHeightAnim,
                {
                    toValue: 0,
                    duration
                }).start()
        }
    }

    setRefTopModalSchedule = this.setRefTopModalSchedule.bind(this)
    setRefTopModalSchedule(ref) {
        this.props.setRefTopModalSchedule && this.props.setRefTopModalSchedule(ref)
    }

    showModalScheduled = this.showModalScheduled.bind(this)
    showModalScheduled() {
        this.props.showModalScheduled && this.props.showModalScheduled()
    }

    setRefSchedule = this.setRefSchedule.bind(this)
    setRefSchedule(ref) {
        if (ref) {
            this.refAnimatable = ref
        }
    }

    fadeInDown = this.fadeInDown.bind(this)
    fadeInDown({ duration = 500 }) {
        const config = {
            0: {
                opacity: 0,
                translateY: -98
            },
            1: {
                opacity: 1,
                translateY: 0
            }
        }
        this.refAnimatable && this.refAnimatable.animate(config, duration)
    }

    fadeOutUp = this.fadeOutUp.bind(this)
    fadeOutUp({ duration = 500 }) {
        const config = {
            0: {
                opacity: 1,
                translateY: 0
            },
            1: {
                opacity: 0,
                translateY: -98
            }
        }
        this.refAnimatable && this.refAnimatable.animate(config, duration)
    }

    renderContent = this.renderContent.bind(this)
    renderContent() {
        const { allRelated, priceSensitive, fromHour, fromMinute, toHour, toMinute, lang } = this.props
        const defaultConfig = {
            0: {
                opacity: 0,
                translateY: -98
            },
            1: {
                opacity: 0,
                translateY: -98
            }
        }
        return <Animatable.View
            useNativeDriver={true}
            animation={'fadeIn'}
            ref={this.setRefSchedule}>
            <TouchableOpacityOpt
                timeDelay={ENUM.TIME_DELAY}
                testID='scheduleView'
                onPress={() => (allRelated || priceSensitive) ? this.showModalScheduled() : null
                }
                setRef={this.setRefTopModalSchedule}
                style={{ flexDirection: 'row', paddingLeft: 16, paddingVertical: 24 }}
            >
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Text style={[CommonStyle.sectContentText, { color: (allRelated || priceSensitive) ? CommonStyle.fontColor : CommonStyle.colorIconSettings }]}>{I18n.t('from', { locale: lang })}</Text>
                        <Text style={[CommonStyle.sectContentText, { color: (allRelated || priceSensitive) ? CommonStyle.fontColorButtonSwitch : 'grey', textAlign: 'right', opacity: 1 }]}>{`${this.props.formatHours(fromHour)}:${this.props.formatMinutes(fromMinute)}`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Text style={[CommonStyle.sectContentText, { color: (allRelated || priceSensitive) ? CommonStyle.fontColor : CommonStyle.colorIconSettings, paddingTop: 8 }]}>{I18n.t('to', { locale: lang })}</Text>
                        <Text style={[CommonStyle.sectContentText, { color: (allRelated || priceSensitive) ? CommonStyle.fontColorButtonSwitch : 'grey', textAlign: 'right', opacity: 1, paddingTop: 8 }]}>{`${this.props.formatHours(toHour)}:${this.props.formatMinutes(toMinute)}`}</Text>
                    </View>
                </View>

                <Ionicons
                    name='ios-arrow-forward'
                    size={24}
                    color={CommonStyle.colorIconSettings}
                    style={{ marginHorizontal: 16, top: 12 }} />
            </TouchableOpacityOpt >
        </Animatable.View>
    }

    render() {
        return <Animated.View style={[{ overflow: 'hidden', height: this.wrapperHeightAnim, width: '100%' }]}>
            {this.renderContent()}
        </Animated.View>
    }
}

// var PickerItem = Picker.Item;
const newsSettingType = {
    PRICE_SENSITIVE: 'priceSensitive',
    ALL_RELATED: 'allRelated',
    SCHEDULED: 'scheduled',
    RESET: 'reset',
    FROM_HOUR: 'fromHour',
    FROM_MINUTE: 'fromMinute',
    TO_HOUR: 'toHour',
    TO_MINUTE: 'toMinute',
    SCHEDULED_DATA: 'scheduledData'
}
const CHANGE_TIME_FROM = 'CHANGE_TIME_FROM'
const CHANGE_TIME_TO = 'CHANGE_TIME_TO'
class NewsSetting extends Component {
    constructor(props) {
        super(props)
        this.saveDataSetting = this.saveDataSetting.bind(this)
        this._onValueChange = this._onValueChange.bind(this)
        this.saveUserSettings = this.saveUserSettings.bind(this)
        this.renderFakeModalHeader = this.renderFakeModalHeader.bind(this)
        this.state = {
            selectedItem: 2,
            itemList: ['1', '2', '3', '4', '5', '6', '7', '8'],
            disableDeviceNoti: false,
            isShowModalScheduled: false,
            isChangeFrom: true,
            fromHour: this.props.fromHour ? this.props.fromHour : 20,
            fromMinute: this.props.fromMinute ? this.props.fromMinute : 0,
            toHour: this.props.toHour ? this.props.toHour : 8,
            toMinute: this.props.toMinute ? this.props.toMinute : 0,
            minuteInterval: 5
        }
        this.translateXNewsNotification = new Animated.Value(0)
        this.topModalScheduled = 0
        this.majorVersionIOS = parseInt(Platform.Version, 10)
        this.perf = new Perf(performanceEnum.show_form_news_settings)
        this.isMount = false
    }

    openScreenAnim = this.openScreenAnim.bind(this)
    openScreenAnim() {
        const { scheduled } = this.props.setting.news
        Animated.timing(
            this.translateXNewsNotification,
            {
                toValue: -WIDTH_DEVICE,
                duration: DURATION,
                easing: Easing.quad,
                useNativeDriver: true
            }
        ).start()
        if (scheduled) {
            setTimeout(() => {
                this.collaseContentRef.collapseAnim(true, 300)
                this.collaseContentRef.fadeInDown({ duration: 400 })
            }, 300)
        }
    }

    closeScreenAnim = this.closeScreenAnim.bind(this)
    closeScreenAnim() {
        Animated.timing(
            this.translateXNewsNotification,
            {
                toValue: 0,
                duration: DURATION,
                easing: Easing.quad,
                useNativeDriver: true
            }
        ).start()
    }

    onPickerSelect = (index) => {
        this.setState({
            selectedItem: index
        })
    }
    onAddItem = () => {
        var name = '司马懿'
        if (this.state.itemList.indexOf(name) === -1) {
            this.state.itemList.push(name)
        }
        this.setState({
            selectedItem: this.state.itemList.indexOf(name)
        })
    }
    componentWillMount() {
        this.isMount = true;
        setCurrentScreen(analyticsEnum.settingsNews);
        this.perf && this.perf.incrementCounter(performanceEnum.show_form_news_settings);
    }

    componentDidMount() {
        this.props.setRef && this.props.setRef(this)
        if (!this.props.setting.news) {
            this.saveDataSetting('reset')
        }
        // setInterval(() => firebase.messaging().requestPermission().then(() => this.isMount && this.setState({ disableDeviceNoti: false })).catch(() => this.isMount && this.setState({ disableDeviceNoti: true })), 5000);
    }

    componentWillUnmount() {
        this.isMount = false;
    }

    saveDataSetting(type, value) {
        try {
            const deviceId = dataStorage.deviceId
            const newObj = clone(this.props.setting);
            if (newObj && newObj.news) {
                switch (type) {
                    case newsSettingType.SCHEDULED_DATA:
                        const temp = newObj.news;
                        const obj = { ...temp, ...value };
                        newObj['news'] = obj;
                        break;
                    case newsSettingType.RESET:
                        const newsSettingDefault = {
                            priceSensitive: true,
                            allRelated: false,
                            scheduled: true,
                            reset: false,
                            fromHour: 20,
                            fromMinute: 0,
                            toHour: 8,
                            toMinute: 0
                        }
                        newObj['news'] = newsSettingDefault;
                        break;
                    case newsSettingType.PRICE_SENSITIVE:
                        newObj['news'][`${type}`] = value;
                        newObj['news']['allRelated'] = !value;
                        dataStorage.isSensitive = value;
                        break;
                    case newsSettingType.ALL_RELATED:
                        newObj['news'][`${type}`] = value;
                        newObj['news']['priceSensitive'] = !value;
                        dataStorage.isSensitive = !value;
                        break;
                    default: newObj['news'][`${type}`] = value;
                        break;
                }
                this.props.actions.settingResponse(newObj);
                // save to db change from, to -> UTC
                const data = PureFunc.clone(newObj)
                const { hour: fromHour, minute: fromMinute } = Util.getHoursMinutesUTC(newObj['news'][`fromHour`], newObj['news'][`fromMinute`])
                const { hour: toHour, minute: toMinute } = Util.getHoursMinutesUTC(newObj['news'][`toHour`], newObj['news'][`toMinute`])
                data['news']['fromHour'] = fromHour
                data['news']['fromMinute'] = fromMinute
                data['news']['toHour'] = toHour
                data['news']['toMinute'] = toMinute
                data['deviceId'] = deviceId
                const userId = func.getUserId();
                const urlPut = api.getUrlUserSettingByUserId(userId, 'put');
                api.putData(urlPut, { data }).then(() => {
                    logDevice('info', 'News_setting set user setting success')
                }).catch(error => {
                    logDevice('info', 'News_setting cannot set user setting')
                })
            }
        } catch (error) {
            logAndReport('saveDataSetting setting exception', error, 'saveDataSetting setting');
            logDevice('info', `saveDataSetting setting exception ${error}`);
        }
    }

    onChangeShowPriceSensitive(value) {
        this.saveDataSetting('priceSensitive', value)
    }

    onChangeShowAllRelated(value) {
        this.saveDataSetting('allRelated', value)
    }

    onChangeScheduled(data) {
        this.saveDataSetting('scheduled', data)
    }

    resetNewsNotificationSettings() {
        Controller.showResetAlert(I18n.t('resetNewsNoti'), () => {
            this.saveDataSetting('reset');
        })
    }
    onPress = () => {
        Navigation.showModal({
            screen: 'equix.NewPopup',
            animated: true,
            animationType: 'none',
            navigatorStyle: {
                ...CommonStyle.navigatorStyleCommon,
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                title: I18n.t('confirm'),
                titleChild: I18n.t('resetNewsNoti'),
                isButtonCancel: true,
                isButtonOk: true,
                buttonNameOk: I18n.t('ok'),
                onAccept: () => {
                    this.saveDataSetting('reset')
                }
            }
        })
    }

    setRefTopModalSchedule = this.setRefTopModalSchedule.bind(this)
    setRefTopModalSchedule(ref) {
        if (ref) {
            this.scheduleRef = ref
            /*
                BUG EM-5763
                1> Case: Nếu mở setting xong chuyển tab thì crash "Unable to find node on an unmounted component"
                2> Reason: timeout kích hoạt và không tìm thấy node để measure
                3> Resolve: Nếu đã unmount thì ko xử lý && clearTimeout
            */
            setTimeout(() => {
                this.scheduleRef && this.scheduleRef.measure && this.isMount && this.scheduleRef.measure((x, y, w, h, px, py) => {
                    this.heightModalScheduled = h
                    this.topModalScheduled = h + py
                })
            }, 100)
        }
    }

    showModalScheduled = this.showModalScheduled.bind(this)
    showModalScheduled() {
        this.scheduleRef && this.scheduleRef.measure((x, y, w, h, px, py) => {
            var { fromHour, fromMinute, toHour, toMinute } = this.props.setting.news;
            Navigation.showModal({
                screen: 'equix.NewsSettingScheduleModal',
                animated: true,
                animationType: 'none',
                navigatorStyle: {
                    ...CommonStyle.navigatorSpecialNoHeader,
                    screenBackgroundColor: 'transparent',
                    modalPresentationStyle: 'overCurrentContext'
                },
                passProps: {
                    heightSchedule: h,
                    top: py + h,
                    saveDataSetting: this.saveDataSetting,
                    fromHour,
                    fromMinute,
                    toHour,
                    toMinute
                }
            })
        })
    }

    formatHours(hours) {
        if (hours < 10) {
            return '0' + hours;
        } else return hours;
    }

    formatMinutes(minutes) {
        if (typeof minutes === 'number' && minutes < 10) {
            return '0' + minutes;
        } else return minutes;
    }
    renderLeftComp = this.renderLeftComp.bind(this);
    renderLeftComp() {
        const content = (
            <Icon name="ios-arrow-back" onPress={this.closeScreenAnim} />
        );
        return <View style={{ width: 36 }}>{content}</View>
    }
    checkFormatTime(time) {
        if (time < 10) {
            return '0' + time;
        }
        return time + '';
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
    _onValueChange = (hour, minute) => {
        if (this.state.isChangeFrom) {
            this.setState({ fromHour: hour, fromMinute: minute })
        } else {
            this.setState({ toHour: hour, toMinute: minute })
        }
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
                        // this.openTimePickerAndroid(CHANGE_TIME_FROM)
                    }}
                    style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 18 }}>
                    <Text style={{ color: isChangeFrom ? CommonStyle.fontColorButtonSwitch : CommonStyle.colorTextTimepicker, marginLeft: 8, fontSize: CommonStyle.fontSizeM - 2 }}>
                        {`${I18n.t('from')} ${this.checkFormatTime(fromHour)}:${this.checkFormatTime(fromMinute)}`}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity testID='setTimeTo'
                    onPress={() => {
                        this.onChangeTo()
                        // this.openTimePickerAndroid(CHANGE_TIME_TO)
                    }}
                    style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 18, paddingLeft: 60 }}>
                    <Text style={{ color: !isChangeFrom ? CommonStyle.fontColorButtonSwitch : CommonStyle.colorTextTimepicker, marginRight: 8, fontSize: CommonStyle.fontSizeM - 2 }}>
                        {`${I18n.t('to')} ${this.checkFormatTime(toHour)}:${this.checkFormatTime(toMinute)}`}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
    renderModalScheduled() {
        const { isChangeFrom, fromHour, toHour, fromMinute, toMinute } = this.state;
        const _date = new Date();
        _date.setHours(isChangeFrom ? fromHour : toHour);
        _date.setMinutes(isChangeFrom ? fromMinute : toMinute);
        if (this.state.isShowModalScheduled === false) return null
        return <TouchableWithoutFeedback onPress={this.dissModalScheduled}>
            <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: CommonStyle.backgroundColorPopup }}>
                <View style={{ backgroundColor: CommonStyle.fontColorSwitchTrue, marginLeft: 150, marginRight: 16, borderRadius: 12, position: 'absolute', top: this.topModalScheduled }}>
                    <View style={{ marginTop: 4 }}>
                        {
                            this.renderContent()
                        }
                    </View>
                    <View style={{ marginTop: 16, height: 1, backgroundColor: CommonStyle.fontWhite, opacity: 0.05, marginHorizontal: 16 }} />
                    <TouchableOpacity activeOpacity={1} style={{ backgroundColor: CommonStyle.fontColorSwitchTrue, borderBottomRightRadius: 12, borderBottomLeftRadius: 12 }}>
                        {
                            Platform.OS === 'ios'
                                ? <TimePicker
                                    ref={ref => this.timePicker = ref}
                                    selectedHour={this.state.isChangeFrom ? fromHour : toHour}
                                    selectedMinute={this.state.isChangeFrom ? fromMinute : toMinute}
                                    minuteInterval={this.state.minuteInterval}
                                    onValueChange={this._onValueChange}
                                    loop={true} />
                                : <TimePicker
                                    ref={ref => this.timePicker = ref}
                                    selectedHour={this.state.isChangeFrom ? fromHour : toHour}
                                    selectedMinute={this.state.isChangeFrom ? fromMinute : toMinute}
                                    minuteInterval={this.state.minuteInterval}
                                    onValueChange={this._onValueChange}
                                    loop={true} />
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    }
    dissModalScheduled = () => {
        this.setState({ isShowModalScheduled: false }, () => {
            setTimeout(() => {
                this.saveUserSettings()
            }, 200)
        })
    }
    saveUserSettings() {
        const { fromHour, fromMinute, toHour, toMinute } = this.state;
        const scheduledObj = { fromHour, fromMinute, toHour, toMinute };
        this.saveDataSetting('scheduledData', scheduledObj)
    }
    renderFakeModalHeader() {
        const { isShowModalScheduled } = this.state
        if (isShowModalScheduled) return <TouchableOpacity onPress={this.dissModalScheduled} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: CommonStyle.backgroundColorPopup, zIndex: 100 }} />
        return null
    }

    getBottomTabLayout = this.getBottomTabLayout.bind(this)
    getBottomTabLayout(event) {
        return this.heightBottomBar = event.nativeEvent.layout.height;
    }

    renderHeader = this.renderHeader.bind(this)
    renderHeader() {
        return <Header
            title={I18n.t('newsNoti')}
            renderLeftComp={this.renderLeftComp}
            setting={this.props.setting}
            style={{ marginLeft: 0, paddingTop: 16 }}
        >
            <View />
        </Header>
    }

    render() {
        const { scheduled, priceSensitive, fromHour, fromMinute, toHour, toMinute, allRelated } = this.props.setting.news
            ? this.props.setting.news
            : {
                allRelated: false,
                priceSensitive: true,
                scheduled: true,
                fromHour: 20,
                fromMinute: 0,
                toHour: 8,
                toMinute: 0
            };
        return <Animated.View
            style={{
                backgroundColor: CommonStyle.fontDefaultColor,
                transform: [{ translateX: this.translateXNewsNotification }],
                width: WIDTH_DEVICE,
                height: '100%',
                overflow: 'hidden'
            }}>
            <FallHeader
                style={{ backgroundColor: CommonStyle.backgroundColorNews }}
                header={this.renderHeader()}
            >
                <ScrollView>
                    <View style={{ flex: 1, backgroundColor: CommonStyle.fontDefaultColor, paddingTop: 0 }}>
                        {
                            this.state.disableDeviceNoti
                                ? <View style={{ padding: 16, paddingBottom: 0 }}>
                                    {
                                        Platform.OS === 'ios'
                                            ? (<Text style={[CommonStyle.sectContentText, { flex: 0 }]}>{I18n.t('warningNotiIOS')}</Text>)
                                            : (<Text style={[CommonStyle.sectContentText, { flex: 0 }]}>{I18n.t('warningNotiAND')}</Text>)
                                    }
                                    <View style={{ flex: 1, backgroundColor: CommonStyle.fontColorBorderNew, height: 1, marginTop: 16 }}></View>
                                </View>
                                : null
                        }
                        <View style={[CommonStyle.sectContent, { backgroundColor: CommonStyle.fontDefaultColor }]}>
                            <Text style={CommonStyle.sectContentText}>{I18n.t('settingNewsPriceSensitive', { locale: this.props.setting.lang })}</Text>
                            <SwitchButton testID='switchNewsPriceSensitive'
                                circleSize={24}
                                barHeight={30}
                                circleBorderWidth={0}
                                backgroundActive={CommonStyle.fontColorSwitchTrue}
                                backgroundInactive={CommonStyle.fontColorSwitchTrue}
                                circleActiveColor={CommonStyle.fontColorButtonSwitch}
                                circleInActiveColor={'#000000'}
                                changeValueImmediately={true}
                                changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                                innerCircleStyle={{ alignItems: 'center', justifyContent: 'center' }} // style for inner animated circle for what you (may) be rendering inside the circle
                                outerCircleStyle={{}} // style for outer animated circle
                                renderActiveText={false}
                                renderInActiveText={false}
                                switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                                switchBorderRadius={16}
                                onValueChange={data => this.onChangeShowPriceSensitive(data)}
                                value={priceSensitive} />
                        </View>
                        <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                        <View style={[CommonStyle.sectContent, { backgroundColor: CommonStyle.fontDefaultColor }]}>
                            <Text style={CommonStyle.sectContentText}>{I18n.t('settingNewsAllRelated', { locale: this.props.setting.lang })}</Text>
                            <SwitchButton testID='switchNewsAnnouncement'
                                disabled={priceSensitive}
                                circleSize={24}
                                barHeight={30}
                                circleBorderWidth={0}
                                backgroundActive={CommonStyle.fontColorSwitchTrue}
                                backgroundInactive={CommonStyle.fontColorSwitchTrue}
                                circleActiveColor={CommonStyle.fontColorButtonSwitch}
                                circleInActiveColor={'#000000'}
                                changeValueImmediately={true}
                                changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                                innerCircleStyle={{ alignItems: 'center', justifyContent: 'center' }} // style for inner animated circle for what you (may) be rendering inside the circle
                                outerCircleStyle={{}} // style for outer animated circle
                                renderActiveText={false}
                                renderInActiveText={false}
                                switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                                switchBorderRadius={16}
                                onValueChange={data => this.onChangeShowAllRelated(data)}
                                value={allRelated} />
                        </View>
                        <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                        <View style={{ height: 32, justifyContent: 'center', paddingLeft: 16, marginTop: 24 }}>
                            <Text style={{ fontFamily: CommonStyle.fontPoppinsBold, color: CommonStyle.fontColor, fontSize: CommonStyle.fontSizeS }}>{I18n.t('doNotDisturb', { locale: this.props.setting.lang })}</Text>
                        </View>
                        <View dis style={[CommonStyle.sectContent, { backgroundColor: CommonStyle.fontDefaultColor }]}>
                            <Text style={[CommonStyle.sectContentText, { color: (allRelated || priceSensitive) ? CommonStyle.fontColor : CommonStyle.colorIconSettings }]}>{I18n.t('scheduled', { locale: this.props.setting.lang })}</Text>
                            <SwitchButton disabled={!priceSensitive && !allRelated}
                                circleSize={24}
                                barHeight={30}
                                circleBorderWidth={0}
                                backgroundActive={CommonStyle.fontColorSwitchTrue}
                                backgroundInactive={CommonStyle.fontColorSwitchTrue}
                                circleActiveColor={CommonStyle.fontColorButtonSwitch}
                                circleInActiveColor={'#000000'}
                                changeValueImmediately={true}
                                changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                                innerCircleStyle={{ alignItems: 'center', justifyContent: 'center' }} // style for inner animated circle for what you (may) be rendering inside the circle
                                outerCircleStyle={{}} // style for outer animated circle
                                renderActiveText={false}
                                renderInActiveText={false}
                                switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                                switchBorderRadius={16}
                                testID='switchScheduled'
                                onValueChange={data => this.onChangeScheduled(data)}
                                value={scheduled} />
                        </View>
                        <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                        <CollapseContent
                            formatHours={this.formatHours}
                            formatMinutes={this.formatMinutes}
                            lang={this.props.setting.lang}
                            allRelated={allRelated}
                            priceSensitive={priceSensitive}
                            fromHour={fromHour}
                            fromMinute={fromMinute}
                            toHour={toHour}
                            toMinute={toMinute}
                            setRefTopModalSchedule={this.setRefTopModalSchedule}
                            showModalScheduled={this.showModalScheduled}
                            scheduled={scheduled}
                            setRef={ref => this.collaseContentRef = ref} />
                        {
                            scheduled
                                ? <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                                : null
                        }
                        <TouchableOpacity testID='resetNewsNoti' onPress={this.onPress}
                            style={[CommonStyle.sectContent, { backgroundColor: CommonStyle.fontDefaultColor }]}>
                            <Text style={[CommonStyle.sectContentText, { color: CommonStyle.fontNewRed, opacity: 1 }]}>{I18n.t('resetNewsNoti', { locale: this.props.setting.lang })}</Text>
                        </TouchableOpacity>
                        {/* <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} /> */}
                        {this.renderModalScheduled()}
                        <View style={{ height: 88 }} />
                    </View>
                </ScrollView>
            </FallHeader>
        </Animated.View>
    }
}

function mapStateToProps(state, ownProps) {
    return {
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(settingActions, dispatch),
        loginActions: bindActionCreators(loginActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsSetting);
