import React, { Component, useRef, useCallback } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions, Platform, Keyboard } from 'react-native';
import PropTypes from 'prop-types'
import {
    PanGestureHandler,
    NativeViewGestureHandler,
    State,
    TapGestureHandler
} from 'react-native-gesture-handler';
import CommonStyle from '~/theme/theme_controller'
import { getMarginTopDevice } from '~/lib/base/functionUtil'

let marginTop = getMarginTopDevice();
const HEADER_HEIGHT = 24;
export const HEADER_PANEL_HEIGHT = marginTop + 30
const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window');
const SNAP_POINTS_FROM_TOP = [HEADER_PANEL_HEIGHT, HEIGHT_DEVICE];
export const useRefBottomSheet = () => {
    const refBottomSheet = useRef()
    const show = useCallback(() => {
        refBottomSheet.current && refBottomSheet.current.show()
    }, [])
    const hide = useCallback(() => {
        refBottomSheet.current && refBottomSheet.current.hide()
    }, [])
    return { refBottomSheet, show, hide }
}
export default class BottomSheet extends Component {
    masterdrawer = React.createRef();
    drawer = React.createRef();
    drawerheader = React.createRef();
    scroll = React.createRef();
    constructor(props) {
        super(props);
        const START = SNAP_POINTS_FROM_TOP[0];
        const END = SNAP_POINTS_FROM_TOP[SNAP_POINTS_FROM_TOP.length - 1];

        this.state = {
            lastSnap: START
        };
        this.lastSnap = START

        this.translateYAnim = new Animated.Value(HEIGHT_DEVICE);
        this._scrollValue = this.props.scrollValue || new Animated.Value(0);
        this._lastScrollYValue = 0;
        this._lastScrollY = new Animated.Value(0);
        this._onRegisterLastScroll = Animated.event(
            [{ nativeEvent: { contentOffset: { y: this._lastScrollY } } }],
            { useNativeDriver: true }
        );
        this._lastScrollY.addListener(({ value }) => {
            this._lastScrollYValue = value;
        });

        this._dragY = new Animated.Value(0);
        this._onGestureEvent = Animated.event(
            [{ nativeEvent: { translationY: this._dragY } }],
            { useNativeDriver: true }
        );

        this._reverseLastScrollY = Animated.multiply(
            new Animated.Value(-1),
            this._lastScrollY
        );

        this._translateYOffset = new Animated.Value(HEIGHT_DEVICE);
        // this._dragY.addListener(({ value }) => {
        //     console.info('DCM dragY', value)
        // })
        // this._translateYOffset.addListener(({ value }) => {
        //     console.info('DCM _translateYOffset', value)
        // })
        // this._reverseLastScrollY.addListener(({ value }) => {
        //     console.info('DCM _reverseLastScrollY', value)
        // })
        this._translateY = Animated.add(
            this._translateYOffset,
            Animated.add(this._dragY, this._reverseLastScrollY)
        ).interpolate({
            inputRange: [START, END],
            outputRange: [START, END],
            extrapolate: 'clamp'
        });
        this.props.regisAnim && this.props.regisAnim(this._scrollValue)
    }
    _onHeaderHandlerStateChange = ({ nativeEvent }) => {
        if (nativeEvent.oldState === State.BEGAN) {
            this._lastScrollY.setValue(0);
        }
        this._onHandlerStateChange({ nativeEvent });
    };
    _onHandlerStateChange = ({ nativeEvent }) => {
        Keyboard.dismiss()
        if (nativeEvent.oldState === State.ACTIVE) {
            let { velocityY, translationY } = nativeEvent;
            translationY -= this._lastScrollYValue;
            const dragToss = 0.05;
            const endOffsetY =
                this.lastSnap + translationY + dragToss * velocityY;

            let destSnapPoint = SNAP_POINTS_FROM_TOP[0];
            const endSnapPoint = SNAP_POINTS_FROM_TOP[SNAP_POINTS_FROM_TOP.length - 1]
            if (Math.abs(HEIGHT_DEVICE - endOffsetY) < Math.abs(0 - endOffsetY) && (this._lastScrollYValue < 1)) {
                destSnapPoint = endSnapPoint
            }
            this.lastSnap = destSnapPoint
            if (destSnapPoint === endSnapPoint) {
                this.props.onClose && this.props.onClose()
                this.hide()
            } else {
                // this.setState({ lastSnap: destSnapPoint });
                this._translateYOffset.extractOffset();
                this._translateYOffset.setValue(translationY);
                this._translateYOffset.flattenOffset();
                this._dragY.setValue(0);
                Animated.spring(this._translateYOffset, {
                    velocity: velocityY,
                    tension: 68,
                    friction: 12,
                    toValue: destSnapPoint,
                    useNativeDriver: true
                }).start();
            }
        }
    };

