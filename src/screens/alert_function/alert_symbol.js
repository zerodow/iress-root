import React from 'react'
import {
    View, Text
} from 'react-native'
// Util
import * as Emitter from '@lib/vietnam-emitter'
// Channel
import * as Channel from '../../streaming/channel'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Component
import XComponent from '../../component/xComponent/xComponent'
import TextLoading from '~/component/loading_component/text.1'
import * as Business from '~/business'
export default class AlertSymbol extends XComponent {
    init() {
        this.dic = {
            priceObject: this.props.priceObject || {}
        }
        this.dic.displayName = Business.getSymbolName({ symbol: this.dic.priceObject.symbol });
        this.state = {}
    }

    componentDidMount() {
        super.componentDidMount()
        const channel = this.props.channelSymbolInfo
        Emitter.addListener(channel, this.id, priceObject => {
            // const { displayName } = priceObject
            const displayName = Business.getSymbolName({ symbol: priceObject.symbol });
            this.dic.displayName = displayName
            this.setState({})
        })
    }

    render() {
        if (this.dic.displayName && this.dic.displayName.length > 0) {
            return (
                <Text style={[{
                    fontFamily: CommonStyle.fontPoppinsBold,
                    fontSize: CommonStyle.fontSizeL,
                    color: CommonStyle.fontColor,
                    marginRight: 8
                },
                this.props.style || {}]}>
                    {this.dic.displayName}
                </Text>
            )
        }
        return (
            <TextLoading
                style={[{
                    fontFamily: CommonStyle.fontPoppinsBold,
                    fontSize: CommonStyle.fontSizeXXL,
                    color: CommonStyle.fontColor,
                    marginRight: 8
                }]}
                formatTextAbs={'AMI'}
                isLoading={true} >
                {'AMI'}
            </TextLoading >
        )
    }
}
