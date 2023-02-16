import React, { Component } from 'react';
import {
    View, Text, Platform, Dimensions, TouchableOpacity, AppState, Alert, Animated,
    PixelRatio, Keyboard, InteractionManager, Image, TextInput, ActivityIndicator, ScrollView
} from 'react-native';
import {
    getPriceSource, logDevice, checkPropsStateShouldUpdate, logAndReport, removeItemFromLocalStorage, offTouchIDSetting,
    pinComplete, setDicReAuthen, declareAnimation
} from '../../lib/base/functionUtil';
import I18n from '../../modules/language/';
import config from '../../config';
import { dataStorage, func } from '../../storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import ProgressBarLight from '../../modules/_global/ProgressBarLight'

export default class Connecting extends Component {
    constructor(props) {
        super(props);
                this.isMount = false;
    }

    componentWillMount() {
    }

    componentDidMount() {
        this.isMount = true
    }

    componentWillUnmount() {
        this.isMount = false
    }

    render() {
        return (
            <View>
                <View style={{
                    backgroundColor: 'transparent',
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <ProgressBarLight color={CommonStyle.fontWhite} />
                    <Text style={[CommonStyle.textMainNoColor, { color: '#FFF', textAlign: 'center' }]}>{I18n.t('connectingFirstCapitalize')}</Text>
                </View>
            </View>
        )
    }
}
