import React, { Component } from 'react';
import { TouchableOpacity, View, Text, PixelRatio } from 'react-native';
import styles from './styles/ButtonBox';
import { formatNumber, checkPropsStateShouldUpdate, roundFloat, formatNumberNew2ClearZero } from '../../lib/base/functionUtil';
import I18n from '../language/';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../storage';
export default class ButtonBox extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    const listProps = ['disableAll', 'value1', 'value2', 'disabled', 'disabledColor'];
    const listState = [];
    let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
    return check;
  }

  render() {
    if (this.props.disableAll) {
      return (
        <TouchableOpacity style={{
          backgroundColor: CommonStyle.btnOrderDisableBg,
          width: this.props.width,
          // height: 56,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 15,
          paddingRight: 15,
          borderRadius: CommonStyle.borderRadius
        }}
          testID={this.props.testID}
          disabled={true}
          onPress={this.props.onPress}>
          <View style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row' }}>
              <Text testID={`${this.props.testID}-leftRow1`} style={{ width: '50%', color: 'white', fontFamily: CommonStyle.fontLight, opacity: 1, alignItems: 'flex-end', fontSize: this.props.buy ? CommonStyle.fontSizeS : CommonStyle.fontSizeM }}>{this.props.buy ? I18n.t('bidVol') : I18n.t('sellUpper')}</Text>
              <Text testID={`${this.props.testID}-rightRow1`} style={{ width: '50%', color: 'white', fontFamily: CommonStyle.fontLight, opacity: 1, alignItems: 'flex-end', textAlign: 'right', fontSize: this.props.buy ? CommonStyle.fontSizeM : CommonStyle.fontSizeS }}>{this.props.buy ? I18n.t('buyUpper') : I18n.t('askVol')}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text testID={`${this.props.testID}-leftRow2`} numberOfLines={1} style={{ width: '50%', color: 'white', fontFamily: CommonStyle.fontMedium, opacity: 1, lineHeight: 20, fontSize: this.props.buy ? CommonStyle.fontSizeS : CommonStyle.fontSizeM }}>{this.props.value1}</Text>
              <Text testID={`${this.props.testID}-rightRow2`} numberOfLines={1} style={{ width: '50%', color: 'white', fontFamily: CommonStyle.fontMedium, opacity: 1, lineHeight: 20, textAlign: 'right', fontSize: this.props.buy ? CommonStyle.fontSizeM : CommonStyle.fontSizeS }}>{this.props.value2}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity style={{
          flex: 1,
          backgroundColor: this.props.buy ? (this.props.disabledColor ? 'rgba(0, 0, 0, 0.3)' : '#00b800') : (this.props.disabledColor ? 'rgba(0, 0, 0, 0.3)' : '#df0000'),
          width: this.props.width,
          // height: 56,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 15,
          paddingRight: 15,
          borderRadius: CommonStyle.borderRadius
        }}
          testID={this.props.testID}
          disabled={this.props.disabled}
          onPress={this.props.onPress}>
          <View testID={this.props.testId} style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text testID={`${this.props.testID}-leftRow1`} style={[styles.whiteText, { alignItems: 'flex-end', fontSize: this.props.buy ? 14 : 16 }]}>{this.props.buy ? I18n.t('bidVol') : I18n.t('sellUpper')}</Text>
              <Text testID={`${this.props.testID}-rightRow1`} style={[styles.whiteText, { alignItems: 'flex-end', textAlign: 'right', fontSize: this.props.buy ? CommonStyle.fontSizeM : CommonStyle.fontSizeS }]}>{this.props.buy ? I18n.t('buyUpper') : I18n.t('askVol')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text testID={`${this.props.testID}-leftRow2`} style={[styles.whiteText, { lineHeight: 20, fontSize: this.props.buy ? 14 : 16 }]}>{this.props.value1 === null ? '--' : this.props.value1}</Text>
              <Text testID={`${this.props.testID}-rightRow2`} style={[styles.whiteText, { lineHeight: 20, textAlign: 'right', fontSize: this.props.buy ? CommonStyle.fontSizeM : CommonStyle.fontSizeS }]}>{this.props.value2 === null ? '--' : this.props.value2}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  }
}
