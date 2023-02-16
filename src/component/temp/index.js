import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';

const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window')

const FAKE_DATA = []
for (let index = 0; index < 15; index++) {
  FAKE_DATA.push(index)
}

export default class Draggable extends Component {
  constructor(props) {
    super(props);
    this.scrollValue = new Animated.Value(0);
    this.show = this.show.bind(this)
    this._scrollValue = 1
    this._pan = 1
    this.dic = {
      pan: new Animated.ValueXY()
    };
    this.state = {
      isDrag: false,
      isScroll: true
    }
  }

  componentDidMount() {
    this.scrollValue.addListener(({ value }) => {
      if (this._scrollValue > 0 && this._scrollValue * value < 0) {
        this._scrollValue = value
        this.setState({ isDrag: true })
      } else if (this._scrollValue < 0 && this._scrollValue * value < 0) {
        this._scrollValue = value
        this.setState({ isDrag: false })
      }
    })
  }

  show() {
    this.dic.pan.setValue({ x: 0, y: 0 })
  }

  componentWillMount() {
    this._val = { x: 0, y: 0 }
    this.dic.pan.addListener((value) => {
      this._val = value
      const { y } = value
      if (this._pan > 0 && this._pan * y < 0) {
        this._scrollValue = y
        this.setState({ isDrag: true })
      } else if (this._scrollValue < 0 && this._scrollValue * y < 0) {
        this._scrollValue = y
        this.setState({ isDrag: false })
      }
    });

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => {
        return this.state.isDrag
      },
      onPanResponderGrant: (e, gesture) => {
        this.dic.pan.setOffset({
          x: this._val.x,
          y: this._val.y
        })
        this.dic.pan.setValue({ x: 0, y: 0 })
      },
      onPanResponderMove: (event, gestureState) => {
        if (gestureState.dy < 0) return
        Animated.event([
          null, { dx: 0, dy: this.dic.pan.y }
        ])
      },
      onPanResponderRelease: (e, gesture) => {
      }
    });
  }

  render() {
    return (
      <View style={{ width: '20%', alignItems: 'center' }}>
        {this.renderDraggable()}
      </View>
    );
  }

  renderRow() {
    return FAKE_DATA.map(() => {
      return <View style={styles.row} />
    })
  }

  renderDraggable() {
    const panStyle = {
      transform: this.dic.pan.getTranslateTransform()
    }
    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={[panStyle, styles.wrapper]}
      >
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          ref={ref => this._scroll = ref}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    y: this.scrollValue
                  }
                }
              }
            ],
            {
              useNativeDriver: true
            }
          )}
          scrollEventThrottle={1}
          scrollEnabled={this.state.isScroll}
          style={styles.scroll}>
          {this.renderRow()}
        </Animated.ScrollView>
      </Animated.View>
    );
  }
}

const CIRCLE_RADIUS = 30;
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'skyblue',
    width: WIDTH_DEVICE,
    height: HEIGHT_DEVICE
  },
  scroll: {
    width: '100%',
    padding: 16,
    backgroundColor: 'orange'
  },
  row: {
    height: 56,
    borderRadius: 8,
    backgroundColor: 'violet',
    marginBottom: 8
  }
});
