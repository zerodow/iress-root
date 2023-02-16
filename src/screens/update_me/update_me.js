import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Platform,
    Image, Dimensions, Linking
} from 'react-native';
import styles from './styles/style';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from 'react-native-i18n';
import VersionCheck from 'react-native-version-check';
import config from '../../config';
import background from '../../img/background_mobile/ios82.png'
import backgroundAndroid from '../../img/background_mobile/android.png'
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { dataStorage } from '../../storage'

const { width, height } = Dimensions.get('window');
export default class UpdateMe extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
        this.perf = new Perf(performanceEnum.show_form_update_me);
    }

    componentWillMount() {
        setCurrentScreen(analyticsEnum.updateMe);
        this.perf && this.perf.incrementCounter(performanceEnum.show_form_update_me);
    }

    async openLinkStore() {
        if (Platform.OS === 'ios') {
            Linking.openURL(config.appleStore.link);
        } else {
            Linking.openURL(await VersionCheck.getStoreUrl());
        }
    }

    render() {
        return (
            <View style={{
                width,
                height,
                backgroundColor: 'transparent'
            }}>
                <Image source={Platform.OS === 'ios' ? background : backgroundAndroid} style={{ flex: 1, width: null, height: null, justifyContent: 'center', alignItems: 'center' }} resizeMode={Platform.OS === 'ios' ? 'cover' : 'stretch'}>
                </Image>
                <View style={{ flex: 1, width, height, justifyContent: 'center', alignItems: 'center', position: 'absolute' }}>
                    <Text style={[CommonStyle.textSubMediumWhite, { backgroundColor: 'transparent', textAlign: 'center', marginBottom: 16, color: CommonStyle.fontWhite, marginHorizontal: 16 }]}>{I18n.t('notiUpdate')}</Text>
                    <View style={{ width: '100%', paddingHorizontal: 16 }}>
                        <TouchableOpacity onPress={() => this.openLinkStore()}
                            style={[styles.btnUpdate, { height: 52, borderRadius: 100 }]}>
                            <Text style={[CommonStyle.textButtonColor, { color: CommonStyle.fontWhite, fontFamily: CommonStyle.fontPoppinsRegular }]}>{I18n.t('updateMeUpper')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}
