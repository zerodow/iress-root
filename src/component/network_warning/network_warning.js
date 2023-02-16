import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language';
import { dataStorage } from '../../storage'
const { height, width } = Dimensions.get('window');

export default class NetworkWarning extends Component {
  render() {
    return (
      <View style={[{ width, backgroundColor: CommonStyle.fontRed, justifyContent: 'center', alignItems: 'center', paddingVertical: 4 }, this.props.styles || {}]}>
        <Text style={CommonStyle.textSubLightWhite}>{`${I18n.t('connecting')}...`}</Text>
      </View>
    );
  }
}
