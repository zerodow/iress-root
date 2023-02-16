import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const RowItem = props => {
  const { onPress, title, selected } = props;

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={CommonStyle.themeRowContent}>
        <Text style={[CommonStyle.themeTxtContent, { color: selected ? CommonStyle.colorProduct : CommonStyle.fontColor, fontSize: CommonStyle.font13, marginRight: 8 }]}>{title}</Text>
        {selected ? <View style={{ paddingLeft: 16, justifyContent: 'flex-end' }}><Ionicons size={15} name='md-checkmark' color={CommonStyle.colorProduct} /></View> : null}
      </View>
    </TouchableWithoutFeedback>
  )
};

export default RowItem;
