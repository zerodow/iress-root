import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language';
import { dataStorage } from '../../storage'

export default class RetryConnect extends Component {
  render() {
    return (
      <View style={{
        backgroundColor: CommonStyle.backgroundColor,
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={[CommonStyle.textMainNormal, { textAlign: 'center', paddingHorizontal: 30 }]}>{I18n.t('plzCheckInternet')}</Text>
        <TouchableOpacity style={CommonStyle.retryButton}
          onPress={this.props.onPress}>
          <Text style={CommonStyle.textButtonColor}>{I18n.t('retryConnect')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
