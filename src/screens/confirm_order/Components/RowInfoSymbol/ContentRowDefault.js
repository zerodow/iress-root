import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import PropTypes, { symbol } from 'prop-types'
import CommonStyle from '~/theme/theme_controller'
import * as Business from '~/business'

import ContentRowClass from './ContentRowClass'
const { width, height } = Dimensions.get('window')
const heightBuySell = (61 / height) * height
const widthBuySell = (61 / width) * width
const ButtonByOder = (props) => {
    const { isBuy } = props
    return (
        <View
            style={{
                width: widthBuySell,
                height: heightBuySell,
                backgroundColor: isBuy === 'Buy' ? CommonStyle.color.buy : CommonStyle.color.sell,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 100
            }}>
            <Text
                style={{
                    fontSize: CommonStyle.font17,
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    textAlign: 'center',
                    color: CommonStyle.fontBlack
                }}>{isBuy}</Text>
        </View>
    )
}

const SymbolName = (props) => {
    const { symbol } = props
    return (
        <View>
            <Text style={{
                color: CommonStyle.fontColor,
                fontSize: CommonStyle.font11
            }}>{symbol}</Text>
        </View>
    )
}
const CompanyName = (props) => {
    const { companyName } = props
    return (
        <Text numberOfLines={1} style={{
            color: CommonStyle.fontColor,
            fontSize: CommonStyle.font11,
            paddingRight: 16
        }}>{companyName}</Text>
    )
}

const ContentRowDefault = props => {
    const { title, value, styleTitle, styleValue, symbolClass, symbol, companyName, isBuy } = props
    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: 8
        }}>
            <View style={{ position: 'absolute', left: 8, zIndex: 100 }}>
                <ButtonByOder isBuy={isBuy ? 'Buy' : 'Sell'}></ButtonByOder>
            </View>
            <View style={{ paddingHorizontal: 8, paddingLeft: widthBuySell / 2 }}>
                <View style={{
                    borderWidth: 1,
                    borderColor: isBuy ? CommonStyle.color.buy : CommonStyle.color.sell,
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    borderRadius: CommonStyle.fontMin,
                    height: heightBuySell,
                    paddingLeft: widthBuySell / 2 + 8

                }}>
                    <View style={{
                        paddingLeft: 8,
                        paddingRight: 16,
                        paddingBottom: 8,
                        justifyContent: 'flex-end',
                        flexDirection: 'row',
                        width: '100%'

                    }}>
                        <ContentRowClass value={symbolClass} ></ContentRowClass>
                        <SymbolName symbol={symbol}></SymbolName>
                    </View>
                    <CompanyName companyName={companyName}></CompanyName>
                </View>
            </View>

        </View>
    )
}
ContentRowDefault.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.string
}
ContentRowDefault.defaultProps = {}
export default ContentRowDefault
