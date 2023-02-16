import React, { useState, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  View
} from 'react-native';

const AutoScrolling = ({
  style,
  children,
  endPaddingWidth = 100,
  duration,
  delay = 0,
  enable = true
}) => {
  const containerWidth = useRef(0);
  const contentWidth = useRef(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const [dividerWidth, setDividerWidth] = useState(endPaddingWidth);
  const offsetX = useRef(new Animated.Value(0))
  let contentRef = null

  function measureContainerView(event) {
    const newContainerWidth = event.nativeEvent.layout.width;
    if (containerWidth.current === newContainerWidth) return;
    containerWidth.current = newContainerWidth;
    if (!contentRef) return;
    contentRef.measure((fx, fy, width) => {
      checkContent(width, fx);
    });
  }

  function checkContent(newContentWidth, fx) {
    if (!newContentWidth) {
      setIsAutoScrolling(false);
      return;
    }
    if (contentWidth.current === newContentWidth) return;
    contentWidth.current = newContentWidth;
    let newDividerWidth = endPaddingWidth;
    if (contentWidth.current < containerWidth.current) {
      if (endPaddingWidth < containerWidth.current - contentWidth.current) {
        newDividerWidth = containerWidth.current - contentWidth.current;
      }
    }
    setDividerWidth(newDividerWidth);
    setIsAutoScrolling(true);
    Animated.loop(
      Animated.timing(offsetX.current, {
        toValue: -(contentWidth.current + fx + newDividerWidth),
        duration: duration || 50 * contentWidth.current,
        delay,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }

  function measureContentView(event) {
    const { width, x } = event.nativeEvent.layout;
    if (!containerWidth.current || width === contentWidth.current) return;
    offsetX.current.stopAnimation();
    offsetX.current.setValue(0);
    offsetX.current.setOffset(0);
    checkContent(width, x);
  }

  const childrenProps = children.props;
  const childrenWithProps = React.cloneElement(children, {
    ...childrenProps,
    onLayout: measureContentView,
    ref: (ref) => (contentRef = ref)
  });

  return (
    <View onLayout={measureContainerView} style={style}>
      {enable ? <ScrollView
        horizontal={true}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        <Animated.View
          style={{
            flexDirection: 'row',
            transform: [{ translateX: offsetX.current }]
          }}
        >
          {childrenWithProps}
          {isAutoScrolling && <View style={{ width: dividerWidth }} />}
          {isAutoScrolling && children}
        </Animated.View>
      </ScrollView> : children}
    </View>
  );
};

export default React.memo(AutoScrolling)
