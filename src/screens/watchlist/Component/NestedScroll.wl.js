import React from 'react'
import _ from 'lodash'
import { Dimensions } from 'react-native'

import NestedScroll from './NestedScroll'
import Animated from 'react-native-reanimated';
import { State } from 'react-native-gesture-handler'

const {
    add,
    cond,
    diff,
    divide,
    eq,
    lessThan,
    and,
    block,
    set,
    abs,
    clockRunning,
    greaterThan,
    sub,
    Value,
    or,
    not,
    call
} = Animated;

const STATE = {
    UNDETERMINED: 0,
    SHOW: 1,
    HIDE: 2
}

const { height: heightDevice } = Dimensions.get('window')

export default class NestedScrollCustom extends NestedScroll {
    constructor(props) {
        super(props)
        if (props._scrollValue) {
            this.translateY = this.props._scrollValue
        }

        // this.translateY.setValue(heightDevice)
        this.showHideState = new Value(STATE.UNDETERMINED)

        this.isScrollContent = new Value(0)
        if (props._isScrollContent) {
            this.isScrollContent = this.props._isScrollContent
        }
    }

    getSpaceTop() {
        const { spaceTop } = this.props
        if (typeof spaceTop === 'number') {
            return new Value(spaceTop)
        }
        return spaceTop
    }

    show() {
        this.showHideState.setValue(STATE.SHOW)
    }

    hide() {
        this.showHideState.setValue(STATE.HIDE)
    }

    withShowHide() {
        let hideCallback = [
            set(this.showHideState, STATE.UNDETERMINED),
            call([this.showHideState, this.stateTiming.finished], ([a, b]) => console.log('hideCallback', a, b))
        ]
        if (this.props.hideCallback) {
            hideCallback.push(
                call([], () => this.props.hideCallback())
            )
        }
        return [
            cond(
                eq(this.showHideState, STATE.SHOW),
                [
                    this.snapTo(0),
                    cond(this.stateTiming.finished, set(this.showHideState, STATE.UNDETERMINED))
                ]
            ),
            cond(
                eq(this.showHideState, STATE.HIDE),
                [
                    this.snapTo(heightDevice),
                    cond(
                        this.stateTiming.finished,
                        hideCallback
                    )
                ]
            )
        ]
    }

    withStateWhenHighVelocity() {
        this.pre = new Value(0)
        return [
            cond(eq(this.panState, State.ACTIVE), set(this.pre, this.translateY)),
            cond(
                and(
                    eq(this.panState, State.END),
                    lessThan(this.pre, 0),
                    greaterThan(abs(this.velocityY), 0)
                ),
                // dung im
                set(this.isScrollContent, 1),
                set(this.isScrollContent, 0)
            )
        ]
    }

    withPreAdditiveOffset() {
        const prev = new Value(0)
        const offset = new Value(0)
        const newPos = new Value(0)

        const minPos = _.first(this.snapPoint)
        const maxPos = add(_.last(this.snapPoint), this.heightContainer)
        return (
            cond(
                eq(this.panState, State.BEGAN),
                [
                    set(prev, this.gesture.y)
                ],
                [
                    cond(greaterThan(diff(this.velocityClock), 100), set(this.velocityY, 0)),

                    set(offset, sub(this.gesture.y, prev)),
                    set(newPos, add(this.translateY, offset)),
                    cond(
                        or(
                            and(greaterThan(newPos, minPos), this.isScrollContent),
                            lessThan(newPos, maxPos)
                        ),
                        set(newPos, add(this.translateY, divide(offset, 3)))
                    ),
                    set(this.translateY, newPos),
                    set(prev, this.gesture.y)
                ]
            )
        )
    }

    withSnapBounce() {
        const minPos = _.first(this.snapPoint)
        const maxPos = add(_.last(this.snapPoint), this.heightContainer)
        return cond(
            and(
                or(
                    // out of limit position
                    and(greaterThan(this.translateY, minPos), this.isScrollContent),
                    lessThan(this.translateY, maxPos)
                ),
                // without decay
                not(clockRunning(this.decayClock)),

                // end drag
                eq(this.panState, State.END)
            ),
            [
                cond(greaterThan(this.translateY, minPos), this.snapTo(minPos)),
                cond(lessThan(this.translateY, maxPos), this.snapTo(maxPos))
            ]
        )
    }

    isOutOfLimitPos() {
        const minPos = _.first(this.snapPoint)
        const maxPos = add(_.last(this.snapPoint), this.heightContainer)
        const detal = new Value(0)

        return block([
            set(detal, 0),
            cond(
                and(
                    greaterThan(this.translateY, minPos),
                    this.isScrollContent
                ),
                set(detal, sub(this.translateY, minPos))
            ),
            cond(lessThan(this.translateY, maxPos), set(detal, sub(maxPos, this.translateY))),
            lessThan(detal, 50)
        ])
    }

    withSnapContainer() {
        const spaceTop = this.getSpaceTop()
        return cond(
            not(eq(this.translateY, heightDevice)),
            cond(
                and(
                    eq(this.panState, State.END),
                    not(this.isScrollContent),
                    greaterThan(this.pre, 0)
                ),
                [
                    set(this.pre, 0),
                    cond(
                        and(
                            lessThan(this.velocityY, 700),
                            lessThan(this.translateY, sub(heightDevice / 2, spaceTop))
                        ),
                        // snap to top = show
                        set(this.showHideState, STATE.SHOW),
                        // snap to End = hide
                        set(this.showHideState, STATE.HIDE)
                    )
                ]
            )
        )
    }

    withOtherHandle() {
        return [
            ...this.withStateWhenHighVelocity(),
            this.withSnapContainer(),
            ...this.withShowHide()
        ]
    }

    render() {
        this.handleWrapPoint();

        return (
            <Animated.View
                pointerEvents="box-none"
                onLayout={this.onContainerLayout}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%'
                }}
            >
                <Animated.View
                    pointerEvents="box-none"
                    style={{
                        minHeight: add(this.heightContainer, 20),
                        marginTop: this.props.spaceTop,
                        overflow: 'hidden',
                        position: 'absolute',
                        width: '100%'
                    }}
                >
                    {this.renderContent()}
                </Animated.View>
            </Animated.View>
        )
    }
}
