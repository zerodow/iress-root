import React, { Component } from 'react';
import { StyleSheet, Keyboard } from 'react-native';
import _ from 'lodash';
import {
    PanGestureHandler,
    State,
    TapGestureHandler
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import {
    preAdditiveOffset,
    decaying,
    snapBounce,
    handleVelocity
} from './handleFunc';

const {
    add,
    cond,
    eq,
    neq,
    event,
    block,
    multiply,
    set,
    Value,
    sub,
    greaterThan,
    lessThan,
    and,
    not,
    call
} = Animated;

export default class ScrollView extends Component {
    constructor(props) {
        super(props);
        this.snapPoint = [];
        this._translateY =
            props._initTrans || new Value(this.props.snapPoint[0] || 0);

        // handle layout
        this._heightContent = new Value(0);
        this._heightContainer = new Value(0);

        // handle Pan
        this.gesture = { x: new Value(0), y: new Value(0) };
        this._panState = new Value(-1);
        this._velocityY = new Value(0);

        // handle Tap
        this._tapState = new Value(0);
        this.handleTap = event([{ nativeEvent: { state: this._tapState } }]);

        this._onGestureEvent = this.createGestureEvent(props);
        // defind default value
        this._decayFinished = new Value(0);
        this._timingFinished = new Value(0);

        this.handleWrapPoint();

        if (props.setRef) {
            props.setRef(this);
        }
    }

    onContainerLayout = this.onContainerLayout.bind(this);
    onContainerLayout({
        nativeEvent: {
            layout: { height }
        }
    }) {
        this._heightContainer.setValue(height);
    }

    onLayoutContent = this.onLayoutContent.bind(this);
    onLayoutContent({
        nativeEvent: {
            layout: { height }
        }
    }) {
        this._heightContent.setValue(height);
    }

    mapProps() {
        if (this.dicEvent) {
            const {
                translationX,
                translationY,
                velocityY,
                state
            } = this.dicEvent;

            const {
                parentTrans,
                parentState = new Value(State.UNDETERMINED)
            } = this.props;

            const {
                translationX: propTransX,
                translationY: propTransY,
                velocityY: propVelocityY,
                _panState: propPanState
            } = this.props._onGestureEvent;

            const _isMapToParent = new Value(0);
            const preState = new Value(State.UNDETERMINED);
            const mapToParent = block([
                cond(
                    and(eq(state, State.END), eq(preState, State.ACTIVE)),
                    set(propPanState, State.END)
                ),
                cond(
                    and(
                        eq(state, State.ACTIVE),
                        lessThan(velocityY, 0),
                        lessThan(parentTrans, 0),
                        _isMapToParent
                    ),
                    [set(_isMapToParent, 0), set(parentTrans, 0)]
                ),
                cond(
                    and(
                        eq(state, State.ACTIVE),
                        greaterThan(velocityY, 0),
                        greaterThan(this._translateY, 0),
                        not(_isMapToParent)
                    ),
                    [set(_isMapToParent, 1), set(this._translateY, 0)]
                ),
                set(preState, state),
                _isMapToParent
            ]);

            const curState = new Value(State.UNDETERMINED);
            const mapState = block([
                cond(
                    eq(state, State.CANCELLED),
                    set(curState, State.END),
                    set(curState, state)
                ),
                curState
            ]);

            const offset = new Value(0);
            const offset1 = new Value(0);

            return cond(neq(parentState, State.ACTIVE), [
                set(velocityY, handleVelocity(state, velocityY)),
                cond(
                    mapToParent,
                    [
                        set(offset, sub(translationY, offset1)),
                        set(propTransX, translationX),
                        set(propTransY, offset),
                        set(propVelocityY, velocityY),
                        set(propPanState, mapState)
                    ],
                    [
                        set(offset1, sub(translationY, offset)),
                        set(this.gesture.x, translationX),
                        set(this.gesture.y, offset1),
                        set(this._velocityY, velocityY),
                        set(this._panState, mapState)
                    ]
                )
            ]);
        }
    }

    createGestureEvent(props) {
        if (!props._onGestureEvent) {
            return event([
                {
                    nativeEvent: {
                        translationX: this.gesture.x,
                        translationY: this.gesture.y,
                        velocityY: this._velocityY,
                        state: (state) =>
                            cond(
                                eq(state, State.CANCELLED),
                                set(this._panState, State.END),
                                set(this._panState, state)
                            )
                    }
                }
            ]);
        }

        const translationX = new Value(0);
        const translationY = new Value(0);
        const velocityY = new Value(0);
        const state = new Value(0);

        this.dicEvent = {
            translationX,
            translationY,
            velocityY,
            state
        };

        return event([
            {
                nativeEvent: {
                    translationX,
                    translationY,
                    velocityY,
                    state
                }
            }
        ]);
    }

    handleWrapPoint() {
        _.forEach(this.props.snapPoint, (point) => {
            if (typeof point === 'number') {
                this.snapPoint.push(new Value(point));
            } else if (_.indexOf(point, '%') !== -1) {
                const percent = _.replace(point, '%', '');
                const realHeight = multiply(
                    this._heightContent,
                    (+percent || 100) / 100,
                    -1
                );

                this.snapPoint.push(realHeight);
            }
        });
    }

    withOtherHandle() {
        return [];
    }

    renderCodeMapState() {
        const { _state } = this.props;
        if (_state && this.dicEvent) {
            return (
                <Animated.Code
                    key={'code'}
                    exec={set(_state, this.dicEvent.state)}
                />
            );
        }
        return null;
    }

    renderCode() {
        const minPos = _.first(this.snapPoint);
        const maxPos = add(_.last(this.snapPoint), this._heightContainer);
        let mapScrollValue = [];
        if (this.props._scrollValue) {
            mapScrollValue = set(this.props._scrollValue, this._translateY);
        }
        return (
            <Animated.Code
                key={'main'}
                exec={block([
                    cond(
                        eq(this._tapState, State.BEGAN),
                        call([], () => Keyboard.dismiss())
                    ),
                    this.mapProps(),
                    preAdditiveOffset(
                        this.gesture.y,
                        this._panState,
                        this._translateY,
                        this._velocityY,
                        { minPos, maxPos }
                    ),
                    set(
                        this._decayFinished,
                        decaying(
                            this._translateY,
                            this._velocityY,
                            this._timingFinished,
                            {
                                _panState: this._panState,
                                _tapState: this._tapState
                            },
                            { minPos, maxPos }
                        )
                    ),
                    set(
                        this._timingFinished,
                        snapBounce(
                            this._translateY,
                            this._decayFinished,
                            this._panState,
                            { minPos, maxPos }
                        )
                    ),
                    this.withOtherHandle(),
                    mapScrollValue
                ])}
            />
        );
    }

    renderContent() {
        return (
            <Animated.View
                style={{ transform: [{ translateY: this._translateY }] }}
            >
                <PanGestureHandler
                    ref={this.props.refVerticalScroll}
                    minDist={10}
                    failOffsetX={[-10, 10]}
                    enabled={this.props.enabled}
                    onGestureEvent={this._onGestureEvent}
                    onHandlerStateChange={this._onGestureEvent}
                >
                    <Animated.View>
                        <TapGestureHandler
                            onHandlerStateChange={this.handleTap}
                        >
                            <Animated.View
                                style={{
                                    minHeight: add(this._heightContainer, 20)
                                }}
                                onLayout={this.onLayoutContent}
                            >
                                {this.renderCodeMapState()}
                                {this.renderCode()}
                                {this.props.children}
                            </Animated.View>
                        </TapGestureHandler>
                    </Animated.View>
                </PanGestureHandler>
            </Animated.View>
        );
    }

    render() {
        return (
            <Animated.View
                pointerEvents="box-none"
                onLayout={this.onContainerLayout}
                style={styles.container}
            >
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        styles.wrapContent,
                        { minHeight: add(this._heightContainer, 20) }
                    ]}
                >
                    {this.renderContent()}
                </Animated.View>
            </Animated.View>
        );
    }
}

export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    wrapContent: {
        overflow: 'hidden',
        position: 'absolute',
        width: '100%'
    }
});

ScrollView.defaultProps = {
    snapPoint: [0, '100%']
};
