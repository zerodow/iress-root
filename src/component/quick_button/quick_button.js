import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback,
    Dimensions, PixelRatio, Animated, Platform, StatusBar
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import I18n from '../../modules/language';
import { func, dataStorage } from './../../storage'
import Enum from '../../enum';
import * as RoleUser from '../../roleUser';
import * as Controller from '../../memory/controller';
import * as Bussiness from '~/business'
import * as FunctionUtil from '~/lib/base/functionUtil'
import CommonStyle from '~/theme/theme_controller'
import TouchableOpacityOpt from '../touchableOpacityOpt';
import { showNewAlertModal } from '~/navigation/controller.1'

const { height, width } = Dimensions.get('window');

export default class QuickButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            onNewOrder: false,
            onNewAlert: false,
            clickOutside: false,
            fadeHeight: new Animated.Value(44),
            fadeOpacity: new Animated.Value(0)
        }
    }

    showOption = () => {
        Bussiness.setStatusBarBackgroundColor()
        this.setState({
            visible: true
        }, () => {
            Animated.parallel([
                Animated.timing(
                    this.state.fadeHeight,
                    {
                        toValue: Platform.OS === 'ios' ? 88 : 162,
                        duration: 600
                    }
                ),
                Animated.timing(
                    this.state.fadeOpacity,
                    {
                        toValue: 1,
                        duration: 600
                    }
                )
            ]).start()
        })
    }

    openAlert = () => {
        showNewAlertModal({
            navigator: this.props.navigator,
            passProps: {
                wrapperStyle: {
                    paddingTop: Platform.OS === 'ios'
                        ? FunctionUtil.isIphoneXorAbove()
                            ? 38
                            : 16
                        : 0,
                    height: FunctionUtil.isIphoneXorAbove()
                        ? 48 + 38
                        : 48 + 16
                },
                style: {
                    top: Platform.OS === 'ios'
                        ? FunctionUtil.isIphoneXorAbove()
                            ? 38
                            : 16
                        : 0
                }
            }
        })
    }

    openSearch = () => {
        this.setState({
            visible: false,
            onNewOrder: false,
            clickOutside: false
        })
    }

    openNewOrder = () => {
        this.setState({
            visible: false,
            onNewOrder: true,
            clickOutside: false
        })
    }

    closeModal = (cb) => {
        Bussiness.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarBgColor })
        this.setState({
            visible: false,
            onNewOrder: false,
            onNewAlert: false,
            clickOutside: true
        }, () => {
            Animated.parallel([
                Animated.timing(
                    this.state.fadeHeight,
                    {
                        duration: 600,
                        toValue: 44
                    }
                ),
                Animated.timing(
                    this.state.fadeOpacity,
                    {
                        duration: 600,
                        toValue: 0
                    }
                )
            ]).start()
        })
    }

    onDismiss = () => {
        if (!this.state.clickOutside) {
            if (this.state.onNewOrder) {
                this.props.onNewOrder();
            } else {
                this.props.onUniversalSearch()
            }
        } else if (this.state.onNewAlert) {
            this.openAlert()
        }
    }

    onRequestClose() {
        console.log('request close')
    }

    checkDisableOrder() {
        const enabled = Controller.getLoginStatus() &&
            !dataStorage.isLockedAccount &&
            dataStorage.loginUserType !== 'REVIEW' &&
            !dataStorage.isNotHaveAccount &&
            RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_NEW_ORDER_QUICK_BUTTON) &&
            func.isAccountActive()
        return !enabled
    }
    renderRowButton = () => {
        const { fadeHeight } = this.state;
        return <Animated.View
            ref='textRef'
            style={{
                backgroundColor: 'transparent',
                position: 'absolute',
                height: this.height,
                bottom: fadeHeight,
                right: 23,
                left: 0,
                alignItems: 'flex-end',
                opacity: this.state.fadeOpacity
            }}>
            {!this.isDisableAlert && this.renderSingleRow({ isvisible: false, isonNewWiget: true, isclickOutside: true, callBack: this.openAlert, IconButton: 'add-alert', title: 'newAlert', refID: 'alert', testId: 'alertQuickButton', testIdWrap: '_alertButton' })}
            {!this.isDisableOrder && this.renderSingleRow({ callBack: this.openNewOrder, IconButton: 'md-create', title: 'newOrder', refID: 'newOrder', testId: 'newOrderQuickButton', testIdWrap: '_newOrderButton' })}
            {!this.isDisableSearch && this.renderSingleRow({ callBack: this.openSearch, IconButton: 'ios-search', title: 'search', refID: 'search', testId: 'searchQuickButton', testIdWrap: '_searchButton' })}
        </Animated.View>
    }
    renderSingleRow = (params) => {
        try {
            const { isvisible, isonNewWiget, isclickOutside, callBack, IconButton, title, refID, testId, testIdWrap } = params;
            return <TouchableOpacity
                style={[CommonStyle.rowQuickButton]}
                ref={refID}
                onPress={() => {
                    switch (refID) {
                        case 'alert':
                            this.setState({
                                visible: isvisible,
                                onNewAlert: isonNewWiget,
                                clickOutside: isclickOutside
                            }, () => {
                                if (Platform.OS === 'android') {
                                    setTimeout(callBack, 300)
                                }
                            })
                            break;
                        case 'newOrder':
                        case 'search':
                            if (Platform.OS === 'ios') {
                                callBack && callBack()
                            } else {
                                this.closeModal()
                                setTimeout(() => {
                                    switch (refID) {
                                        case 'newOrder':
                                            this.props.onNewOrder()
                                            break;
                                        case 'search':
                                            this.props.onUniversalSearch()
                                            break;
                                        default:
                                            break;
                                    }
                                }, 300)
                            }
                            break;
                        default:
                            break;
                    }
                }}
                testID={`${this.props.testID}+${testIdWrap}`}>
                <Text
                    numberOfLines={1}
                    testID={testId}
                    style={[CommonStyle.textQuickButton]}>
                    {I18n.t(`${title}`)}
                </Text>
                <View style={[CommonStyle.circleOption]}>
                    {
                        refID === 'alert'
                            ? <Icon name={`${IconButton}`} size={28} color={CommonStyle.fontBlue} />
                            : <IonIcons name={`${IconButton}`} size={24} color={CommonStyle.fontBlue} />
                    }
                </View>
            </TouchableOpacity>
        } catch (error) {
            console.log('error at render singlerow Quickbutton', error);
            return null;
        }
    }
    renderIconClose = () => {
        return <TouchableOpacity style={{}} onPress={this.closeModal}>
            <IonIcons name='md-close' size={30} color={CommonStyle.btnTabInActive} />
        </TouchableOpacity>
    }

    renderQuickBtn = () => {
        const { visible } = this.state
        if (this.isDisableAlert && this.isDisableSearch && this.isDisableOrder) return null;
        return <TouchableOpacityOpt
            style={[CommonStyle.circleSearch,
            {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }
            ]}
            onPress={() => {
                this.props.pressAction && this.props.pressAction();
                this.showOption();
            }}
            timeDelay={Enum.TIME_DELAY}>
            {
                visible ? <IonIcons name='md-close' size={30} color={CommonStyle.circleBtnBg} />
                    : <IonIcons
                        name='md-add' size={30}
                        color={CommonStyle.circleBtnBg}
                    />
            }
        </TouchableOpacityOpt>
    }

    renderModal = () => {
        /**
          * fix loi height sai tren mo vai thiet bi xiaomi, note 8
          */
        const realHeight = Controller.getRealWindowHeight()
        const deviceHeight = Platform.OS === 'ios'
            ? height
            : realHeight
        return <Modal testID={`${this.props.testID}_modalQuickButton`}
            onRequestClose={this.onRequestClose}
            animationType="fade"
            transparent={true}
            style={{ height, width, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
            visible={this.state.visible}
            onDismiss={this.onDismiss}>
            <TouchableWithoutFeedback onPress={this.closeModal}>
                <View style={[CommonStyle.modalWrapper, { position: 'absolute', top: 0, bottom: 0, right: 0, left: 0, height: deviceHeight }]}>
                    {this.renderRowButton()}
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    }

    render = () => {
        return null // tam thi bo het quick button hien tai de su dung quick button in tabbar
        this.isDisableAlert = !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_NEW_ALERT_QUICK_BUTTON) || !Controller.getLoginStatus()
        this.isDisableSearch = !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_SEARCH_QUICK_BUTTON)
        this.isDisableOrder = this.checkDisableOrder()
        if ((this.isDisableOrder && this.isDisableAlert && !this.isDisableSearch) || (!this.isDisableAlert && this.isDisableOrder && this.isDisableSearch) || (!this.isDisableOrder && this.isDisableSearch && this.isDisableAlert)) {
            this.height = 50;
        } else if ((this.isDisableOrder && !this.isDisableAlert && !this.isDisableSearch) || (this.isDisableAlert && !this.isDisableOrder && !this.isDisableSearch) || (!this.isDisableOrder && this.isDisableSearch && !this.isDisableAlert)) {
            this.height = 100;
        } else {
            this.height = 150;
        }
        if (this.isDisableAlert && this.isDisableSearch && this.isDisableOrder) return <View />
        return (
            <View testID={this.props.testID}
                style={[
                    CommonStyle.wrapperCircleSearch,
                    this.props.style
                ]}>
                <View style={[
                    CommonStyle.circleSearch,
                    {
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }
                ]} />
                {this.renderQuickBtn()}
                {this.renderModal()}
            </View>
        );
    }
}
