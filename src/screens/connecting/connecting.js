import React, { Component } from 'react';
import { View, Text, Dimensions, Image } from 'react-native';
import background from '../../img/splash.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import I18n from '../../modules/language';
import ProgressBarLight from '../../modules/_global/ProgressBarLight';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';

const { height, width } = Dimensions.get('window');
export class Connecting extends Component {
  constructor(props) {
    super(props)
    this.perf = new Perf(performanceEnum.show_form_connecting)
  }

  componentDidMount() {
    setCurrentScreen(analyticsEnum.connecting);
    this.perf && this.perf.incrementCounter(performanceEnum.show_form_connecting);
    this.perf && this.perf.start();
  }

  componentWillUnmount() {
    this.perf && this.perf.stop();
  }

  render() {
    return (
      <View style={{
        width: width,
        height: height,
        backgroundColor: 'transparent'
      }}>
        <Image source={background} style={{ flex: 1, width: null, height: null, justifyContent: 'center', alignItems: 'center' }}>
          <View>
            <View style={{
              backgroundColor: 'transparent',
              height: 40,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {
                this.props.text
                  ? <ProgressBarLight color={CommonStyle.fontWhite} />
                  : null
              }
            </View>
            <Text style={[CommonStyle.textMainNoColor, { color: '#FFF' }]}>{this.props.text}</Text>
          </View>
        </Image>
      </View>
    )
  }
}
export default Connecting;
