import React from 'react';
import { View, Dimensions, Text, Animated } from 'react-native';
import Svg, {
  Path
} from 'react-native-svg'
import CommonStyle from '~/theme/theme_controller'
import { setTooltip, checkTooltip } from '~/lib/base/functionUtil'
import Uuid from 'react-native-uuid'

const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window')
const TIME_LIFE_TOOLTIP = 15000

export default class Tooltip extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      px: 0,
      py: 0
    }
    this.opacity = new Animated.Value(0)
  }

  componentWillUnmount() {
    this.timeout && clearTimeout(this.timeout)
  }

  hide = this.hide.bind(this)
  hide() {
    if (checkTooltip(this.props.id, 1)) {
      setTooltip(this.props.id, 0)
      Animated.timing(this.opacity, {
        toValue: 0,
        duration: 86,
        useNativeDriver: true
      }).start()
    }
  }

  show = this.show.bind(this)
  show() {
    if (!checkTooltip(this.props.id, 1)) {
      setTooltip(this.props.id, 1)
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 86,
        useNativeDriver: true
      }).start()
      this.timeout && clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.hide()
      }, TIME_LIFE_TOOLTIP)
    }
  }

  renderTooltip() {
    const {
      arrowHeight = 8,
      minHeight = 15,
      radius = 10,
      width = 180,
      height = 60
    } = this.props
    const startPointX = this.state.px
    const startPointY = this.state.py
    return (
      <Animated.View pointerEvents='box-none' style={{
        opacity: this.opacity
      }}>
        <View style={{
          position: 'absolute',
          zIndex: 10,
          transform: [
            { translateX: -1 * startPointX },
            { translateY: -1 * startPointY }
          ],
          left: startPointX - width - 8,
          top: startPointY - minHeight - radius * 2 + 4,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          height,
          width
        }}>
          {this.props.children}
        </View>
        <Svg width={WIDTH_DEVICE} height={HEIGHT_DEVICE}
          style={{
            zIndex: 9,
            transform: [
              { translateX: -1 * startPointX },
              { translateY: -1 * startPointY }
            ]
          }}>
          <Path
            stroke='#8E8E93'
            fill='#262B3E'
            d={`
                  M ${startPointX},${startPointY}
                  L ${startPointX - arrowHeight},${startPointY - arrowHeight / 2}
                  v -${minHeight}
                  a ${radius},${radius} 1 0 0 -${radius},-${radius}
                  h -${width - radius * 2}
                  a ${radius},${radius} 1 0 0 -${radius},${radius}
                  v ${height - radius * 2}
                  a ${radius},${radius} 1 0 0 ${radius},${radius}
                  h ${width - radius * 2}
                  a ${radius},${radius} 1 0 0 ${radius},-${radius}
                  v -${height - (radius * 2) - minHeight - arrowHeight}
                  z
                `}
          />
        </Svg>
      </Animated.View>
    )
  }

  onLayout = this.onLayout.bind(this)
  onLayout() {
    this.view && this.view.measure((fx, fy, width, height, px, py) => {
      if (px !== this.state.px || py !== this.state.py) {
        this.setState({
          px,
          py
        })
      }
    })
  }

  render() {
    return (
      <View style={{
        position: 'absolute',
        width: 1,
        top: 0,
        bottom: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <View ref={ref => this.view = ref} style={{
          height: 1,
          width: 1
        }}
          onLayout={this.onLayout}>
          {this.renderTooltip()}
        </View>
      </View>
    )
  }
}

Tooltip.defaultProps = {
  arrowHeight: 8,
  minHeight: 15,
  radius: 10,
  width: 180,
  height: 60,
  id: Uuid.v4()
}
