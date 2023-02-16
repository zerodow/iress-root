import React from 'react'
import {
    View, Text, Platform
} from 'react-native'
// Util
import * as Emitter from '@lib/vietnam-emitter'
import * as Business from '../../business'
// Channel
import * as Channel from '../../streaming/channel'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Component
import XComponent from '../../component/xComponent/xComponent'
import AnnouncementIcon from '../../component/announcement_icon/announcement_icon'
import Flag from '../../component/flags/flag'

export default class AlertCompany extends XComponent {
    init() {
        this.dic = {
            priceObject: this.props.priceObject || {},
            company: Business.getCompanyName({ symbol: this.props.symbol }),
            symbol: ''
        }
        this.state = {}
    }

    componentDidMount() {
        super.componentDidMount()
        const channel = this.props.channelSymbolInfo
        Emitter.addListener(channel, this.id, priceObject => {
            const { company, symbol } = priceObject
            this.dic.company = company
            this.dic.symbol = symbol
            this.setState({})
        })
    }

    render() {
        const flagIcon = Business.getFlag(this.dic.symbol)
        return (
            <React.Fragment>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Flag
                        type={'flat'}
                        code={flagIcon}
                        size={18}
                        wrapperStyle={{ marginRight: 8, paddingTop: 0 }}
                    />

                    <AnnouncementIcon
                        channelNewsToday={this.props.channelNewsToday}
                        symbol={this.dic.symbol}
                        isNewsToday={this.props.isNewsToday}
                        containerStyle={{
                            width: 13,
                            height: 13,
                            marginTop: 1,
                            borderRadius: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: this.props.isNewsToday
                                ? CommonStyle.newsActive
                                : CommonStyle.newsInactive
                        }}
                        contentStyle={{
                            color: CommonStyle.newsTextColor,
                            fontFamily: CommonStyle.fontFamily,
                            fontSize: CommonStyle.fontSizeXS - 3,
                            textAlign: 'center'
                        }}
                    />
                    <View style={{ width: 16 }}></View>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                        numberOfLines={2}
                        style={CommonStyle.textCompany}
                    >{this.dic.company}</Text>
                </View>
            </React.Fragment>

        )
        return <View pointerEvents={'box-none'} style={[{
            flexDirection: 'row',
            paddingLeft: 8,
            // borderWidth: 0.5,
            // borderColor: 'yellow',
            alignItems: 'center'
        }]}>
            <View pointerEvents={'box-none'} style={[{
                flex: 1,
                // justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
                height: 24
                // borderWidth: 0.5,
                // borderColor: 'red'
            }]}>
                <Flag
                    type={'flat'}
                    code={flagIcon}
                    size={18}
                    wrapperStyle={{ marginRight: 8, paddingTop: 0 }}
                />

                <AnnouncementIcon
                    channelNewsToday={this.props.channelNewsToday}
                    symbol={this.dic.symbol}
                    isNewsToday={this.props.isNewsToday}
                    containerStyle={{
                        width: 13,
                        height: 13,
                        marginTop: 1,
                        borderRadius: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: this.props.isNewsToday
                            ? CommonStyle.newsActive
                            : CommonStyle.newsInactive
                    }}
                    contentStyle={{
                        color: CommonStyle.newsTextColor,
                        fontFamily: CommonStyle.fontFamily,
                        fontSize: CommonStyle.fontSizeXS - 3,
                        textAlign: 'center'
                    }}
                />
            </View>
            <View pointerEvents={'box-none'} style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 16 }}>
                <Text numberOfLines={1} style={[CommonStyle.companyAlert, { textAlign: 'left' }]}>{this.dic.company}</Text>
            </View>
        </View>
    }
}
