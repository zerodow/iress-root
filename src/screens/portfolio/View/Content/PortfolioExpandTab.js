import React, { useState } from 'react'
import {
    View, Text, TouchableOpacity
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Entypo from 'react-native-vector-icons/Entypo'

let PortfolioExpandTab = ({ refPortfolioTab }) => {
    const [expand, setExpand] = useState(false)
    const text = expand ? '' : 'More Portfolio Information'
    const iconName = expand ? 'chevron-thin-up' : 'chevron-thin-down'
    const onPress = () => {
        if (expand) {
            refPortfolioTab.current && refPortfolioTab.current.hide && refPortfolioTab.current.hide()
        } else {
            refPortfolioTab.current && refPortfolioTab.current.show && refPortfolioTab.current.show()
        }
        setExpand(prevExpand => !prevExpand)
    }
    return <TouchableOpacity
        hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
        onPress={onPress}
        style={{
            width: '100%',
            // paddingTop: expand ? 0 : 8,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: CommonStyle.color.dark,
            borderTopWidth: expand ? 1 : 0,
            borderTopColor: CommonStyle.color.dusk_tabbar
        }}>
        {
            text
                ? <Text style={{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    color: CommonStyle.fontColor,
                    opacity: 0.5,
                    fontSize: CommonStyle.fontTiny
                }}>
                    {text}
                </Text>
                : null
        }
        <Entypo
            name={iconName}
            color={CommonStyle.fontColor}
            style={{ opacity: 0.5 }}
            size={21}
        />
    </TouchableOpacity>
}
PortfolioExpandTab = React.memo(PortfolioExpandTab, () => true)
export default PortfolioExpandTab
