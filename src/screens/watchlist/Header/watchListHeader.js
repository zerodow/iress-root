import React, { PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Platform
} from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';

import * as RoleUser from '~/roleUser';
import * as Controller from '~/memory/controller';
import { renderTime } from '~/lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import I18n from '~/modules/language';
import SCREEN from '../screenEnum';
import Enum from '~/enum';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'

import FirstSubHeader from '../Component/FirstSubHeader';
import * as ANIMATION_DEFINITIONS from '../Animator/definitions';

import SubHeader, { ConnectComp, DelayWarning } from '../Component/SubHeader';

import Icon2 from '../Component/Icon2';

import ChangeNameComp from './ChangeNameComp';

const {
    Clock,
    Value,
    block,
    call,
    clockRunning,
    cond,
    greaterThan,
    lessThan,
    set,
    startClock,
    stopClock,
    timing,
    sub,
    add,
    eq,
    min
} = Animated;

export class ListHeader extends PureComponent {
    render() {
        const isPriceStreaming = Controller.isPriceStreaming();
        const { infoSelected } = this.props;
        let chgTitle = I18n.t('chgUpper');
        if (infoSelected === 'changePercent') {
            chgTitle = I18n.t('overviewChgP');
        }
        if (infoSelected === 'quantity') {
            chgTitle = I18n.t('quantityUpper');
        }

        return (
            <View
                style={[
                    styles.headerContainer,
                    isPriceStreaming ? { paddingTop: 0 } : {}
                ]}
            >
                <View style={styles.headerContent}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerText1}>
                                {I18n.t('code')}
                            </Text>

                            <Text style={styles.headerText2}>
                                {I18n.t('securityUpper')}
                            </Text>
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.headerText3}>
                                {I18n.t('price')}
                            </Text>

                            <Text style={styles.headerText4}>{chgTitle}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 8 }} />
            </View>
        );
    }
}

export default class WatchListHeader extends PureComponent {
    state = {
        isScrollToEnd: true, //  scroll to end = true
        timeUpdated: new Date()
    };

    preValue = new Value(0);
    dicUpperAni = new Value(0);
    isAnimating = false;

    setListener = this.setListener.bind(this);
    setListener() {
        const { _scrollValue } = this.props;

        return block([
            cond(
                greaterThan(_scrollValue, this.preValue),
                call([], () => this.changeScrollState(true))
            ),
            cond(
                lessThan(_scrollValue, this.preValue),
                block([
                    set(this.dicUpperAni, _scrollValue),
                    call([], () => this.changeScrollState(false)) // scroll to End
                ])
            ),
            set(this.preValue, _scrollValue)
        ]);
    }

    changeScrollState(isScrollToEnd) {
        if (isScrollToEnd !== this.state.isScrollToEnd) {
            // if (isScrollToEnd) {
            //     set(this.dicUpperAni, this.props._scrollValue)
            // }
            setTimeout(() => {
                this.setState({
                    isScrollToEnd
                });
            }, 100);
        }
    }

    updateTime = this.updateTime.bind(this);
    updateTime() {
        this.setState({
            timeUpdated: new Date()
        });
    }

    renderTimeUpdated() {
        const isStreamer = Controller.isPriceStreaming();
        if (isStreamer) return <View style={{ height: 0 }} />;

        const formatTime = 'HH:mm:ss';
        const time = renderTime(this.state.timeUpdated, formatTime);
        const str = `${I18n.t('lastUpdated')} ${time} - ${I18n.t(
            'pullToRefresh'
        )}`;
        return (
            <View style={{ paddingVertical: 8, paddingLeft: 32 }}>
                <Text style={CommonStyle.timeUpdated}>{str}</Text>
            </View>
        );
    }

    onPressEdit = this.onPressEdit.bind(this);
    onPressEdit() {
        this.props.setScreenActive(SCREEN.EDIT_WATCHLIST);
    }

    onPressEditName = this.onPressEditName.bind(this);
    onPressEditName() {
        const { showModal, closeModal } = this.props;

        showModal(() => <ChangeNameComp onCancel={closeModal} />);
    }

    renderEditIcon() {
        const isLogin = Controller.getLoginStatus();
        const { iressTag: isIress, isFavorites } = this.props;
        const hadRole = RoleUser.checkRoleByKey(
            Enum.ROLE_DETAIL.C_E_R_WATCHLIST
        );

        if (isLogin && !isIress && hadRole && !isFavorites && this.props.subTitle) {
            return (
                <Icon2
                    style={{
                        paddingLeft: 8,
                        alignSelf: 'center'
                    }}
                    name="sourceFilter"
                    size={14}
                    color={CommonStyle.colorProduct}
                />
            );
        }
        return null;
    }

    renderSubTitle() {
        const isLogin = Controller.getLoginStatus();
        const { iressTag: isIress, isFavorites } = this.props;
        const hadRole = RoleUser.checkRoleByKey(
            Enum.ROLE_DETAIL.C_E_R_WATCHLIST
        );

        const disabled = !(isLogin && !isIress && hadRole && !isFavorites && this.props.subTitle)
        return (
            <FirstSubHeader>
                <TouchableOpacityOpt
                    onPress={this.onPressEditName}
                    disabled={disabled}
                    style={{
                        flexDirection: 'row',
                        paddingBottom: 12,
                        paddingTop: 4,
                        paddingRight: 16,
                        alignSelf: 'baseline'
                    }}
                >
                    <View style={{ width: 36 }} />
                    <Text style={styles.subTitle} numberOfLines={1}>
                        {this.props.subTitle}
                    </Text>
                    {this.renderEditIcon()}
                </TouchableOpacityOpt>
            </FirstSubHeader>
        );
    }

