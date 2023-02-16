import React, { Component } from 'react'
import { Text, View, Platform, Dimensions } from 'react-native'
import TransitionView from '~/component/animation_component/transition_view'
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language'
import ProgressBar from '~/modules/_global/ProgressBar';
import { renderTime } from '~/lib/base/functionUtil'
import * as Controller from '~/memory/controller'

const { width: WIDTH_DEVICE } = Dimensions.get('window')

export default class PullToRefresh extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timeUpdated: this.props.timeUpdate || +new Date()
    }
  }

  setTimeUpdate(val = +new Date()) {
    this.setState({
      timeUpdated: val
    });
  }
  handleOnLayout = this.handleOnLayout.bind(this)
  handleOnLayout(event) {
    const { height } = event.nativeEvent.layout
    this.props.callBackHeightUpdated && this.props.callBackHeightUpdated(height)
  }
  render() {
    const { timeUpdated } = this.state
    const isStreaming = this.props.forceStream || Controller.isPriceStreaming()
    const formatTime = 'HH:mm:ss'
    let str = `${I18n.t('lastUpdated')} ${renderTime(timeUpdated, formatTime)} - ${I18n.t('pullToRefresh')}`;
    return (
      <View style={{ zIndex: 1, width: WIDTH_DEVICE + 4, backgroundColor: CommonStyle.fontDark3, borderBottomRightRadius: CommonStyle.borderBottomRightRadius }}>
        <View style={{ opacity: 0 }}>
          {this.props.header}
        </View>
        <View
          style={{
            opacity: this.props.isFake ? 0 : 1,
            overflow: 'hidden',
            height: 500 + (isStreaming ? 8 : 0),
            marginTop: -500,
            justifyContent: 'flex-end',
            backgroundColor: CommonStyle.fontDark3,
            borderBottomRightRadius: CommonStyle.borderBottomRightRadius
          }}>
          {isStreaming ? null : <View style={{ width: '100%', height: 56, justifyContent: 'center', alignItems: 'center' }}>
            <ProgressBar />
          </View>}
        </View>
        {isStreaming ? null : <Text style={[CommonStyle.timeUpdatedTitleHeaderNavBar, {
          paddingVertical: 8,
          paddingLeft: 32
        }, this.props.textStyle]} >{str}</Text>}
      </View>
    )
  }
}
