import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    View, Text, TouchableOpacity, Switch, Platform, ScrollView,
    Alert, PixelRatio, Easing, Dimensions, Animated
} from 'react-native';
import styles from '../style/setting.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetworkWarning from '../../../component/network_warning/network_warning';
import * as settingActions from '../setting.actions';
import * as loginActions from '../../login/login.actions';
import I18n from '../../../modules/language/index';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import {
    logAndReport, logDevice, log, setStyleNavigation, clone
} from '../../../lib/base/functionUtil';
import firebase from '../../../firebase';
import { func, dataStorage } from '../../../storage';
import { setCurrentScreen } from '../../../lib/base/analytics';
import analyticsEnum from '../../../constants/analytics';
import Auth from '../../../lib/base/auth';
import { iconsMap } from '../../../utils/AppIcons';
import { List, ListItem } from 'react-native-elements';
import performanceEnum from '../../../constants/performance';
import Perf from '../../../lib/base/performance_monitor';
import * as api from '../../../api';
import * as Util from '../../../util'
import DeviceInfo from 'react-native-device-info';
import * as Controller from '../../../memory/controller'
import Header from '../../../../src/component/headerNavBar/index'
import Icon from '../../../../src/component/headerNavBar/icon'
import SwitchButton from '~/screens/alert_function/components/SwitchButton'
import BottomTabBar from '~/component/tabbar'
import { Navigation } from 'react-native-navigation'
import FallHeader from '~/component/fall_header'

const { width: WIDTH_DEVICE, height } = Dimensions.get('window')
const DURATION = 150

const orderSettingType = {
    ON_MARKET: 'on_market',
    PARTIAL_FILL: 'partial_fill',
    FILLED: 'filled',
    CANCELED: 'canceled',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
    RESET: 'reset'
}

class OrderSetting extends Component {
    constructor(props) {
        super(props)
        this.saveDataSetting = this.saveDataSetting.bind(this);
        this.perf = new Perf(performanceEnum.show_form_order_settings);
        this.translateXOrderNotification = new Animated.Value(0)
        this.listSettings = [
            { title: I18n.t('settingOrderOnMarket'), key: 'on_market' },
            { title: I18n.t('settingOrderFilled'), key: 'filled' },
            { title: I18n.t('settingOrderPartialFill'), key: 'partial_fill' },
            { title: I18n.t('settingOrderReject'), key: 'rejected' },
            { title: I18n.t('settingOrderCancel'), key: 'cancelled' },
            { title: I18n.t('settingOrderExpired'), key: 'expired' }
        ]
        this.state = {
            visible: false
        }
    }

    openScreenAnim = this.openScreenAnim.bind(this)
    openScreenAnim() {
        this.translateXOrderNotification.setValue(-WIDTH_DEVICE)
        Animated.timing(
            this.translateXOrderNotification,
            {
                toValue: -2 * WIDTH_DEVICE,
                duration: DURATION,
                easing: Easing.quad,
                useNativeDriver: true
            }
        ).start()
    }

    closeScreenAnim = this.closeScreenAnim.bind(this)
    closeScreenAnim() {
        Animated.timing(
            this.translateXOrderNotification,
            {
                toValue: -WIDTH_DEVICE,
                duration: DURATION,
                easing: Easing.quad,
                useNativeDriver: true
            }
        ).start()
        setTimeout(() => {
            this.translateXOrderNotification.setValue(0)
        }, DURATION)
    }

    componentDidMount() {
        this.props.setRef && this.props.setRef(this)
        if (!this.props.setting.order) {
            this.saveDataSetting('reset')
        }
    }