    runTiming() {
        let startValue = new Value(-200);

        const endValue = 0;
        const clock = new Clock();
        const state = {
            finished: new Value(0),
            position: startValue,
            time: new Value(0),
            frameTime: new Value(0)
        };

        const config = {
            duration: ANIMATION_DEFINITIONS.DURATION,
            toValue: new Value(endValue),
            easing: Easing.linear
        };

        return block([
            cond(
                clockRunning(clock),
                [
                    // if the clock is already running we update the toValue, in case a new dest has been passed in
                    set(config.toValue, endValue)
                ],
                [
                    // if the clock isn't running we reset all the animation params and start the clock
                    set(state.finished, 0),
                    set(state.time, 0),
                    set(state.position, startValue),
                    set(state.frameTime, 0),
                    set(config.toValue, endValue),
                    startClock(clock)
                ]
            ),
            // we run the step here that is going to update position
            timing(clock, state, config),
            // if the animation is over we stop the clock
            cond(state.finished, stopClock(clock)),
            // we made the block return the updated position
            state.position
        ]);
    }

    renderSub(content, bgAni, zIndex) {
        let translateY = 0;
        const { _value, _scrollValue, itemDuration } = this.props;
        if (_value) {
            translateY = Animated.interpolate(_value, {
                inputRange: [-1, 0, itemDuration, itemDuration + 1],
                outputRange: [-50, -50, 0, 0]
            });
        }
        let translateY2 = 0;
        if (_scrollValue) {
            translateY2 = Animated.interpolate(_scrollValue, {
                inputRange: [-1, 0, 1],
                outputRange: [1, 0, 0]
            });
        }

        return (
            <SubHeader
                style={{
                    transform: [{ translateY: translateY2 }]
                }}
                zIndex={zIndex}
                aniProps={{
                    style: {
                        transform: [{ translateY }]
                    }
                }}
                bgAni={[
                    {
                        transform: [{ translateY: translateY2 }]
                    },
                    bgAni
                ]}
            >
                {content}
            </SubHeader>
        );
    }

    renderSecondSub(zIndex) {
        let refreshController = null;
        const isStreamer = Controller.isPriceStreaming();

        const { _scrollValue } = this.props;
        let translateY3 = 0;
        if (_scrollValue) {
            translateY3 = Animated.interpolate(_scrollValue, {
                inputRange: [-1, 0, 1],
                outputRange: [-0.2, 0, 0]
            });
        }

        if (!isStreamer && Platform.OS === 'ios') {
            refreshController = (
                <Animated.View
                    style={{
                        position: 'absolute',
                        width: '100%',
                        bottom: 50,
                        transform: [{ translateY: translateY3 }]
                    }}
                >
                    <ActivityIndicator />
                </Animated.View>
            );
        }

        return this.renderSub(
            [refreshController, this.renderTimeUpdated()],
            {},
            zIndex
        );
    }

    renderThirdSub(zIndex) {
        const isLogin = Controller.getLoginStatus();
        if (isLogin) return <View />;

        return this.renderSub(
            <DelayWarning />,
            {
                backgroundColor: 'rgb(247, 220, 21)'
            },
            zIndex
        );
    }

    renderConnectSub(zIndex) {
        if (this.props.isConnected) return <View />;

        return this.renderSub(
            <ConnectComp />,
            {
                backgroundColor: CommonStyle.color.network
            },
            zIndex
        );
    }

    render() {
        return (
            <View
                style={{
                    position: 'absolute',
                    zIndex: 9,
                    width: '100%',
                    top: 0,
                    left: 0
                }}
                onLayout={this.props.onLayout}
            >
                <Animated.View
                    style={{
                        zIndex: 9
                        // transform: [{ translateY: _scrollValue || 0 }]
                    }}
                >
                    {/* {this.renderSubTitle()} */}

                    {this.renderThirdSub(-9)}

                    {this.renderConnectSub(-10)}

                    {this.renderSecondSub(-11)}
                </Animated.View>
            </View>
        );
    }
}

const styles = {};
function getNewestStyle() {
    const newStyle = StyleSheet.create({
        headerText4: {
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontTiny,
            opacity: 0.54,
            color: CommonStyle.fontColor
        },
        headerText3: {
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeXS,
            opacity: 0.7,
            color: CommonStyle.fontColor
        },
        headerText2: {
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontTiny,
            opacity: 0.54,
            color: CommonStyle.fontColor
        },
        headerText1: {
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeXS,
            opacity: 0.7,
            color: CommonStyle.fontColor
        },
        headerContent: {
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor3
        },
        headerContainer: { paddingTop: 8, paddingHorizontal: 16 },
        defaultHeader: {
            height: '100%',
            marginHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center'
        },
        subTitle: {
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeL,
            color: CommonStyle.navigatorSpecial.navBarSubtitleColor
        },
        timeUpdated: {
            fontFamily: CommonStyle.fontPoppinsItalic,
            fontSize: CommonStyle.fontMin,
            color: CommonStyle.navigatorSpecial.navBarSubtitleColor,
            opacity: 0.3
        }
    });

    PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
