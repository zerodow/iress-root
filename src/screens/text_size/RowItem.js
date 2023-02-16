import React from 'react';
import { Text, View, TouchableWithoutFeedback } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import Ionicons from 'react-native-vector-icons/Ionicons';
const RowItem = ({ title, onPress, isSelected }) => (
    <TouchableWithoutFeedback onPress={onPress}>
        <View style={CommonStyle.themeRowContent}>
            <Text style={[CommonStyle.textFontSize, { color: isSelected ? CommonStyle.fontBlue : CommonStyle.fontColor }]}>{title}</Text>
            {isSelected ? <Ionicons size={15} name='md-checkmark' color={CommonStyle.fontBlue} /> : null}
        </View>
    </TouchableWithoutFeedback>
);

export default RowItem;
