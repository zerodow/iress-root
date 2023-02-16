import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './style/search_icon';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import IonIcons from 'react-native-vector-icons/Ionicons';

export default class SearchIcon extends Component {
  render() {
    return (
      <TouchableOpacity style={[CommonStyle.circleSearch, this.props.style]} onPress={this.props.onPress}>
        <IonIcons name='ios-search' size={24} color={CommonStyle.fontColor} />
      </TouchableOpacity>
    );
  }
}
