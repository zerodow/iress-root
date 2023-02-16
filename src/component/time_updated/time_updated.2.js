import React, { Component } from 'react';
import { View, Text, Animated, PixelRatio, LayoutAnimation, UIManager, ImageBackground } from 'react-native';
import styles from './style/time_updated.style';
import I18n from '../../modules/language';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import ProgressBar from '../../modules/_global/ProgressBar';
import { dataStorage, func } from '../../storage';
import { getUpdateTime } from '../../operator';
import {
  getDateStringWithFormat,
  convertToLocalTime2
} from '../../lib/base/dateTime';
import {
  logAndReport,
  checkPropsStateShouldUpdate,
  renderTime,
  convertTimeGMT,
  checkCurrentScreen
} from '../../lib/base/functionUtil';
import * as Controller from '../../../src/memory/controller';
import config from '../../config';
import moment from 'moment';
// import 'moment/locale/zh-cn';
import pinBackground from '~/img/background_mobile/group7.png'
if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}
export default class TimeUpdated extends Component {
  constructor(props) {
    super(props);
    this.fbTime = null;
    this.perf = null;
    this.setTimeUpdate = this.setTimeUpdate.bind(this);
    this.setAnimation = this.setAnimation.bind(this);
    // this.renderTime = this.renderTime.bind(this)
    this.isOpen = true;
    this.state = {
      timeUpdated: this.props.timeUpdate || new Date().getTime(),
      isLoading: this.props.isLoading || false,
      heightAnimation: new Animated.Value(40),
      opacityAnimation: new Animated.Value(1)
    };
    this.showHide = this.showHide.bind(this);
    this.props.registerSetTimeUpdate &&
      this.props.registerSetTimeUpdate(this.setTimeUpdate);
  }

  setTimeUpdate(val = +new Date()) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    this.setState({
      timeUpdated: val
    });
  }

  // componentWillReceiveProps(nextProps) {
  //     if (nextProps.isLoading) {
  //         if (this.perf && this.perf.starting) {
  //         } else {
  //             this.perf = new Perf(performanceEnum.click_to_refresh);
  //         }
  //     } else {
  //         this.perf && this.perf.stop();
  //     }
  //     this.setState({ isLoading: nextProps.isLoading, timeUpdated: nextProps.timeUpdate });
  // }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
    try {
    } catch (error) {
      console.log(
        'componentDidMount timeUpdate logAndReport exception: ',
        error
      );
      logAndReport(
        'componentDidMount timeUpdate exception',
        error,
        'componentDidMount timeUpdate'
      );
    }
  }

  showHide(isShow) {
    Animated.parallel([
      Animated.timing(this.state.heightAnimation, {
        duration: 200,
        // useNativeDriver: true,
        toValue: isShow ? 40 : 0
      }),
      Animated.timing(this.state.opacityAnimation, {
        duration: 200,
        // useNativeDriver: true,
        toValue: isShow ? 1 : 0
      })
    ]).start();
  }
  setAnimation() {
    if (this.props.isShow) {
      Animated.timing(this.state.heightAnimation, {
        duration: 200,
        // useNativeDriver: true,
        toValue: this.isOpen ? 0 : 40
      }).start();
      this.isOpen = !this.isOpen;
    }
  }

  componentWillUnmount() {
    // if (this.fbTime) {
    //     this.fbTime.off();
    //     this.fbTime = null;
    // }
    // this.props.onRef && this.props.onRef(undefined)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const listProps = ['isShow', 'table', 'isLoading'];
    const listState = [
      'heightAnimation',
      'opacityAnimation',
      'isLoading',
      'timeUpdated'
    ];
    const check = checkPropsStateShouldUpdate(
      nextProps,
      nextState,
      listProps,
      listState,
      this.props,
      this.state
    );
    return check;
  }

  // renderTime() {
  // 	if (Controller.getLang() === 'cn') {
  // 		const date = moment(new Date(this.state.timeUpdated)).locale('zh_cn').format('LL')
  // 		const time = getDateStringWithFormat(new Date(this.state.timeUpdated), 'HH:mm:ss')
  // 		return `${date} ${time}`
  // 	} else {
  // 		return getDateStringWithFormat(new Date(this.state.timeUpdated), 'DD MMM YYYY HH:mm:ss')
  // 	}
  // 	// return getDateStringWithFormat(new Date(this.state.timeUpdated), 'DD MMM YYYY HH:mm:ss')
  // }

  render() {
    // if (this.props.index !== null && this.props.index !== undefined && !checkCurrentScreen(this.props.index)) return <View />
    return (
      <Animated.View
        style={this.props.styleWrapper ? this.props.styleWrapper : {
          backgroundColor: CommonStyle.backgroundColor,
          flexDirection: 'row',
          paddingLeft: 16,
          paddingRight: 16,
          height: this.state.heightAnimation,
          opacity: this.state.opacityAnimation,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          marginTop:
            this.props.type === 'topGainers' ||
              this.props.type === 'topLosers'
              ? -10
              : 0
        }}
      >
        {
          this.props.renderTimeComp ? this.props.renderTimeComp(renderTime(this.state.timeUpdated)) : (
            <View style={CommonStyle.headerContent}>
              <Text
                testID={this.props.testID}
                style={CommonStyle.textSubDark}
              >
                {I18n.t('Updated')}{' '}
                {renderTime(this.state.timeUpdated)}
              </Text>
            </View>
          )
        }
      </Animated.View>
    );
  }
}
