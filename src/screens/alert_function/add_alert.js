import React, { PureComponent } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ListView,
    Dimensions,
    Animated,
    PanResponder,
    FlatList,
    Easing,
    ScrollView,
    DeviceEventEmitter,
    NativeAppEventEmitter,
    Platform
} from 'react-native';
// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as alertActions from './redux/actions';
// Api
import * as Api from '../../api';
// Util
import * as Util from '../../util';
import * as Business from '../../business';
import * as FunctionUtil from '../../lib/base/functionUtil';
import * as Controller from '../../memory/controller';
import * as Channel from '../../streaming/channel';
import * as Emitter from '@lib/vietnam-emitter';
import * as PureFunc from '../../utils/pure_func';
// Storage
import ENUM from '../../enum';
import CommonStyle, { register } from '~/theme/theme_controller';
import { dataStorage, func } from '../../storage';
// Component
import {
    Text as TextLoad,
    View as ViewLoad
} from '~/component/loading_component';
import FallHeader from '~/component/fall_header';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import * as Animatable from 'react-native-animatable';
import TransitionView from '~/component/animation_component/transition_view';
import XComponent from '../../component/xComponent/xComponent';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Flag from '../../component/flags/flag';
import I18n from '../../modules/language/';
import { checkRoleByKey } from '~/roleUser';
import NetworkWarning from '../../component/network_warning/network_warning';
import ScreenId from '../../constants/screen_id';
import NotifyOrder from '../../component/notify_order';
import HeaderSpecial from './components/Header/index';
import ItemSeparator from './components/ItemSeparator';
import RowLoading from './components/RowLoading';
import StateApp from '~/lib/base/helper/appState';
// Redux
// Style
import Styles from './styles';
const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 74;
const { SCREEN, ALERT_SCREEN, FONT_SIZE_INT } = ENUM;
const { ROLE_USER, ROLE_DETAIL } = ENUM;
const DURATION = 500;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
class RowAddAlert extends PureComponent {
    constructor(props) {
        super(props);
        this.init();
        this.bindAllFunc();
        this.initMount = true;
        this.animationShake = false;
    }
    getHeightRow = () => {
        const fontSize = Controller.getFontSize();
        switch (Controller.getFontSize()) {
            case FONT_SIZE_INT.Small:
                return Platform.OS === 'ios' ? 74.5 : 70.5;
            case FONT_SIZE_INT.Medium:
                return Platform.OS === 'ios' ? 78 : 74;
            case FONT_SIZE_INT.Large:
                return Platform.OS === 'ios' ? 81.5 : 76.5;
            default:
                return Platform.OS === 'ios' ? 78 : 74;
        }
    };
    init() {
        this.dic = {
            lastPositionSwip: 0,
            btnDeleteWidth: new Animated.Value(112),
            dicPanResponder: {},
            alertObjRealTime: {}
        };
        this.state = {
            errorCode: null,
            isConnected: true,
            tradingHalt: false,
            translateXDestination: new Animated.Value(0),
            iconOpacityAnim: new Animated.Value(1),
            heightAni: new Animated.Value(this.getHeightRow()),
            minWidthBtn: new Animated.Value(0),
            marginTopAni: new Animated.Value(this.props.index === 0 ? 8 : 8),
            marginBottomAni: new Animated.Value(2),
            screenSelected: 'modify-alert-list'
        };
        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => false,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                const { dx, dy } = gestureState;
                if (Math.abs(dy) > Math.abs(dx)) {
                    return false;
                }
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.updateScrollEnabled(false);
                }
                return dx < -16 || dx > 16;
            },
            // onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
            onPanResponderGrant: (evt, gestureState) => {
                // The gesture has started. Show visual feedback so the user knows
                // what is happening!
                // gestureState.d{x,y} will be set to zero now
                Animated.timing(this.state.iconOpacityAnim, {
                    toValue: 0,
                    duration: 100
                }).start();
            },
            onPanResponderMove: (evt, { dx }) => {
                this.updateScrollEnabled(false);
                const newValue = this.dic.lastPositionSwip + dx;
                this.state.translateXDestination.setValue(newValue);
                // The most recent move distance is gestureState.move{X,Y}
                // The accumulated gesture distance since becoming responder is
                // gestureState.d{x,y}
            },
            onPanResponderTerminationRequest: (evt, gestureState) => false,
            onPanResponderRelease: (evt, { dx }) => {
                this.updateScrollEnabled(true);
                if (dx < 0) {
                    this.showBtnConfirmDelete(100);
                } else {
                    this.hideBtnConfirmDelete(100);
                }
                // The user has released all touches while this view is the
                // responder. This typically means a gesture has succeeded
            },
            onPanResponderTerminate: (evt, gestureState) => {
                this.updateScrollEnabled(true);
                this.showBtnConfirmDelete(100);
                this.props.hideAnimationOtherRow &&
                    this.props.hideAnimationOtherRow(false);
                // Another component has become the responder, so this gesture
                // should be cancelled
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                // Returns whether this component should block native components from becoming the JS
                // responder. Returns true by default. Is currently only supported on android.
                return false;
            }
        });
        this.setScreenActive();
    }
    setScreenActive = () => {
        this.props.alertActions.changeScreenActive &&
            this.props.alertActions.changeScreenActive(
                ALERT_SCREEN.MODIFY_ALERT
            );
    };
    componentWillUnmount() {
        this.isUnMount = true;
        this.animationShake = false;
        this.refViewAni && this.refViewAni.stopAnimation();
    }

    bindAllFunc() {
        this.updateScrollEnabled = this.updateScrollEnabled.bind(this);
        this.showBtnConfirmDelete = this.showBtnConfirmDelete.bind(this);
        this.hideBtnConfirmDelete = this.hideBtnConfirmDelete.bind(this);
        this.onProcessDelete = this.onProcessDelete.bind(this);
        this.moveToModifyAlert = this.moveToModifyAlert.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isConnected !== this.state.isConnected) {
            this.setState({
                isConnected: nextProps.isConnected
            });
        }
    }

    updateSwipPosition(lastPositionSwip) {
        this.dic.lastPositionSwip = lastPositionSwip;
    }

    updateScrollEnabled(scrollEnabled) {
        this.props.updateScrollEnabled &&
            this.props.updateScrollEnabled(scrollEnabled);
    }

    showBtnConfirmDelete(duration) {
        this.updateSwipPosition(-this.dic.btnDeleteWidth._value);
        Animated.parallel([
            Animated.timing(this.state.iconOpacityAnim, {
                toValue: 0,
                duration
            }),
            Animated.timing(this.state.translateXDestination, {
                toValue: -this.dic.btnDeleteWidth._value,
                duration
            })
        ]).start(() => {
            const { alertObj = {} } = this.props;
            const { alert_id: alertID } = alertObj;
            this.props.hideAnimationOtherRow &&
                this.props.hideAnimationOtherRow(alertID);
            this.props.registerAnimation &&
                this.props.registerAnimation(
                    alertID,
                    this.hideBtnConfirmDelete
                );
        });
    }

    hideBtnConfirmDelete(duration) {
        this.updateSwipPosition(0);
        Animated.parallel([
            Animated.timing(this.state.iconOpacityAnim, {
                toValue: 1,
                duration
            }),
            Animated.timing(this.state.translateXDestination, {
                toValue: 0,
                duration
            })
        ]).start();
    }

    onProcessDelete(checkRoleIconRemove) {
        if (!checkRoleIconRemove) return;
        this.showBtnConfirmDelete(200);
    }

    moveToModifyAlert(checkRoleIconModify) {
        this.props.moveToModifyAlert &&
            this.props.moveToModifyAlert(this.props.alertObj);
        this.props.onShowDetail && this.props.onShowDetail();
    }
    setRef = (ref) => {
        this.refViewAni = ref;
        const { alert_id: alertID, updated } = this.props.alertObj;
        this.props.setRef && this.props.setRef({ ref, alertID, updated });
    };
    setRefButtonDelete = (ref) => {
        this.refButtonDelete = ref;
    };
    handleAnimationShake = (flag) => {
        console.log('DCM runanimation', this.props.index);
        if (this.isUnMount) {
            return;
        }
        const animationRotation = {
            easing: 'linear',
            0: {
                rotate: '-1deg'
            },
            0.25: {
                rotate: '0deg'
            },
            0.5: {
                rotate: '1deg'
            },
            0.75: {
                rotate: '0deg'
            },
            1: {
                rotate: '-1deg'
            }
        };
        this.refButtonDelete &&
            this.refButtonDelete.animate(animationRotation, 300);
        this.refViewAni &&
            this.refViewAni.animate(animationRotation, 300).then(() => {
                this.handleAnimationShake(flag);
            });
    };
    handleAnimationShakeV2 = (flag) => {
        if (this.isUnMount) {
            return;
        }
        const animationRotation = {
            easing: 'linear',
            0: {
                rotate: '-1deg'
            },
            0.25: {
                rotate: '0deg'
            },
            0.5: {
                rotate: '1deg'
            },
            0.75: {
                rotate: '0deg'
            },
            1: {
                rotate: '-1deg'
            }
        };
        this.refButtonDelete &&
            this.refButtonDelete.animate(animationRotation, 300);
        this.refViewAni &&
            this.refViewAni.animate(animationRotation, 300).then(() => {
                this.handleAnimationShakeV2(flag);
            });
    };
    handleFadeIn = () => {
        if (this.props.index <= 10 && !this.animationShake) {
            // this.animationShake = true
            // this.handleAnimationShake('New')
        }
        return;
        if (this.isNew() < 0) {
            this.init = false;
            if (this.props.preData.length > 0) {
                /**
                 * Truong hop realtime. Khi dang dung o man hinh nay, co item moi them vao thi chi show len va rung
                 */
                this.refViewAni &&
                    this.refViewAni
                        .animate(
                            {
                                easing: 'linear',
                                0: {
                                    opacity: 1
                                },
                                1: {
                                    opacity: 1
                                }
                            },
                            1
                        )
                        .then(() => {
                            this.handleAnimationShake('New');
                        });
            }
            /**
             * Truong hop dau tien khi cac item la moi nhat deu phai khoi tao thi fade tu tren xuong va rung
             */
            setTimeout(() => {
                this.refViewAni &&
                    this.refViewAni.fadeIn(DURATION).then(() => {
                        // this.handleAnimationShake('New')
                    });
            }, this.getDelay({ index: this.props.index }));
        } else {
            if (this.init) {
                /**
                 * Truong hop item thuoc dang update. thi chi va component da bi unmount thi chay animation rung
                 */
                this.handleAnimationShake('Old');
            }
        }
    };
    isNew = () => {
        return this.props.preData.findIndex((el) => {
            return el.alert_id === this.props.alertObj.alert_id;
        });
    };
    getDelay = ({ index, reverse = false, length }) => {
        if (index > 10) {
            return 0;
        }
        if (reverse) {
            return ((length - index + 1) * DURATION) / 6;
        }
        // const timeDelay = ((index + 1) * DURATION) / 5
        const timeDelay = 300 + index * (DURATION / 5);
        return timeDelay;
    };
    handleDeleteAlert = () => {
        const { alertObj } = this.props;
        Animated.timing(this.state.heightAni, {
            toValue: 1,
            duration: 300
        }).start();
        Animated.parallel([
            Animated.timing(this.state.marginBottomAni, {
                toValue: 0,
                duration: 300
            }),
            Animated.timing(this.state.marginTopAni, {
                toValue: 0,
                duration: 300
            })
        ]).start();
        Animated.timing(this.state.translateXDestination, {
            toValue: -width,
            duration: 300
        }).start(() => {
            Animated.timing(this.state.translateXDestination, {
                toValue: -width,
                duration: 100
            });
            Animated.timing(this.state.heightAni, {
                toValue: 0,
                duration: 100
            }).start();
            this.props.onDeleteAlert(alertObj);
        });
        // Animated.timing(this.state.translateXDestination, {
        //     toValue: -width * 2,
        //     duration: 1000,
        //     delay: 200
        // }).start(() => {
        //     Animated.timing(this.state.heightAni, {
        //         toValue: 0,
        //         delay: 100
        //     }).start()
        //     this.props.onDeleteAlert(alertObj)
        // })
    };
    render() {
        const { alertObj, index } = this.props;
        const { isLoadingEditAlertList } = this.props.alert;
        const { symbol } = alertObj;
        const displayName = Business.getSymbolName({ symbol: alertObj.symbol });
        const flagIcon = Business.getFlagByCurrency(alertObj.currency);
        const description = Business.getAlertDescription(alertObj);
        const checkRoleIconRemove = checkRoleByKey(
            ROLE_DETAIL.ROLE_PERFORM_REMOVE_BUTTON
        );
        const checkRoleIconModify = checkRoleByKey(
            ROLE_DETAIL.ROLE_PERFORM_MODIFY_BUTTON
        );
        const isDisabled = !this.state.isConnected || !checkRoleIconRemove;
        // const animationOpacity = {
        //     easing: 'linear',
        //     0: {
        //         opacity: this.isNew() < 0 && this.props.preData.length === 0 ? 0 : 1
        //     },
        //     1: {
        //         opacity: this.isNew() < 0 && this.props.preData.length === 0 ? 0 : 1
        //     }
        // };
        const animationOpacity = {
            easing: 'linear',
            0: {
                opacity: 0
            },
            1: {
                opacity: 0
            }
        };
        let animation = 'fadeIn';
        if (this.isNew() >= 0) {
            animation = {
                easing: 'linear',
                0: {
                    opacity: 1
                },
                1: {
                    opacity: 1
                }
            };
        } else {
            if (this.props.preData.length > 0) {
                animation = {
                    easing: 'linear',
                    0: {
                        opacity: 1
                    },
                    1: {
                        opacity: 1
                    }
                };
            }
        }
        const widthButton = this.state.translateXDestination.interpolate({
            inputRange: [-2000, 0],
            outputRange: [2000, 0]
        });
        return (
            <Animated.View
                // key={this.props.alertObj.alert_id}
                // onLayout={(e) => {
                //     console.log('DCM height row alert', e.nativeEvent.layout.height, this.props.index)
                // }}
                {...this._panResponder.panHandlers}
                testID={`AddAlert${symbol}`}
                style={[
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        transform: [
                            { translateX: this.state.translateXDestination }
                        ],
                        width: width * 2,
                        height: this.state.heightAni,
                        overflow: 'hidden',
                        marginTop: this.state.marginTopAni
                        // marginBottom: this.state.marginBottomAni
                    }
                ]}
            >
                <Animatable.View
                    onAnimationEnd={this.handleFadeIn}
                    animation={animation}
                    delay={this.getDelay({ index: this.props.index })}
                    ref={this.setRef}
                    style={{ width }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingHorizontal: 16
                        }}
                    >
                        <Ionicons
                            hitSlop={{
                                top: 8,
                                left: 8,
                                right: 8,
                                bottom: 8
                            }}
                            testID={`removeAlert_${symbol}`}
                            name="md-remove-circle"
                            style={
                                checkRoleIconRemove
                                    ? [
                                          CommonStyle.addAlertIconLeft,
                                          { alignSelf: 'center' }
                                      ]
                                    : [
                                          CommonStyle.addAlertIconLeft,
                                          {
                                              alignSelf: 'center',
                                              color: 'grey',
                                              opacity: CommonStyle.opacity2
                                          }
                                      ]
                            }
                            onPress={() =>
                                this.onProcessDelete(checkRoleIconRemove)
                            }
                        />
                        <View
                            style={[
                                Styles.itemWrapper,
                                {
                                    justifyContent: 'space-between',
                                    flex: 1,
                                    marginHorizontal: 0
                                }
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() =>
                                    checkRoleIconModify &&
                                    this.moveToModifyAlert()
                                }
                                style={{ width: '80%' }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        marginBottom: 6
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 0.7,
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <Text style={[CommonStyle.textMainRed]}>
                                            {this.state.tradingHalt ? '! ' : ''}
                                        </Text>
                                        <TextLoad
                                            style={[Styles.textSymbol]}
                                            isLoading={isLoadingEditAlertList}
                                        >
                                            <Text>{displayName}</Text>
                                        </TextLoad>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <ViewLoad
                                            isLoading={isLoadingEditAlertList}
                                        >
                                            <Flag
                                                type={'flat'}
                                                code={flagIcon}
                                                size={18}
                                            />
                                        </ViewLoad>
                                    </View>
                                </View>
                                <TextLoad
                                    isLoading={isLoadingEditAlertList}
                                    numberOfLines={1}
                                    style={[
                                        Styles.textTimeInsights,
                                        {
                                            lineHeight:
                                                CommonStyle.fontSizeXS * 2
                                        }
                                    ]}
                                >
                                    <Text>{description}</Text>
                                </TextLoad>
                            </TouchableOpacity>
                            {checkRoleIconModify ? (
                                <Animated.View
                                    style={{
                                        opacity: this.state.iconOpacityAnim,
                                        alignSelf: 'center'
                                    }}
                                >
                                    <TouchableOpacityOpt
                                        timeDelay={ENUM.TIME_DELAY}
                                        style={{
                                            width: '100%',
                                            alignItems: 'flex-end',
                                            padding: 8
                                        }}
                                        onPress={this.moveToModifyAlert}
                                    >
                                        <Ionicons
                                            name="ios-arrow-forward"
                                            size={24}
                                            color={
                                                CommonStyle.colorIconSettings
                                            }
                                            style={
                                                checkRoleIconModify
                                                    ? [
                                                          {
                                                              color:
                                                                  CommonStyle.colorIconSettings,
                                                              opacity:
                                                                  CommonStyle.opacity2
                                                          }
                                                      ]
                                                    : [
                                                          {
                                                              color:
                                                                  CommonStyle.colorIconSettings,
                                                              opacity:
                                                                  CommonStyle.opacity4
                                                          }
                                                      ]
                                            }
                                        />
                                    </TouchableOpacityOpt>
                                </Animated.View>
                            ) : (
                                <View style={{ width: '10%' }} />
                            )}
                        </View>
                    </View>
                </Animatable.View>

                <TransitionView
                    setRef={this.setRefButtonDelete}
                    style={{ paddingVertical: 3 }}
                >
                    <AnimatedTouchable
                        disabled={isDisabled}
                        onPress={this.handleDeleteAlert}
                        style={{
                            paddingVertical: CommonStyle.paddingDistance2 * 2,
                            // alignSelf: 'baseline',
                            width: widthButton,
                            justifyContent: 'center',
                            borderRadius: 8,
                            alignItems: 'flex-start',
                            // minWidth: width,
                            height: '100%',
                            marginRight: 18,
                            // height: '100%',
                            // marginVertical: 8,
                            backgroundColor: isDisabled
                                ? CommonStyle.btnOrderDisableBg
                                : CommonStyle.btnClosePositionBgColor
                        }}
                    >
                        <Animated.View
                            style={{
                                width: this.dic.btnDeleteWidth,
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: CommonStyle.fontPoppinsRegular,
                                    fontSize: CommonStyle.fontSizeM,
                                    color: isDisabled
                                        ? CommonStyle.fontBlack
                                        : CommonStyle.fontWhite
                                }}
                            >
                                {I18n.t('delete')}
                            </Text>
                        </Animated.View>
                    </AnimatedTouchable>
                </TransitionView>
                {/* {<ItemSeparator />} */}
            </Animated.View>
        );
    }
}
function mapStateToPropsRowAlert(state, ownProps) {
    return {
        alert: state.alert
    };
}
function mapDispatchToPropsRowAlert(dispatch) {
    return {
        alertActions: bindActionCreators(alertActions, dispatch)
    };
}
const RowAlertConnected = connect(
    mapStateToPropsRowAlert,
    mapDispatchToPropsRowAlert,
    null,
    { forwardRef: true }
)(RowAddAlert);
export class AddAlert extends XComponent {
    init() {
        this.dic = {
            dicAnimation: {},
            isUpdateData: false,
            opacityWrapper: new Animated.Value(0),
            data: [],
            listRefData: {},
            preData: [],
            isLoading: true
        };
        this.emitter =
            Platform.OS === 'android'
                ? DeviceEventEmitter
                : NativeAppEventEmitter;
        this.state = {
            isConnected: true,
            scrollEnabled: true,
            data: [],
            screenSelected: 'modify_alert_list'
        };
        this.viewabilityConfig = {
            minimumViewTime: 500,
            viewAreaCoveragePercentThreshold: 1,
            waitForInteraction: true
        };
        this.handleViewableItemsChanged = this.handleViewableItemsChanged.bind(
            this
        );
        this.props.navigator.setOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
        );
        this.stateApp = new StateApp(
            this.handleWakupApp,
            null,
            ScreenId.ADD_ALERT,
            false
        );
    }
    handleViewableItemsChanged({ viewableItems, changed }) {
        // return
        // this.viewableItems = viewableItems
        // // const { viewableItems, changed } = this.viewableItems
        // if (!viewableItems || !this.dic.listRefData) return
        // changed && changed.map(el => {
        //     const alertID = el.key
        //     const refItem = this.dic.listRefData[alertID]
        //     if (refItem) {
        //         if (el.isViewable) {
        //             refItem.ref.isUnMount = true
        //             refItem && refItem.ref.refViewAni && refItem.ref.refViewAni.stopAnimation()
        //             refItem.ref.isUnMount = false
        //             if (!refItem.ref.animationShake) {
        //                 setTimeout(() => {
        //                     refItem && refItem.ref.handleAnimationShake && refItem.ref.handleAnimationShake('New')
        //                 }, 200);
        //             }
        //         } else {
        //             refItem.ref.isUnMount = true
        //             refItem.ref.animationShake = false
        //             refItem && refItem.ref.refViewAni && refItem.ref.refViewAni.stopAnimation()
        //             // refItem && refItem.ref.handleAnimationShake && refItem.ref.handleAnimationShake('New')
        //         }
        //     }
        // })
    }
    handleOnMomentumScrollEnd = () => {
        // return
        // console.log('DCM handleOnMomentumScrollEnd', this.viewableItems)
        // this.viewableItems && this.viewableItems.map(el => {
        //     const alertID = el.key
        //     const refItem = this.dic.listRefData[alertID]
        //     if (refItem) {
        //         if (el.isViewable) {
        //             refItem.ref.isUnMount = true
        //             refItem && refItem.ref.refViewAni.stopAnimation()
        //             refItem.ref.isUnMount = false
        //             if (!refItem.ref.animationShake) {
        //                 refItem && refItem.ref.handleAnimationShakeV2 && refItem.ref.handleAnimationShakeV2('New')
        //             }
        //         }
        //     }
        // })
        // const { viewableItems, changed } = this.viewableItems
        // viewableItems && viewableItems.map(el => {
        //     const alertID = el.key
        //     const refItem = this.dic.listRefData[alertID]
        //     console.log('DCM handleOnMomentumScrollEnd', this.viewableItems, refItem)
        //     if (refItem) {
        //         refItem && refItem.ref.handleAnimationShake && refItem.ref.handleAnimationShake('New')
        //     }
        // })
    };
    onScrollEndDrag = () => {
        // console.log('DCM handleOnMomentumScrollEnd', this.viewableItems)
        // this.viewableItems && this.viewableItems.map(el => {
        //     const alertID = el.key
        //     const refItem = this.dic.listRefData[alertID]
        //     if (refItem) {
        //         if (el.isViewable) {
        //             refItem.ref.isUnMount = true
        //             refItem && refItem.ref.refViewAni.stopAnimation()
        //             refItem.ref.isUnMount = false
        //             if (!refItem.ref.animationShake) {
        //                 refItem && refItem.ref.handleAnimationShakeV2 && refItem.ref.handleAnimationShakeV2('New')
        //             }
        //         }
        //     }
        // })
    };
    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            FunctionUtil.switchForm(this.props.navigator, event);
        } else if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'backPress':
                    return true;
            }
        } else {
            switch (event.id) {
                case 'hidden_edit_alert':
                    func.setCurrentScreenId(ScreenId.ADD_ALERT);
                    this.handleRefresh();
                    break;
                case 'willAppear':
                    break;
                case 'didAppear':
                    break;
                default:
                    break;
            }
        }
    }
    onShowDetail = () => {
        setTimeout(() => {
            this.setState({
                screenSelected: 'modify_detail'
            });
        }, 1000);
        Object.values(this.dic.listRefData).map((el) => {
            if (el && el.ref) {
                let ref = el.ref;
                ref.isUnMount = true;
                ref.refViewAni && ref.refViewAni.stopAnimation();
            }
            // el && el.ref && el.ref.stopAnimation()
        });
        // setTimeout(() => {
        //     this.setState({

        //     })
        // }, 100);
    };
    handleRefresh = () => {
        this.setState({
            screenSelected: 'modify_alert_list'
        });
        // const tmp = this.dic.data
        // // this.refViewContent && this.refViewContent.animate({
        // //     easing: 'linear',
        // //     0: {
        // //         opacity: 0
        // //     },
        // //     1: {
        // //         opacity: 0
        // //     }
        // // }, 1)
        // this.updateData([])
        // setTimeout(() => {
        //     this.updateData(tmp)
        // }, 0);
    };
    componentDidMount() {
        super.componentDidMount();
        this.addListenerRealtime();
        func.setCurrentScreenId(ScreenId.ADD_ALERT);
        // this.fadeIn()
    }
    handleWakupApp = this.handleWakupApp.bind(this);
    handleWakupApp() {
        // this.dic.isLoading = true
        // this.updateListAlerts([])
        // this.refLoading && this.refLoading.runAnimation({
        //     type: 'fadeIn'
        // }, () => {
        //     this.getSnapshotListAlerts()
        // })
        this.props.alertActions.setLoadingEditAlertList &&
            this.props.alertActions.setLoadingEditAlertList(true);
        setTimeout(() => {
            this.props.alertActions.setLoadingEditAlertList &&
                this.props.alertActions.setLoadingEditAlertList(false);
        }, 300);
        // this.refViewContent && this.refViewContent.animate({
        //     easing: 'linear',
        //     0: {
        //         opacity: 0
        //     },
        //     1: {
        //         opacity: 0
        //     }
        // }, 1)
        // this.refLoading && this.refLoading.runAnimation({
        //     type: 'fadeIn'
        // }, () => {
        //     setTimeout(() => {
        //         this.refLoading && this.refLoading.runAnimation({
        //             type: 'fadeOut'
        //         })
        //         this.refViewContent && this.refViewContent.animate({
        //             easing: 'linear',
        //             0: {
        //                 opacity: 0
        //             },
        //             1: {
        //                 opacity: 1
        //             }
        //         }, 300)
        //     }, 1000);
        // })
    }
    fadeIn = () => {
        Animated.timing(this.dic.opacityWrapper, {
            toValue: 1,
            useNativeDriver: true,
            duration: 300
        }).start();
    };
    fadeOut = (cb) => {
        this.refViewWrapper &&
            this.refViewWrapper.fadeOut(500).then(() => {
                cb && cb();
            });
        // Animated.timing(this.dic.opacityWrapper, {
        //     toValue: 0,
        //     useNativeDriver: true,
        //     duration: 300
        // }).start(() => {
        //     cb && cb()
        // })
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.isConnected !== this.state.isConnected) {
            this.setState({
                isConnected: nextProps.isConnected
            });
        }
    }

    addListenerRealtime() {
        const channel = Channel.getChannelRealtimeListAlerts();
        Emitter.addListener(channel, this.id, ({ data, method }) => {
            switch (method) {
                case 'INSERT':
                    return this.insertAlertRealtime({ data });
                case 'DELETE':
                    return this.deleteALertRealtime({ data });
                case 'UPDATE':
                    return this.updateAlertRealtime({ data });
                default:
                    return false;
            }
        });
    }

    insertAlertRealtime({ data }) {
        const newData = [data].concat(this.state.data);
        this.updateData(newData);
    }

    updateAlertRealtime({ data }) {
        let newData = this.state.data;
        this.state.data.map((item, index) => {
            const { alert_id: alertID } = item;
            const { alert_id: realtimeAlertID } = data;
            if (alertID === realtimeAlertID) {
                if (
                    data &&
                    data.alert_type === 'NEWS' &&
                    data.target &&
                    typeof data.target === 'string'
                ) {
                    data.target = data.target.split('#');
                }
                newData[index] = PureFunc.merge(newData[index], data, true);
            }
        });
        newData.sort(function (a, b) {
            if (a['updated'] > b['updated']) {
                return -1;
            }
            if (a['updated'] < b['updated']) {
                return 1;
            }
            return 0;
        });
        this.updateData(newData);
    }

    deleteALertRealtime({ data }) {
        const newData = this.state.data.filter((item) => {
            const { alert_id: alertID } = item;
            const { alert_id: realtimeAlertID } = data;
            return alertID !== realtimeAlertID;
        });
        if (newData.length === this.dic.data.length) return;
        this.updateData(newData);
    }

    updateScrollEnabled(scrollEnabled) {
        if (scrollEnabled !== this.scrollEnabled) {
            this.scrollEnabled = scrollEnabled;
            this.refFlatList &&
                this.refFlatList.setNativeProps({
                    scrollEnabled
                });
        }
    }

    registerAnimation(alertID, cbHide) {
        this.dic.dicAnimation[alertID] = cbHide;
    }

    hideAnimationOtherRow(alertID) {
        Object.keys(this.dic.dicAnimation).map((item) => {
            if (alertID !== item) {
                const cbHide = this.dic.dicAnimation[item];
                cbHide && cbHide(200);
                delete this.dic.dicAnimation[item];
            }
        });
    }

    moveToModifyAlert(alertObj) {
        this.props.navigator.showModal({
            overrideBackPress: true,
            screen: SCREEN.MODIFY_ALERT,
            title: I18n.t('modifyAlertUpper'),
            backButtonTitle: '',
            animated: true,
            animationType: 'none',
            passProps: {
                alertObj,
                handleOnClose: this.handleOnClose,
                navigatorEventIDParentsEditAlert: this.props.navigator
                    .navigatorEventID,
                navigatorEventIDParentsListAlert: this.props
                    .navigatorEventIDParents
            },
            navigatorStyle: {
                ...CommonStyle.navigatorSpecial,
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            }
        });
        this.props.alertActions.changeScreenActive &&
            this.props.alertActions.changeScreenActive(
                ALERT_SCREEN.DETAIL_MODIFY_ALERT
            );
    }
    getError(errorCode) {
        this.setState({
            errorCode: I18n.t(`${errorCode}`)
        });
    }
    onDeleteAlert(alertObj = {}) {
        const { alert_id: alertID } = alertObj;
        const url = Api.getApiDeleteAlert(alertID);

        Api.deleteData(url)
            .then((res) => {
                if (res) {
                    const { errorCode } = res;
                    if (errorCode === 'SUCCESS') {
                        const newData = this.state.data.filter((item) => {
                            return item.alert_id !== alertID;
                        });
                        this.updateData(newData);
                    } else {
                        this.getError(errorCode);
                    }
                } else {
                    console.log('onDeleteAlert RES IS NULL');
                }
            })
            .catch((err) => {
                console.log('onDeleteAlert EXCEPTION', err);
            });
    }

    updateData(data, isReRender = true) {
        // if (data) {
        //     data = data.slice(0, 2)
        // }
        Controller.setListAlerts(data);
        this.dic.preData = this.dic.data;
        this.dic.data = data;
        isReRender &&
            this.setState({
                data
            });
    }
    addRefRowAlert = this.addRefRowAlert.bind(this);
    addRefRowAlert({ ref, updated, alertID }) {
        if (ref === null) {
            delete this.dic.listRefData[alertID];
        } else {
            this.dic.listRefData[alertID] = { ref, updated };
        }
    }

    _renderRow(rowData, index) {
        return (
            <View key={rowData.alert_id}>
                <RowAlertConnected
                    onShowDetail={this.onShowDetail}
                    preData={this.dic.preData}
                    ref={(refW) => {
                        if (refW) {
                            const ref = refW;
                            this.addRefRowAlert({
                                ref,
                                updated: rowData.updated,
                                alertID: rowData.alert_id
                            });
                        }
                    }}
                    data={this.dic.data}
                    index={index}
                    key={index}
                    isConnected={this.props.isConnected}
                    registerAnimation={this.registerAnimation}
                    hideAnimationOtherRow={this.hideAnimationOtherRow}
                    updateScrollEnabled={this.updateScrollEnabled}
                    moveToModifyAlert={this.moveToModifyAlert}
                    onDeleteAlert={this.onDeleteAlert}
                    alertObj={rowData}
                />
            </View>
        );
    }
    clearError = () => {};
    renderNoData() {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Text
                    style={{
                        color: CommonStyle.fontColor,
                        fontSize: CommonStyle.fontSizeM,
                        fontFamily: CommonStyle.fontPoppinsRegular
                    }}
                >
                    {I18n.t('noData')}
                </Text>
            </View>
        );
    }

    renderNetworkWarning() {
        if (this.props.isConnected) return null;
        return <NetworkWarning />;
    }
    handleOnClose = (cb) => {
        this.fadeOut(cb);
        const navigatorEventID = this.props.navigatorEventIDParents;
        this.emitter &&
            this.emitter.emit(navigatorEventID, {
                id: 'hidden_edit_alert'
            });
    };
    setRefFlatList = (ref) => {
        this.refFlatList = ref;
    };
    renderHaveData = () => {
        if (this.state.screenSelected !== 'modify_alert_list') {
            return null;
        }
        return (
            <FlatList
                // windowSize={21}
                ref={this.setRefFlatList}
                indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
                // scrollEnabled={this.state.scrollEnabled}
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={this.handleViewableItemsChanged}
                viewabilityConfig={this.viewabilityConfig}
                removeClippedSubviews={true}
                // maxToRenderPerBatch={20}
                onScrollEndDrag={this.onScrollEndDrag}
                onMomentumScrollEnd={this.handleOnMomentumScrollEnd}
                // ItemSeparatorComponent={this.renderSeparator}
                // getItemLayout={(data, index) => (
                //     { length: ITEM_HEIGHT, offset: (ITEM_HEIGHT + 8) * index, index }
                // )}
                initialNumToRender={10}
                data={this.state.data}
                extraData={this.state}
                keyExtractor={(item, index) => item.alert_id}
                renderItem={({ item, index }) => this._renderRow(item, index)}
            />
        );
    };
    setRefRowLoading = (ref) => {
        this.refLoading = ref;
    };
    setRefViewContent = (ref) => {
        this.refViewContent = ref;
    };
    setRefViewWrapper = (ref) => {
        this.refViewWrapper = ref;
    };
    handleDoneAnimation = () => {
        this.updateData(Controller.getListAlerts());
        this.dic.isLoading = false;
    };
    renderSeparator = () => <ItemSeparator />;
    render() {
        const dataLength = this.state.data.length;
        return (
            <Animatable.View
                onAnimationEnd={this.handleDoneAnimation}
                useNativeDriver
                ref={this.setRefViewWrapper}
                duration={500}
                style={{
                    flex: 1,
                    backgroundColor: CommonStyle.backgroundColor1
                }}
                animation={'fadeIn'}
            >
                <FallHeader
                    ref={(ref) => ref && (this.headerRef = ref)}
                    style={{ backgroundColor: CommonStyle.backgroundColor1 }}
                    header={
                        <HeaderSpecial
                            onClose={this.handleOnClose}
                            screen={ALERT_SCREEN.MODIFY_ALERT}
                            navigator={this.props.navigator}
                        />
                    }
                >
                    <View style={{ marginBottom: 16, flex: 1 }}>
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                marginTop: 16
                            }}
                            pointerEvents="box-none"
                        >
                            <RowLoading
                                animation={{
                                    easing: 'linear',
                                    0: {
                                        opacity: 0
                                    },
                                    1: {
                                        opacity: 0
                                    }
                                }}
                                isShow={false}
                                type="edit_alert"
                                ref={this.setRefRowLoading}
                            />
                        </View>
                        <Animatable.View
                            useNativeDriver
                            ref={this.setRefViewContent}
                            style={{
                                flex: 1
                            }}
                        >
                            {this.renderHaveData()}
                            {this.dic.data.length <= 0 &&
                            !this.dic.isLoading ? (
                                <Animatable.View
                                    animation={'fadeIn'}
                                    duration={500}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text
                                        style={[
                                            CommonStyle.textNoData,
                                            {
                                                fontFamily:
                                                    CommonStyle.fontPoppinsRegular
                                            }
                                        ]}
                                    >
                                        {I18n.t('noData')}
                                    </Text>
                                </Animatable.View>
                            ) : null}
                        </Animatable.View>
                    </View>
                </FallHeader>
                {/* <NotifyOrder
                    type={'error'}
                    text={this.state.errorCode}
                    clearErrorFn={this.clearError}
                /> */}
                {/* <View style={{ marginVertical: 16, flex: 1 }}>
                    {
                        dataLength <= 0
                            ? this.renderNoData()
                            : <FlatList
                                indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
                                scrollEnabled={this.state.scrollEnabled}
                                showsVerticalScrollIndicator={true}
                                ItemSeparatorComponent={this.renderSeparator}
                                data={this.state.data}
                                extraData={this.state}
                                keyExtractor={(item, index) => item.alert_id}
                                renderItem={({ item, index }) => (
                                    this._renderRow(item, index)
                                )} />
                    }
                </View> */}
            </Animatable.View>
        );
    }
}

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    };
}
function mapDispatchToProps(dispatch) {
    return {
        alertActions: bindActionCreators(alertActions, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(AddAlert);
