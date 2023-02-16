import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language/index'
import { dataStorage } from '../../storage';
const { height, width } = Dimensions.get('window');

export default class ReviewAccountWarning extends Component {
    render() {
        return (
            <View style={{ width: width, backgroundColor: '#f8c51c', justifyContent: 'center', alignItems: 'center', paddingVertical: 4 }}>
                <Text style={[CommonStyle.textSubLightWhite, { color: '#e21100' }]}>{I18n.t('reviewWarning')}</Text>
            </View>
        );
    }
}