    show = this.show.bind(this)
    show(cb) {
        Animated.parallel([
            Animated.timing(this.translateYAnim, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true
            }),
            Animated.timing(this._translateYOffset, {
                toValue: SNAP_POINTS_FROM_TOP[0],
                duration: 350,
                useNativeDriver: true
            })
        ]).start(() => {
            this.props.onShowDone && this.props.onShowDone()
        })
    }

    hide = this.hide.bind(this)
    hide() {
        Animated.parallel([
            Animated.timing(this.translateYAnim, {
                toValue: HEIGHT_DEVICE,
                duration: 350,
                useNativeDriver: true
            }),
            Animated.timing(this._translateYOffset, {
                toValue: SNAP_POINTS_FROM_TOP[SNAP_POINTS_FROM_TOP.length - 1],
                duration: 350,
                useNativeDriver: true
            })
        ]).start(() => {
            this._translateYOffset.setValue(HEIGHT_DEVICE)
            this._dragY.setValue(0)
            this._lastScrollY.setValue(0)
            this.props.onHideDone && this.props.onHideDone()
        })
    }

    render() {
        opacity = this._translateY.interpolate({
            inputRange: [-HEIGHT_DEVICE, 0, HEIGHT_DEVICE / 2, HEIGHT_DEVICE],
            outputRange: [0.85, 0.85, 0.1, 0]
        });
        return (
            <React.Fragment>
                <Animated.View pointerEvents="none" style={{
                    ...StyleSheet.absoluteFillObject,
                    opacity,
                    zIndex: 90,
                    backgroundColor: CommonStyle.backgroundColor
                }} />
                <Animated.View
                    style={{
                        flex: 1,
                        width: WIDTH_DEVICE,
                        zIndex: 9999,
                        transform: [
                            { translateY: this.translateYAnim }
                        ]
                    }}>
                    <View style={{ height: HEADER_PANEL_HEIGHT, bachgroundColor: 'transparent' }} />
                    <TapGestureHandler
                        numberOfPointers={1}
                        maxDurationMs={100000}
                        ref={this.masterdrawer}
                        maxDeltaY={this.lastSnap - SNAP_POINTS_FROM_TOP[0]}>
                        <Animated.View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
                            <Animated.View
                                style={[
                                    StyleSheet.absoluteFillObject,
                                    {
                                        zIndex: 98,
                                        transform: [{ translateY: this._translateY }]
                                    },
                                    this.props.styleContent
                                ]}>
                                <PanGestureHandler
                                    ref={this.drawerheader}
                                    simultaneousHandlers={[this.scroll, this.masterdrawer]}
                                    shouldCancelWhenOutside={false}
                                    onGestureEvent={this._onGestureEvent}
                                    onHandlerStateChange={this._onHeaderHandlerStateChange}
                                >
                                    <Animated.View>
                                        {
                                            this.props.renderHeader && this.props.renderHeader()
                                        }
                                    </Animated.View>
                                </PanGestureHandler>
                                <Animated.View style={{
                                    flex: 1
                                }}>
                                    {
                                        this.props.renderLoading && this.props.renderLoading()
                                    }
                                    {
                                        !this.props.isLoading && (
                                            <PanGestureHandler
                                                ref={this.drawer}
                                                simultaneousHandlers={[this.scroll, this.masterdrawer]}
                                                shouldCancelWhenOutside={false}
                                                onGestureEvent={this._onGestureEvent}
                                                onHandlerStateChange={this._onHandlerStateChange}>
                                                <Animated.View style={styles.container}>
                                                    {/* {this.props.header} */}
                                                    <NativeViewGestureHandler
                                                        ref={this.scroll}
                                                        waitFor={this.masterdrawer}
                                                        simultaneousHandlers={this.drawer}>
                                                        <Animated.FlatList
                                                            keyboardShouldPersistTaps={'always'}
                                                            onScrollBeginDrag={this._onRegisterLastScroll}
                                                            // stickyHeaderIndices={[0]}
                                                            contentContainerStyle={{
                                                                paddingHorizontal: 8,
                                                                paddingBottom: 100,
                                                                flexGrow: 1,
                                                                justifyContent: this.props.data && this.props.data.length > 0 ? 'flex-start' : 'center'
                                                            }}
                                                            scrollEventThrottle={1}
                                                            ListFooterComponent={<View style={{
                                                                height: 16
                                                            }} />}
                                                            ListEmptyComponent={<Text style={[CommonStyle.textNoData, { alignSelf: 'center' }]}>No Data</Text>}
                                                            bounces={false}
                                                            onScroll={Animated.event(
                                                                [{
                                                                    nativeEvent: {
                                                                        contentOffset: { y: this._scrollValue }
                                                                    }
                                                                }],
                                                                {
                                                                    useNativeDriver: true
                                                                }
                                                            )}
                                                            renderItem={this.props.renderItem}
                                                            data={this.props.data}
                                                        />
                                                    </NativeViewGestureHandler>
                                                </Animated.View>
                                            </PanGestureHandler>
                                        )
                                    }
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                    </TapGestureHandler>
                </Animated.View>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        zIndex: 99999
    },
    header: {
        height: HEADER_HEIGHT,
        justifyContent: 'center',
        backgroundColor: 'transparent'
    }
});
BottomSheet.propTypes = {
    renderHeader: PropTypes.func,
    renderLoading: PropTypes.func,
    renderItem: PropTypes.func,
    onShowDone: PropTypes.func,
    data: PropTypes.array
};
