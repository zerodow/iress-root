import React, { Component } from 'react';
import { Text, View, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { Badge } from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as NewsBusiness from '../../streaming/news'
import * as Emitter from '@lib/vietnam-emitter'
import * as Util from '../../util'
import config from '~/config';
import Enum from '~/enum'
const { SUB_ENVIRONMENT } = Enum
export default class BadgeIcon extends Component {
    constructor(props) {
        super(props);
        this.idForm = Util.getRandomKey()
        this.state = {
            value: 0
        }
        this.updateNewsUnread = this.updateNewsUnread.bind(this)
    }

    componentDidMount() {
        this.updateNewsUnread()
    }

    componentWillUnmount() {
        const channel = this.props.channel
        if (channel) {
            const event = NewsBusiness.getChannelNewsUnread(channel)
            Emitter.deleteListener(event, this.idForm)
        }
    }

    updateNewsUnread() {
        const channel = this.props.channel
        if (channel) {
            const event = NewsBusiness.getChannelNewsUnread(channel)
            Emitter.addListener(event, this.idForm, value => {
                if (this.state.value !== value) {
                    console.log(`UPDATE BADGE`, value)
                    this.setState({
                        value
                    })
                }
            })
        }
    }
    getStyleWidthHeightByNumber = (count) => {
        let style = {}
        style = count < 100 ? count < 10 ? { width: 16, height: 16 } : { width: 20, height: 20 } : { width: 32, height: 26 }
        return style
    }
    render() {
        if (config.environment === 'STAGING' && config.subEnvironment === SUB_ENVIRONMENT.EQUIX_DEMO) {
            return null
        }
        return (
            <View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }, this.props.style]}>
                {
                    this.props.badge && this.state.value
                        ? (this.state.value < 100
                            ? (this.state.value < 10
                                ? <View style={[CommonStyle.smallBadge, this.getStyleWidthHeightByNumber(this.state.value)]}>
                                    <Text style={[CommonStyle.textExtraNoColor, { color: 'white', textAlign: 'center', fontSize: CommonStyle.fontMin }]}>{this.state.value || 0}</Text>
                                </View>
                                : <View style={[CommonStyle.largeBadge, this.getStyleWidthHeightByNumber(this.state.value)]}>
                                    <Text style={[CommonStyle.textExtraNoColor, { color: 'white', textAlign: 'center', fontSize: CommonStyle.fontMin }]}>{this.state.value || 0}</Text>
                                </View>)
                            : <View style={[CommonStyle.largeBadge, { width: 'auto', height: 24, paddingHorizontal: 4 }]}>
                                <Text style={[CommonStyle.textExtraNoColor, { color: 'white', textAlign: 'center', fontSize: CommonStyle.fontMin }]}>{this.state.value || 0}</Text>
                            </View>) : null
                }
                {
                    this.props.rightIcon ? <Ionicons name='ios-arrow-forward' size={24} color='#c7c7cc' style={{ top: 2, marginLeft: 8 }} /> : null
                }
            </View>
        );
    }
}
