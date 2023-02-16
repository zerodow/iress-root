import React, { Component } from 'react';
import _ from 'lodash';
import { Dimensions } from 'react-native';

import ScrollView, { styles } from './ScrollView';
import Animated from 'react-native-reanimated';
import { State, PanGestureHandler } from 'react-native-gesture-handler';
import {
    getSpaceTop,
    preAdditiveOffset,
    snapBounce,
    handleVelocity,
    snapTo2
} from './handleFunc';

const {
    cond,
    eq,
    neq,
    lessThan,
    and,
    sub,
    block,
    set,
    Value,
    or,
    call,
    event,
    interpolate,
    divide,
    Clock
} = Animated;

const STATE = {
    UNDETERMINED: 0,
    SHOW: 1,
    HIDE: 2,
    SNAP_TOP: 3
};

const { height: heightDevice } = Dimensions.get('window');

const HIDE_POS = heightDevice * 1.3;

export default class NestedScrollCustom extends Component {
    constructor(props) {
        super(props);
        this._showHideState = new Value(STATE.UNDETERMINED);
        this._translateY = new Value(heightDevice * 1.5);
        this._scrollY = new Value(0);
        this._childState = new Value(State.UNDETERMINED);

        // handle Pan
        this.gesture = { x: new Value(0), y: new Value(0) };
        this._panState = new Value(-1);
        this._velocityY = new Value(0);

        // gesture
        this.translationX = new Value(0);
        this.translationY = new Value(0);
        this.velocityY = new Value(0);
        this._state = new Value(0);

        this._onGestureEvent = event([
            {
                nativeEvent: {
                    translationX: this.translationX,
                    translationY: this.translationY,
                    velocityY: this.velocityY,
                    state: this._state
                }
            }
        ]);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !_.isEqual(this.props, nextProps) ||
            !_.isEqual(this.state, nextState)
        );
    }

    show = this.show.bind(this);
    show() {
        this._showHideState.setValue(STATE.SHOW);
    }

    hide = this.hide.bind(this);
    hide() {
        this._showHideState.setValue(STATE.HIDE);
    }

    snapToTop = this.snapToTop.bind(this);
    snapToTop() {
        // this._showHideState.setValue(STATE.SNAP_TOP);
    }

    withShowHide() {
        const finishState = new Value(0);
        const _panState = new Value(0);

        const defaultCallBack = [
            set(this._showHideState, STATE.UNDETERMINED),
            set(finishState, 0)
        ];
        const callback = (key) =>
            this.props[key] ? call([], () => this.props[key]()) : [];

        const handlePanState = block([
            cond(
                eq(this._panState, State.UNDETERMINED),
                set(_panState, State.END),
                set(_panState, this._panState)
            ),
            _panState
        ]);

        return [
            cond(eq(this._showHideState, STATE.SHOW), [
                set(
                    finishState,
                    snapBounce(this._translateY, new Value(1), handlePanState, {
                        minPos: new Value(0),
                        maxPos: new Value(-1)
                    })
                ),
                cond(finishState, [
                    ...defaultCallBack,
                    callback('showCallback'),
                    set(this._showHideState, STATE.SNAP_TOP)
                ])
            ]),
            cond(eq(this._showHideState, STATE.HIDE), [
                set(
                    finishState,
                    snapBounce(this._translateY, new Value(1), handlePanState, {
                        minPos: new Value(HIDE_POS + 1),
                        maxPos: new Value(HIDE_POS)
                    })
                ),
                cond(finishState, [
                    ...defaultCallBack,
                    set(this._scrollY, 0), //  reset translateY scroll to 0
                    callback('hideCallback')
                ])
            ]),

            cond(eq(this._showHideState, STATE.SNAP_TOP), [
                // set(this._scrollY, 0),
                // ...defaultCallBack
                set(finishState, snapTo2(0, this._scrollY)),
                cond(finishState, [...defaultCallBack])
            ])
        ];
    }

    withSnapContainer() {
        const spaceTop = getSpaceTop(this.props);
        const middle = sub(divide(heightDevice, 2), spaceTop);
        const preState = new Value(State.UNDETERMINED);
        const callback = (key) => this.props[key] ? call([], () => this.props[key]()) : [];
        return [
            cond(
                and(
                    or(eq(preState, State.ACTIVE), eq(preState, State.BEGAN)),
                    eq(this._panState, State.END)
                ),
                [
                    cond(
                        and(
                            lessThan(this._velocityY, 700),
                            lessThan(this._translateY, middle)
                        ),
                        // snap to top = show
                        set(this._showHideState, STATE.SHOW),
                        // snap to End = hide
                        [
                            set(this._showHideState, STATE.HIDE),
                            callback('beginHideCallback')
                        ]
                    )
                ]
            ),
            set(preState, this._panState)
        ];
    }

    withMapGesture() {
        return cond(neq(this._childState, State.ACTIVE), [
            set(this.gesture.x, this.translationX),
            set(this.gesture.y, this.translationY),
            set(this._velocityY, this.velocityY),
            cond(
                // fix android multi touch. Khi panel dang lo lung touch vao header ma ko di chuyen tha ra panel ko di chuyen. Phai them dk check Begin va dieu kien khi set preState thanh END :fix bug EM5689
                or(
                    eq(this._state, State.CANCELLED),
                    eq(this._state, State.END)
                ),
                set(this._panState, State.END),
                set(this._panState, this._state)
            )
        ]);
    }

    render() {
        const {
            renderHeaderPanner,
            children,
            renderUnderGroundView,
            renderFooter = () => null
        } = this.props;
        const headerPanner = (
            <Animated.View>{renderHeaderPanner()}</Animated.View>
        );

        const spaceTop = getSpaceTop(this.props);

        const translateY = interpolate(this._translateY, {
            inputRange: [-1, 0, 1],
            outputRange: [0, 0, 1]
        });

        let mapValue = [];
        if (this.props._scrollContainer) {
            mapValue = set(this.props._scrollContainer, this._translateY);
        }

        return (
            <Animated.View
                pointerEvents="box-none"
                style={[
                    styles.container,
                    {
                        top: spaceTop,
                        transform: [{ translateY }]
                    }
                ]}
            >
                <Animated.Code exec={this.withMapGesture()} />
                <Animated.Code
                    exec={block([
                        set(
                            this._velocityY,
                            handleVelocity(this._panState, this._velocityY)
                        ),
                        cond(
                            or(
                                eq(this._panState, State.BEGAN),
                                eq(this._panState, State.ACTIVE)
                            ),
                            preAdditiveOffset(
                                this.gesture.y,
                                this._panState,
                                this._translateY
                            )
                        ),
                        this.withSnapContainer(),
                        ...this.withShowHide(),
                        mapValue
                    ])}
                />
                <PanGestureHandler
                    minDist={10}
                    enabled={this.props.dragEnabled}
                    onGestureEvent={this._onGestureEvent}
                    onHandlerStateChange={this._onGestureEvent}
                >
                    {headerPanner}
                </PanGestureHandler>
                {renderUnderGroundView || null}
                <Animated.View
                    pointerEvents="box-none"
                    style={{ flex: 1, zIndex: -9 }}
                >
                    <ScrollView
                        refVerticalScroll={this.props.refVerticalScroll}
                        parentTrans={this._translateY}
                        parentState={this._state}
                        _state={this._childState}
                        _onGestureEvent={{
                            translationX: this.gesture.x,
                            translationY: this.gesture.y,
                            velocityY: this._velocityY,
                            _panState: this._panState
                        }}
                        _initTrans={this._scrollY}
                        _scrollValue={this.props._scrollValue}
                    >
                        {children}
                    </ScrollView>
                </Animated.View>

                {renderFooter()}
            </Animated.View>
        );
    }
}

NestedScrollCustom.defaultProps = {
    renderHeaderPanner: () => null
};
