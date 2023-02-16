import React, { PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Platform
} from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';

import * as Controller from '~/memory/controller';
import { renderTime, isIphoneXorAbove, getMarginTopDevice } from '~/lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import I18n from '~/modules/language';
import { connect } from 'react-redux';
import Icon from '~/component/icon/icon'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';

import FirstSubHeader from '~s/watchlist/Component/FirstSubHeader';
import SecondSubHeader, { keyAnimator } from '~s/watchlist/Component/SecondSubHeader';
import * as ANIMATION_DEFINITIONS from '~s/watchlist/Animator/definitions';

import SubHeader, { ConnectComp, DelayWarning } from '~s/watchlist/Component/SubHeader';
import { useShadow } from '~/component/shadow/SvgShadow'
import { STATE } from '~s/watchlist/Animator/FLatListAni';

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

const IconComp = ({ sharePdf, backToListNew, isDisableShareNew }) => {
    const [Shadow, onLayout] = useShadow()
    return <View>
        <Shadow />
        <View
            onLayout={onLayout}
            style={{
                width: '100%',
                paddingHorizontal: 16,
                paddingTop: 24,
                paddingBottom: 8,
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}>
            <TouchableOpacityOpt onPress={backToListNew} timeDelay={1000} >
                <MaterialCommunityIcons
                    size={27}
                    color={CommonStyle.fontColor}
                    name={'chevron-left-circle-outline'} />
            </TouchableOpacityOpt>
            <Icon
                isDisable={isDisableShareNew}
                onPress={sharePdf}
                useCustomIcon={true}
                name={'equix_share'} />
        </View>
    </View>
}

export default class HeaderNav extends PureComponent {
    state = {
        isDisableShareNew: true,
        isScrollToEnd: true, //  scroll to end = true
        timeUpdated: new Date()
    };

    preValue = new Value(0);
    dicUpperAni = new Value(0);
    isAnimating = false;

    updateDisableShareNew = this.updateDisableShareNew.bind(this)
    updateDisableShareNew(isDisableShareNew) {
        this.setState({
            isDisableShareNew
        })
    }

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

    onLayout = this.onLayout.bind(this)
    onLayout(event) {
        this.props.onLayout && this.props.onLayout(event)
    }

    changeScrollState(isScrollToEnd) {
        if (isScrollToEnd !== this.state.isScrollToEnd) {
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

    renderLineBottom() {
        return <View style={{ height: 4 }} />
    }

    renderTimeUpdated() {
        const isStreamer = Controller.isPriceStreaming();
        if (isStreamer) return <View style={{ height: 0 }} />;

        const formatTime = 'HH:mm:ss'
        const time = renderTime(this.state.timeUpdated, formatTime)
        const str = `${I18n.t('lastUpdated')} ${time} - ${I18n.t('pullToRefresh')}`;
        return (
            <View style={{ paddingVertical: 8, paddingLeft: 32 }}>
                <Text style={CommonStyle.timeUpdated}>{str}</Text>
            </View>
        );
    }

    renderSubTitle() {
        const { sharePdf, backToListNew } = this.props
        const { isDisableShareNew } = this.state
        return (
            <FirstSubHeader style={{ paddingRight: 0 }}>
                <View
                    style={{
                        backgroundColor: CommonStyle.color.dark,
                        width: '100%'
                    }}>
                    <View style={{ height: isIphoneXorAbove() ? 24 : 0 }} />
                    <IconComp
                        sharePdf={sharePdf}
                        backToListNew={backToListNew}
                        isDisableShareNew={isDisableShareNew} />
                    <View style={{ height: 5 }} />
                </View>
            </FirstSubHeader >
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
        // const isStreamer = Controller.isPriceStreaming();

        const { _scrollValue } = this.props;
        let translateY3 = 0;
        if (_scrollValue) {
            translateY3 = Animated.interpolate(_scrollValue, {
                inputRange: [-1, 0, 1],
                outputRange: [-0.2, 0, 0]
            });
        }

        // if (!isStreamer && Platform.OS === 'ios') {
        //     refreshController = (
        //         <Animated.View
        //             style={{
        //                 position: 'absolute',
        //                 width: '100%',
        //                 bottom: 50,
        //                 transform: [{ translateY: translateY3 }]
        //             }}
        //         >
        //             <ActivityIndicator />
        //         </Animated.View>
        //     );
        // }

        return this.renderSub(
            [refreshController, this.renderLineBottom()],
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
                onLayout={this.onLayout}
            >
                <Animated.View
                    style={{
                        zIndex: 9,
                        overflow: 'hidden'
                    }}
                >
                    {this.renderSubTitle()}

                    {this.renderThirdSub(-9)}

                    {this.renderConnectSub(-10)}

                    {/* {this.renderSecondSub(-11)} */}
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
