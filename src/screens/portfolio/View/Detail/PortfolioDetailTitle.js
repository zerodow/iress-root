import React, { } from 'react'
import {
    View, Text
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { useShadow } from '~/component/shadow/SvgShadowCustom'

const PortfolioDetailTitle = () => {
    const [Shadow, onLayout] = useShadow()
    const title = I18n.t('holdingWeight')
    return <View style={{ paddingVertical: 5 }}>
        <View>
            <Shadow />
            <View
                onLayout={onLayout}
                style={{
                    zIndex: 10,
                    width: '100%',
                    paddingVertical: 8,
                    backgroundColor: CommonStyle.color.dark,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                <Text style={{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    opacity: 0.5,
                    fontSize: CommonStyle.font13,
                    color: CommonStyle.fontColor
                }}>
                    {title}
                </Text>
            </View>
        </View>
    </View>
}

export default PortfolioDetailTitle
