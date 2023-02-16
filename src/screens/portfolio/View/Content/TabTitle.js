import React, { useImperativeHandle, useState } from 'react'
import {
    View, Text
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { useShadow } from '~/component/shadow/SvgShadowCustom';

const TabTitle = React.forwardRef((props, ref) => {
    const [Shadow, onLayout] = useShadow()
    const [title, setTitle] = useState(I18n.t('portfolioSummary'))
    useImperativeHandle(ref, () => {
        return { setTitle }
    })
    return <View style={{ paddingVertical: 5 }}>
        <View>
            <Shadow />
            <View
                onLayout={onLayout}
                style={{
                    zIndex: 10,
                    width: '100%',
                    height: 36,
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
})

export default TabTitle
