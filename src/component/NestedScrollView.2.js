import React, { PureComponent } from 'react';
import { Dimensions, StyleSheet, View, ScrollView } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';
import {
  TapGestureHandler,
  PanGestureHandler,
  NativeViewGestureHandler,
  State
} from 'react-native-gesture-handler';

const AniScrollView = Animated.createAnimatedComponent(ScrollView)

const {
  add,
  cond,
  divide,
  eq,
  neq,
  event,
  lessThan,
  and,
  block,
  multiply,
  set,
  abs,
  clockRunning,
  greaterThan,
  startClock,
  stopClock,
  sub,
  Clock,
  Value,
  decay,
  timing,
  or,
  not,
  call,
  onChange
} = Animated;

const { height: heightDevice } = Dimensions.get('window');

const TRANS_ACTION = {
  UNDETERMINED: 0,
  SHOW: 1,
  HIDE: 2
}

const HIDE_VALUE = heightDevice * 1.3

export default class NestedScroll extends PureComponent {
  constructor(props) {
    super(props);

    this._transY = new Value(HIDE_VALUE)
    this._transY2 = new Value(0)
    this._scrollValue = new Value(0);
    this._heightContainer = new Value(0)

    this._transAction = new Value(TRANS_ACTION.UNDETERMINED)

    this._scrollState = new Value(State.UNDETERMINED)
    this.onPanStateChange = event([{
      nativeEvent: ({ state }) => set(this._scrollState, state)
    }])

    const prev = new Value(0);
    const valWithPreservedOffset = new Animated.Value(0);
    this.onPanGestureEvent = event([{
      nativeEvent: ({ translationY }) => block([
        cond(
          eq(this._scrollState, State.BEGAN),
          [set(prev, 0)],
          [
            set(
              valWithPreservedOffset,
              add(valWithPreservedOffset, sub(translationY, prev))
            ),
            set(prev, translationY)
          ]
        ),
        cond(
          greaterThan(add(valWithPreservedOffset, this._scrollValue), 0),
          set(this._transY2, add(valWithPreservedOffset, this._scrollValue))
        )
      ])
    }])

    this.timingClock = new Clock()
    this.stateTiming = {
      finished: new Value(0),
      position: new Value(HIDE_VALUE),
      time: new Value(0),
      frameTime: new Value(0)
    };

    this.configTiming = {
      duration: new Value(500),
      toValue: new Value(0),
      easing: Easing.linear
    };

    this.state = { isOnNested: true };
  }

  // #region define scroll handle

  onTouchNestedChild = this.onTouchNestedChild.bind(this);
  onTouchNestedChild() {
    !this.state.isOnNested && this.setState({
      isOnNested: true
    });
  }

  onTouchScrollChild = this.onTouchScrollChild.bind(this);
  onTouchScrollChild() {
    this.state.isOnNested && this.setState({
      isOnNested: false
    });
  }

  setRef = this.setRef.bind(this);
  setRef(sef) {
    this._scroll = sef;
  }

  // #endregion

  show() {
    this._transAction.setValue(TRANS_ACTION.SHOW)
    // setTimeout(() => {
    //   this.state.isOnNested && this.setState({ isOnNested: false })
    // }, 700);
  }

  hide() {
    this._transAction.setValue(TRANS_ACTION.HIDE)
  }

  onContainerLayout = this.onContainerLayout.bind(this);
  onContainerLayout(e) {
    const { height } = e.nativeEvent.layout;
    this._heightContainer.setValue(height)
  }

  renderMainContent() {
  }

  handleGesture() {
  }

  startTiming(isHide) {
    let dest = 0;
    if (isHide) {
      dest = HIDE_VALUE
    }
    return cond(
      clockRunning(this.timingClock),
      [
        // if the clock is already running we update the toValue, in case a new dest has been passed in
        set(this.configTiming.toValue, dest)
      ],
      [
        // if the clock isn't running we reset all the animation params and start the clock
        set(this.stateTiming.finished, 0),
        set(this.stateTiming.time, 0),
        set(this.stateTiming.position, this._transY),
        set(this.stateTiming.frameTime, 0),
        set(this.configTiming.toValue, dest),
        startClock(this.timingClock)
      ]
    )
  }

  handleShowHide() {
    return [
      cond(
        eq(this._transAction, TRANS_ACTION.SHOW),
        [
          set(this._transAction, TRANS_ACTION.UNDETERMINED),
          this.startTiming()
        ]
      ),
      cond(
        eq(this._transAction, TRANS_ACTION.HIDE),
        [
          set(this._transAction, TRANS_ACTION.UNDETERMINED),
          this.startTiming(true)
        ]
      ),
      timing(this.timingClock, this.stateTiming, this.configTiming),
      cond(this.stateTiming.finished, stopClock(this.timingClock)),
      cond(
        clockRunning(this.timingClock),
        set(this._transY, this.stateTiming.position)
      )
    ]
  }

  render() {
    const panRef = React.createRef();
    const listRef = React.createRef();

    return (
      <Animated.View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 150,
        transform: [{
          translateY: this._transY
        }]
      }}>
        <NativeViewGestureHandler
          ref={listRef}
          simultaneousHandlers={panRef}
        >
          <AniScrollView
            keyboardShouldPersistTaps="always"
            onLayout={this.onContainerLayout}
            ref={this.setRef}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            scrollEventThrottle={1}
            onScroll={event([{ nativeEvent: ({ contentOffset: { y: this._scrollValue } }) }])}
          >
            <Animated.Code
              exec={block([
                // this.handleGesture(),
                ...this.handleShowHide()
              ])}
            />
            <TapGestureHandler
              ref={panRef}
              simultaneousHandlers={listRef}
              onHandlerStateChange={this.onPanStateChange}
            // onGestureEvent={this.scrollGesture}
            >
              <Animated.View>
                <PanGestureHandler
                  ref={panRef}
                  simultaneousHandlers={listRef}
                  onHandlerStateChange={this.onPanStateChange}
                  onGestureEvent={this.onPanGestureEvent}
                >
                  <Animated.View>
                    <Animated.View style={{ height: this._transY2, width: '100%', backgroundColor: 'red' }} />
                    {this.props.children}
                    <Animated.View style={{ height: this.props.spaceTop, width: '100%', backgroundColor: 'blue' }} />
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </TapGestureHandler>
          </AniScrollView>
        </NativeViewGestureHandler>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nestedStyle: {
    position: 'absolute',
    width: '100%'
  }
});

NestedScroll.defaultProps = {
  spaceTop: heightDevice / 2
}
