import React from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import RowProductClass from './RowProductClass'
const { width, height } = Dimensions.get('window')
const heightBuySell = (61 / height) * height
const widthBuySell = (61 / width) * width
const OvalBySel = (props) => {
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
const ButtonBySell = React.memo(({ isBuy, value, symbol, companyName }) => {
    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: 8
        }}>
            <View style={{ position: 'absolute', left: 8, zIndex: 100 }}>
                <OvalBySel isBuy={isBuy ? 'Buy' : 'Sell'}></OvalBySel>
            </View>

            <View style={{ paddingHorizontal: 8, paddingLeft: widthBuySell / 2 }}>
                <View style={{
                    borderWidth: 1,
                    borderColor: isBuy ? CommonStyle.color.buy : CommonStyle.color.sell,
                    justifyContent: 'center',
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
                        <RowProductClass value={value} ></RowProductClass>
                        <SymbolName symbol={symbol}></SymbolName>
                    </View>
                    <CompanyName companyName={companyName}></CompanyName>
                </View>
            </View>
        </View>
    )
}, () => true)

export default ButtonBySell

const styles = StyleSheet.create({})