    saveDataSetting(type, value) {
        try {
            const newObj = clone(this.props.setting);
            const deviceId = dataStorage.deviceId
            if (newObj && newObj.order) {
                if (type === orderSettingType.RESET) {
                    const orderSettingDefault = {
                        on_market: true,
                        partial_fill: false,
                        filled: true,
                        cancelled: true,
                        rejected: true,
                        expired: true,
                        reset: false
                    }
                    newObj['order'] = orderSettingDefault;
                } else {
                    newObj['order'][`${type}`] = value;
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
                    logDevice('info', 'Order_setting set user setting success')
                }).catch(error => {
                    logDevice('info', 'Order_setting cannot set user setting')
                })
            }
        } catch (error) {
            logAndReport('saveDataSetting setting exception', error, 'saveDataSetting setting');
        }
    }

    componentWillMount() {
        setCurrentScreen(analyticsEnum.settingsOrder);
        this.perf && this.perf.incrementCounter(performanceEnum.show_form_order_settings);
    }

    onChange(key, data) {
        this.saveDataSetting(key, data);
    }

    setValue(key) {
        const order = this.props.setting.order;
        return !!(order && order[key])
    }
    renderLeftComp = this.renderLeftComp.bind(this);
    renderLeftComp() {
        const content = (
            <Icon name="ios-arrow-back" onPress={this.closeScreenAnim} />
        );
        return <View style={{ width: 36 }}>{content}</View>
    }
    onPress = () => {
        Navigation.showModal({
            screen: 'equix.NewPopup',
            animated: false,
            animationType: 'none',
            navigatorStyle: {
                ...CommonStyle.navigatorStyleCommon,
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                title: I18n.t('confirm'),
                titleChild: I18n.t('resetOrderNoti'),
                isButtonCancel: true,
                isButtonOk: true,
                buttonNameOk: I18n.t('ok'),
                onAccept: () => {
                    this.saveDataSetting('reset')
                }
            }
        })
    }

    getBottomTabLayout = this.getBottomTabLayout.bind(this)
    getBottomTabLayout(event) {
        return this.heightBottomBar = event.nativeEvent.layout.height;
    }

    renderHeader = this.renderHeader.bind(this)
    renderHeader() {
        return <Header
            title={I18n.t('orderNoti')}
            renderLeftComp={this.renderLeftComp}
            style={{ marginLeft: 0, paddingTop: 16 }}
        >
            <View />
        </Header>
    }

    render() {
        return <Animated.View
            style={{
                backgroundColor: CommonStyle.fontDefaultColor,
                transform: [{ translateX: this.translateXOrderNotification }],
                width: WIDTH_DEVICE,
                height: '100%',
                overflow: 'hidden'
            }}>
            <FallHeader
                style={{ backgroundColor: CommonStyle.backgroundColorNews }}
                header={this.renderHeader()}
            >
                <View style={{ flex: 1, backgroundColor: CommonStyle.fontDefaultColor }}>
                    <ScrollView style={{ flex: 1, backgroundColor: CommonStyle.fontDefaultColor, marginTop: 0 }}>
                        {
                            this.listSettings.map((item, index) => {
                                return (
                                    <View key={index}>
                                        <View style={[CommonStyle.sectContent, { backgroundColor: CommonStyle.fontDefaultColor }]}>
                                            <Text style={[CommonStyle.sectContentText]}>{item.title}</Text>
                                            <SwitchButton
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
                                                testID={`${item.key}`}
                                                onValueChange={data => this.onChange(item.key, data)}
                                                value={this.setValue(item.key)} />
                                        </View>
                                        {index === this.listSettings.length - 1 ? null : <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />}
                                    </View>
                                )
                            })
                        }
                        <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                        <TouchableOpacity testID='resetOrderNoti'
                            onPress={this.onPress}
                            style={[CommonStyle.sectContent, { backgroundColor: CommonStyle.fontDefaultColor }]}>

                            <Text style={[CommonStyle.sectContentText, { color: CommonStyle.fontNewRed, opacity: 1 }]}>{I18n.t('resetOrderNoti')}</Text>
                        </TouchableOpacity>
                        <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                    </ScrollView>
                </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(OrderSetting);
