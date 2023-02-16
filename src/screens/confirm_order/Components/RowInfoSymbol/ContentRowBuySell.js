import React from 'react'
import { View, Text } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'

const ContentRowBuySell = props => {
    const { isBuy, title } = props
    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }} >
                <Text style={{
                    fontFamily: CommonStyle.fontPoppinsBold,
                    fontSize: CommonStyle.fontSizeXS,
                    color: CommonStyle.fontNearLight6
                }}>
                    {title}
                </Text>
            </View >
            <View style={{ width: 8 }} />
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} >
                <View style={{
                    paddingVertical: 2,
                    paddingHorizontal: 5,
                    marginRight: 4,
                    borderRadius: 4,
                    backgroundColor: isBuy
                        ? CommonStyle.color.buy
                        : CommonStyle.color.sell
                }}>
                    <Text style={{
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.font13,
                        color: CommonStyle.color.dark
                    }}>
                        {
                            isBuy
                                ? I18n.t('buyUpper')
                                : I18n.t('sellUpper')
                        }
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default ContentRowBuySell
